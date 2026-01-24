import { NextRequest, NextResponse } from 'next/server';
import { analyzePhoto } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: 'Nenhuma imagem fornecida' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'Chave da API OpenAI não configurada. Adicione OPENAI_API_KEY no arquivo .env.local' },
        { status: 500 }
      );
    }

    const result = await analyzePhoto(image);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error analyzing photo:', error);
    
    return NextResponse.json(
      { error: 'Erro ao analisar a foto. Tente novamente.' },
      { status: 500 }
    );
  }
}
