import { ArrowIcon } from "@components";
import { arrowVariants } from "@constants";
import { FC } from "react";
import { motion } from "framer-motion";

interface Props {
  isActive: boolean;
  label: string;
}

const DropdownButton: FC<Props> = (props: Props) => {
  const { isActive, label } = props;

  return (
    <motion.button
      className={`relative flex justify-between items-center rounded border-2 border-gray-400 h-12 w-44 px-2 bg-custom-dark-gray uppercase hover:border-teal-300  transition-colors duration-300 `}
      // whileTap={{ scale: 0.97 }}
      // {...backgroundAnimations}
    >
      {label}
      <motion.div
        animate={isActive ? "end" : "start"}
        variants={arrowVariants}
        className=""
      >
        <ArrowIcon color={"#fff"} />
      </motion.div>
    </motion.button>
  );
};

export default DropdownButton;
