import {
  Dispatch,
  FC,
  SetStateAction,
  TextareaHTMLAttributes,
  useState,
} from "react";

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  handleInput: Dispatch<SetStateAction<string>>;
}

const NumberInput: FC<Props> = (props: Props) => {
  const { handleInput, className, ...componentProps } = props;

  const [value, setValue] = useState<string>();

  const charLim: number = componentProps.maxLength ?? 100;

  //add max length check
  const onInput = (event: React.FormEvent<HTMLTextAreaElement>): void => {
    const val = (event.target as HTMLInputElement).value;
    setValue(val);
    handleInput(val);
  };

  return (
    <textarea
      id={componentProps.id}
      className={`${className} relative flex justify-between transition-colors duration-500 border bg-custom-black rounded items-center p-5 text-pink-200 
      ${value && value.length >= charLim ? "text-red-500" : ""} ${
        componentProps.disabled
          ? "cursor-not-allowed bg-custom-dark-gray border-custom-dark-gray"
          : "hover:border-pink-300 focus:border-pink-400 active:outline-none focus:outline-none border-dark"
      } resize `}
      onChange={(e) => onInput(e)}
      placeholder={componentProps.placeholder ?? ""}
      // type="text"
      maxLength={charLim}
      disabled={componentProps.disabled}
      cols={componentProps.cols ?? 20}
      rows={componentProps.rows ?? 4}
    />
  );
};

export default NumberInput;
