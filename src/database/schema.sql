-- ============================================================
-- 3Gs PROJECT DATABASE SCHEMA
-- PostgreSQL / Aiven
--
-- Reconstructed from the supplied Aiven schema diagram and the
-- SQL definitions shared in the conversation.
--
-- IMPORTANT:
-- The diagram exposes columns, data types, and relationship lines,
-- but not every original NOT NULL/default/check/index definition.
-- Constraints below combine visible relationships with constraints
-- explicitly present in the supplied SQL draft. Review before using
-- this as a production migration.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1. DEPARTMENTS
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.departments (
    dept_code VARCHAR(20) PRIMARY KEY,
    dept_name VARCHAR(150) NOT NULL UNIQUE
);


-- ------------------------------------------------------------
-- 2. USERS
-- Common identity and login information
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.users (
    unique_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    role VARCHAR(20) NOT NULL
        CHECK (role IN ('dean', 'teacher', 'student')),
    mail_id VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(20),
    name VARCHAR(150) NOT NULL,
    prefix VARCHAR(30),
    password TEXT NOT NULL DEFAULT '12345678'
);


-- ------------------------------------------------------------
-- 3. TEACHERS
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.teachers (
    emp_id VARCHAR(30) PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE
        REFERENCES public.users(unique_id) ON DELETE CASCADE,
    dept_code VARCHAR(20) NOT NULL
        REFERENCES public.departments(dept_code) ON DELETE RESTRICT,
    designation VARCHAR(100) NOT NULL
);


-- ------------------------------------------------------------
-- 4. STUDENTS
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.students (
    university_roll_no VARCHAR(50) PRIMARY KEY,
    semester SMALLINT NOT NULL CHECK (semester > 0),
    section VARCHAR(10) NOT NULL,
    user_id BIGINT NOT NULL UNIQUE
        REFERENCES public.users(unique_id) ON DELETE CASCADE,
    program_name VARCHAR(150) NOT NULL,
    dept_code VARCHAR(20) NOT NULL
        REFERENCES public.departments(dept_code) ON DELETE RESTRICT,
    academic_year VARCHAR(20) NOT NULL
);


-- ------------------------------------------------------------
-- 5. COURSES
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.courses (
    course_code VARCHAR(50) PRIMARY KEY,
    course_name VARCHAR(150) NOT NULL,
    course_type VARCHAR(20) NOT NULL DEFAULT 'regular'
);


-- ------------------------------------------------------------
-- 6. COURSES OFFERED BY DEPARTMENTS
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.courses_offer (
    dept_code VARCHAR(20) NOT NULL
        REFERENCES public.departments(dept_code)
        ON DELETE CASCADE ON UPDATE CASCADE,
    course_code VARCHAR(50) NOT NULL
        REFERENCES public.courses(course_code)
        ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (dept_code, course_code)
);


-- ------------------------------------------------------------
-- 7. ASSIGNED COURSES
-- Which teacher teaches a course for a section and semester
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.assigned_courses (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    course_id VARCHAR(50) NOT NULL
        REFERENCES public.courses(course_code) ON DELETE CASCADE,
    emp_id VARCHAR(30) NOT NULL
        REFERENCES public.teachers(emp_id) ON DELETE RESTRICT,
    section VARCHAR(10) NOT NULL,
    semester SMALLINT NOT NULL CHECK (semester > 0),
    academic_year VARCHAR(20) NOT NULL,
    UNIQUE (course_id, emp_id, section, semester, academic_year)
);


-- ------------------------------------------------------------
-- 8. COURSE ENROLLMENT
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.course_enrollment (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    course_id VARCHAR(50) NOT NULL
        REFERENCES public.courses(course_code) ON DELETE CASCADE,
    student_id VARCHAR(50) NOT NULL
        REFERENCES public.students(university_roll_no) ON DELETE CASCADE,
    semester SMALLINT NOT NULL CHECK (semester > 0),
    academic_year VARCHAR(20) NOT NULL,

    UNIQUE (course_id, student_id, semester, academic_year),

    -- Supports the composite foreign keys used by assessments.
    UNIQUE (course_id, student_id, semester, academic_year, id)
);


