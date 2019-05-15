"use strict";

// NOTE: this is designed to be used in a Google App script
//       It has not been tested as "real" JS code

//************************************************************************
// general purpose spreadsheet manipulation "class"
//************************************************************************
var gpSpreadsheet = function(layout) {
  this.layout = layout;
  this.sheet = this.getSheet(this.layout.sourceDataSpreadsheet, this.layout.sheetName);
  this.sheetData = this.getSheetData(this.layout.sourceDataSpreadsheet, this.layout.sheetName);   
}

//-----------------------------------------------------------------------
// **** code below adds static methods to class ****
//-----------------------------------------------------------------------

//-----------------------------------------------------------------------
// package all fixed field cells in given sheet
//-----------------------------------------------------------------------
gpSpreadsheet.prototype.packageFixedFields = function() {
  var keyList = [];
  for (var key in this.layout.fixedfields) {
    keyList.push(key);
  }
  
  return this.packageSpecifiedFixedFields(keyList);
}

//-----------------------------------------------------------------------
// package specified fixed fields cells in given sheet
//-----------------------------------------------------------------------
gpSpreadsheet.prototype.packageSpecifiedFixedFields = function(fieldKeyList) {
  var result = webAppAPIErrorResult("packageSpecifiedFixedFields failed");
  
  var data = this.sheetData;
  if (data == null) {
    return webAppAPIErrorResult("packageSpecifiedFixedFields failed: sheetData is null");
  }  
  
  var objPackagedFields = {};
  var fields = this.layout.fixedfields;
  for (var i = 0; i < fieldKeyList.length; i++) {
    var key = fieldKeyList[i];
    var field = fields[key];
    objPackagedFields[key] = data[field.row][field.col];
  }
  
  result = webAppAPISuccessResult("success", objPackagedFields);
    
  return result;    
}

//-----------------------------------------------------------------------
// package all rows in given sheet
//-----------------------------------------------------------------------
gpSpreadsheet.prototype.packageAllRows = function() {
  return this.packageSelectRow_multiple({});
}

//-----------------------------------------------------------------------
// package all rows matching the given criteria
//-----------------------------------------------------------------------
gpSpreadsheet.prototype.packageSelectRow_multiple = function(selectionCriteria) {
  var result = webAppAPIErrorResult("packageSelectRow_multiple failed");
    
  var data = this.sheetData;
  if (data == null) {
    return webAppAPIErrorResult("packageSelectRow_multiple failed: sheetData is null");
  }
  
  var arrPackagedRows = [];
  for (var row = this.layout.firstDataRow; row < data.length; row++) {
    var rowData = data[row];
    
    if (this.__rowMeetsCriteria__(rowData, selectionCriteria)) {
      arrPackagedRows.push( this.__packageRowData__(rowData) );
    }
  }
  
  result = webAppAPISuccessResult("success", arrPackagedRows);
    
  return result;    
}
 
//-----------------------------------------------------------------------
// write data to specfied fixed fields
//-----------------------------------------------------------------------
gpSpreadsheet.prototype.putFixedFields = function(data) {
  var result = webAppAPIErrorResult("putFixedFields failed");
  var sheet = this.sheet;
  
  if (sheet == null) {
    return webAppAPIErrorResult("putFixedFields failed: sheet is null");
  }
  
  try {
    for (var key in data) {
      var field = this.layout.fixedfields[key];
      this.__writeCell__(field.row, field.col, data[key]);
    }
    
    this.sheetData = this.getSheetData(this.layout.sourceDataSpreadsheet, this.layout.sheetName);
    result = webAppAPISuccessResult(data, "fixed fields written");
    
  } catch (e) {
    var msg = "putFixedFields failed";
    msg += " data=" + JSON.stringify(data);
    msg += " layout=" + JSON.stringify(this.layout.fixedfields);
    msg += " reported error=" + JSON.stringify(e);
    result = webAppAPIErrorResult(msg);
  }

  return result;
}

//-----------------------------------------------------------------------
// append array of row data after last row in spreadsheet data
//-----------------------------------------------------------------------
gpSpreadsheet.prototype.appendRow = function(data) {
  var result = webAppAPIErrorResult("appendRow failed");
  
  if (this.sheetData == null) {
    return webAppAPIErrorResult("appendRow failed: sheetData is null");
  }
  
  try {
    var rowData = this.sheetData[this.sheetData.length - 1];
    for (var i = 0; i < rowData.length; i++) {
      rowData[i] = "";
    }
    for (var key in data) {
      var field = this.layout.fields[key];
      rowData[field.col] = data[key];
    }
    
    var range = this.sheet.getRange(this.sheetData.length + 1, 1, 1, rowData.length);
    range.setValues([rowData]);
    this.sheetData = this.getSheetData(this.layout.sourceDataSpreadsheet, this.layout.sheetName);
    
  } catch (e) {
    var msg = "overlayRowFailed in testing/writing: ";
    msg += "data=" + JSON.stringify(data);
    msg += " layout fields=" + JSON.stringify(this.layout.fields)
    msg += " reported error=" + JSON.stringify(e);
    return webAppAPIErrorResult(msg);
  }
  
  result = webAppAPISuccessResult(data, "appendRow succeeded");
  return result;
}

