import React from "react";
import UploadIconsForm from "@/components/UploadIconsForm";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FooterCards from "@/components/FooterCards";

const Page = () => {
  return (
    <>
      <Navbar />
      <HeroSection />
      <UploadIconsForm />
      <FooterCards />
    </>
  );
};

export default Page;
