# Academy

The Academy module is the largest subsystem in Rubikcon, designed for delivering educational content and tracking user progress.

## Sub-Modules

### Course Catalog
Manages the creation, retrieval, and structural integrity of Courses. Includes nested entities such as Modules, Weeks, and Lessons (including video attachments).

### Enrollment
Handles user access to specific courses. Distinguishes between learners who are enrolled and facilitators who oversee the course.

### Progress
Tracks granular user engagement, such as:
- Video completion (watch status).
- Submitting glossary terms.
- Weekly self-assessment ratings.
- Aggregated dashboard views for both learners and facilitators.

### Assignments & Quizzes
- **Assignments**: Manages the upload, submission, and grading of practical exercises.
- **Quizzes**: Supports auto-graded, interactive questionnaires used for knowledge checks within courses.
