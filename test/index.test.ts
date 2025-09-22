import expect = require('expect.js');
import * as evatr from '../lib/index';
import moment from 'moment-timezone';

// breaking changes:
// - remove rawXml
// - remove validFrom
// - remove validUntil

describe('evatr VAT validation', function () {
  this.timeout(10 * 1000);

  describe('simple', () => {
    let result: evatr.ISimpleResult;

    before(async () => {
      result = await evatr.checkSimple({
        ownVatNumber: 'DE115235681',
        validateVatNumber: 'CZ00177041',
      });
    });

    it('returns an object', () => {
      expect(result).to.be.an('object');
    });

    it('has an ID', () => {
      expect(result.id).to.match(/^[0-9a-f]{16}$/);
    });

    it('returns date and time', () => {
      expect(result.dateTime).to.be.a('string');
      expect(result.date).to.be.a('string');
      expect(result.time).to.be.a('string');
      expect(result.dateTime).to.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+\+\d{2}:\d{2}$/);
      expect(result.date).to.match(/^\d{2}.\d{2}.\d{4}$/);
      expect(result.time).to.match(/^\d{2}:\d{2}:\d{2}$/);
    });

    it('returns plausible date and time', () => {
      const date = moment.tz(result.date + ' ' + result.time, 'DD.MM.YYYY HH:mm', 'Europe/Berlin');
      const diff = moment().diff(date, 'm', true);
      expect(diff).to.be.lessThan(5);
    });

    it('returns code 200', () => {
      expect(result.errorCode).to.eql(200);
    });

    it('returns own VAT number', () => {
      expect(result.ownVatNumber).to.eql('DE115235681');
    });

    it('returns validated VAT number', () => {
      expect(result.validatedVatNumber).to.eql('CZ00177041');
    });

    it('returns readable error description', () => {
      expect(result.errorDescription).to.eql('Die angefragte Ust-IdNr. ist zum Anfragezeitpunkt gültig.');
    });

    it('contains status', () => {
      expect(result.status).to.eql('evatr-0000');
    });

    it('contains valid flag', () => {
      expect(result.valid).to.eql(true);
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
      expect(result).to.be.an('object');
    });

    it('has an ID', () => {
      expect(result.id).to.match(/^[0-9a-f]{16}$/);
    });

    it('returns date and time', () => {
      expect(result.dateTime).to.be.a('string');
      expect(result.date).to.be.a('string');
      expect(result.time).to.be.a('string');
      expect(result.dateTime).to.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+\+\d{2}:\d{2}$/);
      expect(result.date).to.match(/^\d{2}.\d{2}.\d{4}$/);
      expect(result.time).to.match(/^\d{2}:\d{2}:\d{2}$/);
    });

    it('returns plausible date and time', () => {
      const date = moment.tz(result.date + ' ' + result.time, 'DD.MM.YYYY HH:mm', 'Europe/Berlin');
      const diff = moment().diff(date, 'm', true);
      expect(diff).to.be.lessThan(5);
    });

    it('returns code 200', () => {
      expect(result.errorCode).to.eql(200);
    });

    it('returns own VAT number', () => {
      expect(result.ownVatNumber).to.eql('DE115235681');
    });

    it('returns validated VAT number', () => {
      expect(result.validatedVatNumber).to.eql('CZ00177041');
    });

    it('returns company name', () => {
      expect(result.companyName).to.eql('ŠKODA AUTO a.s.');
    });

    it('returns city', () => {
      expect(result.city).to.eql('Mlada Boleslav');
    });

    it('returns zip', () => {
      expect(result.zip).to.eql('293 01');
    });

    it('returns street', () => {
      expect(result.street).to.eql('tř. Václava Klementa 869');
    });

    it('returns match for name, city, zip, street', () => {
      expect(result.resultName).to.eql(evatr.ResultType.MATCH);
      expect(result.resultCity).to.eql(evatr.ResultType.MATCH);
      expect(result.resultZip).to.eql(evatr.ResultType.MATCH);
      expect(result.resultStreet).to.eql(evatr.ResultType.MATCH);
    });

    it('maps result to German', () => {
      expect(result.resultNameDescription).to.eql('stimmt überein');
      expect(result.resultCityDescription).to.eql('stimmt überein');
      expect(result.resultZipDescription).to.eql('stimmt überein');
      expect(result.resultStreetDescription).to.eql('stimmt überein');
    });

    it('returns readable error description', () => {
      expect(result.errorDescription).to.eql('Die angefragte Ust-IdNr. ist zum Anfragezeitpunkt gültig.');
    });

    it('contains status', () => {
      expect(result.status).to.eql('evatr-0000');
    });

    it('contains valid flag', () => {
      expect(result.valid).to.eql(true);
    });
  });

  describe('validation', () => {
    it('throws error on missing parameter', async () => {
      try {
        // @ts-expect-error
        await evatr.checkSimple();
        expect().fail();
      } catch (err) {
        // @ts-ignore
        expect(err.message).to.match(/params are missing/);
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

      expect(result.resultCity).to.eql(undefined);
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
      expect(result).to.be.an('object');
    });

    it('returns code 210', () => {
      expect(result.errorCode).to.eql(400);
    });

    it('returns readable error description', () => {
      expect(result.errorDescription).to.eql('Die angegebene angefragte Ust-IdNr. ist syntaktisch falsch.');
    });

    it('contains valid flag', () => {
      expect(result.valid).to.eql(false);
    });
  });
});
