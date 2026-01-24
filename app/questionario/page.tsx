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
      }, 1000);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  if (isCalculating) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="animate-pulse space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
              <svg className="w-10 h-10 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">Analisando suas respostas...</h2>
            <p className="text-gray-500">Descobrindo sua estação de cores perfeita</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Header />
      
      <section className="max-w-4xl mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Questionário de Coloração Pessoal
          </h1>
          <p className="text-gray-600">
            Responda às perguntas para descobrir sua estação de cores
          </p>
        </div>

        <QuestionCard
          questionNumber={currentQuestion + 1}
          totalQuestions={questions.length}
          question={question.question}
          options={question.options}
          selectedOption={selectedOption}
          onSelect={handleSelect}
        />

        <div className="flex justify-between mt-8 max-w-2xl mx-auto">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="px-6"
          >
            Anterior
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={selectedOption === null}
            className="px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {currentQuestion === questions.length - 1 ? 'Ver Resultado' : 'Próxima'}
          </Button>
        </div>
      </section>
    </main>
  );
}
