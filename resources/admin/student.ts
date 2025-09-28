export interface Student {
  id: number
  name: string
  email: string
  phone: string
  gender: 'Male' | 'Female'
  avatar?: string
  role?: string
  address?: string
  city?: string
}
export const LIST_STUDENTS: Student[] = [
  {
    id: 1,
    name: 'John Deo',
    email: 'johndoe2211@gmail.com',
    phone: '+33757005467',
    gender: 'Male',
    role: 'UI/UX Designer',
    address: '2239 Hog Camp Road',
    city: 'Schaumburg',
  },
  {
    id: 2,
    name: 'Shelby Goode',
    email: 'shelbygoode481@gmail.com',
    phone: '+33757005467',
    gender: 'Female',
    role: 'Frontend Developer',
  },
  {
    id: 3,
    name: 'Robert Bacins',
    email: 'robertbacins4182@.com',
    phone: '+33757005467',
    gender: 'Male',
    role: 'Backend Developer',
  },
  {
    id: 4,
    name: 'John Carilo',
    email: 'john carilo182@.com',
    phone: '+33757805467',
    gender: 'Male',
    role: 'Full Stack Developer',
  },
  {
    id: 5,
    name: 'Adriene Watson',
    email: 'adrienewatson82@.com',
    phone: '+83757305467',
    gender: 'Female',
    role: 'Product Manager',
  },
  {
    id: 6,
    name: 'Jhon Deo',
    email: 'jhondeo24823@.com',
    phone: '+63475700546',
    gender: 'Male',
    role: 'Data Analyst',
  },
  {
    id: 7,
    name: 'Mark Ruffalo',
    email: 'markruffalo3735@.com',
    phone: '+33757005467',
    gender: 'Male',
    role: 'Marketing Specialist',
  },
  {
    id: 8,
    name: 'Bethany Jackson',
    email: 'bethanyjackson5@.com',
    phone: '+33757005467',
    gender: 'Female',
    role: 'Content Writer',
  },
  {
    id: 9,
    name: 'Christine Huston',
    email: 'christinehuston4@.com',
    phone: '+33757005467',
    gender: 'Male',
    role: 'Project Manager',
  },
  {
    id: 10,
    name: 'Anne Jacob',
    email: 'annejacob2@ummoh.com',
    phone: '+33757005467',
    gender: 'Male',
    role: 'Business Analyst',
  },
  {
    id: 11,
    name: 'James Mullican',
    email: 'jamesmullican5346@.com',
    phone: '+33757005467',
    gender: 'Male',
    role: 'Software Engineer',
  },
]
