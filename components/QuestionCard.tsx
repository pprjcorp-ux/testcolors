'use client';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QuestionCardProps {
  questionNumber: number;
  totalQuestions: number;
  question: string;
  options: { text: string }[];
  selectedOption: number | null;
  onSelect: (optionIndex: number) => void;
}

export function QuestionCard({
  questionNumber,
  totalQuestions,
  question,
  options,
  selectedOption,
  onSelect,
}: QuestionCardProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto bg-white/90 backdrop-blur shadow-lg border-0">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-purple-600">
            Pergunta {questionNumber} de {totalQuestions}
          </span>
          <span className="text-sm text-gray-400">
            {Math.round((questionNumber / totalQuestions) * 100)}%
          </span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
        <CardTitle className="text-xl md:text-2xl font-semibold text-gray-800 mt-4">
          {question}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedOption?.toString()}
          onValueChange={(value) => onSelect(parseInt(value))}
          className="space-y-3"
        >
          {options.map((option, index) => (
            <div key={index} className="relative">
              <RadioGroupItem
                value={index.toString()}
                id={`option-${index}`}
                className="peer sr-only"
              />
              <Label
                htmlFor={`option-${index}`}
                className="flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                  border-gray-200 hover:border-purple-300 hover:bg-purple-50
                  peer-data-[state=checked]:border-purple-500 peer-data-[state=checked]:bg-purple-50"
              >
                <div className="w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center
                  border-gray-300 peer-data-[state=checked]:border-purple-500">
                  {selectedOption === index && (
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                  )}
                </div>
                <span className="text-gray-700">{option.text}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
