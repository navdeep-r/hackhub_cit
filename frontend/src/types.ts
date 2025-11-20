export interface Hackathon {
    id: string;
    title: string;
    description: string;
    date: string;
    registrationDeadline: string;
    registrationLink: string;
    platform: string;
    location: string;
    prizePool: string;
    createdAt: number;
    impressions: number;
    categories: string[];
    tags: string[];
}

export interface Registration {
    id: string;
    hackathonId: string;
    studentId: string;
    status: string;
    timestamp: number;
    [key: string]: any;
}

export interface AnalyticsData {
    hackathonTitle: string;
    impressions: number;
    registrations: number;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    [key: string]: any;
}

export interface StudentProfile {
    id: string;
    userId: string;
    skills: string[];
    bio: string;
    [key: string]: any;
}

export enum UserRole {
    STUDENT = 'STUDENT',
    FACULTY = 'FACULTY'
}
