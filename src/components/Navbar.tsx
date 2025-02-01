import React from "react";
import { PhDotsThreeOutlineFill } from "@/components/icons";
import { GITHBUB_URL } from "@/constants/common";

const Navbar = () => {
  return (
    <nav className="flex justify-between py-3 items-center">
      <PhDotsThreeOutlineFill className="w-16 h-16" />
      <a
        href={GITHBUB_URL}
        target="_blank"
        className="px-4 py-2 border-2 border-black rounded-full h-min"
      >
        Contact
      </a>
    </nav>
  );
};

export default Navbar;
