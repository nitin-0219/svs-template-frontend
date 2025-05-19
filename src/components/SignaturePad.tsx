import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Eraser, Save } from "lucide-react";

interface SignaturePadProps {
  onChange: (signatureDataUrl: string) => void;
  value?: string;
  height?: number;
  width?: number;
  backgroundColor?: string;
  penColor?: string;
}

const SignaturePad: React.FC<SignaturePadProps> = ({
  onChange,
  value,
  height = 200,
  width = 400,
  backgroundColor = "#ffffff",
  penColor = "#000000",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    // Set canvas background
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Set drawing style
    context.lineWidth = 2.5;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = penColor;

    // If there's an initial value, draw it
    if (value) {
      const img = new Image();
      img.onload = () => {
        context.drawImage(img, 0, 0);
        setIsEmpty(false);
      };
      img.src = value;
    }
  }, [backgroundColor, penColor, value]);

  const startDrawing = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    setIsDrawing(true);
    setIsEmpty(false);

    const rect = canvas.getBoundingClientRect();
    const x =
      e instanceof MouseEvent
        ? e.clientX - rect.left
        : e.touches[0].clientX - rect.left;
    const y =
      e instanceof MouseEvent
        ? e.clientY - rect.top
        : e.touches[0].clientY - rect.top;

    context.beginPath();
    context.moveTo(x, y);
  };

  const draw = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const rect = canvas.getBoundingClientRect();
    const x =
      e instanceof MouseEvent
        ? e.clientX - rect.left
        : e.touches[0].clientX - rect.left;
    const y =
      e instanceof MouseEvent
        ? e.clientY - rect.top
        : e.touches[0].clientY - rect.top;

    context.lineTo(x, y);
    context.stroke();
  };

  const endDrawing = () => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.closePath();
    setIsDrawing(false);

    // Save signature as data URL and call onChange
    const dataUrl = canvas.toDataURL("image/png");
    onChange(dataUrl);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    onChange("");
  };

  return (
    <div className="flex flex-col items-center bg-white rounded-md border p-4">
      <div className="border border-gray-300 rounded-md mb-2 bg-white">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="touch-none cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
        />
      </div>
      <div className="flex justify-between w-full mt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearSignature}
          disabled={isEmpty}
        >
          <Eraser className="h-4 w-4 mr-1" /> Clear
        </Button>
        <div className="text-xs text-gray-500 flex items-center">
          Sign above using mouse or touch
        </div>
      </div>
    </div>
  );
};

export default SignaturePad;
