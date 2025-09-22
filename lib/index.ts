import { XMLParser } from 'fast-xml-parser';
import querystring from 'querystring';
import { ErrorCodeEntry, errorCodes } from './error-codes-json';
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

export interface ISimpleJsonResult {
  rawJson?: unknown;
  /** `id` in response. */
  id: string;
  /** `anfrageZeitpunkt` in response. */
  dateTime: string;
  /** e.g. `22.09.2025` @deprecated Use `dateTime` instead. */
  date: string;
  /** e.g. `17:38:43` @deprecated Use `dateTime` instead. */
  time: string;
  /** e.g. `evatr-0000`. */
  status: string;
  /** (note) Semantics has changed from XML to JSON API. */
  errorCode: number;
  /** Human-readable (well, German) error description.
   * The text is extracted from [here](https://api.evatr.vies.bzst.de/v1/info/statusmeldungen). */
  errorDescription?: string;
  ownVatNumber: string;
  validatedVatNumber: string;
  /** `true` if the given data was valid (i.e. status is `evatr-0000`). */
  valid: boolean;
}

export interface IQualifiedJsonResult extends ISimpleJsonResult {
  companyName?: string;
  city?: string;
  zip?: string;
  street?: string;
  /** `ergFirmenname` in response. */
  resultName?: ResultType;
  /** `ergOrt` in response. */
  resultCity?: ResultType;
  /** `ergPlz` in response. */
  resultZip?: ResultType;
  /** `ergStrasse` in response. */
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

/** @deprecated */
export interface ISimpleResult {
  rawXml?: string;
  /** e.g. `22.09.2025` */
  date: string;
  /** e.g. `17:38:43` */
  time: string;
  /** e.g. 200 */
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

/** @deprecated */
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

/** @deprecated Use retrieveJson instead */
export async function checkSimple(params: ISimpleParams): Promise<ISimpleResult> {
  const xml = await retrieveXml(params, false);
  return parseXmlResponse(xml, false, !params.includeRawXml);
}

/** @deprecated Use retrieveJson instead */
export async function checkQualified(params: IQualifiedParams): Promise<IQualifiedResult> {
  const xml = await retrieveXml(params, true);
  return parseXmlResponse(xml, true, !params.includeRawXml);
}

/** @deprecated */
async function retrieveXml(params: ISimpleParams | IQualifiedParams, qualified?: boolean): Promise<string> {
  if (!params) {
    throw new Error('params are missing');
  }

  let query: querystring.ParsedUrlQueryInput = {
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
  const result = await fetch(requestUrl);
  return await result.text();
}

// https://www.bzst.de/DE/Unternehmen/Identifikationsnummern/Umsatzsteuer-Identifikationsnummer/AuslaendischeUSt-IdNr/auslaendische_ust_idnr_node.html#js-toc-entry2

// {"id":"c4e53ec694b7c2a6","anfrageZeitpunkt":"2025-09-22T18:33:04.392335063+02:00","status":"evatr-0000"}
// {"id":"5b1f4b5f03c27585","anfrageZeitpunkt":"2025-09-22T18:33:04.564553064+02:00","status":"evatr-0000","ergFirmenname":"A","ergStrasse":"A","ergPlz":"A","ergOrt":"A"}

export function retrieveJson(params: ISimpleParams, qualified?: false): Promise<ISimpleJsonResult>;
export function retrieveJson(params: IQualifiedParams, qualified: true): Promise<IQualifiedJsonResult>;
export async function retrieveJson(
  params: ISimpleParams | IQualifiedParams,
  qualified?: boolean,
): Promise<ISimpleJsonResult | IQualifiedJsonResult> {
  if (!params) {
    throw new Error('params are missing');
  }

  let query: Record<string, string | undefined> = {
    anfragendeUstid: params.ownVatNumber,
    angefragteUstid: params.validateVatNumber,
  };

  if (qualified) {
    const qualifiedParams = params as IQualifiedParams;
    query = {
      ...query,
      firmenname: qualifiedParams.companyName,
      strasse: qualifiedParams.street,
      plz: qualifiedParams.zip,
      ort: qualifiedParams.city,
    };
  }
  const result = await fetch('https://api.evatr.vies.bzst.de/app/v1/abfrage', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(query),
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json: any = await result.json();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const errorDescription = getErrorDescriptionJson(json.status);
  const simpleResult: ISimpleJsonResult = {
    rawJson: json,
    id: json.id,
    dateTime: json.anfrageZeitpunkt,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    ...parseDateAndTime(json.anfrageZeitpunkt),
    errorCode: result.status,
    errorDescription: errorDescription?.meldung,
    status: json.status,
    ownVatNumber: params.ownVatNumber,
    validatedVatNumber: params.validateVatNumber,
    valid: json.status === 'evatr-0000',
  };
  if (qualified) {
    const qualifiedParams = params as IQualifiedParams;
    const qualifiedResult: IQualifiedJsonResult = {
      ...simpleResult,
      companyName: qualifiedParams.companyName,
      city: qualifiedParams.city,
      zip: qualifiedParams.zip,
      street: qualifiedParams.street,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      resultName: getResultType(json.ergFirmenname),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      resultCity: getResultType(json.ergOrt),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      resultZip: getResultType(json.ergPlz),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      resultStreet: getResultType(json.ergStrasse),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      resultNameDescription: getResultDescription(getResultType(json.ergFirmenname)),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      resultCityDescription: getResultDescription(getResultType(json.ergOrt)),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      resultZipDescription: getResultDescription(getResultType(json.ergPlz)),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      resultStreetDescription: getResultDescription(getResultType(json.ergStrasse)),
    };
    return qualifiedResult;
  } else {
    return simpleResult;
  }
}

function parseDateAndTime(value: string): { date: string; time: string } {
  // 2025-09-22T18:33:04.392335063+02:00
  const [date, time] = value.replace(/\..*/, '').split('T');
  const dateFixed = date.split('-').reverse().join('.');
  return { date: dateFixed, time };
}

export function parseXmlResponse(rawXml: string, qualified: true, omitRawXml?: boolean): IQualifiedResult;
export function parseXmlResponse(rawXml: string, qualified?: undefined | false, omitRawXml?: boolean): ISimpleResult;
export function parseXmlResponse(
  rawXml: string,
  qualified?: boolean,
  omitRawXml?: boolean,
): ISimpleResult | IQualifiedResult {
  const data = new XMLParser({ numberParseOptions: { hex: false, leadingZeros: false, skipLike: /.*/ } }).parse(rawXml);
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

  const result = Object.values(ResultType).find((v) => v.valueOf() === value);
  if (!result) {
    throw new Error(`Unexpected result type: ${value}`);
  }
  return result;
}

function getErrorDescription(code: number): string | undefined {
  const result = errorCodesJson.find((entry) => entry.code === code);
  return result?.description;
}

function getErrorDescriptionJson(status: string): ErrorCodeEntry | undefined {
  return errorCodes.find((errorCode) => errorCode.status === status);
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
