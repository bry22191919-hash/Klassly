// ...new file...
export function getUsers() {
  const raw = localStorage.getItem('users') || '[]';
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

export function registerUser({ name, email, password, role }) {
  const users = getUsers();
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return { ok: false, message: 'Email already registered' };
  }
  const user = {
    id: Date.now().toString(),
    name: name || '',
    email,
    password, // plain-text for demo only — do NOT use in production
    role: role || 'student'
  };
  users.push(user);
  saveUsers(users);
  setCurrentUser(user);
  return { ok: true, user };
}

export function authenticate(email, password) {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) return { ok: false, message: 'Invalid email or password' };
  setCurrentUser(user);
  return { ok: true, user };
}

export function setCurrentUser(user) {
  localStorage.setItem('currentUser', JSON.stringify({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role || 'student'
  }));
}

export function getCurrentUser() {
  const raw = localStorage.getItem('currentUser');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem('currentUser');
}