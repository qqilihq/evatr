import { ErrorCodeEntry, errorCodes } from './error-codes-json';

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

export enum ResultType {
  MATCH = 'A',
  NO_MATCH = 'B',
  NOT_QUERIED = 'C',
  NOT_RETURNED = 'D',
}

export async function checkSimple(params: ISimpleParams): Promise<ISimpleResult> {
  return retrieveJson(params, false);
}

export async function checkQualified(params: IQualifiedParams): Promise<IQualifiedResult> {
  return retrieveJson(params, true);
}

// https://www.bzst.de/DE/Unternehmen/Identifikationsnummern/Umsatzsteuer-Identifikationsnummer/AuslaendischeUSt-IdNr/auslaendische_ust_idnr_node.html#js-toc-entry2

// {"id":"c4e53ec694b7c2a6","anfrageZeitpunkt":"2025-09-22T18:33:04.392335063+02:00","status":"evatr-0000"}
// {"id":"5b1f4b5f03c27585","anfrageZeitpunkt":"2025-09-22T18:33:04.564553064+02:00","status":"evatr-0000","ergFirmenname":"A","ergStrasse":"A","ergPlz":"A","ergOrt":"A"}

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
    const qualifiedResult: IQualifiedResult = {
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

function getResultType(value: string | undefined): ResultType | undefined {
  if (!value) return undefined;

  const result = Object.values(ResultType).find((v) => v.valueOf() === value);
  if (!result) {
    throw new Error(`Unexpected result type: ${value}`);
  }
  return result;
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
