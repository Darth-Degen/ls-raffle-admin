import { FC } from "react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { WalletButton } from "@components";

const ConnectButton: FC = () => {
  const { setVisible } = useWalletModal();

  return (
    <WalletButton
      className="relative min-w-[200px] text-custom-black"
      onClick={() => setVisible(true)}
      loadingText="Connecting"
    >
      Connect Wallet
    </WalletButton>
  );
};

export default ConnectButton;
