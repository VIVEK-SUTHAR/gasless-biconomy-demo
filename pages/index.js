import { Biconomy } from "@biconomy/mexa";
import { ethers } from "ethers";
import Head from "next/head";
import React, { useState } from "react";
import SignCard from "../components/SignCard";
import {
  SIGNBOOK_ABI,
  SIGNBOOK_CUSTOM_ABI,
  SIGNBOOK_CUSTOM_ADDRESS,
  SIGNERBOOK_ADDRESS,
} from "../data";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [account, setAccount] = useState("");
  const [allSigns, setAllSigns] = useState([]);
  const [input, setInput] = useState("");
  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Please install an ethereum wallet");
        return;
      }
      const provider = new ethers.providers.Web3Provider(ethereum);
      const address = await provider.send("eth_requestAccounts");
      if (address) {
        fetchAllQuotes();
        setAccount(address[0]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  React.useEffect(() => {
    connectWallet();
  }, []);
  React.useEffect(() => {
    fetchAllQuotes();
  }, []);

  // let contract;
  const fetchAllQuotes = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(
        SIGNBOOK_CUSTOM_ADDRESS,
        SIGNBOOK_CUSTOM_ABI,
        signer
      );
      console.log(contractInstance);
      const visitors = await contractInstance.getQuote();
      console.log(visitors);
      setAllSigns(visitors);
    } catch (error) {
      console.log(error);
    }
  };

  const sendGasLess = async () => {
    try {
      const biconomy = new Biconomy(window.ethereum, {
        apiKey: process.env.NEXT_PUBLIC_BICONOMY_KEY,
        debug: true,
        contractAddresses: [SIGNERBOOK_ADDRESS],
      });
      await biconomy.init();
      const provider = biconomy.provider;
      const contractInstance = new ethers.Contract(
        SIGNERBOOK_ADDRESS,
        SIGNBOOK_ABI,
        biconomy.ethersProvider
      );
      const { data } = await contractInstance.populateTransaction.addVisitor(
        input,
        account
      );
      let txParams = {
        data: data,
        from: account,
        to: "0xE4D776526a354B870c21c4D9D83A39897844e582",
        signatureType: "EIP712_SIGN",
        gasLimit: 5000000,
      };
      provider.send("eth_sendTransaction", [txParams]);
      biconomy.on("transactionHash", (hash) => {
        console.log(hash?.transactionId);
        setTxnHash(hash?.transactionId);
      });
      biconomy.on("txHashGenerated", (data) => {
        setTxnHash(data?.hash);
      });
      biconomy.on("txMined", (data) => {
        console.log(data);
        fetchAllQuotes();
      });
    } catch (error) {}
  };

  const sendGasLessMetaTx = async () => {
    const biconomy = new Biconomy(window.ethereum, {
      apiKey: process.env.NEXT_PUBLIC_BICONOMY_KEY,
      debug: true,
      contractAddresses: [SIGNBOOK_CUSTOM_ADDRESS],
    });
    await biconomy.init();
    const provider = biconomy.provider;
    const contractInstance = new ethers.Contract(
      SIGNBOOK_CUSTOM_ADDRESS,
      SIGNBOOK_CUSTOM_ABI,
      biconomy.ethersProvider
    );
    console.log(contractInstance);
    // console.log("Signer", signer);
    let domainData = {
      name: "Quote",
      version: "1",
      chainId: (await biconomy.ethersProvider.getNetwork()).chainId,
      verifyingContract: SIGNBOOK_CUSTOM_ADDRESS,
    };
    const domainType = [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
    ];
    const metaTransactionType = [
      { name: "nonce", type: "uint256" },
      { name: "from", type: "address" },
    ];
    console.log("user-nonce call to SC");
    const nonce = await contractInstance.nonces(account);
    console.log("Got nonce", nonce);
    let message = {};
    message.nonce = parseInt(nonce);
    message.from = account;
    const dataToSign = {
      types: {
        EIP712Domain: domainType,
        MetaTransaction: metaTransactionType,
      },
      domain: domainData,
      primaryType: "MetaTransaction",
      message: message,
    };
    console.log(dataToSign);
    provider.send(
      {
        method: "eth_signTypedData_v4",
        params: [account, JSON.stringify(dataToSign)],
      },
      (err, sign) => {
        console.log("User Signatur", sign);
        const signature = sign.result.substring(2);
        const r = "0x" + signature.substring(0, 64);
        const s = "0x" + signature.substring(64, 128);
        const v = parseInt(signature.substring(128, 130), 16);
        //Populate the txn to memepool
        contractInstance.populateTransaction
          .setQuoteMeta(account, input, r, s, v)
          .then((res) => {
            console.log(res);
            alert("Transaction Sent");
            //Once ready, send to the chain, with native
            let txParams = {
              data: res.data,
              from: account,
              to: SIGNBOOK_CUSTOM_ADDRESS,
              signatureType: "EIP712_SIGN",
              gasLimit: 5000000,
            };
            provider.send(
              {
                method: "eth_sendTransaction",
                params: [txParams],
              },
              (error, resss) => {
                alert("Transaction Sent!");
                if (error) {
                  console.log(error);
                }
                console.log(resss);
              }
            );
            // console.log(d);
          });
      }
    );
    biconomy.on("transactionHash", (hash) => {
      console.log(hash?.transactionId);
    });
    biconomy.on("txHashGenerated", (data) => {
      console.log(data);
    });
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div>
          <input
            className={styles.input}
            type={"text"}
            placeholder={"Type your message"}
            value={input}
            onChange={(e) => {
              e.preventDefault();
              setInput(e.target.value);
            }}
          />
          <button onClick={sendGasLessMetaTx} className={styles.btn}>
            send
          </button>
        </div>
        <h4>Dont woory,this transaction is gasless</h4>
        <div className={styles.grid}>
          Currnet Quote is
          <SignCard from={allSigns[1]} message={allSigns[0]} />
        </div>
      </main>
      <footer className={styles.footer}>
        <a
          href="https://viveksuthar.me"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div>Gasless powered by Biconomy</div>
        </a>
      </footer>
    </div>
  );
}
