import { cookies } from 'next/headers';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  address: string;
}

const SESSION_NAME = 'kaju_farm_session';

export async function setSession(user: UserSession) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_NAME, JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 1 day
    path: '/'
  });
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_NAME);
  if (!session || !session.value) return null;
  try {
    return JSON.parse(session.value) as UserSession;
  } catch {
    return null;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_NAME);
}
