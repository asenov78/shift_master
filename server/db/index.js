import bcrypt from 'bcryptjs';

export const db = {
  users: [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      password: bcrypt.hashSync('admin', 10),
      role: 'admin',
      position_id: '1'
    }
  ],
  positions: [
    { id: '1', name: 'Administrator', color: '#4F46E5' },
    { id: '2', name: 'Developer', color: '#10B981' },
    { id: '3', name: 'Designer', color: '#F59E0B' }
  ],
  shifts: []
};

export const generateId = () => Math.random().toString(36).substr(2, 9);