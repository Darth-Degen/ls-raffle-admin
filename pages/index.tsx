import {
  PageLayout,
  AddIcon,
  SpinAnimation,
  NumberInput,
  Dropdown,
} from "@components";
import React, { useState } from "react";
import { NextPage } from "next";
import { AnimatePresence, motion } from "framer-motion";
import { fastExitAnimation, midExitAnimation } from "@constants";
import { useWallet } from "@solana/wallet-adapter-react";
import DateTime from "react-datetime";
import moment, { Moment } from "moment";
import { toast } from "react-hot-toast";

const currencies = ["sol", "flth", "usdc", "bonk"];

const Home: NextPage = () => {
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const [maxTickets, setMaxTickets] = useState<number>();
  const [price, setPrice] = useState<number>();
  const [currencyDropdown, setCurrencyDropdown] = useState<boolean>(false);
  const [currency, setCurrency] = useState<string>(currencies[0]);
  const [date, setDate] = useState<string | Moment>();

  const { disconnect } = useWallet();

  let inputProps = {
    placeholder: "01/01/2024 8:00 AM",
    class:
      "rounded border-2 border-gray-400 h-12 lg:h-10 w-44 lg:w-40  px-2 bg-custom-dark-gray focus:outline-teal-600",
  };

  const isValidDate = (current: any) => {
    var yesterday = moment().subtract(1, "day");
    return current.isAfter(yesterday);
  };

  const handleDisconnect = (): void => {
    sessionStorage.clear();
    disconnect();
  };
  const handleCurrency = (id: number): void => {
    setCurrency(currencies[id]);
    setCurrencyDropdown(false);
  };
  const handleCreateRaffle = (): void => {
    console.log(date);
    if (!date) {
      toast.error("Select End Date");
      return;
    }
    if (!maxTickets || maxTickets < 1) {
      toast.error("Add Max Tickets");
      return;
    }
    if (!price || price < 1) {
      toast.error("Add Ticket Price");
      return;
    }
    setIsCreating(!isCreating);
  };

  return (
    <PageLayout>
      <motion.div
        className="flex flex-col gap-2 items-center justify-center w-full"
        key="form"
        {...midExitAnimation}
      >
        {/* sign out */}
        <div
          className="text-sm pt-1.5 text-center underline cursor-pointer absolute top-2 right-4 text-teal-400"
          onClick={() => handleDisconnect()}
        >
          sign out
        </div>

        {/*  raffle form */}
        <div className="relative flex flex-col gap-6 items-center justify-center pb-32 w-full">
          <h2 className="text-2xl pt-10 lg:pt-0">Enter Raffle Info</h2>
          <div className="flex flex-col lg:flex-row justify-start items-center gap-10 lg:gap-14 px-10 md:px-18 py-10 rounded bg-custom-dark-gray">
            <div className="flex flex-col items-center gap-1">
              <div className="flex flex-col items-center border border-teal-500 rounded p-4 cursor-pointer transition-colors duration-300 bg-custom-mid-gray bg-opacity-50 hover:bg-opacity-80">
                <div className="flex flex-col items-center justify-center w-40 h-40">
                  <AddIcon width={50} height={50} />
                </div>
              </div>
              <p className="text-sm">Select NFT</p>
            </div>
            <div className="relative flex flex-col gap-3 lg:gap-4 items-center lg:items-start justify-center w-full pb-4">
              {/* end date */}
              <div className="flex flex-col gap-0.5 bg-custom-dark-gray">
                <p className="text-xs">End Date & Time</p>
                <DateTime
                  inputProps={inputProps}
                  isValidDate={isValidDate}
                  onChange={(date) => setDate(date)}
                />
              </div>
              {/* select currency */}
              <div className="flex flex-col gap-0.5">
                <p className="text-xs">Select Currency</p>
                <Dropdown
                  handleSelect={handleCurrency}
                  setShowDropdown={setCurrencyDropdown}
                  showDropdown={currencyDropdown}
                  label={currency}
                  items={currencies}
                />
              </div>
              {/* max tickets */}
              <div className="flex flex-col gap-0.5">
                <p className="text-xs">Max Tickets</p>
                <NumberInput
                  max={5000}
                  handleInput={setMaxTickets}
                  placeholder="5000"
                />
              </div>
              {/* ticket price */}
              <div className="flex flex-col gap-0.5">
                <p className="text-xs">Ticket Price</p>
                <NumberInput
                  max={10000}
                  handleInput={setPrice}
                  placeholder="0.1"
                  useDecimals={true}
                />
                <AnimatePresence mode="wait">
                  {maxTickets && price && (
                    <motion.div
                      className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-white text-sm uppercase w-full text-center"
                      {...fastExitAnimation}
                    >
                      {(maxTickets * price).toLocaleString()} {currency}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
          <button
            className={`transition-colors !w-[200px] h-14 duration-300 border-2 text-base lg:text-lg rounded text-gray-400 border-gray-400 hover:border-custom-white hover:text-custom-white`}
            onClick={() => handleCreateRaffle()}
          >
            <AnimatePresence mode="wait">
              {isCreating ? (
                <motion.div
                  className="flex items-center justify-center"
                  key="spinner"
                  {...fastExitAnimation}
                >
                  <SpinAnimation color="#fff" />
                  <p key="connect-btn-loading"> Creating</p>
                </motion.div>
              ) : (
                <motion.div
                  key="connect-btn-standard"
                  className=""
                  {...fastExitAnimation}
                >
                  Create Raffle
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.div>
    </PageLayout>
  );
};

export default Home;
