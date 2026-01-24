// Sub-estações expandidas (12 tipos) - Sistema de Colorimetria Avançada
export type SubSeason =
  | 'primavera-quente' | 'primavera-clara' | 'primavera-brilhante'
  | 'verao-suave' | 'verao-claro' | 'verao-frio'
  | 'outono-suave' | 'outono-quente' | 'outono-profundo'
  | 'inverno-profundo' | 'inverno-frio' | 'inverno-brilhante';

// Tipo legado para compatibilidade
export type Season = SubSeason;

// Estações pai (4 principais)
export type ParentSeason = 'primavera' | 'verao' | 'outono' | 'inverno';

export interface SeasonData {
  id: SubSeason;
  parentSeason: ParentSeason;
  name: string;
  subtitle: string;
  description: string;
  characteristics: string[];
  celebrities: {
    brazilian: string[];
    international: string[];
  };
  palette: string[];
  avoidColors: string[];
  tips: {
    roupas: string;
    maquiagem: string;
    acessorios: string;
    cabelo: string;
  };
  gradient: string;
}

export const seasons: Record<SubSeason, SeasonData> = {
  // ============ PRIMAVERA ============
  'primavera-quente': {
    id: 'primavera-quente',
    parentSeason: 'primavera',
    name: 'Primavera Quente',
    subtitle: 'Warm Spring',
    description: 'Você é uma Primavera Quente! Seu visual é dominado por tons quentes e dourados. Sua pele tem um brilho dourado natural e você fica radiante em cores vivas e aquecidas que refletem a luz do sol.',
    characteristics: [
      'Pele com forte subtom dourado ou pêssego',
      'Olhos claros com tons quentes (mel, verde-dourado, azul-turquesa)',
      'Cabelo com reflexos dourados, acobreados ou ruivos',
      'Sardas douradas são comuns',
      'Aparência geral ensolarada e vibrante'
    ],
    celebrities: {
      brazilian: ['Angélica', 'Carolina Dieckmann', 'Paolla Oliveira'],
      international: ['Jennifer Lopez', 'Blake Lively', 'Amy Adams']
    },
    palette: [
      '#FF8C00', // Laranja dourado
      '#FFD700', // Ouro
      '#FF6347', // Tomate
      '#F4A460', // Sandy brown
      '#98D8AA', // Verde menta
      '#87CEEB', // Azul céu
      '#FFB347', // Pêssego escuro
      '#FFDAB9', // Pêssego
      '#40E0D0', // Turquesa
      '#FFA07A', // Salmão claro
      '#DAA520', // Goldenrod
      '#90EE90', // Verde claro
    ],
    avoidColors: [
      '#000000', // Preto puro
      '#4A0E4E', // Roxo escuro
      '#1C1C1C', // Cinza escuro
      '#FF69B4', // Rosa frio
      '#C0C0C0', // Prata
    ],
    tips: {
      roupas: 'Aposte em tons de laranja, coral, pêssego, turquesa e verde-limão. Tons terrosos quentes como caramelo e marrom dourado também funcionam bem.',
      maquiagem: 'Base com subtom dourado. Sombras em tons de pêssego, coral, bronze e cobre. Batom coral, pêssego ou vermelho alaranjado.',
      acessorios: 'Ouro amarelo é seu melhor amigo! Pedras como citrino, âmbar, coral e turquesa. Evite prata fria.',
      cabelo: 'Realce com tons dourados, acobreados, mel ou caramelo. Evite cinzas e platinados.'
    },
    gradient: 'from-amber-300 via-orange-400 to-yellow-300'
  },
  'primavera-clara': {
    id: 'primavera-clara',
    parentSeason: 'primavera',
    name: 'Primavera Clara',
    subtitle: 'Light Spring',
    description: 'Você é uma Primavera Clara! Sua coloração é delicada e luminosa, com baixo contraste e tons suaves e aquecidos. Você brilha em cores claras que não competem com sua aparência natural.',
    characteristics: [
      'Pele clara com subtom pêssego ou marfim quente',
      'Olhos claros (azul claro, verde claro, mel claro)',
      'Cabelo loiro claro, castanho claro dourado',
      'Baixo contraste entre pele, olhos e cabelo',
      'Aparência delicada e luminosa'
    ],
    celebrities: {
      brazilian: ['Angélica', 'Letícia Spiller', 'Vera Fischer'],
      international: ['Taylor Swift', 'Scarlett Johansson', 'Elle Fanning']
    },
    palette: [
      '#FFFACD', // Limão chiffon
      '#FFE4B5', // Mocassin
      '#98FB98', // Verde pálido
      '#87CEFA', // Azul claro
      '#FFDAB9', // Pêssego
      '#FFB6C1', // Rosa claro
      '#E0FFFF', // Ciano claro
      '#F0E68C', // Khaki claro
      '#DDA0DD', // Ameixa claro
      '#FAFAD2', // Goldenrod claro
      '#FFF0F5', // Lavanda blush
      '#B0E0E6', // Azul pó
    ],
    avoidColors: [
      '#000000', // Preto puro
      '#8B0000', // Vermelho escuro
      '#191970', // Azul meia-noite
      '#4B0082', // Índigo
      '#800020', // Borgonha
    ],
    tips: {
      roupas: 'Cores claras e suaves são ideais: pêssego, rosa claro, azul céu, verde-água, amarelo manteiga. Evite cores escuras e saturadas.',
      maquiagem: 'Tons suaves de pêssego, rosa claro e champagne. Evite maquiagem pesada - menos é mais para você.',
      acessorios: 'Ouro claro, ouro rosé ou pérolas. Pedras delicadas como quartzo rosa, água-marinha e opala.',
      cabelo: 'Loiro dourado claro, mel claro ou castanho com reflexos dourados suaves.'
    },
    gradient: 'from-yellow-100 via-orange-100 to-pink-100'
  },
  'primavera-brilhante': {
    id: 'primavera-brilhante',
    parentSeason: 'primavera',
    name: 'Primavera Brilhante',
    subtitle: 'Bright Spring',
    description: 'Você é uma Primavera Brilhante! Seu visual combina calor com alto contraste e saturação. Cores vibrantes e claras fazem você parecer viva e energética.',
    characteristics: [
      'Pele clara a média com subtom quente',
      'Olhos brilhantes e expressivos (azul vivo, verde vivo, mel)',
      'Cabelo médio a escuro com reflexos quentes',
      'Alto contraste com cores vibrantes',
      'Aparência vivaz e energética'
    ],
    celebrities: {
      brazilian: ['Ivete Sangalo', 'Claudia Raia', 'Débora Nascimento'],
      international: ['Emma Stone', 'Isla Fisher', 'Jessica Chastain']
    },
    palette: [
      '#FF4500', // Laranja vermelho
      '#00CED1', // Turquesa escuro
      '#FF6B6B', // Coral vivo
      '#32CD32', // Verde lima
      '#FF69B4', // Rosa quente
      '#FFD700', // Ouro
      '#00BFFF', // Azul deep sky
      '#FF7F50', // Coral
      '#7FFF00', // Chartreuse
      '#FF1493', // Deep pink
      '#20B2AA', // Verde mar claro
      '#FFA500', // Laranja
    ],
    avoidColors: [
      '#808080', // Cinza médio
      '#A9A9A9', // Cinza escuro
      '#D3D3D3', // Cinza claro
      '#8B4513', // Marrom opaco
      '#696969', // Dim gray
    ],
    tips: {
      roupas: 'Cores vibrantes e saturadas são perfeitas: coral vivo, turquesa, verde-limão, laranja. Evite tons neutros e opacos.',
      maquiagem: 'Batom coral vibrante, vermelho alaranjado ou rosa quente. Sombras turquesa, verde e dourado.',
      acessorios: 'Ouro polido, bijuterias coloridas e statement pieces. Pedras como esmeralda, topázio e coral.',
      cabelo: 'Ruivo vibrante, castanho com mechas cobre ou dourado intenso.'
    },
    gradient: 'from-orange-400 via-pink-400 to-yellow-400'
  },

  // ============ VERÃO ============
  'verao-suave': {
    id: 'verao-suave',
    parentSeason: 'verao',
    name: 'Verão Suave',
    subtitle: 'Soft Summer',
    description: 'Você é um Verão Suave! Sua coloração é delicada e acinzentada, com tons suaves que parecem levemente empoeirados. Você fica melhor em cores que não são nem muito quentes nem muito frias.',
    characteristics: [
      'Pele com subtom neutro-frio, levemente rosada',
      'Olhos suaves (verde-acinzentado, azul-acinzentado, castanho suave)',
      'Cabelo castanho médio acinzentado ou loiro escuro',
      'Baixo a médio contraste',
      'Aparência sofisticada e suave'
    ],
    celebrities: {
      brazilian: ['Fernanda Montenegro', 'Glória Pires', 'Adriana Esteves'],
      international: ['Jennifer Aniston', 'Sarah Jessica Parker', 'Drew Barrymore']
    },
    palette: [
      '#9FA8A3', // Cinza verde
      '#B4A7D6', // Lavanda suave
      '#A4C3B2', // Verde salvia
      '#CFB997', // Areia
      '#B5838D', // Rosa empoeirado
      '#97A2A2', // Cinza azulado
      '#C9B79C', // Bege suave
      '#9DB5B2', // Verde-água suave
      '#BEB4C5', // Lilás acinzentado
      '#A5A58D', // Verde oliva suave
      '#CCD5AE', // Verde sage
      '#D5C4A1', // Champagne
    ],
    avoidColors: [
      '#FF0000', // Vermelho puro
      '#FFFF00', // Amarelo puro
      '#FF4500', // Laranja vibrante
      '#000000', // Preto puro
      '#FFFFFF', // Branco puro
    ],
    tips: {
      roupas: 'Tons suaves e acinzentados: malva, verde-salvia, azul empoeirado, rosa antigo. Evite cores vibrantes e contrastes fortes.',
      maquiagem: 'Tons neutros e rosados suaves. Sombras em taupe, malva e cinza suave. Batom rosa empoeirado ou berry suave.',
      acessorios: 'Ouro rosé, prata fosca ou metais envelhecidos. Pedras suaves como quartzo fumê e ametista.',
      cabelo: 'Castanho com reflexos acinzentados, loiro escuro natural ou ombré suave.'
    },
    gradient: 'from-gray-300 via-purple-200 to-green-200'
  },
  'verao-claro': {
    id: 'verao-claro',
    parentSeason: 'verao',
    name: 'Verão Claro',
    subtitle: 'Light Summer',
    description: 'Você é um Verão Claro! Sua coloração é delicada e fria, com tons claros e suaves. Você brilha em cores pastel frias que complementam sua aparência etérea.',
    characteristics: [
      'Pele clara com subtom rosado ou azulado',
      'Olhos claros (azul claro, cinza, verde-água)',
      'Cabelo loiro claro acinzentado ou castanho muito claro',
      'Baixo contraste, aparência delicada',
      'Aparência etérea e elegante'
    ],
    celebrities: {
      brazilian: ['Adriana Lima (juventude)', 'Deborah Secco', 'Luiza Brunet'],
      international: ['Cate Blanchett', 'Naomi Watts', 'Kate Middleton']
    },
    palette: [
      '#E6E6FA', // Lavanda
      '#B0C4DE', // Azul aço claro
      '#FFB6C1', // Rosa claro
      '#ADD8E6', // Azul claro
      '#D8BFD8', // Thistle
      '#F0FFF0', // Honeydew
      '#E0FFFF', // Ciano claro
      '#FFF0F5', // Lavanda blush
      '#DCDCDC', // Gainsboro
      '#F5F5DC', // Bege claro
      '#E6F2FF', // Azul alice
      '#F0E6EF', // Rosa acinzentado claro
    ],
    avoidColors: [
      '#FF8C00', // Laranja escuro
      '#8B4513', // Marrom sela
      '#000000', // Preto puro
      '#FFD700', // Dourado
      '#CC5500', // Laranja queimado
    ],
    tips: {
      roupas: 'Pastel frios são perfeitos: lavanda, azul bebê, rosa claro, menta, cinza claro. Evite tons quentes e escuros.',
      maquiagem: 'Rosa suave, malva claro e tons berry delicados. Base com subtom rosado.',
      acessorios: 'Prata, ouro branco ou platina. Pérolas, diamantes e safiras claras.',
      cabelo: 'Loiro platinado suave, loiro acinzentado ou castanho claro sem tons dourados.'
    },
    gradient: 'from-blue-100 via-purple-100 to-pink-100'
  },
  'verao-frio': {
    id: 'verao-frio',
    parentSeason: 'verao',
    name: 'Verão Frio',
    subtitle: 'Cool Summer',
    description: 'Você é um Verão Frio! Sua coloração é dominada por tons frios e rosados. Você fica deslumbrante em cores frias e suaves que realçam seu subtom natural.',
    characteristics: [
      'Pele com forte subtom rosado ou azulado',
      'Olhos frios (azul, cinza, verde-azulado)',
      'Cabelo castanho acinzentado ou loiro cinza',
      'Médio contraste com tons frios',
      'Aparência elegante e sofisticada'
    ],
    celebrities: {
      brazilian: ['Camila Pitanga', 'Taís Araújo', 'Grazi Massafera'],
      international: ['Emily Blunt', 'Olivia Munn', 'Victoria Beckham']
    },
    palette: [
      '#4682B4', // Azul aço
      '#DDA0DD', // Ameixa
      '#DB7093', // Rosa antigo
      '#778899', // Cinza ardósia
      '#8B4789', // Orquídea escuro
      '#87CEEB', // Azul céu
      '#BC8F8F', // Rosa empoeirado
      '#6A5ACD', // Slate blue
      '#708090', // Slate gray
      '#9370DB', // Roxo médio
      '#C0C0C0', // Prata
      '#B0E0E6', // Azul pó
    ],
    avoidColors: [
      '#FF4500', // Laranja vermelho
      '#FFD700', // Dourado
      '#8B4513', // Marrom quente
      '#F4A460', // Sandy brown
      '#FF6347', // Tomate
    ],
    tips: {
      roupas: 'Tons frios e saturados: azul royal, roxo, pink frio, verde-esmeralda frio. Cinzas azulados funcionam bem.',
      maquiagem: 'Tons de rosa frio, berry, malva e roxo. Evite bronzers dourados - prefira rosados.',
      acessorios: 'Prata polida, ouro branco ou platina. Safiras, ametistas e água-marinhas.',
      cabelo: 'Castanho frio, loiro platinado ou mechas em tons de cinza e lilás.'
    },
    gradient: 'from-blue-300 via-purple-300 to-pink-300'
  },

  // ============ OUTONO ============
  'outono-suave': {
    id: 'outono-suave',
    parentSeason: 'outono',
    name: 'Outono Suave',
    subtitle: 'Soft Autumn',
    description: 'Você é um Outono Suave! Sua coloração combina calor com suavidade. Tons terrosos empoeirados e neutros quentes realçam sua beleza natural.',
    characteristics: [
      'Pele com subtom neutro-quente, levemente dourada',
      'Olhos suaves (verde-oliva, castanho médio, mel)',
      'Cabelo castanho médio com reflexos dourados suaves',
      'Baixo a médio contraste',
      'Aparência natural e acolhedora'
    ],
    celebrities: {
      brazilian: ['Gisele Bündchen', 'Juliana Paes', 'Alessandra Negrini'],
      international: ['Gigi Hadid', 'Jennifer Lawrence', 'Jessica Biel']
    },
    palette: [
      '#C4A77D', // Bege dourado
      '#A67B5B', // Café com leite
      '#9CAF88', // Verde salvia escuro
      '#D4A373', // Caramelo suave
      '#BC8A5F', // Camelo
      '#8B7355', // Marrom suave
      '#B5A642', // Verde oliva dourado
      '#C9B99A', // Areia
      '#967969', // Castanho rosado
      '#8B8866', // Verde caqui
      '#D4B996', // Trigo
      '#A98467', // Terracota suave
    ],
    avoidColors: [
      '#FF69B4', // Rosa vibrante
      '#00FFFF', // Ciano
      '#000000', // Preto puro
      '#FFFFFF', // Branco puro
      '#4169E1', // Azul royal
    ],
    tips: {
      roupas: 'Tons neutros quentes e suaves: caramelo, bege, verde-oliva suave, terracota suave. Evite cores vibrantes e frias.',
      maquiagem: 'Tons de pêssego suave, nude quente e marrom. Sombras em taupe e bronze suave.',
      acessorios: 'Ouro fosco, bronze envelhecido ou madeira. Pedras como jaspe, cornalina e topázio fumê.',
      cabelo: 'Castanho dourado, mel, caramelo ou ombré natural em tons quentes.'
    },
    gradient: 'from-amber-200 via-orange-200 to-yellow-200'
  },
  'outono-quente': {
    id: 'outono-quente',
    parentSeason: 'outono',
    name: 'Outono Quente',
    subtitle: 'Warm Autumn',
    description: 'Você é um Outono Quente! Sua coloração é rica e dourada, como folhas de outono ao sol. Cores terrosas quentes e saturadas fazem você brilhar.',
    characteristics: [
      'Pele com forte subtom dourado, bronze ou oliva quente',
      'Olhos quentes (âmbar, castanho dourado, verde com raios dourados)',
      'Cabelo ruivo, castanho acobreado ou castanho dourado',
      'Médio a alto contraste em tons quentes',
      'Aparência rica e vibrante'
    ],
    celebrities: {
      brazilian: ['Marina Ruy Barbosa', 'Sophie Charlotte', 'Bianca Bin'],
      international: ['Nicole Kidman', 'Julianne Moore', 'Christina Hendricks']
    },
    palette: [
      '#D2691E', // Chocolate
      '#B8860B', // Dourado escuro
      '#CD853F', // Peru
      '#CC5500', // Laranja queimado
      '#8B4513', // Marrom sela
      '#DAA520', // Goldenrod
      '#A0522D', // Sienna
      '#D2B48C', // Tan
      '#C19A6B', // Caramelo
      '#996515', // Ouro velho
      '#B87333', // Cobre
      '#704214', // Sépia
    ],
    avoidColors: [
      '#FF69B4', // Rosa frio
      '#C0C0C0', // Prata
      '#4169E1', // Azul royal
      '#E6E6FA', // Lavanda
      '#000000', // Preto puro
    ],
    tips: {
      roupas: 'Cores terrosas ricas: ferrugem, mostarda, terracota, marrom chocolate, verde-oliva. Tons outonais vibrantes.',
      maquiagem: 'Bronze intenso, cobre, terracota. Batom em tons de tijolo, laranja-marrom ou nude quente.',
      acessorios: 'Ouro amarelo, cobre e bronze polido. Pedras como âmbar, topázio, cornalina e olho de tigre.',
      cabelo: 'Ruivo intenso, acobreado, mogno ou castanho com mechas caramelo e cobre.'
    },
    gradient: 'from-orange-500 via-amber-500 to-yellow-500'
  },
  'outono-profundo': {
    id: 'outono-profundo',
    parentSeason: 'outono',
    name: 'Outono Profundo',
    subtitle: 'Deep Autumn',
    description: 'Você é um Outono Profundo! Sua coloração é intensa e rica, com alto contraste em tons quentes. Cores profundas e saturadas realçam sua presença marcante.',
    characteristics: [
      'Pele média a escura com subtom quente (bronze, oliva)',
      'Olhos intensos (castanho escuro, preto-castanho, verde escuro)',
      'Cabelo castanho escuro ou preto com reflexos quentes',
      'Alto contraste com profundidade',
      'Aparência dramática e rica'
    ],
    celebrities: {
      brazilian: ['Juliana Paes', 'Tais Araújo', 'Débora Nascimento'],
      international: ['Penélope Cruz', 'Eva Longoria', 'Salma Hayek']
    },
    palette: [
      '#8B0000', // Vermelho escuro
      '#556B2F', // Verde oliva escuro
      '#6B4423', // Marrom café
      '#8B4513', // Marrom sela
      '#4A5D23', // Verde musgo
      '#722F37', // Vinho
      '#5C4033', // Chocolate escuro
      '#CC5500', // Laranja queimado
      '#8B7500', // Ouro velho escuro
      '#4E3524', // Café torrado
      '#355E3B', // Verde floresta
      '#8E4585', // Magenta escuro quente
    ],
    avoidColors: [
      '#FFB6C1', // Rosa claro
      '#E6E6FA', // Lavanda
      '#87CEEB', // Azul claro
      '#F5F5F5', // Branco gelo
      '#D3D3D3', // Cinza claro
    ],
    tips: {
      roupas: 'Cores ricas e profundas: bordeaux, verde-musgo, marrom escuro, laranja queimado, mostarda escura.',
      maquiagem: 'Tons intensos de marrom, vinho, bronze profundo. Batom em vinho, vermelho-tijolo ou nude escuro.',
      acessorios: 'Ouro envelhecido, bronze ou cobre. Pedras escuras como granada, topázio marrom e olho de tigre.',
      cabelo: 'Castanho escuro com reflexos cobre, mogno profundo ou preto com tons quentes.'
    },
    gradient: 'from-red-800 via-orange-600 to-amber-600'
  },

  // ============ INVERNO ============
  'inverno-profundo': {
    id: 'inverno-profundo',
    parentSeason: 'inverno',
    name: 'Inverno Profundo',
    subtitle: 'Deep Winter',
    description: 'Você é um Inverno Profundo! Sua coloração é intensa e dramática, com altíssimo contraste. Cores profundas e ricas fazem você se destacar.',
    characteristics: [
      'Pele média a escura com subtom frio ou neutro-frio',
      'Olhos muito escuros (preto, castanho muito escuro)',
      'Cabelo preto ou castanho muito escuro',
      'Altíssimo contraste',
      'Aparência dramática e poderosa'
    ],
    celebrities: {
      brazilian: ['Cleo Pires', 'Isis Valverde', 'Thaila Ayala'],
      international: ['Sandra Bullock', 'Courteney Cox', 'Lucy Liu']
    },
    palette: [
      '#000000', // Preto
      '#8B0000', // Vermelho escuro
      '#191970', // Azul meia-noite
      '#4B0082', // Índigo
      '#006400', // Verde escuro
      '#800020', // Borgonha
      '#301934', // Roxo escuro
      '#002D62', // Azul marinho escuro
      '#FFFFFF', // Branco puro
      '#C0C0C0', // Prata
      '#8B008B', // Magenta escuro
      '#1C1C1C', // Quase preto
    ],
    avoidColors: [
      '#F4A460', // Sandy brown
      '#FFDAB9', // Pêssego
      '#F5DEB3', // Trigo
      '#DEB887', // Bege
      '#FFD700', // Dourado
    ],
    tips: {
      roupas: 'Cores profundas e dramáticas: preto, marinho, borgonha, verde-floresta, roxo profundo. O branco puro também fica ótimo.',
      maquiagem: 'Tons intensos de berry, vinho, vermelho escuro e preto. Olhos dramáticos em preto e cinza.',
      acessorios: 'Prata polida, platina ou ouro branco. Pedras como ônix, granada e safira escura.',
      cabelo: 'Preto azulado, castanho escuro frio ou mechas em tons de berinjela e azul escuro.'
    },
    gradient: 'from-gray-900 via-purple-900 to-blue-900'
  },
  'inverno-frio': {
    id: 'inverno-frio',
    parentSeason: 'inverno',
    name: 'Inverno Frio',
    subtitle: 'Cool Winter',
    description: 'Você é um Inverno Frio! Sua coloração é dominada por tons frios puros. Cores geladas e vibrantes realçam seu visual sofisticado.',
    characteristics: [
      'Pele clara a média com forte subtom rosado ou azulado',
      'Olhos frios e claros (azul intenso, cinza, violeta)',
      'Cabelo castanho escuro frio, preto ou loiro platinado',
      'Alto contraste com tons frios',
      'Aparência elegante e sofisticada'
    ],
    celebrities: {
      brazilian: ['Giovanna Antonelli', 'Fernanda Lima', 'Ana Hickmann'],
      international: ['Anne Hathaway', 'Liv Tyler', 'Katy Perry']
    },
    palette: [
      '#DC143C', // Carmesim
      '#0000CD', // Azul médio
      '#4B0082', // Índigo
      '#FF1493', // Deep pink
      '#00CED1', // Turquesa escuro
      '#9400D3', // Violeta escuro
      '#FFFFFF', // Branco puro
      '#C0C0C0', // Prata
      '#00008B', // Azul escuro
      '#FF69B4', // Hot pink
      '#7B68EE', // Slate blue médio
      '#E0E0E0', // Cinza claro
    ],
    avoidColors: [
      '#FF8C00', // Laranja escuro
      '#DAA520', // Goldenrod
      '#8B4513', // Marrom sela
      '#F4A460', // Sandy brown
      '#FFDAB9', // Pêssego
    ],
    tips: {
      roupas: 'Cores frias e vibrantes: azul royal, pink, roxo, verde-esmeralda frio, vermelho cereja. Preto e branco puros.',
      maquiagem: 'Tons de pink, berry, vermelho azulado e roxo. Sombras em prata, azul e roxo.',
      acessorios: 'Prata brilhante, ouro branco ou platina. Pedras como diamante, safira azul e ametista.',
      cabelo: 'Preto azulado, loiro platinado frio ou castanho com reflexos cinza ou violeta.'
    },
    gradient: 'from-blue-600 via-purple-600 to-pink-600'
  },
  'inverno-brilhante': {
    id: 'inverno-brilhante',
    parentSeason: 'inverno',
    name: 'Inverno Brilhante',
    subtitle: 'Bright Winter',
    description: 'Você é um Inverno Brilhante! Sua coloração combina tons frios com alto brilho e saturação. Cores vibrantes e contrastantes fazem você parecer radiante.',
    characteristics: [
      'Pele clara com subtom neutro-frio',
      'Olhos brilhantes e claros (azul brilhante, verde brilhante, cinza claro)',
      'Cabelo escuro contrastando com olhos claros ou loiro platinado',
      'Altíssimo contraste com brilho',
      'Aparência marcante e vibrante'
    ],
    celebrities: {
      brazilian: ['Megan Fox', 'Alinne Moraes', 'Flávia Alessandra'],
      international: ['Megan Fox', 'Alexis Bledel', 'Zooey Deschanel']
    },
    palette: [
      '#FF0000', // Vermelho puro
      '#00FF00', // Verde lima
      '#0000FF', // Azul puro
      '#FF00FF', // Magenta
      '#00FFFF', // Ciano
      '#FFFF00', // Amarelo (em pequenas doses)
      '#FF1493', // Deep pink
      '#7FFF00', // Chartreuse
      '#FFFFFF', // Branco puro
      '#000000', // Preto
      '#00CED1', // Turquesa
      '#9932CC', // Orquídea escuro
    ],
    avoidColors: [
      '#808080', // Cinza médio
      '#A9A9A9', // Cinza escuro
      '#D3D3D3', // Cinza claro
      '#8B4513', // Marrom
      '#DEB887', // Bege
    ],
    tips: {
      roupas: 'Cores vibrantes e saturadas: vermelho vivo, azul elétrico, verde-esmeralda, pink intenso. Contrastes fortes como preto e branco.',
      maquiagem: 'Cores vibrantes: vermelho vivo, pink elétrico, roxo intenso. Olhos dramáticos com delineado marcante.',
      acessorios: 'Prata brilhante, cristais e peças statement. Pedras vibrantes como esmeralda, rubi e safira.',
      cabelo: 'Preto intenso, castanho escuro com alto brilho ou loiro platinado. Mechas coloridas vibrantes.'
    },
    gradient: 'from-pink-500 via-purple-500 to-cyan-500'
  }
};

