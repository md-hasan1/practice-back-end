import { exec } from 'child_process';
import util from 'util';

const run = util.promisify(exec);

export const pushErrorLog = async () => {
  try {
    // Step 1: Make sure we’re on the correct branch
    await run('git checkout hasan');

    // Optional: Pull latest from hasan to avoid push conflicts
    await run('git pull origin hasan');

    // Step 2: Check for changes (avoid empty commits)
    const { stdout: changes } = await run('git status --porcelain');

    if (!changes.trim()) {
      console.log('📭 No new errors to commit.');
      return;
    }

    // Step 3: Add, commit, and push
    await run('git add .');
    await run(`git commit -m "🔥 Error logged at ${new Date().toISOString()}"`);
    await run('git push origin hasan');

    console.log('✅ Error log pushed to GitHub!');
  } catch (err: any) {
    console.error('❌ Failed to push error log:', err.message || err);
  }
};
