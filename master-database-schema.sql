-- ============================================================
--  SAHYADRI SPORTS — MASTER SUPABASE SQL SCHEMA v4
--  Admin: saurabhkirve@gmail.com
--
--  KEY FIX: Never DROP TRIGGER ON <table> if table may not exist.
--  All trigger cleanup is handled by DROP TABLE ... CASCADE.
--  Auth trigger is dropped inside a safe DO $$ EXCEPTION block.
-- ============================================================


-- ============================================================
-- SECTION 0 — CLEAN SLATE
--   Drop order: views → functions → tables (CASCADE kills
--   triggers, indexes, policies automatically) → types
-- ============================================================

-- Views
DROP VIEW IF EXISTS public.v_low_stock_alerts   CASCADE;
DROP VIEW IF EXISTS public.v_sales_by_category  CASCADE;
DROP VIEW IF EXISTS public.v_daily_revenue      CASCADE;
DROP VIEW IF EXISTS public.v_inventory_status   CASCADE;
DROP VIEW IF EXISTS public.v_customer_stats     CASCADE;
DROP VIEW IF EXISTS public.v_order_summary      CASCADE;

-- Functions
DROP FUNCTION IF EXISTS public.get_dashboard_stats()        CASCADE;
DROP FUNCTION IF EXISTS public.is_admin()                   CASCADE;
DROP FUNCTION IF EXISTS public.receive_purchase_order()     CASCADE;
DROP FUNCTION IF EXISTS public.sync_order_total()           CASCADE;
DROP FUNCTION IF EXISTS public.manage_stock_on_order_item() CASCADE;
DROP FUNCTION IF EXISTS public.sync_customer_stats()        CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user()            CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column()   CASCADE;

-- Auth trigger — may not exist or may lack permission; always safe
DO $$
BEGIN
    DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
EXCEPTION WHEN OTHERS THEN
    NULL;  -- silently ignore if auth schema is inaccessible
END;
$$;

-- Tables — CASCADE drops all dependent triggers, indexes, policies
-- Drop in child-first order to satisfy FK constraints
DROP TABLE IF EXISTS public.audit_logs              CASCADE;
DROP TABLE IF EXISTS public.app_settings            CASCADE;
DROP TABLE IF EXISTS public.stock_movements         CASCADE;
DROP TABLE IF EXISTS public.purchase_order_items    CASCADE;
DROP TABLE IF EXISTS public.purchase_orders         CASCADE;
DROP TABLE IF EXISTS public.order_items             CASCADE;
DROP TABLE IF EXISTS public.orders                  CASCADE;
DROP TABLE IF EXISTS public.customers               CASCADE;
DROP TABLE IF EXISTS public.products                CASCADE;
DROP TABLE IF EXISTS public.suppliers               CASCADE;
DROP TABLE IF EXISTS public.categories              CASCADE;
DROP TABLE IF EXISTS public.profiles                CASCADE;

-- Enums
DROP TYPE IF EXISTS public.audit_action         CASCADE;
DROP TYPE IF EXISTS public.po_status            CASCADE;
DROP TYPE IF EXISTS public.stock_movement_type  CASCADE;
DROP TYPE IF EXISTS public.customer_status      CASCADE;
DROP TYPE IF EXISTS public.payment_status       CASCADE;
DROP TYPE IF EXISTS public.order_status         CASCADE;
DROP TYPE IF EXISTS public.user_role            CASCADE;


-- ============================================================
-- SECTION 1 — EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";


-- ============================================================
-- SECTION 2 — ENUMS
-- ============================================================

