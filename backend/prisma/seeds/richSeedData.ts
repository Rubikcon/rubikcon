import { faker } from '@faker-js/faker';
import prisma from '../../src/infrastructure/prisma/client';

const CATEGORIES = ['Product Development', 'Tokenomics', 'Blockchain Technology', 'AI'];
const VIDEO_URLS = [
  'https://www.youtube.com/embed/5mNzXeqIutg',
  'https://www.youtube.com/embed/M3X_EInqVjw',
  'https://www.youtube.com/embed/kYc-m75E_zU',
  'https://www.youtube.com/embed/bBc_XU2b77A'
];

function getRandomVideoUrl() {
  return VIDEO_URLS[Math.floor(Math.random() * VIDEO_URLS.length)];
}

export async function seedRichData() {
  console.log('Seeding rich data for Rubikcon Academy...');

  // 1. Create 5 Facilitators
  console.log('Creating facilitators...');
  const facilitators = [];
  for (let i = 0; i < 5; i++) {
    const facilitator = await prisma.facilitator.create({
      data: {
        name: faker.person.fullName(),
        title: faker.person.jobTitle(),
        organization: faker.company.name(),
        email: faker.internet.email(),
        linkedinUrl: `https://linkedin.com/in/${faker.lorem.word()}`,
        photoUrl: faker.image.url({ width: 400, height: 400 }),
        bio: faker.lorem.paragraph(),
      }
    });
    facilitators.push(facilitator);
  }

  // 2. Create 20 Courses
  console.log('Creating courses...');
  const courses = [];
  for (let i = 0; i < 20; i++) {
    const category = CATEGORIES[i % CATEGORIES.length];
    
    const course = await prisma.course.create({
      data: {
        title: `${category}: ${faker.company.catchPhrase()}`,
        description: faker.lorem.paragraphs(3),
        tagline: faker.lorem.sentence(),
        level: faker.helpers.arrayElement(['Beginner', 'Intermediate', 'Advanced']),
        estimatedDuration: `${faker.number.int({ min: 4, max: 12 })} Weeks`,
        phaseLabel: `Cohort ${faker.number.int({ min: 1, max: 5 })}`,
        heroImage: faker.image.url({ width: 1200, height: 600 }),
        introVideoUrl: getRandomVideoUrl(),
        slug: faker.helpers.slugify(faker.lorem.words(3).toLowerCase()) + `-${i}`,
        published: true,
        isPaid: faker.datatype.boolean(),
        priceUsd: faker.number.int({ min: 50, max: 500 }),
        status: 'APPROVED',
      }
    });
    courses.push(course);

    // Assign facilitators to the course
    const selectedFacilitators = faker.helpers.arrayElements(facilitators, { min: 1, max: 2 });
    for (const [index, fac] of selectedFacilitators.entries()) {
      await prisma.courseFacilitator.create({
        data: {
          courseId: course.id,
          facilitatorId: fac.id,
          position: index + 1
        }
      });
    }

    // 3. Create Modules & Weeks & Lessons
    const numModules = faker.number.int({ min: 2, max: 4 });
    let globalWeekNumber = 1;
    let globalLessonNumber = 1;

    for (let m = 1; m <= numModules; m++) {
      const module = await prisma.module.create({
        data: {
          courseId: course.id,
          title: `Module ${m}: ${faker.company.catchPhrase()}`,
          description: faker.lorem.paragraph(),
          position: m,
        }
      });

      const numWeeks = faker.number.int({ min: 1, max: 3 });
      for (let w = 1; w <= numWeeks; w++) {
        const week = await prisma.week.create({
          data: {
            courseId: course.id,
            moduleId: module.id,
            number: globalWeekNumber++,
            title: `Week: ${faker.lorem.words(3)}`,
            slug: `${course.slug}-week-${globalWeekNumber}`,
            durationLabel: `${faker.number.int({ min: 2, max: 5 })} hours`,
            difficulty: faker.helpers.arrayElement(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
            hook: faker.lorem.sentence(),
            whatToExpect: faker.lorem.paragraph(),
            summary: faker.lorem.paragraph(),
            estimatedCompletionMinutes: faker.number.int({ min: 60, max: 180 }),
            videoTitle: faker.lorem.words(3),
            videoUrl: getRandomVideoUrl(),
            published: true,
          }
        });

        // Add an assignment to the week
        await prisma.assignment.create({
          data: {
            weekId: week.id,
            title: `Assignment: ${faker.lorem.words(3)}`,
            instructions: faker.lorem.paragraph(),
            deadline: faker.date.future(),
            position: 1
          }
        });

        // Add a quiz to the week
        const quiz = await prisma.quiz.create({
          data: {
            weekId: week.id,
            title: `Quiz for Week ${week.number}`,
            passMark: 70,
            attemptLimit: 3
          }
        });

        // Add questions to quiz
        for (let q = 1; q <= 3; q++) {
          const question = await prisma.quizQuestion.create({
            data: {
              quizId: quiz.id,
              prompt: `${faker.lorem.sentence()}?`,
              explanation: faker.lorem.sentence(),
              position: q
            }
          });

          // Add options
          for (let o = 1; o <= 4; o++) {
            await prisma.quizOption.create({
              data: {
                questionId: question.id,
                label: faker.lorem.words(2),
                isCorrect: o === 1, // First option always correct for dummy data
                position: o
              }
            });
          }
        }

        // Add lesson
        await prisma.lesson.create({
          data: {
            moduleId: module.id,
            title: `Lesson ${globalLessonNumber++}: ${faker.lorem.words(3)}`,
            content: faker.lorem.paragraphs(2),
            duration: faker.number.int({ min: 10, max: 30 }),
            position: globalLessonNumber,
          }
        });
      }
    }
  }

  // 4. Create Users and Enrollments (to show metrics)
  console.log('Creating users and enrollments...');
  const users = [];
  for (let i = 0; i < 50; i++) {
    const user = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password()
      }
    });
    users.push(user);
    
    // Enroll in 1-3 courses
    const enrolledCourses = faker.helpers.arrayElements(courses, { min: 1, max: 3 });
    for (const ec of enrolledCourses) {
      await prisma.courseEnrollment.create({
        data: {
          userId: user.id,
          courseId: ec.id,
          enrolledAt: faker.date.past()
        }
      });
      // Optionally create progress for these
      const courseWeeks = await prisma.week.findMany({ where: { courseId: ec.id } });
      for (const cw of faker.helpers.arrayElements(courseWeeks, { min: 1, max: courseWeeks.length })) {
        await prisma.weekProgress.create({
          data: {
            userId: user.id,
            weekId: cw.id,
            status: faker.helpers.arrayElement(['COMPLETE', 'IN_PROGRESS', 'NOT_STARTED']),
            manuallyCompleted: faker.datatype.boolean()
          }
        });
      }
    }
  }
}
