import { ReactNode, FC } from "react";

interface Props {
  label?: string;
  children: ReactNode;
}
const InputWrapper: FC<Props> = (props: Props) => {
  const { label, children } = props;

  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs">{label}</p>
      {children}
    </div>
  );
};

export default InputWrapper;
