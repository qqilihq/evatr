import { ErrorCodeEntry, errorCodes } from './error-codes';

export interface ISimpleParams {
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

export interface IQualifiedResult extends ISimpleResult {
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

/**
 * - `A` - match
 * - `B` - no match
 * - `C` - not queried
 * - `D` - not returned
 */
type ResultType = 'A' | 'B' | 'C' | 'D';

class ResultTypeValue {
  // https://evatr.bff-online.de/eVatR/xmlrpc/aufbau
  static readonly MATCH = new ResultTypeValue('A', 'stimmt überein');
  static readonly NO_MATCH = new ResultTypeValue('B', 'stimmt nicht überein');
  static readonly NOT_QUERIED = new ResultTypeValue('C', 'nicht angefragt');
  static readonly NOT_RETURNED = new ResultTypeValue('D', 'vom EU-Mitgliedsstaat nicht mitgeteilt');
  private static readonly _ALL = [this.MATCH, this.NO_MATCH, this.NOT_QUERIED, this.NOT_RETURNED];

  private constructor(
    readonly letter: ResultType,
    readonly description: string,
  ) {}

  static getResultType(value: string | undefined): ResultTypeValue | undefined {
    if (typeof value !== 'string') {
      return undefined;
    }
    const result = this._ALL.find((r) => r.letter === value);
    if (!result) {
      throw new Error(`Unexpected result type: ${value}`);
    }
    return result;
  }
}

/**
 * Simple VAT number check. The “simple” check only verifies
 * the VAT number, but does *not* match it against additional
 * data such as company name or address. For this, use this
 * `checkQualified` function instead.
 *
 * The function will *not* throw if the check fails, either e.g.
 * due to an invalid VAT number or due to the service being
 * unavailable. Check the `errorCode` property of the response.
 *
 * An `errorCode` of `4xx` indicates invalid data.
 *
 * An `errorCode` of `5xx` indicates a server issue - in this
 * case it makes sense to retry the request later.
 */
export async function checkSimple(params: ISimpleParams): Promise<ISimpleResult> {
  return retrieveJson(params, false);
}

/** Qualified VAT number check. The “qualified” check
 * verifies the VAT number and matches it against additional
 * data such as company name or address.
 *
 * The function will *not* throw if the check fails, either e.g.
 * due to an invalid VAT number or due to the service being
 * unavailable. Check the `errorCode` property of the response.
 *
 * An `errorCode` of `4xx` indicates invalid data.
 *
 * An `errorCode` of `5xx` indicates a server issue - in this
 * case it makes sense to retry the request later.
 */
export async function checkQualified(params: IQualifiedParams): Promise<IQualifiedResult> {
  return retrieveJson(params, true);
}

// https://www.bzst.de/DE/Unternehmen/Identifikationsnummern/Umsatzsteuer-Identifikationsnummer/AuslaendischeUSt-IdNr/auslaendische_ust_idnr_node.html#js-toc-entry2

function retrieveJson(params: ISimpleParams, qualified?: false): Promise<ISimpleResult>;
function retrieveJson(params: IQualifiedParams, qualified: true): Promise<IQualifiedResult>;
async function retrieveJson(
  params: ISimpleParams | IQualifiedParams,
  qualified?: boolean,
): Promise<ISimpleResult | IQualifiedResult> {
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
  const simpleResult: ISimpleResult = {
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const resultName = ResultTypeValue.getResultType(json.ergFirmenname);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const resultCity = ResultTypeValue.getResultType(json.ergOrt);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const resultZip = ResultTypeValue.getResultType(json.ergPlz);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const resultStreet = ResultTypeValue.getResultType(json.ergStrasse);
    const qualifiedResult: IQualifiedResult = {
      ...simpleResult,
      companyName: qualifiedParams.companyName,
      city: qualifiedParams.city,
      zip: qualifiedParams.zip,
      street: qualifiedParams.street,
      resultName: resultName?.letter,
      resultCity: resultCity?.letter,
      resultZip: resultZip?.letter,
      resultStreet: resultStreet?.letter,
      resultNameDescription: resultName?.description,
      resultCityDescription: resultCity?.description,
      resultZipDescription: resultZip?.description,
      resultStreetDescription: resultStreet?.description,
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

function getErrorDescriptionJson(status: string): ErrorCodeEntry | undefined {
  return errorCodes.find((errorCode) => errorCode.status === status);
}
