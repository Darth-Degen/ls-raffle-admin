import { FC, InputHTMLAttributes } from "react";
import debounce from "lodash.debounce";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  handleInput: (number: number) => void;
  useDecimals?: boolean;
}

const NumberInput: FC<Props> = (props: Props) => {
  const {
    handleInput,
    useDecimals = false,
    className,
    ...componentProps
  } = props;
  const debouncer = debounce((value) => handleInput(value), 1000);

  const max = componentProps.max ?? 1000;

  //prevent keys
  const onKeyPress = (event: React.KeyboardEvent): void => {
    if (useDecimals && !/[0-9.]/.test(event.key)) {
      event.preventDefault();
    } else if (!useDecimals && !/[0-9]/.test(event.key)) {
      event.preventDefault();
    }
  };

  //add max length check
  const onInput = (event: React.FormEvent<HTMLInputElement>): void => {
    console.log("input ", (event.target as HTMLInputElement).value);
    if (Number((event.target as HTMLInputElement).value) > max) {
      (event.target as HTMLInputElement).value = max.toString();
    } else {
      debouncer(Number((event.target as HTMLInputElement).value));
    }
  };

  return (
    <div>
      <input
        className={`${className} rounded border-2 border-gray-400 h-10 w-40 px-2 bg-custom-dark-gray focus:outline-teal-600 ${
          componentProps.disabled ? "cursor-not-allowed" : ""
        }`}
        onKeyPress={(e) => onKeyPress(e)}
        onInput={(e) => onInput(e)}
        placeholder={componentProps.placeholder}
        type={"number"}
        min={1}
        max={max}
        disabled={componentProps.disabled}
      />
    </div>
  );
};

export default NumberInput;
