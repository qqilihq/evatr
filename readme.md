# Bestätigung von ausländischen Umsatzsteuer-Identifikationsnummern

[![Actions Status](https://github.com/qqilihq/evatr/workflows/CI/badge.svg)](https://github.com/qqilihq/evatr/actions)
[![codecov](https://codecov.io/gh/qqilihq/evatr/branch/master/graph/badge.svg)](https://codecov.io/gh/qqilihq/evatr)
[![npm version](https://badge.fury.io/js/evatr.svg)](https://badge.fury.io/js/evatr)

Validates foreign (in regards to Germany) VAT numbers for their validity. Allows to perform a “simple” check, for just checking the number, and a “qualified” check, which validates the number in regard to a given company name and city (and optionally zip code and street).

The [service](https://evatr.bff-online.de/eVatR/index_html) is provided by the German “Bundeszentralamt für Steuern”. The German documentation of the API an be found [here](https://www.bzst.de/DE/Unternehmen/Identifikationsnummern/Umsatzsteuer-Identifikationsnummer/AuslaendischeUSt-IdNr/auslaendische_ust_idnr_node.html#js-toc-entry2). Since v8.0.0 it uses the REST-API instead of the obsolete XML RPC interface.

To use this tool, you need to be in possesion of a valid German VAT number.

## Installation

```shell
$ yarn add evatr
```

## Usage

```typescript
import * as evatr from 'evatr';

const simpleResult = await evatr.checkSimple({
  ownVatNumber: 'DE115235681',
  validateVatNumber: 'CZ00177041'
});

const qualifiedResult = await evatr.checkQualified({
  ownVatNumber: 'DE115235681',
  validateVatNumber: 'CZ00177041',
  companyName: 'ŠKODA AUTO a.s.',
  city: 'Mlada Boleslav',
  zip: '293 01',
  street: 'tř. Václava Klementa 869'
});
```

## Development

Use [Volta](https://volta.sh).

Install NPM dependencies with `yarn`.

To execute the tests, run `yarn test`.

For the best development experience, make sure that your editor supports [ESLint](https://github.com/Microsoft/vscode-eslint), [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) and [EditorConfig](http://editorconfig.org).

## Error Codes

There’s a script which scrapes and includes human-readable error codes from [here](https://api.evatr.vies.bzst.de/v1/info/statusmeldungen). This way, obscure codes such as `evatr-2003` are mapped to an understandable German message (for this example: *“Das angegebene Länderkennzeichen der angefragten USt-IdNr. ist nicht gültig.”*)

To update the list, run the NPM task `yarn scrape-error-codes` which will produce a file `error-codes.ts`.

## Releasing to NPM

Commit all changes and run the following:

```shell
$ npm login
$ npm version <update_type>
$ npm publish
```

… where `<update_type>` is one of `patch`, `minor`, or `major`. This will update the `package.json`, and create a tagged Git commit with the version number.

## Contributing

Pull requests are very welcome. Feel free to discuss bugs or new features by opening a new [issue](https://github.com/qqilihq/evatr/issues).


- - -

Copyright Philipp Katz, [LineUpr GmbH](http://lineupr.com), 2018 – 2025
