import { FC } from "react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { WalletButton } from "@components";

const ConnectButton: FC = () => {
  const { setVisible } = useWalletModal();

  return (
    <WalletButton
      className="relative min-w-[275px] text-custom-black"
      onClick={() => setVisible(true)}
      loadingText="Connecting"
    >
      connect wallet
    </WalletButton>
  );
};

export default ConnectButton;
