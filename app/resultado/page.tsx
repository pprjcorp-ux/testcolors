'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { SeasonCard } from '@/components/SeasonCard';
import { ExportButton } from '@/components/ExportButton';
import { Button } from '@/components/ui/button';
import { seasons, Season } from '@/lib/color-seasons';

function ResultadoContent() {
  const searchParams = useSearchParams();
  
  const estacao = searchParams.get('estacao') as Season | null;
  const source = searchParams.get('source') as 'questionario' | 'foto' | null;
  const confidence = searchParams.get('confidence');
  const undertone = searchParams.get('undertone');
  const contrast = searchParams.get('contrast');
  const details = searchParams.get('details');

  if (!estacao || !seasons[estacao]) {
    return (
      <main className="min-h-screen">
        <Header />
        <section className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Resultado não encontrado
          </h1>
          <p className="text-gray-600 mb-8">
            Faça o questionário ou análise de foto para descobrir sua estação de cores.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/questionario">
              <Button variant="outline">Fazer Questionário</Button>
            </Link>
            <Link href="/analise-foto">
              <Button>Analisar Foto</Button>
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const seasonData = seasons[estacao];

  return (
    <main className="min-h-screen pb-16">
      <Header />
      
      <section className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <p className="text-gray-500 mb-2">
            {source === 'foto' ? 'Análise com IA' : 'Resultado do Questionário'}
          </p>
          <h1 className="text-3xl font-bold text-gray-900">
            Sua Coloração Pessoal
          </h1>
        </div>

        <SeasonCard 
          season={seasonData}
          source={source || 'questionario'}
          confidence={confidence ? parseInt(confidence) : undefined}
          undertone={undertone || undefined}
          contrast={contrast || undefined}
          details={details || undefined}
        />

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <ExportButton season={seasonData} />

          <Button
            variant="outline"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `Minha coloração pessoal é ${seasonData.name}!`,
                  text: `Descobri que minha estação de cores é ${seasonData.name} usando o AuraCor!`,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copiado para a área de transferência!');
              }
            }}
            className="flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Compartilhar
          </Button>

          <Link href="/">
            <Button className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              Fazer Novamente
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function ResultadoPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen">
        <Header />
        <section className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="animate-pulse">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-200" />
            <div className="h-8 w-48 mx-auto bg-gray-200 rounded" />
          </div>
        </section>
      </main>
    }>
      <ResultadoContent />
    </Suspense>
  );
}
