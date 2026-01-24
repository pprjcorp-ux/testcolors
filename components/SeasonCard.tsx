'use client';

import { SeasonData } from '@/lib/color-seasons';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ColorPalette } from './ColorPalette';

interface SeasonCardProps {
  season: SeasonData;
  confidence?: number;
  undertone?: string;
  contrast?: string;
  details?: string;
  source: 'questionario' | 'foto';
}

export function SeasonCard({
  season,
  confidence,
  undertone,
  contrast,
  details,
  source
}: SeasonCardProps) {
  // Emoji baseado na estação pai
  const getSeasonEmoji = () => {
    switch (season.parentSeason) {
      case 'primavera': return '🌸';
      case 'verao': return '☀️';
      case 'outono': return '🍂';
      case 'inverno': return '❄️';
      default: return '✨';
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Result Card */}
      <Card className={`overflow-hidden border-0 shadow-xl bg-gradient-to-br ${season.gradient}`}>
        <CardHeader className="text-center pt-8 pb-4">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/30 backdrop-blur flex items-center justify-center">
            <span className="text-4xl">{getSeasonEmoji()}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white drop-shadow-md">
            Você é {season.name}!
          </h2>
          <p className="text-xl text-white/90 font-medium mt-1">
            {season.subtitle}
          </p>
          
          {source === 'foto' && confidence && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur rounded-full text-white text-sm">
              <span>Confiança da análise:</span>
              <span className="font-bold">{confidence}%</span>
            </div>
          )}
        </CardHeader>
        <CardContent className="bg-white/95 backdrop-blur rounded-t-3xl pt-8 pb-6 mt-4">
          <p className="text-gray-600 text-center text-lg leading-relaxed max-w-2xl mx-auto">
            {season.description}
          </p>
          
          {details && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl text-gray-600 text-sm">
              <p className="font-medium text-gray-700 mb-1">Análise da IA:</p>
              {details}
              {undertone && contrast && (
                <p className="mt-2 text-gray-500">
                  Subtom: <span className="font-medium">{undertone}</span> | 
                  Contraste: <span className="font-medium">{contrast}</span>
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Characteristics */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <h3 className="text-xl font-semibold text-gray-800">Suas Características</h3>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {season.characteristics.map((char, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="mt-1.5 w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex-shrink-0" />
                <span className="text-gray-600">{char}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Color Palette */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <h3 className="text-xl font-semibold text-gray-800">Sua Paleta de Cores</h3>
          <p className="text-gray-500 text-sm">Clique em uma cor para copiar o código</p>
        </CardHeader>
        <CardContent>
          <ColorPalette colors={season.palette} />
        </CardContent>
      </Card>

      {/* Colors to Avoid */}
      <Card className="border-0 shadow-lg bg-gray-50">
        <CardHeader>
          <h3 className="text-xl font-semibold text-gray-800">Cores para Evitar</h3>
          <p className="text-gray-500 text-sm">Essas cores podem não valorizar sua beleza natural</p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 flex-wrap">
            {season.avoidColors.map((color, index) => (
              <div 
                key={index}
                className="w-12 h-12 rounded-lg shadow-inner border border-gray-200"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Celebrities */}
      {season.celebrities && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <h3 className="text-xl font-semibold text-gray-800">Celebridades com sua Coloração</h3>
            <p className="text-gray-500 text-sm">Inspire-se nessas personalidades que compartilham sua paleta</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {season.celebrities.brazilian && season.celebrities.brazilian.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <span>🇧🇷</span> Brasileiras
                </h4>
                <p className="text-gray-600 text-sm">{season.celebrities.brazilian.join(', ')}</p>
              </div>
            )}
            {season.celebrities.international && season.celebrities.international.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <span>🌍</span> Internacionais
                </h4>
                <p className="text-gray-600 text-sm">{season.celebrities.international.join(', ')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <h3 className="text-xl font-semibold text-gray-800">Dicas para Você</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-xl bg-purple-50">
            <h4 className="font-medium text-purple-800 mb-2 flex items-center gap-2">
              <span>👗</span> Roupas
            </h4>
            <p className="text-purple-700 text-sm">{season.tips.roupas}</p>
          </div>

          <div className="p-4 rounded-xl bg-pink-50">
            <h4 className="font-medium text-pink-800 mb-2 flex items-center gap-2">
              <span>💄</span> Maquiagem
            </h4>
            <p className="text-pink-700 text-sm">{season.tips.maquiagem}</p>
          </div>

          <div className="p-4 rounded-xl bg-amber-50">
            <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
              <span>💍</span> Acessórios
            </h4>
            <p className="text-amber-700 text-sm">{season.tips.acessorios}</p>
          </div>

          {season.tips.cabelo && (
            <div className="p-4 rounded-xl bg-indigo-50">
              <h4 className="font-medium text-indigo-800 mb-2 flex items-center gap-2">
                <span>💇</span> Cabelo
              </h4>
              <p className="text-indigo-700 text-sm">{season.tips.cabelo}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
