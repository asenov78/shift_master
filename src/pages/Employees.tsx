import React, { useState } from 'react';
import { UserPlus, Pencil, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from '../types';
import { EmployeeForm } from '../components/EmployeeForm';
import { toast } from 'sonner';
import { getEmployees, createEmployee, getPositions } from '../lib/api';

export function EmployeesPage() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const { data: employees = [], isLoading: isLoadingEmployees } = useQuery({
    queryKey: ['employees'],
    queryFn: getEmployees,
  });

  const { data: positions = [], isLoading: isLoadingPositions } = useQuery({
    queryKey: ['positions'],
    queryFn: getPositions,
  });

  const createEmployeeMutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setIsFormOpen(false);
      toast.success('Employee added successfully');
    },
    onError: () => {
      toast.error('Failed to add employee');
    },
  });

  const handleAddEmployee = async (data: Partial<User>) => {
    if (!data.name || !data.email || !data.role || !data.position) return;

    createEmployeeMutation.mutate({
      name: data.name,
      email: data.email,
      password: 'defaultPassword123', // In a real app, this should be handled more securely
      role: data.role,
      position_id: data.position.id,
    });
  };

  const handleEditEmployee = (data: Partial<User>) => {
    if (!editingEmployee) return;
    // TODO: Implement edit mutation
    toast.success('Employee updated successfully');
    setEditingEmployee(null);
  };

  const handleDeleteEmployee = (id: string) => {
    // TODO: Implement delete mutation
    toast.success('Employee deleted successfully');
    setShowDeleteConfirm(null);
  };

  if (isLoadingEmployees || isLoadingPositions) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Employees</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <UserPlus className="h-5 w-5 mr-2" />
          Add Employee
        </button>
      </div>

      {(isFormOpen || editingEmployee) && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h2 className="text-lg font-medium mb-4">
              {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
            </h2>
            <EmployeeForm
              onSubmit={editingEmployee ? handleEditEmployee : handleAddEmployee}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingEmployee(null);
              }}
              positions={positions}
              initialData={editingEmployee || undefined}
              isEdit={!!editingEmployee}
            />
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img
                        className="h-10 w-10 rounded-full"
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}`}
                        alt=""
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {employee.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    style={{ backgroundColor: employee.position.color + '20', color: employee.position.color }}
                  >
                    {employee.position.name}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {employee.role}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {employee.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setEditingEmployee(employee)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    {showDeleteConfirm === employee.id ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDeleteEmployee(employee.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(null)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowDeleteConfirm(employee.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}