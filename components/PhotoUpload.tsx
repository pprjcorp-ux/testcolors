'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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
        <Card
          className={`border-2 border-dashed transition-all duration-200 cursor-pointer
            ${isDragging 
              ? 'border-amber-500 bg-amber-50' 
              : 'border-gray-300 hover:border-amber-400 hover:bg-amber-50/50'
            }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <CardContent className="py-16 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Arraste sua foto aqui
            </h3>
            <p className="text-gray-500 mb-4">
              ou clique para selecionar
            </p>
            <p className="text-sm text-gray-400">
              Use uma foto com boa iluminação natural, mostrando seu rosto claramente
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative aspect-square max-h-96 overflow-hidden bg-gray-100">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              {isLoading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <svg className="w-12 h-12 mx-auto animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="mt-4 text-lg font-medium">Analisando sua foto...</p>
                    <p className="text-sm opacity-75">Isso pode levar alguns segundos</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {preview && !isLoading && (
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={handleRemove}
            className="flex-1"
          >
            Escolher outra
          </Button>
          <Button
            onClick={handleAnalyze}
            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            Analisar com IA
          </Button>
        </div>
      )}

      <div className="bg-amber-50 rounded-xl p-4">
        <h4 className="font-medium text-amber-800 mb-2">Dicas para uma boa análise:</h4>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>• Use luz natural, de preferência perto de uma janela</li>
          <li>• Evite maquiagem pesada ou filtros na foto</li>
          <li>• Mostre seu rosto de frente, sem óculos de sol</li>
          <li>• Prefira um fundo neutro (branco ou cinza)</li>
        </ul>
      </div>
    </div>
  );
}
