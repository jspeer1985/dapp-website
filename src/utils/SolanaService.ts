import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Keypair,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from '@solana/spl-token';
import bs58 from 'bs58';

export class SolanaService {
  private connection: Connection;
  private treasuryWallet: PublicKey;
  private treasuryKeypair?: Keypair;

  constructor() {
    const rpcUrl =
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
    this.connection = new Connection(rpcUrl, 'confirmed');

    const treasuryPublicKey = process.env.SOLANA_TREASURY_WALLET;
    console.log('Treasury wallet from env:', treasuryPublicKey);
    console.log(
      'All env vars starting with SOLANA:',
      Object.keys(process.env).filter(k => k.startsWith('SOLANA')),
    );

    if (!treasuryPublicKey) {
      throw new Error('SOLANA_TREASURY_WALLET not configured');
    }

    this.treasuryWallet = new PublicKey(treasuryPublicKey);

    if (process.env.SOLANA_TREASURY_PRIVATE_KEY) {
      try {
        let secretKey: Uint8Array;

        // Handle both JSON array and base58 string formats
        if (process.env.SOLANA_TREASURY_PRIVATE_KEY.startsWith('[')) {
          // JSON array format: [1,2,3,...]
          const keyArray = JSON.parse(process.env.SOLANA_TREASURY_PRIVATE_KEY);
          secretKey = Uint8Array.from(keyArray);
        } else {
          // Base58 string format
          secretKey = bs58.decode(process.env.SOLANA_TREASURY_PRIVATE_KEY);
        }

        this.treasuryKeypair = Keypair.fromSecretKey(secretKey);
        console.log('Treasury keypair loaded successfully');
      } catch (error) {
        console.warn(
          'Invalid private key format, continuing without signing capability',
          error
        );
      }
    }
  }

