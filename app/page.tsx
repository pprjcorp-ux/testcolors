import Link from 'next/link';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';

// Floating decorative shapes component
function FloatingShapes() {
  return (
    <div className="floating-shapes" aria-hidden="true">
      {/* Large coral blob - top right */}
      <div
        className="floating-shape blob-animated bg-coral w-96 h-96 -top-20 -right-20 opacity-10"
        style={{ animationDelay: '0s' }}
      />
      {/* Teal circle - bottom left */}
      <div
        className="floating-shape animate-bounce-float bg-teal w-64 h-64 rounded-full -bottom-10 -left-10 opacity-15"
        style={{ animationDelay: '1s' }}
      />
      {/* Sunny blob - middle */}
      <div
        className="floating-shape blob-animated bg-sunny w-48 h-48 top-1/3 left-1/4 opacity-10"
        style={{ animationDelay: '2s' }}
      />
      {/* Lavender circle - top left */}
      <div
        className="floating-shape animate-bounce-float bg-lavender w-32 h-32 rounded-full top-20 left-10 opacity-15"
        style={{ animationDelay: '0.5s' }}
      />
      {/* Small mint dot - bottom right */}
      <div
        className="floating-shape animate-squiggle bg-mint w-20 h-20 rounded-full bottom-40 right-20 opacity-20"
        style={{ animationDelay: '1.5s' }}
      />
    </div>
  );
}

// Playful color swatch with bounce animation
function ColorSwatch({ color, delay }: { color: string; delay: number }) {
  return (
    <div
      className="w-10 h-10 md:w-14 md:h-14 rounded-2xl shadow-lg transform hover:scale-125 hover:rotate-12 transition-all duration-300 cursor-pointer animate-pop-in"
      style={{
        backgroundColor: color,
        animationDelay: `${delay}ms`,
        boxShadow: `4px 4px 0 0 ${color}40`
      }}
    />
  );
}