//-----------------------------------------------------------------------
// overlay given values in rows matching criteria
//-----------------------------------------------------------------------
gpSpreadsheet.prototype.overlayRow = function(data) {
  var result = webAppAPIErrorResult("overlayRow failed");
  var criteria = data.criteria;
  var newdata = data.newdata;
  
  if (this.sheetData == null) {
    return webAppAPIErrorResult("overlayRow failed: sheetData is null");
  }
  
  for (var row = this.layout.firstDataRow; row < this.sheetData.length; row++) {
    var rowData = this.sheetData[row];
    try {
      if (this.__rowMeetsCriteria__(rowData, criteria)) {
        var before = rowData;
        for (key in newdata) {
          var field = this.layout.fields[key];
          rowData[field.col] = newdata[key];
        }
        
        var range = this.sheet.getRange(row + 1, 1, 1, rowData.length);
        range.setValues([rowData]);
      }

    } catch (e) {
      var msg = "overlayRowFailed in testing/writing: ";
      msg += "criteria=" + JSON.stringify(criteria);
      msg += " newdata=" + JSON.stringify(newdata);
      msg += " layout fields=" + JSON.stringify(this.layout.fields)
      msg += " reported error=" + JSON.stringify(e);
      return webAppAPIErrorResult(msg);
    }
  }
  
  this.sheetData = this.getSheetData(this.layout.sourceDataSpreadsheet, this.layout.sheetName);
  
  result = webAppAPISuccessResult(data, "overlayRow succeeded");
  
  return result;
}

//-----------------------------------------------------------------------
// (private) write cell value to given row and col
//-----------------------------------------------------------------------
gpSpreadsheet.prototype.__writeCell__ = function(row, col, cellValue) {
  var range = this.sheet.getRange(row + 1, col + 1);
  var arrValue = [[cellValue]];
  range.setValues(arrValue);
}

//-----------------------------------------------------------------------
// (private) package a row of data as JSON-style fields
//-----------------------------------------------------------------------
gpSpreadsheet.prototype.__packageRowData__ = function(rowData) {
  var objRowData = {};
  var fields = this.layout.fields;

  for (var key in fields) {
    objRowData[key] = rowData[fields[key].col];
  }
    
  return objRowData;
}  

//-----------------------------------------------------------------------
// (private) check if array of data matches fields in criteria object
//-----------------------------------------------------------------------
gpSpreadsheet.prototype.__rowMeetsCriteria__ = function(rowData, criteria) {
  var meetsCriteria = true;
  var fields = this.layout.fields;
  
  for (var key in criteria) {
    meetsCriteria = meetsCriteria && (rowData[fields[key].col] == criteria[key]);
    if (!meetsCriteria) break;
  }
  return meetsCriteria;
}

//-----------------------------------------------------------------------
// (private) open spreadsheet document with the given ID
//-----------------------------------------------------------------------
gpSpreadsheet.prototype.openSpreadsheetById = function(spreadsheetId) {
  return SpreadsheetApp.openById(spreadsheetId);
}

//-----------------------------------------------------------------------
// (private) get named sheet from spreadsheet document with the given ID
//-----------------------------------------------------------------------
gpSpreadsheet.prototype.getSheet = function(spreadsheetId, sheetName) {
  var sheet = null;
  var doc = this.openSpreadsheetById(spreadsheetId);

  if (doc != null) {
    sheet = doc.getSheetByName(sheetName);
  }
  
  return sheet;
}

//-----------------------------------------------------------------------
// (private) get all the data from the named sheet in the spreadsheet document with the given ID
//-----------------------------------------------------------------------
gpSpreadsheet.prototype.getSheetData = function(spreadsheetId, sheetName) {
  var data = null;
  var sheet = this.getSheet(spreadsheetId, sheetName);

  if (sheet != null) {
    data = sheet.getDataRange().getValues();
  }
  
  return data;
}

//************************************************************************
// end of static methods for gpSpreadsheet "class"
//************************************************************************

