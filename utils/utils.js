import bcrypt from 'bcryptjs';

export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

export function generateUniqueId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1_000_000);
  return `${timestamp}-${random}`;
}
