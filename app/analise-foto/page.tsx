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
    <main className="min-h-screen relative">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-lavender/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-sunny/5 rounded-full blur-3xl" />
      </div>

      <Header />

      <section className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-10 animate-slide-up-bounce">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal/10 text-teal font-medium text-sm mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Powered by GPT-4 Vision
          </div>

          <h1 className="text-3xl md:text-4xl font-display font-bold text-charcoal mb-3">
            Análise de Coloração com{' '}
            <span className="text-gradient-cool">IA</span>
          </h1>
          <p className="text-slate text-lg max-w-xl mx-auto">
            Envie uma foto e nossa inteligência artificial irá analisar suas cores naturais
          </p>
        </div>

        {/* Photo upload component */}
        <div className="animate-slide-up-bounce delay-100">
          <PhotoUpload
            onPhotoSelect={handlePhotoSelect}
            isLoading={isLoading}
          />
        </div>

        {/* Error state */}
        {error && (
          <div className="mt-8 max-w-xl mx-auto animate-pop-in">
            <div className="p-6 bg-coral/10 border-2 border-coral/30 rounded-3xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-coral/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-display font-bold text-coral text-lg">Erro na análise</h3>
                  <p className="text-charcoal mt-1">{error}</p>
                  <p className="text-slate text-sm mt-2">
                    Verifique se a chave da API OpenAI está configurada corretamente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tips section */}
        <div className="mt-12 max-w-2xl mx-auto animate-slide-up-bounce delay-200">
          <h3 className="font-display font-bold text-lg text-charcoal text-center mb-6">
            Dicas para uma boa foto
          </h3>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                icon: '☀️',
                title: 'Iluminação natural',
                description: 'Tire a foto perto de uma janela',
                color: 'bg-sunny/10 border-sunny/30'
              },
              {
                icon: '🎨',
                title: 'Sem maquiagem',
                description: 'Ou maquiagem bem leve',
                color: 'bg-coral/10 border-coral/30'
              },
              {
                icon: '👤',
                title: 'Rosto visível',
                description: 'Cabelo solto e natural',
                color: 'bg-teal/10 border-teal/30'
              },
            ].map((tip, i) => (
              <div
                key={i}
                className={`p-4 rounded-2xl border-2 ${tip.color} text-center group hover:scale-105 transition-transform`}
              >
                <span className="text-3xl block mb-2 group-hover:animate-bounce-float">{tip.icon}</span>
                <h4 className="font-display font-semibold text-charcoal">{tip.title}</h4>
                <p className="text-sm text-slate mt-1">{tip.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy note */}
        <p className="text-center text-sm text-slate mt-8 opacity-75">
          🔒 Sua foto é processada de forma segura e não é armazenada
        </p>
      </section>
    </main>
  );
}
