import express from 'express';
import bcrypt from 'bcryptjs';
import { db, generateId } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  const users = db.users.map(user => {
    const position = db.positions.find(p => p.id === user.position_id);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      position
    };
  });
  res.json(users);
});

router.post('/', authenticateToken, (req, res) => {
  const { name, email, password, role, position_id } = req.body;
  
  if (req.user.role !== 'admin') {
    return res.sendStatus(403);
  }

  const id = generateId();
  const hashedPassword = bcrypt.hashSync(password, 10);

  const newUser = {
    id,
    name,
    email,
    password: hashedPassword,
    role,
    position_id
  };

  db.users.push(newUser);

  const position = db.positions.find(p => p.id === position_id);
  res.status(201).json({
    id,
    name,
    email,
    role,
    position
  });
});

export default router;