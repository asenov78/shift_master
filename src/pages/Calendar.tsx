import React, { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Calendar } from '../components/Calendar';
import { ShiftModal } from '../components/ShiftModal';
import { Shift } from '../types';
import { getShifts, getEmployees } from '../lib/api';

export function CalendarPage() {
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const startDate = format(startOfMonth(currentDate), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd');

  const { data: shifts = [], isLoading: isLoadingShifts } = useQuery({
    queryKey: ['shifts', startDate, endDate],
    queryFn: () => getShifts(startDate, endDate),
  });

  const { data: employees = [], isLoading: isLoadingEmployees } = useQuery({
    queryKey: ['employees'],
    queryFn: getEmployees,
  });

  const createShiftMutation = useMutation({
    mutationFn: async (newShift: Partial<Shift>) => {
      const response = await fetch('/api/shifts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(newShift),
      });
      if (!response.ok) throw new Error('Failed to create shift');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      setIsModalOpen(false);
      setEditingShift(null);
      toast.success('Shift created successfully');
    },
    onError: () => {
      toast.error('Failed to create shift');
    },
  });

  const updateShiftMutation = useMutation({
    mutationFn: async (shift: Partial<Shift> & { id: string }) => {
      const response = await fetch(`/api/shifts/${shift.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(shift),
      });
      if (!response.ok) throw new Error('Failed to update shift');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      setIsModalOpen(false);
      setEditingShift(null);
      toast.success('Shift updated successfully');
    },
    onError: () => {
      toast.error('Failed to update shift');
    },
  });

  const deleteShiftMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/shifts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete shift');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      toast.success('Shift deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete shift');
    },
  });

  const handleSubmit = (data: Partial<Shift>) => {
    if (editingShift) {
      updateShiftMutation.mutate({ ...data, id: editingShift.id });
    } else {
      createShiftMutation.mutate(data);
    }
  };

  if (isLoadingShifts || isLoadingEmployees) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Schedule</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-lg font-medium">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <Calendar
        shifts={shifts}
        users={employees}
        currentDate={currentDate}
        onEditShift={(shift) => {
          setEditingShift(shift);
          setIsModalOpen(true);
        }}
        onDeleteShift={(id) => deleteShiftMutation.mutate(id)}
        onAddShift={(date) => {
          setSelectedDate(date);
          setEditingShift(null);
          setIsModalOpen(true);
        }}
      />

      <ShiftModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingShift(null);
          setSelectedDate(null);
        }}
        onSubmit={handleSubmit}
        employees={employees}
        initialData={editingShift}
        selectedDate={selectedDate || undefined}
      />
    </div>
  );
}