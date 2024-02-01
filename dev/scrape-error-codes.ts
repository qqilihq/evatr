import { load as cheerioLoad } from 'cheerio';
import path from 'path';
import fs from 'fs';

const url = 'https://evatr.bff-online.de/eVatR/xmlrpc/codes';
const result = 'error-codes.json';

async function scrapeErrorCodes() {
  const errorCodes: ({ code: number; description: string } | { info: string })[] = [];
  errorCodes.push({
    info: '!!! This file is auto-generated. Do not manually edit. Instead, run the script `scrape-error-codes` !!!',
  });

  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerioLoad(html);

  const rows = $('#errorcodes tr').toArray();
  for (const row of rows) {
    const code = parseInt(cleanWhitespace($('td:nth-child(1)', row).text()));
    const description = cleanWhitespace($('td:nth-child(2)', row).text());
    if (!code || !description) {
      // ignore the header row
      continue;
    }
    errorCodes.push({ code, description });
  }

  const json = JSON.stringify(errorCodes, null, 2);
  await fs.promises.writeFile(path.join(__dirname, '../lib', result), json);
}

function cleanWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

(async () => scrapeErrorCodes())()
  .then(() => console.log('Wrote JSON'))
  .catch((err) => console.log(err));
