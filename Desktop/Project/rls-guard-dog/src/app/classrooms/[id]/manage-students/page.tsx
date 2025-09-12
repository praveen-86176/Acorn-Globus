'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function ManageStudents({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const classroomId = params.id;
  
  const [classroom, setClassroom] = useState<any>(null);
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // Fetch classroom and student data
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
        
        // Get enrolled students
        const { data: enrollments } = await supabase
          .from('classroom_students')
          .select('student_id')
          .eq('classroom_id', classroomId);
        
        let enrolledStudentIds: string[] = [];
        let enrolledStudentsData: any[] = [];
        
        if (enrollments && enrollments.length > 0) {
          enrolledStudentIds = enrollments.map(e => e.student_id);
          
          const { data: studentsData } = await supabase
            .from('profiles')
            .select('id, name, email')
            .in('id', enrolledStudentIds);
          
          enrolledStudentsData = studentsData || [];
        }
        
        setEnrolledStudents(enrolledStudentsData);
        
        // Get available students (students not enrolled in this classroom)
        const { data: allStudents } = await supabase
          .from('profiles')
          .select('id, name, email')
          .eq('role', 'student');
        
        if (allStudents) {
          const availableStudentsData = allStudents.filter(
            student => !enrolledStudentIds.includes(student.id)
          );
          setAvailableStudents(availableStudentsData);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [supabase, classroomId, router]);
  
  // Enroll a student
  const enrollStudent = async (studentId: string) => {
    try {
      // Add to classroom_students table
      const { error } = await supabase
        .from('classroom_students')
        .insert({
          classroom_id: classroomId,
          student_id: studentId
        });
      
      if (error) throw error;
      
      // Create initial progress record
      await supabase
        .from('progress')
        .insert({
          classroom_id: classroomId,
          student_id: studentId,
          score: 0,
          completed_assignments: 0,
          total_assignments: classroom?.total_assignments || 0,
          last_activity: new Date().toISOString()
        });
      
      // Update UI
      const student = availableStudents.find(s => s.id === studentId);
      if (student) {
        setEnrolledStudents([...enrolledStudents, student]);
        setAvailableStudents(availableStudents.filter(s => s.id !== studentId));
      }
    } catch (err) {
      console.error('Error enrolling student:', err);
      setError('Failed to enroll student');
    }
  };
  
  // Remove a student
  const removeStudent = async (studentId: string) => {
    try {
      // Remove from classroom_students table
      const { error } = await supabase
        .from('classroom_students')
        .delete()
        .eq('classroom_id', classroomId)
        .eq('student_id', studentId);
      
      if (error) throw error;
      
      // Remove progress record
      await supabase
        .from('progress')
        .delete()
        .eq('classroom_id', classroomId)
        .eq('student_id', studentId);
      
      // Update UI
      const student = enrolledStudents.find(s => s.id === studentId);
      if (student) {
        setAvailableStudents([...availableStudents, student]);
        setEnrolledStudents(enrolledStudents.filter(s => s.id !== studentId));
      }
    } catch (err) {
      console.error('Error removing student:', err);
      setError('Failed to remove student');
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
        <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800">
          Return to Dashboard
        </Link>
      </div>
    );
  }
  
  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Manage Students: {classroom?.name}</h1>
        <Link href={`/classrooms/${classroomId}`} className="text-indigo-600 hover:text-indigo-800">
          Back to Classroom
        </Link>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Enrolled Students */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Enrolled Students</h2>
          
          {enrolledStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {enrolledStudents.map((student) => (
                    <tr key={student.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{student.name}</td>
                      <td className="px-4 py-3">{student.email}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => removeStudent(student.id)}
                          className="px-3 py-1 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600">No students enrolled in this classroom yet.</p>
          )}
        </div>
        
        {/* Available Students */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Available Students</h2>
          
          {availableStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {availableStudents.map((student) => (
                    <tr key={student.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{student.name}</td>
                      <td className="px-4 py-3">{student.email}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => enrollStudent(student.id)}
                          className="px-3 py-1 text-sm text-white bg-green-600 rounded-md hover:bg-green-700"
                        >
                          Enroll
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600">No available students to enroll.</p>
          )}
        </div>
      </div>
    </div>
  );
}