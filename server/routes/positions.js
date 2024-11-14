import express from 'express';
import { db, generateId } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  res.json(db.positions);
});

router.post('/', authenticateToken, (req, res) => {
  const { name, color } = req.body;
  
  if (req.user.role !== 'admin') {
    return res.sendStatus(403);
  }

  const id = generateId();
  const newPosition = { id, name, color };
  
  db.positions.push(newPosition);
  res.status(201).json(newPosition);
});

router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, color } = req.body;
  
  if (req.user.role !== 'admin') {
    return res.sendStatus(403);
  }

  const position = db.positions.find(p => p.id === id);
  if (!position) {
    return res.status(404).json({ error: 'Position not found' });
  }

  position.name = name;
  position.color = color;

  res.json(position);
});

router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  if (req.user.role !== 'admin') {
    return res.sendStatus(403);
  }

  const index = db.positions.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Position not found' });
  }

  // Check if position is in use
  const positionInUse = db.users.some(user => user.position_id === id);
  if (positionInUse) {
    return res.status(400).json({ error: 'Position is in use by employees' });
  }

  db.positions.splice(index, 1);
  res.sendStatus(204);
});

export default router;