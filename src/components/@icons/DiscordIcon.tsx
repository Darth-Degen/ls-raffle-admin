import { FC } from "react";
import { midClickAnimation } from "@constants";
import { motion } from "framer-motion";
import Image from "next/image";

const DiscordIcon: FC = () => {
  return (
    <motion.a {...midClickAnimation} rel="noreferrer" href="" target="_blank">
      <Image src="/images/discord.png" width={37} height={41} alt="discord" />
    </motion.a>
  );
};

export default DiscordIcon;
