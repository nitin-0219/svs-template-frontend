import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Pen,
  Type,
  Calendar as CalendarIcon,
  Move,
  Save,
  Video,
  Mic,
  Image,
  FileSignature,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PdfEditorProps {
  pdfFile: File | null;
  onSave: (config: string, fabric: string) => void;
}

interface ControlItem {
  id: string;
  type: "signature" | "text" | "date" | "signblock";
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  label: string;
  required: boolean;
  captureOptions?: {
    video: boolean;
    audio: boolean;
    image: boolean;
    signature: boolean;
  };
}

const PdfEditor: React.FC<PdfEditorProps> = ({ pdfFile, onSave }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [scale, setScale] = useState(1);
  const [selectedTool, setSelectedTool] = useState<
    "signature" | "text" | "date" | "signblock" | "move" | null
  >(null);
  const [controlItems, setControlItems] = useState<ControlItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLDivElement>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  // Load PDF when file changes
  useEffect(() => {
    if (pdfFile) {
      const url = URL.createObjectURL(pdfFile);
      setPdfUrl(url);

      // In a real implementation, you would use a PDF.js library to get total pages
      // For this example, we'll just set it to 1
      setTotalPages(1);

      return () => URL.revokeObjectURL(url);
    }
  }, [pdfFile]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!selectedTool || !canvasRef.current || selectedTool === "move") return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    const newItem: ControlItem = {
      id: `${selectedTool}-${Date.now()}`,
      type: selectedTool,
      x,
      y,
      width:
        selectedTool === "signature" || selectedTool === "signblock"
          ? 200
          : 150,
      height:
        selectedTool === "signature"
          ? 80
          : selectedTool === "signblock"
            ? 120
            : 40,
      page: currentPage,
      label: `${selectedTool.charAt(0).toUpperCase() + selectedTool.slice(1)} Field`,
      required: false,
      ...(selectedTool === "signblock" && {
        captureOptions: {
          video: true,
          audio: true,
          image: true,
          signature: true,
        },
      }),
    };

    setControlItems([...controlItems, newItem]);
    setSelectedItem(newItem.id);
  };

  const handleItemMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedItem(id);

    if (selectedTool === "move") {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedItem || !canvasRef.current) return;

    const dx = (e.clientX - dragStart.x) / scale;
    const dy = (e.clientY - dragStart.y) / scale;

    setControlItems((items) =>
      items.map((item) => {
        if (item.id === selectedItem) {
          return { ...item, x: item.x + dx, y: item.y + dy };
        }
        return item;
      }),
    );

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const deleteSelectedItem = () => {
    if (selectedItem) {
      setControlItems((items) =>
        items.filter((item) => item.id !== selectedItem),
      );
      setSelectedItem(null);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Delete" || e.key === "Backspace") {
      deleteSelectedItem();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedItem]);

  const generateConfig = () => {
    const config = {
      version: "1.0",
      fields: controlItems.map((item) => ({
        id: item.id,
        type: item.type,
        page: item.page,
        position: { x: item.x, y: item.y },
        size: { width: item.width, height: item.height },
        label: item.label,
        required: item.required,
        ...(item.type === "signblock" && {
          captureOptions: item.captureOptions,
        }),
      })),
    };

    return JSON.stringify(config, null, 2);
  };

  const generateFabric = () => {
    // In a real implementation, this would generate fabric.js compatible JSON
    // For this example, we'll create a simplified version
    const fabric = {
      version: "5.3.0",
      objects: controlItems.map((item) => ({
        type:
          item.type === "signature"
            ? "rect"
            : item.type === "text"
              ? "textbox"
              : item.type === "signblock"
                ? "group"
                : "rect",
        left: item.x,
        top: item.y,
        width: item.width,
        height: item.height,
        fill:
          item.type === "signblock" ? "rgba(0,0,255,0.05)" : "rgba(0,0,0,0.1)",
        stroke: item.type === "signblock" ? "#6200EA" : "#0000FF",
        strokeWidth: item.type === "signblock" ? 2 : 1,
        metadata: {
          fieldType: item.type,
          fieldId: item.id,
          required: item.required,
          ...(item.type === "signblock" && {
            captureOptions: item.captureOptions,
          }),
        },
      })),
    };

    return JSON.stringify(fabric, null, 2);
  };

  const handleSave = () => {
    const config = generateConfig();
    const fabric = generateFabric();
    onSave(config, fabric);
  };

  return (
    <div className="flex flex-col h-full bg-white border rounded-md">
      <div className="flex justify-between items-center p-2 border-b">
        <div className="flex space-x-2 flex-wrap gap-2">
          <Button
            variant={selectedTool === "signature" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTool("signature")}
          >
            <Pen className="h-4 w-4 mr-1" /> Signature
          </Button>
          <Button
            variant={selectedTool === "text" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTool("text")}
          >
            <Type className="h-4 w-4 mr-1" /> Text
          </Button>
          <Button
            variant={selectedTool === "date" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTool("date")}
          >
            <CalendarIcon className="h-4 w-4 mr-1" /> Date
          </Button>
          <Button
            variant={selectedTool === "signblock" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTool("signblock")}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
          >
            <Pen className="h-4 w-4 mr-1" /> SignBlock
          </Button>
          <Button
            variant={selectedTool === "move" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTool("move")}
          >
            <Move className="h-4 w-4 mr-1" /> Move
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button variant="default" size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" /> Save Template
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div
          className="flex-1 overflow-auto p-4 bg-gray-100"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <div
            ref={pdfContainerRef}
            className="relative mx-auto bg-white shadow-lg"
            style={{ width: "612px", height: "792px" }} // US Letter size
          >
            {pdfUrl ? (
              <>
                <div
                  ref={canvasRef}
                  className="absolute inset-0 cursor-crosshair"
                  onClick={handleCanvasClick}
                >
                  {controlItems
                    .filter((item) => item.page === currentPage)
                    .map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          "absolute border-2 flex items-center justify-center",
                          selectedItem === item.id
                            ? "border-blue-500"
                            : "border-gray-400",
                          item.type === "signature"
                            ? "bg-blue-50"
                            : item.type === "text"
                              ? "bg-green-50"
                              : item.type === "date"
                                ? "bg-yellow-50"
                                : "bg-gradient-to-br from-blue-50 to-purple-50",
                        )}
                        style={{
                          left: `${item.x}px`,
                          top: `${item.y}px`,
                          width: `${item.width}px`,
                          height: `${item.height}px`,
                        }}
                        onMouseDown={(e) => handleItemMouseDown(e, item.id)}
                      >
                        <span className="text-xs font-medium opacity-70">
                          {item.type === "signature"
                            ? "Signature"
                            : item.type === "text"
                              ? "Text Field"
                              : item.type === "date"
                                ? "Date Field"
                                : "SignBlock"}
                        </span>
                        {item.type === "signblock" && (
                          <div className="absolute bottom-1 right-1 flex space-x-1">
                            {item.captureOptions?.video && (
                              <Video className="h-3 w-3 text-blue-500" />
                            )}
                            {item.captureOptions?.audio && (
                              <Mic className="h-3 w-3 text-red-500" />
                            )}
                            {item.captureOptions?.image && (
                              <Image className="h-3 w-3 text-green-500" />
                            )}
                            {item.captureOptions?.signature && (
                              <FileSignature className="h-3 w-3 text-purple-500" />
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
                <iframe
                  src={`${pdfUrl}#page=${currentPage}`}
                  className="w-full h-full pointer-events-none"
                  title="PDF Preview"
                />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
                Please upload a PDF file first
              </div>
            )}
          </div>
        </div>

        <div className="w-64 border-l p-4 overflow-y-auto">
          <h3 className="font-medium mb-2">Template Fields</h3>
          {controlItems.length === 0 ? (
            <p className="text-sm text-gray-500">
              No fields added yet. Use the tools above to add fields to your
              template.
            </p>
          ) : (
            <div className="space-y-2">
              {controlItems.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "p-2 border rounded-md cursor-pointer",
                    selectedItem === item.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200",
                  )}
                  onClick={() => setSelectedItem(item.id)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">
                      {item.type === "signature"
                        ? "Signature"
                        : item.type === "text"
                          ? "Text Field"
                          : item.type === "date"
                            ? "Date Field"
                            : "SignBlock"}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setControlItems((items) =>
                          items.filter((i) => i.id !== item.id),
                        );
                        if (selectedItem === item.id) setSelectedItem(null);
                      }}
                    >
                      ×
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Page {item.page}, Position: ({Math.round(item.x)},{" "}
                    {Math.round(item.y)})
                  </div>
                  {item.type === "signblock" && (
                    <div className="flex items-center gap-2 mt-2 border-t pt-1">
                      <div className="text-xs font-medium">Capture:</div>
                      <div className="flex space-x-1">
                        <div className="flex items-center" title="Video">
                          <Video className="h-3 w-3 text-blue-500" />
                        </div>
                        <div className="flex items-center" title="Audio">
                          <Mic className="h-3 w-3 text-red-500" />
                        </div>
                        <div className="flex items-center" title="Image">
                          <Image className="h-3 w-3 text-green-500" />
                        </div>
                        <div className="flex items-center" title="Signature">
                          <FileSignature className="h-3 w-3 text-purple-500" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfEditor;
