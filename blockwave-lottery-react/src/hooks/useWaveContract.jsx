import { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';

const useWaveContract = ({ contractAddress, contractABI, account }) => {
  const contractRef = useRef(null);
  const accountRef = useRef(account);
  const [state, setState] = useState('');
  const [error, setError] = useState('');
  const [waveList, setWaveList] = useState([]);
  const [isWinner, setIsWinner] = useState(false);

  const makeWaveObject = ({ from, timestamp, message, prizeAmount }) => {
    const prize = prizeAmount.toNumber() / 1e18;
    const date = new Date(timestamp * 1000);
    const isSameAccount = from.toUpperCase() === accountRef.current;
    const iWon = isSameAccount && prize;

    return {
      address: from,
      timestamp: date.getTime(),
      dateString: date.toUTCString(),
      message: message,
      prizeAmount: prize,
      iWon,
    };
  };

  useEffect(() => {
    const getWawePortalContract = async () => {
      setState('loading');
      try {
        const { ethereum } = window;

        if (ethereum) {
          const onNewWave = (from, timestamp, message, prizeAmount) => {
            const prize = prizeAmount.toNumber() / 1e18;
            if (from.toUpperCase() === accountRef.current && prize) {
              setIsWinner(true);
            }

            console.log('NewWave', from, timestamp, message, prize);
            setWaveList((prevState) => [
              makeWaveObject({ from, timestamp, message, prizeAmount }),
              ...prevState,
            ]);
          };

          // ethers is a library that helps our frontend talk to our contract.
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          // You're using contractABI here.
          const wavePortalContract = new ethers.Contract(
            contractAddress,
            contractABI,
            signer
          );
          wavePortalContract.on('NewWave', onNewWave);
          contractRef.current = wavePortalContract;
        } else {
          console.log("Ethereum object doesn't exist!");
          setError("Ethereum object doesn't exist!");
        }
      } catch (error) {
        console.log(error);
        setError(error.message);
      }
      setState('');
    };

    getWawePortalContract();
  }, []);

  useEffect(() => {
    if (!contractRef.current || !account) return;
    accountRef.current = account.toUpperCase();
    getWaves();
  }, [account]);

  const getWaves = async () => {
    setState('loading');
    try {
      if (contractRef.current) {
        // Call the getAllWaves method from your Smart Contract
        const waves = await contractRef.current.getAllWaves();

        // We only need address, timestamp, and message in our UI so let's
        // pick those out
        const nextWaveList = waves.map((w) => makeWaveObject(w));

        setWaveList(nextWaveList.reverse());
      } else {
        console.log("wavePortalContract object doesn't exist!");
        setError("wavePortalContract object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
      setError(error.message);
    }
    setState('');
  };

  const wave = async (message) => {
    setState('loading');
    try {
      if (contractRef.current) {
        // Execute the actual wave from your smart contract.
        const waveTxn = await contractRef.current.wave(message, {
          gasLimit: 300000,
        });
        console.log(`Mining... ${waveTxn.hash}`);

        await waveTxn.wait();
        console.log(`Mined -- ${waveTxn.hash}`);
      } else {
        console.log("wavePortalContract object doesn't exist!");
        setError("wavePortalContract object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
      setError(error.message);
    }
    setState('');
  };

  return {
    waveList,
    updateWaveList: getWaves,
    createWave: wave,
    waveState: state,
    waveError: error,
    isWinner,
  };
};

export default useWaveContract;
