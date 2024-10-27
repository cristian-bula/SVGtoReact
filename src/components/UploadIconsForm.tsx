"use client";
import React, { useEffect, useRef } from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import {
  MaterialSymbolsSend,
  MaterialSymbolsUpload,
  TablerTrash,
} from "./icons";

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
      <div className="flex items-center justify-between bg-white max-w-xl w-full rounded-full px-6 py-3 shadow-lg text-sm md:text-base gap-8 md:gap-0">
        <label
          htmlFor="fileInput"
          className="flex items-center justify-center w-full md:w-auto px-4 py-2 bg-[#eef1ff] text-primary font-semibold rounded-full cursor-pointer hover:bg-[#cdd3ff] transition duration-200 ease-in-out relative"
        >
          <MaterialSymbolsUpload className="w-6 h-6 mr-2" />
          {files ? (
            <>
              <span className="hidden md:block text-sm">
                Files selected: {files.length}
              </span>
              <span className="md:hidden text-sm">Files: {files.length}</span>
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
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              setFiles(null);
            }}
            aria-label="Clean form"
            className="px-4 py-4 md:px-6 md:py-3 bg-white text-primary font-semibold rounded-full hover:bg-gray-100 transition ease-out duration-300 shadow"
          >
            <span className="hidden md:block">Clean</span>
            <span className="md:hidden">
              <TablerTrash />
            </span>
          </button>
          <button
            type="submit"
            aria-label="Submit form"
            className="px-4 md:px-6 md:py-3 bg-primary text-white font-semibold rounded-full hover:bg-[#5943e8] transition ease-out duration-300"
          >
            <span className="hidden md:block">Submit</span>
            <span className="md:hidden">
              <MaterialSymbolsSend />
            </span>
          </button>
        </div>
      </div>
    </form>
  );
}
