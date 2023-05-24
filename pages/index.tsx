import {
  PageLayout,
  Button,
  ConfirmModal,
  NumberInput,
  Dropdown,
  TokenModal,
  SelectToken,
  InputWrapper,
} from "@components";
import React, { FC, ReactNode, useCallback, useState } from "react";
import { NextPage } from "next";
import { AnimatePresence, motion } from "framer-motion";
import { EXPO_PROGRAM_ID, midExitAnimation } from "@constants";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import DateTime from "react-datetime";
import moment, { Moment } from "moment";
import { toast } from "react-hot-toast";
import { getTokensByOwner, getTokenAccounts } from "@helpers";
import {
  FindNftsByOwnerOutput,
  JsonMetadata,
  Metadata,
} from "@metaplex-foundation/js";
import axios from "axios";
import { useEffect } from "react";
import * as anchor from "@coral-xyz/anchor";
import { AccountInfo, ParsedAccountData, PublicKey } from "@solana/web3.js";
import { executeTransaction } from "src/lib/transactions";
import { tokenInfoMap } from "@constants";
import { ExpoClient } from "src/lib/expo";
import expoIdlJSON from "src/lib/expo/idl/expo.json";

const Home: NextPage = () => {
  const tokensKeys = [...tokenInfoMap.keys()];

  //load & display modal
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showTokenModal, setShowTokenModal] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  //form
  const [maxTickets, setMaxTickets] = useState<number>();
  const [price, setPrice] = useState<number>();
  const [currencyDropdown, setCurrencyDropdown] = useState<boolean>(false);
  const [currency, setCurrency] = useState<any>(
    tokenInfoMap.get(tokensKeys[0])
  );
  const [splDropdown, setSplDropdown] = useState<boolean>(false);
  //data
  const [date, setDate] = useState<string | Moment>();
  const [metadata, setMetadata] = useState<Metadata[] | undefined>();
  const [selectedToken, setSelectedToken] = useState<Metadata[]>([]);
  const [confirmedToken, setConfirmedToken] = useState<Metadata[]>([]);
  const [splMap, setSplMap] = useState<Map<string, any>>();
  const [selectedSpl, setSelectedSpl] = useState<any>();
  const [splAmount, setSplAmount] = useState<number>();

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
  const noSplLabel = "none";

  //verify not past date
  const isValidDate = (current: any) => {
    var yesterday = moment().subtract(1, "day");
    return current.isAfter(yesterday);
  };

  //disconnect wallet
  const handleDisconnect = (): void => {
    sessionStorage.clear();
    disconnect();
    if (selectedToken) setSelectedToken([]);
    if (confirmedToken) setConfirmedToken([]);
  };

  //set currency type
  const handleCurrency = (id: number): void => {
    const tokensKeys = [...tokenInfoMap.keys()];
    setCurrency(tokenInfoMap.get(tokensKeys[id]));
    setCurrencyDropdown(false);
  };

  //set SPL type
  const handleSplSelect = (id: number): void => {
    if (!splMap) return;
    const splKeys = [...splMap.keys()];
    // if (id == 0) setSelectedSpl(noSplLabel);
    console.log(
      "splKeys ",
      id - 1,
      splKeys[id - 1],
      splMap.get(splKeys[id - 1])
    );
    if (splMap.get(splKeys[id - 1])) {
      setSelectedSpl(splMap.get(splKeys[id - 1]));
      setSplDropdown(false);
    }
    // console.log("id ", splMap?.get());
    // setSelectedSpl(splMap?.get());
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
    if (!price || price < 0.001) {
      toast.error("Add Ticket Price");
      return;
    }
    if (!confirmedToken.length) {
      toast.error("Select NFT");
      return;
    }

    const toastId = toast.loading("Creating raffle...");
    setIsCreating(true);

    const endTimestamp = new anchor.BN(moment(date).unix());
    const ticketPrice = new anchor.BN(price * Math.pow(10, currency.decimals));
    //TODO: update for use with multiple tokens instead of first instance
    // const nftMint = confirmedToken[0]?.mintAddress;
    const nftMints = confirmedToken.map(token => token.mintAddress);
    const splFinalAmount = splAmount
      ? new anchor.BN(splAmount * Math.pow(10, selectedSpl.tokenAmount.decimals))
      : new anchor.BN(0);

    try {
      const { signers, instructions } = await expo.createRaffle(
        new PublicKey(currency.address),
        endTimestamp,
        ticketPrice,
        maxTickets,
        nftMints,
        selectedSpl ? selectedSpl.mint : undefined,
        splFinalAmount
      );

      const status = await executeTransaction(
        connection,
        wallet,
        instructions,
        {
          signers: [signers],
        }
      );

      //@ts-ignore
      if (status.value.err) {
        console.warn("Tx status: ", status);
        toast.error("An error occured. Please try again.");
      } else {
        toast.success("Raffle Created", {
          id: toastId,
        });
      }
      setShowConfirmModal(false);
      setIsCreating(false);
    } catch (e: unknown) {
      toast.error(
        e instanceof Error ? e.message : "An error occured. Please try again.",
        {
          id: toastId,
        }
      );
      console.error(e);

      setIsCreating(false);
    }
  };

  //handle nft selection
  const handleTokenSelect = (token: Metadata<JsonMetadata<string>>): void => {
    if (!token) return;
    let isDuplicate = false;
    //check for duplicates
    selectedToken.find((item) => {
      if (item?.mintAddress.toBase58() === token?.mintAddress.toBase58()) {
        isDuplicate = true;
      }
    });
    //add
    if (!isDuplicate) setSelectedToken([...selectedToken, token]);
    //remove
    else
      setSelectedToken((prevState) => {
        return prevState.filter(
          (item) =>
            item?.mintAddress.toBase58() !== token?.mintAddress.toBase58()
        );
      });
  };

  //confirm nft selection
  const handleConfirmSelection = () => {
    setConfirmedToken(selectedToken);
    setShowTokenModal(false);
  };

  //confirm raffle creation
  const handleConfirmCreation = () => {
    if (!date) {
      toast.error("Select End Date");
      return;
    }
    if (!maxTickets || maxTickets < 1) {
      toast.error("Add Max Tickets");
      return;
    }
    if (!price || price < 0.001) {
      toast.error("Add Ticket Price");
      return;
    }
    if (!confirmedToken) {
      toast.error("Select NFT");
      return;
    }
    setShowConfirmModal(true);
  };

  //fetch users nfts
  const getTokens = useCallback(async () => {
    if (!showTokenModal || !connection || !publicKey) return;

    try {
      setIsLoading(true);
      //fetch tokens
      const tokens = await getTokensByOwner(connection, publicKey);
      if (!tokens) {
        setIsLoading(false);
        return;
      }
      if (typeof tokens === "string") {
        setIsLoading(false);
        toast.error(tokens);
        return;
      }

      // console.log("tokens ", tokens);

      //fetch metadata
      const jsonArr: Metadata[] = [];
      await Promise.all(
        tokens.map(async (token, index) => {
          const uri = token.uri;
          try {
            await axios.get(uri).then((r) => {
              // @ts-ignore
              r.data.mintAddress = token.mintAddress;
              jsonArr.push(r.data);
            });
          } catch (e: any) {
            console.error(e.message);
          }
        })
      );
      // console.log("metadata", jsonArr);
      jsonArr.sort((a, b) => a.name.localeCompare(b.name));
      setMetadata(jsonArr);
      setIsLoading(false);
    } catch (e: any) {
      console.error(e.message);

      toast.error(`Error ${e.message}`);
      setIsLoading(false);
    }
  }, [connection, publicKey, showTokenModal]);

  //fetch user spl tokens with balance > 1
  const getSPLTokens = useCallback(async () => {
    if (!publicKey) return;
    const _tokens = await getTokenAccounts(connection, publicKey);

    // console.log('TOKENS: ', _tokens);

    if (_tokens && typeof _tokens !== "string") {
      //create new data map
      const parsedInfo = new Map();
      _tokens.forEach((_token) => {
        parsedInfo.set(
          //@ts-ignore
          _token.account.data.parsed.info.mint,
          //@ts-ignore
          _token.account.data.parsed.info
        );
      });
      // console.log("spl info ", parsedInfo);
      setSplMap(parsedInfo);
    }
  }, [connection, publicKey]);

  useEffect(() => {
    getSPLTokens();
  }, [getSPLTokens]);

  useEffect(() => {
    getTokens();
  }, [getTokens]);

  //reset data on disconnect
  useEffect(() => {
    if (!connection || !publicKey) {
      setMetadata(undefined);
    }
  }, [connection, publicKey]);

  //reset select on modal close
  useEffect(() => {
    setSelectedToken(confirmedToken);
  }, [confirmedToken, showTokenModal]);

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

        {/* outter container */}
        <div className="relative flex flex-col gap-6 items-center justify-center pb-32 w-full">
          <h2 className="text-2xl pt-10 lg:pt-0">Enter Raffle Info</h2>
          {/* layout container */}
          <div className="flex flex-col lg:flex-row justify-start items-center gap-12 lg:gap-14 px-10 md:px-18 py-10 rounded bg-custom-dark-gray">
            <SelectToken
              handleClick={setShowTokenModal}
              tokens={confirmedToken}
            />
            <div className="flex flex-col sm:flex-row gap-10">
              {/* fields 1 */}
              <div className="relative flex flex-col gap-3 lg:gap-6 items-center lg:items-start justify-center w-full ">
                <InputWrapper label="Select Currency">
                  <Dropdown
                    handleSelect={handleCurrency}
                    setShowDropdown={setCurrencyDropdown}
                    showDropdown={currencyDropdown}
                    label={currency.symbol}
                    items={[...tokenInfoMap.keys()]}
                  />
                </InputWrapper>
                <InputWrapper label="Max Tickets">
                  <NumberInput
                    max={5000}
                    handleInput={setMaxTickets}
                    placeholder="5000"
                  />
                </InputWrapper>
                <InputWrapper label="Ticket Price">
                  <NumberInput
                    max={10000}
                    handleInput={setPrice}
                    placeholder="0.1"
                    useDecimals={true}
                  />
                </InputWrapper>
                {/* Max Sales */}
                <AnimatePresence mode="wait">
                  {maxTickets && maxTickets > 0 && price && price > 0 && (
                    <motion.div
                      className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-teal-500 text-base w-full text-center whitespace-nowrap"
                      key="total"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.1, ease: "easeInOut" }}
                    >
                      Max Sales - {(maxTickets * price).toLocaleString()}{" "}
                      {currency.symbol}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {/* fields 2 */}
              <div className="relative flex flex-col gap-3 lg:gap-6 items-center lg:items-start justify-center w-full">
                <InputWrapper label="End Date & Time">
                  <DateTime
                    inputProps={inputProps}
                    isValidDate={isValidDate}
                    onChange={(date) => setDate(date)}
                  />
                </InputWrapper>
                <InputWrapper label="Raffle SPL Token">
                  <Dropdown
                    handleSelect={handleSplSelect}
                    setShowDropdown={setSplDropdown}
                    showDropdown={splDropdown}
                    //@ts-ignore
                    label={selectedSpl?.mint ?? noSplLabel}
                    items={
                      splMap ? [noSplLabel, ...splMap.keys()] : [noSplLabel]
                    }
                  />
                </InputWrapper>
                <InputWrapper label="SPL Quantity">
                  <NumberInput
                    max={5000}
                    handleInput={setSplAmount}
                    placeholder="5000"
                    disabled={!selectedSpl}
                  />
                </InputWrapper>
              </div>
            </div>
          </div>
          <Button
            onClick={handleConfirmCreation}
            isLoading={isCreating}
            loadText={"Creating Raffle"}
          >
            Create Raffle
          </Button>
        </div>
      </motion.div>
      <TokenModal
        show={showTokenModal}
        setShow={setShowTokenModal}
        metadata={metadata}
        selected={selectedToken}
        isLoading={isLoading}
        handleClick={handleTokenSelect}
        handleConfirm={handleConfirmSelection}
      />
      <ConfirmModal
        show={
          showConfirmModal &&
          maxTickets !== undefined &&
          price !== undefined &&
          confirmedToken !== undefined
        }
        setShow={setShowConfirmModal}
        isLoading={isCreating}
        handleClick={handleCreateRaffle}
        tokens={confirmedToken}
        tickets={maxTickets}
        price={price}
        currency={currency.name}
        date={date}
      />
    </PageLayout>
  );
};

export default Home;
