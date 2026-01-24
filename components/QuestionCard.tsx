'use client';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface QuestionCardProps {
  questionNumber: number;
  totalQuestions: number;
  question: string;
  options: { text: string }[];
  selectedOption: number | null;
  onSelect: (optionIndex: number) => void;
}

// Colors for option indicators
const optionColors = [
  { bg: 'bg-coral/10', border: 'border-coral', dot: 'bg-coral' },
  { bg: 'bg-teal/10', border: 'border-teal', dot: 'bg-teal' },
  { bg: 'bg-sunny/10', border: 'border-sunny', dot: 'bg-sunny' },
  { bg: 'bg-lavender/10', border: 'border-lavender', dot: 'bg-lavender' },
  { bg: 'bg-mint/10', border: 'border-mint', dot: 'bg-mint' },
  { bg: 'bg-peach/10', border: 'border-peach', dot: 'bg-peach' },
];

export function QuestionCard({
  question,
  options,
  selectedOption,
  onSelect,
}: QuestionCardProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Question card with playful shadow */}
      <div className="card-playful-shadow bg-white dark:bg-card rounded-3xl overflow-hidden">
        {/* Colorful top bar */}
        <div className="h-1.5 bg-gradient-to-r from-coral via-sunny to-teal" />

        <div className="p-6 md:p-8">
          {/* Question text */}
          <h2 className="text-xl md:text-2xl font-display font-bold text-charcoal dark:text-white mb-6 leading-relaxed">
            {question}
          </h2>

          {/* Options */}
          <RadioGroup
            value={selectedOption?.toString()}
            onValueChange={(value) => onSelect(parseInt(value))}
            className="space-y-3"
          >
            {options.map((option, index) => {
              const color = optionColors[index % optionColors.length];
              const isSelected = selectedOption === index;

              return (
                <div key={index} className="relative group">
                  <RadioGroupItem
                    value={index.toString()}
                    id={`option-${index}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`option-${index}`}
                    className={`
                      flex items-center p-4 md:p-5 rounded-2xl border-2 cursor-pointer
                      transition-all duration-200 ease-out
                      ${isSelected
                        ? `${color.border} ${color.bg} scale-[1.02]`
                        : 'border-border hover:border-coral/30 hover:bg-muted/50'
                      }
                      group-hover:scale-[1.01]
                    `}
                  >
                    {/* Custom radio indicator */}
                    <div className={`
                      w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center
                      transition-all duration-200 flex-shrink-0
                      ${isSelected ? color.border : 'border-slate/30'}
                    `}>
                      <div className={`
                        w-3 h-3 rounded-full transition-all duration-200
                        ${isSelected ? `${color.dot} scale-100` : 'scale-0'}
                      `} />
                    </div>

                    {/* Option text */}
                    <span className={`
                      text-base md:text-lg transition-colors
                      ${isSelected ? 'text-charcoal dark:text-white font-medium' : 'text-slate'}
                    `}>
                      {option.text}
                    </span>

                    {/* Selected indicator emoji */}
                    {isSelected && (
                      <span className="ml-auto text-lg animate-pop-in">
                        {index === 0 ? '🎯' : index === 1 ? '✨' : index === 2 ? '💫' : index === 3 ? '🌟' : '⭐'}
                      </span>
                    )}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </div>
      </div>

      {/* Helpful tip */}
      <p className="text-center text-sm text-slate mt-4 opacity-75">
        Escolha a opção que mais combina com você
      </p>
    </div>
  );
}
