import { FC, SVGProps, useState } from "react";
import { motion } from "framer-motion";

interface Props extends SVGProps<SVGSVGElement> {
  fillHover?: string;
  color?: string;
  hoverColor?: string;
}

const AddIcon: FC<Props> = (props: Props) => {
  const {
    hoverColor = "rgb(20 184 166)", //"rgb(239 68 6)", //"#c84e3a",
    className,
    color = "rgb(20 184 166)",
    ...componentProps
  } = props;

  const [didHover, setDidHover] = useState<boolean>(false);

  return (
    <div
      className={`cursor-pointer transition-all duration-200 ${className}`}
      onMouseEnter={() => setDidHover(true)}
      onMouseLeave={() => setDidHover(false)}
    >
      <svg
        width={componentProps.width ?? 24}
        height={componentProps.height ?? 24}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          d="M3 11C3 7.22876 3 5.34315 4.17157 4.17157C5.34315 3 7.22876 3 11 3H13C16.7712 3 18.6569 3 19.8284 4.17157C21 5.34315 21 7.22876 21 11V13C21 16.7712 21 18.6569 19.8284 19.8284C18.6569 21 16.7712 21 13 21H11C7.22876 21 5.34315 21 4.17157 19.8284C3 18.6569 3 16.7712 3 13V11Z"
          initial={{ stroke: color }}
          animate={{ stroke: didHover ? hoverColor : color }}
          strokeWidth="2"
        />
        <motion.path
          d="M12 8L12 16"
          strokeWidth="2"
          strokeLinecap="square"
          strokeLinejoin="round"
          initial={{ stroke: color }}
          animate={{ stroke: didHover ? hoverColor : color }}
        />
        <motion.path
          d="M16 12L8 12"
          strokeWidth="2"
          strokeLinecap="square"
          strokeLinejoin="round"
          initial={{ stroke: color }}
          animate={{ stroke: didHover ? hoverColor : color }}
        />
      </svg>
    </div>
  );
};

export default AddIcon;
