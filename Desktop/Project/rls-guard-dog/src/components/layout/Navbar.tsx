'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase';

type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
};

export default function Navbar() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createSupabaseClient();

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          setProfile(data as UserProfile);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadProfile();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const isActive = (path: string) => {
    return pathname === path ? 'bg-indigo-700' : '';
  };

  return (
    <nav className="bg-indigo-600">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/dashboard" className="text-xl font-bold text-white">
                RLS Guard Dog
              </Link>
            </div>
            
            {!loading && profile && (
              <div className="hidden md:block">
                <div className="flex items-baseline ml-10 space-x-4">
                  <Link 
                    href="/dashboard" 
                    className={`px-3 py-2 text-sm font-medium text-white rounded-md ${isActive('/dashboard')} hover:bg-indigo-500`}
                  >
                    Dashboard
                  </Link>
                  
                  {profile.role === 'teacher' && (
                    <>
                      <Link 
                        href="/classrooms" 
                        className={`px-3 py-2 text-sm font-medium text-white rounded-md ${isActive('/classrooms')} hover:bg-indigo-500`}
                      >
                        Classrooms
                      </Link>
                      <Link 
                        href="/students" 
                        className={`px-3 py-2 text-sm font-medium text-white rounded-md ${isActive('/students')} hover:bg-indigo-500`}
                      >
                        Students
                      </Link>
                    </>
                  )}
                  
                  {profile.role === 'student' && (
                    <Link 
                      href="/my-progress" 
                      className={`px-3 py-2 text-sm font-medium text-white rounded-md ${isActive('/my-progress')} hover:bg-indigo-500`}
                    >
                      My Progress
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {!loading && profile && (
            <div className="hidden md:block">
              <div className="flex items-center ml-4 md:ml-6">
                <div className="relative ml-3">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-white">
                      {profile.name} ({profile.role})
                    </span>
                    <button
                      onClick={handleSignOut}
                      className="px-3 py-2 ml-4 text-sm font-medium text-white bg-indigo-700 rounded-md hover:bg-indigo-800"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Mobile menu button */}
          <div className="flex -mr-2 md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 text-indigo-200 bg-indigo-600 rounded-md hover:text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="block w-6 h-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className="md:hidden" id="mobile-menu">
        {!loading && profile && (
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/dashboard"
              className={`block px-3 py-2 text-base font-medium text-white rounded-md ${isActive('/dashboard')} hover:bg-indigo-500`}
            >
              Dashboard
            </Link>
            
            {profile.role === 'teacher' && (
              <>
                <Link
                  href="/classrooms"
                  className={`block px-3 py-2 text-base font-medium text-white rounded-md ${isActive('/classrooms')} hover:bg-indigo-500`}
                >
                  Classrooms
                </Link>
                <Link
                  href="/students"
                  className={`block px-3 py-2 text-base font-medium text-white rounded-md ${isActive('/students')} hover:bg-indigo-500`}
                >
                  Students
                </Link>
              </>
            )}
            
            {profile.role === 'student' && (
              <Link
                href="/my-progress"
                className={`block px-3 py-2 text-base font-medium text-white rounded-md ${isActive('/my-progress')} hover:bg-indigo-500`}
              >
                My Progress
              </Link>
            )}
            
            <button
              onClick={handleSignOut}
              className="block w-full px-3 py-2 mt-4 text-base font-medium text-center text-white bg-indigo-700 rounded-md hover:bg-indigo-800"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}