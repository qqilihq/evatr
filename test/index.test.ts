/* eslint-disable @typescript-eslint/no-floating-promises */
import * as evatr from '../lib/index';
import moment from 'moment-timezone';
import assert from 'node:assert';
import { describe, it, before } from 'node:test';
import { ErrorCodeEntry, errorCodes } from '../lib/error-codes';

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
    const upstream = (await response.json()) as ErrorCodeEntry[];

    const byStatus = (a: ErrorCodeEntry, b: ErrorCodeEntry) => a.status.localeCompare(b.status);
    assert.deepStrictEqual(
      [...errorCodes].sort(byStatus),
      [...upstream].sort(byStatus),
      'lib/error-codes.ts is out of date — run `pnpm run scrape-error-codes`',
    );
  });
});
