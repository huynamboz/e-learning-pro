import type { Course, UserProfile } from '~/types/learning.type'

// Mock user profile data
export const mockUserProfile: UserProfile = {
  name: 'John Doe',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=face',
}

// Mock courses data
export const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Italian for Beginners – Course Details',
    instructor: 'By Ronald Richards',
    image: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=266&h=139&fit=crop',
    enrolled: false,
    details: '22 Total Hours. 155 Lectures. Beginner',
    ratings: 4.8,
    totalHours: 22,
    lectures: 155,
    level: 'Beginner',
    price: 149.9,
  },
  {
    id: '2',
    title: 'Italian for Beginners – Course Details',
    instructor: 'By Ronald Richards',
    image: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=266&h=139&fit=crop',
    enrolled: true,
    progress: 65,
    schedule: [
      { id: 's1', text: 'Monday (8:30pm-9pm)' },
      { id: 's2', text: 'Thursday (8:30pm-9pm)' },
    ],
    details: '22 Total Hours. 155 Lectures. Beginner',
    ratings: 4.8,
    totalHours: 22,
    lectures: 155,
    level: 'Beginner',
  },
  {
    id: '3',
    title: 'Italian for Beginners – Course Details',
    instructor: 'By Ronald Richards',
    image: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=266&h=139&fit=crop',
    enrolled: true,
    progress: 45,
    schedule: [
      { id: 's3', text: 'Monday (8:30pm-9pm)' },
      { id: 's4', text: 'Thursday (8:30pm-9pm)' },
    ],
    details: '22 Total Hours. 155 Lectures. Beginner',
    ratings: 4.8,
    totalHours: 22,
    lectures: 155,
    level: 'Beginner',
  },
  {
    id: '4',
    title: 'Beginner\'s Guide to Design',
    instructor: 'By Ronald Richards',
    image: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=266&h=139&fit=crop',
    enrolled: true,
    progress: 80,
    schedule: [
      { id: 's5', text: 'Monday (8:30pm-9pm)' },
      { id: 's6', text: 'Thursday (8:30pm-9pm)' },
    ],
    details: '22 Total Hours. 155 Lectures. Beginner',
    ratings: 4.8,
    totalHours: 22,
    lectures: 155,
    level: 'Beginner',
  },
  {
    id: '5',
    title: 'Beginner\'s Guide to Design',
    instructor: 'By Ronald Richards',
    image: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=266&h=139&fit=crop',
    enrolled: true,
    progress: 30,
    schedule: [
      { id: 's7', text: 'Monday (8:30pm-9pm)' },
      { id: 's8', text: 'Thursday (8:30pm-9pm)' },
    ],
    details: '22 Total Hours. 155 Lectures. Beginner',
    ratings: 4.8,
    totalHours: 22,
    lectures: 155,
    level: 'Beginner',
  },
  {
    id: '6',
    title: 'Beginner\'s Guide to Design',
    instructor: 'By Ronald Richards',
    image: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=266&h=139&fit=crop',
    enrolled: true,
    progress: 90,
    schedule: [
      { id: 's9', text: 'Monday (8:30pm-9pm)' },
      { id: 's10', text: 'Thursday (8:30pm-9pm)' },
    ],
    details: '22 Total Hours. 155 Lectures. Beginner',
    ratings: 4.8,
    totalHours: 22,
    lectures: 155,
    level: 'Beginner',
  },
  {
    id: '7',
    title: 'Beginner\'s Guide to Design',
    instructor: 'By Ronald Richards',
    image: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=266&h=139&fit=crop',
    enrolled: true,
    progress: 55,
    schedule: [
      { id: 's11', text: 'Monday (8:30pm-9pm)' },
      { id: 's12', text: 'Thursday (8:30pm-9pm)' },
    ],
    details: '22 Total Hours. 155 Lectures. Beginner',
    ratings: 4.8,
    totalHours: 22,
    lectures: 155,
    level: 'Beginner',
  },
  {
    id: '8',
    title: 'Beginner\'s Guide to Design',
    instructor: 'By Ronald Richards',
    image: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=266&h=139&fit=crop',
    enrolled: true,
    progress: 25,
    schedule: [
      { id: 's13', text: 'Monday (8:30pm-9pm)' },
      { id: 's14', text: 'Thursday (8:30pm-9pm)' },
    ],
    details: '22 Total Hours. 155 Lectures. Beginner',
    ratings: 4.8,
    totalHours: 22,
    lectures: 155,
    level: 'Beginner',
  },
  {
    id: '9',
    title: 'Beginner\'s Guide to Design',
    instructor: 'By Ronald Richards',
    image: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=266&h=139&fit=crop',
    enrolled: true,
    progress: 75,
    schedule: [
      { id: 's15', text: 'Monday (8:30pm-9pm)' },
      { id: 's16', text: 'Thursday (8:30pm-9pm)' },
    ],
    details: '22 Total Hours. 155 Lectures. Beginner',
    ratings: 4.8,
    totalHours: 22,
    lectures: 155,
    level: 'Beginner',
  },
  {
    id: '10',
    title: 'Mastering JavaScript ES6+',
    instructor: 'By Jane Cooper',
    image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=266&h=139&fit=crop',
    enrolled: false,
    details: '40 Total Hours. 220 Lectures. Intermediate',
    ratings: 4.6,
    totalHours: 40,
    lectures: 220,
    level: 'Intermediate',
    price: 199.0,
  },
  {
    id: '11',
    title: 'UI/UX Design Essentials',
    instructor: 'By Leslie Alexander',
    image: 'https://plus.unsplash.com/premium_photo-1733306548826-95daff988ae6?w=266&h=139&fit=crop',
    enrolled: true,
    progress: 60,
    schedule: [
      { id: 's17', text: 'Tuesday (7pm-8pm)' },
      { id: 's18', text: 'Friday (7pm-8pm)' },
    ],
    details: '18 Total Hours. 95 Lectures. Beginner',
    ratings: 4.9,
    totalHours: 18,
    lectures: 95,
    level: 'Beginner',
  },
  {
    id: '12',
    title: 'Advanced Python Programming',
    instructor: 'By Jacob Jones',
    image: 'https://images.unsplash.com/photo-1649180556628-9ba704115795?w=266&h=139&fit=crop',
    enrolled: true,
    progress: 40,
    schedule: [
      { id: 's19', text: 'Wednesday (9pm-10pm)' },
      { id: 's20', text: 'Saturday (9pm-10pm)' },
    ],
    details: '55 Total Hours. 300 Lectures. Advanced',
    ratings: 4.7,
    totalHours: 55,
    lectures: 300,
    level: 'Advanced',
  },
]

// Pagination helper
export const ITEMS_PER_PAGE = 9

export function calculateTotalPages(totalItems: number): number {
  return Math.ceil(totalItems / ITEMS_PER_PAGE)
}

export function getPaginatedCourses(courses: Course[], page: number): Course[] {
  const startIndex = (page - 1) * ITEMS_PER_PAGE
  return courses.slice(startIndex, startIndex + ITEMS_PER_PAGE)
}
