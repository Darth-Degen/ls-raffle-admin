import { NextPage } from "next";
import { Button, PageLayout } from "src/components";
import { motion } from "framer-motion";
import { midExitAnimation } from "src/constants";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { deserializeCreatorsData, program, transactions } from "@ls-arkade/payments";
import { PublicKey, LAMPORTS_PER_SOL, Transaction } from "@solana/web3.js";
import axios from "axios";
import { DAILY_POOL, MONTHLY_POOL, WEEKLY_POOL } from "@ls-arkade/payments/dist/constants";
import toast from "react-hot-toast";

const Arkade: NextPage = () => {
  const [dailyPoolAmount, setDailyPoolAmount] = useState<number | null>();
  const [weeklyPoolAmount, setWeeklyPoolAmount] = useState<number | null>();
  const [monthlyPoolAmount, setMonthlyPoolAmount] = useState<number | null>();
  const [dailyAddress, setDailyAddress] = useState<string | null>();
  const [weeklyAddress, setWeeklyAddress] = useState<string | null>();
  const [monthlyAddress, setMonthlyAddress] = useState<string | null>();

  const [dailyWinners, setDailyWinners] = useState<string[]>(); // pubkey
  const [weeklyWinners, setWeeklyWinners] = useState<string[]>(); // pubkey
  const [monthlyWinners, setMonthlyWinners] = useState<string[]>(); // pubkey

  const [isSendingDaily, setIsSendingDaily] = useState<boolean>(false);
  const [isSendingWeekly, setIsSendingWeekly] = useState<boolean>(false);
  const [isSendingMonthly, setIsSendingMonthly] = useState<boolean>(false);

  const DEVNET_WHEEL_OF_FATE_CONFIG_ADDRESS = "36eNfZk2FXeCsDo5FnpSi11aHZ4W1xgCSB5a9zV3fQmU";
  const configAccountKey = new PublicKey(DEVNET_WHEEL_OF_FATE_CONFIG_ADDRESS);
  const LEADERBOARD_URL = "https://api.libertysquare.io/arkade/leaderboards/e1a781c8-0801-412a-ace7-b7ddf5208265";
  const Authorization = "Bearer 8def2e76-1769-497e-ac7b-47275eb9bac9";

  const wallet = useWallet();
  const { publicKey, disconnect } = wallet;
  const { connection } = useConnection();

  // @ts-ignore
  const lsPaymentsProgram = program(connection, wallet);

  function togglePoolLoadingState(poolId: string) {
    switch (poolId) {
      case DAILY_POOL: { setIsSendingDaily(!isSendingDaily); break; }
      case WEEKLY_POOL: { setIsSendingWeekly(!isSendingWeekly); break; }
      case MONTHLY_POOL: { setIsSendingMonthly(!isSendingMonthly); break; }
    }
  }

  // Disconnect wallet
  const handleDisconnect = (): void => {
    sessionStorage.clear();
    disconnect();
  };

  const handleDailyDistribution = async (poolId: string, winners: string[]) => {
    togglePoolLoadingState(poolId);

    const distributeIx = await transactions.handlePoolDistribution(configAccountKey,
      winners.map(k => {
        console.log('winner:', k);
        return new PublicKey(k.toString())
      }),
      poolId,
      lsPaymentsProgram
    );
    try {
      const tx = await lsPaymentsProgram.provider.sendAndConfirm!(distributeIx);
      console.log('tx: ', tx);
      toast.success("Transaction sent successfuly");
    } catch (e) {
      console.error('Error while sending tx: ', e);
      toast.error("Error while sending transaction");
    }
    togglePoolLoadingState(poolId);

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

      const leaderboard = await axios(LEADERBOARD_URL, { headers: { Authorization } });

      console.log('leaderboard: ', leaderboard);

      setDailyWinners(leaderboard.data.daily.slice(0, 5).map((winner: any) => winner.player.walletId));
      setWeeklyWinners(leaderboard.data.weekly.slice(0, 5).map((winner: any) => winner.player.walletId));
      setMonthlyWinners(leaderboard.data.monthly.slice(0, 5).map((winner: any) => winner.player.walletId));

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
                <p className="pb-2">Winners: </p>
                <ul>
                  {dailyWinners?.map((winner, index) => {
                    return <li key={index}>{winner}</li>
                  })}
                </ul>
                <p></p>
                <p className="pb-2 pt-2">Address:<br />{dailyAddress}</p>
                <Button
                  onClick={() => handleDailyDistribution(DAILY_POOL, dailyWinners!)}
                  isLoading={isSendingDaily}
                  loadText={"Distributing..."}
                >
                  Distribute daily
                </Button>
              </div>
              <div>
                <p className="text-lg pt-10 pb-2 lg:pt-0">Distribute monthly pool</p>
                <p className="pb-2">Size: {weeklyPoolAmount} SOL</p>
                <p className="pb-2">Winners: </p>
                <ol>
                  {weeklyWinners?.map((winner, index) => {
                    return <li key={index}>{winner}</li>
                  })}
                </ol>
                <p className="pb-2 pt-2">Address:<br />{weeklyAddress}</p>
                <Button
                  onClick={() => handleDailyDistribution(WEEKLY_POOL, weeklyWinners!)}
                  isLoading={isSendingWeekly}
                  loadText={"Distributing..."}
                >
                  Distribute monthly
                </Button>
              </div>
            </div>
            <div className="relative flex flex-col gap-3 lg:gap-6 items-center lg:items-start justify-start w-full">
              <div>
                <p className="text-lg pt-10 pb-2 lg:pt-0">Distribute weekly pool</p>
                <p className="pb-2">Size: {monthlyPoolAmount} SOL</p>
                <p className="pb-2">Winners: </p>
                <ul>
                  {weeklyWinners?.map((winner, index) => {
                    return <li key={index}>{winner}</li>
                  })}
                </ul>
                <p className="pb-2 pt-2">Address:<br />{monthlyAddress}</p>
                <Button
                  onClick={() => handleDailyDistribution(MONTHLY_POOL, monthlyWinners!)}
                  isLoading={isSendingMonthly}
                  loadText={"Distributing..."}
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