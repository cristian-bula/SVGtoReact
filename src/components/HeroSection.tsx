import React from "react";

const HeroSection = () => {
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-5xl md:text-7xl font-bold mb-6 md:mb-8">
        SVGtoReact
      </h1>
      <p className="text-center text-sm md:text-base max-w-4xl text-gray-800">
        SVGtoReact Converter is an easy-to-use tool that converts your SVG files
        into ready-to-use TSX components for React applications. Simply upload
        your SVG icons, and our platform automatically optimizes and organizes
        the files. Enhance your workflow and streamline your development with
        SVGtoReact.
      </p>
    </div>
  );
};

export default HeroSection;
