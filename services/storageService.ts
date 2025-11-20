import { Hackathon, Registration, StudentProfile, UserRole } from '../types';

const KEYS = {
  HACKATHONS: 'hackhub_hackathons',
  REGISTRATIONS: 'hackhub_registrations',
  PROFILE: 'hackhub_student_profile'
};

// Seed data for demo purposes
const SEED_HACKATHONS: Hackathon[] = [
  {
    id: '1',
    title: 'AI Innovation Sprint',
    description: 'Join us for a 24-hour sprint to build the next generation of AI applications. Focus on ethics and utility.',
    date: '2023-11-15',
    registrationDeadline: '2023-11-10',
    registrationLink: 'https://unstop.com/hackathon/ai-sprint',
    platform: 'Unstop',
    location: 'Engineering Block A',
    prizePool: '$5,000',
    categories: ['AI/ML/DS', 'Python'],
    createdAt: Date.now() - 10000000,
    impressions: 1240,
    tags: ['AI/ML/DS', 'Python']
  },
  {
    id: '2',
    title: 'GreenTech Challenge',
    description: 'Solve pressing environmental issues using IoT and renewable energy tech. Hardware components provided.',
    date: '2023-12-01',
    registrationDeadline: '2023-11-25',
    registrationLink: '',
    platform: 'DoraHacks',
    location: 'Innovation Lab',
    prizePool: '$3,000',
    categories: ['IOT', 'Hardware'],
    createdAt: Date.now() - 200000, // Recent
    impressions: 450,
    tags: ['IOT', 'Hardware']
  }
];

export const getHackathons = (): Hackathon[] => {
  const data = localStorage.getItem(KEYS.HACKATHONS);
  if (!data) {
    localStorage.setItem(KEYS.HACKATHONS, JSON.stringify(SEED_HACKATHONS));
    return SEED_HACKATHONS;
  }
  return JSON.parse(data);
};

export const saveHackathon = (hackathon: Hackathon): void => {
  const current = getHackathons();
  const index = current.findIndex(h => h.id === hackathon.id);
  if (index >= 0) {
    current[index] = hackathon;
  } else {
    current.push(hackathon);
  }
  localStorage.setItem(KEYS.HACKATHONS, JSON.stringify(current));
};

export const deleteHackathon = (id: string): void => {
  const current = getHackathons();
  const filtered = current.filter(h => h.id !== id);
  localStorage.setItem(KEYS.HACKATHONS, JSON.stringify(filtered));
};

export const incrementImpression = (id: string): void => {
  const current = getHackathons();
  const index = current.findIndex(h => h.id === id);
  if (index >= 0) {
    current[index].impressions += 1;
    localStorage.setItem(KEYS.HACKATHONS, JSON.stringify(current));
  }
};

export const getRegistrations = (): Registration[] => {
  const data = localStorage.getItem(KEYS.REGISTRATIONS);
  return data ? JSON.parse(data) : [];
};

export const registerStudent = (registration: Registration): void => {
  const current = getRegistrations();
  current.push(registration);
  localStorage.setItem(KEYS.REGISTRATIONS, JSON.stringify(current));
};

export const getStudentProfile = (): StudentProfile => {
  const data = localStorage.getItem(KEYS.PROFILE);
  if (!data) {
    const defaultProfile: StudentProfile = {
      id: 'student_123',
      name: 'Alex Student',
      email: 'alex@university.edu',
      role: UserRole.STUDENT,
      skills: ['React', 'Node.js'],
      year: '3',
      registerNo: '2024001',
      department: 'Computer Science'
    };
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(defaultProfile));
    return defaultProfile;
  }
  return JSON.parse(data);
};