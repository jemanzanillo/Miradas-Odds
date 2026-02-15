import { Redis } from '@upstash/redis';

const KING_IDS = [
  'golden-boy', 'classic', 'maverick', 'historian',
  'flame', 'voice', 'mustang', 'heartbreaker'
];

const COUNTS_KEY = 'miradas:counts';
const VOTERS_KEY = 'miradas:voters';

function redis() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error('Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN');
  }
  return new Redis({ url, token });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { name, kingId } = body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Name is required' });
    }
    const trimmedName = name.trim().slice(0, 200);
    if (!trimmedName) {
      return res.status(400).json({ error: 'Name cannot be empty' });
    }

    if (!kingId || !KING_IDS.includes(kingId)) {
      return res.status(400).json({ error: 'Invalid king selection' });
    }

    const client = redis();
    const oldKing = await client.hget(VOTERS_KEY, trimmedName);

    if (oldKing && oldKing !== kingId) {
      await client.hincrby(COUNTS_KEY, oldKing, -1);
    }
    await client.hset(VOTERS_KEY, trimmedName, kingId);
    await client.hincrby(COUNTS_KEY, kingId, 1);

    const counts = await client.hgetall(COUNTS_KEY);
    const total = Object.values(counts || {}).reduce((a, b) => a + Number(b), 0);

    return res.status(200).json({
      ok: true,
      total,
      counts: KING_IDS.reduce((acc, id) => {
        acc[id] = Number(counts?.[id] || 0);
        return acc;
      }, {})
    });
  } catch (err) {
    console.error('vote error:', err);
    if (err.message?.includes('Missing')) {
      return res.status(503).json({
        error: 'Database not configured. Connect Upstash Redis in Vercel Storage, then redeploy.'
      });
    }
    return res.status(500).json({ error: 'Failed to record vote' });
  }
}
