import { Metadata } from "@metaplex-foundation/js";
import { Dispatch, FC, SetStateAction } from "react";
import { AddIcon } from "@components";

interface Props {
  handleClick: Dispatch<SetStateAction<boolean>>;
  token: Metadata | undefined;
}

const SelectToken: FC<Props> = (props: Props) => {
  const { handleClick, token } = props;
  return (
    <div
      className="flex flex-col items-center gap-1"
      onClick={() => handleClick(true)}
    >
      <div className="relative flex flex-col items-center border border-teal-500 rounded cursor-pointer transition-colors duration-300 bg-custom-mid-gray bg-opacity-50 hover:bg-opacity-80">
        <div className="relative flex flex-col items-center justify-center w-56 md:w-72 h-56 md:h-72 overflow-hidden">
          {token ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              /* @ts-ignore */
              src={token.image}
              height={250}
              width={250}
              alt={token.name}
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
