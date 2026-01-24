'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';

interface PhotoUploadProps {
  onPhotoSelect: (base64: string) => void;
  isLoading?: boolean;
}

export function PhotoUpload({ onPhotoSelect, isLoading }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPreview(base64);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleAnalyze = () => {
    if (preview) {
      onPhotoSelect(preview);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept="image/*"
        className="hidden"
      />

      {!preview ? (
        // Upload area with playful styling
        <div
          className={`
            relative overflow-hidden rounded-3xl border-3 border-dashed transition-all duration-300 cursor-pointer
            ${isDragging
              ? 'border-teal bg-teal/10 scale-[1.02]'
              : 'border-border hover:border-teal/50 hover:bg-teal/5'
            }
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-coral" />
            <div className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-teal" />
            <div className="absolute top-1/2 right-8 w-6 h-6 rounded-full bg-sunny" />
          </div>

          <div className="relative py-16 px-8 text-center">
            {/* Icon */}
            <div className={`
              w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center
              bg-gradient-to-br from-teal/20 to-lavender/20
              transition-transform duration-300
              ${isDragging ? 'scale-110 rotate-3' : 'group-hover:scale-105'}
            `}>
              <svg className="w-12 h-12 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>

            <h3 className="text-xl font-display font-bold text-charcoal mb-2">
              {isDragging ? 'Solte a foto aqui!' : 'Arraste sua foto aqui'}
            </h3>
            <p className="text-slate mb-4">
              ou <span className="text-teal font-medium underline">clique para selecionar</span>
            </p>
            <p className="text-sm text-slate/70">
              JPG, PNG ou HEIC • Máximo 10MB
            </p>
          </div>
        </div>
      ) : (
        // Preview card with playful styling
        <div className="card-playful-shadow bg-white dark:bg-card rounded-3xl overflow-hidden" style={{ boxShadow: '6px 6px 0 0 var(--color-teal)' }}>
          <div className="relative aspect-square max-h-[400px] overflow-hidden bg-muted">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />

            {/* Loading overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-charcoal/70 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center text-white p-8">
                  {/* Playful spinner */}
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-white/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-teal border-t-transparent animate-spin" />
                    <div className="absolute inset-2 rounded-full border-4 border-sunny border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
                    <span className="absolute inset-0 flex items-center justify-center text-2xl">
                      🔍
                    </span>
                  </div>

                  <p className="text-xl font-display font-bold mb-2">Analisando sua foto...</p>
                  <p className="text-white/70">Nossa IA está identificando suas cores</p>

                  {/* Animated dots */}
                  <div className="flex justify-center gap-2 mt-4">
                    {['#FF6B6B', '#4ECDC4', '#FFE66D', '#A594F9'].map((color, i) => (
                      <div
                        key={i}
                        className="w-3 h-3 rounded-full animate-wave"
                        style={{ backgroundColor: color, animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      {preview && !isLoading && (
        <div className="flex gap-4 animate-slide-up-bounce">
          <Button
            variant="outline"
            onClick={handleRemove}
            size="lg"
            className="flex-1"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Escolher outra
          </Button>
          <Button
            onClick={handleAnalyze}
            variant="secondary"
            size="lg"
            className="flex-1"
          >
            Analisar com IA
            <span className="ml-1">✨</span>
          </Button>
        </div>
      )}
    </div>
  );
}