CREATE TYPE public.user_role AS ENUM (
    'admin', 'manager', 'viewer'
);
CREATE TYPE public.order_status AS ENUM (
    'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'
);
CREATE TYPE public.payment_status AS ENUM (
    'Paid', 'Pending', 'Failed', 'Refunded'
);
CREATE TYPE public.customer_status AS ENUM (
    'Active', 'Inactive', 'VIP'
);
CREATE TYPE public.stock_movement_type AS ENUM (
    'purchase', 'sale', 'adjustment', 'return', 'write_off'
);
CREATE TYPE public.po_status AS ENUM (
    'Draft', 'Sent', 'Received', 'Cancelled'
);
CREATE TYPE public.audit_action AS ENUM (
    'INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'
);


-- ============================================================
-- SECTION 3 — TABLES  (created before any function references them)
-- ============================================================

-- ── 3.1 PROFILES ─────────────────────────────────────────
CREATE TABLE public.profiles (
    id            UUID             PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name     TEXT,
    avatar_url    TEXT,
    role          public.user_role NOT NULL DEFAULT 'viewer',
    email         TEXT             NOT NULL,
    phone         TEXT,
    is_active     BOOLEAN          NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at    TIMESTAMPTZ      NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ      NOT NULL DEFAULT now(),
    CONSTRAINT chk_profile_email
        CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$')
);