-- ------------------------------------------------------------
-- 9. ASSESSMENT IMPORTS
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.assessment_imports (
    import_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    file_name VARCHAR(255),
    uploaded_by_emp_id VARCHAR(30)
        REFERENCES public.teachers(emp_id) ON DELETE SET NULL,
    course_code VARCHAR(50)
        REFERENCES public.courses(course_code) ON DELETE SET NULL,
    semester SMALLINT,
    academic_year VARCHAR(20),
    target_sections VARCHAR(255),
    assessment_type VARCHAR(50),
    total_rows INTEGER,
    error_count INTEGER,
    status VARCHAR(50),
    superseded_by_import_id BIGINT
        REFERENCES public.assessment_imports(import_id) ON DELETE SET NULL,
    validation_notes TEXT,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    file_url TEXT
);


-- ------------------------------------------------------------
-- 10. ASSESSMENTS
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.assessments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    type VARCHAR(20) NOT NULL
        CHECK (type IN ('pre-mse', 'mse-1', 'mse-2', 'ese')),
    max_mark NUMERIC(6,2) NOT NULL CHECK (max_mark >= 0),
    obtained_mark NUMERIC(6,2)
        CHECK (
            obtained_mark IS NULL
            OR (obtained_mark >= 0 AND obtained_mark <= max_mark)
        ),
    attendance_pct NUMERIC(5,2)
        CHECK (
            attendance_pct IS NULL
            OR attendance_pct BETWEEN 0 AND 100
        ),
    faculty_observation TEXT,
    course_id VARCHAR(50) NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    semester SMALLINT NOT NULL CHECK (semester > 0),
    academic_year VARCHAR(20) NOT NULL,
    import_id BIGINT
        REFERENCES public.assessment_imports(import_id) ON DELETE SET NULL,

    FOREIGN KEY (course_id, student_id, semester, academic_year)
        REFERENCES public.course_enrollment
            (course_id, student_id, semester, academic_year)
        ON DELETE CASCADE
);

ALTER TABLE public.assessments
    ADD COLUMN IF NOT EXISTS faculty_observation TEXT;


-- ------------------------------------------------------------
-- 11. ASSESSMENTS2
-- Kept as a separate table because it appears separately in the
-- supplied schema diagram. Its columns mirror assessments.
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.assessments2 (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    type VARCHAR(20) NOT NULL
        CHECK (type IN ('pre-mse', 'mse-1', 'mse-2', 'ese')),
    max_mark NUMERIC(6,2) NOT NULL CHECK (max_mark >= 0),
    obtained_mark NUMERIC(6,2)
        CHECK (
            obtained_mark IS NULL
            OR (obtained_mark >= 0 AND obtained_mark <= max_mark)
        ),
    attendance_pct NUMERIC(5,2)
        CHECK (
            attendance_pct IS NULL
            OR attendance_pct BETWEEN 0 AND 100
        ),
    course_id VARCHAR(50) NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    semester SMALLINT NOT NULL CHECK (semester > 0),
    academic_year VARCHAR(20) NOT NULL,
    import_id BIGINT
        REFERENCES public.assessment_imports(import_id) ON DELETE SET NULL,

    FOREIGN KEY (course_id, student_id, semester, academic_year)
        REFERENCES public.course_enrollment
            (course_id, student_id, semester, academic_year)
        ON DELETE CASCADE
);


