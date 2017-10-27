# Column translator

Little proof of concept GUI for translating a column in a csv file using a dictionary.

Will only work in modern browsers due to use of modern web technologies and lack of polyfills.

## how to use

Run on a webserver:

```
npm install http-server
http-server -o
```

Or visit https://gapminder.github.io/csv-column-translator/

### Dictionary format

The dictionary is a csv files which MUST have at least two columns. There MUST be one header row. Each following row MUST be an entry in the dictionary. In each entry, the first cell MUST be the original text, the second column MUST be the translated text. The header of the first column SHOULD be `synonym`, the header of the second column MUST be the header you want the translated column to have. Any further columns MAY contain additional information but are ignored. 

| synonym                     | geo  |
| --------------------------- | ---- |
| Germany                     | deu  |
| Federal Republic of Germany | deu  |
| Ukraine                     | ukr  |
| Congo                       | cod  |
| Congo                       | cog  |

Gapminder dictionary contains one double entry: `MF` translates to both `maf` and `stmar`. Currently translates to `stmar` since it occurs later in the dictionary.