-- ── 3.2 CATEGORIES ───────────────────────────────────────
CREATE TABLE public.categories (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT        NOT NULL UNIQUE,
    slug        TEXT        NOT NULL UNIQUE,
    description TEXT,
    parent_id   UUID        REFERENCES public.categories(id) ON DELETE SET NULL,
    is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
    sort_order  INTEGER     NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 3.3 SUPPLIERS ────────────────────────────────────────
CREATE TABLE public.suppliers (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name         TEXT        NOT NULL,
    contact_name TEXT,
    email        TEXT,
    phone        TEXT,
    address      TEXT,
    gstin        TEXT,
    is_active    BOOLEAN     NOT NULL DEFAULT TRUE,
    notes        TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_supplier_email
        CHECK (email IS NULL OR email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$')
);

-- ── 3.4 PRODUCTS ─────────────────────────────────────────
CREATE TABLE public.products (
    id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    name                TEXT          NOT NULL,
    sku                 TEXT          NOT NULL UNIQUE,
    category_id         UUID          REFERENCES public.categories(id) ON DELETE SET NULL,
    category            TEXT,
    brand               TEXT,
    description         TEXT,
    price               NUMERIC(12,2) NOT NULL DEFAULT 0  CHECK (price >= 0),
    cost_price          NUMERIC(12,2)           CHECK (cost_price IS NULL OR cost_price >= 0),
    stock               INTEGER       NOT NULL DEFAULT 0  CHECK (stock >= 0),
    low_stock_threshold INTEGER       NOT NULL DEFAULT 20,
    supplier_id         UUID          REFERENCES public.suppliers(id) ON DELETE SET NULL,
    manager             TEXT,
    managed_by          UUID          REFERENCES public.profiles(id)  ON DELETE SET NULL,
    image_url           TEXT,
    is_active           BOOLEAN       NOT NULL DEFAULT TRUE,
    tags                TEXT[]        NOT NULL DEFAULT '{}',
    meta                JSONB         NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),
    CONSTRAINT chk_sku_format CHECK (sku ~ '^[A-Za-z0-9\-_]+$')
);

-- ── 3.5 CUSTOMERS ────────────────────────────────────────
CREATE TABLE public.customers (
    id            UUID                   PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT                   NOT NULL,
    email         TEXT                   NOT NULL,
    phone         TEXT,
    address       TEXT,
    city          TEXT,
    state         TEXT,
    pincode       TEXT,
    status        public.customer_status NOT NULL DEFAULT 'Active',
    avatar_url    TEXT,
    notes         TEXT,
    total_orders  INTEGER                NOT NULL DEFAULT 0,
    total_spent   NUMERIC(14,2)          NOT NULL DEFAULT 0,
    last_order_at TIMESTAMPTZ,
    created_at    TIMESTAMPTZ            NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ            NOT NULL DEFAULT now(),
    CONSTRAINT chk_customer_email
        CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$')
);
CREATE UNIQUE INDEX uidx_customers_email ON public.customers (lower(email));

-- ── 3.6 ORDERS ───────────────────────────────────────────
CREATE TABLE public.orders (
    id               TEXT                  PRIMARY KEY,
    customer_id      UUID                  NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    status           public.order_status   NOT NULL DEFAULT 'Pending',
    payment_status   public.payment_status NOT NULL DEFAULT 'Pending',
    shipping_method  TEXT                  NOT NULL DEFAULT 'Standard',
    shipping_address TEXT,
    discount_amount  NUMERIC(12,2)         NOT NULL DEFAULT 0,
    tax_amount       NUMERIC(12,2)         NOT NULL DEFAULT 0,
    total_amount     NUMERIC(12,2)         NOT NULL DEFAULT 0,
    notes            TEXT,
    processed_by     UUID                  REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at       TIMESTAMPTZ           NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ           NOT NULL DEFAULT now()
);

-- ── 3.7 ORDER ITEMS ──────────────────────────────────────
CREATE TABLE public.order_items (
    id         UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id   TEXT          NOT NULL REFERENCES public.orders(id)   ON DELETE CASCADE,
    product_id UUID          NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity   INTEGER       NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
    discount   NUMERIC(12,2) NOT NULL DEFAULT 0,
    line_total NUMERIC(12,2) GENERATED ALWAYS AS ((quantity * unit_price) - discount) STORED,
    created_at TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- ── 3.8 PURCHASE ORDERS ──────────────────────────────────
CREATE TABLE public.purchase_orders (
    id           UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id  UUID             NOT NULL REFERENCES public.suppliers(id) ON DELETE RESTRICT,
    status       public.po_status NOT NULL DEFAULT 'Draft',
    expected_at  DATE,
    received_at  TIMESTAMPTZ,
    notes        TEXT,
    total_amount NUMERIC(14,2)    NOT NULL DEFAULT 0,
    created_by   UUID             REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ      NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ      NOT NULL DEFAULT now()
);

CREATE TABLE public.purchase_order_items (
    id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID          NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    product_id        UUID          NOT NULL REFERENCES public.products(id)         ON DELETE RESTRICT,
    quantity_ordered  INTEGER       NOT NULL CHECK (quantity_ordered > 0),
    quantity_received INTEGER       NOT NULL DEFAULT 0,
    unit_cost         NUMERIC(12,2) NOT NULL CHECK (unit_cost >= 0),
    created_at        TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- ── 3.9 STOCK MOVEMENTS (immutable ledger) ───────────────
CREATE TABLE public.stock_movements (
    id            UUID                       PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id    UUID                       NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    movement_type public.stock_movement_type NOT NULL,
    quantity      INTEGER                    NOT NULL,
    reference_id  TEXT,
    notes         TEXT,
    created_by    UUID                       REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at    TIMESTAMPTZ                NOT NULL DEFAULT now()
);

-- ── 3.10 AUDIT LOGS ──────────────────────────────────────
CREATE TABLE public.audit_logs (
    id         BIGSERIAL           PRIMARY KEY,
    user_id    UUID                REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT,
    action     public.audit_action NOT NULL,
    table_name TEXT,
    record_id  TEXT,
    old_data   JSONB,
    new_data   JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ         NOT NULL DEFAULT now()
);

-- ── 3.11 APP SETTINGS ────────────────────────────────────
CREATE TABLE public.app_settings (
    key         TEXT        PRIMARY KEY,
    value       JSONB       NOT NULL,
    description TEXT,
    updated_by  UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ============================================================
-- SECTION 4 — INDEXES
-- ============================================================

CREATE INDEX idx_products_category_id  ON public.products (category_id);
CREATE INDEX idx_products_supplier_id  ON public.products (supplier_id);
CREATE INDEX idx_products_is_active    ON public.products (is_active);
CREATE INDEX idx_products_stock        ON public.products (stock);
CREATE INDEX idx_products_tags         ON public.products USING GIN (tags);
CREATE INDEX idx_products_name_trgm    ON public.products USING GIN (name gin_trgm_ops);

CREATE INDEX idx_customers_status      ON public.customers (status);
CREATE INDEX idx_customers_created_at  ON public.customers (created_at DESC);
CREATE INDEX idx_customers_name_trgm   ON public.customers USING GIN (name gin_trgm_ops);

CREATE INDEX idx_orders_customer_id    ON public.orders (customer_id);
CREATE INDEX idx_orders_status         ON public.orders (status);
CREATE INDEX idx_orders_payment_status ON public.orders (payment_status);
CREATE INDEX idx_orders_created_at     ON public.orders (created_at DESC);

CREATE INDEX idx_oi_order_id           ON public.order_items (order_id);
CREATE INDEX idx_oi_product_id         ON public.order_items (product_id);

CREATE INDEX idx_sm_product_id         ON public.stock_movements (product_id);
CREATE INDEX idx_sm_created_at         ON public.stock_movements (created_at DESC);

CREATE INDEX idx_al_user_id            ON public.audit_logs (user_id);
CREATE INDEX idx_al_table_name         ON public.audit_logs (table_name);
CREATE INDEX idx_al_created_at         ON public.audit_logs (created_at DESC);

CREATE INDEX idx_po_supplier_id        ON public.purchase_orders (supplier_id);
CREATE INDEX idx_po_status             ON public.purchase_orders (status);
CREATE INDEX idx_poi_po_id             ON public.purchase_order_items (purchase_order_id);


-- ============================================================
-- SECTION 5 — FUNCTIONS
--   All tables exist now — safe to reference them.
--   ALL functions use LANGUAGE plpgsql to defer table
--   validation to runtime (avoids parse-time "does not exist").
-- ============================================================

-- ── 5.1 update_updated_at_column ─────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- ── 5.2 is_admin ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE plpgsql
STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    _ok BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ) INTO _ok;
    RETURN COALESCE(_ok, FALSE);
END;
$$;

-- ── 5.3 handle_new_user ───────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    _role public.user_role := 'viewer';
BEGIN
    IF NEW.email = 'saurabhkirve@gmail.com' THEN
        _role := 'admin';
    END IF;

    INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data ->> 'avatar_url',
        _role
    )
    ON CONFLICT (id) DO UPDATE
        SET email      = EXCLUDED.email,
            full_name  = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
            updated_at = now();
    RETURN NEW;
END;
$$;

-- ── 5.4 sync_customer_stats ──────────────────────────────
CREATE OR REPLACE FUNCTION public.sync_customer_stats()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    _cid        UUID;
    _tot_orders INTEGER;
    _tot_spent  NUMERIC;
    _last_order TIMESTAMPTZ;
    _new_status public.customer_status;
BEGIN
    _cid := CASE TG_OP WHEN 'DELETE' THEN OLD.customer_id ELSE NEW.customer_id END;

    SELECT COUNT(*), COALESCE(SUM(total_amount), 0), MAX(created_at)
    INTO   _tot_orders, _tot_spent, _last_order
    FROM   public.orders
    WHERE  customer_id = _cid AND status <> 'Cancelled';

    _new_status := CASE
        WHEN _tot_spent  >= 50000 THEN 'VIP'
        WHEN _tot_orders  = 0     THEN 'Inactive'
        ELSE 'Active'
    END;

    UPDATE public.customers
    SET
        total_orders  = _tot_orders,
        total_spent   = _tot_spent,
        last_order_at = _last_order,
        status        = CASE
                            WHEN status = 'VIP' AND _new_status <> 'VIP' THEN 'VIP'
                            ELSE _new_status
                        END,
        updated_at    = now()
    WHERE id = _cid;

    RETURN COALESCE(NEW, OLD);
END;
$$;

-- ── 5.5 manage_stock_on_order_item ───────────────────────
CREATE OR REPLACE FUNCTION public.manage_stock_on_order_item()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF (SELECT stock FROM public.products WHERE id = NEW.product_id) < NEW.quantity THEN
            RAISE EXCEPTION 'Insufficient stock for product %', NEW.product_id
                USING ERRCODE = 'P0001';
        END IF;
        UPDATE public.products SET stock = stock - NEW.quantity WHERE id = NEW.product_id;
        INSERT INTO public.stock_movements (product_id, movement_type, quantity, reference_id, notes)
        VALUES (NEW.product_id, 'sale', -NEW.quantity, NEW.order_id, 'Auto-deducted on order');

    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.products SET stock = stock + OLD.quantity WHERE id = OLD.product_id;
        INSERT INTO public.stock_movements (product_id, movement_type, quantity, reference_id, notes)
        VALUES (OLD.product_id, 'return', OLD.quantity, OLD.order_id, 'Auto-restored on item removal');
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- ── 5.6 sync_order_total ─────────────────────────────────
CREATE OR REPLACE FUNCTION public.sync_order_total()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE _oid TEXT;
BEGIN
    _oid := COALESCE(NEW.order_id, OLD.order_id);
    UPDATE public.orders
    SET total_amount = (
        SELECT COALESCE(SUM(line_total), 0)
        FROM   public.order_items
        WHERE  order_id = _oid
    )
    WHERE id = _oid;
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- ── 5.7 receive_purchase_order ───────────────────────────
CREATE OR REPLACE FUNCTION public.receive_purchase_order()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    IF NEW.status = 'Received' AND OLD.status <> 'Received' THEN
        UPDATE public.products p
        SET    stock = p.stock + poi.quantity_ordered
        FROM   public.purchase_order_items poi
        WHERE  poi.purchase_order_id = NEW.id AND poi.product_id = p.id;

        INSERT INTO public.stock_movements (product_id, movement_type, quantity, reference_id, notes)
        SELECT poi.product_id, 'purchase', poi.quantity_ordered, NEW.id::TEXT, 'Received via PO'
        FROM   public.purchase_order_items poi
        WHERE  poi.purchase_order_id = NEW.id;

        UPDATE public.purchase_order_items
        SET    quantity_received = quantity_ordered
        WHERE  purchase_order_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$;

-- ── 5.8 get_dashboard_stats ───────────────────────────────
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS JSONB LANGUAGE plpgsql
STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    _total_sales       NUMERIC := 0;
    _orders_this_week  INTEGER := 0;
    _products_in_stock INTEGER := 0;
    _low_stock_items   INTEGER := 0;
    _total_customers   INTEGER := 0;
    _pending_orders    INTEGER := 0;
BEGIN
    SELECT COALESCE(SUM(total_amount), 0) INTO _total_sales
    FROM   public.orders WHERE status <> 'Cancelled';

    SELECT COUNT(*) INTO _orders_this_week
    FROM   public.orders WHERE created_at >= now() - INTERVAL '7 days';

    SELECT COUNT(*) INTO _products_in_stock
    FROM   public.products WHERE stock > 0 AND is_active;

    SELECT COUNT(*) INTO _low_stock_items
    FROM   public.products WHERE stock > 0 AND stock < low_stock_threshold AND is_active;

    SELECT COUNT(*) INTO _total_customers FROM public.customers;

    SELECT COUNT(*) INTO _pending_orders FROM public.orders WHERE status = 'Pending';

    RETURN jsonb_build_object(
        'total_sales',       _total_sales,
        'orders_this_week',  _orders_this_week,
        'products_in_stock', _products_in_stock,
        'low_stock_items',   _low_stock_items,
        'total_customers',   _total_customers,
        'pending_orders',    _pending_orders
    );
END;
$$;


-- ============================================================
-- SECTION 6 — TRIGGERS
-- ============================================================

CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_suppliers_updated_at
    BEFORE UPDATE ON public.suppliers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_purchase_orders_updated_at
    BEFORE UPDATE ON public.purchase_orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auth trigger — safe block in case of permission issues
DO $$
BEGIN
    CREATE TRIGGER trg_on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not create auth trigger: %. Create manually if needed.', SQLERRM;
END;
$$;

CREATE TRIGGER trg_sync_customer_stats
    AFTER INSERT OR UPDATE OF status, total_amount OR DELETE
    ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.sync_customer_stats();

CREATE TRIGGER trg_manage_stock_on_order_item
    AFTER INSERT OR DELETE ON public.order_items
    FOR EACH ROW EXECUTE FUNCTION public.manage_stock_on_order_item();

CREATE TRIGGER trg_sync_order_total
    AFTER INSERT OR UPDATE OR DELETE ON public.order_items
    FOR EACH ROW EXECUTE FUNCTION public.sync_order_total();

CREATE TRIGGER trg_receive_purchase_order
    AFTER UPDATE OF status ON public.purchase_orders
    FOR EACH ROW EXECUTE FUNCTION public.receive_purchase_order();


-- ============================================================
-- SECTION 7 — VIEWS
-- ============================================================

CREATE OR REPLACE VIEW public.v_order_summary AS
SELECT
    o.id, o.status, o.payment_status, o.shipping_method,
    o.total_amount, o.discount_amount, o.tax_amount,
    o.created_at, o.updated_at,
    c.id   AS customer_id,
    c.name AS customer_name,
    c.email AS customer_email,
    c.phone AS customer_phone,
    COUNT(oi.id)                  AS item_count,
    COALESCE(SUM(oi.quantity), 0) AS total_qty
FROM      public.orders      o
JOIN      public.customers   c  ON c.id = o.customer_id
LEFT JOIN public.order_items oi ON oi.order_id = o.id
GROUP BY  o.id, c.id;

CREATE OR REPLACE VIEW public.v_customer_stats AS
SELECT
    c.*,
    COUNT(DISTINCT o.id)                                                    AS order_count,
    COALESCE(SUM(o.total_amount) FILTER (WHERE o.status <> 'Cancelled'), 0) AS lifetime_value,
    MAX(o.created_at)                                                       AS last_order_date
FROM      public.customers c
LEFT JOIN public.orders    o ON o.customer_id = c.id
GROUP BY  c.id;

CREATE OR REPLACE VIEW public.v_inventory_status AS
SELECT
    p.*,
    cat.name AS category_name,
    sup.name AS supplier_name,
    CASE
        WHEN p.stock = 0                     THEN 'Out of Stock'
        WHEN p.stock < p.low_stock_threshold THEN 'Low Stock'
        ELSE                                      'In Stock'
    END AS stock_status,
    ROUND((p.price - COALESCE(p.cost_price,0)) / NULLIF(p.price,0) * 100, 2) AS margin_pct
FROM      public.products   p
LEFT JOIN public.categories cat ON cat.id = p.category_id
LEFT JOIN public.suppliers  sup ON sup.id = p.supplier_id
WHERE p.is_active = TRUE;

CREATE OR REPLACE VIEW public.v_daily_revenue AS
SELECT
    date_trunc('day', o.created_at)::DATE AS sale_date,
    COUNT(DISTINCT o.id)                  AS order_count,
    SUM(o.total_amount)                   AS revenue,
    COALESCE(SUM(oi.quantity), 0)         AS units_sold
FROM      public.orders      o
JOIN      public.order_items oi ON oi.order_id = o.id
WHERE     o.status <> 'Cancelled'
GROUP BY  1 ORDER BY 1 DESC;

CREATE OR REPLACE VIEW public.v_sales_by_category AS
SELECT
    COALESCE(p.category, cat.name, 'Uncategorised') AS category,
    SUM(oi.quantity)    AS units_sold,
    SUM(oi.line_total)  AS revenue,
    COUNT(DISTINCT o.id) AS orders
FROM      public.order_items oi
JOIN      public.products    p   ON p.id   = oi.product_id
JOIN      public.orders      o   ON o.id   = oi.order_id
LEFT JOIN public.categories  cat ON cat.id = p.category_id
WHERE     o.status <> 'Cancelled'
GROUP BY  1 ORDER BY revenue DESC;

CREATE OR REPLACE VIEW public.v_low_stock_alerts AS
SELECT
    p.id, p.name, p.sku, p.stock, p.low_stock_threshold, p.category,
    CASE WHEN p.stock = 0 THEN 'critical' ELSE 'warning' END AS alert_level,
    sup.name  AS supplier_name,
    sup.email AS supplier_email
FROM      public.products  p
LEFT JOIN public.suppliers sup ON sup.id = p.supplier_id
WHERE p.is_active = TRUE AND p.stock < p.low_stock_threshold
ORDER BY  p.stock ASC;


-- ============================================================
-- SECTION 8 — ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings         ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated
    USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE TO authenticated
    USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles_delete" ON public.profiles FOR DELETE TO authenticated
    USING (public.is_admin());

-- CATEGORIES
CREATE POLICY "categories_select" ON public.categories FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "categories_write"  ON public.categories FOR ALL    TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager')));

-- PRODUCTS
CREATE POLICY "products_select" ON public.products FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "products_insert" ON public.products FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager')));
CREATE POLICY "products_update" ON public.products FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager')));
CREATE POLICY "products_delete" ON public.products FOR DELETE TO authenticated
    USING (public.is_admin());

-- SUPPLIERS
CREATE POLICY "suppliers_select" ON public.suppliers FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "suppliers_write"  ON public.suppliers FOR ALL    TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager')));

-- CUSTOMERS
CREATE POLICY "customers_select" ON public.customers FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "customers_insert" ON public.customers FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager')));
CREATE POLICY "customers_update" ON public.customers FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager')));
CREATE POLICY "customers_delete" ON public.customers FOR DELETE TO authenticated
    USING (public.is_admin());

-- ORDERS
CREATE POLICY "orders_select" ON public.orders FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "orders_insert" ON public.orders FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager')));
CREATE POLICY "orders_update" ON public.orders FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager')));
CREATE POLICY "orders_delete" ON public.orders FOR DELETE TO authenticated
    USING (public.is_admin());

-- ORDER ITEMS
CREATE POLICY "order_items_select" ON public.order_items FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "order_items_write"  ON public.order_items FOR ALL    TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager')));

-- PURCHASE ORDERS
CREATE POLICY "po_select"  ON public.purchase_orders FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "po_write"   ON public.purchase_orders FOR ALL    TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager')));
CREATE POLICY "poi_select" ON public.purchase_order_items FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "poi_write"  ON public.purchase_order_items FOR ALL    TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager')));

-- STOCK MOVEMENTS
CREATE POLICY "stock_movements_select" ON public.stock_movements FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "stock_movements_insert" ON public.stock_movements FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager')));

-- AUDIT LOGS (admin read-only)
CREATE POLICY "audit_logs_select" ON public.audit_logs FOR SELECT TO authenticated
    USING (public.is_admin());

-- APP SETTINGS
CREATE POLICY "app_settings_select" ON public.app_settings FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "app_settings_write"  ON public.app_settings FOR ALL    TO authenticated
    USING (public.is_admin());


-- ============================================================
-- SECTION 9 — STORAGE BUCKETS
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images', 'product-images', TRUE, 5242880,
        ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', TRUE, 2097152,
        ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "storage_product_images_read"  ON storage.objects;
DROP POLICY IF EXISTS "storage_product_images_write" ON storage.objects;
DROP POLICY IF EXISTS "storage_avatars_read"         ON storage.objects;
DROP POLICY IF EXISTS "storage_avatars_write"        ON storage.objects;

CREATE POLICY "storage_product_images_read"  ON storage.objects FOR SELECT
    USING (bucket_id = 'product-images');
CREATE POLICY "storage_product_images_write" ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "storage_avatars_read"  ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');
CREATE POLICY "storage_avatars_write" ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::TEXT);


-- ============================================================
-- SECTION 10 — SEED DATA
-- ============================================================

INSERT INTO public.categories (name, slug, sort_order) VALUES
    ('Cricket','cricket',1),('Football','football',2),('Badminton','badminton',3),
    ('Basketball','basketball',4),('Tennis','tennis',5),('Swimming','swimming',6),
    ('Fitness','fitness',7),('Outdoor','outdoor',8),('Accessories','accessories',9)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (name, slug, parent_id, sort_order)
    SELECT 'Cricket Bats','cricket-bats',id,1 FROM public.categories WHERE slug='cricket'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.categories (name, slug, parent_id, sort_order)
    SELECT 'Cricket Balls','cricket-balls',id,2 FROM public.categories WHERE slug='cricket'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.categories (name, slug, parent_id, sort_order)
    SELECT 'Cricket Helmets','cricket-helmets',id,3 FROM public.categories WHERE slug='cricket'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.categories (name, slug, parent_id, sort_order)
    SELECT 'Cricket Gloves','cricket-gloves',id,4 FROM public.categories WHERE slug='cricket'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.categories (name, slug, parent_id, sort_order)
    SELECT 'Cricket Pads','cricket-pads',id,5 FROM public.categories WHERE slug='cricket'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.categories (name, slug, parent_id, sort_order)
    SELECT 'Football Boots','football-boots',id,1 FROM public.categories WHERE slug='football'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.categories (name, slug, parent_id, sort_order)
    SELECT 'Footballs','footballs',id,2 FROM public.categories WHERE slug='football'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.categories (name, slug, parent_id, sort_order)
    SELECT 'Badminton Rackets','badminton-rackets',id,1 FROM public.categories WHERE slug='badminton'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.categories (name, slug, parent_id, sort_order)
    SELECT 'Shuttlecocks','shuttlecocks',id,2 FROM public.categories WHERE slug='badminton'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.app_settings (key, value, description) VALUES
    ('store_name',          '"Sahyadri Sports"',                          'Shop display name'),
    ('currency',            '"INR"',                                      'Currency code'),
    ('currency_symbol',     '"₹"',                                        'Currency symbol'),
    ('tax_rate',            '18',                                         'Default GST %'),
    ('low_stock_threshold', '20',                                         'Low-stock threshold'),
    ('timezone',            '"Asia/Kolkata"',                             'Store timezone'),
    ('invoice_prefix',      '"ORD"',                                      'Order ID prefix'),
    ('contact_email',       '"saurabhkirve@gmail.com"',                   'Admin email'),
    ('shipping_methods',    '["Standard","Express","Same Day","Pickup"]', 'Shipping options')
ON CONFLICT (key) DO NOTHING;


-- ============================================================
-- SECTION 11 — GRANTS
-- ============================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE, DELETE ON
    public.profiles, public.categories, public.products, public.suppliers,
    public.customers, public.orders, public.order_items,
    public.purchase_orders, public.purchase_order_items,
    public.stock_movements, public.app_settings
TO authenticated;
GRANT SELECT ON
    public.v_order_summary, public.v_customer_stats, public.v_inventory_status,
    public.v_daily_revenue, public.v_sales_by_category, public.v_low_stock_alerts
TO authenticated;
GRANT USAGE  ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin()             TO authenticated;
GRANT ALL ON ALL TABLES    IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;


-- ============================================================
-- ✓ DONE
-- Run this whole file in: Supabase → SQL Editor → Run
--
-- First login with saurabhkirve@gmail.com
--   → handle_new_user() fires → role = 'admin' auto-assigned
-- ============================================================