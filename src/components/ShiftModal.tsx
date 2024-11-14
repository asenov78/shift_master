import React from 'react';
import { X } from 'lucide-react';
import { User, Shift } from '../types';

type ShiftModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Shift>) => void;
  employees: User[];
  initialData?: Shift;
  selectedDate?: string;
};

export function ShiftModal({
  isOpen,
  onClose,
  onSubmit,
  employees,
  initialData,
  selectedDate,
}: ShiftModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">
            {initialData ? 'Edit Shift' : 'Add New Shift'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const shiftData = {
              userId: formData.get('userId') as string,
              date: formData.get('date') as string,
              startTime: formData.get('startTime') as string,
              endTime: formData.get('endTime') as string,
              notes: formData.get('notes') as string,
            };
            onSubmit(shiftData);
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
              Employee
            </label>
            <select
              id="userId"
              name="userId"
              required
              defaultValue={initialData?.userId}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} - {employee.position.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              required
              defaultValue={initialData?.date || selectedDate}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                Start Time
              </label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                required
                defaultValue={initialData?.startTime}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                End Time
              </label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                required
                defaultValue={initialData?.endTime}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              defaultValue={initialData?.notes}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {initialData ? 'Update' : 'Add'} Shift
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}