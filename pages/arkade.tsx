import { NextPage } from "next";
import { Button, PageLayout } from "src/components";
import { AnimatePresence, motion } from "framer-motion";
import { midExitAnimation } from "src/constants";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { deserializeCreatorsData, program, transactions } from "@ls-arkade/payments";
import { Wallet } from "@coral-xyz/anchor";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

const Arkade: NextPage = () => {
  const [dailyPoolAmount, setDailyPoolAmount] = useState<number | null>();
  const [weeklyPoolAmount, setWeeklyPoolAmount] = useState<number | null>();
  const [monthlyPoolAmount, setMonthlyPoolAmount] = useState<number | null>();
  const [dailyAddress, setDailyAddress] = useState<string | null>();
  const [weeklyAddress, setWeeklyAddress] = useState<string | null>();
  const [monthlyAddress, setMonthlyAddress] = useState<string | null>();

  const [isSendingDaily, setIsSendingDaily] = useState<boolean>(false);
  const DEVNET_WHEEL_OF_FATE_CONFIG_ADDRESS = "Gj2ptwThPbKJu6tGNCczT3rscrU8j4EFssicMdFmenq9";

  const wallet = useWallet();
  const { publicKey, disconnect } = wallet;
  const { connection } = useConnection();

  // @ts-ignore
  const lsPaymentsProgram = program(connection, wallet);

  // Disconnect wallet
  const handleDisconnect = (): void => {
    sessionStorage.clear();
    disconnect();
  };

  const handleDailyDistribution = async () => {
    setIsSendingDaily(true);

    setIsSendingDaily(false);
  };

  useEffect(() => {
    (async () => {
      const configAccount = await lsPaymentsProgram.account.configAccount.fetch(
        new PublicKey(DEVNET_WHEEL_OF_FATE_CONFIG_ADDRESS)
      );
      // console.log('configAccount: ', configAccount);
      const creators = await lsPaymentsProgram.account.creators.fetch(configAccount.creators);
      const creatorsData = await lsPaymentsProgram.provider.connection.getAccountInfo(configAccount.creators);
      const creatorsList = await deserializeCreatorsData(creatorsData?.data!, creators.total);
      // console.log('creatorsList: ', creatorsList);

      setDailyAddress(creatorsList.creators[7].publicKey.toBase58());
      setWeeklyAddress(creatorsList.creators[6].publicKey.toBase58());
      setMonthlyAddress(creatorsList.creators[5].publicKey.toBase58());

      const dailyAmount = await lsPaymentsProgram.provider.connection.getBalance(creatorsList.creators[7].publicKey);
      const weeklyAmount = await lsPaymentsProgram.provider.connection.getBalance(creatorsList.creators[6].publicKey);
      const monthlyAmount = await lsPaymentsProgram.provider.connection.getBalance(creatorsList.creators[5].publicKey);

      setDailyPoolAmount(dailyAmount / LAMPORTS_PER_SOL);
      setWeeklyPoolAmount(weeklyAmount / LAMPORTS_PER_SOL);
      setMonthlyPoolAmount(monthlyAmount / LAMPORTS_PER_SOL);
    })();
  }, []);

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

        <div className="relative flex flex-col gap-6 items-center justify-center pb-32 w-full">
          <h2 className="text-2xl pt-10 lg:pt-0">Arkade pools distribution</h2>

          <div className="flex flex-col sm:flex-row gap-10">
            <div className="relative flex flex-col gap-3 lg:gap-6 items-center lg:items-start justify-center w-full">
              <div>
                <p className="text-lg pt-10 pb-2 lg:pt-0">Distribute daily pool</p>
                <p className="pb-2">Size: {dailyPoolAmount} SOL</p>
                <p className="pb-2">Address: {dailyAddress}</p>
                <Button
                  onClick={handleDailyDistribution}
                  isLoading={isSendingDaily}
                  loadText={"Creating Raffle"}
                >
                  Distribute daily
                </Button>
              </div>
              <div>
                <p className="text-lg pt-10 pb-2 lg:pt-0">Distribute monthly pool</p>
                <p className="pb-2">Size: {weeklyPoolAmount} SOL</p>
                <p className="pb-2">Address: {weeklyAddress}</p>
                <Button
                  onClick={handleDailyDistribution}
                  isLoading={isSendingDaily}
                  loadText={"Creating Raffle"}
                >
                  Distribute monthly
                </Button>
              </div>
            </div>
            <div className="relative flex flex-col gap-3 lg:gap-6 items-center lg:items-start justify-start w-full">
              <div>
                <p className="text-lg pt-10 pb-2 lg:pt-0">Distribute weekly pool</p>
                <p className="pb-2">Size: {monthlyPoolAmount} SOL</p>
                <p className="pb-2">Address: {monthlyAddress}</p>
                <Button
                  onClick={handleDailyDistribution}
                  isLoading={isSendingDaily}
                  loadText={"Creating Raffle"}
                >
                  Distribute weekly
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </PageLayout>
  );
};

export default Arkade;