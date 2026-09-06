/* eslint-disable @typescript-eslint/no-floating-promises */
import * as evatr from '../lib/index';
import moment from 'moment-timezone';
import assert from 'node:assert';
import { describe, it, before } from 'node:test';
import type { ResultType } from '../lib/index';

const statusMessagesUrl = 'https://api.evatr.vies.bzst.de/v1/info/statusmeldungen';

describe('evatr VAT validation', () => {
  describe('simple', () => {
    let result: evatr.ISimpleResult;

    before(async () => {
      result = await evatr.checkSimple({
        ownVatNumber: 'DE115235681',
        validateVatNumber: 'CZ00177041',
      });
    });

    it('returns an object', () => {
      assert.strictEqual(typeof result, 'object');
    });

    it('has an ID', () => {
      assert.match(result.id, /^[0-9a-f]{16}$/);
    });

    it('returns date and time', () => {
      assert.strictEqual(typeof result.dateTime, 'string');
      assert.strictEqual(typeof result.date, 'string');
      assert.strictEqual(typeof result.time, 'string');
      assert.match(result.dateTime, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+\+\d{2}:\d{2}$/);
      assert.match(result.date, /^\d{2}.\d{2}.\d{4}$/);
      assert.match(result.time, /^\d{2}:\d{2}:\d{2}$/);
    });

    it('returns plausible date and time', () => {
      const date = moment.tz(result.date + ' ' + result.time, 'DD.MM.YYYY HH:mm', 'Europe/Berlin');
      const diff = moment().diff(date, 'm', true);
      assert.ok(diff < 5);
    });

    it('returns code 200', () => {
      assert.strictEqual(result.errorCode, 200);
    });

    it('returns own VAT number', () => {
      assert.strictEqual(result.ownVatNumber, 'DE115235681');
    });

    it('returns validated VAT number', () => {
      assert.strictEqual(result.validatedVatNumber, 'CZ00177041');
    });

    it('returns readable error description', () => {
      assert.strictEqual(result.errorDescription, 'Die angefragte USt-IdNr. ist zum Anfragezeitpunkt gültig.');
    });

    it('contains status', () => {
      assert.strictEqual(result.status, 'evatr-0000');
    });

    it('contains valid flag', () => {
      assert.strictEqual(result.valid, true);
    });
  });

  describe('qualified', () => {
    let result: evatr.IQualifiedResult;

    before(async () => {
      result = await evatr.checkQualified({
        ownVatNumber: 'DE115235681',
        validateVatNumber: 'CZ00177041',
        companyName: 'ŠKODA AUTO a.s.',
        city: 'Mlada Boleslav',
        zip: '293 01',
        street: 'tř. Václava Klementa 869',
      });
    });

    it('returns an object', () => {
      assert.strictEqual(typeof result, 'object');
    });

    it('has an ID', () => {
      assert.match(result.id, /^[0-9a-f]{16}$/);
    });

    it('returns date and time', () => {
      assert.strictEqual(typeof result.dateTime, 'string');
      assert.strictEqual(typeof result.date, 'string');
      assert.strictEqual(typeof result.time, 'string');
      assert.match(result.dateTime, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+\+\d{2}:\d{2}$/);
      assert.match(result.date, /^\d{2}.\d{2}.\d{4}$/);
      assert.match(result.time, /^\d{2}:\d{2}:\d{2}$/);
    });

    it('returns plausible date and time', () => {
      const date = moment.tz(result.date + ' ' + result.time, 'DD.MM.YYYY HH:mm', 'Europe/Berlin');
      const diff = moment().diff(date, 'm', true);
      assert.ok(diff < 5);
    });

    it('returns code 200', () => {
      assert.strictEqual(result.errorCode, 200);
    });

    it('returns own VAT number', () => {
      assert.strictEqual(result.ownVatNumber, 'DE115235681');
    });

    it('returns validated VAT number', () => {
      assert.strictEqual(result.validatedVatNumber, 'CZ00177041');
    });

    it('returns company name', () => {
      assert.strictEqual(result.companyName, 'ŠKODA AUTO a.s.');
    });

    it('returns city', () => {
      assert.strictEqual(result.city, 'Mlada Boleslav');
    });

    it('returns zip', () => {
      assert.strictEqual(result.zip, '293 01');
    });

    it('returns street', () => {
      assert.strictEqual(result.street, 'tř. Václava Klementa 869');
    });

    it('returns match for name, city, zip, street', () => {
      assert.strictEqual(result.resultName, 'A');
      assert.strictEqual(result.resultCity, 'A');
      assert.strictEqual(result.resultZip, 'A');
      assert.strictEqual(result.resultStreet, 'A');
    });

    it('maps result to German', () => {
      assert.strictEqual(result.resultNameDescription, 'stimmt überein');
      assert.strictEqual(result.resultCityDescription, 'stimmt überein');
      assert.strictEqual(result.resultZipDescription, 'stimmt überein');
      assert.strictEqual(result.resultStreetDescription, 'stimmt überein');
    });

    it('returns readable error description', () => {
      assert.strictEqual(result.errorDescription, 'Die angefragte USt-IdNr. ist zum Anfragezeitpunkt gültig.');
    });

    it('contains status', () => {
      assert.strictEqual(result.status, 'evatr-0000');
    });

    it('contains valid flag', () => {
      assert.strictEqual(result.valid, true);
    });
  });

  describe('validation', () => {
    it('throws error on missing parameter', async () => {
      try {
        // @ts-expect-error
        await evatr.checkSimple();
        assert.fail('Expected error was not thrown');
      } catch (err) {
        // @ts-ignore
        assert.match(err.message as string, /params are missing/);
      }
    });

    it('works with empty/missing param', async () => {
      const result = await evatr.checkQualified({
        ownVatNumber: 'DE115235681',
        validateVatNumber: 'CZ00177041',
        companyName: 'ŠKODA AUTO a.s.',
        city: '',
        zip: '293 01',
        street: 'tř. Václava Klementa 869',
      });

      assert.strictEqual(result.resultCity, undefined);
    });
  });

  describe('invalid VAT ID', () => {
    let result: evatr.ISimpleResult;

    before(async () => {
      result = await evatr.checkSimple({
        ownVatNumber: 'DE115235681',
        validateVatNumber: 'CZ01234567',
      });
    });

    it('returns an object', () => {
      assert.strictEqual(typeof result, 'object');
    });

    it('returns code 210', () => {
      assert.strictEqual(result.errorCode, 400);
    });

    it('returns readable error description', () => {
      assert.strictEqual(result.errorDescription, 'Die angegebene angefragte USt-IdNr. ist syntaktisch falsch.');
    });

    it('contains valid flag', () => {
      assert.strictEqual(result.valid, false);
    });
  });
});

