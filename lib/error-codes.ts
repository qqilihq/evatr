// This file is auto-generated. Do not manually edit. Instead, run the script `scrape-error-codes`
export type ErrorCodeEntry = { status: string, kategorie: string, httpcode?: number, feld?: string, meldung: string };
export const errorCodes: Readonly<ErrorCodeEntry[]> = Object.freeze([
  {
    "status": "evatr-0000",
    "kategorie": "Ergebnis",
    "httpcode": 200,
    "meldung": "Die angefragte USt-IdNr. ist zum Anfragezeitpunkt gültig."
  },
  {
    "status": "evatr-0001",
    "kategorie": "Hinweis",
    "feld": "datenschutz",
    "meldung": "Bitte bestätigen Sie den Datenschutzhinweis."
  },
  {
    "status": "evatr-0002",
    "kategorie": "Hinweis",
    "httpcode": 400,
    "feld": "angefragteUstid",
    "meldung": "Mindestens eins der Pflichtfelder ist nicht besetzt."
  },
  {
    "status": "evatr-0003",
    "kategorie": "Hinweis",
    "httpcode": 400,
    "feld": "firmenname,ort",
    "meldung": "Die angefragte USt-IdNr. ist zum Anfragezeitpunkt gültig. Mindestens eines der Pflichtfelder für eine qualifizierte Bestätigungsanfrage ist nicht besetzt."
  },
  {
    "status": "evatr-0004",
    "kategorie": "Fehler",
    "httpcode": 400,
    "feld": "anfragendeUstid",
    "meldung": "Die anfragende DE USt-IdNr. ist syntaktisch falsch. Sie passt nicht in das deutsche Erzeugungsschema."
  },
  {
    "status": "evatr-0005",
    "kategorie": "Fehler",
    "httpcode": 400,
    "feld": "angefragteUstid",
    "meldung": "Die angegebene angefragte USt-IdNr. ist syntaktisch falsch."
  },
  {
    "status": "evatr-0006",
    "kategorie": "Hinweis",
    "httpcode": 403,
    "feld": "anfragendeUstid",
    "meldung": "Die anfragende DE USt-IdNr. ist nicht berechtigt eine DE USt-IdNr. anzufragen."
  },
  {
    "status": "evatr-0007",
    "kategorie": "Hinweis",
    "httpcode": 403,
    "meldung": "Fehlerhafter Aufruf."
  },
  {
    "status": "evatr-0008",
    "kategorie": "Hinweis",
    "httpcode": 403,
    "meldung": "Die maximale Anzahl von qualifizierten Bestätigungsabfragen für diese Session wurde erreicht. Bitte starten Sie erneut mit einer einfachen Bestätigungsabfrage."
  },
  {
    "status": "evatr-0011",
    "kategorie": "Fehler",
    "httpcode": 503,
    "meldung": "Eine Bearbeitung Ihrer Anfrage ist zurzeit nicht möglich. Bitte versuchen Sie es später noch einmal."
  },
  {
    "status": "evatr-0012",
    "kategorie": "Fehler",
    "httpcode": 400,
    "feld": "angefragteUstid",
    "meldung": "Die angefragte USt-IdNr. ist syntaktisch falsch. Sie passt nicht in das Erzeugungsschema."
  },
  {
    "status": "evatr-0013",
    "kategorie": "Fehler",
    "httpcode": 503,
    "meldung": "Eine Bearbeitung Ihrer Anfrage ist zurzeit nicht möglich. Bitte versuchen Sie es später noch einmal."
  },
  {
    "status": "evatr-1001",
    "kategorie": "Fehler",
    "httpcode": 503,
    "meldung": "Eine Bearbeitung Ihrer Anfrage ist zurzeit nicht möglich. Bitte versuchen Sie es später noch einmal."
  },
  {
    "status": "evatr-1002",
    "kategorie": "Fehler",
    "httpcode": 500,
    "meldung": "Eine Bearbeitung Ihrer Anfrage ist zurzeit nicht möglich. Bitte versuchen Sie es später noch einmal."
  },
  {
    "status": "evatr-1003",
    "kategorie": "Fehler",
    "httpcode": 500,
    "meldung": "Eine Bearbeitung Ihrer Anfrage ist zurzeit nicht möglich. Bitte versuchen Sie es später noch einmal."
  },
  {
    "status": "evatr-1004",
    "kategorie": "Fehler",
    "httpcode": 500,
    "meldung": "Eine Bearbeitung Ihrer Anfrage ist zurzeit nicht möglich. Bitte versuchen Sie es später noch einmal."
  },
  {
    "status": "evatr-2001",
    "kategorie": "Hinweis",
    "httpcode": 404,
    "feld": "angefragteUstid",
    "meldung": "Die angefragte USt-IdNr. ist zum Anfragezeitpunkt nicht vergeben."
  },
  {
    "status": "evatr-2002",
    "kategorie": "Hinweis",
    "httpcode": 200,
    "feld": "angefragteUstid",
    "meldung": "Die angefragte USt-IdNr. ist zum Anfragezeitpunkt nicht gültig. Sie ist erst gültig ab dem Datum im Feld gueltigAb."
  },
  {
    "status": "evatr-2003",
    "kategorie": "Fehler",
    "httpcode": 400,
    "feld": "angefragteUstid",
    "meldung": "Das angegebene Länderkennzeichen der angefragten USt-IdNr. ist nicht gültig."
  },
  {
    "status": "evatr-2004",
    "kategorie": "Fehler",
    "httpcode": 500,
    "meldung": "Eine Bearbeitung Ihrer Anfrage ist zurzeit nicht möglich. Bitte versuchen Sie es später noch einmal."
  },
  {
    "status": "evatr-2005",
    "kategorie": "Fehler",
    "httpcode": 404,
    "feld": "anfragendeUstid",
    "meldung": "Die angegebene eigene DE USt-IdNr. ist zum Anfragezeitpunkt nicht gültig."
  },
  {
    "status": "evatr-2006",
    "kategorie": "Hinweis",
    "httpcode": 200,
    "feld": "angefragteUstid",
    "meldung": "Die angefragte USt-IdNr. ist zum Anfragezeitpunkt nicht gültig. Sie war gültig im Zeitraum, der durch die Werte in den Feldern gueltigAb und gueltigBis beschrieben ist."
  },
  {
    "status": "evatr-2007",
    "kategorie": "Fehler",
    "httpcode": 500,
    "meldung": "Bei der Verarbeitung der Daten aus dem angefragten EU-Mitgliedstaat ist ein Fehler aufgetreten. Ihre Anfrage kann deshalb nicht bearbeitet werden."
  },
  {
    "status": "evatr-2008",
    "kategorie": "Hinweis",
    "httpcode": 200,
    "meldung": "Die angefragte USt-IdNr. ist zum Anfragezeitpunkt gültig. Für die qualifizierte Bestätigungsanfrage liegt einer Besonderheit vor. Für Rückfragen wenden Sie sich an das BZSt."
  },
  {
    "status": "evatr-2011",
    "kategorie": "Fehler",
    "httpcode": 500,
    "meldung": "Eine Bearbeitung Ihrer Anfrage ist zurzeit nicht möglich. Bitte versuchen Sie es später noch einmal."
  },
  {
    "status": "evatr-3011",
    "kategorie": "Fehler",
    "httpcode": 500,
    "meldung": "Eine Bearbeitung Ihrer Anfrage ist zurzeit nicht möglich. Bitte versuchen Sie es später noch einmal."
  }
]);
