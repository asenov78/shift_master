import express from 'express';
import { db, generateId } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { z } from 'zod';

const router = express.Router();

// Validation schema for shift creation
const ShiftSchema = z.object({
  userId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  notes: z.string().optional()
});

// Get shifts with optional date range and user filtering
router.get('/', authenticateToken, (req, res) => {
  try {
    const { start_date, end_date, userId } = req.query;
    
    let shifts = [...db.shifts];

    // Filter by user role
    if (req.user.role === 'employee') {
      shifts = shifts.filter(shift => shift.userId === req.user.id);
    } else if (userId) {
      shifts = shifts.filter(shift => shift.userId === userId);
    }
    
    // Filter by date range
    if (start_date && end_date) {
      shifts = shifts.filter(shift => 
        shift.date >= start_date && shift.date <= end_date
      );
    }

    // Enhance shift data with user information
    const enhancedShifts = shifts.map(shift => {
      const user = db.users.find(u => u.id === shift.userId);
      const position = user ? db.positions.find(p => p.id === user.position_id) : null;
      
      return {
        ...shift,
        user: user ? {
          id: user.id,
          name: user.name,
          position: position || undefined
        } : undefined
      };
    });
    
    res.json(enhancedShifts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shifts' });
  }
});

// Create new shift (admin/manager only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Check authorization
    if (req.user.role === 'employee') {
      return res.status(403).json({ error: 'Unauthorized: Only admins and managers can create shifts' });
    }

    // Validate request body
    const validatedData = ShiftSchema.parse(req.body);
    
    // Check if user exists
    const user = db.users.find(u => u.id === validatedData.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check for shift overlap
    const hasOverlap = db.shifts.some(shift => 
      shift.userId === validatedData.userId &&
      shift.date === validatedData.date &&
      ((validatedData.startTime >= shift.startTime && validatedData.startTime < shift.endTime) ||
       (validatedData.endTime > shift.startTime && validatedData.endTime <= shift.endTime) ||
       (validatedData.startTime <= shift.startTime && validatedData.endTime >= shift.endTime))
    );

    if (hasOverlap) {
      return res.status(400).json({ error: 'Shift overlaps with existing shift' });
    }

    // Create new shift
    const newShift = {
      id: generateId(),
      ...validatedData,
      createdBy: req.user.id,
      createdAt: new Date().toISOString()
    };
    
    db.shifts.push(newShift);

    // Return shift with user information
    const position = db.positions.find(p => p.id === user.position_id);
    const enhancedShift = {
      ...newShift,
      user: {
        id: user.id,
        name: user.name,
        position: position || undefined
      }
    };

    res.status(201).json(enhancedShift);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid shift data', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create shift' });
    }
  }
});

// Update shift (admin/manager only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role === 'employee') {
      return res.status(403).json({ error: 'Unauthorized: Only admins and managers can update shifts' });
    }

    const { id } = req.params;
    const validatedData = ShiftSchema.parse(req.body);

    const shiftIndex = db.shifts.findIndex(s => s.id === id);
    if (shiftIndex === -1) {
      return res.status(404).json({ error: 'Shift not found' });
    }

    // Check for overlap with other shifts
    const hasOverlap = db.shifts.some(shift => 
      shift.id !== id &&
      shift.userId === validatedData.userId &&
      shift.date === validatedData.date &&
      ((validatedData.startTime >= shift.startTime && validatedData.startTime < shift.endTime) ||
       (validatedData.endTime > shift.startTime && validatedData.endTime <= shift.endTime) ||
       (validatedData.startTime <= shift.startTime && validatedData.endTime >= shift.endTime))
    );

    if (hasOverlap) {
      return res.status(400).json({ error: 'Shift overlaps with existing shift' });
    }

    // Update shift
    const updatedShift = {
      ...db.shifts[shiftIndex],
      ...validatedData,
      updatedBy: req.user.id,
      updatedAt: new Date().toISOString()
    };

    db.shifts[shiftIndex] = updatedShift;

    // Return updated shift with user information
    const user = db.users.find(u => u.id === updatedShift.userId);
    const position = user ? db.positions.find(p => p.id === user.position_id) : null;
    
    const enhancedShift = {
      ...updatedShift,
      user: user ? {
        id: user.id,
        name: user.name,
        position: position || undefined
      } : undefined
    };

    res.json(enhancedShift);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid shift data', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to update shift' });
    }
  }
});

// Delete shift (admin/manager only)
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    if (req.user.role === 'employee') {
      return res.status(403).json({ error: 'Unauthorized: Only admins and managers can delete shifts' });
    }

    const { id } = req.params;
    const shiftIndex = db.shifts.findIndex(s => s.id === id);
    
    if (shiftIndex === -1) {
      return res.status(404).json({ error: 'Shift not found' });
    }

    db.shifts.splice(shiftIndex, 1);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete shift' });
  }
});

export default router;