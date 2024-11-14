export type Role = 'admin' | 'manager' | 'employee';

export type Position = {
  id: string;
  name: string;
  color: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  position: Position;
  avatar?: string;
};

export type Shift = {
  id: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
  user?: {
    id: string;
    name: string;
    position?: Position;
  };
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
};