import Head from 'next/head'
import Image from 'next/image'
import Web3Modal from 'web3modal'
import { providers, Contract } from 'ethers'
import { useState, useEffect, useRef } from 'react'
import { WHITELIST_CONTRACT_ADDRESS, abi } from '../constants'
import styles from '../styles/Home.module.css'

export default function Home() {

  const [walletConnected, setWalletConnected] = useState(false);

  const [joinedWhitelist, setJoinedWhitelist] = useState(false);

  const [loading, setLoading] = useState(false);

  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);

  const web3ModalRef = useRef();

    /**
   * Returns a Provider or Signer object representing the Ethereum RPC with or without the
   * signing capabilities of metamask attached
   *
   * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
   *
   * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
   * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
   * request signatures from the user using Signer functions.
   *
   * @param {*} needSigner - True if you need the signer, default false otherwise
   */

  const getProviderOrSigner = async (needSigner = false) => {

    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const { chainId } = await web3Provider.getNetwork();
    if (chainId !==4 ) {
      window.alert("Changge the network to Rinkeby");
      throw new Error("Change the network to Rinkeby")
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  }

  /**
   * addAddressToWhitelist: Adds the current connected address to the whitelist
  */

  const addAddressToWhitelist = async () => {
    try {
      const signer = await getProviderOrSigner(true);

      const whitelistContract = new Contract(WHITELIST_CONTRACT_ADDRESS, abi, signer);

      const tx = await whitelistContract.addAddressToWhitelist();

      setLoading(true);
      await tx.wait();
      setLoading(false);

      await getNumberOfWhitelisted();
      setJoinedWhitelist(true);
    } catch (err) {
      console.log(err);
    }
  };


  /**
   * getNumberOfWhitelisted:  gets the number of whitelisted addresses
   */
  
  const getNumberOfWhitelisted = async () => {
    try {
      const provider = await getProviderOrSigner();

      const whitelistContract = new Contract (
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        provider
      );

      const _numberOfWhitelisted = await whitelistContract.numAddressesWhitelisted();
        setNumberOfWhitelisted(_numberOfWhitelisted);

    } catch (err) {
      console.error(err)
    }
  }

  /**
   * checkIfAddressInWhitelist: Checks if the address is in whitelist
  */  

  const checkIfAddressInWhitelist = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );

      const address = await signer.getAddress();

      const _joinedWhitelist = await whitelistContract.whitelistedAddresses(address);

      setJoinedWhitelist(_joinedWhitelist);
    } catch (err) {
      console.error(err)
    }
  }

  /*
    connectWallet: Connects the MetaMask wallet
  */

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);

      checkIfAddressInWhitelist();
      getNumberOfWhitelisted();

    } catch (err) {
      console.error(err);
    }
  }

  const renderButton = () => {
    if (walletConnected) {
      if(joinedWhitelist) {
        return (
          <div className={styles.button}>
            Thanks for joining the waitlist!
          </div>
        );
      } else if (loading) {
        return <button className={styles.button}>Loading...</button>
      } else {
        return (
          <button onClick={addAddressToWhitelist} className={styles.button}>
            Join the waitlist
          </button>
        );
      }
    } else {
      return (
        <button onClick={connectWallet} className={styles.button}>Connect your button</button>
      );
    }
  };

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false
      });
      connectWallet();
    }

  }, [walletConnected]);

  return (
    <div>
      <Head>
        <title>Whitelist Dapp</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.main}>
        <div>
          <div>
            <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
            <div className={styles.description}>
              Its an NFT collection for developers in Crypto
            </div>
            <div className={styles.description}>
              {numberOfWhitelisted} people have joined the waitlist
            </div>
            {renderButton()}
          </div>
        </div>
        <img className={styles.image} src="./crypto-devs.svg" />
      </div>

      <footer className={styles.footer}>
        Made with ❤️ by <a href="Jeffersonighalo.com">Jefferson Ighalo</a>
      </footer>
    </div>
  )
}
