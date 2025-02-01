"use client";
import React from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  MaterialSymbolsSend,
  MaterialSymbolsUpload,
  TablerTrash,
} from "./icons";
import JSZip from "jszip";

export default function UploadIconsForm() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [options, setOptions] = useState<{
    generateIndex: boolean;
    isTypescript: boolean;
    copyIndexToClipboard: boolean;
  }>({
    generateIndex: false,
    isTypescript: true,
    copyIndexToClipboard: true,
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(event.target.files);
  };

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setOptions((prevOptions) => ({
      ...prevOptions,
      [name]: checked,
    }));
  };

  const copyToClipboard = async (blob: Blob) => {
    const index = options.isTypescript ? "index.ts" : "index.js";
    try {
      const zip = await JSZip.loadAsync(blob);
      const indexFile = zip.file(index);
      if (!indexFile) throw new Error(`${index} not found in zip`);

      const indexContent = await indexFile.async("text");
      await navigator.clipboard.writeText(indexContent);
      toast.success(`${index} copied to clipboard`);
    } catch (error) {
      toast.error(`Failed to copy ${index}`);
    }
  };

  const deleteIndex = async (blob: Blob) => {
    const index = options.isTypescript ? "index.ts" : "index.js";
    try {
      const zip = await JSZip.loadAsync(blob);
      zip.remove(index);
      const updatedBlob = await zip.generateAsync({ type: "blob" });
      return updatedBlob;
    } catch (error) {
      toast.error("Failed to delete index");
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!files) {
      toast.error("Please select at least one SVG file.");
      return;
    }

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));
    formData.append("options", JSON.stringify(options));

    const toastMsg = toast.loading("Processing files...");
    try {
      const response = await fetch("/api/icons", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to process files");
      let blob = await response.blob();
      if (options.copyIndexToClipboard) {
        await copyToClipboard(blob);
      }
      if (!options.generateIndex) {
        const updatedBlob = await deleteIndex(blob);
        if (!updatedBlob) throw new Error("Failed to delete index");
        blob = updatedBlob;
      }
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `icons.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.dismiss(toastMsg);
      setFiles(null);
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
      className="flex flex-col justify-center items-center mt-10"
    >
      <div className="flex items-center justify-between bg-white max-w-2xl w-full rounded-full px-6 py-3 shadow-lg text-sm md:text-base gap-8 md:gap-0">
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
      <div className="mt-4 w-full max-w-2xl bg-white p-6 rounded-lg shadow-lg space-y-2">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="isTypescript"
            checked={options.isTypescript}
            onChange={handleOptionChange}
            className="form-checkbox h-5 w-5 accent-primary"
          />
          <span>Use Typescript</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="copyIndexToClipboard"
            checked={options.copyIndexToClipboard}
            onChange={handleOptionChange}
            className="form-checkbox h-5 w-5 accent-primary"
          />
          <span>Copy Index to Clipboard</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="generateIndex"
            checked={options.generateIndex}
            onChange={handleOptionChange}
            className="form-checkbox h-5 w-5 accent-primary"
          />
          <span>Generate Index File</span>
        </label>
      </div>
    </form>
  );
}
