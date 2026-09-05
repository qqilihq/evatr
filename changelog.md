# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Breaking

- Require NodeJS 22 — NodeJS 18 and 20 are both past end of life
- Deep imports such as `evatr/dist/error-codes` are no longer resolvable, as the package now declares an `exports` map — import `errorCodes` from the package root instead

### Added

- Export `ResultType`, the per-field result of a qualified check — it was already used by `IQualifiedResult` but was not exported, so it could not be named by consumers — and `resultTypes`, the same letters as a runtime list
- Export `errorCodes`, the BZSt status message table from which `errorDescription` is populated, and its `ErrorCodeEntry` type. It previously shipped in the tarball but was reachable only through a deep import

### Fixed

- Update the error code table, which had drifted from the BZSt list: eight messages now read `USt-IdNr.` where they read `Ust-IdNr.` before (`evatr-0000`, `-0003`, `-0004`, `-0005`, `-0006`, `-2005`, `-2006`, `-2008`). This affects the `errorDescription` of a result; the `status` values themselves are unchanged
- Remove links to `evatr.bff-online.de`, the obsolete XML-RPC host, which no longer accepts connections. Four of them sat in doc comments on `IQualifiedResult` and so shipped in `dist/index.d.ts`
- Correct the `checkSimple` and `checkQualified` doc comments, which stated the functions never throw — they do when `params` is missing, and `checkQualified` also does when the service returns a per-field result outside `resultTypes`

### Changed

- Replace yarn and Volta with pnpm, which pins NodeJS through `devEngines.runtime` (development)
- Declare the published files through `files` instead of `.npmignore` (development)
- Add a test comparing the shipped error code table against the BZSt endpoint, so the build fails when it drifts again (development)

## [8.0.0] – 2025-10-09

### Breaking

- Use JSON-based API instead of XML-RPC - calling the API is as it was before, but there’s some subtle changes with the results:
  - `rawXml` is no longer available, instead there’s `rawJson`
  - remove `includeRawXml` option
  - `validFrom` and `validUntil` are no longer available
  - added `dateTime` with a full-resolution date-time string
  - deprecate `date` and `time`
  - human-readable error descriptions have slightly changed
- Remove public `parseXmlResponse` function

### Changed

- Replace Mocha with Node.js’ test runner (development)
- Replace nyc with c8 (development)
- Replace ts-node with tsx (development)

## [7.0.0] - 2024-02-01

### Breaking

- Require NodeJS 18

### Changed

- Use native `fetch` instead of superagent library
- Update development dependencies

## [6.0.0] – 2023-04-08

### Breaking

- Remove CLI (was working with `devDependencies` only)
- Require NodeJS 14

### Changed

- Upgrade Mocha development dependency

## [5.0.0] – 2023-04-08

### Changed

- Replace `xml2js` with `fast-xml-parser`

### Breaking

- `parseXmlResponse` no longer returns a promise

## [4.0.0] - 2023-02-06

### Fixed

- Keep `rawXml` in `parseXmlResponse` result
- Generic return type of `parseXmlResponse`

### Breaking

- Return `undefined` instead of empty strings

### Changed

- Replace `request` with `superagent`

## [3.3.0] – 2023-01-24

### Added

- Add `parseXmlResponse` method to parse XML response

## [3.2.0] – 2022-08-18

### Added

- Add covenience boolean flag `valid` to response object

## [3.1.0] – 2021-09-15

### Added

- Human-readable result and error descriptions (see `errorDescription`, `resultNameDescription`, `resultCityDescription`, `resultZipDescription`, and `resultStreetDescription`)

## [3.0.0] – 2021-08-27

### Removed

- `print` is no longer supported

### Fixed

- Prevent error when result flag is missing

## [2.0.0] – 2021-03-07

### Changed

- Build for NodeJS 10+

## [1.0.1] – 2018-09-10

[unreleased]: https://github.com/qqilihq/evatr/compare/v8.0.0...HEAD
[8.0.0]: https://github.com/qqilihq/evatr/compare/v7.0.0...v8.0.0
[7.0.0]: https://github.com/qqilihq/evatr/compare/v6.0.0...v7.0.0
[6.0.0]: https://github.com/qqilihq/evatr/compare/v5.0.0...v6.0.0
[5.0.0]: https://github.com/qqilihq/evatr/compare/v4.0.0...v5.0.0
[4.0.0]: https://github.com/qqilihq/evatr/compare/v3.3.0...v4.0.0
[3.3.0]: https://github.com/qqilihq/evatr/compare/v3.2.0...v3.3.0
[3.2.0]: https://github.com/qqilihq/evatr/compare/v3.1.0...v3.2.0
[3.1.0]: https://github.com/qqilihq/evatr/compare/v3.0.0...v3.1.0
[3.0.0]: https://github.com/qqilihq/evatr/compare/v2.0.0...v3.0.0
[2.0.0]: https://github.com/qqilihq/evatr/compare/v1.0.1...v2.0.0
[1.0.1]: https://github.com/qqilihq/evatr/releases/tag/v1.0.1
