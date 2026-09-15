-- ═══════════════════════════════════════════════════════════════
-- 3D Agora Lab — Schema Part 2: cart, orders, manufacturing
-- ═══════════════════════════════════════════════════════════════

-- 4. Cart Items
CREATE TABLE public.cart_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id  INT NOT NULL REFERENCES public.products(id),
  quantity    INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own cart" ON public.cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own cart" ON public.cart_items FOR ALL USING (auth.uid() = user_id);

-- 5. Orders
CREATE TABLE public.orders (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','paid','shipped','delivered','cancelled')),
  total_cop         INT NOT NULL DEFAULT 0,
  payment_provider  TEXT,
  payment_id        TEXT,
  shipping_name     TEXT,
  shipping_address  TEXT,
  shipping_city     TEXT,
  shipping_phone    TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all orders" ON public.orders FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins update orders" ON public.orders FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 6. Order Items
CREATE TABLE public.order_items (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id     UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id   INT NOT NULL REFERENCES public.products(id),
  quantity     INT NOT NULL DEFAULT 1,
  unit_price   INT NOT NULL DEFAULT 0,
  product_name TEXT NOT NULL
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own order items" ON public.order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND user_id = auth.uid()));
CREATE POLICY "Users create own order items" ON public.order_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND user_id = auth.uid()));
CREATE POLICY "Admins view all order items" ON public.order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 7. Manufacturing Costs (admin only)
CREATE TABLE public.manufacturing_costs (
  id              SERIAL PRIMARY KEY,
  product_id      INT NOT NULL REFERENCES public.products(id),
  date            DATE NOT NULL,
  print_hours     NUMERIC(6,2) DEFAULT 0,
  filament_grams  NUMERIC(8,2) DEFAULT 0,
  filament_id     INT,
  kwh_used        NUMERIC(6,2) DEFAULT 0,
  machine_hours   NUMERIC(6,2) DEFAULT 0,
  extras_cost     INT DEFAULT 0,
  extras_desc     TEXT,
  total_cost      INT DEFAULT 0,
  sell_price      INT DEFAULT 0,
  margin_pct      NUMERIC(5,2) DEFAULT 0
);
ALTER TABLE public.manufacturing_costs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view costs" ON public.manufacturing_costs FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins modify costs" ON public.manufacturing_costs FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 8. Updated-at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
