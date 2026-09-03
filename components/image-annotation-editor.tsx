"use client";

import React, { useState, useRef, useEffect } from "react";
import { Canvas as FabricCanvas, Image as FabricImage, Text as FabricText } from "fabric";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Copy, Trash2 } from "lucide-react";
import { TextAnnotation, DrawingAnnotation, Annotation } from "@/types/media";
import { cn } from "@/lib/utils";

interface ImageAnnotationEditorProps {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  initialAnnotations?: Annotation;
  onAnnotationsChange: (annotations: Annotation) => void;
}

export function ImageAnnotationEditor({
  imageUrl,
  imageWidth,
  imageHeight,
  initialAnnotations = { textAnnotations: [], drawingAnnotations: [] },
  onAnnotationsChange,
}: ImageAnnotationEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  
  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>(
    initialAnnotations.textAnnotations || []
  );
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [tool, setTool] = useState<"text" | "select" | "delete">("select");
  const [textColor, setTextColor] = useState("#000000");
  const [fontSize, setFontSize] = useState(16);

  const displayWidth = 600;
  const scaleX = displayWidth / imageWidth;
  const displayHeight = imageHeight * scaleX;

  // Initialize Fabric canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new FabricCanvas(canvasRef.current, {
      width: displayWidth,
      height: displayHeight,
      backgroundColor: "#f3f4f6",
    });

    fabricCanvasRef.current = fabricCanvas;

    // Load background image - Fabric.js v5 API
    FabricImage.fromURL(imageUrl)
      .then((img) => {
        img.scaleToWidth(displayWidth);
        fabricCanvas.backgroundImage = img;
        fabricCanvas.renderAll();
      })
      .catch((error) => {
        console.error("Failed to load image:", error);
      });

    // Handle canvas click for adding text
    fabricCanvas.on("mouse:down", (e: any) => {
      if (tool !== "text") return;
      
      const pointer = fabricCanvas.getViewportPoint(e.e as MouseEvent);
      const percentX = (pointer.x / displayWidth) * 100;
      const percentY = (pointer.y / displayHeight) * 100;

      const newAnnotation: TextAnnotation = {
        id: `text-${Date.now()}`,
        text: `Text ${textAnnotations.length + 1}`,
        x: percentX,
        y: percentY,
        fontSize,
        color: textColor,
        fontFamily: "Arial",
        fontWeight: "normal",
        textAlign: "left",
        maxWidth: 200,
      };

      setTextAnnotations([...textAnnotations, newAnnotation]);
      setSelectedAnnotationId(newAnnotation.id);
    });

    return () => {
      fabricCanvas.dispose();
    };
  }, [imageUrl, displayWidth, displayHeight, tool, textColor, fontSize]);

  // Render annotations on canvas
  useEffect(() => {
    if (!fabricCanvasRef.current) return;

    // Clear existing text objects
    fabricCanvasRef.current.forEachObject((obj: any) => {
      if (obj instanceof FabricText) {
        fabricCanvasRef.current!.remove(obj);
      }
    });

    // Add text annotations
    textAnnotations.forEach((annotation) => {
      const fabricText = new FabricText(annotation.text, {
        left: (annotation.x / 100) * displayWidth,
        top: (annotation.y / 100) * displayHeight,
        fontSize: annotation.fontSize,
        fill: annotation.color,
        fontFamily: annotation.fontFamily,
        fontWeight: annotation.fontWeight === "bold" ? "bold" : "normal",
        textAlign: annotation.textAlign,
        editable: false,
        hasControls: false,
        hasBorders: false,
      } as any);

      (fabricText as any).annotationId = annotation.id;
      fabricCanvasRef.current!.add(fabricText);
    });

    fabricCanvasRef.current.renderAll();
  }, [textAnnotations, displayWidth, displayHeight]);

  // Sync changes to parent
  useEffect(() => {
    if (onAnnotationsChange) {
      onAnnotationsChange({
        textAnnotations,
        drawingAnnotations: [],
      });
    }
  }, [textAnnotations]);

  const updateTextAnnotation = (id: string, updates: Partial<TextAnnotation>) => {
    setTextAnnotations(
      textAnnotations.map((ann) =>
        ann.id === id ? { ...ann, ...updates } : ann
      )
    );
  };

  const deleteAnnotation = (id: string) => {
    setTextAnnotations(textAnnotations.filter((ann) => ann.id !== id));
    setSelectedAnnotationId(null);
  };

  const duplicateAnnotation = (id: string) => {
    const original = textAnnotations.find((ann) => ann.id === id);
    if (!original) return;

    const duplicate: TextAnnotation = {
      ...original,
      id: `text-${Date.now()}`,
      x: original.x + 2,
      y: original.y + 2,
    };
    setTextAnnotations([...textAnnotations, duplicate]);
    setSelectedAnnotationId(duplicate.id);
  };

  const selectedAnnotation = textAnnotations.find((ann) => ann.id === selectedAnnotationId);

  return (
    <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
      {/* Toolbar */}
      <div className="space-y-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <div>
          <Label className="text-sm font-bold mb-2 block">🎨 Annotation Tool</Label>
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant={tool === "select" ? "default" : "outline"}
              onClick={() => setTool("select")}
              className="text-xs"
            >
              Select
            </Button>
            <Button
              size="sm"
              variant={tool === "text" ? "default" : "outline"}
              onClick={() => setTool("text")}
              className="text-xs"
            >
              + Add Text
            </Button>
            <Button
              size="sm"
              variant={tool === "delete" ? "destructive" : "outline"}
              onClick={() => setTool("delete")}
              className="text-xs"
            >
              Delete
            </Button>
          </div>
          {tool === "text" && (
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
              💡 Click on the image to add a text annotation
            </p>
          )}
        </div>

        {/* Color and Font Controls */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label htmlFor="text-color" className="text-xs font-semibold mb-1 block">
              Text Color
            </Label>
            <div className="flex gap-2">
              <input
                id="text-color"
                type="color"
                value={textColor}
                onChange={(e) => {
                  setTextColor(e.target.value);
                  if (selectedAnnotation) {
                    updateTextAnnotation(selectedAnnotation.id, { color: e.target.value });
                  }
                }}
                className="w-10 h-9 rounded cursor-pointer border border-slate-300 dark:border-slate-600"
              />
              <Input
                type="text"
                value={textColor}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^#[0-9A-F]{6}$/i.test(val)) {
                    setTextColor(val);
                    if (selectedAnnotation) {
                      updateTextAnnotation(selectedAnnotation.id, { color: val });
                    }
                  }
                }}
                placeholder="#000000"
                maxLength={7}
                className="text-xs h-9"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="font-size" className="text-xs font-semibold mb-1 block">
              Font Size ({fontSize}px)
            </Label>
            <input
              id="font-size"
              type="range"
              min="8"
              max="72"
              value={fontSize}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setFontSize(val);
                if (selectedAnnotation) {
                  updateTextAnnotation(selectedAnnotation.id, { fontSize: val });
                }
              }}
              className="w-full h-2 bg-slate-300 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold mb-1 block">Text Count</Label>
            <div className="flex items-center justify-center h-9 bg-slate-100 dark:bg-slate-700 rounded border border-slate-300 dark:border-slate-600 text-sm font-bold">
              {textAnnotations.length}
            </div>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3 overflow-x-auto flex justify-center">
        <canvas
          ref={canvasRef}
          className="border border-slate-300 dark:border-slate-600 rounded cursor-crosshair"
        />
      </div>

      {/* Selected Annotation Editor */}
      {selectedAnnotation && (
        <Card className="border-indigo-400 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-950 shadow-lg">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0 bg-indigo-100 dark:bg-indigo-900 rounded-t-lg">
            <div>
              <CardTitle className="text-sm font-bold text-indigo-900 dark:text-indigo-100">
                ✏️ Edit Text Annotation
              </CardTitle>
              <CardDescription className="text-indigo-700 dark:text-indigo-300 text-xs">
                Position: ({Math.round(selectedAnnotation.x)}%, {Math.round(selectedAnnotation.y)}%)
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => duplicateAnnotation(selectedAnnotation.id)}
                className="text-xs"
              >
                <Copy className="h-3 w-3 mr-1" />
                Duplicate
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 text-xs"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Annotation?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. The text annotation will be permanently removed.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogAction onClick={() => deleteAnnotation(selectedAnnotation.id)} className="bg-red-600 hover:bg-red-700">
                    Delete
                  </AlertDialogAction>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div>
              <Label htmlFor="annotation-text" className="text-sm font-semibold mb-2 block">
                Text Content
              </Label>
              <Input
                id="annotation-text"
                value={selectedAnnotation.text}
                onChange={(e) => updateTextAnnotation(selectedAnnotation.id, { text: e.target.value })}
                placeholder="Enter annotation text..."
                className="rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="anno-font-size" className="text-sm font-semibold mb-2 block">
                  Font Size: {selectedAnnotation.fontSize}px
                </Label>
                <input
                  id="anno-font-size"
                  type="range"
                  min="8"
                  max="72"
                  value={selectedAnnotation.fontSize}
                  onChange={(e) =>
                    updateTextAnnotation(selectedAnnotation.id, {
                      fontSize: parseInt(e.target.value),
                    })
                  }
                  className="w-full h-2 bg-slate-300 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <Label htmlFor="anno-color" className="text-sm font-semibold mb-2 block">
                  Color
                </Label>
                <div className="flex gap-2">
                  <input
                    id="anno-color"
                    type="color"
                    value={selectedAnnotation.color}
                    onChange={(e) =>
                      updateTextAnnotation(selectedAnnotation.id, { color: e.target.value })
                    }
                    className="w-10 h-10 rounded cursor-pointer border border-slate-300 dark:border-slate-600"
                  />
                  <Input
                    type="text"
                    value={selectedAnnotation.color}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^#[0-9A-F]{6}$/i.test(val)) {
                        updateTextAnnotation(selectedAnnotation.id, { color: val });
                      }
                    }}
                    placeholder="#000000"
                    maxLength={7}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="anno-align" className="text-sm font-semibold mb-2 block">
                Text Alignment
              </Label>
              <div className="flex gap-2">
                {(["left", "center", "right"] as const).map((align) => (
                  <Button
                    key={align}
                    size="sm"
                    variant={selectedAnnotation.textAlign === align ? "default" : "outline"}
                    onClick={() => updateTextAnnotation(selectedAnnotation.id, { textAlign: align })}
                    className="text-xs flex-1"
                  >
                    {align.charAt(0).toUpperCase() + align.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <Label htmlFor="anno-weight" className="text-sm font-semibold mb-2 block">
                  Font Weight
                </Label>
                <div className="flex gap-2">
                  {(["normal", "bold"] as const).map((weight) => (
                    <Button
                      key={weight}
                      size="sm"
                      variant={selectedAnnotation.fontWeight === weight ? "default" : "outline"}
                      onClick={() => updateTextAnnotation(selectedAnnotation.id, { fontWeight: weight })}
                      className="text-xs flex-1"
                    >
                      {weight === "bold" ? "𝐁𝐨𝐥𝐝" : "Normal"}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="anno-maxwidth" className="text-sm font-semibold mb-2 block">
                  Max Width: {selectedAnnotation.maxWidth}px
                </Label>
                <input
                  id="anno-maxwidth"
                  type="range"
                  min="50"
                  max="400"
                  value={selectedAnnotation.maxWidth || 200}
                  onChange={(e) =>
                    updateTextAnnotation(selectedAnnotation.id, {
                      maxWidth: parseInt(e.target.value),
                    })
                  }
                  className="w-full h-2 bg-slate-300 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info text */}
      <div className="flex gap-2 items-start p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
        <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">ℹ️</span>
        <p className="text-xs text-blue-700 dark:text-blue-300">
          Annotations are stored as metadata and can be edited anytime. Drag text to reposition or use the editor panel below to modify.
        </p>
      </div>
    </div>
  );
}
