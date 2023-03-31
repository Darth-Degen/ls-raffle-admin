import { AnimatePresence, motion } from "framer-motion";
import { SetStateAction, Dispatch, FC, ReactNode, useEffect } from "react";
import { scaleExitAnimation } from "@constants";
import { CloseIcon } from "@components";

interface Props {
  show: boolean;
  close: Dispatch<SetStateAction<boolean>>;
  children: ReactNode;
  contentLoaded?: boolean;
}
const Modal: FC<Props> = (props: Props) => {
  const { show, close, children, contentLoaded = true } = props;

  //stop page scroll (when modal or menu open)
  useEffect(() => {
    if (show) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
  }, [show]);

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          key="image-modal"
          className="fixed inset-0 backdrop-blur-sm z-50 w-screen h-screen "
          onClick={() => close(false)}
          {...scaleExitAnimation}
        >
          <div
            className={`absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 `}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-3xl">
              <motion.div
                className="cursor-pointer absolute top-3 lg:-top-3 right-3 lg:-right-3 z-50 m-5
              rounded-full transition-all duration-300 hover:bg-custom-black p-0.5"
                onClick={() => close(false)}
                whileTap={{ scale: 0.96 }}
              >
                <CloseIcon color="#d1d5db" />
              </motion.div>
              {children}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
