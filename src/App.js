import './App.css';
import { login, setPublicKey } from './store/walletslice';

import React, { useMemo, useEffect, useState, useLayoutEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

import Modal from './componets/Modal';
import ModalM from './componets/ModalM';
import Market from "./componets//Market";
import MarketItemDetails from './componets/MarketItemDetails';
import Staking from './componets/Staking';

import { useWallet } from '@solana/wallet-adapter-react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
// import {
//   WalletDialogProvider,
//   WalletMultiButton
// } from '@solana/wallet-adapter-material-ui';
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";

import {
  getPhantomWallet,
  getSolflareWallet,
} from '@solana/wallet-adapter-wallets';
import "@solana/wallet-adapter-react-ui/styles.css";

import { clusterApiUrl } from '@solana/web3.js';
import AudioPlayer from 'material-ui-audio-player';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import MusicOffIcon from '@mui/icons-material/MusicOff';
import { makeStyles } from '@mui/styles';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import AudioControl from './componets/AudioControl';
import { MAINNET_RPC, NETWORK } from './config/constants';

export const App = () => {
  return (
    <Context>
      <Content />
    </Context>
  );
};

const Context = ({ children }) => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = NETWORK;

  // You can also provide a custom RPC endpoint.
  // const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  // const endpoint = "https://solana-api.projectserum.com";
  const endpoint = MAINNET_RPC;

  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
  // Only the wallets you configure here will be compiled into your application, and only the dependencies
  // of wallets that your users connect to will be loaded.
  const wallets = useMemo(
    () => [
      new getPhantomWallet(),
      new getSolflareWallet(),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={true}>
        {/* <WalletDialogProvider> */}
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
        {/* </WalletDialogProvider> */}
      </WalletProvider>
    </ConnectionProvider>
  );
};

function Content() {
  const [show, setShow] = useState(false);
  const [showm, setShowm] = useState(false);
  const [shows, setShows] = useState(false);
  const [showd, setShowd] = useState(false);
  const [id, setId] = useState('');
  const [text, setText] = useState('')
  const [showi, setShowi] = useState(false);
  const [texti, setTexti] = useState('');

  const dispatch = useDispatch();

  const { connected, publicKey } = useWallet();
  // console.log('[kg] => connected : ', connected);

  useEffect(() => {
    console.log('[log] => ', connected ? 'Connected' : 'Not connected');
    console.log('[log] => wallet address: ', publicKey);
    if (connected) {
      dispatch(login());
      dispatch(setPublicKey(publicKey.toBase58()));
      // console.log("connected ******************");
    }
  }, [connected])

  const x = window.innerWidth >= 1050 ? -1200 : window.innerWidth >= 700 ? -1200 : -740;
  const icons = {
    PlayIcon: MusicOffIcon,
    // ReplayIcon: Replay,
    PauseIcon: MusicNoteIcon,
    // VolumeUpIcon: VolumeUp,
    // VolumeOffIcon: VolumeOff,
    // CloseIcon: Close,
  };

  const muiTheme = createTheme({});

  const useStyles = makeStyles((theme) => {
    return {
      root: {
        [theme.breakpoints.down('sm')]: {
          width: '100%',
        },
      },
      playIcon: {
        color: '#ff0000',
        '&:hover': {
          color: '#ff4081',
        },
      },
      pauseIcon: {
        color: '#0000ff',
      },
    };
  });

  return (
    <div className=' overlay'>

      <div style={{ position: "fixed", left: "5%", top: "30px", zIndex: 10000 }}>
        <AudioControl />
      </div>
      <div style={{ position: "fixed", right: "5%", top: "30px", zIndex: 10000 }}>
        <WalletMultiButton className="custom-wallet-button" style={{ 'backgroundColor': '#0c4a6e', 'color': 'white' }} />
      </div>
      <TransformWrapper
        minScale={1}
        maxScale={2}
        initialScale={1}
        initialPositionX={x}
        initialPositionY={1}
        defaultPositionX={1}
        defaultPositionY={1}
      >
        <TransformComponent wrapperClass='castle-overlay' contentClass='castle-bg'>
          <div className='quest-btn click-cursor'>
            <button className='game-button click-cursor' onClick={() => { setShow(true); setText('Quests') }}>
              <div className='title'>Quests</div>
              <img src='../scr/assets/bubble-arrow.c34d2c3a.png' alt='buble' />
            </button>
          </div>

          <div className='jester-container'>
            <div className='jester-wrap'>
              <div className='jester-grandle-btn click-cursor'>
                <button className='game-button click-cursor' onClick={() => { setShows(true); setText('Staking') }}>
                  <div className='title'>Staking</div>
                  <img src='../scr/assets/bubble-arrow.c34d2c3a.png' alt='buble' />
                </button>
              </div>
            </div>
          </div>

          <div className='jester-container'>
            <div className='jester-wrap'>
              <div className='clp-grandle-btn click-cursor'>
                <button className='game-button click-cursor' onClick={() => { setShow(true); setText('LP') }}>
                  <div className='title'><span style={{ color: '#ffe0b7' }}>...</span>LP<span style={{ color: '#ffe0b7' }}>..</span></div>
                  <img src='../scr/assets/bubble-arrow.c34d2c3a.png' alt='buble' />
                </button>
              </div>
            </div>
          </div>

          <div className='land-auction-btn click-cursor'>
            <button className='game-button click-cursor' onClick={() => { setShowm(true); setText('Marketplace') }}>
              <div className='title'>Marketplace</div>
              <img src='../scr/assets/bubble-arrow.c34d2c3a.png' alt='buble' />
            </button>
          </div>

          <div className='sum-btn click-cursor' onClick={() => { setShow(true); setText('Summons') }}>
            <button className='game-button click-cursor'>
              <div className='title'> Summons</div>
              <img src='../scr/assets/bubble-arrow.c34d2c3a.png' alt='buble' />
            </button>
          </div>

        </TransformComponent>
      </TransformWrapper>

      <Modal show={show} setShow={setShow} text={text} />
      <ModalM showm={showm} setShowm={setShowm} text={text} setShowi={setShowi} setTexti={setTexti} />
      <Market showi={showi} setShowm={setShowm} setShowi={setShowi} texti={texti} setId={setId} setShowd={setShowd} />

      <MarketItemDetails showd={showd} setShowd={setShowd} id={id} setId={setId} setShowi={setShowi} />
      <Staking shows={shows} setShows={setShows} />
    </div>

  );
}

export default App;
