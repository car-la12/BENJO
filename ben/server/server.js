import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import pg from 'pg';
import { initialProducts } from './data/products.js';
import { slugifyProductName, validateProductInput } from './productValidation.js';

const { Pool } = pg;
const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const CMS_ADMIN_EMAIL = process.env.CMS_ADMIN_EMAIL?.trim().toLowerCase();
const CMS_ADMIN_PASSWORD_HASH = process.env.CMS_ADMIN_PASSWORD_HASH;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(cors());
app.use(express.json({ limit: '32kb' }));

const users = [];
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});

function requireAdmin(req, res, next) {
  const authorization = req.get('authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : '';

  if (!token) {
    return res.status(401).json({ message: 'Connexion administrateur requise.' });
  }

  try {
    const claims = jwt.verify(token, JWT_SECRET);
    if (typeof claims === 'string' || claims.role !== 'admin') {
      return res.status(403).json({ message: 'Accès réservé à l’administration.' });
    }
    return next();
  } catch {
    return res.status(401).json({ message: 'Session administrateur expirée ou invalide.' });
  }
}

function productResponse(row) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    description: row.description,
    price: row.price,
    compareAtPrice: row.compare_at_price,
    image: row.image,
    steep: row.steep,
    temperature: row.temperature,
    isActive: row.is_active,
  };
}

async function initializeDatabase() {
  const schema = await readFile(new URL('./schema.sql', import.meta.url), 'utf8');
  await pool.query(schema);

  for (const product of initialProducts) {
    await pool.query(
      `INSERT INTO products
        (id, name, type, description, price, compare_at_price, image, steep, temperature)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO NOTHING`,
      [
        product.id,
        product.name,
        product.type,
        product.description,
        product.price,
        product.compareAtPrice ?? null,
        product.image,
        product.steep,
        product.temperature,
      ],
    );
  }
}

app.get('/api/products', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT id, name, type, description, price, compare_at_price, image, steep, temperature, is_active
     FROM products
     WHERE is_active = TRUE
     ORDER BY created_at, name`,
  );
  res.json(rows.map(productResponse));
});

app.post('/api/admin/login', adminLoginLimiter, async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (email !== CMS_ADMIN_EMAIL || !await bcrypt.compare(password, CMS_ADMIN_PASSWORD_HASH)) {
    return res.status(401).json({ message: 'Adresse e-mail ou mot de passe invalide.' });
  }

  const token = jwt.sign({ role: 'admin', email }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, admin: { email } });
});

app.get('/api/admin/products', requireAdmin, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT id, name, type, description, price, compare_at_price, image, steep, temperature, is_active
     FROM products
     ORDER BY created_at DESC, name`,
  );
  res.json(rows.map(productResponse));
});

app.post('/api/admin/products', requireAdmin, async (req, res) => {
  const validation = validateProductInput(req.body);
  if (validation.error) return res.status(400).json({ message: validation.error });

  const product = validation.data;
  const id = slugifyProductName(product.name);
  try {
    const { rows } = await pool.query(
      `INSERT INTO products
        (id, name, type, description, price, compare_at_price, image, steep, temperature)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, name, type, description, price, compare_at_price, image, steep, temperature, is_active`,
      [id, product.name, product.type, product.description, product.price, product.compareAtPrice, product.image, product.steep, product.temperature],
    );
    res.status(201).json(productResponse(rows[0]));
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Un produit utilise déjà cet identifiant. Modifiez son nom pour le distinguer.' });
    }
    throw error;
  }
});

app.put('/api/admin/products/:id', requireAdmin, async (req, res) => {
  const validation = validateProductInput(req.body);
  if (validation.error) return res.status(400).json({ message: validation.error });

  const product = validation.data;
  const { rows } = await pool.query(
    `UPDATE products
     SET name = $2, type = $3, description = $4, price = $5, compare_at_price = $6,
         image = $7, steep = $8, temperature = $9, updated_at = NOW()
     WHERE id = $1
     RETURNING id, name, type, description, price, compare_at_price, image, steep, temperature, is_active`,
    [req.params.id, product.name, product.type, product.description, product.price, product.compareAtPrice, product.image, product.steep, product.temperature],
  );
  if (!rows.length) return res.status(404).json({ message: 'Produit introuvable.' });
  res.json(productResponse(rows[0]));
});

app.patch('/api/admin/products/:id/status', requireAdmin, async (req, res) => {
  if (typeof req.body?.isActive !== 'boolean') {
    return res.status(400).json({ message: 'Le statut du produit est invalide.' });
  }

  const { rows } = await pool.query(
    `UPDATE products
     SET is_active = $2, updated_at = NOW()
     WHERE id = $1
     RETURNING id, name, type, description, price, compare_at_price, image, steep, temperature, is_active`,
    [req.params.id, req.body.isActive],
  );
  if (!rows.length) return res.status(404).json({ message: 'Produit introuvable.' });
  res.json(productResponse(rows[0]));
});

app.use((error, req, res, next) => {
  console.error('Erreur API :', error);
  res.status(500).json({ message: 'Une erreur est survenue. Réessayez plus tard.' });
});

async function startServer() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL est obligatoire.');
  if (!JWT_SECRET || JWT_SECRET.length < 32) throw new Error('JWT_SECRET doit contenir au moins 32 caractères.');
  if (!CMS_ADMIN_EMAIL || !CMS_ADMIN_PASSWORD_HASH?.startsWith('$2')) {
    throw new Error('CMS_ADMIN_EMAIL et CMS_ADMIN_PASSWORD_HASH (hachage bcrypt) sont obligatoires.');
  }

  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
  });
}

startServer().catch(async (error) => {
  console.error('Impossible de démarrer le serveur :', error.message);
  await pool.end();
  process.exitCode = 1;
});
