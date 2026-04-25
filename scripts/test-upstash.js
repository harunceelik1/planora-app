import 'dotenv/config';

async function run() {
  try {
    console.log('CWD:', process.cwd());
    console.log('UPSTASH_REDIS_REST_URL env var:', process.env.UPSTASH_REDIS_REST_URL);
    const { Redis } = await import('@upstash/redis');
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) {
      console.error('No UPSTASH env vars');
      process.exit(1);
    }
    const redis = new Redis({ url, token });
    const key = 'test-incr-key';
    const val = await redis.incr(key);
    console.log('INCR result:', val);
    const ttl = await redis.ttl(key);
    console.log('TTL:', ttl);
  } catch (e) {
    console.error('Error:', e);
  }
}

run();
