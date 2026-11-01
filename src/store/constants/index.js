// Store-specific constants — product data used as fallback when Supabase is loading

export const STORE_CATEGORIES = [
  { id: 1, name: 'Lámparas', slug: 'lamparas', icon: '💡', description: 'Lámparas 3D orgánicas, minimalistas y personalizadas' },
  { id: 2, name: 'Organizadores', slug: 'organizadores', icon: '🗂️', description: 'Organizadores de maquillaje, mostrador, gorras y soportes' },
  { id: 3, name: 'Llaveros', slug: 'llaveros', icon: '🔑', description: 'Llaveros de razas, mascotas y diseños únicos' },
  { id: 4, name: 'Clickers & Fidgets', slug: 'clickers', icon: '✨', description: 'Charms táctiles clicker antiestrés para llevar contigo' },
  { id: 5, name: 'Abrelatas', slug: 'abrelatas', icon: '🥫', description: 'Abrelatas ergonómicos de animales y diseños temáticos' },
  { id: 6, name: 'Gaming & Geek', slug: 'gaming-geek', icon: '🎮', description: 'Cofres de Zelda, Espada Maestra, Dragones y coleccionables' },
  { id: 7, name: 'Belleza & Estilo', slug: 'belleza', icon: '💄', description: 'Estuches de joyería, accesorios de viaje y detalles de hogar' },
  { id: 8, name: 'Pedidos a Escala & Custom', slug: 'pedidos-escala-custom', icon: '🚛', description: 'Modelos a escala de vehículos y creaciones personalizadas a pedido' },
  { id: 9, name: 'Bebés & Niños', slug: 'bebes', icon: '👶', description: 'Lámparas y recuerdos personalizados para baby shower y cuartos infantiles' },
];

export const HERO_SLIDES = [
  {
    title: 'Lámparas 3D',
    subtitle: 'Iluminación orgánica hecha a medida',
    image: '/store/assets/products/1/mossglow-lamp-1.jpg',
    category: 'lamparas',
  },
  {
    title: 'Llaveros & Charms',
    subtitle: 'Accesorios únicos impresos en 3D',
    image: '/store/assets/products/36/all-keychain-designs.jpg',
    category: 'llaveros',
  },
  {
    title: 'Organizadores',
    subtitle: 'Funcionalidad técnica con estilo',
    image: '/store/assets/products/6/cathedral-organizer-makeup.jpg',
    category: 'organizadores',
  },
  {
    title: 'Gaming & Coleccionables',
    subtitle: 'Diseños de alta tolerancia y fantasía',
    image: '/store/assets/products/46/gold-dragon.jpg',
    category: 'gaming-geek',
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

