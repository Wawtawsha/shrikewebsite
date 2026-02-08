"use client";

import { useEffect, useRef } from "react";
import { decode } from "blurhash";

interface BlurhashPlaceholderProps {
  blurhash: string;
  width: number;
  height: number;
}

export function BlurhashPlaceholder({ blurhash, width, height }: BlurhashPlaceholderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const decodeWidth = 32;
    const decodeHeight = Math.round(32 * (height / width));
    const pixels = decode(blurhash, decodeWidth, decodeHeight);

    canvas.width = decodeWidth;
    canvas.height = decodeHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.createImageData(decodeWidth, decodeHeight);
    imageData.data.set(pixels);
    ctx.putImageData(imageData, 0, 0);
  }, [blurhash, width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
    />
  );
}
