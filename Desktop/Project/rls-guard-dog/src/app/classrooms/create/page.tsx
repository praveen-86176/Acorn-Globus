'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function CreateClassroom() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    total_assignments: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'total_assignments' ? (parseInt(value, 10) || 0) : value
    });
  };
  
  // Create classroom
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      
      // Get user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      // Check if user is a teacher
      if (profileData?.role !== 'teacher') {
        setError('Only teachers can create classrooms');
        setLoading(false);
        return;
      }
      
      // Create classroom
      const { data: classroom, error: classroomError } = await supabase
        .from('classrooms')
        .insert({
          name: formData.name,
          description: formData.description,
          teacher_id: user.id,
          total_assignments: formData.total_assignments
        })
        .select()
        .single();
      
      if (classroomError) throw classroomError;
      
      // Redirect to classroom page
      router.push(`/classrooms/${classroom.id}`);
    } catch (err: any) {
      console.error('Error creating classroom:', err);
      setError(err.message || 'Failed to create classroom');
      setLoading(false);
    }
  };
  
  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Create New Classroom</h1>
        <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800">
          Back to Dashboard
        </Link>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700">
                Classroom Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter classroom name"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter classroom description"
              ></textarea>
            </div>
            
            <div className="mb-6">
              <label htmlFor="total_assignments" className="block mb-2 text-sm font-medium text-gray-700">
                Total Assignments
              </label>
              <input
                type="number"
                id="total_assignments"
                name="total_assignments"
                min="0"
                value={formData.total_assignments}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter total number of assignments"
              />
              <p className="mt-1 text-sm text-gray-500">
                This will be used to track student progress. You can update this later.
              </p>
            </div>
            
            {error && (
              <div className="p-3 mb-4 text-red-700 bg-red-100 rounded-md">
                {error}
              </div>
            )}
            
            <div className="flex justify-end">
              <Link
                href="/dashboard"
                className="px-4 py-2 mr-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Classroom'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}