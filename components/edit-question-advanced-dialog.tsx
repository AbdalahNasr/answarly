"use client";

import { useState, useMemo, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { X, Plus, Upload, Palette, Headphones, Shuffle, AlignJustify, Calculator, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageAnnotationEditor } from "./image-annotation-editor";

interface TextAnnotation {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily?: string;
  fontWeight?: "normal" | "bold";
  textAlign?: "left" | "center" | "right";
  maxWidth?: number;
}

interface DrawingAnnotation {
  id: string;
  type: "pen" | "rectangle" | "circle" | "line";
  points?: [number, number][];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color: string;
  opacity?: number;
  strokeWidth?: number;
}

interface Annotations {
  textAnnotations?: TextAnnotation[];
  drawingAnnotations?: DrawingAnnotation[];
}

interface Media {
  url: string;
  type: "image" | "gif";
  position: number;
  caption?: string;
  width?: "full" | "half" | "small" | "auto";
  maxWidth?: number;
  fileName?: string;
  annotations?: Annotations;
}

interface EditAdvancedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionId: string;
  initialData: {
    type: string;
    heading?: string;
    description?: string;
    media?: Media[];
    contentLayout?: {
      showHeading?: boolean;
      showDescription?: boolean;
      headingPosition?: "before" | "after";
      descriptionPosition?: "before" | "after";
    };
    audioUrl?: string;
    listeningAnswerFormat?: "mcq" | "open";
    blankTemplate?: string;
    blankAnswers?: string[];
    matchPairs?: Array<{ left: string; right: string }>;
    orderItems?: string[];
    latex?: string;
    diagramLabels?: Array<{ x: number; y: number; label: string }>;
  };
  onSave: (data: any) => Promise<void>;
}

const sizePresets = {
  auto: { label: "Auto (Original)", percentage: "100%", description: "Original image size" },
  full: { label: "Full Width", percentage: "100%", description: "100% container width" },
  half: { label: "Half Width", percentage: "50%", description: "50% container width" },
  small: { label: "Small", percentage: "33%", description: "33% container width" },
};

