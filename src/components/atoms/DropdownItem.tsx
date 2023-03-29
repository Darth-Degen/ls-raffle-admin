import { FC } from "react";
import { motion, Variants } from "framer-motion";

interface Props {
  item: string;
  handleSelect: (id: number) => void;
  variants: Variants;
  index: number;
}

const DropdownItem: FC<Props> = (props: Props) => {
  const { item, handleSelect, variants, index } = props;
  const styles: string = "w-48 h-10 bg-custom-dark-gray  text-sm z-50";

  return (
    <li
      key={index}
      className={`${styles} px-2 cursor-pointer flex items-center hover:bg-custom-black transition-colors duration-300 uppercase`}
      onClick={() => handleSelect(index)}
    >
      <motion.span variants={variants}>
        {/* {item.id < 10 ? `00${item.id + 1}` : `0${item.id + 1}`} */}
        {item}
      </motion.span>
    </li>
  );
};

export default DropdownItem;
