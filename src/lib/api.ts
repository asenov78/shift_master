import { User, Shift, Position } from '../types';

const API_URL = '/api';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include'
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
}

export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    credentials: 'include'
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Login failed' }));
    throw new Error(error.error || 'Login failed');
  }

  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data.user;
}

export async function getEmployees(): Promise<User[]> {
  return fetchWithAuth('/users');
}

export async function createEmployee(employee: { 
  name: string; 
  email: string; 
  password: string;
  role: string;
  position_id: string;
}): Promise<User> {
  return fetchWithAuth('/users', {
    method: 'POST',
    body: JSON.stringify(employee),
  });
}

export async function getPositions(): Promise<Position[]> {
  return fetchWithAuth('/positions');
}

export async function getShifts(startDate: string, endDate: string, userId?: string): Promise<Shift[]> {
  const params = new URLSearchParams({
    start_date: startDate,
    end_date: endDate,
    ...(userId && { userId })
  });
  return fetchWithAuth(`/shifts?${params}`);
}

export async function createShift(shift: {
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
}): Promise<Shift> {
  return fetchWithAuth('/shifts', {
    method: 'POST',
    body: JSON.stringify(shift),
  });
}

export async function updateShift(id: string, shift: {
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
}): Promise<Shift> {
  return fetchWithAuth(`/shifts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(shift),
  });
}

export async function deleteShift(id: string): Promise<void> {
  return fetchWithAuth(`/shifts/${id}`, {
    method: 'DELETE',
  });
}