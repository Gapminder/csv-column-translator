
    let files = { input: null, dict: null };
    let resultData = null;
    let dictionary = { };
    let GapminderDictionary;

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
      Papa.parse("gapminder_dictionary.csv", {
        download: true,
        skipEmptyLines: true,
        complete: (res, file) => {
          GapminderDictionary = buildDictionary(res.data);
          resolve();
        }
      });
    })


  	domReady.then(() => {
  		console.log("DOM fully loaded and parsed");
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
        complete: (res, file) => {
          files[evt.target.dataset.filetype] = res;
          if (evt.target.dataset.filetype == "dict") {
            dictionary = buildDictionary(files.dict.data);
          }
          if (evt.target.dataset.filetype == "input") {
            updateColumns(files.input.data);
          }
          updateTranslation();
        }
      });
    }

    function updateColumns(input) {
      let values = input[0];
      let select = document.getElementById("column_selector");
      select.innerHTML = "";
      values.forEach((val, i) => {
        let option = document.createElement("option");
        option.text = val;
        option.value = i;
        select.add(option);
      })
    }

    function buildDictionary(array) {
      // prepare dictionary
      return array.reduce((dict, row) => {
        dict[row[0].toLowerCase()] = row[1];
        return dict;
      }, {});
    }

    function updateTranslation() {
      if (files.input && dictionary) {

        let targetColumnIndex = document.getElementById("column_selector").value;

        resultData = files.input.data.map(row => row.map((cell, i) => (i == targetColumnIndex && dictionary[cell.toLowerCase()]) ? dictionary[cell.toLowerCase()] : cell ));

        writeDataToTable(resultData, document.getElementById("table"));

        let buttons = document.getElementsByClassName("download");
        setClassDisplay("download", "block");
      }
    }

    function writeDataToTable(data, table) {
      table.innerHTML = "";

      var tbody = document.createElement("tbody");
      data.forEach(function(items, i) {
        var row = document.createElement("tr");
        items.forEach(function(item) {
          var cell = (i == 0) ? document.createElement("th") : document.createElement("td");
          cell.textContent = item;
          row.appendChild(cell);
        });
        tbody.appendChild(row);
      });
      table.appendChild(tbody);
    }
