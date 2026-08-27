import 'dotenv/config';
import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UniqueConstraintError } from 'sequelize';
import { init } from './db';
import { User } from './models/User';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4001;
const JWT_SECRET = process.env.JWT_SECRET as string;

app.get('/health', (_req: Request, res: Response) => res.json({ status: 'ok' }));

app.post('/register', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password_hash });
    res.status(201).json({ id: user.id, username: user.username, created_at: user.created_at });
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      return res.status(409).json({ error: 'username already taken' });
    }
    console.error(err);
    res.status(500).json({ error: 'internal server error' });
  }
});

app.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  try {
    const user = await User.findOne({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'invalid credentials' });
    }

    const token = jwt.sign({ sub: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: '1h',
    });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal server error' });
  }
});

async function start() {
  await init();
  app.listen(PORT, () => console.log(`auth-service listening on ${PORT}`));
}

start();
