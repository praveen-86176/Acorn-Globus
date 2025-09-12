import { getUserProfile, requireStudent } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase';
import Link from 'next/link';

export default async function MyProgress() {
  // Ensure only students can access this page
  const authRedirect = await requireStudent();
  if (authRedirect) return authRedirect;

  const profile = await getUserProfile();
  const supabase = await createSupabaseServerClient();
  
  // Fetch student's progress data
  const { data: progressData } = await supabase
    .from('progress')
    .select('*')
    .eq('student_id', profile?.id);
  
  // Fetch classroom data for the student
  const { data: enrollments } = await supabase
    .from('classroom_students')
    .select('classroom_id')
    .eq('student_id', profile?.id);
  
  let classroomsData = [];
  
  if (enrollments && enrollments.length > 0) {
    const classroomIds = enrollments.map(e => e.classroom_id);
    
    const { data: classrooms } = await supabase
      .from('classrooms')
      .select('*')
      .in('id', classroomIds);
    
    classroomsData = classrooms || [];
  }

  return (
    <div className="py-6">
      <h1 className="mb-6 text-3xl font-bold">My Progress</h1>
      
      <div className="grid gap-6 md:grid-cols-1">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Progress Overview</h2>
          
          {progressData && progressData.length > 0 ? (
            <div className="space-y-6">
              {progressData.map((progress: any) => {
                const classroom = classroomsData.find((c: any) => c.id === progress.classroom_id);
                const progressPercentage = progress.total_assignments > 0 
                  ? Math.round((progress.completed_assignments / progress.total_assignments) * 100) 
                  : 0;
                
                return (
                  <div key={progress.id} className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="text-lg font-medium">{classroom?.name || 'Unknown Classroom'}</h3>
                    <p className="mt-1 text-sm text-gray-600">{classroom?.description}</p>
                    
                    <div className="mt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-gray-600">{progressPercentage}%</span>
                      </div>
                      <div className="w-full h-2 mt-1 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-green-500 rounded-full" 
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <h4 className="text-sm font-medium">Assignments</h4>
                        <p className="text-2xl font-bold">
                          {progress.completed_assignments} <span className="text-sm text-gray-500">/ {progress.total_assignments}</span>
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Score</h4>
                        <p className="text-2xl font-bold">{progress.score}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="text-sm font-medium">Last Activity</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(progress.last_activity).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="mt-4">
                      <Link 
                        href={`/classrooms/${classroom?.id}`}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        View Classroom Details →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-600 border border-gray-200 rounded-lg">
              <p>You don't have any progress data yet.</p>
              <p className="mt-2">Enroll in classrooms to start tracking your progress.</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6 grid gap-6 md:grid-cols-1">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="mb-4 text-xl font-semibold">My Classrooms</h2>
          
          {classroomsData.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {classroomsData.map((classroom: any) => (
                <Link 
                  key={classroom.id} 
                  href={`/classrooms/${classroom.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md"
                >
                  <h3 className="text-lg font-medium">{classroom.name}</h3>
                  <p className="mt-1 text-sm text-gray-600">{classroom.description}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-600 border border-gray-200 rounded-lg">
              <p>You are not enrolled in any classrooms yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}