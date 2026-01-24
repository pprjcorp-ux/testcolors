'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { QuestionCard } from '@/components/QuestionCard';
import { Button } from '@/components/ui/button';
import { questions, calculateSeason } from '@/lib/color-seasons';

export default function QuestionarioPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isCalculating, setIsCalculating] = useState(false);

  const question = questions[currentQuestion];
  const selectedOption = answers[question.id] ?? null;

  const handleSelect = (optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [question.id]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      // Calculate result
      setIsCalculating(true);
      const season = calculateSeason(answers);

      // Navigate to result page with the season
      setTimeout(() => {
        router.push(`/resultado?estacao=${season}&source=questionario`);
      }, 1500);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  // Playful loading state
  if (isCalculating) {
    return (
      <main className="min-h-screen relative overflow-hidden">
        <Header />

        {/* Animated background shapes */}
        <div className="fixed inset-0 pointer-events-none -z-10">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-coral rounded-full opacity-20 animate-bounce-float" />
          <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-teal rounded-full opacity-20 animate-bounce-float delay-200" />
          <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-sunny rounded-full opacity-20 animate-bounce-float delay-400" />
          <div className="absolute bottom-1/3 right-1/3 w-28 h-28 bg-lavender rounded-full opacity-20 animate-bounce-float delay-300" />
        </div>

        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="space-y-6 animate-pop-in">
            {/* Playful spinner */}
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-muted" />
              <div className="absolute inset-0 rounded-full border-4 border-coral border-t-transparent animate-spin" />
              <div className="absolute inset-2 rounded-full border-4 border-teal border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
              <div className="absolute inset-4 rounded-full border-4 border-sunny border-l-transparent animate-spin" style={{ animationDuration: '1.2s' }} />
              <span className="absolute inset-0 flex items-center justify-center text-2xl animate-bounce-float">
                ✨
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-display font-bold text-charcoal">
              Analisando suas respostas...
            </h2>
            <p className="text-slate text-lg">
              Descobrindo sua estação de{' '}
              <span className="text-gradient-playful font-semibold">cores perfeita</span>
            </p>

            {/* Animated color dots */}
            <div className="flex justify-center gap-3 pt-4">
              {['#FF6B6B', '#4ECDC4', '#FFE66D', '#A594F9'].map((color, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded-full animate-wave"
                  style={{
                    backgroundColor: color,
                    animationDelay: `${i * 0.15}s`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <main className="min-h-screen relative">
      {/* Subtle background decoration */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-coral/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal/5 rounded-full blur-3xl" />
      </div>

      <Header />

      <section className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Header with playful styling */}
        <div className="text-center mb-8 animate-slide-up-bounce">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-charcoal mb-2">
            Questionário de{' '}
            <span className="text-gradient-warm">Coloração</span>
          </h1>
          <p className="text-slate text-lg">
            Responda às perguntas para descobrir sua estação de cores
          </p>
        </div>

        {/* Progress section */}
        <div className="max-w-2xl mx-auto mb-8 animate-slide-up-bounce delay-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate">
              Pergunta {currentQuestion + 1} de {questions.length}
            </span>
            <span className="text-sm font-bold text-coral">
              {Math.round(progress)}%
            </span>
          </div>

          {/* Playful progress bar */}
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-coral via-sunny to-teal transition-all duration-500 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-gradient" />
            </div>
          </div>

          {/* Question step indicators */}
          <div className="flex justify-between mt-4">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i < currentQuestion
                    ? 'bg-teal scale-100'
                    : i === currentQuestion
                    ? 'bg-coral scale-125'
                    : 'bg-muted scale-100'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Question Card */}
        <div className="animate-slide-up-bounce delay-150">
          <QuestionCard
            questionNumber={currentQuestion + 1}
            totalQuestions={questions.length}
            question={question.question}
            options={question.options}
            selectedOption={selectedOption}
            onSelect={handleSelect}
          />
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8 max-w-2xl mx-auto animate-slide-up-bounce delay-200">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            size="lg"
            className="min-w-[120px]"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Anterior
          </Button>

          <Button
            onClick={handleNext}
            disabled={selectedOption === null}
            size="lg"
            className={`min-w-[140px] ${
              currentQuestion === questions.length - 1
                ? 'bg-gradient-to-r from-coral to-peach'
                : ''
            }`}
          >
            {currentQuestion === questions.length - 1 ? (
              <>
                Ver Resultado
                <span className="ml-1">✨</span>
              </>
            ) : (
              <>
                Próxima
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </Button>
        </div>
      </section>
    </main>
  );
}
