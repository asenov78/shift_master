import React, { useState } from 'react';
import { Save, Plus, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Position } from '../types';
import { getPositions } from '../lib/api';

export function SettingsPage() {
  const queryClient = useQueryClient();
  const [newPosition, setNewPosition] = useState<Partial<Position>>({ name: '', color: '#4F46E5' });
  const [editingPositions, setEditingPositions] = useState<Record<string, Position>>({});

  const { data: positions = [], isLoading } = useQuery({
    queryKey: ['positions'],
    queryFn: getPositions,
  });

  const createPositionMutation = useMutation({
    mutationFn: async (position: Partial<Position>) => {
      const response = await fetch('/api/positions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(position),
      });
      if (!response.ok) throw new Error('Failed to create position');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      setNewPosition({ name: '', color: '#4F46E5' });
      toast.success('Position created successfully');
    },
    onError: () => {
      toast.error('Failed to create position');
    },
  });

  const updatePositionMutation = useMutation({
    mutationFn: async (position: Position) => {
      const response = await fetch(`/api/positions/${position.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(position),
      });
      if (!response.ok) throw new Error('Failed to update position');
      return response.json();
    },
    onSuccess: (_, position) => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      setEditingPositions((prev) => {
        const next = { ...prev };
        delete next[position.id];
        return next;
      });
      toast.success('Position updated successfully');
    },
    onError: () => {
      toast.error('Failed to update position');
    },
  });

  const deletePositionMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/positions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete position');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      toast.success('Position deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete position');
    },
  });

  const handleAddPosition = () => {
    if (!newPosition.name || !newPosition.color) return;
    createPositionMutation.mutate(newPosition);
  };

  const handleEditPosition = (position: Position) => {
    setEditingPositions((prev) => ({
      ...prev,
      [position.id]: position,
    }));
  };

  const handleSavePosition = (position: Position) => {
    updatePositionMutation.mutate(position);
  };

  const handleCancelEdit = (id: string) => {
    setEditingPositions((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Positions
          </h3>
          <div className="mt-5">
            <div className="space-y-4">
              {positions.map((position) => (
                <div
                  key={position.id}
                  className="flex items-center space-x-4"
                >
                  {editingPositions[position.id] ? (
                    <>
                      <input
                        type="text"
                        value={editingPositions[position.id].name}
                        onChange={(e) =>
                          setEditingPositions((prev) => ({
                            ...prev,
                            [position.id]: {
                              ...prev[position.id],
                              name: e.target.value,
                            },
                          }))
                        }
                        className="flex-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                      <input
                        type="color"
                        value={editingPositions[position.id].color}
                        onChange={(e) =>
                          setEditingPositions((prev) => ({
                            ...prev,
                            [position.id]: {
                              ...prev[position.id],
                              color: e.target.value,
                            },
                          }))
                        }
                        className="h-9 w-20 p-1 rounded border border-gray-300"
                      />
                      <button
                        onClick={() => handleSavePosition(editingPositions[position.id])}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => handleCancelEdit(position.id)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex-1 flex items-center space-x-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: position.color }}
                        />
                        <span>{position.name}</span>
                      </div>
                      <button
                        onClick={() => handleEditPosition(position)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deletePositionMutation.mutate(position.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center space-x-4">
              <input
                type="text"
                value={newPosition.name}
                onChange={(e) => setNewPosition((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Position name"
                className="flex-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
              <input
                type="color"
                value={newPosition.color}
                onChange={(e) => setNewPosition((prev) => ({ ...prev, color: e.target.value }))}
                className="h-9 w-20 p-1 rounded border border-gray-300"
              />
              <button
                onClick={handleAddPosition}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Company Settings
          </h3>
          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="company-name" className="block text-sm font-medium text-gray-700">
                Company Name
              </label>
              <input
                type="text"
                name="company-name"
                id="company-name"
                className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                defaultValue="ShiftMaster Inc."
              />
            </div>
            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                Timezone
              </label>
              <select
                id="timezone"
                name="timezone"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                defaultValue="UTC"
              >
                <option>UTC</option>
                <option>America/New_York</option>
                <option>Europe/London</option>
                <option>Asia/Tokyo</option>
              </select>
            </div>
          </div>
        </div>
        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}