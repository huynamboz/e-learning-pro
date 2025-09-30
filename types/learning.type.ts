// Types for learning page components

export interface Schedule {
  id: string
  text: string
}


export interface UserProfile {
  name: string
  avatar: string
}

export interface NavigationTab {
  key: string
  label: string
}

export interface SortOption {
  value: string
  label: string
}

// Enums and constants
export enum CourseLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
}

export enum TabKeys {
  PROFILE = 'profile',
  MY_COURSES = 'myCourses',
  TEACHERS = 'teachers',
  MESSAGE = 'message',
  MY_REVIEWS = 'myReviews',
}

export enum SortBy {
  RELEVANCE = 'relevance',
  NEWEST = 'newest',
  OLDEST = 'oldest',
  ALPHABETICAL = 'alphabetical',
  PRICE_LOW = 'price-low',
  PRICE_HIGH = 'price-high',
}
