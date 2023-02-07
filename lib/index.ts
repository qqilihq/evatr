import superagent from 'superagent';
import xml2js from 'xml2js';
import { EnumValues } from 'enum-values';
import querystring from 'querystring';
import errorCodesJson from './error-codes.json';

export interface ISimpleParams {
  includeRawXml?: boolean;
  ownVatNumber: string;
  validateVatNumber: string;
}

export interface IQualifiedParams extends ISimpleParams {
  companyName: string;
  city: string;
  zip?: string;
  street?: string;
}

export interface ISimpleResult {
  rawXml?: string;
  date: string;
  time: string;
  errorCode: number;
  /** Human-readable (well, German) error description.
   * The text is extracted from [here](https://evatr.bff-online.de/eVatR/xmlrpc/codes). */
  errorDescription?: string;
  ownVatNumber: string;
  validatedVatNumber: string;
  validFrom?: string;
  validUntil?: string;
  /** `true` if the given data was valid (i.e. error code is `200`). */
  valid: boolean;
}

export interface IQualifiedResult extends ISimpleResult {
  companyName?: string;
  city?: string;
  zip?: string;
  street?: string;
  resultName?: ResultType;
  resultCity?: ResultType;
  resultZip?: ResultType;
  resultStreet?: ResultType;
  /** Human-readable, German description for the name result.
   * The text is extrated from [here](https://evatr.bff-online.de/eVatR/xmlrpc/aufbau). */
  resultNameDescription?: string;
  /** Human-readable, German description for the city result.
   * The text is extrated from [here](https://evatr.bff-online.de/eVatR/xmlrpc/aufbau). */
  resultCityDescription?: string;
  /** Human-readable, German description for the zip result.
   * The text is extrated from [here](https://evatr.bff-online.de/eVatR/xmlrpc/aufbau). */
  resultZipDescription?: string;
  /** Human-readable, German description for the street result.
   * The text is extrated from [here](https://evatr.bff-online.de/eVatR/xmlrpc/aufbau). */
  resultStreetDescription?: string;
}

export enum ResultType {
  MATCH = 'A',
  NO_MATCH = 'B',
  NOT_QUERIED = 'C',
  NOT_RETURNED = 'D',
}

export async function checkSimple(params: ISimpleParams): Promise<ISimpleResult> {
  const xml = await retrieveXml(params, false);
  return await parseXmlResponse(xml, false, !params.includeRawXml);
}

export async function checkQualified(params: IQualifiedParams): Promise<IQualifiedResult> {
  const xml = await retrieveXml(params, true);
  return await parseXmlResponse(xml, true, !params.includeRawXml);
}

