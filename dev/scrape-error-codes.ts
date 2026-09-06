import path from 'path';
import fs from 'fs';

const url = 'https://api.evatr.vies.bzst.de/v1/info/statusmeldungen';
const result = 'error-codes.ts';

async function scrapeErrorCodes() {
  const errorCodes: string[] = [];
  errorCodes.push('// This file is auto-generated. Do not manually edit. Instead, run the script `scrape-error-codes`');

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  const json = await response.json();
  errorCodes.push(
    'export type ErrorCodeEntry = { status: string, kategorie: string, httpcode?: number, feld?: string, meldung: string };',
  );
  errorCodes.push(`const entries: ErrorCodeEntry[] = ${JSON.stringify(json, null, 2)};`);
  // Frozen deeply, not just the array: the entries are shared with the lookup
  // behind `errorDescription`, so a mutation would change later results.
  errorCodes.push(
    'export const errorCodes: readonly Readonly<ErrorCodeEntry>[] = Object.freeze(entries.map((entry) => Object.freeze(entry)));',
  );
  errorCodes.push('');
  await fs.promises.writeFile(path.join(__dirname, '../lib', result), errorCodes.join('\n'));
}

(async () => scrapeErrorCodes())()
  .then(() => console.log(`Wrote ${result}`))
  .catch((err) => console.log(err));
