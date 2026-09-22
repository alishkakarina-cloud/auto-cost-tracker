import { readState, writeState } from '../../lib/store';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const state = await readState();
    res.status(200).json(state);
    return;
  }

  if (req.method === 'PUT') {
    try {
      const saved = await writeState(req.body || {});
      res.status(200).json(saved);
    } catch (err) {
      console.error('save state failed', err);
      res.status(500).json({ error: 'save_failed' });
    }
    return;
  }

  res.status(405).json({ error: 'method_not_allowed' });
}
