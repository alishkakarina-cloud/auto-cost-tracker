import { checkPassword, createSessionToken, setSessionCookie } from '../../lib/auth';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }
  const { password } = req.body || {};
  if (!checkPassword(password)) {
    res.status(401).json({ error: 'invalid_password' });
    return;
  }
  const token = createSessionToken();
  setSessionCookie(res, token);
  res.status(200).json({ ok: true });
}
