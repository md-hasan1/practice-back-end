import { exec } from 'child_process';
import util from 'util';
import config from '../config';

const run = util.promisify(exec);


export const pushErrorLog = async () => {
    try {
      await run('git checkout hasan');
      await run('git pull origin error-logs');
      await run('git add logs/errors.log');
      await run(`git commit -m "🔥 Error logged at ${new Date().toISOString()}"`);
      await run('git push origin error-logs');
      console.log('✅ Error log pushed to GitHub!');
    } catch (err) {
      console.error('❌ Failed to push error log:', err);
    }
  };


