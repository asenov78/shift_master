import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { Calendar, Users, Settings, LogOut, Clock } from 'lucide-react';
import { userAtom } from '../store/auth';

export function Layout() {
  const [user, setUser] = useAtom(userAtom);
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Calendar className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">ShiftMaster</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Calendar
                </Link>
                {user?.role !== 'employee' && (
                  <>
                    <Link
                      to="/shifts"
                      className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      Shifts
                    </Link>
                    <Link
                      to="/employees"
                      className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    >
                      <Users className="h-4 w-4 mr-1" />
                      Employees
                    </Link>
                  </>
                )}
                {user?.role === 'admin' && (
                  <Link
                    to="/settings"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Settings
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <img
                    className="h-8 w-8 rounded-full"
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}`}
                    alt={user?.name}
                  />
                  <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full text-gray-400 hover:text-gray-500"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}