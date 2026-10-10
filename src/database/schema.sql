-- ============================================
-- 3Gs PROJECT DATABASE SCHEMA
-- PostgreSQL / Aiven
-- ============================================

-- --------------------------------------------
-- 1. DEPARTMENTS
-- --------------------------------------------

CREATE TABLE public.departments (
    dept_code VARCHAR(20) PRIMARY KEY,
    dept_name VARCHAR(150) NOT NULL UNIQUE
);


-- --------------------------------------------
-- 2. USERS
-- Common identity and login information
-- --------------------------------------------

CREATE TABLE public.users (
    unique_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    role VARCHAR(20) NOT NULL
        CHECK (role IN ('dean', 'teacher', 'student')),

    mail_id VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(20),
    name VARCHAR(150) NOT NULL
);


-- --------------------------------------------
-- 3. STUDENTS
-- --------------------------------------------

CREATE TABLE public.students (
    university_roll_no VARCHAR(50) PRIMARY KEY,

    semester SMALLINT NOT NULL
        CHECK (semester > 0),

    section VARCHAR(10) NOT NULL,

    user_id BIGINT NOT NULL UNIQUE
        REFERENCES public.users(unique_id)
        ON DELETE CASCADE,

    program_name VARCHAR(150) NOT NULL,

    dept_code VARCHAR(20) NOT NULL
        REFERENCES public.departments(dept_code)
        ON DELETE RESTRICT,

    academic_year VARCHAR(20) NOT NULL
);


-- --------------------------------------------
-- 4. TEACHERS
-- --------------------------------------------

CREATE TABLE public.teachers (
    emp_id VARCHAR(30) NOT NULL UNIQUE PRIMARY KEY,

    user_id BIGINT NOT NULL UNIQUE
        REFERENCES public.users(unique_id)
        ON DELETE CASCADE,

    dept_code VARCHAR(20) NOT NULL
        REFERENCES public.departments(dept_code)
        ON DELETE RESTRICT,

    designation VARCHAR(100) NOT NULL
);


-- --------------------------------------------
-- 5. COURSES
-- --------------------------------------------

CREATE TABLE public.courses (
    course_code VARCHAR(50) PRIMARY KEY,
    course_name VARCHAR(150) NOT NULL,
    course_type VARCHAR(20)
    NOT NULL DEFAULT 'regular'
);


-- --------------------------------------------
-- 6. COURSES OFFERED BY DEPARTMENTS
-- --------------------------------------------

CREATE TABLE public.courses_offer (
    dept_code VARCHAR(20) NOT NULL
        REFERENCES public.departments(dept_code)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    course_code VARCHAR(50) NOT NULL
        REFERENCES public.courses(course_code)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    PRIMARY KEY (dept_code, course_code)
);


-- --------------------------------------------
-- 7. ASSIGNED COURSES
-- Which teacher teaches which course, section
-- and semester in an academic year
-- --------------------------------------------

CREATE TABLE public.assigned_courses (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    course_id VARCHAR(50) NOT NULL
        REFERENCES public.courses(course_code)
        ON DELETE CASCADE,

    emp_id VARCHAR(30) NOT NULL
        REFERENCES public.teachers(emp_id)
        ON DELETE RESTRICT,

    section VARCHAR(10) NOT NULL,

    semester SMALLINT NOT NULL
        CHECK (semester > 0),

    academic_year VARCHAR(20) NOT NULL,

    UNIQUE (
        course_id,
        emp_id,
        section,
        semester,
        academic_year
    )
);


-- --------------------------------------------
-- 8. COURSE ENROLLMENT
-- --------------------------------------------

CREATE TABLE public.course_enrollment (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    course_id VARCHAR(50) NOT NULL
        REFERENCES public.courses(course_code)
        ON DELETE CASCADE,

    student_id VARCHAR(50) NOT NULL
        REFERENCES public.students(university_roll_no)
        ON DELETE CASCADE,

    semester SMALLINT NOT NULL
        CHECK (semester > 0),

    academic_year VARCHAR(20) NOT NULL,

    UNIQUE (
        course_id,
        student_id,
        semester,
        academic_year
    ),

    -- Supports the composite assessment foreign key.
    UNIQUE (
        course_id,
        student_id,
        semester,
        academic_year,
        id
    )
);


-- --------------------------------------------
-- 9. ASSESSMENTS
-- --------------------------------------------

CREATE TABLE public.assessments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    type VARCHAR(20) NOT NULL
        CHECK (
            type IN ('pre-mse', 'mse-1', 'mse-2', 'ese')
        ),

    max_mark NUMERIC(6,2) NOT NULL
        CHECK (max_mark >= 0),

    obtained_mark NUMERIC(6,2)
        CHECK (
            obtained_mark IS NULL
            OR (
                obtained_mark >= 0
                AND obtained_mark <= max_mark
            )
        ),

    attendance_pct NUMERIC(5,2)
        CHECK (
            attendance_pct IS NULL
            OR attendance_pct BETWEEN 0 AND 100
        ),

    faculty_observation TEXT,

    course_id VARCHAR(50) NOT NULL,
    student_id VARCHAR(50) NOT NULL,

    semester SMALLINT NOT NULL
        CHECK (semester > 0),

    academic_year VARCHAR(20) NOT NULL,

    category VARCHAR(50),

    FOREIGN KEY (
        course_id,
        student_id,
        semester,
        academic_year
    )
    REFERENCES public.course_enrollment (
        course_id,
        student_id,
        semester,
        academic_year
    )
    ON DELETE CASCADE
);


-- --------------------------------------------
-- 10. INDEXES FOR COMMON LOOKUPS
-- --------------------------------------------

CREATE INDEX idx_students_section_semester
    ON public.students (
        dept_code,
        semester,
        section,
        academic_year
    );

CREATE INDEX idx_teachers_dept_code
    ON public.teachers(dept_code);

CREATE INDEX idx_assigned_courses_teacher
    ON public.assigned_courses(emp_id);

CREATE INDEX idx_assigned_courses_course
    ON public.assigned_courses(course_id);

CREATE INDEX idx_course_enrollment_student
    ON public.course_enrollment(student_id);

CREATE INDEX idx_assessments_student_course
    ON public.assessments(student_id, course_id);