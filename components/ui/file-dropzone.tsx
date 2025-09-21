import React, { useRef } from "react";

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({ onFileSelect }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = React.useState(false);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
        dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"
      }`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleChange}
        accept=".pdf,.doc,.docx,.txt"
      />
      <span className="text-lg font-medium mb-2">
        Drag & drop your file here
      </span>
      <span className="text-sm text-gray-500">or click to select a file</span>
    </div>
  );
};
