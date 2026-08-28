/* ============================================================================
   30 שנה: המבחן — המחבר בין הטפסים לגיליון
   ----------------------------------------------------------------------------
   הוראות התקנה, פעם אחת, לוקח שלוש דקות:

   1. sheets.new  →  צור גיליון חדש. תן לו שם, למשל "30 שנה — תשובות".
   2. בתפריט:  Extensions  →  Apps Script
   3. מחק את הקוד שיש שם, הדבק את כל הקובץ הזה, ושמור (⌘S).
   4. למעלה מימין:  Deploy  →  New deployment
        Select type (גלגל השיניים)  →  Web app
        Description:            30 שנה
        Execute as:             Me
        Who has access:         Anyone          ← חשוב! לא "Anyone with Google account"
        →  Deploy
   5. גוגל יבקש הרשאה. לחץ Authorize, בחר את החשבון שלך,
      ואם מופיע מסך "Google hasn't verified this app":
        Advanced  →  Go to <שם הפרויקט> (unsafe)  →  Allow
      (זה הסקריפט שלך, שכתבת בעצמך. האזהרה היא סטנדרטית.)
   6. העתק את הכתובת שמסתיימת ב-/exec  והדבק אותה בשני מקומות:
        • forms/config.js       →  SCRIPT_URL
        • index.html            →  SCRIPT_URL  (בראש אזור העריכה)

   שינית משהו בקוד? צריך Deploy → Manage deployments → עריכה → Version: New
   אחרת השינוי לא ייכנס לתוקף.
   ============================================================================ */

var SHEET_NAME = 'תשובות';

function doGet(e) {
  try {
    return json_({ ok: true, answers: readAll_() });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    if (!data || (data.who !== 'dad' && data.who !== 'mom')) {
      return json_({ ok: false, error: 'missing who' });
    }
    write_(data.who, data.answers || {});
    return json_({ ok: true, who: data.who });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(['נשלח', 'מי', 'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8']);
    sh.setFrozenRows(1);
  }
  return sh;
}

/* שליחה חוזרת דורסת את השורה הקודמת של אותו אדם */
function write_(who, a) {
  var sh = sheet_();
  var row = [new Date(), who];
  for (var i = 1; i <= 8; i++) row.push(String(a['q' + i] || ''));

  var values = sh.getDataRange().getValues();
  for (var r = 1; r < values.length; r++) {
    if (values[r][1] === who) {
      sh.getRange(r + 1, 1, 1, row.length).setValues([row]);
      return;
    }
  }
  sh.appendRow(row);
}

function readAll_() {
  var sh = sheet_();
  var values = sh.getDataRange().getValues();
  var out = { dad: null, mom: null };
  for (var r = 1; r < values.length; r++) {
    var who = values[r][1];
    if (who !== 'dad' && who !== 'mom') continue;
    var a = {};
    for (var i = 1; i <= 8; i++) a['q' + i] = String(values[r][i + 1] || '');
    out[who] = a;
  }
  return out;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
