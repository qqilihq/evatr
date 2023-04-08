# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
* Add covenience boolean flag `valid` to response object

## [3.1.0] – 2021-09-15

### Added
* Human-readable result and error descriptions (see `errorDescription`, `resultNameDescription`, `resultCityDescription`, `resultZipDescription`, and `resultStreetDescription`)

## [3.0.0] – 2021-08-27

### Removed
* `print` is no longer supported

### Fixed
* Prevent error when result flag is missing

## [2.0.0] – 2021-03-07

### Changed
* Build for NodeJS 10+

## [1.0.1] – 2018-09-10