describe('error codes', () => {
  // The `errorDescription` assertions above compare the API response against
  // this package's own scraped copy of the status message list, so they cannot
  // notice the copy going stale. This one can: it is the only assertion that
  // reads the upstream list.
  //
  // Mutation-tested (2026-09-05): adding a status the endpoint does not return,
  // removing one it does, and altering a `meldung` each turn this test red on
  // its own, leaving every other test green.
  it('table is in sync with the upstream status message list', async () => {
    const response = await fetch(statusMessagesUrl);
    assert.ok(response.ok, `Upstream request failed with status ${response.status}`);
    const upstream = (await response.json()) as evatr.ErrorCodeEntry[];

    const byStatus = (a: evatr.ErrorCodeEntry, b: evatr.ErrorCodeEntry) => a.status.localeCompare(b.status);
    assert.deepStrictEqual(
      [...evatr.errorCodes].sort(byStatus),
      [...upstream].sort(byStatus),
      'lib/error-codes.ts is out of date — run `pnpm run scrape-error-codes`',
    );
  });
});

describe('result types', () => {
  it('exposes the result letters at runtime', () => {
    assert.deepStrictEqual([...evatr.resultTypes], ['A', 'B', 'C', 'D']);
  });

  // Deliberate: the result letters are a closed set defined by the service, so
  // an unknown one means the API changed in a way this package cannot describe.
  // Failing loudly is preferred over returning a plausible-looking result.
  it('throws on a result letter outside `resultTypes`', async () => {
    const realFetch = globalThis.fetch;
    globalThis.fetch = () =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            id: '0123456789abcdef',
            anfrageZeitpunkt: '2026-09-05T18:33:04.392335063+02:00',
            status: 'evatr-0000',
            ergFirmenname: 'E',
            ergOrt: 'A',
            ergPlz: 'A',
            ergStrasse: 'A',
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
      );
    try {
      await assert.rejects(
        evatr.checkQualified({
          ownVatNumber: 'DE115235681',
          validateVatNumber: 'CZ00177041',
          companyName: 'ŠKODA AUTO a.s.',
          city: 'Mlada Boleslav',
        }),
        /Unexpected result type: E/,
      );
    } finally {
      globalThis.fetch = realFetch;
    }
  });
});

