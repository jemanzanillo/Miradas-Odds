import { Redis } from '@upstash/redis';

const KING_IDS = [
  'golden-boy', 'classic', 'maverick', 'historian',
  'flame', 'voice', 'mustang', 'heartbreaker'
];

const COUNTS_KEY = 'miradas:counts';

function redis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error('Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN');
  }
  return new Redis({ url, token });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const client = redis();
    const counts = await client.hgetall(COUNTS_KEY);

    const result = KING_IDS.reduce((acc, id) => {
      acc[id] = Number(counts?.[id] || 0);
      return acc;
    }, {});

    const total = Object.values(result).reduce((a, b) => a + b, 0);

    return res.status(200).json({ total, counts: result });
  } catch (err) {
    console.error('votes error:', err);
    if (err.message?.includes('Missing')) {
      return res.status(503).json({
        total: 0,
        counts: KING_IDS.reduce((acc, id) => ({ ...acc, [id]: 0 }), {})
      });
    }
    return res.status(500).json({
      total: 0,
      counts: KING_IDS.reduce((acc, id) => ({ ...acc, [id]: 0 }), {})
    });
  }
}
