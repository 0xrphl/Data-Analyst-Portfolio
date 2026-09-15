-- Fix Product 5: "Organizador de escritorio" → "Organizador mostrador de llaveros"
-- Images show a keychain display stand, not a desk organizer.
-- Run this directly on your Supabase SQL editor to fix the live database.

UPDATE products
SET
  name        = 'Organizador mostrador de llaveros',
  slug        = 'organizador-llaveros',
  sale_title  = 'Mostrador organizador de llaveros',
  description = 'Organizador giratorio tipo árbol con múltiples ganchos para exhibir llaveros y accesorios. Estilo minimalista.',
  tags        = ARRAY['organizador','llaveros','mostrador','exhibidor']
WHERE id = 5;
