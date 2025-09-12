-- Create RLS policies for RLS Guard Dog application

-- Profiles policies
-- Teachers can read all profiles
CREATE POLICY "Teachers can read all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_teacher());

-- Students can only read their own profile
CREATE POLICY "Students can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid() AND public.is_student());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- Classrooms policies
-- Teachers can read all classrooms
CREATE POLICY "Teachers can read all classrooms"
  ON public.classrooms
  FOR SELECT
  TO authenticated
  USING (public.is_teacher());

-- Students can read classrooms they are enrolled in
CREATE POLICY "Students can read enrolled classrooms"
  ON public.classrooms
  FOR SELECT
  TO authenticated
  USING (
    public.is_student() AND
    EXISTS (
      SELECT 1 FROM public.classroom_students
      WHERE classroom_id = classrooms.id AND student_id = auth.uid()
    )
  );

-- Only teachers can insert new classrooms
CREATE POLICY "Teachers can create classrooms"
  ON public.classrooms
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_teacher() AND teacher_id = auth.uid());

-- Teachers can only update their own classrooms
CREATE POLICY "Teachers can update own classrooms"
  ON public.classrooms
  FOR UPDATE
  TO authenticated
  USING (teacher_id = auth.uid() AND public.is_teacher());

-- Teachers can only delete their own classrooms
CREATE POLICY "Teachers can delete own classrooms"
  ON public.classrooms
  FOR DELETE
  TO authenticated
  USING (teacher_id = auth.uid() AND public.is_teacher());

-- Classroom_students policies
-- Teachers can read all classroom_students
CREATE POLICY "Teachers can read all classroom_students"
  ON public.classroom_students
  FOR SELECT
  TO authenticated
  USING (public.is_teacher());

-- Students can read their own classroom enrollments
CREATE POLICY "Students can read own enrollments"
  ON public.classroom_students
  FOR SELECT
  TO authenticated
  USING (student_id = auth.uid() AND public.is_student());

-- Teachers can enroll students in their classrooms
CREATE POLICY "Teachers can enroll students"
  ON public.classroom_students
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_teacher() AND
    public.is_classroom_teacher(classroom_id)
  );

-- Teachers can remove students from their classrooms
CREATE POLICY "Teachers can remove students"
  ON public.classroom_students
  FOR DELETE
  TO authenticated
  USING (
    public.is_teacher() AND
    public.is_classroom_teacher(classroom_id)
  );

-- Progress policies
-- Teachers can read all progress records
CREATE POLICY "Teachers can read all progress"
  ON public.progress
  FOR SELECT
  TO authenticated
  USING (public.is_teacher());

-- Students can only read their own progress
CREATE POLICY "Students can read own progress"
  ON public.progress
  FOR SELECT
  TO authenticated
  USING (student_id = auth.uid() AND public.is_student());

-- Teachers can insert progress for students in their classrooms
CREATE POLICY "Teachers can create progress"
  ON public.progress
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_teacher() AND
    public.is_classroom_teacher(classroom_id)
  );

-- Teachers can update progress for students in their classrooms
CREATE POLICY "Teachers can update progress"
  ON public.progress
  FOR UPDATE
  TO authenticated
  USING (
    public.is_teacher() AND
    public.is_classroom_teacher(classroom_id)
  );

-- Teachers can delete progress for students in their classrooms
CREATE POLICY "Teachers can delete progress"
  ON public.progress
  FOR DELETE
  TO authenticated
  USING (
    public.is_teacher() AND
    public.is_classroom_teacher(classroom_id)
  );