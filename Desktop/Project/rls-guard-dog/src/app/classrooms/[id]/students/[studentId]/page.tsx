'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function EditStudentProgress({ 
  params 
}: { 
  params: { id: string; studentId: string } 
}) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const classroomId = params.id;
  const studentId = params.studentId;
  
  const [classroom, setClassroom] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    score: 0,
    completed_assignments: 0,
    total_assignments: 0
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
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
        
        setUserProfile(profileData);
        
        // Check if user is a teacher
        if (profileData?.role !== 'teacher') {
          router.push('/dashboard');
          return;
        }
        
        // Get classroom data
        const { data: classroomData, error: classroomError } = await supabase
          .from('classrooms')
          .select('*')
          .eq('id', classroomId)
          .single();
        
        if (classroomError || !classroomData) {
          setError('Classroom not found');
          setLoading(false);
          return;
        }
        
        // Check if user is the teacher of this classroom
        if (classroomData.teacher_id !== profileData.id) {
          router.push('/dashboard');
          return;
        }
        
        setClassroom(classroomData);
        
        // Get student data
        const { data: studentData, error: studentError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', studentId)
          .single();
        
        if (studentError || !studentData) {
          setError('Student not found');
          setLoading(false);
          return;
        }
        
        setStudent(studentData);
        
        // Check if student is enrolled in this classroom
        const { data: enrollment, error: enrollmentError } = await supabase
          .from('classroom_students')
          .select('*')
          .eq('classroom_id', classroomId)
          .eq('student_id', studentId)
          .single();
        
        if (enrollmentError || !enrollment) {
          setError('Student is not enrolled in this classroom');
          setLoading(false);
          return;
        }
        
        // Get progress data
        const { data: progressData, error: progressError } = await supabase
          .from('progress')
          .select('*')
          .eq('classroom_id', classroomId)
          .eq('student_id', studentId)
          .single();
        
        if (!progressError && progressData) {
          setProgress(progressData);
          setFormData({
            score: progressData.score,
            completed_assignments: progressData.completed_assignments,
            total_assignments: progressData.total_assignments
          });
        } else {
          // Create initial progress record if it doesn't exist
          const { data: newProgress } = await supabase
            .from('progress')
            .insert({
              classroom_id: classroomId,
              student_id: studentId,
              score: 0,
              completed_assignments: 0,
              total_assignments: classroomData.total_assignments || 0,
              last_activity: new Date().toISOString()
            })
            .select()
            .single();
          
          if (newProgress) {
            setProgress(newProgress);
            setFormData({
              score: newProgress.score,
              completed_assignments: newProgress.completed_assignments,
              total_assignments: newProgress.total_assignments
            });
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [supabase, classroomId, studentId, router]);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseInt(value, 10) || 0
    });
  };
  
  // Save progress
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      // Validate form data
      if (formData.completed_assignments > formData.total_assignments) {
        throw new Error('Completed assignments cannot exceed total assignments');
      }
      
      // Update progress record
      const { error } = await supabase
        .from('progress')
        .update({
          score: formData.score,
          completed_assignments: formData.completed_assignments,
          total_assignments: formData.total_assignments,
          last_activity: new Date().toISOString()
        })
        .eq('classroom_id', classroomId)
        .eq('student_id', studentId);
      
      if (error) throw error;
      
      setSaveMessage('Progress updated successfully');
      
      // Update local state
      setProgress({
        ...progress,
        ...formData,
        last_activity: new Date().toISOString()
      });
    } catch (err: any) {
      console.error('Error saving progress:', err);
      setSaveMessage(`Error: ${err.message || 'Failed to update progress'}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-t-4 border-gray-200 rounded-full border-t-indigo-500 animate-spin"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 text-center">
        <h1 className="mb-4 text-2xl font-bold text-red-600">Error</h1>
        <p className="mb-4 text-gray-600">{error}</p>
        <Link href={`/classrooms/${classroomId}`} className="text-indigo-600 hover:text-indigo-800">
          Return to Classroom
        </Link>
      </div>
    );
  }
  
  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Edit Student Progress</h1>
        <Link href={`/classrooms/${classroomId}`} className="text-indigo-600 hover:text-indigo-800">
          Back to Classroom
        </Link>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="mb-4 text-xl font-semibold">Student Information</h2>
            
            <div className="grid gap-4 mb-6 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Name</h3>
                <p className="mt-1 text-lg">{student?.name}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1 text-lg">{student?.email}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Classroom</h3>
                <p className="mt-1 text-lg">{classroom?.name}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Last Activity</h3>
                <p className="mt-1 text-lg">
                  {progress?.last_activity 
                    ? new Date(progress.last_activity).toLocaleDateString() 
                    : 'No activity recorded'}
                </p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              <h3 className="mb-4 text-lg font-semibold">Update Progress</h3>
              
              <div className="grid gap-4 mb-6 md:grid-cols-3">
                <div>
                  <label htmlFor="score" className="block mb-2 text-sm font-medium text-gray-700">
                    Score
                  </label>
                  <input
                    type="number"
                    id="score"
                    name="score"
                    min="0"
                    max="100"
                    value={formData.score}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="completed_assignments" className="block mb-2 text-sm font-medium text-gray-700">
                    Completed Assignments
                  </label>
                  <input
                    type="number"
                    id="completed_assignments"
                    name="completed_assignments"
                    min="0"
                    value={formData.completed_assignments}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
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
                  />
                </div>
              </div>
              
              {saveMessage && (
                <div className={`p-3 mb-4 rounded-md ${saveMessage.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {saveMessage}
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="md:col-span-1">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="mb-4 text-xl font-semibold">Progress Summary</h2>
            
            {progress ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Assignments Completed</h3>
                  <p className="mt-1 text-2xl font-bold">
                    {formData.completed_assignments} <span className="text-sm text-gray-500">/ {formData.total_assignments}</span>
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Progress</h3>
                  <div className="mt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {formData.total_assignments > 0 
                          ? Math.round((formData.completed_assignments / formData.total_assignments) * 100) 
                          : 0}%
                      </span>
                    </div>
                    <div className="w-full h-2 mt-1 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-green-500 rounded-full" 
                        style={{ 
                          width: `${formData.total_assignments > 0 
                            ? Math.round((formData.completed_assignments / formData.total_assignments) * 100) 
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Score</h3>
                  <p className="mt-1 text-2xl font-bold">{formData.score}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">No progress data available yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}