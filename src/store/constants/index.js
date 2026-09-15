// Store-specific constants — product data used as fallback when Supabase is loading

export const STORE_CATEGORIES = [
  { id: 1, name: 'Hogar', slug: 'hogar', icon: '🏠', description: 'Lámparas, organizadores y decoración' },
  { id: 2, name: 'Belleza', slug: 'belleza', icon: '💄', description: 'Organizadores de maquillaje y accesorios' },
  { id: 3, name: 'Accesorios', slug: 'accesorios', icon: '🎮', description: 'Llaveros, clickers, soportes' },
  { id: 4, name: 'Organizador', slug: 'organizador', icon: '🧢', description: 'Organizadores de gorras y espacios' },
];

export const HERO_SLIDES = [
  {
    title: 'Lámparas 3D',
    subtitle: 'Iluminación orgánica hecha a medida',
    image: '/store/assets/products/mossglow-lamp-1.jpg',
    category: 'hogar',
  },
  {
    title: 'Llaveros & Charms',
    subtitle: 'Accesorios únicos impresos en 3D',
    image: '/store/assets/products/all-keychain-designs.jpg',
    category: 'accesorios',
  },
  {
    title: 'Organizadores',
    subtitle: 'Funcionalidad con estilo',
    image: '/store/assets/products/cathedral-organizer-makeup.jpg',
    category: 'belleza',
  },
];

export const formatCOP = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
