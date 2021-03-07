import expect = require('expect.js');
import * as evatr from '../lib/index';
import moment from 'moment-timezone';

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

    it('returns date and time', () => {
      expect(result.date).to.be.a('string');
      expect(result.time).to.be.a('string');
    });

    it('returns plausible date and time', () => {
      const date = moment.tz(result.date + ' ' + result.time, 'DD.MM.YYYY HH:mm', 'Europe/Berlin');
      const diff = moment().diff(date, 'm', true);
      expect(diff).to.be.lessThan(5);
    });

    it('returns own VAT number', () => {
      expect(result.ownVatNumber).to.eql('DE115235681');
    });

    it('returns validated VAT number', () => {
      expect(result.validatedVatNumber).to.eql('CZ00177041');
    });

    it('does not include raw xml', () => {
      expect(result.rawXml).to.be(undefined);
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

    it('returns date and time', () => {
      expect(result.date).to.be.a('string');
      expect(result.time).to.be.a('string');
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

    it('returns empty validFrom and validUntil', () => {
      expect(result.validFrom).to.eql('');
      expect(result.validUntil).to.eql('');
    });

    it('returns false for print', () => {
      expect(result.print).to.be(false);
    });
  });

  it('includes raw XML if requested', async () => {
    const result = await evatr.checkSimple({
      ownVatNumber: 'DE115235681',
      validateVatNumber: 'CZ00177041',
      includeRawXml: true,
    });
    expect(result.rawXml).to.be.a('string');
  });

  describe('validation', () => {
    it('throws error on missing parameter', () => {
      expect(evatr.checkSimple)
        .withArgs()
        .to.throwError(/params are missing/);
    });
  });
});
