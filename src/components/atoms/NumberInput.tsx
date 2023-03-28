import { FC, InputHTMLAttributes } from "react";
import debounce from "lodash.debounce";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  supply: number;
  handleInput: (number: number) => void;
}

const NumberInput: FC<Props> = (props: Props) => {
  const { supply, handleInput, className, ...componentProps } = props;
  const debouncer = debounce((value) => handleInput(value), 1000);

  const styles: string = "w-56 h-10 bg-dark text-xs";

  //prevent keys
  const onKeyPress = (event: React.KeyboardEvent): void => {
    if (!/[0-9]/.test(event.key)) {
      event.preventDefault();
    }
  };

  //add max length check
  const onInput = (event: React.FormEvent<HTMLInputElement>): void => {
    if (Number((event.target as HTMLInputElement).value) > supply) {
      (event.target as HTMLInputElement).value = supply.toString();
    } else {
      debouncer(Number((event.target as HTMLInputElement).value));
    }
  };

  return (
    <div>
      <input
        className={`${className} relative flex justify-between ${styles} transition-all duration-500 border border-dark hover:border-orange-300 focus:border-red-400 active:outline-none focus:outline-none rounded items-center p-2 ${
          componentProps.disabled ? "cursor-not-allowed" : ""
        }`}
        onKeyPress={(e) => onKeyPress(e)}
        onInput={(e) => onInput(e)}
        placeholder="Enter ID"
        type="number"
        min={1}
        max={supply}
        disabled={componentProps.disabled}
      />
    </div>
  );
};

export default NumberInput;
