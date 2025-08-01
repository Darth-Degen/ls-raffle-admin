import { FC } from "react";
import { enterAnimation } from "@constants";
import { motion } from "framer-motion";

interface Props {
  color: string;
}

const ArrowIcon: FC<Props> = (props: Props) => {
  const { color } = props;
  return (
    <motion.svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...enterAnimation}
      key="down-arrow"
    >
      <path
        d="M11.1808 15.8297L6.54199 9.20285C5.89247 8.27496 6.55629 7 7.68892 7L16.3111 7C17.4437 7 18.1075 8.27496 17.458 9.20285L12.8192 15.8297C12.4211 16.3984 11.5789 16.3984 11.1808 15.8297Z"
        fill={color}
      />
    </motion.svg>
  );
};

export default ArrowIcon;
