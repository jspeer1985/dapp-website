import type { NextPage } from 'next';
import Head from 'next/head';
import { useWallet } from '@solana/wallet-adapter-react';
import { FC, useCallback } from 'react';
import styles from '../styles/Home.module.css';

const Home: NextPage = () => {
  const { connect, connected } = useWallet();

  const handleConnect = useCallback(async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect to wallet:', error);
    }
  }, [connect]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Optik Ecosystem</title>
      </Head>

      <main className={styles.main}>
        {!connected && (
          <button onClick={handleConnect} className={styles.button}>Connect Wallet</button>
        )}
      </main>
    </div>
  );
};

export default Home;
