import {
  PageLayout,
  ConnectButton,
  WalletButton,
  SpinAnimation,
} from "@components";
import React, { useEffect, useRef, useState } from "react";
import { NextPage } from "next";
import { useWallet } from "@solana/wallet-adapter-react";
import { AnimatePresence, motion } from "framer-motion";
import { fastExitAnimation, midExitAnimation } from "@constants";
import { sign } from "tweetnacl";
import bs58 from "bs58";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import { PublicKey } from "@solana/web3.js";

const logos = [
  {
    src: "/images/logos/btc-bandits.png",
    width: 95,
    height: 89,
    url: "https://twitter.com/banditsbtc",
    alt: "Bitcoin Bandits",
  },
  {
    src: "/images/logos/hedgehog-markets.png",
    width: 108,
    height: 66,
    url: "https://twitter.com/hedgehogmarket",
    alt: "Hedgehog Markets",
  },
  {
    src: "/images/logos/wolf-capital.png",
    width: 108,
    height: 108,
    url: "https://twitter.com/WolfCapital_",
    alt: "Wolf Capital",
  },
  {
    src: "/images/logos/bored-hungry.png",
    width: 217,
    height: 104,
    url: "https://twitter.com/BorednHungry",
    alt: "Bored & Hungry",
  },
];

