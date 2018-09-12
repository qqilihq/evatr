# Bestätigung von ausländischen Umsatzsteuer-Identifikationsnummern

[![Run Status](https://api.shippable.com/projects/5b8c42b92d9a060700587910/badge?branch=master)](https://app.shippable.com/github/qqilihq/evatr)
[![Coverage Badge](https://api.shippable.com/projects/5b8c42b92d9a060700587910/coverageBadge?branch=master)](https://app.shippable.com/github/qqilihq/evatr)
[![npm version](https://badge.fury.io/js/evatr.svg)](https://badge.fury.io/js/evatr)

Validates foreign (in regards to Germany) VAT numbers for their validity. Allows to perform a “simple” check, for just checking the number, and a “qualified” check, which validates the number in regard to a given company name and city (and optionally zip code and street).

The [service](https://evatr.bff-online.de/eVatR/index_html) is provided by the German “Bundeszentralamt für Steuern”. The German documentation of the API an be found [here](https://evatr.bff-online.de/eVatR/xmlrpc/).

To use this tool, you need to be in possesion of a valid German VAT number.

## Installation

```
$ yarn add evatr
```

## Usage

```
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

Install NPM dependencies with `yarn`.

To execute the tests, run `yarn test`.

For the best development experience, make sure that your editor supports [TSLint](https://palantir.github.io/tslint/usage/third-party-tools/) and [EditorConfig](http://editorconfig.org).

## Releasing to NPM

Commit all changes and run the following:

```
$ npm login
$ npm version <update_type>
$ npm publish
```

… where `<update_type>` is one of `patch`, `minor`, or `major`. This will update the `package.json`, and create a tagged Git commit with the version number.

## Contributing

Pull requests are very welcome. Feel free to discuss bugs or new features by opening a new [issue](https://github.com/qqilihq/evatr/issues).


- - -

Copyright Philipp Katz, [LineUpr GmbH](http://lineupr.com), 2018
