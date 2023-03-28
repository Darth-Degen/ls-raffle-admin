import { FC } from "react";
import { Logo } from "@components";
import Image from "next/image";

const Header: FC = () => {
  return (
    <div className="px-4 lg:px-10 py-4 lg:py-8 flex justify-between relative w-full font-primary text-2xl">
      <Logo />
    </div>
  );
};

export default Header;
