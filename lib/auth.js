import crypto from 'crypto';

const SECRET = process.env.JWT_SECRET || 'change-me';
const b64u = (buf) => Buffer.from(buf).toString('base64url');
const b64uJson = (obj) => b64u(JSON.stringify(obj));

export function signJWT(payload, expiresInSec = 60 * 60 * 24 * 7) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + expiresInSec };
  const h = b64uJson(header);
  const p = b64uJson(body);
  const sig = crypto.createHmac('sha256', SECRET).update(`${h}.${p}`).digest('base64url');
  return `${h}.${p}.${sig}`;
}

export function verifyJWT(token) {
  if (!token) return null;
  try {
    const [h, p, s] = token.split('.');
    if (!h || !p || !s) return null;
    const expected = crypto.createHmac('sha256', SECRET).update(`${h}.${p}`).digest('base64url');
    if (expected !== s) return null;
    const payload = JSON.parse(Buffer.from(p, 'base64url').toString());
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch { return null; }
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

export function verifyPassword(password, stored) {
  try {
    const [saltHex, hashHex] = stored.split(':');
    const salt = Buffer.from(saltHex, 'hex');
    const expected = Buffer.from(hashHex, 'hex');
    const actual = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(expected, actual);
  } catch { return false; }
}

export function requireAuth(request) {
  const auth = request.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  const payload = verifyJWT(token);
  return payload; // null if invalid
}

export function otp6() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
