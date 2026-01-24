'use client';

import { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import { Button } from '@/components/ui/button';
import { ShareableCard } from './ShareableCard';
import { SeasonData } from '@/lib/color-seasons';

interface ExportButtonProps {
  season: SeasonData;
}

export function ExportButton({ season }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [currentFormat, setCurrentFormat] = useState<'stories' | 'feed'>('stories');

  const handleExport = async (format: 'stories' | 'feed') => {
    setShowFormatMenu(false);
    setCurrentFormat(format);
    setIsExporting(true);

    // Pequeno delay para garantir que o card seja renderizado com o formato correto
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      if (!cardRef.current) {
        throw new Error('Card não encontrado');
      }

      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 1,
        cacheBust: true,
      });

      // Criar link de download
      const link = document.createElement('a');
      link.download = `auracor-${season.id}-${format}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Erro ao exportar imagem:', error);
      alert('Erro ao gerar imagem. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative inline-block">
      <Button
        variant="outline"
        onClick={() => setShowFormatMenu(!showFormatMenu)}
        disabled={isExporting}
        className="flex items-center gap-2"
      >
        {isExporting ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Gerando...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Baixar Minha Paleta
          </>
        )}
      </Button>

      {/* Format Selection Menu */}
      {showFormatMenu && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-xl border border-gray-200 p-2 z-50 min-w-[200px]">
          <button
            onClick={() => handleExport('stories')}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-12 bg-gradient-to-br from-purple-200 to-pink-200 rounded" />
              <div>
                <p className="font-medium text-gray-900">Stories</p>
                <p className="text-xs text-gray-500">1080 x 1920px</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => handleExport('feed')}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-8 bg-gradient-to-br from-purple-200 to-pink-200 rounded" />
              <div>
                <p className="font-medium text-gray-900">Feed</p>
                <p className="text-xs text-gray-500">1200 x 630px</p>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Hidden Shareable Card for export */}
      <ShareableCard ref={cardRef} season={season} format={currentFormat} />

      {/* Click outside to close menu */}
      {showFormatMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowFormatMenu(false)}
        />
      )}
    </div>
  );
}
