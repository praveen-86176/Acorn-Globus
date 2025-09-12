import { getUserProfile, requireAuth, requireTeacher } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase';
import Link from 'next/link';

export default async function Classrooms() {
  // Ensure user is authenticated and is a teacher
  const authRedirect = await requireAuth();
  if (authRedirect) return authRedirect;
  
  const teacherRedirect = await requireTeacher();
  if (teacherRedirect) return teacherRedirect;
  
  const profile = await getUserProfile();
  const supabase = await createSupabaseServerClient();
  
  // Fetch classrooms created by this teacher
  const { data: classrooms, error } = await supabase
    .from('classrooms')
    .select('*')
    .eq('teacher_id', profile?.id)
    .order('created_at', { ascending: false });
  
  // Fetch student counts for each classroom
  let classroomsWithCounts = [];
  
  if (classrooms && classrooms.length > 0) {
    for (const classroom of classrooms) {
      const { count } = await supabase
        .from('classroom_students')
        .select('*', { count: 'exact', head: true })
        .eq('classroom_id', classroom.id);
      
      classroomsWithCounts.push({
        ...classroom,
        student_count: count || 0
      });
    }
  }
  
  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Classrooms</h1>
        <Link 
          href="/classrooms/create" 
          className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Create New Classroom
        </Link>
      </div>
      
      {error && (
        <div className="p-4 mb-6 text-red-700 bg-red-100 rounded-md">
          Error loading classrooms: {error.message}
        </div>
      )}
      
      {classroomsWithCounts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {classroomsWithCounts.map((classroom: any) => (
            <div key={classroom.id} className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h2 className="mb-2 text-xl font-semibold">{classroom.name}</h2>
              <p className="mb-4 text-gray-600 line-clamp-2">{classroom.description || 'No description'}</p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                  <span>{classroom.student_count} Students</span>
                </div>
                
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                  <span>{classroom.total_assignments} Assignments</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Created {new Date(classroom.created_at).toLocaleDateString()}
                </span>
                
                <Link 
                  href={`/classrooms/${classroom.id}`}
                  className="px-3 py-1 text-sm text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center bg-white rounded-lg shadow-md">
          <h2 className="mb-2 text-xl font-semibold">No Classrooms Yet</h2>
          <p className="mb-6 text-gray-600">You haven't created any classrooms yet. Get started by creating your first classroom.</p>
          <Link 
            href="/classrooms/create" 
            className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Create Your First Classroom
          </Link>
        </div>
      )}
    </div>
  );
}