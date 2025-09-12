import { createClient } from '@supabase/supabase-js';
import { describe, beforeAll, afterAll, test, expect } from '@jest/globals';

// This file contains tests to verify that RLS policies are working correctly
// To run these tests, you'll need to set up test users with different roles

// Test configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

// Skip tests if environment variables are not set
const SKIP_TESTS = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Test user credentials - replace with actual test users in your environment
const TEST_TEACHER = {
  email: 'test.teacher@example.com',
  password: 'securepassword123',
};

const TEST_STUDENT = {
  email: 'test.student@example.com',
  password: 'securepassword123',
};

// Test data
let teacherClient: any;
let studentClient: any;
let classroomId: string;

describe('Row Level Security Policies', () => {
  // Skip all tests if environment variables are not set
  beforeAll(() => {
    if (SKIP_TESTS) {
      console.warn('Skipping tests: Supabase environment variables not set');
    }
  });
  // Setup - create clients and authenticate users
  beforeAll(async () => {
    if (SKIP_TESTS) return;
    // Create Supabase clients
    teacherClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    studentClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Sign in as teacher
    const { error: teacherError } = await teacherClient.auth.signInWithPassword(TEST_TEACHER);
    if (teacherError) throw teacherError;
    
    // Sign in as student
    const { error: studentError } = await studentClient.auth.signInWithPassword(TEST_STUDENT);
    if (studentError) throw studentError;
  });
  
  // Clean up after tests
  afterAll(async () => {
    if (SKIP_TESTS || !teacherClient || !studentClient) return;
    await teacherClient.auth.signOut();
    await studentClient.auth.signOut();
  });
  
  // Test: Teacher can create a classroom
  test('Teacher can create a classroom', async () => {
    if (SKIP_TESTS) return;
    const classroomData = {
      name: 'Test Classroom',
      description: 'A classroom for testing RLS policies',
      total_assignments: 10,
    };
    
    const { data, error } = await teacherClient
      .from('classrooms')
      .insert(classroomData)
      .select()
      .single();
    
    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data.name).toBe(classroomData.name);
    
    // Save classroom ID for later tests
    classroomId = data.id;
  });
  
  // Test: Student cannot create a classroom
  test('Student cannot create a classroom', async () => {
    if (SKIP_TESTS) return;
    const classroomData = {
      name: 'Student Classroom',
      description: 'This should fail',
      total_assignments: 5,
    };
    
    const { data, error } = await studentClient
      .from('classrooms')
      .insert(classroomData)
      .select();
    
    expect(error).not.toBeNull();
    expect(data).toBeNull();
  });
  
  // Test: Student cannot see classroom until enrolled
  test('Student cannot see classroom until enrolled', async () => {
    if (SKIP_TESTS) return;
    // Attempt to read the classroom as student
    const { data, error } = await studentClient
      .from('classrooms')
      .select('*')
      .eq('id', classroomId)
      .single();
    
    expect(error).not.toBeNull();
    expect(data).toBeNull();
  });
  
  // Test: Teacher can enroll a student
  test('Teacher can enroll a student in their classroom', async () => {
    if (SKIP_TESTS) return;
    // Get student ID
    const { data: studentData } = await teacherClient
      .from('profiles')
      .select('id')
      .eq('email', TEST_STUDENT.email)
      .single();
    
    const studentId = studentData?.id;
    
    // Enroll student
    const { error } = await teacherClient
      .from('classroom_students')
      .insert({
        classroom_id: classroomId,
        student_id: studentId,
      });
    
    expect(error).toBeNull();
    
    // Create initial progress record
    const { error: progressError } = await teacherClient
      .from('progress')
      .insert({
        classroom_id: classroomId,
        student_id: studentId,
        score: 0,
        completed_assignments: 0,
        total_assignments: 10,
        last_activity: new Date().toISOString(),
      });
    
    expect(progressError).toBeNull();
  });
  
  // Test: Student can see classroom after enrollment
  test('Student can see classroom after enrollment', async () => {
    if (SKIP_TESTS) return;
    // Attempt to read the classroom as student after enrollment
    const { data, error } = await studentClient
      .from('classrooms')
      .select('*')
      .eq('id', classroomId)
      .single();
    
    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data.id).toBe(classroomId);
  });
  
  // Test: Student can see their own progress
  test('Student can see their own progress', async () => {
    if (SKIP_TESTS) return;
    // Get student ID
    const { data: studentData } = await studentClient
      .from('profiles')
      .select('id')
      .single();
    
    const studentId = studentData?.id;
    
    // Attempt to read progress
    const { data, error } = await studentClient
      .from('progress')
      .select('*')
      .eq('classroom_id', classroomId)
      .eq('student_id', studentId)
      .single();
    
    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data.classroom_id).toBe(classroomId);
    expect(data.student_id).toBe(studentId);
  });
  
  // Test: Student cannot see other students' progress
  test('Student cannot see other students progress', async () => {
    if (SKIP_TESTS) return;
    // Get student ID
    const { data: studentData } = await studentClient
      .from('profiles')
      .select('id')
      .single();
    
    const studentId = studentData?.id;
    
    // Attempt to read all progress records
    const { data, error } = await studentClient
      .from('progress')
      .select('*')
      .neq('student_id', studentId);
    
    // Should return empty array or error due to RLS
    if (error) {
      expect(error).not.toBeNull();
    } else {
      expect(data).toHaveLength(0);
    }
  });
  
  // Test: Teacher can update classroom
  test('Teacher can update their classroom', async () => {
    if (SKIP_TESTS) return;
    const updates = {
      name: 'Updated Test Classroom',
    };
    
    const { data, error } = await teacherClient
      .from('classrooms')
      .update(updates)
      .eq('id', classroomId)
      .select()
      .single();
    
    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data.name).toBe(updates.name);
  });
  
  // Test: Student cannot update classroom
  test('Student cannot update classroom', async () => {
    if (SKIP_TESTS) return;
    const updates = {
      name: 'Student Updated Classroom',
    };
    
    const { data, error } = await studentClient
      .from('classrooms')
      .update(updates)
      .eq('id', classroomId);
    
    expect(error).not.toBeNull();
  });
  
  // Test: Teacher can delete classroom
  test('Teacher can delete their classroom', async () => {
    if (SKIP_TESTS) return;
    // First, clean up related records
    await teacherClient
      .from('progress')
      .delete()
      .eq('classroom_id', classroomId);
    
    await teacherClient
      .from('classroom_students')
      .delete()
      .eq('classroom_id', classroomId);
    
    // Now delete the classroom
    const { error } = await teacherClient
      .from('classrooms')
      .delete()
      .eq('id', classroomId);
    
    expect(error).toBeNull();
  });
});