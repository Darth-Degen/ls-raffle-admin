import { SetStateAction, Dispatch, FC, ReactNode } from "react";
import { Modal, Button } from "@components";
import { JsonMetadata, Metadata } from "@metaplex-foundation/js";
import { Moment } from "moment";
import moment from "moment";

interface Props {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  isLoading: boolean;
  handleClick: () => void;
  tokens: Metadata[];
  tickets: number | undefined;
  price: number | undefined;
  currency: string;
  date: string | Moment | undefined;
}

const ConfirmModal: FC<Props> = (props: Props) => {
  const {
    show,
    setShow,
    isLoading,
    handleClick,
    tokens,
    tickets,
    price,
    currency,
    date,
  } = props;
  console.log("tokens ", tokens);
  return (
    <Modal show={show} close={setShow}>
      <div className="flex flex-col gap-8 items-center justify-between w-screen lg:w-auto h-screen lg:h-auto bg-custom-dark-gray px-20 py-14  lg:rounded">
        <h2 className="text-2xl px-10">Confirm Raffle Data </h2>
        <div className="flex flex-col text-lg">
          <div className="flex justify-between gap-8">
            <p>Selected NFTs</p>
            <div className="flex flex-col">
              {tokens &&
                tokens.map((token, index) => (
                  <p className="text-teal-500 leading-6" key={index}>
                    {token.name}
                  </p>
                ))}
            </div>
          </div>

          <div className="flex justify-between gap-8">
            <p>Date & Time</p>
            <p className="text-teal-500">
              {moment.isMoment(date) && date.format("M/D/YYYY HH:mm:ss")}
            </p>
          </div>
          <div className="flex justify-between gap-8">
            <p>Currency</p>
            <p className="text-teal-500">{currency}</p>
          </div>
          <div className="flex justify-between gap-8">
            <p>Tickets</p>
            <p className="text-teal-500">{tickets}</p>
          </div>
          <div className="flex justify-between gap-8">
            <p>Price</p>
            <p className="text-teal-500">{price}</p>
          </div>
        </div>
        <Button
          className="mt-4 mb-2 lg:mb-0"
          onClick={handleClick}
          isLoading={isLoading}
          loadText={"Creating Raffle"}
        >
          Confirm
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
