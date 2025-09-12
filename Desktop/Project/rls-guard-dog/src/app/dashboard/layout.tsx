import Navbar from '@/components/layout/Navbar';
import { requireAuth } from '@/lib/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is authenticated
  const authRedirect = await requireAuth();
  if (authRedirect) return authRedirect;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow p-4">
        <div className="container mx-auto">
          {children}
        </div>
      </main>
      <footer className="py-4 text-center text-gray-500 bg-gray-100">
        <p>© {new Date().getFullYear()} RLS Guard Dog - Secure Classroom Management</p>
      </footer>
    </div>
  );
}