  async verifyPayment(
    signature: string,
    expectedAmountSol: number,
    senderAddress: string,
  ): Promise<{
    isValid: boolean;
    confirmations: number;
    actualAmount?: number;
    error?: string;
  }> {
    try {
      const tx = await this.connection.getTransaction(signature, {
        maxSupportedTransactionVersion: 0,
      });

      if (!tx) {
        return {
          isValid: false,
          confirmations: 0,
          error: 'Transaction not found',
        };
      }

      if (tx.meta?.err) {
        return {
          isValid: false,
          confirmations: 0,
          error: 'Transaction failed',
        };
      }

      // Check signer / fee payer matches expected sender
      const keys = tx.transaction.message.getAccountKeys();
      const keysArray = keys.keySegments().flat();
      const signerKey = keysArray[0];
      if (!signerKey || signerKey.toBase58() !== senderAddress) {
        return {
          isValid: false,
          confirmations: 0,
          error: 'Sender address mismatch',
        };
      }

      const preBalances = tx.meta?.preBalances || [];
      const postBalances = tx.meta?.postBalances || [];

      // Find treasury account index safely
      let treasuryIndex = -1;
      for (let i = 0; i < keysArray.length; i++) {
        if (keysArray[i].toBase58() === this.treasuryWallet.toBase58()) {
          treasuryIndex = i;
          break;
        }
      }

      let foundPayment = false;
      let actualAmountSol = 0;

      if (
        treasuryIndex >= 0 &&
        treasuryIndex < preBalances.length &&
        treasuryIndex < postBalances.length
      ) {
        const preBalance = preBalances[treasuryIndex];
        const postBalance = postBalances[treasuryIndex];

        const actualLamports = postBalance - preBalance;
        const expectedLamports = Math.round(expectedAmountSol * LAMPORTS_PER_SOL);

        actualAmountSol = actualLamports / LAMPORTS_PER_SOL;

        console.log('Payment verification:', {
          expectedAmountSol,
          actualAmountSol,
          expectedLamports,
          actualLamports,
          treasury: this.treasuryWallet.toBase58(),
          senderAddress,
        });

        // Allow overpay but not underpay
        if (actualLamports >= expectedLamports) {
          foundPayment = true;
        }
      }

      const currentSlot = await this.connection.getSlot();
      const confirmations = tx.slot ? currentSlot - tx.slot : 0;

      if (!foundPayment) {
        console.warn('Payment amount mismatch debug', {
          expectedAmountSol,
          actualAmountSol,
          treasury: this.treasuryWallet.toBase58(),
          senderAddress,
          accountKeys: keysArray.map((k: PublicKey) => k.toBase58()),
        });
      }

      return {
        isValid: foundPayment,
        confirmations,
        actualAmount: actualAmountSol,
        error: foundPayment ? undefined : 'Payment amount mismatch',
      };
    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        isValid: false,
        confirmations: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async createToken(params: {
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: number;
    mintAuthority: PublicKey;
    freezeAuthority?: PublicKey;
    metadataUri?: string;
  }): Promise<{
    mintAddress: string;
    signature: string;
    error?: string;
  }> {
    try {
      if (!this.treasuryKeypair) {
        throw new Error('Treasury keypair not configured for token creation');
      }

      const { decimals, totalSupply, mintAuthority, freezeAuthority } = params;

      const mint = await createMint(
        this.connection,
        this.treasuryKeypair,
        mintAuthority,
        freezeAuthority || null,
        decimals,
      );

      console.log('Token mint created:', mint.toBase58());

      if (totalSupply > 0) {
        const ata = await getOrCreateAssociatedTokenAccount(
          this.connection,
          this.treasuryKeypair,
          mint,
          mintAuthority,
        );

        const signature = await mintTo(
          this.connection,
          this.treasuryKeypair,
          mint,
          ata.address,
          mintAuthority,
          totalSupply * Math.pow(10, decimals),
        );

        console.log('Initial tokens minted:', signature);

        return {
          mintAddress: mint.toBase58(),
          signature,
        };
      }

      return {
        mintAddress: mint.toBase58(),
        signature: '',
      };
    } catch (error) {
      console.error('Token creation error:', error);
      return {
        mintAddress: '',
        signature: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async processRefund(params: {
    recipientAddress: string;
    amount: number; // in SOL
    reason: string;
  }): Promise<{
    success: boolean;
    signature?: string;
    error?: string;
  }> {
    try {
      if (!this.treasuryKeypair) {
        throw new Error('Treasury keypair not configured for refunds');
      }

      const { recipientAddress, amount } = params;
      const recipient = new PublicKey(recipientAddress);

      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: this.treasuryWallet,
          toPubkey: recipient,
          lamports: Math.round(amount * LAMPORTS_PER_SOL),
        }),
      );

      const signature = await sendAndConfirmTransaction(
        this.connection,
        tx,
        [this.treasuryKeypair],
        { commitment: 'confirmed' },
      );

      console.log('Refund processed:', signature);

      return {
        success: true,
        signature,
      };
    } catch (error) {
      console.error('Refund error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getBalance(address: string): Promise<number> {
    try {
      const publicKey = new PublicKey(address);
      const balance = await this.connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Balance check error:', error);
      return 0;
    }
  }

  async getTransactionStatus(signature: string): Promise<{
    confirmed: boolean;
    confirmations: number;
    error?: string;
  }> {
    try {
      const status = await this.connection.getSignatureStatus(signature);

      if (!status || !status.value) {
        return {
          confirmed: false,
          confirmations: 0,
          error: 'Transaction not found',
        };
      }

      return {
        confirmed:
          status.value.confirmationStatus === 'confirmed' ||
          status.value.confirmationStatus === 'finalized',
        confirmations: status.value.confirmations || 0,
        error: status.value.err
          ? JSON.stringify(status.value.err)
          : undefined,
      };
    } catch (error) {
      console.error('Transaction status error:', error);
      return {
        confirmed: false,
        confirmations: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export default new SolanaService();
