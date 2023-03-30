import { ButtonHTMLAttributes, FC, ReactNode } from "react";
import { midClickAnimation, fastExitAnimation } from "@constants";
import { AnimatePresence, motion } from "framer-motion";
import { SpinAnimation } from "@components";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  isLoading?: boolean;
  loadingText?: string;
}

const WalletButton: FC<Props> = (props: Props) => {
  const { visible } = useWalletModal();
  const { connecting } = useWallet();

  const {
    children,
    className,
    isLoading,
    loadingText = children,
    ...componentProps
  } = props;

  return (
    <button
      className={`${className} relative transition-colors !w-[200px] h-14 duration-300  border-2 text-base lg:text-lg rounded
      text-gray-400 border-gray-400 hover:border-custom-white hover:text-custom-white cursor-pointer `}
      {...componentProps}
    >
      <AnimatePresence mode="wait">
        {visible || connecting || isLoading ? (
          <motion.div
            className="flex items-center justify-center"
            key="spinner"
            {...fastExitAnimation}
          >
            <SpinAnimation color="#fff" />
            <p key="connect-btn-loading"> {loadingText}</p>
          </motion.div>
        ) : (
          <motion.div
            key="connect-btn-standard"
            className=""
            {...fastExitAnimation}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};

export default WalletButton;
