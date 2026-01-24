import OpenAI from 'openai';
import { SubSeason, ParentSeason } from './color-seasons';

// Lazy initialization to avoid build-time errors when API key is not set
let openaiInstance: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    openaiInstance = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
  }
  return openaiInstance;
}

export interface AnalysisResult {
  season: SubSeason;
  confidence: number;
  undertone: string;
  contrast: string;
  details: string;
}

// Mapeamento de estação pai + características para sub-estação
function mapToSubSeason(
  parentSeason: ParentSeason,
  intensity: 'light' | 'bright' | 'soft' | 'deep'
): SubSeason {
  const mapping: Record<ParentSeason, Record<string, SubSeason>> = {
    primavera: {
      light: 'primavera-clara',
      bright: 'primavera-brilhante',
      soft: 'primavera-quente',
      deep: 'primavera-brilhante',
    },
    verao: {
      light: 'verao-claro',
      bright: 'verao-frio',
      soft: 'verao-suave',
      deep: 'verao-frio',
    },
    outono: {
      light: 'outono-suave',
      bright: 'outono-quente',
      soft: 'outono-suave',
      deep: 'outono-profundo',
    },
    inverno: {
      light: 'inverno-brilhante',
      bright: 'inverno-brilhante',
      soft: 'inverno-frio',
      deep: 'inverno-profundo',
    },
  };

  return mapping[parentSeason][intensity];
}

export async function analyzePhoto(base64Image: string): Promise<AnalysisResult> {
  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `Você é um especialista em coloração pessoal e análise de cores. Analise a foto fornecida e determine a estação de cores da pessoa usando o sistema de 12 sub-estações.

As 12 sub-estações são:
- Primavera: Quente, Clara, Brilhante
- Verão: Suave, Claro, Frio
- Outono: Suave, Quente, Profundo
- Inverno: Profundo, Frio, Brilhante

Considere:
- Subtom da pele (quente/dourado vs frio/rosado)
- Cor e intensidade dos olhos
- Cor natural do cabelo
- Contraste geral entre pele, olhos e cabelo
- Intensidade/saturação das cores naturais

Responda APENAS em JSON válido com este formato:
{
  "parentSeason": "primavera" | "verao" | "outono" | "inverno",
  "intensity": "light" | "bright" | "soft" | "deep",
  "confidence": número de 0 a 100,
  "undertone": "quente" | "frio" | "neutro",
  "contrast": "baixo" | "medio" | "alto",
  "details": "explicação breve em português sobre a análise"
}`
      },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: base64Image.startsWith('data:')
                ? base64Image
                : `data:image/jpeg;base64,${base64Image}`,
            },
          },
          {
            type: 'text',
            text: 'Analise esta foto e determine a estação de cores desta pessoa usando o sistema de 12 sub-estações.'
          }
        ],
      },
    ],
    max_tokens: 500,
  });

  const content = response.choices[0]?.message?.content || '';

  try {
    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const subSeason = mapToSubSeason(
        parsed.parentSeason as ParentSeason,
        parsed.intensity as 'light' | 'bright' | 'soft' | 'deep'
      );

      return {
        season: subSeason,
        confidence: parsed.confidence,
        undertone: parsed.undertone,
        contrast: parsed.contrast,
        details: parsed.details,
      };
    }
  } catch (e) {
    console.error('Failed to parse OpenAI response:', content);
  }

  // Default fallback
  return {
    season: 'primavera-quente',
    confidence: 50,
    undertone: 'neutro',
    contrast: 'medio',
    details: 'Não foi possível analisar a imagem com precisão. Tente enviar uma foto com boa iluminação mostrando seu rosto claramente.'
  };
}
