# Modules

The backend is organized into bounded contexts located in `src/modules`.

## Domain Modules

1. **`auth`**: Handles authentication, registration, onboarding, and device session management.
2. **`user-management`**: Manages users across different roles (Learner, Facilitator, Super Admin).
3. **`academy`**: The largest module, broken down into sub-modules:
   - `assignments`: Submitting and grading coursework.
   - `course-catalog`: Course creation, lessons, curriculum management.
   - `enrollment`: Access control for courses.
   - `progress`: Tracking user engagement (video watch status, quizzes taken).
   - `quizzes`: Quiz generation and submissions.
4. **`games`**: Handles gamification (scores, leaderboards).
5. **`gigs`**: Manages freelance gigs and applications.
6. **`platform`**: High-level platform statistics and reporting.
