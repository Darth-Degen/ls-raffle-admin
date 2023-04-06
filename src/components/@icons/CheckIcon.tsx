import { FC, SVGProps } from "react";

interface Props extends SVGProps<SVGSVGElement> {
  size?: number;
}

const ExpIcon: FC<Props> = (props: Props) => {
  const { size = 28, className, onClick } = props;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      onClick={onClick}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="#2A4157"
        fillOpacity="0.24"
        stroke="#14b8a6"
        strokeWidth="1.2"
      />
      <path d="M8 12L11 15L16 9" stroke="#14b8a6" strokeWidth="1.2" />
    </svg>
  );
};

export default ExpIcon;
