import { describe, expect, it, beforeAll } from 'vitest';
import * as evatr from '../lib/index';
import moment from 'moment-timezone';

describe(
  'evatr VAT validation',
  function () {
    describe('simple', () => {
      let result: evatr.ISimpleResult;

      beforeAll(async () => {
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

      it('returns code 200', () => {
        expect(result.errorCode).to.eql(200);
      });

      it('returns own VAT number', () => {
        expect(result.ownVatNumber).to.eql('DE115235681');
      });

      it('returns validated VAT number', () => {
        expect(result.validatedVatNumber).to.eql('CZ00177041');
      });

      it('does not include raw xml', () => {
        expect(result.rawXml).to.be.undefined;
      });

      it('returns readable error description', () => {
        expect(result.errorDescription).to.eql('Die angefragte USt-IdNr. ist gültig.');
      });

      it('contains valid flag', () => {
        expect(result.valid).to.eql(true);
      });
    });

    describe('qualified', () => {
      let result: evatr.IQualifiedResult;

      beforeAll(async () => {
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

      it('maps result to German', () => {
        expect(result.resultNameDescription).to.eql('stimmt überein');
        expect(result.resultCityDescription).to.eql('stimmt überein');
        expect(result.resultZipDescription).to.eql('stimmt überein');
        expect(result.resultStreetDescription).to.eql('stimmt überein');
      });

      it('returns empty validFrom and validUntil', () => {
        expect(result.validFrom).to.eql(undefined);
        expect(result.validUntil).to.eql(undefined);
      });

      it('returns readable error description', () => {
        expect(result.errorDescription).to.eql('Die angefragte USt-IdNr. ist gültig.');
      });

      it('contains valid flag', () => {
        expect(result.valid).to.eql(true);
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
      it('throws error on missing parameter', async () => {
        try {
          // @ts-expect-error
          await evatr.checkSimple();
          expect.fail();
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

      beforeAll(async () => {
        result = await evatr.checkSimple({
          ownVatNumber: 'DE115235681',
          validateVatNumber: 'CZ01234567',
        });
      });

      it('returns an object', () => {
        expect(result).to.be.an('object');
      });

      it('returns code 210', () => {
        expect(result.errorCode).to.eql(210);
      });

      it('returns readable error description', () => {
        expect(result.errorDescription).to.eql(
          'Die angefragte USt-IdNr. ist ungültig. Sie entspricht nicht den Prüfziffernregeln die für diesen EU-Mitgliedstaat gelten.'
        );
      });

      it('contains valid flag', () => {
        expect(result.valid).to.eql(false);
      });
    });

    describe('parse XML', () => {
      it('parses simple', () => {
        const rawXml =
          '<params>\n' +
          '<param>\n' +
          '<value><array><data>\n' +
          '<value><string>UstId_1</string></value>\n' +
          '<value><string>DE115235681</string></value>\n' +
          '</data></array></value>\n' +
          '</param>\n' +
          '<param>\n' +
          '<value><array><data>\n' +
          '<value><string>ErrorCode</string></value>\n' +
          '<value><string>200</string></value>\n' +
          '</data></array></value>\n' +
          '</param>\n' +
          '<param>\n' +
          '<value><array><data>\n' +
          '<value><string>UstId_2</string></value>\n' +
          '<value><string>CZ00177041</string></value>\n' +
          '</data></array></value>\n' +
          '</param>\n' +
          '<param>\n' +
          '<value><array><data>\n' +
          '<value><string>Druck</string></value>\n' +
          '<value><string>nein</string></value>\n' +
          '</data></array></value>\n' +
          '</param>\n' +
          '<param>\n' +
          '<value><array><data>\n' +
          '<value><string>Erg_PLZ</string></value>\n' +
          '<value><string></string></value>\n' +
          '</data></array></value>\n' +
          '</param>\n' +
          '<param>\n' +
          '<value><array><data>\n' +
          '<value><string>Ort</string></value>\n' +
          '<value><string></string></value>\n' +
          '</data></array></value>\n' +
          '</param>\n' +
          '<param>\n' +
          '<value><array><data>\n' +
          '<value><string>Datum</string></value>\n' +
          '<value><string>06.02.2023</string></value>\n' +
          '</data></array></value>\n' +
          '</param>\n' +
          '<param>\n' +
          '<value><array><data>\n' +
          '<value><string>PLZ</string></value>\n' +
          '<value><string></string></value>\n' +
          '</data></array></value>\n' +
          '</param>\n' +
          '<param>\n' +
          '<value><array><data>\n' +
          '<value><string>Erg_Ort</string></value>\n' +
          '<value><string></string></value>\n' +
          '</data></array></value>\n' +
          '</param>\n' +
          '<param>\n' +
          '<value><array><data>\n' +
          '<value><string>Uhrzeit</string></value>\n' +
          '<value><string>19:16:24</string></value>\n' +
          '</data></array></value>\n' +
          '</param>\n' +
          '<param>\n' +
          '<value><array><data>\n' +
          '<value><string>Erg_Name</string></value>\n' +
          '<value><string></string></value>\n' +
          '</data></array></value>\n' +
          '</param>\n' +
          '<param>\n' +
          '<value><array><data>\n' +
          '<value><string>Gueltig_ab</string></value>\n' +
          '<value><string></string></value>\n' +
          '</data></array></value>\n' +
          '</param>\n' +
          '<param>\n' +
          '<value><array><data>\n' +
          '<value><string>Gueltig_bis</string></value>\n' +
          '<value><string></string></value>\n' +
          '</data></array></value>\n' +
          '</param>\n' +
          '<param>\n' +
          '<value><array><data>\n' +
          '<value><string>Strasse</string></value>\n' +
          '<value><string></string></value>\n' +
          '</data></array></value>\n' +
          '</param>\n' +
          '<param>\n' +
          '<value><array><data>\n' +
          '<value><string>Firmenname</string></value>\n' +
          '<value><string></string></value>\n' +
          '</data></array></value>\n' +
          '</param>\n' +
          '<param>\n' +
          '<value><array><data>\n' +
          '<value><string>Erg_Str</string></value>\n' +
          '<value><string></string></value>\n' +
          '</data></array></value>\n' +
          '</param>\n' +
          '</params>\n';
        const parsedResponse = evatr.parseXmlResponse(rawXml);
        expect(typeof parsedResponse.rawXml).to.eql('string');
        expect(parsedResponse.date).to.eql('06.02.2023');
        expect(parsedResponse.time).to.eql('19:16:24');
        expect(parsedResponse.errorCode).to.eql(200);
        expect(parsedResponse.errorDescription).to.eql('Die angefragte USt-IdNr. ist gültig.');
        expect(parsedResponse.ownVatNumber).to.eql('DE115235681');
        expect(parsedResponse.validatedVatNumber).to.eql('CZ00177041');
        expect(parsedResponse.validFrom).to.eql(undefined);
        expect(parsedResponse.validUntil).to.eql(undefined);
        expect(parsedResponse.valid).to.eql(true);
      });
      it('parses full', () => {
        const rawXml =
          '<params>\n' +
          '<param>\n' +
          '<value><array><data>\n' +
          '<value><string>UstId_1</string></value>\n' +
          '<value><string>DE115235681</string></value>\n' +
          '</data></array></value>\n' +
          '</param>\n' +
          '<param>\n' +
          '<value><array><data>\n' +
          '<value><string>ErrorCode</string></value>\n' +
          '<value><string>200</string></value>\n' +
          '</data></array></value>\n' +
          '</param>\n' +
          '<param>\n' +
          '<value><array><data>\n' +
          '<value><string>UstId_2</string></value>\n' +
          '<value><string>CZ00177041</string></value>\n' +
          '</data></array></value>\n' +
          '</param>\n' +
          '<param>\n' +
          '<value><array><data>\n' +
          '<value><string>Druck</string></value>\n' +
          '<value><string>nein</string></value>\n' +
          '</data></array></value>\n' +
          '</param>\n' +
          '<param>\n' +
          '<value><array><data>\n' +
          '<value><string>Erg_PLZ</string></value>\n' +
          '<value><string>A</string></value>\n' +
          '</data></array></value>\n' +
          '</param>\n' +
          '<param>\n' +
          '<value><array><data>\n' +
          '<value><string>Ort</string></value>\n' +
          '<value><string>Mlada Boleslav</string></value>\n' +
          '</data></array></value>\n' +
          '</param>\n' +
          '<param>\n' +
          '<value><array><data>\n' +
          '<value><string>Datum</string></value>\n' +
          '<value><string>06.02.2023</string></value>\n' +
          '</data></array></value>\n' +
          '</param>\n' +
          '<param>\n' +
          '<value><array><data>\n' +
          '<value><string>PLZ</string></value>\n' +
          '<value><string>293 01</string></value>\n' +
          '</data></array></value>\n' +
          '</param>\n' +
          '<param>\n' +
          '<value><array><data>\n' +
          '<value><string>Erg_Ort</string></value>\n' +
          '<value><string>A</string></value>\n' +
          '</data></array></value>\n' +
          '</param>\n' +
          '<param>\n' +
          '<value><array><data>\n' +
          '<value><string>Uhrzeit</string></value>\n' +
          '<value><string>19:22:08</string></value>\n' +
          '</data></array></value>\n' +
          '</param>\n' +
          '<param>\n' +
          '<value><array><data>\n' +
          '<value><string>Erg_Name</string></value>\n' +
          '<value><string>A</string></value>\n' +
          '</data></array></value>\n' +
          '</param>\n' +
          '<param>\n' +
          '<value><array><data>\n' +
          '<value><string>Gueltig_ab</string></value>\n' +
          '<value><string></string></value>\n' +
          '</data></array></value>\n' +
          '</param>\n' +
          '<param>\n' +
          '<value><array><data>\n' +
          '<value><string>Gueltig_bis</string></value>\n' +
          '<value><string></string></value>\n' +
          '</data></array></value>\n' +
          '</param>\n' +
          '<param>\n' +
          '<value><array><data>\n' +
          '<value><string>Strasse</string></value>\n' +
          '<value><string>tř. Václava Klementa 869</string></value>\n' +
          '</data></array></value>\n' +
          '</param>\n' +
          '<param>\n' +
          '<value><array><data>\n' +
          '<value><string>Firmenname</string></value>\n' +
          '<value><string>ŠKODA AUTO a.s.</string></value>\n' +
          '</data></array></value>\n' +
          '</param>\n' +
          '<param>\n' +
          '<value><array><data>\n' +
          '<value><string>Erg_Str</string></value>\n' +
          '<value><string>A</string></value>\n' +
          '</data></array></value>\n' +
          '</param>\n' +
          '</params>\n';
        const parsedResponse = evatr.parseXmlResponse(rawXml, true);
        expect(typeof parsedResponse.rawXml).to.eql('string');
        expect(parsedResponse.date).to.eql('06.02.2023');
        expect(parsedResponse.time).to.eql('19:22:08');
        expect(parsedResponse.errorCode).to.eql(200);
        expect(parsedResponse.errorDescription).to.eql('Die angefragte USt-IdNr. ist gültig.');
        expect(parsedResponse.ownVatNumber).to.eql('DE115235681');
        expect(parsedResponse.validatedVatNumber).to.eql('CZ00177041');
        expect(parsedResponse.validFrom).to.eql(undefined);
        expect(parsedResponse.validUntil).to.eql(undefined);
        expect(parsedResponse.valid).to.eql(true);
        expect(parsedResponse.companyName).to.eql('ŠKODA AUTO a.s.');
        expect(parsedResponse.city).to.eql('Mlada Boleslav');
        expect(parsedResponse.zip).to.eql('293 01');
        expect(parsedResponse.street).to.eql('tř. Václava Klementa 869');
        expect(parsedResponse.resultName).to.eql('A');
        expect(parsedResponse.resultNameDescription).to.eql('stimmt überein');
        expect(parsedResponse.resultCity).to.eql('A');
        expect(parsedResponse.resultCityDescription).to.eql('stimmt überein');
        expect(parsedResponse.resultZip).to.eql('A');
        expect(parsedResponse.resultZipDescription).to.eql('stimmt überein');
        expect(parsedResponse.resultStreet).to.eql('A');
        expect(parsedResponse.resultStreetDescription).to.eql('stimmt überein');
      });
    });
  },
  10 * 1000 /* timeout */
);
