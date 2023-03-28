import { FC, InputHTMLAttributes, useEffect, useState } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  handleToggle: (value: boolean) => void;
}

const CheckBox: FC<Props> = (props: Props) => {
  const { label, handleToggle, className, ...componentProps } = props;
  const [checked, setChecked] = useState<boolean>(true);

  const styles: string = "w-56 h-10 bg-dark text-xs";

  //add max length check
  const onChange = (): void => {
    setChecked(!checked);
  };

  useEffect(() => {
    handleToggle(checked);
  }, [checked, handleToggle]);

  return (
    <div
      className={`${className} relative flex justify-between ${styles} transition-all duration-200 border  rounded items-center p-2 text-gray-400 ${
        componentProps.disabled
          ? "cursor-not-allowed bg-custom-dark-gray border-custom-dark-gray"
          : "hover:border-orange-300 active:border-red-400 cursor-pointer border-dark "
      }`}
      onClick={() => onChange()}
    >
      <p className="">{label}</p>
      <input
        onChange={() => onChange()}
        placeholder="Add Text"
        type="checkbox"
        checked={checked}
        className="accent-red-300 cursor-pointer"
        disabled={componentProps.disabled}
      />
    </div>
  );
};

export default CheckBox;
