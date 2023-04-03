import {
  PageLayout,
  AddIcon,
  SpinAnimation,
  NumberInput,
  Dropdown,
  Modal,
} from "@components";
import React, { useCallback, useState } from "react";
import { NextPage } from "next";
import { AnimatePresence, motion } from "framer-motion";
import {
  EXPO_PROGRAM_ID,
  fastExitAnimation,
  hoverAnimation,
  midExitAnimation,
} from "@constants";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import DateTime from "react-datetime";
import moment, { Moment } from "moment";
import { toast } from "react-hot-toast";
import { getTokensByOwner } from "@helpers";
import {
  FindNftsByOwnerOutput,
  JsonMetadata,
  Metadata,
  Nft,
  Sft,
} from "@metaplex-foundation/js";
import axios from "axios";
import { useEffect } from "react";
import { json } from "stream/consumers";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { executeTransaction } from "src/lib/transactions";
import { tokenInfoMap } from "@constants";
import { ExpoClient } from "src/lib/expo";
import expoIdlJSON from "src/lib/expo/idl/expo.json";

interface Tokens { }

const currencies = ["sol", "flth", "usdc", "bonk"];

const Home: NextPage = () => {
  const tokensKeys = [...tokenInfoMap.keys()];
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [maxTickets, setMaxTickets] = useState<number>();
  const [price, setPrice] = useState<number>();
  const [currencyDropdown, setCurrencyDropdown] = useState<boolean>(false);
  const [currency, setCurrency] = useState<any>(
    tokenInfoMap.get(tokensKeys[0])
  );
  const [date, setDate] = useState<string | Moment>();
  const [metadata, setMetadata] = useState<Metadata[] | undefined>();
  const [selected, setSelected] = useState<Metadata | undefined>();
  const [tokens, setTokens] = useState<FindNftsByOwnerOutput | undefined>();

  const wallet = useWallet();
  const { publicKey, disconnect } = wallet;
  const { connection } = useConnection();

  const expo = new ExpoClient(
    connection,
    wallet as any,
    expoIdlJSON as anchor.Idl,
    EXPO_PROGRAM_ID
  );

  let inputProps = {
    placeholder: "01/01/2024 8:00 AM",
    className:
      "rounded border-2 border-gray-400 h-12 w-44 px-2 bg-custom-dark-gray focus:outline-teal-600",
  };

  //verify not past date
  const isValidDate = (current: any) => {
    var yesterday = moment().subtract(1, "day");
    return current.isAfter(yesterday);
  };

  //disconnect wallet
  const handleDisconnect = (): void => {
    sessionStorage.clear();
    disconnect();
    if (selected) setSelected(undefined);
  };

  //set currency type
  const handleCurrency = (id: number): void => {
    const tokensKeys = [...tokenInfoMap.keys()];
    setCurrency(tokenInfoMap.get(tokensKeys[id]));
    setCurrencyDropdown(false);
  };

  //create the raffle
  const handleCreateRaffle = async (): Promise<void> => {
    if (!date) {
      toast.error("Select End Date");
      return;
    }
    if (!maxTickets || maxTickets < 1) {
      toast.error("Add Max Tickets");
      return;
    }
    selected;
    if (!price || price < 0.1) {
      toast.error("Add Ticket Price");
      return;
    }
    if (!selected) {
      toast.error("Select NFT");
      return;
    }

    const toastId = toast.loading("Creating raffle...");
    setIsCreating(true);

    const endTimestamp = new anchor.BN(moment(date).unix());
    const ticketPrice = new anchor.BN(price * Math.pow(10, currency.decimals));
    const nftMint = selected?.mintAddress;

    try {
      const { signers, instructions } = await expo.createRaffle(
        new PublicKey(currency.address),
        endTimestamp,
        ticketPrice,
        maxTickets,
        nftMint
      );

      await executeTransaction(
        connection,
        wallet,
        instructions,
        { signers: [signers] }
      );

      setIsCreating(false);
    } catch (e) {
      console.error(e);
      toast.error("Something bad happened. Please try again.");
      setIsCreating(false);
    }
  };

  //handle nft selection
  const handleClick = (token: Metadata<JsonMetadata<string>>): void => {
    console.log(token);
    setSelected(token);
  };

  //fetch user tokens
  const getTokens = useCallback(async () => {
    try {
      setIsLoading(true);
      //fetch tokens
      const tokens = await getTokensByOwner(connection, publicKey);
      if (!tokens) return;

      setTokens(tokens);
      console.log("tokens ", tokens);

      //fetch metadata
      const jsonArr: Metadata[] = [];
      await Promise.all(
        tokens.map(async (token, index) => {
          const uri = token.uri;
          // console.log(token.name);
          try {
            await axios.get(uri).then((r) => {
              // console.log(uri, r.data);
              if (r.data.seller_fee_basis_points) {
                // @ts-ignore
                r.data.mintAddress = token.mintAddress;
                jsonArr.push(r.data);
              }
            });
          } catch (e: any) {
            console.error(e.message);
          }
        })
      );
      // console.log("> metadata", jsonArr);
      jsonArr.sort((a, b) => a.name.localeCompare(b.name));
      setMetadata(jsonArr);
      setIsLoading(false);
    } catch (e: any) {
      console.error(e.message);

      toast.error(`Error ${e.message}`);
      setIsLoading(false);
    }
  }, [connection, publicKey]);

  useEffect(() => {
    getTokens();
  }, [getTokens]);

  //reset data on disconnect
  useEffect(() => {
    if (!connection || !publicKey) {
      setMetadata(undefined);
    }
  }, [connection, publicKey]);

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
            {/* select nft */}
            <div
              className="flex flex-col items-center gap-1"
              onClick={() => setShowModal(true)}
            >
              <div className="relative flex flex-col items-center border border-teal-500 rounded cursor-pointer transition-colors duration-300 bg-custom-mid-gray bg-opacity-50 hover:bg-opacity-80">
                <div className="relative flex flex-col items-center justify-center w-56 md:w-72 h-56 md:h-72 overflow-hidden">
                  {selected ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      /* @ts-ignore */
                      src={selected.image}
                      height={250}
                      width={250}
                      alt={selected.name}
                      className="rounded transition-all duration-500 hover:scale-105"
                    />
                  ) : (
                    <AddIcon width={50} height={50} />
                  )}
                </div>
                <p className="text-sm absolute -bottom-8 ">Select NFT</p>
              </div>
            </div>
            {/* form */}
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
                  label={currency.symbol}
                  items={[...tokenInfoMap.keys()]}
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
                  {maxTickets && maxTickets > 0 && price && price > 0 && (
                    <motion.div
                      className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-white text-sm uppercase w-full text-center"
                      key="total"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.1, ease: "easeInOut" }}
                    >
                      {(maxTickets * price).toLocaleString()} {currency.symbol}
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
                  <p key="connect-btn-loading"> Creating Raffle</p>
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
      <Modal show={showModal} close={setShowModal}>
        <div className="flex items-center justify-center w-screen lg:w-[100vh] h-screen lg:h-[70vh] bg-custom-dark-gray px-6 py-12 lg:rounded">
          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div
                key="load"
                className="ml-4 flex gap-4"
                {...midExitAnimation}
              >
                Loading NFTs
                <SpinAnimation color="#fff" size={25} />
              </motion.div>
            )}
            {!isLoading && metadata && metadata.length > 0 && (
              <motion.div
                key="tokens"
                className="h-full overflow-y-auto px-8"
                {...midExitAnimation}
              >
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5  4xl:grid-cols-8 w-full gap-8 py-8">
                  {metadata.map((item, index) => (
                    <motion.div
                      className={`flex flex-col items-center  justify-center rounded overflow-hidden  cursor-pointer border-2 ${selected && selected.name === item.name
                          ? "border-teal-500"
                          : "border-gray-400"
                        }`}
                      key={index}
                      onClick={() => handleClick(item)}
                    // {...hoverAnimation}
                    >
                      <div
                        className={`border-b-2 border-gray-400 overflow-hidden ${selected && selected.name === item.name
                            ? "border-teal-500"
                            : "border-gray-400"
                          }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          /* @ts-ignore */
                          src={item.image}
                          height={200}
                          width={200}
                          alt={item.name}
                          className={`w-[200px] h-[200px] transition-all duration-500 hover:scale-105 object-cover overflow-hidden `}
                        />
                      </div>
                      <p className="text-xs py-3 w-full text-center  ">
                        {item.name}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Modal>
    </PageLayout>
  );
};

export default Home;
