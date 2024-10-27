"use client";
import React from "react";
import { motion } from "framer-motion";

const Card = ({
  size = "lg",
  className,
  icon,
  motionProps = {},
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
  icon: React.ReactNode;
  motionProps?: any;
}) => {
  const sizes = {
    sm: {
      card: "h-28 md:h-40",
      icon: "w-20 md:w-24 mt-2 md:mt-0 ",
    },
    md: {
      card: "h-40 md:h-56",
      icon: "w-32",
    },
    lg: {
      card: "h-72 md:h-96",
      icon: "w-48",
    },
  };
  return (
    <motion.div
      {...motionProps}
      className={`${className} w-min absolute flex justify-center inset-x-0  m-auto`}
    >
      <div
        className={`flex flex-col bg-white rounded-2xl overflow-hidden aspect-[12/14] ${sizes[size].card} shadow-md relative `}
      >
        <div className="absolute top-2 right-2 px-2 py-1 bg-gray-300 w-fit rounded-full text-xxs font-bold text-gray-700">
          SVG
        </div>
        <div className={`w-full flex-1 flex items-center justify-center mt-4`}>
          <div className={sizes[size].icon}>{icon}</div>
        </div>
      </div>
    </motion.div>
  );
};

export default Card;
