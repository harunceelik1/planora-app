console.log('Smoke test script starting.');
console.log('CWD:', process.cwd());
const base = process.env.BASE_URL || 'http://localhost:3001';

async function run(){
  try{
    console.log('\n1) GET /');
    const r1 = await fetch(base + '/');
    console.log('GET / ->', r1.status, r1.statusText);
    const t1 = await r1.text();
    console.log('Body preview:', t1.slice(0,800));
  }catch(e){
    console.error('GET / failed:', e);
  }

  try{
    console.log('\n2) POST /api/ai/decompose (expect auth or validation errors, but we want a response)');
    const payload = { title: 'Smoke test task', projectId: 'smoke-test-project', locale: 'en' };
    const r2 = await fetch(base + '/api/ai/decompose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    console.log('POST /api/ai/decompose ->', r2.status, r2.statusText);
    const t2 = await r2.text();
    console.log('Response preview:', t2.slice(0,2000));
  }catch(e){
    console.error('POST /api/ai/decompose failed:', e);
  }
}

run().then(()=>console.log('Smoke test finished')).catch((e)=>{console.error(e);process.exit(1)});