async function retrieveXml(params: ISimpleParams, qualified?: boolean): Promise<string> {
  if (!params) {
    throw new Error('params are missing');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = {
    UstId_1: params.ownVatNumber,
    UstId_2: params.validateVatNumber,
  };

  if (qualified) {
    const qualifiedParams = params as IQualifiedParams;
    query = {
      ...query,
      Firmenname: qualifiedParams.companyName,
      Ort: qualifiedParams.city,
      PLZ: qualifiedParams.zip,
      Strasse: qualifiedParams.street,
    };
  }

  const requestUrl = `https://evatr.bff-online.de/evatrRPC?${querystring.stringify(query)}`;
  const result = await superagent.get(requestUrl);
  return result.text;
}

export async function parseXmlResponse(
  rawXml: string,
  qualified: true,
  omitRawXml?: boolean
): Promise<IQualifiedResult>;
export async function parseXmlResponse(
  rawXml: string,
  qualified?: undefined | false,
  omitRawXml?: boolean
): Promise<ISimpleResult>;
export async function parseXmlResponse(
  rawXml: string,
  qualified?: boolean,
  omitRawXml?: boolean
): Promise<ISimpleResult | IQualifiedResult> {
  const data = await xml2js.parseStringPromise(rawXml, { explicitArray: false });
  const errorCode = parseInt(getRequiredValue(data, 'ErrorCode'), 10);

  const simpleResult: ISimpleResult = {
    date: getRequiredValue(data, 'Datum'),
    time: getRequiredValue(data, 'Uhrzeit'),
    errorCode,
    errorDescription: getErrorDescription(errorCode),
    ownVatNumber: getRequiredValue(data, 'UstId_1'),
    validatedVatNumber: getRequiredValue(data, 'UstId_2'),
    validFrom: getValue(data, 'Gueltig_ab'),
    validUntil: getValue(data, 'Gueltig_bis'),
    valid: errorCode === 200,
  };
  if (!omitRawXml) {
    simpleResult.rawXml = rawXml;
  }

  if (qualified) {
    const resultName = getResultType(getValue(data, 'Erg_Name'));
    const resultCity = getResultType(getValue(data, 'Erg_Ort'));
    const resultZip = getResultType(getValue(data, 'Erg_PLZ'));
    const resultStreet = getResultType(getValue(data, 'Erg_Str'));

    const qualifiedResult: IQualifiedResult = {
      ...simpleResult,
      companyName: getValue(data, 'Firmenname'),
      city: getValue(data, 'Ort'),
      zip: getValue(data, 'PLZ'),
      street: getValue(data, 'Strasse'),
      resultName,
      resultNameDescription: getResultDescription(resultName),
      resultCity,
      resultCityDescription: getResultDescription(resultCity),
      resultZip,
      resultZipDescription: getResultDescription(resultZip),
      resultStreet,
      resultStreetDescription: getResultDescription(resultStreet),
    };
    return qualifiedResult;
  } else {
    return simpleResult;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getRequiredValue(data: any, key: string): string {
  const value = getValue(data, key);
  if (typeof value === 'undefined') {
    throw new Error(`key ${key} is missing`);
  }
  return value;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getValue(data: any, key: string): string | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const temp = data.params?.param?.find((p: any) => p.value?.array?.data?.value?.[0]?.string === key);
  const value = temp?.value.array.data.value[1].string;
  if (typeof value === 'string' && value.length) {
    return value;
  }
  return undefined;
}

function getResultType(value: string | undefined): ResultType | undefined {
  if (!value) return undefined;

  if (EnumValues.getNameFromValue(ResultType, value)) {
    return value as ResultType;
  } else {
    throw new Error(`Unexpected result type: ${value}`);
  }
}

function getErrorDescription(code: number): string | undefined {
  const result = errorCodesJson.find((entry) => entry.code === code);
  return result?.description;
}

function getResultDescription(resultType: ResultType | undefined): string | undefined {
  // https://evatr.bff-online.de/eVatR/xmlrpc/aufbau
  switch (resultType) {
    case ResultType.MATCH:
      return 'stimmt überein';
    case ResultType.NO_MATCH:
      return 'stimmt nicht überein';
    case ResultType.NOT_QUERIED:
      return 'nicht angefragt';
    case ResultType.NOT_RETURNED:
      return 'vom EU-Mitgliedsstaat nicht mitgeteilt';
    default:
      return undefined;
  }
}

// CLI only when module is not require'd
if (require.main === module) {
  (async () => {
    const { default: minimist } = await import('minimist');
    // @ts-ignore -- no typing available
    const columnify = await import('columnify');
    const path = await import('path');
    // Get command line arguments
    const argv = minimist(process.argv.slice(2), { boolean: ['print'] });
    if (!argv['own'] || !argv['check']) {
      const args = {
        '--own': '(required) own German VAT number, e.g. “DE115235681”',
        '--check': '(required) foreign VAT number to check, e.g. “CZ00177041”',
        '--company': '(extended, required) company name with legal form',
        '--city': ' (extended, required) city',
        '--zip': '(extended, optional) zip code',
        '--street': '(extended, optional) street',
      };
      console.log(`Example: ${path.basename(__filename)} --own DE115235681 --check CZ00177041`);
      console.log('Params:');
      console.log(columnify(args, { columns: ['Arguments', 'Description'] }));
      process.exit(1);
    }
    const validationParams: ISimpleParams = {
      ownVatNumber: argv['own'],
      validateVatNumber: argv['check'],
    };
    let result;
    if (argv['company'] && argv['city']) {
      result = await checkQualified({
        ...validationParams,
        companyName: argv['company'],
        city: argv['city'],
        zip: argv['zip'],
        street: argv['street'],
      });
    } else {
      result = await checkSimple(validationParams);
    }
    console.log(JSON.stringify(result, null, 2));
  })().catch(() => {
    /* <°((((< */
  });
}