export function EditQuestionAdvancedDialog({
  open,
  onOpenChange,
  questionId,
  initialData,
  onSave,
}: EditAdvancedDialogProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [heading, setHeading] = useState(initialData.heading || "");
  const [description, setDescription] = useState(initialData.description || "");
  const [media, setMedia] = useState<Media[]>(initialData.media || []);
  const [showHeading, setShowHeading] = useState(
    initialData.contentLayout?.showHeading !== false
  );
  const [showDescription, setShowDescription] = useState(
    initialData.contentLayout?.showDescription !== false
  );
  const [headingPosition, setHeadingPosition] = useState<"before" | "after">(
    initialData.contentLayout?.headingPosition || "before"
  );
  const [descriptionPosition, setDescriptionPosition] = useState<"before" | "after">(
    initialData.contentLayout?.descriptionPosition || "before"
  );
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);

  // Expanded fields states
  const [audioUrl, setAudioUrl] = useState(initialData.audioUrl || "");
  const [listeningAnswerFormat, setListeningAnswerFormat] = useState<"mcq" | "open">(initialData.listeningAnswerFormat || "mcq");
  const [blankTemplate, setBlankTemplate] = useState(initialData.blankTemplate || "");
  const [blankAnswers, setBlankAnswers] = useState<string[]>(initialData.blankAnswers || []);
  const [matchPairs, setMatchPairs] = useState<Array<{ left: string; right: string }>>(initialData.matchPairs || []);
  const [orderItems, setOrderItems] = useState<string[]>(initialData.orderItems || []);
  const [latex, setLatex] = useState(initialData.latex || "");
  const [diagramLabels, setDiagramLabels] = useState<Array<{ x: number; y: number; label: string }>>(initialData.diagramLabels || []);

  const hasExistingMedia = media.length > 0;

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newMedia: Media[] = [];
    let loadedCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        newMedia.push({
          url: base64,
          type: file.type === "image/gif" ? "gif" : "image",
          position: media.length + newMedia.length,
          caption: "",
          width: "auto",
          maxWidth: 800,
          fileName: file.name,
        });
        loadedCount++;
        if (loadedCount === files.length) {
          setMedia([...media, ...newMedia]);
          toast({ title: "Success", description: `${newMedia.length} image(s) added` });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
    if (selectedMediaIndex === index) setSelectedMediaIndex(null);
  };

  const updateMediaCaption = (index: number, caption: string) => {
    const updated = [...media];
    updated[index].caption = caption;
    setMedia(updated);
  };

  const updateMediaAnnotations = useCallback(
    (index: number, annotations: Annotations) => {
      setMedia((prevMedia) => {
        const updated = [...prevMedia];
        updated[index].annotations = annotations;
        return updated;
      });
    },
    []
  );

  const updateMediaSize = (index: number, width: "full" | "half" | "small" | "auto") => {
    const updated = [...media];
    updated[index].width = width;
    setMedia(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = {
        heading: heading.trim() || undefined,
        description: description.trim() || undefined,
        media: media.length > 0 ? media : undefined,
        contentLayout: {
          showHeading,
          showDescription,
          headingPosition,
          descriptionPosition,
        },
        audioUrl: initialData.type === "listening" ? audioUrl : undefined,
        listeningAnswerFormat: initialData.type === "listening" ? listeningAnswerFormat : undefined,
        blankTemplate: initialData.type === "fill_in_blank" ? blankTemplate : undefined,
        blankAnswers: initialData.type === "fill_in_blank" ? blankAnswers : undefined,
        matchPairs: initialData.type === "match_pairs" ? matchPairs : undefined,
        orderItems: initialData.type === "ordering" ? orderItems : undefined,
        latex: initialData.type === "math_equation" ? latex : undefined,
        diagramLabels: initialData.type === "diagram_label" ? diagramLabels : undefined,
      };
      await onSave(data);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving:", error);
      toast({ title: "Error", description: "Failed to save changes", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Question Details</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Heading Section */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Heading</CardTitle>
                <CardDescription>Optional question heading</CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  value={heading}
                  onChange={(e) => setHeading(e.target.value)}
                  placeholder="e.g., Chapter 3: Advanced Concepts"
                  className="rounded-lg"
                />
              </CardContent>
            </Card>

            {/* Description Section */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Description</CardTitle>
                <CardDescription>Optional context or instructions</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide additional context or instructions for this question..."
                  className="min-h-[100px] rounded-lg"
                />
              </CardContent>
            </Card>

            {/* Type Specific Fields */}
            {initialData.type === "listening" && (
              <Card className="border-slate-200 dark:border-slate-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Headphones className="h-4 w-4 text-indigo-500" />
                    <CardTitle className="text-base">Listening Configuration</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Audio URL</Label>
                    <Input value={audioUrl} onChange={(e) => setAudioUrl(e.target.value)} placeholder="https://res.cloudinary.com/..." />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Answer Format</Label>
                    <Select value={listeningAnswerFormat} onValueChange={(v: any) => setListeningAnswerFormat(v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mcq">Multiple Choice</SelectItem>
                        <SelectItem value="open">Open Ended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}

            {initialData.type === "fill_in_blank" && (
              <Card className="border-slate-200 dark:border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Fill in Blank Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Template (use '___' for blanks)</Label>
                    <Textarea 
                      value={blankTemplate} 
                      onChange={(e) => {
                        setBlankTemplate(e.target.value);
                        const blanks = e.target.value.match(/___/g) || [];
                        setBlankAnswers(new Array(blanks.length).fill(""));
                      }}
                      className="font-mono"
                    />
                  </div>
                  {blankAnswers.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <Label className="text-sm font-bold">Answers</Label>
                      {blankAnswers.map((ans, i) => (
                        <Input 
                          key={i} 
                          value={ans} 
                          onChange={(e) => {
                            const n = [...blankAnswers]; n[i] = e.target.value; setBlankAnswers(n);
                          }}
                          placeholder={`Answer #${i+1}`}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {initialData.type === "match_pairs" && (
              <Card className="border-slate-200 dark:border-slate-700">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shuffle className="h-4 w-4 text-indigo-500" />
                    <CardTitle className="text-base">Match Pairs Configuration</CardTitle>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setMatchPairs([...matchPairs, { left: "", right: "" }])}>
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {matchPairs.map((pair, i) => (
                    <div key={i} className="flex gap-2">
                      <Input value={pair.left} onChange={(e) => { const n = [...matchPairs]; n[i].left = e.target.value; setMatchPairs(n); }} placeholder="Left" />
                      <Input value={pair.right} onChange={(e) => { const n = [...matchPairs]; n[i].right = e.target.value; setMatchPairs(n); }} placeholder="Right" />
                      <Button size="icon" variant="ghost" onClick={() => setMatchPairs(matchPairs.filter((_, idx) => idx !== i))}>
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {initialData.type === "ordering" && (
              <Card className="border-slate-200 dark:border-slate-700">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlignJustify className="h-4 w-4 text-indigo-500" />
                    <CardTitle className="text-base">Ordering Configuration</CardTitle>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setOrderItems([...orderItems, ""])}>
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {orderItems.map((item, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="h-10 w-8 flex items-center justify-center font-bold text-slate-400">{i+1}</span>
                      <Input value={item} onChange={(e) => { const n = [...orderItems]; n[i] = e.target.value; setOrderItems(n); }} placeholder={`Step ${i+1}`} />
                      <Button size="icon" variant="ghost" onClick={() => setOrderItems(orderItems.filter((_, idx) => idx !== i))}>
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {initialData.type === "math_equation" && (
              <Card className="border-slate-200 dark:border-slate-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-indigo-500" />
                    <CardTitle className="text-base">Math Configuration</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm">LaTeX Equation</Label>
                    <Textarea value={latex} onChange={(e) => setLatex(e.target.value)} className="font-mono" />
                  </div>
                </CardContent>
              </Card>
            )}

            {initialData.type === "diagram_label" && (
              <Card className="border-slate-200 dark:border-slate-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-indigo-500" />
                    <CardTitle className="text-base">Diagram Labels</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {diagramLabels.map((l, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <span className="text-xs font-bold text-slate-400">#{i+1}</span>
                      <Input value={l.label} onChange={(e) => { const n = [...diagramLabels]; n[i].label = e.target.value; setDiagramLabels(n); }} placeholder="Label" />
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">x:{Math.round(l.x)}% y:{Math.round(l.y)}%</span>
                      <Button size="icon" variant="ghost" onClick={() => setDiagramLabels(diagramLabels.filter((_, idx) => idx !== i))}>
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Display Options */}
            {(heading || description || media.length > 0) && (
              <Card className="border-slate-200 dark:border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Display Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="show-heading"
                        checked={showHeading}
                        onCheckedChange={(e) => setShowHeading(e as boolean)}
                        disabled={!heading}
                      />
                      <Label htmlFor="show-heading" className="cursor-pointer font-normal">
                        Show Heading
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="show-description"
                        checked={showDescription}
                        onCheckedChange={(e) => setShowDescription(e as boolean)}
                        disabled={!description}
                      />
                      <Label htmlFor="show-description" className="cursor-pointer font-normal">
                        Show Description
                      </Label>
                    </div>
                  </div>

                  {(showHeading || showDescription) && media.length > 0 && (
                    <div className="border-t pt-4 space-y-3">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Content Positioning</p>
                      {showHeading && (
                        <Select value={headingPosition} onValueChange={(value: any) => setHeadingPosition(value)}>
                          <SelectTrigger className="rounded-lg">
                            <SelectValue placeholder="Heading position" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="before">Heading Before Media</SelectItem>
                            <SelectItem value="after">Heading After Media</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      {showDescription && (
                        <Select value={descriptionPosition} onValueChange={(value: any) => setDescriptionPosition(value)}>
                          <SelectTrigger className="rounded-lg">
                            <SelectValue placeholder="Description position" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="before">Description Before Media</SelectItem>
                            <SelectItem value="after">Description After Media</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Media Management */}
          <div className="md:col-span-1">
            <Card className="border-slate-200 dark:border-slate-700 sticky top-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Media</CardTitle>
                <CardDescription>{media.length} image(s)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-3 text-center hover:border-slate-400 transition-colors">
                  <input
                    type="file"
                    id="media-upload-right"
                    multiple
                    accept="image/*"
                    onChange={handleMediaUpload}
                    className="hidden"
                  />
                  <label htmlFor="media-upload-right" className="cursor-pointer block">
                    <Upload className="mx-auto h-5 w-5 text-slate-400 mb-1" />
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      {hasExistingMedia ? "Add More" : "Upload Images"}
                    </p>
                  </label>
                </div>

                {/* Instructions */}
                {hasExistingMedia && (
                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-2">
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                      👇 Click an image below to resize, caption, or delete it
                    </p>
                  </div>
                )}

                {/* Media List */}
                {hasExistingMedia ? (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {media.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedMediaIndex(selectedMediaIndex === index ? null : index)}
                        className={cn(
                          "w-full p-2 rounded-lg border-2 text-left transition-all",
                          selectedMediaIndex === index
                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950"
                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                        )}
                      >
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                          {item.fileName || `Image ${index + 1}`}
                        </p>
                        {item.caption && (
                          <p className="text-xs text-slate-500 truncate">{item.caption}</p>
                        )}
                        <p className={cn(
                          "text-xs font-semibold mt-1",
                          sizePresets[item.width as keyof typeof sizePresets]?.percentage === "100%"
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-slate-600 dark:text-slate-400"
                        )}>
                          {sizePresets[item.width as keyof typeof sizePresets]?.label || "Auto"}
                        </p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 text-center py-4">
                    No images yet. Click upload to add.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Selected Media Editor */}
        {selectedMediaIndex !== null && media[selectedMediaIndex] && (
          <Card className="mt-6 border-2 border-indigo-400 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-950 shadow-lg">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0 bg-indigo-100 dark:bg-indigo-900 rounded-t-lg">
              <div>
                <CardTitle className="text-lg font-bold text-indigo-900 dark:text-indigo-100">✏️ Resize & Edit Image</CardTitle>
                <CardDescription className="text-indigo-700 dark:text-indigo-300">
                  {media[selectedMediaIndex].fileName || `Image ${selectedMediaIndex + 1}`}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeMedia(selectedMediaIndex)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                <X className="h-4 w-4" />
                Delete
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {/* Size Selection with Visual Preview */}
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-bold text-indigo-900 dark:text-indigo-100 mb-2 block">
                    🎨 Choose Image Width
                  </Label>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                    Click to select how wide the image should appear in the question
                  </p>
                </div>
                <div className="space-y-2">
                  {Object.entries(sizePresets).map(([key, preset]) => (
                    <button
                      key={key}
                      onClick={() => updateMediaSize(selectedMediaIndex, key as any)}
                      className={cn(
                        "w-full p-3 rounded-lg border-2 text-left transition-all hover:shadow-md",
                        media[selectedMediaIndex].width === key
                          ? "border-indigo-500 bg-indigo-100 dark:bg-indigo-900"
                          : "border-slate-300 dark:border-slate-600 hover:border-slate-400 bg-white dark:bg-slate-800"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {preset.label}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {preset.description}
                          </p>
                        </div>
                        {media[selectedMediaIndex].width === key && (
                          <div className="flex items-center">
                            <div className="w-5 h-5 rounded-full bg-indigo-500 border-2 border-indigo-600 flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full" />
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Real-Time Image Preview */}
              <div className="mt-6 pt-6 border-t border-slate-300 dark:border-slate-600">
                <Label className="text-sm font-bold text-indigo-900 dark:text-indigo-100 mb-3 block">
                  👀 Live Preview
                </Label>
                <div className="space-y-2">
                  {Object.entries(sizePresets).map(([key, preset]) => (
                    <div
                      key={key}
                      className={cn(
                        "p-3 rounded-lg border-2 transition-all",
                        media[selectedMediaIndex].width === key
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950"
                          : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                      )}
                    >
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3">
                        {preset.label} ({preset.percentage})
                      </p>
                      <div className="flex justify-center p-4 bg-white dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 min-h-[80px]">
                        <img
                          src={media[selectedMediaIndex].url}
                          alt="Size preview"
                          style={{ width: preset.percentage, maxHeight: "200px" }}
                          className="object-contain rounded"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Caption */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">💬 Caption (Optional)</Label>
                <Input
                  value={media[selectedMediaIndex].caption || ""}
                  onChange={(e) => updateMediaCaption(selectedMediaIndex, e.target.value)}
                  placeholder="Add text that appears below the image..."
                  className="rounded-lg"
                />
              </div>

              {/* Image Annotation Editor */}
              <div className="pt-4 border-t border-slate-300 dark:border-slate-600">
                <Label className="text-sm font-semibold mb-3 flex items-center gap-2 block">
                  <Palette className="h-4 w-4" />
                  Image Annotations (Advanced)
                </Label>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                  Add text and drawings to annotate your image. Annotations are stored separately and not merged into the image.
                </p>
                <ImageAnnotationEditor
                  imageUrl={media[selectedMediaIndex].url}
                  imageWidth={800}
                  imageHeight={600}
                  initialAnnotations={media[selectedMediaIndex].annotations || { textAnnotations: [], drawingAnnotations: [] }}
                  onAnnotationsChange={(annotations) => updateMediaAnnotations(selectedMediaIndex, annotations)}
                />
              </div>
            </CardContent>
          </Card>
        )}

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
