import Link from 'next/link';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
            Descubra Suas
            <span className="block bg-gradient-to-r from-rose-500 via-purple-500 to-amber-500 bg-clip-text text-transparent">
              Cores Perfeitas
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Análise de coloração pessoal com inteligência artificial. 
            Encontre as cores que mais valorizam sua beleza natural.
          </p>
          
          {/* Color palette preview */}
          <div className="flex justify-center gap-2 py-8">
            {['#FFB6C1', '#87CEEB', '#98D8AA', '#DDA0DD', '#F4A460', '#B0C4DE', '#DAA520', '#DC143C'].map((color, i) => (
              <div 
                key={i}
                className="w-8 h-8 md:w-12 md:h-12 rounded-full shadow-lg transform hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Options Section */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-8">
          Como você quer descobrir sua paleta?
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Questionnaire Card */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-300 bg-white/80 backdrop-blur">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <CardTitle className="text-xl">Questionário</CardTitle>
              <CardDescription className="text-base">
                Responda algumas perguntas sobre seu tom de pele, cabelo e olhos
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-4">
              <ul className="text-sm text-gray-500 mb-6 space-y-1">
                <li>7 perguntas simples</li>
                <li>Resultado instantâneo</li>
                <li>Não precisa de foto</li>
              </ul>
              <Link href="/questionario">
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  Fazer Questionário
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Photo Analysis Card */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-amber-300 bg-white/80 backdrop-blur">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <CardTitle className="text-xl">Análise com IA</CardTitle>
              <CardDescription className="text-base">
                Envie uma foto e nossa IA analisará suas cores automaticamente
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-4">
              <ul className="text-sm text-gray-500 mb-6 space-y-1">
                <li>Análise por inteligência artificial</li>
                <li>Resultado detalhado</li>
                <li>Requer foto com boa iluminação</li>
              </ul>
              <Link href="/analise-foto">
                <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                  Analisar Foto
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Seasons Preview */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-8">
          As 4 Estações da Coloração Pessoal
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Primavera', colors: ['#FFD700', '#FF6B35', '#98D8AA'], gradient: 'from-amber-200 to-orange-300' },
            { name: 'Verão', colors: ['#B0C4DE', '#DDA0DD', '#87CEEB'], gradient: 'from-blue-200 to-purple-300' },
            { name: 'Outono', colors: ['#8B4513', '#D2691E', '#DAA520'], gradient: 'from-orange-300 to-amber-400' },
            { name: 'Inverno', colors: ['#000000', '#DC143C', '#4B0082'], gradient: 'from-indigo-400 to-purple-500' },
          ].map((season) => (
            <div key={season.name} className={`rounded-2xl p-6 bg-gradient-to-br ${season.gradient} text-center`}>
              <h3 className="font-semibold text-gray-800 mb-3">{season.name}</h3>
              <div className="flex justify-center gap-1">
                {season.colors.map((color, i) => (
                  <div 
                    key={i}
                    className="w-6 h-6 rounded-full border-2 border-white shadow"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 text-sm">
        <p>AuraCor - Análise de Coloração Pessoal com IA</p>
      </footer>
    </main>
  );
}
