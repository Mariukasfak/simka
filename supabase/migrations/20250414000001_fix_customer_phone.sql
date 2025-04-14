-- Patikrinti, ar stulpelis customer_phone jau egzistuoja lentelėje orders
DO $$
BEGIN
    -- Patikriname, ar stulpelis customer_phone egzistuoja orders lentelėje
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'orders'
        AND column_name = 'customer_phone'
    ) THEN
        -- Jei ne, pridedame jį
        ALTER TABLE orders ADD COLUMN customer_phone text;
    END IF;
    
    -- Perkrauname schemos kešą
    -- Šis užklausos dalis padės atnaujinti schemą Supabase kliento pusėje
    NOTIFY pgrst, 'reload schema';
END $$;