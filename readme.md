# Column translator

Little proof of concept GUI for translating a column in a csv file using a dictionary.

Will only work in modern browsers due to use of modern web technologies and lack of polyfills.

Gapminder dictionary contains one double entry: `MF` translates to both `maf` and `stmar`. Currently translates to `stmar` since it occurs later in the dictionary.

## how to use

Run on a webserver:

```
npm install http-server
http-server -o
```

Or visit https://gapminder.github.io/csv-column-translator/