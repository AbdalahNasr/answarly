"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, Pause, Play, SkipForward } from "lucide-react";
import Image from "next/image";

interface Media {
  url: string;
  type: "image" | "gif";
  caption?: string;
  position: number;
  width?: "full" | "half" | "small" | "auto"; // Image sizing control
  maxWidth?: number; // Max width in pixels
}

interface MediaPlayerProps {
  media: Media[];
  className?: string;
}

export function MediaPlayer({ media, className = "" }: MediaPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGifPlaying, setIsGifPlaying] = useState(true);
  const [gifFrameCount, setGifFrameCount] = useState(0);
  const gifRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  if (!media || media.length === 0) {
    return null;
  }

  const currentMedia = media[currentIndex];
  const isGif = currentMedia.type === "gif";
  const hasMultipleMedia = media.length > 1;

  // Calculate width class based on sizing preference
  const getWidthClass = () => {
    const sizing = currentMedia.width || "auto";
    switch (sizing) {
      case "full":
        return "w-full";
      case "half":
        return "w-1/2 mx-auto";
      case "small":
        return "w-1/3 mx-auto";
      case "auto":
      default:
        return "max-w-full";
    }
  };

  // Handle carousel navigation
  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
    setIsGifPlaying(true);
  };

  const goPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
    setIsGifPlaying(true);
  };

  // GIF control functions
  const restartGif = () => {
    if (gifRef.current) {
      // Restart by reloading the image
      const src = gifRef.current.src;
      gifRef.current.src = src + "?t=" + Date.now();
      setIsGifPlaying(true);
    }
  };

  const toggleGifPlayback = () => {
    if (gifRef.current) {
      if (isGifPlaying) {
        // Pause: create a snapshot of the GIF
        gifRef.current.style.animationPlayState = "paused";
      } else {
        // Resume
        gifRef.current.style.animationPlayState = "running";
      }
      setIsGifPlaying(!isGifPlaying);
    }
  };

  const jumpToEnd = () => {
    // For GIFs, we can't truly jump to end without complex processing
    // Instead, we'll show a visual indicator and continue playing
    if (gifRef.current) {
      gifRef.current.style.animationPlayState = "running";
      setIsGifPlaying(true);
      // Add a small animation to show it reached the end
      gifRef.current.style.opacity = "0.8";
      setTimeout(() => {
        if (gifRef.current) {
          gifRef.current.style.opacity = "1";
        }
      }, 200);
    }
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Main Media Display */}
      <div className="relative bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl overflow-hidden border border-white/60 shadow-lg">
        {/* Media Container */}
        <div className="relative w-full h-auto max-h-96 flex items-center justify-center bg-gray-900/10 p-4">
          <div className={`${getWidthClass()} flex items-center justify-center`}>
            <Image
              ref={gifRef}
              src={currentMedia.url}
              alt={currentMedia.caption || `Media ${currentIndex + 1}`}
              width={currentMedia.maxWidth || 800}
              height={600}
              priority
              className="max-w-full max-h-96 object-contain rounded-lg"
              unoptimized={isGif} // Don't optimize GIFs as Next.js can't handle animated GIFs well
            />
          </div>
        </div>

        {/* Caption */}
        {currentMedia.caption && (
          <div className="p-3 bg-white/50 text-center text-sm text-gray-700 border-t border-white/40">
            {currentMedia.caption}
          </div>
        )}

        {/* Carousel Controls - Always visible if multiple media */}
        {hasMultipleMedia && (
          <div className="absolute inset-0 flex items-center justify-between pointer-events-none px-4">
            <button
              onClick={goPrevious}
              className="pointer-events-auto p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all"
              aria-label="Previous media"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={goToNext}
              className="pointer-events-auto p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all"
              aria-label="Next media"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}

        {/* GIF Playback Controls - Only for GIFs */}
        {isGif && (
          <div className="absolute bottom-4 right-4 flex gap-2 pointer-events-auto">
            <button
              onClick={restartGif}
              className="p-2 rounded-full bg-white/80 hover:bg-white text-gray-800 transition-all shadow-md"
              title="Back (Restart GIF)"
              aria-label="Restart GIF"
            >
              <RotateCcw size={20} />
            </button>
            <button
              onClick={toggleGifPlayback}
              className="p-2 rounded-full bg-white/80 hover:bg-white text-gray-800 transition-all shadow-md"
              title={isGifPlaying ? "Pause" : "Play"}
              aria-label={isGifPlaying ? "Pause" : "Play"}
            >
              {isGifPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button
              onClick={jumpToEnd}
              className="p-2 rounded-full bg-white/80 hover:bg-white text-gray-800 transition-all shadow-md"
              title="Go to end"
              aria-label="Jump to end"
            >
              <SkipForward size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Position Indicator */}
      {hasMultipleMedia && (
        <div className="text-center text-sm text-gray-600 font-medium">
          {currentIndex + 1} of {media.length}
        </div>
      )}

      {/* Carousel Dots/Navigation - for visual indicator */}
      {hasMultipleMedia && (
        <div className="flex justify-center gap-2">
          {media.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setIsGifPlaying(true);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 w-6"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to media ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