// Função auxiliar para obter a estação pai
export function getParentSeason(subSeason: SubSeason): ParentSeason {
  return seasons[subSeason].parentSeason;
}

// Função auxiliar para obter todas as sub-estações de uma estação pai
export function getSubSeasonsByParent(parent: ParentSeason): SubSeason[] {
  return (Object.keys(seasons) as SubSeason[]).filter(
    (key) => seasons[key].parentSeason === parent
  );
}

export interface Question {
  id: string;
  question: string;
  category?: 'basic' | 'refinement'; // Para diferenciar perguntas básicas das de refinamento
  options: {
    text: string;
    points: Record<ParentSeason, number>;
    // Pontos adicionais para sub-estações (claridade, intensidade, temperatura)
    subPoints?: {
      light?: number;      // Pontos para sub-estações claras (-2 a +2)
      bright?: number;     // Pontos para sub-estações brilhantes (-2 a +2)
      soft?: number;       // Pontos para sub-estações suaves (-2 a +2)
      deep?: number;       // Pontos para sub-estações profundas (-2 a +2)
    };
  }[];
}

export const questions: Question[] = [
  // ============ PERGUNTAS BÁSICAS (determinam a estação pai) ============
  {
    id: 'skin_undertone',
    question: 'Qual é o subtom da sua pele?',
    category: 'basic',
    options: [
      {
        text: 'Dourado/Amarelado - Veias do pulso parecem verdes',
        points: { primavera: 2, verao: 0, outono: 2, inverno: 0 }
      },
      {
        text: 'Rosado/Azulado - Veias do pulso parecem azuis/roxas',
        points: { primavera: 0, verao: 2, outono: 0, inverno: 2 }
      },
      {
        text: 'Neutro - Mistura de verde e azul nas veias',
        points: { primavera: 1, verao: 1, outono: 1, inverno: 1 }
      },
    ]
  },
  {
    id: 'eye_color',
    question: 'Qual é a cor dos seus olhos?',
    category: 'basic',
    options: [
      {
        text: 'Azul claro, verde claro ou mel',
        points: { primavera: 2, verao: 1, outono: 0, inverno: 0 },
        subPoints: { light: 2, bright: 1 }
      },
      {
        text: 'Azul acinzentado, verde-água ou cinza',
        points: { primavera: 0, verao: 2, outono: 0, inverno: 1 },
        subPoints: { light: 1, soft: 1 }
      },
      {
        text: 'Castanho escuro, verde oliva ou âmbar',
        points: { primavera: 0, verao: 0, outono: 2, inverno: 1 },
        subPoints: { soft: 1, deep: 1 }
      },
      {
        text: 'Preto, castanho muito escuro ou azul intenso',
        points: { primavera: 0, verao: 0, outono: 1, inverno: 2 },
        subPoints: { deep: 2, bright: 1 }
      },
    ]
  },
  {
    id: 'hair_color',
    question: 'Qual é a cor natural do seu cabelo?',
    category: 'basic',
    options: [
      {
        text: 'Loiro dourado, ruivo claro ou castanho claro com reflexos dourados',
        points: { primavera: 2, verao: 0, outono: 1, inverno: 0 },
        subPoints: { light: 2 }
      },
      {
        text: 'Loiro acinzentado, castanho claro ou médio sem reflexos quentes',
        points: { primavera: 0, verao: 2, outono: 0, inverno: 0 },
        subPoints: { light: 1, soft: 1 }
      },
      {
        text: 'Castanho escuro com reflexos acobreados, ruivo ou auburn',
        points: { primavera: 0, verao: 0, outono: 2, inverno: 0 },
        subPoints: { bright: 1, deep: 1 }
      },
      {
        text: 'Preto, castanho muito escuro ou loiro platinado',
        points: { primavera: 0, verao: 0, outono: 0, inverno: 2 },
        subPoints: { deep: 2, bright: 1 }
      },
    ]
  },
  {
    id: 'sun_reaction',
    question: 'Como sua pele reage ao sol?',
    category: 'basic',
    options: [
      {
        text: 'Fica dourada facilmente, raramente queima',
        points: { primavera: 2, verao: 0, outono: 2, inverno: 0 }
      },
      {
        text: 'Queima primeiro, depois bronzeia levemente',
        points: { primavera: 1, verao: 2, outono: 0, inverno: 1 }
      },
      {
        text: 'Queima facilmente, dificilmente bronzeia',
        points: { primavera: 0, verao: 1, outono: 0, inverno: 2 }
      },
    ]
  },
  {
    id: 'best_metal',
    question: 'Qual metal fica melhor em você?',
    category: 'basic',
    options: [
      {
        text: 'Ouro amarelo - ilumina meu rosto',
        points: { primavera: 2, verao: 0, outono: 2, inverno: 0 }
      },
      {
        text: 'Prata ou ouro branco - destaca meus traços',
        points: { primavera: 0, verao: 2, outono: 0, inverno: 2 }
      },
      {
        text: 'Ouro rosé - fica harmonioso',
        points: { primavera: 1, verao: 1, outono: 1, inverno: 0 },
        subPoints: { soft: 1 }
      },
    ]
  },
  {
    id: 'best_white',
    question: 'Qual tom de branco fica melhor em você?',
    category: 'basic',
    options: [
      {
        text: 'Branco creme ou off-white - mais suave',
        points: { primavera: 2, verao: 1, outono: 2, inverno: 0 },
        subPoints: { soft: 1, light: 1 }
      },
      {
        text: 'Branco puro - limpo e fresco',
        points: { primavera: 0, verao: 1, outono: 0, inverno: 2 },
        subPoints: { bright: 2, deep: 1 }
      },
    ]
  },
  {
    id: 'overall_contrast',
    question: 'Como você descreveria o contraste entre sua pele, cabelo e olhos?',
    category: 'basic',
    options: [
      {
        text: 'Baixo contraste - cores similares e suaves',
        points: { primavera: 1, verao: 2, outono: 0, inverno: 0 },
        subPoints: { light: 2, soft: 2 }
      },
      {
        text: 'Médio contraste - alguma diferença entre as cores',
        points: { primavera: 2, verao: 1, outono: 2, inverno: 0 },
        subPoints: { soft: 1 }
      },
      {
        text: 'Alto contraste - grande diferença entre as cores',
        points: { primavera: 0, verao: 0, outono: 1, inverno: 2 },
        subPoints: { bright: 2, deep: 2 }
      },
    ]
  },

  // ============ PERGUNTAS DE REFINAMENTO (determinam a sub-estação) ============
  {
    id: 'color_intensity',
    question: 'Quando você usa cores vibrantes e saturadas, como você se sente?',
    category: 'refinement',
    options: [
      {
        text: 'Fico ótima! Cores vivas me deixam radiante',
        points: { primavera: 1, verao: 0, outono: 0, inverno: 1 },
        subPoints: { bright: 2 }
      },
      {
        text: 'Prefiro tons mais suaves e acinzentados',
        points: { primavera: 0, verao: 1, outono: 1, inverno: 0 },
        subPoints: { soft: 2 }
      },
      {
        text: 'Gosto de cores profundas e ricas',
        points: { primavera: 0, verao: 0, outono: 1, inverno: 1 },
        subPoints: { deep: 2 }
      },
      {
        text: 'Cores claras e delicadas ficam melhor em mim',
        points: { primavera: 1, verao: 1, outono: 0, inverno: 0 },
        subPoints: { light: 2 }
      },
    ]
  },
  {
    id: 'black_clothing',
    question: 'Como você fica usando preto puro?',
    category: 'refinement',
    options: [
      {
        text: 'Fico incrível! Me deixa elegante e poderosa',
        points: { primavera: 0, verao: 0, outono: 0, inverno: 2 },
        subPoints: { deep: 2, bright: 1 }
      },
      {
        text: 'Fica bem, mas preciso de maquiagem para não parecer pálida',
        points: { primavera: 0, verao: 1, outono: 1, inverno: 1 },
        subPoints: { soft: 1 }
      },
      {
        text: 'Me deixa apagada ou pesada, prefiro tons mais suaves',
        points: { primavera: 2, verao: 2, outono: 0, inverno: 0 },
        subPoints: { light: 2, soft: 1 }
      },
      {
        text: 'Prefiro marrom escuro ou cinza carvão ao preto',
        points: { primavera: 0, verao: 0, outono: 2, inverno: 0 },
        subPoints: { deep: 1, soft: 1 }
      },
    ]
  },
  {
    id: 'pastel_colors',
    question: 'Como você fica usando cores pastel (rosa bebê, azul claro, lavanda)?',
    category: 'refinement',
    options: [
      {
        text: 'Ficam perfeitas! Realçam minha aparência delicada',
        points: { primavera: 1, verao: 2, outono: 0, inverno: 0 },
        subPoints: { light: 2 }
      },
      {
        text: 'Ficam bem se forem em tons quentes (pêssego, verde-menta)',
        points: { primavera: 2, verao: 0, outono: 1, inverno: 0 },
        subPoints: { light: 1 }
      },
      {
        text: 'Me deixam sem graça, preciso de mais cor',
        points: { primavera: 0, verao: 0, outono: 1, inverno: 2 },
        subPoints: { bright: 2, deep: 1 }
      },
      {
        text: 'Prefiro versões mais "sujas" ou empoeiradas dessas cores',
        points: { primavera: 0, verao: 1, outono: 1, inverno: 0 },
        subPoints: { soft: 2 }
      },
    ]
  },
];

