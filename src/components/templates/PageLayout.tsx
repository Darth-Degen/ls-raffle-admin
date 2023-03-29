import { FC, ReactNode, useEffect, useRef, useState } from "react";
import {
  ConnectButton,
  PageHead,
  WalletButton,
  Header,
  Footer,
} from "@components";
import { AnimatePresence, motion } from "framer-motion";
import { enterAnimation, midExitAnimation } from "@constants";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { sign } from "tweetnacl";
import bs58 from "bs58";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";

interface Props {
  children: ReactNode;
}

const PageLayout: FC<Props> = (props: Props) => {
  const { children } = props;

  const [didMount, setDidMount] = useState<boolean>(false);
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const { connected, publicKey, signMessage, disconnect } = useWallet();
  const lastPublicKey = useRef<PublicKey>();

  const handleDisconnect = () => {
    sessionStorage.clear();
    disconnect();
  };

  const signMessageFromWallet = async () => {
    setIsSigning(true);
    try {
      if (!publicKey) throw new Error("Wallet not connected!");
      if (!signMessage)
        throw new Error("Wallet does not support message signing!");

      const message = new TextEncoder().encode(
        "Please sign this message to login."
      );
      const signature = await signMessage(message);
      if (!sign.detached.verify(message, signature, publicKey.toBytes()))
        throw new Error("Invalid signature!");

      console.log(`Message signature: ${bs58.encode(signature)}`);

      let res = await axios.post(
        process.env.NEXT_PUBLIC_API_LOGIN_ENDPOINT ?? "",
        {
          signedMessage: message,
          signature: bs58.encode(signature),
          walletAddress: bs58.encode(publicKey.toBytes()),
        }
      );

      //final auth success
      if (res.data?.token) {
        sessionStorage.setItem("wallet-token", res.data.token);
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
        disconnect();
      }

      setIsSigning(false);
    } catch (error: any) {
      console.error(`Signing failed: ${error?.message}`);
      toast.error(`Signing failed: ${error?.message}`);
      setIsSigning(false);
    }
  };

  useEffect(() => {
    setDidMount(true);
  }, []);

  //handle change wallet
  useEffect(() => {
    if (lastPublicKey.current !== null && lastPublicKey.current !== publicKey) {
      setIsAuthorized(false);
    } else if (connected && publicKey) {
      lastPublicKey.current = publicKey;
    }
    console.log(connected, publicKey);
  }, [connected, publicKey]);

  const ConnectWallet = () => {
    return (
      <motion.div
        key="connect"
        {...midExitAnimation}
        className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
      >
        <ConnectButton />
        <p className="text-xs pt-0.5 opacity-80 text-center text-custom-orange">
          ledger not supported
        </p>
      </motion.div>
    );
  };

  const SignMessage = () => {
    return (
      <motion.div
        className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
        key="walletbtn"
      >
        <WalletButton
          onClick={() =>
            isAuthorized ? handleDisconnect() : signMessageFromWallet()
          }
          isLoading={isSigning}
          loadingText="Signing"
          className="min-w-[200px]"
        >
          {isAuthorized
            ? `${publicKey?.toBase58().slice(0, 4)}...${publicKey
                ?.toBase58()
                .slice(-4)}`
            : "Sign to Verify"}
        </WalletButton>
        <div
          className="text-xs pt-1.5  text-center  underline cursor-pointer  text-custom-orange"
          onClick={() => handleDisconnect()}
        >
          sign out
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      className="relative flex flex-col w-screen min-h-screen justify-between "
      {...enterAnimation}
    >
      <PageHead
        title="Liberty Square"
        description="Liberty Square tickets at Berrics, LA"
      />
      <Header />
      {didMount && (
        <main className="flex justify-center items-center h-full w-full">
          <AnimatePresence mode="wait">
            {/* step 1. connect wallet */}
            {!connected && <ConnectWallet />}
            {/* step 2. sign message  */}
            {connected && (
              <motion.div className="" key="content" {...midExitAnimation}>
                <AnimatePresence mode="wait">
                  {isAuthorized ? children : <SignMessage />}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      )}
      <Footer />
    </motion.div>
  );
};
export default PageLayout;
