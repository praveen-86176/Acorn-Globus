import { getUserProfile } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase';
import Link from 'next/link';

export default async function Dashboard() {
  const profile = await getUserProfile();
  const supabase = await createSupabaseServerClient();
  
  // Fetch data based on user role
  let classroomsData = [];
  let progressData = [];
  
  if (profile) {
    if (profile.role === 'teacher') {
      // Teachers can see all classrooms they created
      const { data: classrooms } = await supabase
        .from('classrooms')
        .select('*')
        .eq('teacher_id', profile.id);
      
      classroomsData = classrooms || [];
    } else if (profile.role === 'student') {
      // Students can only see classrooms they're enrolled in
      const { data: enrollments } = await supabase
        .from('classroom_students')
        .select('classroom_id')
        .eq('student_id', profile.id);
      
      if (enrollments && enrollments.length > 0) {
        const classroomIds = enrollments.map(e => e.classroom_id);
        
        const { data: classrooms } = await supabase
          .from('classrooms')
          .select('*')
          .in('id', classroomIds);
        
        classroomsData = classrooms || [];
        
        // Get student progress
        const { data: progress } = await supabase
          .from('progress')
          .select('*')
          .eq('student_id', profile.id);
        
        progressData = progress || [];
      }
    }
  }

  return (
    <div className="py-6">
      <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>
      
      {profile && (
        <div className="p-6 mb-6 bg-white rounded-lg shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Welcome, {profile.name}!</h2>
          <p className="text-gray-600">
            You are logged in as a <span className="font-medium">{profile.role}</span>.
          </p>
        </div>
      )}
      
      {profile?.role === 'teacher' && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="mb-4 text-xl font-semibold">Your Classrooms</h2>
            
            {classroomsData.length > 0 ? (
              <ul className="space-y-2">
                {classroomsData.map((classroom: any) => (
                  <li key={classroom.id} className="p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                    <Link href={`/classrooms/${classroom.id}`} className="block">
                      <h3 className="font-medium">{classroom.name}</h3>
                      <p className="text-sm text-gray-600">{classroom.description}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">You haven't created any classrooms yet.</p>
            )}
            
            <div className="mt-4">
              <Link 
                href="/classrooms/create" 
                className="inline-block px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Create New Classroom
              </Link>
            </div>
          </div>
          
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
            <div className="space-y-3">
              <Link 
                href="/classrooms" 
                className="block p-3 text-center text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Manage Classrooms
              </Link>
              <Link 
                href="/students" 
                className="block p-3 text-center text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Manage Students
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {profile?.role === 'student' && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="mb-4 text-xl font-semibold">Your Classrooms</h2>
            
            {classroomsData.length > 0 ? (
              <ul className="space-y-2">
                {classroomsData.map((classroom: any) => (
                  <li key={classroom.id} className="p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                    <Link href={`/classrooms/${classroom.id}`} className="block">
                      <h3 className="font-medium">{classroom.name}</h3>
                      <p className="text-sm text-gray-600">{classroom.description}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">You are not enrolled in any classrooms yet.</p>
            )}
          </div>
          
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="mb-4 text-xl font-semibold">Your Progress</h2>
            
            {progressData.length > 0 ? (
              <ul className="space-y-2">
                {progressData.map((progress: any) => {
                  const classroom = classroomsData.find((c: any) => c.id === progress.classroom_id);
                  const progressPercentage = progress.total_assignments > 0 
                    ? Math.round((progress.completed_assignments / progress.total_assignments) * 100) 
                    : 0;
                  
                  return (
                    <li key={progress.id} className="p-3 border border-gray-200 rounded-md">
                      <h3 className="font-medium">{classroom?.name || 'Unknown Classroom'}</h3>
                      <div className="mt-2">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600">Progress: {progressPercentage}%</span>
                          <span className="ml-2 text-sm text-gray-600">
                            ({progress.completed_assignments}/{progress.total_assignments} assignments)
                          </span>
                        </div>
                        <div className="w-full h-2 mt-1 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-green-500 rounded-full" 
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">
                        Score: {progress.score}
                      </p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-gray-600">No progress data available yet.</p>
            )}
            
            <div className="mt-4">
              <Link 
                href="/my-progress" 
                className="inline-block px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                View Detailed Progress
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}