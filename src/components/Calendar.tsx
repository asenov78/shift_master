import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth } from 'date-fns';
import { CalendarDay } from './CalendarDay';
import { ShiftModal } from './ShiftModal';
import { User, Shift } from '../types';

type CalendarProps = {
  shifts: Shift[];
  users: User[];
  currentDate: Date;
  onEditShift: (shift: Shift) => void;
  onDeleteShift: (shiftId: string) => void;
  onAddShift: (date: string) => void;
};

export function Calendar({ shifts, users, currentDate, onEditShift, onDeleteShift, onAddShift }: CalendarProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="bg-gray-50 p-2 text-center text-sm font-semibold">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayShifts = shifts.filter(shift => shift.date === dateStr);

          return (
            <CalendarDay
              key={dateStr}
              date={day}
              shifts={dayShifts}
              users={users}
              currentMonth={currentDate}
              onEditShift={onEditShift}
              onDeleteShift={onDeleteShift}
              onAddShift={() => onAddShift(dateStr)}
            />
          );
        })}
      </div>
    </div>
  );
}