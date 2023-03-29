import {
  dropdownAnimations,
  dropdownItemsAnimations,
  fastExitAnimation,
} from "@constants";
import { DropdownButton, DropdownItem } from "@components";
import { Dispatch, FC, SetStateAction } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  handleSelect: (id: number) => void;
  setShowDropdown: Dispatch<SetStateAction<boolean>>;
  showDropdown: boolean;
  label: string;
  items: string[];
}

const Dropdown: FC<Props> = (props: Props) => {
  const { handleSelect, setShowDropdown, showDropdown, label, items } = props;

  return (
    <div
      onClick={() => setShowDropdown(!showDropdown)}
      onMouseLeave={() => setShowDropdown(false)}
    >
      <DropdownButton isActive={showDropdown} label={label} />
      <AnimatePresence mode="wait">
        {showDropdown && (
          <motion.div
            {...fastExitAnimation}
            key="dropdown-list"
            className="absolute z-50 pt-2"
          >
            <motion.div
              variants={dropdownAnimations}
              initial="hidden"
              animate="show"
            >
              <motion.ul className="rounded divide-y divide-gray-400 border border-gray-400 max-h-[240px] overflow-y-scroll z-50 bg-custom-light">
                {items &&
                  items.map((item: string, index) => (
                    <DropdownItem
                      item={item}
                      handleSelect={handleSelect}
                      key={index}
                      index={index}
                      variants={dropdownItemsAnimations}
                    />
                  ))}
              </motion.ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dropdown;
