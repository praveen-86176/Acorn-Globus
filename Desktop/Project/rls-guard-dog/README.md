# RLS Guard Dog

A secure educational platform that demonstrates Row Level Security (RLS) in Supabase, allowing teachers to manage classrooms and students to view their progress with proper access controls.

## Features

- **Secure Authentication**: User authentication with role-based access (teacher/student)
- **Row Level Security**: Enforced data access controls at the database level
- **Teacher Dashboard**: Create and manage classrooms, track student progress
- **Student Dashboard**: View enrolled classrooms and personal progress
- **MongoDB Integration**: Store additional user data and application state

## Tech Stack

- **Frontend**: Next.js 13+ (App Router), React, TailwindCSS
- **Authentication**: Supabase Auth
- **Database**: 
  - Supabase PostgreSQL (with RLS policies)
  - MongoDB (for additional data storage)
- **Styling**: TailwindCSS

## Prerequisites

- Node.js 16+ and npm/yarn
- Supabase account and project
- MongoDB Atlas account or local MongoDB instance

## Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# MongoDB
MONGODB_URI=your_mongodb_connection_string
```

## Getting Started

First, run the development server:

## Database Schema

### Supabase PostgreSQL

- **profiles**: User profiles with roles (teacher/student)
- **classrooms**: Classroom information created by teachers
- **classroom_students**: Junction table for student enrollments
- **progress**: Student progress in each classroom

### MongoDB

- **users**: Extended user information
- **classrooms**: Additional classroom data
- **progress**: Detailed progress tracking

## Row Level Security (RLS) Policies

This project demonstrates the following RLS patterns:

1. **Role-Based Access Control**: Different access levels for teachers and students
2. **Record Ownership**: Teachers can only manage their own classrooms
3. **Relationship-Based Access**: Students can only view classrooms they're enrolled in
4. **Row-Level Permissions**: Fine-grained control over which records users can read/write

## Testing RLS Policies

To verify that the RLS policies are working correctly:

1. Create two accounts: one teacher and one student
2. As the teacher, create a classroom
3. As the student, verify you cannot see the classroom until enrolled
4. As the teacher, enroll the student in the classroom
5. As the student, verify you can now see the classroom and your progress

## Supabase Setup

Run the SQL migrations in the `supabase/migrations` directory in the SQL editor to create the necessary tables and RLS policies.

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.io/docs)
- [Row Level Security in Supabase](https://supabase.io/docs/guides/auth/row-level-security)
- [MongoDB Documentation](https://docs.mongodb.com/)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new) from the creators of Next.js.
