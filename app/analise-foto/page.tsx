'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { PhotoUpload } from '@/components/PhotoUpload';

export default function AnaliseFotoPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhotoSelect = async (base64: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64 }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao analisar a foto');
      }

      const result = await response.json();
      
      // Navigate to result page with the analysis
      const params = new URLSearchParams({
        estacao: result.season,
        source: 'foto',
        confidence: result.confidence.toString(),
        undertone: result.undertone,
        contrast: result.contrast,
        details: result.details,
      });
      
      router.push(`/resultado?${params.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      <Header />
      
      <section className="max-w-4xl mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Análise de Coloração com IA
          </h1>
          <p className="text-gray-600">
            Envie uma foto e nossa inteligência artificial irá analisar suas cores
          </p>
        </div>

        <PhotoUpload 
          onPhotoSelect={handlePhotoSelect}
          isLoading={isLoading}
        />

        {error && (
          <div className="mt-6 max-w-xl mx-auto p-4 bg-red-50 border border-red-200 rounded-xl text-center">
            <p className="text-red-600 font-medium">Erro na análise</p>
            <p className="text-red-500 text-sm mt-1">{error}</p>
            <p className="text-gray-500 text-sm mt-2">
              Verifique se a chave da API OpenAI está configurada corretamente.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
