import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileUploaderProps {
  onFileChange: (file: File | null) => void;
  acceptedFileTypes?: string | string[];
  maxSize?: number;
  label?: string;
  errorMessage?: string;
  selectedFile?: File | null;
}

const FileUploader = ({
  onFileChange,
  acceptedFileTypes = ["application/pdf"],
  maxSize = 5242880, // 5MB default
  label = "Upload PDF Template",
  errorMessage,
  selectedFile = null,
}: FileUploaderProps) => {
  const [file, setFile] = useState<File | null>(selectedFile);
  const [error, setError] = useState<string | null>(errorMessage || null);
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (rejectedFiles.length > 0) {
        const rejectionErrors = rejectedFiles[0].errors.map((err: any) => {
          if (err.code === "file-invalid-type") {
            return "Invalid file type. Please upload a PDF file.";
          }
          if (err.code === "file-too-large") {
            return `File is too large. Maximum size is ${maxSize / 1024 / 1024}MB.`;
          }
          return err.message;
        });
        setError(rejectionErrors.join(", "));
        return;
      }

      if (acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0];
        setFile(selectedFile);
        setError(null);
        onFileChange(selectedFile);
      }
    },
    [maxSize, onFileChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: Array.isArray(acceptedFileTypes)
      ? acceptedFileTypes.reduce(
          (acc, type) => {
            acc[type] = [];
            return acc;
          },
          {} as Record<string, string[]>,
        )
      : { [acceptedFileTypes as string]: [] },
    maxSize,
    multiple: false,
  });

  const removeFile = () => {
    setFile(null);
    onFileChange(null);
  };

  React.useEffect(() => {
    setIsDragging(isDragActive);
  }, [isDragActive]);

  React.useEffect(() => {
    if (errorMessage) {
      setError(errorMessage);
    }
  }, [errorMessage]);

  return (
    <div className="w-full bg-white">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      {!file ? (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-gray-300 hover:border-primary/50",
            error ? "border-red-400 bg-red-50" : "",
          )}
        >
          <input {...getInputProps()} data-testid="file-input" />
          <div className="flex flex-col items-center justify-center text-center">
            <Upload className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 font-medium">
              Drag & drop your PDF file here, or click to browse
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PDF files only, max {maxSize / 1024 / 1024}MB
            </p>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-md">
                <FileIcon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium truncate max-w-[250px] sm:max-w-md">
                  {file.name}
                </span>
                <span className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                removeFile();
              }}
              className="text-gray-500 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {error && <div className="mt-1 text-sm text-red-500">{error}</div>}
    </div>
  );
};

export default FileUploader;
