"use strict";
//
// TODO: 
//

const app = function () {
	const page = {};
  
	const settings = {
    elapsedtime: null
  };
    
	//-----------------------------------------------------------------------------    
  // info for Google web app APIs used in this application
  //   - each entry should have a name for the API paired with apibase and apikey
  //     e.g.
  //     const apiInfo = {
  //       "example": {
  //           apibase: <base URL for published web app API>
  //           apikey: <API_KEY key defined in web app script>
  //        }
  //      };
	//-----------------------------------------------------------------------------
  const apiInfo = {
    test: {
      apibase: 'https://script.google.com/macros/s/AKfycbz4ZLM1w7BCAQUlUhP86aLu887pnUGTo0JcI2W_V4qKYVDxdfY/exec',
      apikey: 'gpTestData'
    },
    
    miGoogle2019: {
      apibase: 'https://script.google.com/macros/s/AKfycbzrVV2otcnpD2t-II38JVnB7FM7UN5Us9q3964tNHCCiSJOxfU/exec',
      apikey: 'miGoogle2019_webappAPIDemo'
    },
    
    studentinfo: {
      apibase: 'https://script.google.com/macros/s/AKfycbxpMfjVsVXjZuSdkI5FABJHFY5azMdbep7YfMI_OVndxtN_VwI/exec',
      apikey: 'MV_studeninfoAPI'
    }
  };

  const STUDENT_INFO_SPREADSHEET = '1Ie2Pk_vB-N8-Qg9mvc0mrS8MD_yUbW7Jhzwaefl6SHs'; //'17m8kxYjqTTGHsTFnD3VSTy7P4ztF9f9ggPJz4wTVdO4';
  const LAYOUT_INFO_SPREADSHEET = '1pBVYZdKv1U6FErHhiI1mTiGemFDOY5CVCcPCa31bY9g';
  
  const apiCallPremades = {
    test: {
      "get all rows": {apitype: "get", dataset: "getallrows", options: {}},
      "get matching rows": {apitype: "get", dataset: "getmatchingrows", options: {last: 'Weasley'}},
      "get exact row": {apitype: "get", dataset: "getmatchingrows", options: {last: 'Weasley', first: 'George'}},
      "get fixed": {apitype: "get", dataset: "getfixed", options: {}},
      "get remark": {apitype: "get", dataset: "getremark", options: {}},
      "get version and topic": {apitype: "get", dataset: "getversionandtopic", options: {}},
      "put remark": {apitype: "post", dataset: "putremark", options: {remark: 'Hello, my name is Inigo Montoya.'}},
      "put version and topic": {apitype: "post", dataset: "putversionandtopic", options: {version: 'v2.03.005', topic: 'ABC'}},
      "overlay exact row": {apitype: "post", dataset: "overlayrow", options: {criteria:{last: 'Potter', first: 'Harry'}, newdata:{message2: 'Harry\'s message2'}}},
      "overlay multiple rows": {apitype: "post", dataset: "overlayrow", options: {criteria:{last: 'Weasley'}, newdata:{message1: 'Weasley message 1', message2: 'message 2 for the Weasleys'}}},
      "append row": {apitype: "post", dataset: "appendrow", options: {last: 'Smith', first: 'Vinnie', message1: 'm1', message2: 'm2'}} 
    },
    
    miGoogle2019: {
      "get course list": {apitype: "get", dataset: "courselist", options: {}},
      "get course data": {apitype: "get", dataset: "coursedata", options: {coursekey: "geoa"}},
      "get all instructors": {apitype: "get", dataset: "allinstructorinfo", options: {}},
      "get instructor": {apitype: "get", dataset: "instructorinfo", options: {instructorkey: "fpersimmon"}},
      "put review date": {apitype: "post", dataset: "reviewdate", options: {criteria: {coursekey: 'alg1a'}, newdata:{reviewdate: "'05/14/2019"}}}
    },
    
    studentinfo: {
      "get all info": {apitype: "get", dataset: "all", options: {studentinfo_spreadsheetid: STUDENT_INFO_SPREADSHEET, layoutdefinitions_spreadsheetid: LAYOUT_INFO_SPREADSHEET} },
      "save note": {apitype: "post", dataset: "savenote", options: {spreadsheetid: STUDENT_INFO_SPREADSHEET, fullname: "Weasley, Ronald", cardnumber: "0", notes: "05/18/19|something not good\n02/02/02|note number 2\n03/03/03|a dandy third note"}}
    }
  }
  
	//---------------------------------------
	// get things going
	//----------------------------------------
	async function init () {
    _renderPage();
    _setNotice('');
	}
		
	//-----------------------------------------------------------------------------
	// page rendering
	//-----------------------------------------------------------------------------  
  function _renderPage() {
		page.body = document.getElementsByTagName('body')[0];
    
    page.body.appendChild(_renderTitle());
    page.body.appendChild(_renderNoticeElement());
		
    page.body.appendChild(_renderContents());
  }
  
  function _renderTitle() {
    var elemTitle = document.createElement('div');
    
    elemTitle.innerHTML = 'Test';
    elemTitle.classList.add('title');
    
    return elemTitle;
  }

  function _renderNoticeElement() {
    var elemNotice = document.createElement('div');
    
    elemNotice.classList.add('notice');
    page.notice = elemNotice;
    
    return elemNotice;
  }
  
  function _renderContents() {
    page.contents = document.createElement('div');
    page.contents.id = 'contents';
    
    page.contents.appendChild(_renderRequestContainer());
    
    page.contents.appendChild(_renderResultsContainer());
    page.contents.appendChild(_renderFormattedResultsContainer());
    
    return page.contents;
  }   
  
  function _renderRequestContainer() {
    var elemContainer = document.createElement('div');
    elemContainer.classList.add('request-container');
    
    elemContainer.appendChild(_renderAPISelection());
    elemContainer.appendChild(_renderRequestParameters());
    _renderRequestOptions();
        
    return elemContainer;
  }
  
  function _renderAPISelection() {
    var elemContainer = document.createElement('div');
    elemContainer.classList.add('apiselection');
    
    var elemLabel = document.createElement('span');
    elemLabel.classList.add('label');
    elemLabel.innerHTML = 'API';
    elemContainer.appendChild(elemLabel);
    
    var elemSelection = document.createElement('select');
    elemSelection.id = 'apiSelection';
		elemSelection.addEventListener('change',  _apiSelectChanged, false);    
    
    for (var key in apiInfo) {
      var elemOption = document.createElement('option');
      elemOption.value = key;
      elemOption.text = key;
      elemSelection.appendChild(elemOption);
    }
    
    page.apiselection = elemSelection;
    elemContainer.appendChild(elemSelection);
    
    elemSelection = document.createElement('select');
    elemSelection.id = 'requestSelection';
    elemSelection.addEventListener('change', _requestSelectChanged, false);

    page.requestselection = elemSelection;
    elemContainer.appendChild(elemSelection);
    
    return elemContainer;
  }
  
  function _renderRequestParameters() {
    var elemContainer = document.createElement('div');
    
    var elemRequestTypeContainer = document.createElement('div');
    
    var elemInput = document.createElement('input');
    elemInput.type = 'radio';
    elemInput.id = 'get';
    elemInput.name = 'requestType';
    elemInput.addEventListener('change', _handleRequestChange, false);
    elemInput.checked = true;
    page.getrequest = elemInput;
    elemRequestTypeContainer.appendChild(elemInput);
    var elemLabel = document.createElement('label');
    elemLabel.for = elemInput.id;
    elemLabel.classList.add('label');    
    elemLabel.innerHTML = elemInput.id;
    elemRequestTypeContainer.appendChild(elemLabel);

    elemInput = document.createElement('input');
    elemInput.type = 'radio';
    elemInput.id = 'post';
    elemInput.name = 'requestType';
    page.postrequest = elemInput;
    elemInput.addEventListener('change', _handleRequestChange, false);
    elemRequestTypeContainer.appendChild(elemInput);
    elemLabel = document.createElement('label');
    elemLabel.for = elemInput.id;
    elemLabel.classList.add('label');
    elemLabel.innerHTML = elemInput.id;
    elemRequestTypeContainer.appendChild(elemLabel);
    
    elemContainer.appendChild(elemRequestTypeContainer);
    
    var elemDatasetContainer = document.createElement('div');
    elemLabel = document.createElement('span');
    elemLabel.innerHTML = 'dataset';
    elemLabel.classList.add('label');
    elemDatasetContainer.appendChild(elemLabel);
    var elemDataset = document.createElement('input');
    elemDataset.type = 'text';
    elemDataset.id = 'requestDataset';
    page.dataset = elemDataset;
    elemDatasetContainer.appendChild(elemDataset);
    
    elemContainer.appendChild(elemDatasetContainer);
    
    var elemParamsContainer = document.createElement('div');
    elemLabel = document.createElement('span');
    elemLabel.innerHTML = 'params / post data';
    elemLabel.classList.add('label');
    elemParamsContainer.appendChild(elemLabel);
    var elemParams = document.createElement('input');
    elemParams.type = 'text';
    elemParams.id = 'requestParams';
    elemParams.classList.add('requestparams');
    page.params = elemParams;
    elemParamsContainer.appendChild(elemParams);
    
    elemContainer.appendChild(elemParamsContainer);
    
    var elemDoRequestContainer = document.createElement('div');
    elemDoRequestContainer.classList.add('dorequest-container');
    var elemButton = document.createElement('button');
    elemButton.innerHTML = 'do request';
    elemButton.addEventListener('click', _handleDoRequestButton, false);
    elemDoRequestContainer.appendChild(elemButton);
    
    elemContainer.appendChild(elemDoRequestContainer);

    return elemContainer;
  }
  
  function _renderRequestOptions() {
    var apiKey = page.apiselection.options[page.apiselection.selectedIndex].value;
    var requests = apiCallPremades[apiKey];
    
    var elemSelect = page.requestselection;
    while (elemSelect.firstChild) {
      elemSelect.removeChild(elemSelect.firstChild);
    }    

    for (var key in requests) {
      var elemOption = document.createElement('option');
      elemOption.value = key;
      elemOption.text = key;
      elemSelect.appendChild(elemOption);
    }
    
    _loadRequest();
  }
  
  function _renderResultsContainer() {
    var elemContainer = document.createElement('div');
    elemContainer.classList.add('results');
    
    var elemTitle = document.createElement('div');
    elemTitle.id = 'overallResults';
    elemTitle.innerHTML = 'overall results';
    elemContainer.appendChild(elemTitle);
    
    page.results = document.createElement('div');
    page.results.classList.add('results-interior');
    elemContainer.appendChild(page.results);
    
    return elemContainer;
  }
  
  function _renderFormattedResultsContainer() {
    var elemContainer = document.createElement('div');
    elemContainer.classList.add('results');
    
    var elemTitle = document.createElement('div');
    elemTitle.innerHTML = 'formatted results';
    elemContainer.appendChild(elemTitle);
    
    page.formattedresults = document.createElement('div');
    page.formattedresults.classList.add('results-interior');
    elemContainer.appendChild(page.formattedresults);
    
    return elemContainer;
  }
    
  function _loadRequest() {
    if (page.requestselection.length == 0) {
      page.getrequest.checked = true;
      page.dataset.value = '';
      page.params.value = '';
      
    } else {
      var apiKey = page.apiselection.options[page.apiselection.selectedIndex].value;
      var requestKey = page.requestselection.options[page.requestselection.selectedIndex].value;
      var request = apiCallPremades[apiKey][requestKey];
      if (request.apitype == 'get') {
        page.getrequest.checked = true;
      } else {
        page.postrequest.checked = true;
      }
      page.dataset.value = request.dataset;
      page.params.value = JSON.stringify(request.options);
    }
  }
    
  //--------------------------------------------------------------------------
  // dispatcher for Google web app API requests
  //--------------------------------------------------------------------------
  async function _doRequest() {
    var apiKey = page.apiselection.options[page.apiselection.selectedIndex].value;
    var requestType = page.getrequest.checked ? 'get' : 'post';
    var dataset = page.dataset.value;
    var params = JSON.parse(page.params.value);
     
    _setNotice('retrieving/posting...');
    page.results.innerHTML = ''
    page.formattedresults.innerHTML = '';

    var startTime = new Date();
    var requestData = null;
    if (requestType == 'get') {
      requestData = await googleSheetWebAPI.webAppGet(apiInfo[apiKey], dataset, params, _reportError);
    } else {
      requestData = await googleSheetWebAPI.webAppPost(apiInfo[apiKey], dataset, params, _reportError);
    }
    settings.elapsedtime = (new Date() - startTime) / 1000.0;
    document.getElementById('overallResults').innerHTML = 'overall results (' + settings.elapsedtime + 's)';    
    
    if (requestData == null) {
      _setNotice('internal error - requestData is null');
      page.results.innerHTML = '';
      page.formattedresults.innerHTML = '';
      return;
    }
      
    if (requestData.success) {
      _setNotice('');
    }
    
    page.results.innerHTML = (requestData.success ? "SUCCESS": "FAIL") + ' ' + JSON.stringify(requestData);
    if (requestData.success) {
      page.formattedresults.innerHTML = _formatResults(requestType, requestData); 
    }
  }

  function _formatResults(resultType, results) {
    var formatted;
    
    if (resultType == 'get') {
      formatted = _formatGetResults(results);
      
    } else if (resultType == 'post') {
      formatted = _formatPostResults(results);
      
    } else {
      formatted = 'unrecognized resultType: ' + resultType;
    }
    
    return formatted
  }
  
  function _formatGetResults(results) {
    var formatted;
    
    var data = results.data;
    if (Array.isArray(data)) {
      formatted = 'data=<br>';
      for (var i = 0; i < data.length; i++) {
        formatted += '&nbsp;&nbsp;<em>(row #' + i + ')</em><br>' + _formatObject(data[i]);
        if (i < data.length - 1) formatted += '<br>';
      }
      
    } else {
      formatted = 'data=<br>' + _formatObject(data);
    }
            
    return formatted
  }
  
  function _formatPostResults(results) {
    var formatted = "details = " + results.details + '<br>';
    if (results.data.hasOwnProperty('criteria')) {
      formatted += 'criteria=<br>' + _formatObject(results.data.criteria);
      formatted += 'newdata=<br>' + _formatObject(results.data.newdata);
    
    } else {
      formatted += 'data=<br>' + _formatObject(results.data);
    }
    
    return formatted
  }
  
  function _formatObject(obj) {
    var formatted = '';
    
    for (var key in obj) {
      formatted += '&nbsp;&nbsp;' + key + ': ' + JSON.stringify(obj[key]) + '<br>';
    }
    return formatted;
  }
  
	//-----------------------------------------------------------------------------
	// control styling, visibility, and enabling
	//-----------------------------------------------------------------------------    
  function _showElement(elem) {
    if (elem.classList.contains('hide-me')) {
      elem.classList.remove('hide-me');
    }
  }

  function _hideElement(elem) {
    elem.classList.add('hide-me');
  }
  
	//------------------------------------------------------------------
	// handlers
	//------------------------------------------------------------------
  function _apiSelectChanged(e) {
    _renderRequestOptions();
    page.results.innerHTML = '';
    page.formattedresults.innerHTML = '';
  }
  
  function _requestSelectChanged(e) {
    _loadRequest();
    page.results.innerHTML = '';
    page.formattedresults.innerHTML = '';
  }
  
  function _handleRequestChange(e) {
  }
  
  function _handleDoRequestButton(e) {
    _doRequest();
  } 
  
	//---------------------------------------
	// utility functions
	//----------------------------------------
	function _setNotice (label) {
		page.notice.innerHTML = label;

		if (label == '') {
			_hideElement(page.notice);
		} else {
			_showElement(page.notice);
		}
	}
  
  function _reportError(src, err) {
    _setNotice('Error in ' + src + ': ' + err.name + ' "' + err.message + '"');
  }

	//---------------------------------------
	// return from wrapper function
	//----------------------------------------
	return {
		init: init
 	};
}();