const Home: NextPage = () => {
  const [didMount, setDidMount] = useState<boolean>(false);
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const { connected, publicKey, signMessage, disconnect } = useWallet();
  const lastPublicKey = useRef<PublicKey>();

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

  const handleDisconnect = () => {
    sessionStorage.clear();
    disconnect();
  };

  useEffect(() => {
    setDidMount(true);
  }, []);

  useEffect(() => {
    if (lastPublicKey.current !== null && lastPublicKey.current !== publicKey) {
      setIsAuthorized(false);
    } else if (connected && publicKey) {
      lastPublicKey.current = publicKey;
    }
    console.log(connected, publicKey);
  }, [connected, publicKey]);

  const handleGetTicket = async (): Promise<void> => {
    const regex = new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g);
    if (!regex.test(email)) {
      toast.error("Please provide a valid email");
      return;
    }
    if (!name) {
      toast.error("Please enter a name (doesn't need to be your real name)");
    }
    setIsLoading(true);
    const toastId = toast.loading("Confirming...");

    try {
      await axios.post(
        "https://ticketsensei-380722.de.r.appspot.com/claimTicket",
        {
          customer_details: {
            email,
            name,
          },
        }
      );

      // TODO: Potentially add redirect to some sort of success screen
      setIsLoading(false);
      toast.success(
        `Success! Check ${email} to find your ticket to the event.`,
        { id: toastId, duration: 10000 }
      );
      setEmail("");
      setName("");
      setIsSuccess(true);
    } catch (error: unknown) {
      setIsLoading(false);
      toast.success((error as DOMException).message, { id: toastId });
    }
  };

  return (
    <PageLayout>
      {didMount && (
        <div className="flex justify-end lg:items-center relative lg:h-screen ">
          <div className="fixed bottom-0 left-0 sm:max-w-[36.9%] -z-10 opacity-30 sm:opacity-100">
            <Image
              src="/images/harlowe.png"
              alt="Harlowe"
              width={773}
              height={946}
            />
          </div>
          <div
            className="flex flex-col items-center 3xl:gap-8
            md:pr-[8%] 3xl:p-0 3xl:fixed 3xl:top-[40%] 3xl:left-[60%] 4xl:left-1/2 3xl:transform 3xl:-translate-y-1/2  3xl:-translate-x-1/2 "
          >
            <div className="pb-4  pt-10 lg:pt-0 px-2">
              <Image
                src="/images/page-header.png"
                alt="header"
                width={1096 / 1.3}
                height={386 / 1.3}
              />
            </div>

            <div className="flex flex-col items-center py-10 sm:pt-5 px-2 text-xl md:text-3xl text-center -rotate-1">
              <p className="font-secondary">wednesday march 22, 2023</p>
              <p className="font-secondary -mt-1">5:30 - p PM</p>
              <p className="font-secondary -mt-1">
                LS Holders early access: 4:30 pm
              </p>

              <p className="font-secondary mt-2">2535 A E 12th St.</p>
              <p className="font-secondary -mt-1">Los Angeles, CA 90021</p>
            </div>
            <AnimatePresence mode="wait">
              {/* connect wallet */}
              {!connected && (
                <motion.div key="connect" {...midExitAnimation} className="">
                  <ConnectButton />
                  <p className="text-xs pt-0.5 opacity-80 text-center text-custom-black">
                    ledger not supported
                  </p>
                </motion.div>
              )}
              {/* sign message & disconnect btn */}
              {connected && (
                <motion.div className="" key="signing" {...midExitAnimation}>
                  {/* user form */}
                  <AnimatePresence mode="wait">
                    {isAuthorized ? (
                      <>
                        {isSuccess ? (
                          // TODO: Update Success Message
                          <div>
                            Success! Check your e-mail to find your ticket to
                            the event
                          </div>
                        ) : (
                          <motion.div
                            className="flex flex-col gap-2 items-center justify-center "
                            key="form"
                          >
                            <p>Enter your info below</p>
                            <input
                              type="text"
                              value={name}
                              onInput={(e) =>
                                setName(
                                  (
                                    e.target as HTMLInputElement
                                  ).value.toLowerCase()
                                )
                              }
                              placeholder="Name"
                              className="rounded border-2 outline-custom-pink h-8 px-2"
                            />
                            <input
                              type="email"
                              id="email"
                              name="email"
                              value={email}
                              onInput={(e) =>
                                setEmail(
                                  (
                                    e.target as HTMLInputElement
                                  ).value.toLowerCase()
                                )
                              }
                              placeholder="Email"
                              className="rounded border-2 outline-custom-pink h-8 px-2"
                            />
                            <button
                              className={`relative px-4 py-2 text-2xl rounded-2xl border-2 uppercase bg-custom-white  transition-colors duration-300 
      text-custom-black border-custom-pink hover:text-custom-pink h-[52px] w-[275px]`}
                              onClick={() => handleGetTicket()}
                            >
                              <AnimatePresence mode="wait">
                                {isLoading ? (
                                  <motion.div
                                    className="flex items-center justify-center"
                                    key="spinner"
                                    {...fastExitAnimation}
                                  >
                                    <SpinAnimation color="#e99895" />
                                    <p key="connect-btn-loading"></p>
                                  </motion.div>
                                ) : (
                                  <motion.div
                                    key="connect-btn-standard"
                                    className=""
                                    {...fastExitAnimation}
                                  >
                                    Get Ticket
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </button>
                          </motion.div>
                        )}
                      </>
                    ) : (
                      <motion.div className="" key="walletbtn">
                        {" "}
                        <WalletButton
                          onClick={() =>
                            isAuthorized
                              ? handleDisconnect()
                              : signMessageFromWallet()
                          }
                          isLoading={isSigning}
                          loadingText="Signing"
                          className="min-w-[275px]"
                        >
                          {isAuthorized
                            ? `${publicKey
                                ?.toBase58()
                                .slice(0, 4)}...${publicKey
                                ?.toBase58()
                                .slice(-4)}`
                            : "Sign to Confirm"}
                        </WalletButton>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div
                    className="text-xs pt-0.5 opacity-60 text-center text-custom-black underline cursor-pointer"
                    onClick={() => handleDisconnect()}
                  >
                    sign out
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex flex-wrap gap-x-8 md:gap-14  -z-10 items-center justify-center mt-10 fixed bottom-4 md:relative h-auto">
              {/* <div className="flex"> */}
              {logos.map((item) => (
                <Image
                  key={item.alt}
                  src={item.src}
                  width={item.width / 1.5}
                  height={item.height / 1.5}
                  alt={item.alt}
                  className="h-min"
                />
              ))}
            </div>
          </div>
          <div className="hidden md:flex fixed bottom-2 right-4 items-end gap-4">
            <p>Powered By</p>
            <Image
              src="/images/builderz-black.svg"
              alt="Builderz"
              width={1364 / 10}
              height={402 / 10}
            />
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default Home;
