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
import { EXPO_PROGRAM_ID, RAFFLE_MODE_MULTI_WINNERS, RAFFLE_MODE_MULTI_WINNERS_LABEL, RAFFLE_MODE_SINGLE_WINNER, RAFFLE_MODE_SINGLE_WINNER_LABEL, midExitAnimation } from "@constants";
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
import { AccountInfo, ParsedAccountData, PublicKey, Transaction, TransactionInstruction, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { executeTransaction, sendAndValidateTransaction } from "src/lib/transactions";
import { tokenInfoMap } from "@constants";
import { ExpoClient } from "src/lib/expo";
import expoIdlJSON from "src/lib/expo/idl/expo.json";

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const Home: NextPage = () => {
  const tokensKeys = [...tokenInfoMap.keys()];
  const raffleModes = [RAFFLE_MODE_SINGLE_WINNER_LABEL, RAFFLE_MODE_MULTI_WINNERS_LABEL];

  //load & display modal
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isAdingPrizes, setIsAddingPrizes] = useState<boolean>(false);
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
  const [raffleMode, setRaffleMode] = useState<any>();
  const [raffleModeLabel, setRaffleModeLabel] = useState<string>();
  const [raffleModeDropdown, setRaffleModeDropdown] = useState<boolean>(false);
  const [splDropdown, setSplDropdown] = useState<boolean>(false);
  //data
  const [date, setDate] = useState<string | Moment>();
  const [metadata, setMetadata] = useState<Metadata[] | undefined>();
  const [selectedToken, setSelectedToken] = useState<Metadata[]>([]);
  const [confirmedToken, setConfirmedToken] = useState<Metadata[]>([]);
  const [splMap, setSplMap] = useState<Map<string, any>>();
  const [selectedSpl, setSelectedSpl] = useState<any>();

  const [splAmountBatchOne, setSplAmountBatchOne] = useState<number>();
  const [splPrizesCountBatchOne, setSplPrizesCountBatchOne] = useState<number>();

  const [splAmountBatchTwo, setSplAmountBatchTwo] = useState<number>();
  const [splPrizesCountBatchTwo, setSplPrizesCountBatchTwo] = useState<number>();

  const [splAmountBatchThree, setSplAmountBatchThree] = useState<number>();
  const [splPrizesCountBatchThree, setSplPrizesCountBatchThree] = useState<number>();

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

  //set raffle mode
  const handleRaffleMode = (id: number): void => {
    if (raffleModes[id] === RAFFLE_MODE_SINGLE_WINNER_LABEL) {
      setRaffleMode(RAFFLE_MODE_SINGLE_WINNER);
      setRaffleModeLabel(RAFFLE_MODE_SINGLE_WINNER_LABEL);
      setRaffleModeDropdown(false);
    } else {
      setRaffleMode(RAFFLE_MODE_MULTI_WINNERS);
      setRaffleModeLabel(RAFFLE_MODE_MULTI_WINNERS_LABEL);
      setRaffleModeDropdown(false);
    }
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
    // if (!confirmedToken.length) {
    //   toast.error("Select NFT");
    //   return;
    // }

    const toastId = toast.loading("Creating raffle...");
    setIsCreating(true);

    const endTimestamp = new anchor.BN(moment(date).unix());
    const ticketPrice = new anchor.BN(price * Math.pow(10, currency.decimals));
    // TODO: update for use with multiple tokens instead of first instance
    // const nftMint = confirmedToken[0]?.mintAddress;
    const nftMints = confirmedToken.map(token => token.mintAddress);
    const splFinalAmount = splAmountBatchOne
      ? new anchor.BN(splAmountBatchOne * Math.pow(10, selectedSpl.tokenAmount.decimals))
      : new anchor.BN(0);

    try {
      const { signers, instructions, raffle } = await expo.createRaffle(
        new PublicKey(currency.address),
        endTimestamp,
        ticketPrice,
        maxTickets,
        nftMints,
        // We don't create SPL prizes during raffle creation now
        undefined, // selectedSpl ? selectedSpl.mint : undefined,
        splFinalAmount,
        raffleMode
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

      setIsAddingPrizes(true);

      // Add additional prizes for many SPL prizes
      const additionalPrizesBatchOne = Array(splPrizesCountBatchOne).fill({ amount: splAmountBatchOne });
      const additionalPrizesBatchTwo = Array(splPrizesCountBatchTwo).fill({ amount: splAmountBatchTwo });
      const additionalPrizesBatchThree = Array(splPrizesCountBatchThree).fill({ amount: splAmountBatchThree });

      const additionalPrizes = [
        ...additionalPrizesBatchOne,
        ...additionalPrizesBatchTwo,
        ...additionalPrizesBatchThree
      ];

      console.log('additionalPrizes: ', additionalPrizes);

      const additionalIxs: TransactionInstruction[] = [];

      // const raffledata = await expo.expoProgram.account.raffle.fetch(raffle.toBase58());
      // console.log('RTaffle: ', raffledata);

      for await (let [index, splPrize] of additionalPrizes.entries()) {
        const splPrizeMint = selectedSpl.mint;
        console.log('prize index: ', index);
        const finalAmount = splPrize.amount * Math.pow(10, selectedSpl.tokenAmount.decimals);
        console.log('finalAmount: ', finalAmount);

        const ix = await expo.addSplPrize(
          signers.publicKey,
          new PublicKey(splPrizeMint),
          new anchor.BN(finalAmount),
          index
        );

        additionalIxs.push(ix);
      }

      function* chunks<T>(arr: T[], n: number): Generator<T[], void> {
        for (let i = 0; i < arr.length; i += n) {
          yield arr.slice(i, i + n);
        }
      }

      const ixsBatchLength = 12;
      const batchedIxs = [...chunks(additionalIxs, ixsBatchLength)];

      const batchTransactions: VersionedTransaction[] = [];

      let lastScanIndex = 0;

      for await (let [index, instructions] of batchedIxs.entries()) {
        const latestBlockhash = await connection.getLatestBlockhash("finalized");
        console.log('got blackhash: ', latestBlockhash);

        let messageV0 = new TransactionMessage({
          payerKey: wallet.publicKey!,
          recentBlockhash: latestBlockhash.blockhash,
          instructions
        }).compileToV0Message();
        const transactionv0 = new VersionedTransaction(messageV0);
        // transactionv0.sign([signers]);
        batchTransactions.push(transactionv0);

        const txBatchSize = 3;

        const isLastBatch = (
          batchedIxs.length - lastScanIndex < txBatchSize
        ) && (
            batchTransactions.length === batchedIxs.length
          );

        if (
          batchTransactions.length % txBatchSize === 0 || isLastBatch
        ) {
          console.log('Is divisible ? ', batchTransactions.length % txBatchSize === 0);
          console.log('-- Start index: ', batchTransactions.length - txBatchSize);
          console.log('-- End index: ', batchTransactions.length);

          console.log('Is last batch ? ', isLastBatch);

          const transactions = isLastBatch
            ? batchTransactions.slice(lastScanIndex)
            : batchTransactions.slice(batchTransactions.length - txBatchSize);

          lastScanIndex = batchTransactions.length;

          const signedTransactions = await wallet.signAllTransactions!(transactions);

          const prizesResults = await signedTransactions.reduce(async (prev, transaction): Promise<any> => {
            await prev;
            console.log('Sending tx');
            await sendAndValidateTransaction(connection, transaction, latestBlockhash);
            console.log('Tx sent');
            return await sleep(400);
          }, Promise.resolve());

          console.log("prizesResults: ", prizesResults);
        }
      }

      setIsAddingPrizes(false);
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
            <div className="flex flex-col sm:flex-row items-start gap-10">
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
                <InputWrapper label="Raffle mode">
                  <Dropdown
                    handleSelect={handleRaffleMode}
                    setShowDropdown={setRaffleModeDropdown}
                    showDropdown={raffleModeDropdown}
                    label={raffleModeLabel!}
                    items={raffleModes}
                  />
                </InputWrapper>
              </div>
            </div>
          </div>
          <div className="flex-row sm:flex-row gap-12 lg:gap-14 px-10 md:px-18 py-10 rounded bg-custom-dark-gray">
            <div className="relative flex flex-row gap-3 lg:gap-6 items-center lg:items-start justify-center w-full ">
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
            </div>

            <h2 className="mt-6">Batch 1</h2>
            <div className="flex flex-row gap-12">
              <InputWrapper label="SPL Quantity per prize">
                <NumberInput
                  max={5000}
                  handleInput={setSplAmountBatchOne}
                  placeholder="5000"
                  disabled={!selectedSpl}
                />
              </InputWrapper>
              <InputWrapper label="Prizes Count for this batch">
                <NumberInput
                  max={5000}
                  handleInput={setSplPrizesCountBatchOne}
                  placeholder="1"
                  disabled={!selectedSpl}
                />
              </InputWrapper>
            </div>

            <h2 className="mt-6">Batch 2</h2>
            <div className="flex flex-row gap-12">
              <InputWrapper label="SPL Quantity per prize">
                <NumberInput
                  max={5000}
                  handleInput={setSplAmountBatchTwo}
                  placeholder="5000"
                  disabled={!selectedSpl}
                />
              </InputWrapper>
              <InputWrapper label="Prizes Count for this batch">
                <NumberInput
                  max={5000}
                  handleInput={setSplPrizesCountBatchTwo}
                  placeholder="1"
                  disabled={!selectedSpl}
                />
              </InputWrapper>
            </div>

            <h2 className="mt-6">Batch 3</h2>
            <div className="flex flex-row gap-12">
              <InputWrapper label="SPL Quantity per prize">
                <NumberInput
                  max={5000}
                  handleInput={setSplAmountBatchThree}
                  placeholder="5000"
                  disabled={!selectedSpl}
                />
              </InputWrapper>
              <InputWrapper label="Prizes Count for this batch">
                <NumberInput
                  max={5000}
                  handleInput={setSplPrizesCountBatchThree}
                  placeholder="1"
                  disabled={!selectedSpl}
                />
              </InputWrapper>
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