describe('immutability of the exported data', () => {
  // Both lists are shared with the internal lookups, so a consumer mutating
  // one would change later results. `readonly` is erased at runtime, which is
  // why these are frozen rather than merely typed as immutable.
  it('freezes `resultTypes` against mutation', () => {
    assert.ok(Object.isFrozen(evatr.resultTypes));
    assert.throws(() => (evatr.resultTypes as ResultType[]).push('A'), TypeError);
    assert.deepStrictEqual([...evatr.resultTypes], ['A', 'B', 'C', 'D']);
  });

  it('freezes `errorCodes` and each of its entries', () => {
    assert.ok(Object.isFrozen(evatr.errorCodes));
    assert.ok(
      evatr.errorCodes.every((entry) => Object.isFrozen(entry)),
      'every entry must be frozen, not just the array',
    );

    const entry = evatr.errorCodes.find((e) => e.status === 'evatr-0000');
    assert.ok(entry);
    const original = entry.meldung;
    assert.throws(() => ((entry as evatr.ErrorCodeEntry).meldung = 'mutated'), TypeError);
    assert.strictEqual(entry.meldung, original);
  });
});

describe('request failures', () => {
  // The doc comments promise that an error *response* is reported through
  // `errorCode`, while a failed *request* rejects. These pin that distinction.
  const params = { ownVatNumber: 'DE115235681', validateVatNumber: 'CZ00177041' };

  const withFetch = async (impl: typeof globalThis.fetch, run: () => Promise<void>) => {
    const realFetch = globalThis.fetch;
    globalThis.fetch = impl;
    try {
      await run();
    } finally {
      globalThis.fetch = realFetch;
    }
  };

  it('rejects when the request never completes', async () => {
    await withFetch(
      () => Promise.reject(new TypeError('fetch failed')),
      () => assert.rejects(evatr.checkSimple(params), /fetch failed/),
    );
  });

  it('rejects when the response body is not valid JSON', async () => {
    await withFetch(
      () => Promise.resolve(new Response('<html>502 Bad Gateway</html>', { status: 502 })),
      () => assert.rejects(evatr.checkSimple(params), SyntaxError),
    );
  });

  it('reports an error response through `errorCode`, without throwing', async () => {
    await withFetch(
      () =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              id: '0123456789abcdef',
              anfrageZeitpunkt: '2026-09-05T18:33:04.392335063+02:00',
              status: 'evatr-0005',
            }),
            { status: 400, headers: { 'content-type': 'application/json' } },
          ),
        ),
      async () => {
        const result = await evatr.checkSimple(params);
        assert.strictEqual(result.errorCode, 400);
        assert.strictEqual(result.valid, false);
        assert.strictEqual(result.errorDescription, 'Die angegebene angefragte USt-IdNr. ist syntaktisch falsch.');
      },
    );
  });

  // Both of these used to surface as a bare `TypeError: Cannot read
  // properties of ... (reading ...)` from wherever the missing field was
  // first touched -- true, and no help in working out what answered.
  it('rejects with a described error when the body is JSON but not an object', async () => {
    await withFetch(
      () => Promise.resolve(new Response('null', { status: 500, headers: { 'content-type': 'application/json' } })),
      () =>
        assert.rejects(evatr.checkSimple(params), {
          name: 'Error',
          message: 'Expected the service to answer with a JSON object, but got null',
        }),
    );
  });

  it('rejects with a described error when the body is an object without the timestamp', async () => {
    await withFetch(
      () =>
        Promise.resolve(
          new Response(JSON.stringify({ message: 'Forbidden' }), {
            status: 403,
            headers: { 'content-type': 'application/json' },
          }),
        ),
      () => assert.rejects(evatr.checkSimple(params), /Expected a timestamp such as 2025-09-22T18:33:04/),
    );
  });
});
