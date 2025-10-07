import type { QuizChapter } from '~/types/quiz.type'

export const quizzes: QuizChapter[] = [
  {
    id: '1',
    chapter_title: 'Chapter 1',
    quizzes: [
      {
        id: '1',
        title: 'Quiz about something abcd...',
        description: 'This quiz covers basic concepts of Chapter 1',
        category: 'italian-beginners',
        chapter: 'chapter-1',
        timeType: 'limit',
        quantity: 45,
        unit: 'minute',
        questions: [],
        number_of_questions: 10,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Quiz about advanced topics...',
        description: 'This quiz covers advanced concepts of Chapter 1',
        category: 'italian-beginners',
        chapter: 'chapter-1',
        timeType: 'no-limit',
        quantity: null,
        unit: null,
        questions: [],
        number_of_questions: 15,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: '2',
    chapter_title: 'Chapter 2',
    quizzes: [
      {
        id: '3',
        title: 'Quiz about final concepts...',
        description: 'This quiz covers final concepts of Chapter 2',
        category: 'italian-beginners',
        chapter: 'chapter-2',
        timeType: 'limit',
        quantity: 30,
        unit: 'minute',
        questions: [],
        number_of_questions: 20,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  },
]
