"use client";
import React, { useEffect, useRef } from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import { MaterialSymbolsUpload } from "./icons";

export default function UploadIconsForm() {
  const [files, setFiles] = useState<FileList | null>(null);
  const userId = useRef("");

  useEffect(() => {
    userId.current = uuidv4();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(event.target.files);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!files) {
      toast.error("Please select at least one SVG file.");
      return;
    }

    const formData = new FormData();
    formData.append("userId", userId.current);
    Array.from(files).forEach((file) => formData.append("files", file));
    const toastMsg = toast.loading("Processing files...");
    try {
      const response = await fetch("/api/icons", {
        method: "POST",
        body: formData,
      });
      await new Promise((res) => setTimeout(res, 500));

      if (!response.ok) throw new Error("Failed to process files");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `icons.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.dismiss(toastMsg);
      toast.success("Files processed successfully");
    } catch (error) {
      console.error("Error processing files:", error);
      toast.dismiss(toastMsg);
      toast.error("Failed to process files.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      encType="multipart/form-data"
      className="flex justify-center items-center mt-10"
    >
      <div className="flex items-center justify-between bg-white max-w-xl w-full rounded-full px-6 py-3 shadow-lg text-sm md:text-base gap-12 md:gap-0">
        <div className="flex">
          <label
            htmlFor="fileInput"
            className="flex items-center justify-center w-full md:w-auto px-4 py-2 bg-[#eef1ff] text-primary font-semibold rounded-full cursor-pointer hover:bg-[#cdd3ff] transition duration-200 ease-in-out relative"
          >
            <MaterialSymbolsUpload className="w-6 h-6 mr-2" />
            {files ? (
              <>
              <span className="hidden md:block text-sm"> Files selected: {files.length}</span>
              <span className="md:hidden text-sm"> Files: {files.length}</span>
              </>
            ) : (
              <>
                <span className="hidden md:block">Choose SVG Files</span>
                <span className="md:hidden">Choose SVG</span>
              </>
            )}

            <input
              type="file"
              id="fileInput"
              accept=".svg"
              multiple
              onChange={handleFileChange}
              required
              className="hidden"
            />
          </label>
          {/* {files && (
            <button
              className="rounded-full bg-white px-1.5 leading-none shadow-2xl"
              onClick={() => setFiles(null)}
            >
              clean
            </button>
          )} */}
        </div>

        <button
          type="submit"
          className="md:mt-0 md:ml-4 px-6 py-3 bg-primary text-white font-semibold rounded-full hover:bg-[#5943e8] transition duration-200 ease-in-out"
        >
          Submit
        </button>
      </div>
    </form>
  );
}
