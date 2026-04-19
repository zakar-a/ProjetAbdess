const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:qr27vAGdS3BFSniQ@db.wvmrrtiodaruihslkilg.supabase.co:5432/postgres'
});

async function main() {
  await client.connect();
  
  const sql = `
    -- Users Table
    CREATE TABLE IF NOT EXISTS public.users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      "magasinId" TEXT
    );

    -- Products Table
    CREATE TABLE IF NOT EXISTS public.products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price NUMERIC NOT NULL
    );

    -- Magasins Table
    CREATE TABLE IF NOT EXISTS public.magasins (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT,
      stock JSONB DEFAULT '{}'::jsonb,
      "alertThreshold" INTEGER DEFAULT 30,
      "customPrices" JSONB DEFAULT '{}'::jsonb,
      "activeProducts" JSONB DEFAULT '[]'::jsonb
    );

    -- Orders Table
    CREATE TABLE IF NOT EXISTS public.orders (
      id TEXT PRIMARY KEY,
      "clientId" TEXT,
      "clientName" TEXT,
      "magasinId" TEXT,
      "magasinName" TEXT,
      "vendeurId" TEXT,
      "deliveryDate" TEXT,
      items JSONB DEFAULT '[]'::jsonb,
      status TEXT DEFAULT 'pending',
      total NUMERIC DEFAULT 0,
      timestamp TEXT NOT NULL
    );

    -- Turn off RLS for now so we don't need complex policies immediately while setting up AppContext
    ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
    ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
    ALTER TABLE public.magasins DISABLE ROW LEVEL SECURITY;
    ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

    -- Initial Admin User
    INSERT INTO public.users (id, username, password, name, role)
    VALUES ('u1', 'patron', '123', 'M. Benkirane', 'patron')
    ON CONFLICT (username) DO NOTHING;
  `;

  try {
    await client.query(sql);
    console.log("Database initialized successfully!");
  } catch (err) {
    console.error("Error initializing DB:", err);
  } finally {
    await client.end();
  }
}

main();
