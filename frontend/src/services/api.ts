
import { Hackathon, Registration, StudentProfile, User } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'; // Proxied via Vite

// --- Auth ---
export const loginUser = async (credentials: any): Promise<{ user: User, token: string }> => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(credentials)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data;
};

export const signupUser = async (userData: any): Promise<{ user: User, token: string }> => {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data;
};

export const googleAuthMock = async (email: string, name: string): Promise<{ user: User, token: string }> => {
  const res = await fetch(`${API_BASE}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data;
};

// --- Hackathons ---
export const getHackathons = async (): Promise<Hackathon[]> => {
  const res = await fetch(`${API_BASE}/hackathons`);
  if (!res.ok) {
    throw new Error('Failed to fetch hackathons');
  }
  return res.json();
};

export const saveHackathon = async (hackathon: Hackathon): Promise<Hackathon> => {
  const isUpdate = hackathon.id && hackathon.id.length === 24;
  const url = isUpdate ? `${API_BASE}/hackathons/${hackathon.id}` : `${API_BASE}/hackathons`;
  const method = isUpdate ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(hackathon)
  });

  if (!res.ok) {
    const contentType = res.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to save hackathon');
    } else {
      const errorText = await res.text();
      console.error('Non-JSON error response:', errorText.substring(0, 200));
      throw new Error('Server returned non-JSON response. Please check backend server is running and restart it if needed.');
    }
  }

  return res.json();
};

export const deleteHackathon = async (id: string): Promise<void> => {
  const res = await fetch(`${API_BASE}/hackathons/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to delete hackathon');
  }
};

export const incrementImpression = async (id: string): Promise<void> => {
  const res = await fetch(`${API_BASE}/hackathons/${id}/impression`, { method: 'POST' });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to increment impression');
  }
};

// --- Registrations ---
export const getRegistrations = async (): Promise<Registration[]> => {
  const res = await fetch(`${API_BASE}/registrations`);
  if (!res.ok) {
    throw new Error('Failed to fetch registrations');
  }
  return res.json();
};

export const registerStudent = async (registration: Registration): Promise<void> => {
  const res = await fetch(`${API_BASE}/registrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registration)
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to register student');
  }
};

// --- Profile ---
export const getStudentProfile = async (userId: string): Promise<User> => {
  const res = await fetch(`${API_BASE}/profile/${userId}`);
  if (!res.ok) {
    throw new Error('Failed to fetch user profile');
  }
  return res.json();
};

export const updateUserProfile = async (userId: string, data: Partial<User>): Promise<User> => {
  const res = await fetch(`${API_BASE}/profile/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const responseData = await res.json();
  if (!responseData.success) {
    throw new Error(responseData.error || 'Failed to update profile');
  }
  return responseData.user;
};

// Get all students (for registration management)
export const getAllStudents = async (): Promise<User[]> => {
  const res = await fetch(`${API_BASE}/users/students`);
  if (!res.ok) {
    throw new Error('Failed to fetch students');
  }
  return res.json();
};

// --- AI Services ---
export const generateHackathonDescription = async (title: string, keywords: string): Promise<string> => {
  const res = await fetch(`${API_BASE}/ai/generate-description`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, keywords })
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to generate description');
  }
  const data = await res.json();
  return data.text;
};

export const analyzeEngagementTrends = async (dataJSON: string): Promise<string> => {
  const res = await fetch(`${API_BASE}/ai/analyze-trends`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: dataJSON })
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to analyze trends');
  }
  const data = await res.json();
  return data.text;
};
