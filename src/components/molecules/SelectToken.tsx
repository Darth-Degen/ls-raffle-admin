import { Metadata } from "@metaplex-foundation/js";
import { Dispatch, FC, SetStateAction } from "react";
import { AddIcon } from "@components";

interface Props {
  handleClick: Dispatch<SetStateAction<boolean>>;
  tokens: Metadata[];
}

const SelectToken: FC<Props> = (props: Props) => {
  const { handleClick, tokens } = props;
  return (
    <div
      className="flex flex-col items-center gap-1"
      onClick={() => handleClick(true)}
    >
      <div className="relative flex flex-col items-center border border-teal-500 rounded cursor-pointer transition-colors duration-300 bg-custom-mid-gray bg-opacity-50 hover:bg-opacity-80">
        <div className="relative flex flex-col items-center justify-center w-56 md:w-72 h-56 md:h-72 overflow-hidden">
          {tokens && tokens.length > 0 ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              /* @ts-ignore */
              src={tokens[0].image}
              height={250}
              width={250}
              alt={tokens[0].name}
              className="rounded transition-all duration-500 hover:scale-105"
            />
          ) : (
            <AddIcon width={50} height={50} />
          )}
        </div>
        <p className="text-sm absolute -bottom-8 ">Select NFT</p>
      </div>
    </div>
  );
};
export default SelectToken;
