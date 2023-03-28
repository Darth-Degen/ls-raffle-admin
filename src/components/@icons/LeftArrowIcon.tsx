import { FC } from "react";

interface Props {
  color?: string;
}

const ArrowIcon: FC<Props> = (props: Props) => {
  const { color = "#121212" } = props;
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      key="down-arrow"
    >
      <path d="M15 6L9 12L15 18" stroke={color} strokeWidth="2" />
    </svg>
  );
};

export default ArrowIcon;
