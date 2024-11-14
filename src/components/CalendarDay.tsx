import React from 'react';
import { format, isToday, isSameMonth } from 'date-fns';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { User, Shift } from '../types';

type CalendarDayProps = {
  date: Date;
  shifts: Shift[];
  users: User[];
  currentMonth: Date;
  onEditShift: (shift: Shift) => void;
  onDeleteShift: (shiftId: string) => void;
  onAddShift: () => void;
};

export function CalendarDay({
  date,
  shifts,
  users,
  currentMonth,
  onEditShift,
  onDeleteShift,
  onAddShift,
}: CalendarDayProps) {
  const isCurrentDay = isToday(date);
  const isCurrentMonth = isSameMonth(date, currentMonth);

  return (
    <div
      className={`min-h-[120px] p-2 ${
        isCurrentDay
          ? 'bg-blue-50'
          : isCurrentMonth
          ? 'bg-white'
          : 'bg-gray-50'
      }`}
    >
      <div className="flex justify-between items-center mb-1">
        <span className={`font-semibold ${isCurrentDay ? 'text-blue-600' : ''}`}>
          {format(date, 'd')}
        </span>
        <button
          onClick={onAddShift}
          className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-1">
        {shifts.map((shift) => {
          const user = users.find((u) => u.id === shift.userId);
          if (!user) return null;

          return (
            <div
              key={shift.id}
              className="text-xs p-1 rounded group relative"
              style={{ backgroundColor: user.position.color + '20' }}
            >
              <div className="font-medium">{user.name}</div>
              <div>{shift.startTime} - {shift.endTime}</div>
              <div className="absolute top-1 right-1 hidden group-hover:flex space-x-1">
                <button
                  onClick={() => onEditShift(shift)}
                  className="p-1 text-blue-600 hover:text-blue-800 rounded"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
                <button
                  onClick={() => onDeleteShift(shift.id)}
                  className="p-1 text-red-600 hover:text-red-800 rounded"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}