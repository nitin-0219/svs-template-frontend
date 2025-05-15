import React, { useState, useCallback, useRef } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Upload } from "lucide-react";

interface JsonInputFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}

const JsonInputField = ({
  label,
  name,
  value,
  onChange,
  error,
  placeholder = "Paste your JSON here...",
}: JsonInputFieldProps) => {
  const [useFileUpload, setUseFileUpload] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateJson = useCallback((jsonString: string) => {
    if (!jsonString.trim()) {
      setJsonError(null);
      return;
    }

    try {
      JSON.parse(jsonString);
      setJsonError(null);
    } catch (e) {
      setJsonError("Invalid JSON format");
    }
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    validateJson(newValue);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      try {
        // Validate JSON
        JSON.parse(text);
        onChange(text);
        setJsonError(null);
      } catch (e) {
        setJsonError("The uploaded file does not contain valid JSON");
      }
    } catch (e) {
      setJsonError("Error reading file");
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4 bg-white p-4 rounded-md border">
      <div className="flex justify-between items-center">
        <Label htmlFor={name} className="text-base font-medium">
          {label}
        </Label>
        <div className="flex items-center space-x-2">
          <Label htmlFor={`${name}-toggle`} className="text-sm">
            {useFileUpload ? "File Upload" : "Text Input"}
          </Label>
          <Switch
            id={`${name}-toggle`}
            checked={useFileUpload}
            onCheckedChange={setUseFileUpload}
          />
        </div>
      </div>

      {!useFileUpload ? (
        <div className="space-y-2">
          <Textarea
            id={name}
            name={name}
            value={value}
            onChange={handleTextChange}
            placeholder={placeholder}
            className={`min-h-[150px] font-mono ${jsonError || error ? "border-red-500" : value ? "border-green-500" : ""}`}
          />
          {(jsonError || error) && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{jsonError || error}</AlertDescription>
            </Alert>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div
            className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors ${jsonError || error ? "border-red-500" : value ? "border-green-500" : "border-gray-300"}`}
            onClick={triggerFileInput}
          >
            <input
              ref={fileInputRef}
              type="file"
              id={`${name}-file`}
              name={`${name}-file`}
              accept=".json,application/json"
              onChange={handleFileChange}
              className="hidden"
            />
            <Upload className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Click to upload a JSON file
            </p>
            {value && (
              <p className="mt-2 text-xs text-green-600">
                JSON file loaded successfully
              </p>
            )}
          </div>
          {(jsonError || error) && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{jsonError || error}</AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {value && !jsonError && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              onChange("");
              setJsonError(null);
            }}
          >
            Clear
          </Button>
        </div>
      )}
    </div>
  );
};

export default JsonInputField;
