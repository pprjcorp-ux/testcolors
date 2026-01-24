'use client';

import { useState } from 'react';

interface ColorPaletteProps {
  colors: string[];
  title?: string;
}

export function ColorPalette({ colors, title }: ColorPaletteProps) {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const handleCopy = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  return (
    <div>
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      )}
      <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
        {colors.map((color, index) => (
          <button
            key={index}
            onClick={() => handleCopy(color)}
            className="group relative aspect-square rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            style={{ backgroundColor: color }}
            title={`Clique para copiar: ${color}`}
          >
            {copiedColor === color && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl text-white text-xs font-medium">
                Copiado!
              </span>
            )}
            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity px-1 py-0.5 rounded bg-white/90 text-gray-700">
              {color}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
