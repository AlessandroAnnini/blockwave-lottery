import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const useWallet = () => {
  const [account, setAccount] = useState('');
  const [state, setState] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const checkWallet = async () => {
      setState('loading');
      try {
        console.log('checking wallet');
        // First make sure we have access to window.ethereum
        const { ethereum } = window;

        if (!ethereum) {
          console.log('Make sure you have metamask!');
          setError('Make sure you have metamask!');
          return;
        } else {
          console.log('We have the ethereum object', ethereum);
        }

        // Check if we're authorized to access the user's wallet
        const accounts = await ethereum.request({ method: 'eth_accounts' });

        if (accounts.length) {
          const account = accounts[0];
          console.log('Found an authorized account:', account);
          setAccount(account);
        } else {
          console.log('No authorized account found');
          setError('No authorized account found');
        }
      } catch (error) {
        console.log(error);
        setError(error.message);
      }

      setState('');
    }

    checkWallet();
  }, []);

  const connect = async () => {
    setState('loading');
    try {
      console.log('checking wallet');
      // First make sure we have access to window.ethereum
      const { ethereum } = window;

      if (!ethereum) {
        console.log('Make sure you have metamask!');
        setError('Make sure you have metamask!');
        return;
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      console.log('Connected', accounts[0]);
      setAccount(accounts[0]);
    } catch (error) {
      console.log(error);
      setError(error.message);
    }
    setState('');
  };

  return {
    account,
    walletState: state,
    walletError: error,
    connectWallet: connect,
  }
};

export default useWallet;
