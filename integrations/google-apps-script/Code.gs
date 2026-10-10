/**
 * Majesty Method website → Google Sheets bridge.
 *
 * Receives form submissions from the website and appends them to a sheet,
 * matching values to columns BY HEADER TEXT (column order doesn't matter).
 *
 * Setup: see README.md in this folder.
 * Script properties required:
 *   SHARED_SECRET   – same value as SHEETS_WEBHOOK_SECRET on the website server
 *   SPREADSHEET_ID  – ID of the destination spreadsheet (from its URL)
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var props = PropertiesService.getScriptProperties();
    var body = JSON.parse(e.postData && e.postData.contents || '{}');

    if (!props.getProperty('SHARED_SECRET') || body.secret !== props.getProperty('SHARED_SECRET')) {
      return json_({ ok: false, error: 'unauthorised' });
    }
    if (!body.submissionId || !body.sheetName || !body.values) {
      return json_({ ok: false, error: 'missing fields' });
    }

    lock.waitLock(20000);
    var ss = SpreadsheetApp.openById(props.getProperty('SPREADSHEET_ID'));

    // Idempotency: a hidden log of processed website submission IDs.
    var log = ss.getSheetByName('_website_sync_log');
    if (!log) {
      log = ss.insertSheet('_website_sync_log');
      log.appendRow(['submissionId', 'sheet', 'row', 'syncedAt']);
      log.hideSheet();
    }
    var ids = log.getRange(1, 1, Math.max(log.getLastRow(), 1), 1).getValues().map(function (r) { return r[0]; });
    if (ids.indexOf(body.submissionId) !== -1) {
      return json_({ ok: true, duplicate: true });
    }

    var sheet = ss.getSheetByName(body.sheetName);
    if (!sheet) return json_({ ok: false, error: 'Sheet "' + body.sheetName + '" not found' });

    var lastCol = Math.max(sheet.getLastColumn(), 1);
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function (h) { return String(h).trim(); });
    var row = new Array(headers.length).fill('');
    var unknown = [];
    var textCols = body.textColumns || [];

    // Timestamp as a real date so the sheet formats it like Google Form timestamps
    if (body.timestampColumn) {
      var ti = headers.indexOf(body.timestampColumn);
      if (ti !== -1) row[ti] = new Date(body.timestamp);
      else unknown.push(body.timestampColumn);
    }
    Object.keys(body.values).forEach(function (h) {
      var i = headers.indexOf(h);
      if (i === -1) {
        if (h.indexOf('Website:') === 0) {
          // Add the extra-answers column on first use
          sheet.getRange(1, headers.length + 1).setValue(h);
          headers.push(h); row.push('');
          i = headers.length - 1;
        } else { unknown.push(h); return; }
      }
      var v = String(body.values[h] == null ? '' : body.values[h]);
      // Neutralise spreadsheet formulas in visitor input
      if (/^[=+\-@]/.test(v)) v = "'" + v;
      row[i] = v;
    });

    var target = sheet.getLastRow() + 1;
    var range = sheet.getRange(target, 1, 1, row.length);
    // Keep phone numbers etc. as text (preserves leading zeros)
    textCols.forEach(function (h) {
      var i = headers.indexOf(h);
      if (i !== -1) sheet.getRange(target, i + 1).setNumberFormat('@');
    });
    range.setValues([row]);
    log.appendRow([body.submissionId, body.sheetName, target, new Date()]);

    return json_({ ok: true, row: target, unknownHeaders: unknown });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  } finally {
    try { lock.releaseLock(); } catch (e2) {}
  }
}

function doGet() {
  return json_({ ok: true, service: 'majesty-method-sheets-bridge' });
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