-- ------------------------------------------------------------
-- 12. STUDENT ACADEMIC RECORDS
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.student_academic_records (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL
        REFERENCES public.students(university_roll_no) ON DELETE CASCADE,
    semester INTEGER NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    sgpa NUMERIC(4,2),
    cgpa NUMERIC(4,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    category VARCHAR(50),
    backlog BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT valid_sgpa
        CHECK (sgpa IS NULL OR sgpa BETWEEN 0 AND 10),

    -- The supplied SQL draft had this constraint commented out.
    -- Uncomment if CGPA must be limited to the 0–10 scale.
    -- CONSTRAINT valid_cgpa CHECK (cgpa IS NULL OR cgpa BETWEEN 0 AND 10),

    CONSTRAINT unique_student_academic_record
        UNIQUE (student_id, semester, academic_year)
);

ALTER TABLE public.student_academic_records
        ADD COLUMN IF NOT EXISTS backlog BOOLEAN NOT NULL DEFAULT FALSE;


-- ------------------------------------------------------------
-- 13. ACTION TEMPLATES
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.action_templates (
    action_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_category VARCHAR(100),
    assessment_type VARCHAR(50),
    submitter_type VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INTEGER NOT NULL DEFAULT 0
);


-- ------------------------------------------------------------
-- 14. ACTIVITIES
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.activities (
    activity_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    course_code VARCHAR(50)
        REFERENCES public.courses(course_code) ON DELETE CASCADE,
    created_by_emp_id VARCHAR(30)
        REFERENCES public.teachers(emp_id) ON DELETE RESTRICT,
    semester SMALLINT,
    academic_year VARCHAR(20),
    assessment_type VARCHAR(50),
    target_category VARCHAR(100),
    submitter_type VARCHAR(50),
    due_date DATE,
    evidence_required VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ------------------------------------------------------------
-- 15. ACTION ASSIGNMENTS
-- Links an action template and activity to a teacher/enrollment
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.action_assignments (
    assignment_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    action_id BIGINT NOT NULL
        REFERENCES public.action_templates(action_id) ON DELETE CASCADE,
    activity_id BIGINT NOT NULL
        REFERENCES public.activities(activity_id) ON DELETE CASCADE,
    enrollment_id BIGINT
        REFERENCES public.course_enrollment(id) ON DELETE CASCADE,
    assigned_by_emp_id VARCHAR(30)
        REFERENCES public.teachers(emp_id) ON DELETE SET NULL,
    evidence_url TEXT,
    evidence_public_id TEXT,
    notes TEXT,
    review_feedback TEXT,
    status VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    evidence_resource_type VARCHAR(50),
    evidence_format VARCHAR(50)
);


-- ------------------------------------------------------------
-- 16. TEACHER ACTION SUBMISSIONS
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.teacher_action_submissions (
    submission_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    action_id BIGINT NOT NULL
        REFERENCES public.action_templates(action_id) ON DELETE CASCADE,
    emp_id VARCHAR(30) NOT NULL
        REFERENCES public.teachers(emp_id) ON DELETE CASCADE,

    cloudinary_url TEXT NOT NULL,
    cloudinary_public_id TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    file_format TEXT,
    original_filename TEXT NOT NULL,
    file_size BIGINT,

    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    program_name TEXT,
    semester INTEGER,
    course_code TEXT,
    assessment_type TEXT,
    target_category TEXT,

    CONSTRAINT uq_teacher_action_submission UNIQUE (action_id, emp_id)
);


-- ------------------------------------------------------------
-- 17. INDEXES FOR COMMON LOOKUPS
-- ------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_students_section_semester
    ON public.students (dept_code, semester, section, academic_year);

CREATE INDEX IF NOT EXISTS idx_teachers_dept_code
    ON public.teachers(dept_code);

CREATE INDEX IF NOT EXISTS idx_assigned_courses_teacher
    ON public.assigned_courses(emp_id);

CREATE INDEX IF NOT EXISTS idx_assigned_courses_course
    ON public.assigned_courses(course_id);

CREATE INDEX IF NOT EXISTS idx_course_enrollment_student
    ON public.course_enrollment(student_id);

CREATE INDEX IF NOT EXISTS idx_student_academic_records
    ON public.student_academic_records(student_id, semester, academic_year);

CREATE TABLE IF NOT EXISTS public.teacher_student_observations (
    observation_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL
        REFERENCES public.students(university_roll_no) ON DELETE CASCADE,
    teacher_emp_id VARCHAR(30) NOT NULL
        REFERENCES public.teachers(emp_id) ON DELETE CASCADE,
    course_code VARCHAR(50) NOT NULL
        REFERENCES public.courses(course_code) ON DELETE CASCADE,
    semester SMALLINT NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    title VARCHAR(120) NOT NULL,
    details TEXT NOT NULL,
    attachments JSONB NOT NULL DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teacher_student_observations_student
    ON public.teacher_student_observations
        (student_id, course_code, semester, academic_year, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_assessments_student_course
    ON public.assessments(student_id, course_id);

CREATE INDEX IF NOT EXISTS idx_assessments2_student_course
    ON public.assessments2(student_id, course_id);

CREATE INDEX IF NOT EXISTS idx_assessment_imports_course_year
    ON public.assessment_imports(course_code, academic_year, semester);

CREATE INDEX IF NOT EXISTS idx_action_assignments_enrollment
    ON public.action_assignments(enrollment_id);

CREATE INDEX IF NOT EXISTS idx_activities_course
    ON public.activities(course_code);

COMMIT;

-- ============================================================
-- END OF 3Gs PROJECT DATABASE SCHEMA
-- ============================================================
