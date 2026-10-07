-- ============================================
-- 3Gs PROJECT DATABASE SCHEMA
-- PostgreSQL



-- --------------------------------------------
-- 1. DEPARTMENTS
-- --------------------------------------------

CREATE TABLE departments (
    dept_code VARCHAR(20) PRIMARY KEY NOT NULL UNIQUE,

    dept_name VARCHAR(150) NOT NULL
);

-- --------------------------------------------
-- 2. USERS
-- --------------------------------------------

CREATE TABLE users (
    unique_id BIGSERIAL PRIMARY KEY,

    role VARCHAR(20) NOT NULL
        CHECK (role IN ('dean', 'teacher', 'student')),

    mail_id VARCHAR(255) NOT NULL UNIQUE,

    phone_number VARCHAR(20),

    name VARCHAR(150) NOT NULL,
);


-- --------------------------------------------
-- 3. STUDENTS
-- --------------------------------------------

CREATE TABLE students (
    university_roll_no VARCHAR(50) PRIMARY KEY,

    semester SMALLINT NOT NULL,

    section VARCHAR(10) NOT NULL,

    user_id BIGINT NOT NULL UNIQUE
        REFERENCES users(unique_id)
        ON DELETE CASCADE,

    program_name VARCHAR(150) NOT NULL,

    dept_id BIGINT NOT NULL
        REFERENCES departments(unique_id)
        ON DELETE RESTRICT,

    academic_year VARCHAR(20) NOT NULL
);


-- --------------------------------------------
-- 4. TEACHERS
-- --------------------------------------------

CREATE TABLE teachers (
    teacher_id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL UNIQUE
        REFERENCES users(unique_id)
        ON DELETE CASCADE
);


-- --------------------------------------------
-- 5. COURSES
-- --------------------------------------------

CREATE TABLE courses (
    course_code VARCHAR(50) PRIMARY KEY,

    course_name VARCHAR(150) NOT NULL
);


-- --------------------------------------------
-- 6. ASSIGNED COURSES
-- --------------------------------------------

CREATE TABLE assigned_courses (
    id BIGSERIAL PRIMARY KEY,

    course_id VARCHAR(50) NOT NULL
        REFERENCES courses(course_code)
        ON DELETE CASCADE,

    teacher_id BIGINT NOT NULL
        REFERENCES teachers(teacher_id)
        ON DELETE CASCADE,

    section VARCHAR(10) NOT NULL,

    semester SMALLINT NOT NULL,

    academic_year VARCHAR(20) NOT NULL,

    UNIQUE (
        course_id,
        teacher_id,
        section,
        semester,
        academic_year
    )
);


-- --------------------------------------------
-- 7. COURSE ENROLLMENT
-- --------------------------------------------

CREATE TABLE course_enrollment (
    id BIGSERIAL PRIMARY KEY,

    course_id VARCHAR(50) NOT NULL
        REFERENCES courses(course_code)
        ON DELETE CASCADE,

    student_id VARCHAR(50) NOT NULL
        REFERENCES students(university_roll_no)
        ON DELETE CASCADE,

    UNIQUE (
        course_id,
        student_id
    )
);


-- --------------------------------------------
-- 8. ASSESSMENT
-- --------------------------------------------

CREATE TABLE assessments (
    id BIGSERIAL PRIMARY KEY,

    type VARCHAR(20) NOT NULL
        CHECK (
            type IN (
                'pre-mse',
                'mse-1',
                'mse-2',
                'ese'
            )
        ),

    max_mark NUMERIC(6,2) NOT NULL
        CHECK (max_mark >= 0),

    obtained_mark NUMERIC(6,2)
        CHECK (obtained_mark >= 0) AND (max_mark >= obtained_mark),

    attendance_pct NUMERIC(5,2)
        CHECK (
            attendance_pct >= 0
            AND attendance_pct <= 100
        ),

    faculty_observation TEXT,

    course_id VARCHAR(50) NOT NULL
        REFERENCES courses(course_code)
        ON DELETE CASCADE,

    student_id VARCHAR(50) NOT NULL
        REFERENCES students(university_roll_no)
        ON DELETE CASCADE,

    category VARCHAR(50)
);


-- --------------------------------------------
-- 9. COURSES_OFFER
-- --------------------------------------------

CREATE TABLE courses_offer (
    dept_code VARCHAR(20) NOT NULL,
    course_code VARCHAR(50) NOT NULL,

    PRIMARY KEY (dept_code, course_code),

    FOREIGN KEY (dept_code)
        REFERENCES departments(dept_code)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    FOREIGN KEY (course_code)
        REFERENCES courses(course_code)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);