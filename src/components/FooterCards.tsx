import React from "react";
import Card from "./Card";
import {
  NounRune1Icon,
  NounRune2Icon,
  NounRune3Icon,
  NounRune4Icon,
  NounRune5Icon,
  NounRune6Icon,
} from "./icons";

const FooterCards = () => {
  return (
    <div className="flex justify-center items-center my-10 md:my-24 h-96 relative select-none">
      <Card
        className="z-30"
        size="lg"
        icon={<NounRune6Icon className="mt-6 md:mt-12" />}
      />

      <Card
        className="z-50 top-0 md:-top-12"
        size="sm"
        icon={<NounRune1Icon />}
      />

      {/* Inside Cards */}
      <Card
        className="z-40 top-8 md:-top-2 right-44 md:right-52"
        size="sm"
        icon={<NounRune2Icon />}
      />
      <Card
        className="z-40 top-8 md:-top-2 left-44 md:left-52"
        size="sm"
        icon={<NounRune3Icon />}
      />
      {/* Outside cards */}
      <Card
        className="z-10 right-[250px] md:right-[400px] top-32 md:top-24 -rotate-12"
        size="sm"
        icon={<NounRune4Icon />}
      />
      <Card
        className="z-10 left-[250px] md:left-[400px] top-32 md:top-24 rotate-12"
        size="sm"
        icon={<NounRune5Icon />}
      />
      <div className="absolute bottom-16 md:bottom-6 left-1/2 transform -translate-x-1/2 text-center z-30">
        <p className="text-lg font-semibold">ReactToSvg</p>
        <p className="text-sm text-gray-500">Contact Us for Details</p>
      </div>
    </div>
  );
};

export default FooterCards;
