# Bestätigung von ausländischen Umsatzsteuer-Identifikationsnummern

[![Actions Status](https://github.com/qqilihq/evatr/workflows/CI/badge.svg)](https://github.com/qqilihq/evatr/actions)
[![codecov](https://codecov.io/gh/qqilihq/evatr/branch/master/graph/badge.svg)](https://codecov.io/gh/qqilihq/evatr)
[![npm version](https://badge.fury.io/js/evatr.svg)](https://badge.fury.io/js/evatr)

Validates foreign (in regards to Germany) VAT numbers for their validity. Allows to perform a “simple” check, for just checking the number, and a “qualified” check, which validates the number in regard to a given company name and city (and optionally zip code and street).

The service is provided by the German “Bundeszentralamt für Steuern”. The German documentation of the API can be found [here](https://www.bzst.de/DE/Unternehmen/Identifikationsnummern/Umsatzsteuer-Identifikationsnummer/AuslaendischeUSt-IdNr/auslaendische_ust_idnr_node.html#js-toc-entry2). Since v8.0.0 it uses the REST API instead of the obsolete XML-RPC interface.

To use this tool, you need to be in possession of a valid German VAT number.

## Installation

```shell
$ npm install evatr
```

## Usage

```typescript
import * as evatr from 'evatr';

const simpleResult = await evatr.checkSimple({
  ownVatNumber: 'DE115235681',
  validateVatNumber: 'CZ00177041',
});

const qualifiedResult = await evatr.checkQualified({
  ownVatNumber: 'DE115235681',
  validateVatNumber: 'CZ00177041',
  companyName: 'ŠKODA AUTO a.s.',
  city: 'Mlada Boleslav',
  zip: '293 01',
  street: 'tř. Václava Klementa 869',
});
```

A failed _check_ is not an error: an invalid VAT number, or an error response from the service, is reported through `errorCode` and `errorDescription` on the result. The returned promise rejects only when no result can be produced at all — the request does not complete (a network or DNS error), or the response cannot be read as a result. For `checkQualified` that last case includes an unknown per-field result letter, which the service can return on an otherwise successful answer, so handle rejection rather than assuming a reply means success.

TS typings are available. Besides the two check functions, the package exports:

- **`resultTypes`** and the **`ResultType`** type — the per-field results of a qualified check (`A` match, `B` no match, `C` not queried, `D` not returned), as returned in `resultName`, `resultCity`, `resultZip` and `resultStreet`
- **`errorCodes`** and the **`ErrorCodeEntry`** type — the BZSt status message table from which `errorDescription` is populated

## Development

Node.js and pnpm are pinned in `package.json` (`devEngines.runtime` and `packageManager`); pnpm downloads the pinned Node.js version itself, so no separate version manager is needed.

Install dependencies with `pnpm install`.

To execute the tests, run `pnpm test`. To lint, run `pnpm run lint`, which runs ESLint, Prettier, the TypeScript compiler and [Knip](https://knip.dev) in turn; each is also available on its own as `lint:eslint`, `lint:format`, `lint:types` and `lint:knip`.

The tests talk to the live BZSt API, which is deliberate — this is a client for a remote service, so upstream downtime failing the build is information rather than flakiness.

For the best development experience, make sure that your editor supports [ESLint](https://github.com/Microsoft/vscode-eslint), [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) and [EditorConfig](http://editorconfig.org).

Linting of code and commit message happens on commit via [Husky](https://github.com/typicode/husky). Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/); `.commitlintrc.json` lists the accepted types.

## Error Codes

There’s a script which scrapes and includes human-readable error codes from [here](https://api.evatr.vies.bzst.de/v1/info/statusmeldungen). This way, obscure codes such as `evatr-2003` are mapped to an understandable German message (for this example: _“Das angegebene Länderkennzeichen der angefragten USt-IdNr. ist nicht gültig.”_)

To update the list, run `pnpm run scrape-error-codes`, which regenerates `lib/error-codes.ts`.

A test compares the shipped table against that endpoint, so the build goes red when the BZSt changes a message rather than the stale text quietly continuing to ship.

## Releasing to NPM

First promote the changelog by hand: rename `## [Unreleased]` to `## [X.Y.Z] – <date>`, repoint the `[unreleased]` link reference at the new tag, and add a comparison link for the release. Commit that on its own — the wording, grouping and date deserve review, and nothing rewrites them for you.

Then commit any remaining changes and run the following:

```shell
$ pnpm login
$ pnpm run release <update_type>
$ git push --follow-tags
$ pnpm publish
```

… where `<update_type>` is one of `patch`, `minor`, or `major` — passed positionally, not as `--patch`. This updates the `package.json` and creates a tagged Git commit.

`--follow-tags` matters: a plain `git push` leaves the version tag behind, and the changelog’s comparison links stay broken until it lands. `pnpm publish` refuses to publish a branch that is not clean and up to date, so it will catch an unpushed commit — but not an unpushed tag.

The release refuses to run unless the changelog is ready. `dev/verify-changelog.ts` checks it and never modifies it, from two lifecycle scripts: `preversion`, before the version is bumped, so the usual “forgot to promote it” case fails while the working tree is still clean; and `version`, after the bump, which is the only point at which the new version number is known and can be compared against the heading. The error message spells out what to write, with the repository URL and previous tag filled in.

A failure at the `version` stage — a changelog promoted to a different version than the one being released — aborts before any commit or tag, but leaves `package.json` bumped, since the bump happens first. Undo it with `git checkout package.json` before retrying.

Use `pnpm`, not `npm`, for these. Because the project pins its Node.js version through `devEngines.runtime`, npm refuses to run anything here (`EBADDEVENGINES`) unless the ambient Node.js version happens to match that exact version.

## Contributing

Pull requests are very welcome. Feel free to discuss bugs or new features by opening a new [issue](https://github.com/qqilihq/evatr/issues).

---

Copyright Philipp Katz, [LineUpr GmbH](http://lineupr.com), 2018 – 2026
