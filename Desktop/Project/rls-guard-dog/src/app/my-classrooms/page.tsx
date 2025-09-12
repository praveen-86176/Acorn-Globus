import { getUserProfile, requireAuth, requireStudent } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase';
import Link from 'next/link';

export default async function MyClassrooms() {
  // Ensure user is authenticated and is a student
  const authRedirect = await requireAuth();
  if (authRedirect) return authRedirect;
  
  const studentRedirect = await requireStudent();
  if (studentRedirect) return studentRedirect;
  
  const profile = await getUserProfile();
  const supabase = await createSupabaseServerClient();
  
  // Fetch classrooms where the student is enrolled
  const { data: enrollments } = await supabase
    .from('classroom_students')
    .select('classroom_id')
    .eq('student_id', profile?.id);
  
  let classrooms: any[] = [];
  
  if (enrollments && enrollments.length > 0) {
    const classroomIds = enrollments.map(e => e.classroom_id);
    
    // Fetch classroom details
    const { data: classroomsData } = await supabase
      .from('classrooms')
      .select('*, profiles:teacher_id(name)')
      .in('id', classroomIds);
    
    if (classroomsData) {
      classrooms = classroomsData;
      
      // Fetch progress for each classroom
      const { data: progressData } = await supabase
        .from('progress')
        .select('*')
        .eq('student_id', profile?.id)
        .in('classroom_id', classroomIds);
      
      // Add progress data to each classroom
      if (progressData) {
        classrooms = classrooms.map(classroom => {
          const progress = progressData.find(p => p.classroom_id === classroom.id);
          return {
            ...classroom,
            progress: progress || null
          };
        });
      }
    }
  }
  
  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Classrooms</h1>
        <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800">
          Back to Dashboard
        </Link>
      </div>
      
      {classrooms.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {classrooms.map((classroom: any) => {
            const progressPercentage = classroom.progress?.total_assignments > 0 
              ? Math.round((classroom.progress.completed_assignments / classroom.progress.total_assignments) * 100) 
              : 0;
            
            return (
              <div key={classroom.id} className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h2 className="mb-2 text-xl font-semibold">{classroom.name}</h2>
                <p className="mb-4 text-gray-600 line-clamp-2">{classroom.description || 'No description'}</p>
                
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Teacher</h3>
                  <p className="mt-1">{classroom.profiles?.name || 'Unknown'}</p>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Your Progress</h3>
                  <div className="mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{progressPercentage}%</span>
                    </div>
                    <div className="w-full h-2 mt-1 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-green-500 rounded-full" 
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Joined {new Date(classroom.created_at).toLocaleDateString()}
                  </span>
                  
                  <Link 
                    href={`/classrooms/${classroom.id}`}
                    className="px-3 py-1 text-sm text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center bg-white rounded-lg shadow-md">
          <h2 className="mb-2 text-xl font-semibold">No Classrooms Yet</h2>
          <p className="mb-6 text-gray-600">You are not enrolled in any classrooms yet. Please contact your teacher to get enrolled.</p>
        </div>
      )}
    </div>
  );
}