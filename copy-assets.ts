import fs from 'fs-extra';
import path from 'path';

async function copyAssets() {
  const src = path.join(process.cwd(), 'dist');
  const dest = path.join(process.cwd(), 'server');
  console.log(`Copying from ${src} to ${dest}`);
  await fs.copy(src, dest);
  console.log('Copy complete.');
}

copyAssets().catch(err => {
    console.error(err);
    process.exit(1);
});
