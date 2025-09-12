import { getUserProfile, requireAuth } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase';
import Link from 'next/link';

export default async function ClassroomDetail({ params }: { params: { id: string } }) {
  // Ensure user is authenticated
  const authRedirect = await requireAuth();
  if (authRedirect) return authRedirect;

  const profile = await getUserProfile();
  const supabase = await createSupabaseServerClient();
  const classroomId = params.id;
  
  // Fetch classroom data
  const { data: classroom, error: classroomError } = await supabase
    .from('classrooms')
    .select('*')
    .eq('id', classroomId)
    .single();
  
  if (classroomError || !classroom) {
    return (
      <div className="p-6 text-center">
        <h1 className="mb-4 text-2xl font-bold text-red-600">Classroom Not Found</h1>
        <p className="mb-4 text-gray-600">The classroom you're looking for doesn't exist or you don't have permission to view it.</p>
        <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800">
          Return to Dashboard
        </Link>
      </div>
    );
  }
  
  // Fetch teacher data
  const { data: teacher } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', classroom.teacher_id)
    .single();
  
  // Fetch student progress if viewing as a student
  let progress = null;
  if (profile?.role === 'student') {
    const { data: progressData } = await supabase
      .from('progress')
      .select('*')
      .eq('classroom_id', classroomId)
      .eq('student_id', profile.id)
      .single();
    
    progress = progressData;
  }
  
  // Fetch all students in the classroom if viewing as a teacher
  let students = [];
  if (profile?.role === 'teacher' && profile.id === classroom.teacher_id) {
    const { data: enrollments } = await supabase
      .from('classroom_students')
      .select('student_id')
      .eq('classroom_id', classroomId);
    
    if (enrollments && enrollments.length > 0) {
      const studentIds = enrollments.map(e => e.student_id);
      
      const { data: studentsData } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', studentIds);
      
      students = studentsData || [];
      
      // Fetch progress for all students
      const { data: progressData } = await supabase
        .from('progress')
        .select('*')
        .eq('classroom_id', classroomId);
      
      // Add progress data to each student
      if (progressData) {
        students = students.map((student: any) => {
          const studentProgress = progressData.find((p: any) => p.student_id === student.id);
          return {
            ...student,
            progress: studentProgress || null,
          };
        });
      }
    }
  }

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{classroom.name}</h1>
        <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800">
          Back to Dashboard
        </Link>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="mb-4 text-xl font-semibold">Classroom Details</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="mt-1">{classroom.description}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Teacher</h3>
                <p className="mt-1">{teacher?.name || 'Unknown'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Created</h3>
                <p className="mt-1">{new Date(classroom.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          
          {/* Teacher-only view: Student list */}
          {profile?.role === 'teacher' && profile.id === classroom.teacher_id && (
            <div className="p-6 mt-6 bg-white rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Students</h2>
                <Link 
                  href={`/classrooms/${classroomId}/manage-students`}
                  className="px-3 py-1 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  Manage Students
                </Link>
              </div>
              
              {students.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left">Name</th>
                        <th className="px-4 py-3 text-left">Email</th>
                        <th className="px-4 py-3 text-left">Progress</th>
                        <th className="px-4 py-3 text-left">Score</th>
                        <th className="px-4 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student: any) => {
                        const progressPercentage = student.progress?.total_assignments > 0 
                          ? Math.round((student.progress.completed_assignments / student.progress.total_assignments) * 100) 
                          : 0;
                        
                        return (
                          <tr key={student.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3">{student.name}</td>
                            <td className="px-4 py-3">{student.email}</td>
                            <td className="px-4 py-3">
                              {student.progress ? (
                                <div className="flex items-center">
                                  <div className="w-full h-2 mr-2 bg-gray-200 rounded-full" style={{ width: '100px' }}>
                                    <div 
                                      className="h-2 bg-green-500 rounded-full" 
                                      style={{ width: `${progressPercentage}%` }}
                                    ></div>
                                  </div>
                                  <span>{progressPercentage}%</span>
                                </div>
                              ) : (
                                'No data'
                              )}
                            </td>
                            <td className="px-4 py-3">{student.progress?.score || 'N/A'}</td>
                            <td className="px-4 py-3">
                              <Link 
                                href={`/classrooms/${classroomId}/students/${student.id}`}
                                className="text-indigo-600 hover:text-indigo-800"
                              >
                                Edit Progress
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-600">No students enrolled in this classroom yet.</p>
              )}
            </div>
          )}
        </div>
        
        {/* Student-only view: Progress card */}
        {profile?.role === 'student' && (
          <div className="md:col-span-1">
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h2 className="mb-4 text-xl font-semibold">Your Progress</h2>
              
              {progress ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Assignments Completed</h3>
                    <p className="mt-1 text-2xl font-bold">
                      {progress.completed_assignments} <span className="text-sm text-gray-500">/ {progress.total_assignments}</span>
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Progress</h3>
                    <div className="mt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {progress.total_assignments > 0 
                            ? Math.round((progress.completed_assignments / progress.total_assignments) * 100) 
                            : 0}%
                        </span>
                      </div>
                      <div className="w-full h-2 mt-1 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-green-500 rounded-full" 
                          style={{ 
                            width: `${progress.total_assignments > 0 
                              ? Math.round((progress.completed_assignments / progress.total_assignments) * 100) 
                              : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Score</h3>
                    <p className="mt-1 text-2xl font-bold">{progress.score}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Last Activity</h3>
                    <p className="mt-1">{new Date(progress.last_activity).toLocaleDateString()}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">No progress data available yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}