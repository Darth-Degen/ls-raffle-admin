import { FC, SVGProps, useState } from "react";
import { motion } from "framer-motion";

interface Props extends SVGProps<SVGSVGElement> {
  fillHover?: string;
  color?: string;
  hoverColor?: string;
}

const MenuIcon: FC<Props> = (props: Props) => {
  const { hoverColor = "#fdba74", className, color = "#d1d5db" } = props;

  const [didHover, setDidHover] = useState<boolean>(false);

  return (
    <div
      className="cursor-pointer transition-all duration-200 rounded h-min p-2"
      onMouseEnter={() => setDidHover(true)}
      onMouseLeave={() => setDidHover(false)}
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${className} `}
      >
        <motion.path
          d="M5 7H19"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ stroke: color }}
          animate={{ stroke: didHover ? hoverColor : color }}
        />
        <motion.path
          d="M5 12H15"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ stroke: color }}
          animate={{ stroke: didHover ? hoverColor : color }}
        />
        <motion.path
          d="M5 17H11"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ stroke: color }}
          animate={{ stroke: didHover ? hoverColor : color }}
        />
      </svg>
    </div>
  );
};

export default MenuIcon;
