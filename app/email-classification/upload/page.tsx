"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileDropzone } from "@/components/ui/file-dropzone";
import { apiClient } from "@/lib/api";

const UploadPage = () => {
  const [collectionName, setCollectionName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({
    type: null,
    message: "",
  });

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    // Clear any previous status when new file is selected
    setUploadStatus({ type: null, message: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectionName || !selectedFile) return;

    setUploading(true);
    setUploadStatus({ type: null, message: "" });

    try {
      const response = await apiClient.uploadDocument(
        selectedFile,
        collectionName
      );

      setUploadStatus({
        type: "success",
        message: `Document uploaded successfully! ${
          response.document_id ? `Document ID: ${response.document_id}` : ""
        }`,
      });

      // Reset form on success
      setCollectionName("");
      setSelectedFile(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload document";
      setUploadStatus({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setUploading(false);
    }
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

        {/* Upload Status */}
        {uploadStatus.type && (
          <div
            className={`p-4 rounded-md ${
              uploadStatus.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            <p className="text-sm font-medium">
              {uploadStatus.type === "success" ? "✅ Success:" : "❌ Error:"}
            </p>
            <p className="text-sm mt-1">{uploadStatus.message}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={!collectionName || !selectedFile || uploading}
          className="mt-4 px-6 py-3 text-base font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow transition-all"
        >
          {uploading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Uploading...
            </div>
          ) : (
            "Upload Document"
          )}
        </Button>
      </form>
    </div>
  );
};

export default UploadPage;
