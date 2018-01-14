
    let files = { input: null, dict: null };
    let resultData = null;
    let dictionary = null;
    let GapminderDictionary;
    let GapminderDictionaries = { geo: "gapminder_geo_dictionary.csv" }

    domReady = new Promise(function(resolve) {
      function checkState() {
        if (document.readyState != 'loading') {
          resolve();
        }
      }
      document.addEventListener('readystatechange', checkState);
      checkState();
    });

    gapminderDictReady = new Promise((resolve, reject) => {
      Papa.parse(GapminderDictionaries.geo, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: (res, file) => {
          GapminderDictionary = buildDictionary(res);
          resolve();
        }
      });
    })


  	domReady.then(() => {

  		let selectors = ["input", "dict"];
  		selectors.forEach(selector => {
  			let selectorElement = document.getElementById(selector + "_selector");
  			selectorElement.addEventListener("change", onInputChange);
  			selectorElement.dispatchEvent(new Event("change"));
  		})

      document.getElementById('file_dict').addEventListener('change', handleFileSelect, false);
      document.getElementById('file_input').addEventListener('change', handleFileSelect, false);
      document.getElementById('url_dict_button').addEventListener('click', handleUrlSelect, false);
      document.getElementById('url_input_button').addEventListener('click', handleUrlSelect, false);
      document.getElementById("column_selector").addEventListener('change', updateTranslation, false);

      document.getElementById("gapminder_dict").setAttribute('href', GapminderDictionaries.geo);

      setClassDisplay("download", "none");
      let buttons = document.getElementsByClassName("download");
      addEventListenerList(buttons, 'click', handleDownloadClick); 

  	});

    function handleDownloadClick(evt) {
      if (resultData)
        startCSVDownload(resultData);
    }

    function startCSVDownload(data) {
      var csvData = Papa.unparse(data, {
        delimiter: files.input.meta.delimiter
      });

      var hiddenElement = document.createElement('a');
      hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvData);
      hiddenElement.target = '_blank';
      hiddenElement.download = 'translated.csv';
      hiddenElement.click();
    }

    function addEventListenerList(list, event, fn) {
      for (var i = 0, len = list.length; i < len; i++) {
        list[i].addEventListener(event, fn, false);
      }
    }

    function setClassDisplay(className, value) {
      let elements = document.getElementsByClassName(className);
      for(let i = 0; el = elements.item(i); i++)
      {
          el.style.display = value;
      }
    }

    Promise.all([domReady, gapminderDictReady]).then(() => {
      if (document.getElementById("dict_selector").value == "gapminder_dict") {
        dictionary = GapminderDictionary;
        updateTranslation();
      }
    })


    function onInputChange(event) {
  		console.log(event);
  		let val = event.target.value;
  		let type = event.target.id.split("_")[0];
      setClassDisplay(type, "none");
  		document.getElementById(val).style.display = "inline";

      if (event.target.id == "dict_selector" && event.target.value == "gapminder_dict") {
        dictionary = GapminderDictionary;
        updateTranslation();
      }
    }

    function handleUrlSelect(evt) {
      let url = evt.target.previousElementSibling.value;
      handleFile(url, evt);
    }

    function handleFileSelect(evt) {
      let files = evt.target.files; // FileList object

      for (let i = 0, f; f = files[i]; i++) {
        handleFile(f, evt)
      }
    }

    function handleFile(file, evt) {
      let download = !(file instanceof File);
      Papa.parse(file, { 
        download: download,
        skipEmptyLines: true,
        header: true,
        complete: (res, file) => {
          files[evt.target.dataset.filetype] = res;
          if (evt.target.dataset.filetype == "dict") {
            dictionary = buildDictionary(files.dict);
          }
          if (evt.target.dataset.filetype == "input") {
            updateColumns(files.input.data);
          }
          updateTranslation();
        }
      });
    }

    function updateColumns(input) {
      let values = files.input.meta.fields;
      let select = document.getElementById("column_selector");
      select.innerHTML = "";
      values.forEach((val, i) => {
        let option = document.createElement("option");
        option.text = val;
        option.value = val;
        select.add(option);
      })
    }

    function buildDictionary(file) {
      let dictionary = deepCloneObject(file);
      dictionary.data = file.data.reduce((dict, row) => {
        dict[row.synonym.toLowerCase()] = row.geo;
        return dict;
      }, {});
      return dictionary;
    }

    function updateTranslation() {
      if (files.input && dictionary) {

        let targetColumn = document.getElementById("column_selector").value;

        // copy input to result
        resultData = deepCloneObject(files.input);

        // translate data
        resultData.data.forEach(row => { 
          let lookup = row[targetColumn].toLowerCase();
          if (dictionary.data[lookup]) 
            row[targetColumn] = dictionary.data[lookup];
        });

        // translate header
        resultData.meta.fields = resultData.meta.fields.map(field => (field == targetColumn) ? dictionary.meta.fields[1] : field)

        writeDataToTable(resultData, document.getElementById("table"));

        let buttons = document.getElementsByClassName("download");
        setClassDisplay("download", "block");
      }
    }

    function writeDataToTable(data, tableElement) {
      tableElement.innerHTML = "";

      // head
      let thead = document.createElement("thead");
      let row = document.createElement("tr");
      data.meta.fields.forEach(function(headerItem) {
        var cell = document.createElement("th");
        cell.textContent = headerItem;
        row.appendChild(cell);
      });
      thead.appendChild(row);
      tableElement.appendChild(thead);
      
      // body
      let tbody = document.createElement("tbody");
      data.data.forEach(function(items) {
        var row = document.createElement("tr");
        Object.values(items).forEach(function(item) {
          var cell = document.createElement("td");
          cell.textContent = item;
          row.appendChild(cell);
        });
        tbody.appendChild(row);
      });
      tableElement.appendChild(tbody);
    }

    function deepCloneObject(object) {
      return JSON.parse(JSON.stringify(object));
    }