// Season preview card with playful hover
function SeasonPreviewCard({
  name,
  emoji,
  colors,
  gradient,
  delay
}: {
  name: string;
  emoji: string;
  colors: string[];
  gradient: string;
  delay: number;
}) {
  return (
    <div
      className={`relative rounded-3xl p-6 ${gradient} text-center group cursor-pointer
        transform transition-all duration-300 hover:scale-105 hover:-rotate-2
        animate-slide-up-bounce shadow-lg hover:shadow-2xl`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Floating emoji */}
      <div className="text-4xl mb-2 group-hover:animate-bounce-float">
        {emoji}
      </div>
      <h3 className="font-display font-bold text-lg text-charcoal mb-3">{name}</h3>
      <div className="flex justify-center gap-2">
        {colors.map((color, i) => (
          <div
            key={i}
            className="w-7 h-7 rounded-full border-2 border-white shadow-md transform group-hover:scale-110 transition-transform"
            style={{
              backgroundColor: color,
              transitionDelay: `${i * 50}ms`
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const previewColors = [
    '#FF6B6B', '#4ECDC4', '#FFE66D', '#A594F9',
    '#98D8AA', '#FFAB91', '#F38181', '#AA96DA'
  ];

  const seasons = [
    {
      name: 'Primavera',
      emoji: '🌸',
      colors: ['#FFD700', '#FF6B35', '#98D8AA'],
      gradient: 'bg-primavera'
    },
    {
      name: 'Verão',
      emoji: '☀️',
      colors: ['#B0C4DE', '#DDA0DD', '#87CEEB'],
      gradient: 'bg-verao'
    },
    {
      name: 'Outono',
      emoji: '🍂',
      colors: ['#8B4513', '#D2691E', '#DAA520'],
      gradient: 'bg-outono'
    },
    {
      name: 'Inverno',
      emoji: '❄️',
      colors: ['#000000', '#DC143C', '#4B0082'],
      gradient: 'bg-inverno'
    },
  ];

  return (
    <main className="min-h-screen relative">
      <FloatingShapes />
      <Header />

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-24 relative">
        <div className="text-center space-y-8">
          {/* Main heading with playful styling */}
          <div className="space-y-2">
            <h1 className="text-5xl md:text-7xl font-display font-extrabold text-charcoal leading-tight animate-slide-up-bounce">
              Descubra Suas
            </h1>
            <h1 className="text-5xl md:text-7xl font-display font-extrabold leading-tight animate-slide-up-bounce delay-100">
              <span className="text-gradient-playful underline-squiggle">
                Cores Perfeitas
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-slate max-w-2xl mx-auto font-body animate-slide-up-bounce delay-200">
            Análise de coloração pessoal com{' '}
            <span className="font-semibold text-coral">inteligência artificial</span>.
            Encontre as cores que mais valorizam sua{' '}
            <span className="font-semibold text-teal">beleza natural</span>.
          </p>

          {/* Color palette preview with staggered animation */}
          <div className="flex justify-center gap-3 md:gap-4 py-8 flex-wrap">
            {previewColors.map((color, i) => (
              <ColorSwatch key={i} color={color} delay={300 + i * 75} />
            ))}
          </div>
        </div>
      </section>

      {/* Options Section - Cards with playful shadows */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-center text-charcoal mb-10 animate-slide-up-bounce">
          Como você quer descobrir sua{' '}
          <span className="text-gradient-warm">paleta</span>?
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Questionnaire Card */}
          <div className="group card-playful-shadow bg-white animate-slide-up-bounce delay-100">
            <div className="text-center">
              {/* Icon with bounce */}
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-coral to-peach flex items-center justify-center group-hover:animate-wiggle shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>

              <h3 className="font-display font-bold text-2xl text-charcoal mb-2">Questionário</h3>
              <p className="text-slate mb-6">
                Responda algumas perguntas sobre seu tom de pele, cabelo e olhos
              </p>

              {/* Features list with colored bullets */}
              <ul className="text-sm text-slate mb-8 space-y-2 text-left max-w-xs mx-auto">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-coral" />
                  7 perguntas simples
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal" />
                  Resultado instantâneo
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sunny" />
                  Não precisa de foto
                </li>
              </ul>

              <Link href="/questionario">
                <Button className="w-full btn-playful bg-coral hover:bg-coral-dark text-white text-lg py-6">
                  Fazer Questionário
                </Button>
              </Link>
            </div>
          </div>

          {/* Photo Analysis Card */}
          <div className="group card-playful-shadow bg-white animate-slide-up-bounce delay-200" style={{ boxShadow: '6px 6px 0 0 var(--color-teal)' }}>
            <div className="text-center">
              {/* Icon with bounce */}
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-teal to-mint flex items-center justify-center group-hover:animate-wiggle shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>

              <h3 className="font-display font-bold text-2xl text-charcoal mb-2">Análise com IA</h3>
              <p className="text-slate mb-6">
                Envie uma foto e nossa IA analisará suas cores automaticamente
              </p>

              {/* Features list with colored bullets */}
              <ul className="text-sm text-slate mb-8 space-y-2 text-left max-w-xs mx-auto">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal" />
                  Análise por inteligência artificial
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-lavender" />
                  Resultado detalhado
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-mint" />
                  Requer foto com boa iluminação
                </li>
              </ul>

              <Link href="/analise-foto">
                <Button className="w-full btn-playful bg-teal hover:bg-teal-dark text-white text-lg py-6">
                  Analisar Foto
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Seasons Preview - Playful Grid */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-center text-charcoal mb-4">
          As 4 Estações da{' '}
          <span className="text-gradient-cool">Coloração Pessoal</span>
        </h2>
        <p className="text-center text-slate mb-12 max-w-xl mx-auto">
          Cada pessoa possui uma paleta de cores única baseada em suas características naturais
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {seasons.map((season, i) => (
            <SeasonPreviewCard
              key={season.name}
              {...season}
              delay={100 + i * 100}
            />
          ))}
        </div>
      </section>

      {/* Fun fact section */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-sunny/20 to-peach/20 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-sunny rounded-full opacity-30 animate-bounce-float" />
          <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-coral rounded-full opacity-30 animate-bounce-float delay-500" />

          <div className="relative">
            <span className="text-5xl mb-4 block">✨</span>
            <h3 className="font-display font-bold text-xl md:text-2xl text-charcoal mb-4">
              Você sabia?
            </h3>
            <p className="text-slate text-lg">
              Usar as cores certas pode fazer você parecer mais{' '}
              <span className="font-semibold text-coral">descansada</span>,{' '}
              <span className="font-semibold text-teal">saudável</span> e{' '}
              <span className="font-semibold text-lavender">radiante</span>!
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center">
        <div className="flex items-center justify-center gap-2 text-slate">
          <span className="font-display font-bold text-charcoal">AuraCor</span>
          <span className="text-coral">•</span>
          <span>Análise de Coloração Pessoal com IA</span>
        </div>
        <div className="flex justify-center gap-2 mt-4">
          {['#FF6B6B', '#4ECDC4', '#FFE66D', '#A594F9'].map((color, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full animate-bounce-float"
              style={{ backgroundColor: color, animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </footer>
    </main>
  );
}
