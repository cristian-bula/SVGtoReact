import React from "react";
import { PhDotsThreeOutlineFill } from "@/components/icons";

const Navbar = () => {
  return (
    <nav className="flex justify-between py-3 items-center">
      <PhDotsThreeOutlineFill className="w-16 h-16" />
      <button className="px-4 py-2 border-2 border-black rounded-full h-min">
        Contacto
      </button>
    </nav>
  );
};

export default Navbar;
