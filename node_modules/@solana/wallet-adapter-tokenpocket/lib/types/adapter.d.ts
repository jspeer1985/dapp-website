import { BaseMessageSignerWalletAdapter, WalletReadyState, type SendTransactionOptions, type WalletName } from '@solana/wallet-adapter-base';
import { PublicKey, type Connection, type Transaction, type TransactionSignature, type VersionedTransaction } from '@solana/web3.js';
export interface TokenPocketWalletAdapterConfig {
}
export declare const TokenPocketWalletName: WalletName<"TokenPocket">;
export declare class TokenPocketWalletAdapter extends BaseMessageSignerWalletAdapter {
    name: WalletName<"TokenPocket">;
    url: string;
    icon: string;
    readonly supportedTransactionVersions: null;
    private _connecting;
    private _wallet;
    private _publicKey;
    private _readyState;
    constructor(config?: TokenPocketWalletAdapterConfig);
    get publicKey(): PublicKey | null;
    get connecting(): boolean;
    get connected(): boolean;
    get readyState(): WalletReadyState;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    sendTransaction<T extends Transaction | VersionedTransaction>(transaction: T, connection: Connection, options?: SendTransactionOptions): Promise<TransactionSignature>;
    signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T>;
    signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]>;
    signMessage(message: Uint8Array): Promise<Uint8Array>;
    private _disconnected;
}
//# sourceMappingURL=adapter.d.ts.map