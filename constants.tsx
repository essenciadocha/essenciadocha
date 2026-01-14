
import React from 'react';
import { Leaf, Coffee, Flower2, Sparkles, Droplets } from 'lucide-react';
import { Recipe } from './types';

export const INGREDIENTS_POOL = [
  'Hibisco', 'Gengibre', 'Camomila', 'Canela', 'Chá Verde', 'Hortelã', 'Alecrim', 'Melissa', 'Capim-limão', 'Erva-doce',
  'Passiflora', 'Valeriana', 'Lavanda', 'Dente-de-leão', 'Cavalinha', 'Cúrcuma', 'Casca de Laranja', 'Maçã Seca', 'Cravo-da-índia', 'Cardamomo',
  'Anis Estrelado', 'Sálvia', 'Amora', 'Folha de Oliveira', 'Boldo', 'Carqueja', 'Espinheira-santa', 'Guaco', 'Poejo', 'Tília',
  'Manjericão', 'Tomilho', 'Alecrim do Campo', 'Sene', 'Cascara Sagrada', 'Chá Branco', 'Chá Preto', 'Oolong', 'Matcha', 'Rooibos',
  'Artemísia', 'Bardana', 'Bétula', 'Calêndula', 'Cidreira', 'Eucalipto', 'Ginseng', 'Jasmim', 'Lótus', 'Moringa',
  'Pata-de-vaca', 'Quebra-pedra', 'Salsa', 'Urtiga', 'Verbena', 'Zimbro', 'Alcaçuz', 'Alfafa', 'Angélica', 'Arnica'
];

export const NUTRI_TIPS = [
  "Tome seu chá morno para melhor absorção intestinal.",
  "Evite adoçar seu chá para preservar os compostos bioativos.",
  "O chá verde é excelente aliado do foco cognitivo matinal.",
  "A camomila reduz o cortisol e prepara o cérebro para o descanso.",
  "Mantenha-se hidratada com água entre as infusões diárias.",
  "A temperatura da água preserva ou destrói as propriedades da erva.",
  "O ritual do chá começa no momento em que você escolhe a xícara.",
  "Abafe sempre para evitar que os óleos essenciais se percam no vapor."
];

const generateRecipes = (): Recipe[] => {
  const recipes: Recipe[] = [];
  const icons: ('leaf' | 'cup' | 'flower' | 'sparkles' | 'droplets')[] = ['leaf', 'cup', 'flower', 'sparkles', 'droplets'];

  for (let i = 0; i < 1100; i++) {
    let category: 'weight' | 'relax' | 'digestion' | 'debloat';
    let benefit: string;
    let color: string;

    if (i < 275) {
      category = 'weight';
      benefit = 'Redução de Medidas';
      color = '#D1EAD0';
    } else if (i < 550) {
      category = 'relax';
      benefit = 'Sono Profundo';
      color = '#E9D5FF';
    } else if (i < 825) {
      category = 'digestion';
      benefit = 'Digestão Leve';
      color = '#FEF3C7';
    } else {
      category = 'debloat';
      benefit = 'Efeito Desincha';
      color = '#E0F2FE';
    }
    
    const ingredient = INGREDIENTS_POOL[i % INGREDIENTS_POOL.length];
    const icon = icons[i % icons.length];
    const cycleDays = [7, 14, 21, 30][i % 4];

    recipes.push({
      id: `tea-${i}`,
      name: `Infusão de ${ingredient}`,
      benefit: benefit,
      time: `${4 + (i % 6)} min`,
      color: color,
      accentColor: '#064E3B',
      icon: icon,
      category: category,
      cycleDays: cycleDays,
      dosesPerDay: 2,
      usage: `Consumir 2x ao dia, preferencialmente morno.`,
      ingredients: [
        `1 porção de ${ingredient}`,
        `250ml de água filtrada`,
        `Toque cítrico opcional`
      ],
      instructions: [
        `Aqueça a água sem ferver.`,
        `Deixe a erva em infusão por 5 minutos.`,
        `Coe e consuma imediatamente.`
      ]
    });
  }
  return recipes;
};

export const RECIPES: Recipe[] = generateRecipes();

export const getIcon = (type: string, accentColor: string) => {
  const props = { size: 28, strokeWidth: 2.5, style: { color: accentColor } };
  switch (type) {
    case 'leaf': return <Leaf {...props} />;
    case 'flower': return <Flower2 {...props} />;
    case 'sparkles': return <Sparkles {...props} />;
    case 'droplets': return <Droplets {...props} />;
    default: return <Coffee {...props} />;
  }
};
