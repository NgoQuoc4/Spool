import React, { useRef, useState } from "react";
import { CloseIcon } from "../Icons";

interface SpoolsSliderProps {
  images: string[];
  aspectRatio?: string;
  alt?: string;
  maxHeight?: string;
  onImageClick?: (index: number) => void;
  handleRemoveImage?: (index: number) => void;
}

export const SpoolsSlider: React.FC<SpoolsSliderProps> = ({
  images,
  aspectRatio,
  alt = "Post media",
  maxHeight = "440px",
  onImageClick,
  handleRemoveImage,
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const hasDragged = useRef(false);

  // Mouse drag handlers for natural click-and-drag scrolling
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;
    isDown.current = true;
    hasDragged.current = false;
    startX.current = e.pageX - sliderRef.current.offsetLeft;
    scrollLeft.current = sliderRef.current.scrollLeft;
    // setIsDragging(true);
  };

  const handleMouseLeave = () => {
    isDown.current = false;
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    isDown.current = false;
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDown.current || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.4; // Multiplier for smooth drag speed
    if (Math.abs(x - startX.current) > 4) {
      hasDragged.current = true;
      if (!isDragging) setIsDragging(true);
    }
    sliderRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleCardClick = (idx: number) => {
    // Only trigger image click if user didn't drag
    if (!hasDragged.current) {
      onImageClick?.(idx);
    }
  };

  if (!images || images.length === 0) return null;

  // Single image view
  if (images.length === 1) {
    return (
      <div
        style={{
          borderRadius: "14px",
          overflow: "hidden",
          border: "1px solid var(--border-color)",
          backgroundColor: "var(--bg-card)",
          position: "relative",
          scrollBehavior: "smooth",
        }}
      >
        <img
          src={images[0]}
          alt={alt}
          style={{
            width: "100%",
            maxHeight,
            objectFit: "cover",
            display: "block",
            cursor: onImageClick ? "pointer" : "default",
          }}
          loading="lazy"
          onClick={() => onImageClick?.(0)}
        />
        {handleRemoveImage && (
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveImage(0);
            }}
            style={{
              position: "absolute",
              top: "6px",
              right: "6px",
              backgroundColor: "rgba(0, 0, 0, 0.65)",
              color: "#fff",
              borderRadius: "50%",
              padding: "5px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              cursor: "pointer",
            }}
            title="Xóa ảnh này"
          >
            <CloseIcon size={14} />
          </button>
        )}
      </div>
    );
  }
  // Multi-image horizontal scroll view with mouse drag-to-scroll
  return (
    <div
      ref={sliderRef}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      style={{
        display: "flex",
        gap: "8px",
        overflowX: "auto",
        paddingBottom: "4px",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        WebkitOverflowScrolling: "touch",
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
      }}
    >
      {images.map((url, idx) => (
        <div
          key={idx}
          onClick={() => handleCardClick(idx)}
          style={{
            flex: "0 0 auto",
            width: images.length === 2 ? "calc(50% - 4px)" : "280px",
            height: "360px",
            borderRadius: "14px",
            overflow: "hidden",
            border: "1px solid var(--border-color)",
            backgroundColor: "var(--bg-card)",
            cursor: onImageClick ? "pointer" : "default",
            position: "relative",
          }}
        >
          <img
            src={url}
            alt={`${alt} - ${idx + 1}`}
            draggable={false}
            style={{
              width: "100%",
              height: "100%",
              aspectRatio: aspectRatio || "4 / 5",
              objectFit: "cover",
              display: "block",
              pointerEvents: "none", // Prevent native browser drag-image ghost
            }}
            loading="lazy"
          />
          {handleRemoveImage && (
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveImage(idx);
              }}
              style={{
                position: "absolute",
                top: "6px",
                right: "6px",
                backgroundColor: "rgba(0, 0, 0, 0.65)",
                color: "#fff",
                borderRadius: "50%",
                padding: "5px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                cursor: "pointer",
              }}
              title="Xóa ảnh này"
            >
              <CloseIcon size={14} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default SpoolsSlider;
