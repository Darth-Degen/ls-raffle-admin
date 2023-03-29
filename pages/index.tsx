import {
  PageLayout,
  ConnectButton,
  WalletButton,
  SpinAnimation,
} from "@components";
import React, { useState } from "react";
import { NextPage } from "next";
import { AnimatePresence, motion } from "framer-motion";
import { fastExitAnimation } from "@constants";
import { useWallet } from "@solana/wallet-adapter-react";

const Home: NextPage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  const { disconnect } = useWallet();

  const handleDisconnect = () => {
    sessionStorage.clear();
    disconnect();
  };

  return (
    <PageLayout>
      <motion.div
        className="flex flex-col gap-2 items-center justify-center "
        key="form"
      >
        {/* sign out */}

        <div
          className="text-sm pt-1.5 text-center underline cursor-pointer absolute top-2 right-4 text-custom-orange"
          onClick={() => handleDisconnect()}
        >
          sign out
        </div>

        <p>Enter your info below</p>
        <input
          type="text"
          value={name}
          onInput={(e) =>
            setName((e.target as HTMLInputElement).value.toLowerCase())
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
            setEmail((e.target as HTMLInputElement).value.toLowerCase())
          }
          placeholder="Email"
          className="rounded border-2 outline-custom-pink h-8 px-2"
        />
        <button
          className={`relative px-4 py-2 text-2xl rounded-2xl border-2 uppercase bg-custom-white transition-colors duration-300 text-custom-black border-custom-pink hover:text-custom-pink h-[52px] w-[275px]`}
          onClick={() => alert("click")}
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
    </PageLayout>
  );
};

export default Home;
