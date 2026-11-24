export type AppCategory =
  | 'Corpo & Performance'
  | 'Dinheiro & Bloqueios'
  | 'Emoções & Rotina'
  | 'Em breve';

export type CategoryFilter = 'Todos' | AppCategory;

export const APP_CATEGORIES: AppCategory[] = [
  'Corpo & Performance',
  'Dinheiro & Bloqueios',
  'Emoções & Rotina',
  'Em breve',
];

export const CATEGORY_FILTERS: CategoryFilter[] = [
  'Todos',
  ...APP_CATEGORIES,
];

export interface AppItem {
  id: string;
  name: string;
  description: string;
  paymentUrl: string;
  category: AppCategory;
  buttonText: string;
  badge?: string;
  imageUrl?: string;
  isDefault?: boolean;
  createdAt: number;
}

export interface AppFormValues {
  name: string;
  description: string;
  paymentUrl: string;
  category: AppCategory;
  buttonText: string;
  badge: string;
  imageUrl: string;
}

export const DEFAULT_BUTTON_TEXT = 'Comprar / Acessar agora →';
export const DEFAULT_BRAND_SUBTITLE = 'HUB DE APPS PRO · Ferramentas digitais da sua marca';

export const DEFAULT_APPS: AppItem[] = [
  {
    id: 'shapecalc-pro',
    name: 'ShapeCalc Pro',
    category: 'Corpo & Performance',
    badge: 'Mais acessado',
    description:
      'Monte seu protocolo personalizado de dieta, treino e cardio em 3 passos com cálculo em tempo real e relatório completo em PDF.',
    buttonText: 'Acessar pagamento →',
    paymentUrl: 'https://SEU-LINK-PAGAMENTO-SHAPECALC.com',
    imageUrl: '/src/assets/images/product_shapecalc_pro_1795487933938.jpg',
    isDefault: true,
    createdAt: 1700000001000,
  },
  {
    id: 'destravando-o-oculto',
    name: 'Destravando o Oculto',
    category: 'Dinheiro & Bloqueios',
    badge: 'Novo',
    description:
      'Descubra a trava emocional invisível que sabota sua relação com o dinheiro e receba um dossiê com plano prático de 7 dias.',
    buttonText: 'Acessar pagamento →',
    paymentUrl: 'https://SEU-LINK-PAGAMENTO-DESTRAVANDO.com',
    imageUrl: '/src/assets/images/product_destravando_oculto_1795487933476.jpg',
    isDefault: true,
    createdAt: 1700000002000,
  },
];
