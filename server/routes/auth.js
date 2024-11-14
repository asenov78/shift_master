import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';

const router = express.Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = db.users.find(u => u.email === email);
  
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key'
  );

  const position = db.positions.find(p => p.id === user.position_id);
  
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      position
    }
  });
});

export default router;