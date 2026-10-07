import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const app = express();
const PORT = 5000;
const JWT_SECRET = 'votre_cle_secrete_luxe_123';

app.use(cors());
app.use(express.json());

// Base de données utilisateurs temporaire en mémoire
const users = [];

// Route d'inscription (Register)
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { id: Date.now(), name, email, password: hashedPassword };
  users.push(newUser);

  const token = jwt.sign({ id: newUser.id, name: newUser.name, email: newUser.email }, JWT_SECRET, { expiresIn: '1h' });

  res.status(201).json({
    message: 'Compte créé avec succès',
    token,
    user: { id: newUser.id, name: newUser.name, email: newUser.email }
  });
});

// Route de connexion (Login)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(400).json({ message: 'Identifiants invalides.' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: 'Identifiants invalides.' });
  }

  const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

  res.json({
    message: 'Connexion réussie',
    token,
    user: { id: user.id, name: user.name, email: user.email }
  });
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
