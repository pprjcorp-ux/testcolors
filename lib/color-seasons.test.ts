import {
  seasons,
  questions,
  calculateSeason,
  calculateParentSeason,
  getParentSeason,
  getSubSeasonsByParent,
  SubSeason,
  ParentSeason,
  SeasonData,
} from './color-seasons';

describe('12 Sub-Seasons System', () => {
  // ============ TESTES DE ESTRUTURA ============
  describe('Structure Tests', () => {
    test('should have exactly 12 sub-seasons defined', () => {
      const subSeasons = Object.keys(seasons);
      expect(subSeasons).toHaveLength(12);
    });

    test('should have 3 sub-seasons for each parent season', () => {
      const parentSeasons: ParentSeason[] = ['primavera', 'verao', 'outono', 'inverno'];

      parentSeasons.forEach(parent => {
        const subSeasons = getSubSeasonsByParent(parent);
        expect(subSeasons).toHaveLength(3);
      });
    });

    test('each sub-season should have all required fields', () => {
      const requiredFields: (keyof SeasonData)[] = [
        'id',
        'parentSeason',
        'name',
        'subtitle',
        'description',
        'characteristics',
        'celebrities',
        'palette',
        'avoidColors',
        'tips',
        'gradient',
      ];

      Object.values(seasons).forEach(season => {
        requiredFields.forEach(field => {
          expect(season).toHaveProperty(field);
        });
      });
    });

    test('each sub-season should have exactly 12 colors in palette', () => {
      Object.entries(seasons).forEach(([id, season]) => {
        expect(season.palette).toHaveLength(12);
        // Verify all colors are valid hex codes
        season.palette.forEach(color => {
          expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
        });
      });
    });

    test('each sub-season should have at least 5 colors to avoid', () => {
      Object.values(seasons).forEach(season => {
        expect(season.avoidColors.length).toBeGreaterThanOrEqual(5);
      });
    });

    test('each sub-season should have brazilian and international celebrities', () => {
      Object.values(seasons).forEach(season => {
        expect(season.celebrities.brazilian.length).toBeGreaterThanOrEqual(2);
        expect(season.celebrities.international.length).toBeGreaterThanOrEqual(2);
      });
    });

    test('each sub-season should have all tip categories', () => {
      const tipCategories = ['roupas', 'maquiagem', 'acessorios', 'cabelo'];

      Object.values(seasons).forEach(season => {
        tipCategories.forEach(category => {
          expect(season.tips).toHaveProperty(category);
          expect(season.tips[category as keyof typeof season.tips]).toBeTruthy();
        });
      });
    });

    test('all 12 specific sub-seasons should be present', () => {
      const expectedSubSeasons: SubSeason[] = [
        'primavera-quente', 'primavera-clara', 'primavera-brilhante',
        'verao-suave', 'verao-claro', 'verao-frio',
        'outono-suave', 'outono-quente', 'outono-profundo',
        'inverno-profundo', 'inverno-frio', 'inverno-brilhante',
      ];

      expectedSubSeasons.forEach(subSeason => {
        expect(seasons).toHaveProperty(subSeason);
      });
    });
  });

  // ============ TESTES DE QUESTIONÁRIO ============
  describe('Questionnaire Tests', () => {
    test('should have at least 10 questions (7 basic + 3 refinement)', () => {
      expect(questions.length).toBeGreaterThanOrEqual(10);
    });

    test('should have at least 3 refinement questions', () => {
      const refinementQuestions = questions.filter(q => q.category === 'refinement');
      expect(refinementQuestions.length).toBeGreaterThanOrEqual(3);
    });

    test('all questions should have category defined', () => {
      questions.forEach(q => {
        expect(q.category).toBeDefined();
        expect(['basic', 'refinement']).toContain(q.category);
      });
    });

    test('refinement questions should have subPoints', () => {
      const refinementQuestions = questions.filter(q => q.category === 'refinement');

      refinementQuestions.forEach(q => {
        const hasSubPoints = q.options.some(opt => opt.subPoints !== undefined);
        expect(hasSubPoints).toBe(true);
      });
    });

    test('each question should have unique id', () => {
      const ids = questions.map(q => q.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  // ============ TESTES DE CÁLCULO DE ESTAÇÃO PAI ============
  describe('calculateParentSeason', () => {
    test('should return primavera for warm, light answers', () => {
      const warmLightAnswers: Record<string, number> = {
        skin_undertone: 0, // Dourado/Amarelado
        eye_color: 0, // Azul claro, verde claro ou mel
        hair_color: 0, // Loiro dourado, ruivo claro
        sun_reaction: 0, // Fica dourada facilmente
        best_metal: 0, // Ouro amarelo
        best_white: 0, // Branco creme
        overall_contrast: 1, // Médio contraste
      };

      const result = calculateParentSeason(warmLightAnswers);
      expect(result).toBe('primavera');
    });

    test('should return verao for cool, soft answers', () => {
      const coolSoftAnswers: Record<string, number> = {
        skin_undertone: 1, // Rosado/Azulado
        eye_color: 1, // Azul acinzentado, verde-água
        hair_color: 1, // Loiro acinzentado, castanho claro
        sun_reaction: 1, // Queima primeiro, depois bronzeia
        best_metal: 1, // Prata ou ouro branco
        best_white: 0, // Branco creme (mais suave)
        overall_contrast: 0, // Baixo contraste
      };

      const result = calculateParentSeason(coolSoftAnswers);
      expect(result).toBe('verao');
    });

    test('should return outono for warm, deep answers', () => {
      const warmDeepAnswers: Record<string, number> = {
        skin_undertone: 0, // Dourado/Amarelado
        eye_color: 2, // Castanho escuro, verde oliva
        hair_color: 2, // Castanho escuro com reflexos acobreados
        sun_reaction: 0, // Fica dourada facilmente
        best_metal: 0, // Ouro amarelo
        best_white: 0, // Branco creme
        overall_contrast: 1, // Médio contraste
      };

      const result = calculateParentSeason(warmDeepAnswers);
      expect(result).toBe('outono');
    });

    test('should return inverno for cool, high contrast answers', () => {
      const coolHighContrastAnswers: Record<string, number> = {
        skin_undertone: 1, // Rosado/Azulado
        eye_color: 3, // Preto, castanho muito escuro
        hair_color: 3, // Preto, castanho muito escuro
        sun_reaction: 2, // Queima facilmente
        best_metal: 1, // Prata ou ouro branco
        best_white: 1, // Branco puro
        overall_contrast: 2, // Alto contraste
      };

      const result = calculateParentSeason(coolHighContrastAnswers);
      expect(result).toBe('inverno');
    });
  });

  // ============ TESTES DE CÁLCULO DE SUB-ESTAÇÃO ============
  describe('calculateSeason (sub-season calculation)', () => {
    test('should return primavera-clara for light spring profile', () => {
      const lightSpringAnswers: Record<string, number> = {
        skin_undertone: 0, // Warm
        eye_color: 0, // Light eyes (+2 light)
        hair_color: 0, // Light golden hair (+2 light)
        sun_reaction: 0,
        best_metal: 0,
        best_white: 0, // Cream white (+1 light)
        overall_contrast: 0, // Low contrast (+2 light)
        color_intensity: 3, // Light colors (+2 light)
        black_clothing: 2, // Black makes me look washed out (+2 light)
        pastel_colors: 0, // Pastels look perfect (+2 light)
      };

      const result = calculateSeason(lightSpringAnswers);
      expect(result).toBe('primavera-clara');
    });

    test('should return primavera-brilhante for bright spring profile', () => {
      const brightSpringAnswers: Record<string, number> = {
        skin_undertone: 0, // Warm
        eye_color: 0, // Light but bright eyes
        hair_color: 0,
        sun_reaction: 0,
        best_metal: 0,
        best_white: 1, // Pure white (+2 bright)
        overall_contrast: 2, // High contrast (+2 bright)
        color_intensity: 0, // Vibrant colors (+2 bright)
        black_clothing: 0, // Black looks great (+1 bright)
        pastel_colors: 2, // Pastels wash me out (+2 bright)
      };

      const result = calculateSeason(brightSpringAnswers);
      expect(result).toBe('primavera-brilhante');
    });

    test('should return verao-suave for soft summer profile', () => {
      const softSummerAnswers: Record<string, number> = {
        skin_undertone: 1, // Cool
        eye_color: 2, // Soft eyes (+1 soft)
        hair_color: 1,
        sun_reaction: 1,
        best_metal: 2, // Rose gold (+1 soft)
        best_white: 0, // Cream (+1 soft)
        overall_contrast: 0, // Low contrast (+2 soft)
        color_intensity: 1, // Muted colors (+2 soft)
        black_clothing: 1, // Needs makeup with black (+1 soft)
        pastel_colors: 3, // Prefers dusty versions (+2 soft)
      };

      const result = calculateSeason(softSummerAnswers);
      expect(result).toBe('verao-suave');
    });

    test('should return verao-frio for cool summer profile', () => {
      // Verão Frio: tons frios dominantes, cores saturadas frias
      // Para obter verao-frio, preciso: parent=verao E (bright OU deep) dominante
      // Calculando subPoints:
      // - eye_color:3 (preto/muito escuro) = +2 deep, +1 bright (mas dá +2 inverno em pontos normais)
      // - hair_color:1 = +1 light, +1 soft
      // - best_white:1 (branco puro) = +2 bright, +1 deep (mas dá +2 inverno)
      // - overall_contrast:2 = +2 bright, +2 deep (mas dá +2 inverno)
      // - color_intensity:0 = +2 bright
      // - black_clothing:0 = +2 deep, +1 bright (mas dá +2 inverno)
      // - pastel_colors:2 = +2 bright, +1 deep
      //
      // O problema é que opções que dão bright/deep também dão pontos para inverno.
      // Para ter verao dominante E bright dominante, preciso escolher cuidadosamente.

      const coolSummerAnswers: Record<string, number> = {
        skin_undertone: 1, // Cool (+2 verao, +2 inverno)
        eye_color: 1, // Azul acinzentado (+2 verao, +1 light, +1 soft)
        hair_color: 1, // Loiro acinzentado (+2 verao, +1 light, +1 soft)
        sun_reaction: 1, // Queima primeiro (+2 verao, +1 inverno)
        best_metal: 1, // Prata (+2 verao, +2 inverno)
        best_white: 1, // Branco puro (+1 verao, +2 inverno, +2 bright, +1 deep)
        overall_contrast: 1, // Médio contraste (+1 verao, +1 soft) - evita dar pontos para inverno
        color_intensity: 0, // Cores vibrantes (+2 bright)
        black_clothing: 2, // Me deixa apagada (+2 verao, +2 light, +1 soft) - reforça verao
        pastel_colors: 2, // Precisa de mais cor (+2 inverno, +2 bright, +1 deep)
      };
      // Pontos verao: 2+2+2+2+2+1+1+2 = 14
      // Pontos inverno: 2+1+2+2+2 = 9
      // bright: 2+2+2 = 6
      // soft: 1+1+1+1 = 4
      // light: 1+1+2 = 4
      // deep: 1+1 = 2
      // bright ganha!

      const result = calculateSeason(coolSummerAnswers);
      expect(result).toBe('verao-frio');
    });

    test('should return outono-profundo for deep autumn profile', () => {
      const deepAutumnAnswers: Record<string, number> = {
        skin_undertone: 0, // Warm
        eye_color: 2, // Dark eyes (+1 deep)
        hair_color: 2, // Dark auburn (+1 deep)
        sun_reaction: 0,
        best_metal: 0,
        best_white: 1, // Pure white (+1 deep)
        overall_contrast: 2, // High contrast (+2 deep)
        color_intensity: 2, // Deep rich colors (+2 deep)
        black_clothing: 3, // Prefers dark brown (+1 deep)
        pastel_colors: 2, // Pastels wash out (+1 deep)
      };

      const result = calculateSeason(deepAutumnAnswers);
      expect(result).toBe('outono-profundo');
    });

    test('should return inverno-profundo for deep winter profile', () => {
      const deepWinterAnswers: Record<string, number> = {
        skin_undertone: 1, // Cool
        eye_color: 3, // Very dark eyes (+2 deep)
        hair_color: 3, // Black hair (+2 deep)
        sun_reaction: 2,
        best_metal: 1,
        best_white: 1, // Pure white (+1 deep)
        overall_contrast: 2, // High contrast (+2 deep)
        color_intensity: 2, // Deep colors (+2 deep)
        black_clothing: 0, // Black looks amazing (+2 deep)
        pastel_colors: 2, // Need more color (+1 deep)
      };

      const result = calculateSeason(deepWinterAnswers);
      expect(result).toBe('inverno-profundo');
    });

    test('should return inverno-brilhante for bright winter profile', () => {
      const brightWinterAnswers: Record<string, number> = {
        skin_undertone: 1, // Cool
        eye_color: 3, // Bright eyes (+1 bright)
        hair_color: 3, // High contrast (+1 bright)
        sun_reaction: 2,
        best_metal: 1,
        best_white: 1, // Pure white (+2 bright)
        overall_contrast: 2, // High contrast (+2 bright)
        color_intensity: 0, // Vibrant colors (+2 bright)
        black_clothing: 0, // Black looks amazing (+1 bright)
        pastel_colors: 2, // Pastels wash me out (+2 bright)
      };

      const result = calculateSeason(brightWinterAnswers);
      expect(result).toBe('inverno-brilhante');
    });
  });

  // ============ TESTES DE FUNÇÕES AUXILIARES ============
  describe('Helper Functions', () => {
    test('getParentSeason should return correct parent for each sub-season', () => {
      expect(getParentSeason('primavera-quente')).toBe('primavera');
      expect(getParentSeason('primavera-clara')).toBe('primavera');
      expect(getParentSeason('primavera-brilhante')).toBe('primavera');

      expect(getParentSeason('verao-suave')).toBe('verao');
      expect(getParentSeason('verao-claro')).toBe('verao');
      expect(getParentSeason('verao-frio')).toBe('verao');

      expect(getParentSeason('outono-suave')).toBe('outono');
      expect(getParentSeason('outono-quente')).toBe('outono');
      expect(getParentSeason('outono-profundo')).toBe('outono');

      expect(getParentSeason('inverno-profundo')).toBe('inverno');
      expect(getParentSeason('inverno-frio')).toBe('inverno');
      expect(getParentSeason('inverno-brilhante')).toBe('inverno');
    });

    test('getSubSeasonsByParent should return correct sub-seasons', () => {
      const primaveraSubSeasons = getSubSeasonsByParent('primavera');
      expect(primaveraSubSeasons).toContain('primavera-quente');
      expect(primaveraSubSeasons).toContain('primavera-clara');
      expect(primaveraSubSeasons).toContain('primavera-brilhante');

      const veraoSubSeasons = getSubSeasonsByParent('verao');
      expect(veraoSubSeasons).toContain('verao-suave');
      expect(veraoSubSeasons).toContain('verao-claro');
      expect(veraoSubSeasons).toContain('verao-frio');

      const outonoSubSeasons = getSubSeasonsByParent('outono');
      expect(outonoSubSeasons).toContain('outono-suave');
      expect(outonoSubSeasons).toContain('outono-quente');
      expect(outonoSubSeasons).toContain('outono-profundo');

      const invernoSubSeasons = getSubSeasonsByParent('inverno');
      expect(invernoSubSeasons).toContain('inverno-profundo');
      expect(invernoSubSeasons).toContain('inverno-frio');
      expect(invernoSubSeasons).toContain('inverno-brilhante');
    });
  });

  // ============ TESTES DE DESCRIÇÕES EM PORTUGUÊS ============
  describe('Portuguese Content', () => {
    test('all descriptions should be in Portuguese', () => {
      Object.values(seasons).forEach(season => {
        // Check for Portuguese words
        expect(season.description).toMatch(/você|sua|seu|cores|tons/i);
      });
    });

    test('all tips should be in Portuguese', () => {
      // Verifica que cada tip contém palavras em português comuns
      const portuguesePatterns = /cores|tons|evite|prefira|ideal|ouro|prata|pedras|sombras|batom|cabelo|roupas|maquiagem|acessorios|reflexos|claro|escuro|quente|frio|suave|brilhante|vibrante|castanho|mechas|cobre|dourado|intenso|loiro|ruivo|bronze|nude|rosa|azul|verde|vermelho|marrom|laranja|amarelo/i;

      Object.values(seasons).forEach(season => {
        Object.values(season.tips).forEach(tip => {
          expect(tip).toMatch(portuguesePatterns);
        });
      });
    });

    test('question texts should be in Portuguese', () => {
      questions.forEach(q => {
        expect(q.question).toMatch(/qual|como|quando/i);
      });
    });
  });
});