// Função para calcular a estação pai
export function calculateParentSeason(answers: Record<string, number>): ParentSeason {
  const scores: Record<ParentSeason, number> = {
    primavera: 0,
    verao: 0,
    outono: 0,
    inverno: 0,
  };

  questions.forEach((q) => {
    const selectedOption = answers[q.id];
    if (selectedOption !== undefined && q.options[selectedOption]) {
      const points = q.options[selectedOption].points;
      scores.primavera += points.primavera;
      scores.verao += points.verao;
      scores.outono += points.outono;
      scores.inverno += points.inverno;
    }
  });

  const maxScore = Math.max(...Object.values(scores));
  const winnerSeason = (Object.entries(scores).find(
    ([_, score]) => score === maxScore
  )?.[0] || 'primavera') as ParentSeason;

  return winnerSeason;
}

// Função para calcular a sub-estação (versão principal)
export function calculateSeason(answers: Record<string, number>): SubSeason {
  // Primeiro, determina a estação pai
  const parentSeason = calculateParentSeason(answers);

  // Calcula os pontos para sub-características
  const subScores = {
    light: 0,
    bright: 0,
    soft: 0,
    deep: 0,
  };

  questions.forEach((q) => {
    const selectedOption = answers[q.id];
    if (selectedOption !== undefined && q.options[selectedOption]) {
      const subPoints = q.options[selectedOption].subPoints;
      if (subPoints) {
        subScores.light += subPoints.light || 0;
        subScores.bright += subPoints.bright || 0;
        subScores.soft += subPoints.soft || 0;
        subScores.deep += subPoints.deep || 0;
      }
    }
  });

  // Mapeia as características dominantes para sub-estações
  const subSeasonMap: Record<ParentSeason, Record<string, SubSeason>> = {
    primavera: {
      light: 'primavera-clara',
      bright: 'primavera-brilhante',
      soft: 'primavera-quente', // soft primavera vai para quente (mais neutra)
      deep: 'primavera-brilhante', // deep primavera vai para brilhante (mais contraste)
      default: 'primavera-quente',
    },
    verao: {
      light: 'verao-claro',
      bright: 'verao-frio', // bright verão vai para frio (mais saturado)
      soft: 'verao-suave',
      deep: 'verao-frio', // deep verão vai para frio
      default: 'verao-suave',
    },
    outono: {
      light: 'outono-suave', // light outono vai para suave
      bright: 'outono-quente', // bright outono vai para quente
      soft: 'outono-suave',
      deep: 'outono-profundo',
      default: 'outono-quente',
    },
    inverno: {
      light: 'inverno-brilhante', // light inverno vai para brilhante
      bright: 'inverno-brilhante',
      soft: 'inverno-frio', // soft inverno vai para frio
      deep: 'inverno-profundo',
      default: 'inverno-frio',
    },
  };

  // Encontra a característica dominante
  const maxSubScore = Math.max(...Object.values(subScores));
  let dominantCharacteristic = 'default';

  if (maxSubScore > 0) {
    const entries = Object.entries(subScores);
    dominantCharacteristic = entries.find(([_, score]) => score === maxSubScore)?.[0] || 'default';
  }

  return subSeasonMap[parentSeason][dominantCharacteristic] || subSeasonMap[parentSeason].default;
}

// Alias para compatibilidade
export const calculateSubSeason = calculateSeason;
