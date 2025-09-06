export type StoredUser = {
  id: string;
  name: string;
  email: string;
  password: string;
};

const USERS_KEY = "demo_users";
const TOKEN_KEY = "demo_token";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function getUsers(): StoredUser[] {
  if (!isBrowser()) return [];
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as StoredUser[];
  } catch {
    return [];
  }
}

export function saveUsers(users: StoredUser[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function findUserByEmail(email: string): StoredUser | undefined {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function signUp(name: string, email: string, password: string): void {
  if (!isBrowser()) return;
  const existing = findUserByEmail(email);
  if (existing) {
    throw new Error("Email đã tồn tại.");
  }
  const users = getUsers();
  const newUser: StoredUser = {
    id: crypto.randomUUID(),
    name,
    email,
    password,
  };
  users.push(newUser);
  saveUsers(users);
}

export function signIn(email: string, password: string): void {
  if (!isBrowser()) return;
  const user = findUserByEmail(email);
  if (!user || user.password !== password) {
    throw new Error("Email hoặc mật khẩu không đúng.");
  }
  localStorage.setItem(TOKEN_KEY, JSON.stringify({ userId: user.id }));
}

export function signOut(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(TOKEN_KEY);
}

export function isSignedIn(): boolean {
  if (!isBrowser()) return false;
  return Boolean(localStorage.getItem(TOKEN_KEY));
}

export function currentUser(): StoredUser | null {
  if (!isBrowser()) return null;
  const tokenRaw = localStorage.getItem(TOKEN_KEY);
  if (!tokenRaw) return null;
  try {
    const token = JSON.parse(tokenRaw) as { userId: string };
    const users = getUsers();
    return users.find((u) => u.id === token.userId) ?? null;
  } catch {
    return null;
  }
}


