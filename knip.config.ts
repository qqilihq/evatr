import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  // `main` and `types` point into dist/, which only exists after a build.
  // Point Knip at the source instead, so it behaves the same on a fresh clone.
  // `dev/scrape-error-codes.ts` needs no entry: Knip finds it via the script.
  entry: ['lib/index.ts', 'test/**/*.test.ts'],
  project: ['lib/**/*.ts', 'test/**/*.ts', 'dev/**/*.ts', '*.ts'],
};

export default config;
