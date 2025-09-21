"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileDropzone } from "@/components/ui/file-dropzone";

const UploadPage = () => {
  const [collectionName, setCollectionName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectionName || !selectedFile) return;
    setUploading(true);
    // TODO: Implement upload logic here
    setTimeout(() => {
      setUploading(false);
      alert("File uploaded successfully!");
    }, 1500);
  };

  return (
    <div className=" mt-12 p-8 bg-white rounded-xl shadow-lg border flex flex-col gap-6">
      <h2 className="text-2xl font-bold mb-2 text-gray-800">Upload Document</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <label
            htmlFor="collection-name"
            className="block text-base font-medium mb-2 text-gray-700"
          >
            Collection Name
          </label>
          <Input
            id="collection-name"
            type="text"
            placeholder="Enter collection name..."
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
            className="text-base"
            required
          />
        </div>
        <div>
          <label className="block text-base font-medium mb-2 text-gray-700">
            Document File
          </label>
          <FileDropzone onFileSelect={handleFileSelect} />
          {selectedFile && (
            <div className="mt-2 text-sm text-green-600">
              Selected: {selectedFile.name}
            </div>
          )}
        </div>
        <Button
          type="submit"
          disabled={!collectionName || !selectedFile || uploading}
          className="mt-4 px-6 py-3 text-base font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow transition-all"
        >
          {uploading ? "Uploading..." : "Upload"}
        </Button>
      </form>
    </div>
  );
};

export default UploadPage;
