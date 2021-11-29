import React, { useEffect, useState, useRef } from 'react';
import Confetti from 'react-confetti';

import abi from './utils/WavePortal.json';
import useWallet from './hooks/useWallet';
import useWaveContract from './hooks/useWaveContract';

import './App.css';

const App = () => {
  // Create a variable here that holds the contract address after you deploy!
  const contractAddress = '0xcCe3f26E49040cf1530C3d3dABBcF097514c52d2';
  // Create a variable here that references the abi content!
  const contractABI = abi.abi;

  const { account, walletState, walletError, connectWallet } = useWallet();

  const {
    waveList,
    updateWaveList,
    createWave,
    waveState,
    waveError,
    isWinner,
  } = useWaveContract({ contractAddress, contractABI, account });

  const [message, setMessage] = useState('');

  const isLoading = walletState === 'loading' || waveState === 'loading';

  const isError = walletError || waveError;

  const handleCreateNewWave = async () => {
    await createWave(message);
    setMessage('');
  };

  return (
    <>
      {isWinner && <Confetti />}
      <div className="mainContainer">
        <div className="dataContainer">
          <div className="header">🚀 BlockWave Lottery</div>

          <div className="bio">
            I am Alessandro and I worked on in-flight entertainment system for
            helicopters (for real!) so that's pretty cool right? Connect your
            Ethereum wallet and wave at me!
          </div>

          <div className="connectedAccount">Connected account: {account}</div>

          <div className="status">{walletState || waveState}</div>

          {walletError && walletError !== 'No authorized account found' && (
            <div className="error">{`Wallet error: ${walletError}`}</div>
          )}

          {waveError && (
            <div className="error">{`Wave error: ${waveError}`}</div>
          )}

          <div className="waveCounter">
            {`Already got ${waveList.length} waves and counting!`}
          </div>

          <input
            className="waveMessage"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your wave message here..."
            disabled={isLoading || waveError}
          />

          <button
            className="waveButton"
            onClick={handleCreateNewWave}
            disabled={isLoading || waveError || !message}>
            Wave at Me (max every 30s)
          </button>

          {!account && (
            <button className="waveButton" onClick={connectWallet}>
              Connect Wallet
            </button>
          )}

          <div className="header2">All my waves</div>

          {waveList.map((w, idx) => (
            <div
              key={`${w.address}|${w.timestamp}|${idx}`}
              className="wave"
              style={{ backgroundColor: w.iWon && 'green' }}>
              <div>Message: {w.message}</div>
              <div>From: {w.address}</div>
              <div>Time: {w.dateString}</div>
              {w.prizeAmount ? <div>Prize: {w.prizeAmount} 💰💰💰</div> : null}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default App;
