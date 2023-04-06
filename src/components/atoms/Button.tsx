import { ButtonHTMLAttributes, FC, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LoadCircle, SpinAnimation } from "@components";
import { fastExitAnimation } from "@constants";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  isLoading?: boolean;
  loadText?: string;
}

const Button: FC<Props> = (props: Props) => {
  const {
    children,
    isLoading = false,
    loadText = "",
    className,
    ...componentProps
  } = props;

  return (
    <motion.div className={`transition-colors duration-200  p-0.5 rounded`}>
      <button
        className={`transition-colors !w-[200px] h-14 duration-300 border-2 text-base lg:text-lg rounded text-gray-400 border-gray-400  ${
          componentProps.disabled
            ? "cursor-not-allowed  opacity-20"
            : "hover:border-custom-white hover:text-custom-white"
        } ${className} `}
        {...componentProps}
        disabled={componentProps.disabled}
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              className="flex items-center justify-center ml-2"
              key="spinner"
              {...fastExitAnimation}
            >
              <SpinAnimation color="#fff" />
              <p key="connect-btn-loading"> {loadText}</p>
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
    </motion.div>
  );
};

export default Button;
