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

The dictionary is a csv files with at least two columns. There is no header row. Each row is an entry in the dictionary. The first column is the original text, the second column is the translated text. Any further columns are ignored. 

Github Markdown does not support header-less tables so the example below is in an ascii-table.

```
╔═════════════════════════════════╦═════╗
║ The Federal Republic of Germany ║ ger ║
╠═════════════════════════════════╬═════╣
║ Germany                         ║ ger ║
╠═════════════════════════════════╬═════╣
║ Deutschland                     ║ ger ║
╠═════════════════════════════════╬═════╣
║ Ukraine                         ║ ukr ║
╚═════════════════════════════════╩═════╝
```

Gapminder dictionary contains one double entry: `MF` translates to both `maf` and `stmar`. Currently translates to `stmar` since it occurs later in the dictionary.