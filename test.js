import fs from 'fs';
import handler from './api/chart.js';

process.env.TWELVE_DATA_KEY = 'invalid_key_to_force_fallback';

const req = {
  query: { symbol: 'KSPI', period: '6m' }
};

const res = {
  setHeader: (key, value) => console.log(`[Header] ${key}: ${value}`),
  status: (code) => {
    console.log(`[Status] ${code}`);
    return res;
  },
  send: (data) => {
    if (typeof data === 'string') {
      fs.writeFileSync('test.svg', data);
      console.log('✅ Generated test.svg successfully!');
    } else if (Buffer.isBuffer(data)) {
      console.log(`[Response Body]: ${data}`);
    }
  }
};

(async () => {
  try {
    await handler(req, res);
  } catch (err) {
    console.error('Error during test:', err);
  }
})();
