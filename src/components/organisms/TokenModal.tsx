import { AnimatePresence, motion } from "framer-motion";
import { SetStateAction, Dispatch, FC } from "react";
import { midExitAnimation } from "@constants";
import { Modal, SpinAnimation, CheckIcon, Button } from "@components";
import { JsonMetadata, Metadata } from "@metaplex-foundation/js";

interface Props {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  isLoading: boolean;
  metadata: Metadata[] | undefined;
  handleClick: (token: Metadata<JsonMetadata<string>>) => void;
  selected: Metadata[];
  handleConfirm: () => void;
}
const TokenModal: FC<Props> = (props: Props) => {
  const {
    show,
    setShow,
    metadata,
    isLoading,
    handleClick,
    selected,
    handleConfirm,
  } = props;

  const isSelected = (token: Metadata): boolean => {
    if (!selected) return false;

    let _isSelected = false;
    selected.find((o, i) => {
      if (o?.mintAddress.toBase58() === token?.mintAddress.toBase58()) {
        _isSelected = true;
      }
    });
    return _isSelected;
  };

  return (
    <Modal show={show} close={setShow}>
      <div className="flex flex-col items-center justify-between w-screen lg:w-[100vh] h-screen lg:h-[70vh] xl:w-[120vh] xl:h-[80vh] bg-custom-dark-gray px-6 pt-12 lg:pt-8 lg:pb-3 lg:rounded">
        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div
              key="load"
              className="ml-4 flex gap-4 absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2"
              {...midExitAnimation}
            >
              Loading NFTs
              <SpinAnimation color="#fff" size={25} />
            </motion.div>
          )}
          {!isLoading && (
            <motion.div
              key="tokens"
              className="h-full overflow-y-auto  flex flex-col items-center justify-between"
              {...midExitAnimation}
            >
              {metadata && metadata.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-8 w-full gap-8 py-8 px-8 overflow-y-auto">
                  {metadata.map((item, index) => (
                    <motion.div
                      className={`relative flex flex-col items-center justify-between rounded   cursor-pointer border-2 ${
                        isSelected(item) ? "border-teal-500" : "border-gray-400"
                      }`}
                      key={index}
                      onClick={() => handleClick(item)}
                    >
                      {isSelected(item) && (
                        <CheckIcon className="absolute top-1.5 right-1.5 bg-custom-mid-gray rounded-full z-20" />
                      )}
                      <div
                        className={`overflow-hidden ${
                          isSelected(item)
                            ? "border-teal-500"
                            : "border-gray-400"
                        }`}
                      >
                        <div className=" transition-all duration-500 hover:scale-105 object-cover">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            /* @ts-ignore */
                            src={item.image}
                            height={200}
                            width={200}
                            alt={item.name}
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                      </div>
                      <p className="text-xs py-3 w-full text-center text-ellipsis overflow-hidden border-t-2 border-gray-400 ">
                        {item.name}
                      </p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-3/4">
                  NO NFTS FOUND
                </div>
              )}

              {metadata && metadata.length > 0 && (
                <Button
                  className="mt-4 mb-2"
                  disabled={selected.length === 0}
                  onClick={handleConfirm}
                >
                  Confirm {selected.length > 0 ? `(${selected.length})` : ""}
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
};

export default TokenModal;
