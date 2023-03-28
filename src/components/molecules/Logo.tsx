import { FC } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { midClickAnimation } from "@constants";
import Link from "next/link";

const Logo: FC = () => {
  return (
    <div className="my-0 flex items-center gap-2 text-pink-300 transition-colors ease-in-out duration-500 cursor-pointer">
      <Link href="/">
        Liberty Square
        <motion.div {...midClickAnimation}>
          {/* <Image
            src="/images/"
            height={60}
            width={60}
            alt="Logo"
          /> */}
        </motion.div>
      </Link>
    </div>
  );
};
export default Logo;
