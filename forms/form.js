/* ============================================================================
   הטופס שחיים ועינת ממלאים בטלפון, במסעדה, לפני שהמשחק מתחיל.
   הדף יודע מי ממלא לפי window.WHO ('dad' או 'mom') שנקבע בדף עצמו.
   ============================================================================ */
(function () {
  'use strict';

  var WHO = window.WHO === 'mom' ? 'mom' : 'dad';
  var F   = WHO === 'mom';                    /* פונים לעינת בלשון נקבה */
  var YOU = F ? 'חיים' : 'עינת';              /* בן/בת הזוג */
  var HIM = F ? 'אותו' : 'אותה';        /* מזכיר לך ___ */
  var ABOUT = F ? 'עליו' : 'עליה';      /* המחשבה הראשונה ___ */
  var ORDER = F ? 'יזמין' : 'תזמין';
  var KEY = 'thirty-form-' + WHO;

  var g = function (male, female) { return F ? female : male; };

  /* --- השאלות. min = מינימום תווים כדי שזה ייחשב תשובה ולא מלמול --- */
  var QS = [
    { id:'q1', min:110, type:'text',
      label:'איפה בדיוק ראית את ' + YOU + ' בפעם הראשונה?',
      hint:g('המקום, מי היה שם, מה לבשת אם אתה זוכר. תספר את זה כמו שהיית מספר לחבר.',
             'המקום, מי היה שם, מה לבשת אם את זוכרת. תספרי את זה כמו שהיית מספרת לחברה.'),
      ph:'זה היה ב…' },
    { id:'q2', min:90, type:'text',
      label:'מה הייתה המחשבה הראשונה שעברה לך בראש ' + ABOUT + '?',
      hint:'הכנה. לא היפה. אף אחד לא ייעלב, מבטיח.',
      ph:'האמת? חשבתי ש…' },
    { id:'q3', min:60, type:'text',
      label:'מי עשה את הצעד הראשון?',
      hint:'ולא רק מי — גם איך. בדיוק מה קרה.',
      ph:'זה היה…' },
    { id:'q4', min:0, type:'number',
      label:'כמה חודשים עברו מהפגישה הראשונה ועד ההצעה?',
      hint:g('מספר. בלי להתייעץ, בלי לבדוק ביומן. מה שאתה זוכר.',
             'מספר. בלי להתייעץ, בלי לבדוק ביומן. מה שאת זוכרת.'),
      ph:'' },
    { id:'q5', min:55, type:'text',
      label:'איזה שיר מזכיר לך ' + HIM + '?',
      hint:'שם השיר, ולמה דווקא הוא.',
      ph:'השיר הוא… ובגלל ש…' },
    { id:'q6', min:130, type:'text',
      label:'הרגע הכי גדול של 30 השנים האלה. אחד.',
      hint:g('רק אחד. תבחר, ותספר למה דווקא הוא זה שנשאר.',
             'רק אחד. תבחרי, ותספרי למה דווקא הוא זה שנשאר.'),
      ph:'הרגע הוא…' },
    { id:'q7', min:120, type:'text',
      label:'מה הריב הכי מטופש שהיה לכם אי פעם?',
      hint:'על מה בדיוק רבתם, ומי צדק. לפי הגרסה שלך.',
      ph:'רבנו על…' },
    { id:'q8', min:25, type:'text',
      label:'בלי להסתכל בתפריט: מה ' + YOU + ' ' + ORDER + ' הערב?',
      hint:'ניחוש. הכרטיס הזה ייפתח רק בקינוח.',
      ph:'' }
  ];

  var wrap = document.getElementById('questions');
  var sendBtn = document.getElementById('send');
  var progress = document.getElementById('progress');
  var errBox = document.getElementById('err');
  var doneBox = document.getElementById('done');
  var saved = load();

  /* ---------- בניית השאלות ---------- */
  QS.forEach(function (q, i) {
    var el = document.createElement('div');
    el.className = 'q';
    el.dataset.id = q.id;

    var field = q.type === 'number'
      ? '<input type="number" inputmode="numeric" min="1" max="600" id="f_' + q.id + '" placeholder="' + q.ph + '">'
      : '<textarea id="f_' + q.id + '" rows="4" placeholder="' + esc(q.ph) + '"></textarea>';

    el.innerHTML =
      '<div class="q-head"><span class="q-num">' + (i + 1) + '.</span>' +
      '<h2 class="q-label">' + esc(q.label) + '</h2></div>' +
      '<p class="q-hint">' + esc(q.hint) + '</p>' +
      field +
      '<div class="meter"><span class="bar"><i></i></span><span class="meter-txt"></span></div>';

    wrap.appendChild(el);
  });

  /* רק אחרי שכל השדות קיימים אפשר לחשב התקדמות */
  QS.forEach(function (q) {
    var el = wrap.querySelector('.q[data-id="' + q.id + '"]');
    var input = document.getElementById('f_' + q.id);
    if (!el || !input) return;
    if (saved && saved[q.id]) input.value = saved[q.id];
    input.addEventListener('input', function () { update(q, el, input); save(); });
    update(q, el, input);
  });

  /* ---------- מד ההתקדמות של כל שאלה ---------- */
  function update(q, el, input) {
    var v = String(input.value || '').trim();
    var bar = el.querySelector('.bar i');
    var txt = el.querySelector('.meter-txt');

    if (q.type === 'number') {
      var n = parseInt(v, 10);
      var ok = !isNaN(n) && n > 0 && n <= 600;
      el.classList.toggle('ok', ok);
      bar.style.width = ok ? '100%' : '0%';
      txt.textContent = ok ? 'מספר התקבל' : 'מספר חודשים';
      refresh();
      return;
    }

    var need = q.min;
    var have = v.length;
    var pct = Math.min(100, Math.round(have / need * 100));
    var ok2 = have >= need;
    el.classList.toggle('ok', ok2);
    bar.style.width = pct + '%';

    if (ok2) {
      txt.textContent = 'מספיק. אפשר גם יותר.';
    } else if (have === 0) {
      txt.textContent = 'עוד לא נכתב כלום';
    } else if (pct > 65) {
      txt.textContent = 'כמעט. עוד משפט.';
    } else if (pct > 25) {
      txt.textContent = 'תמשיך, זה מעניין';
    } else {
      txt.textContent = 'קצר מדי — תספר קצת יותר';
    }
    refresh();
  }

  function values() {
    var out = {};
    QS.forEach(function (q) {
      var el = document.getElementById('f_' + q.id);
      out[q.id] = el ? String(el.value || '').trim() : '';
    });
    return out;
  }

  function complete() {
    var n = 0;
    QS.forEach(function (q) {
      var el = document.getElementById('f_' + q.id);
      var v = el ? String(el.value || '').trim() : '';
      if (q.type === 'number') {
        var num = parseInt(v, 10);
        if (!isNaN(num) && num > 0 && num <= 600) n++;
      } else if (v.length >= q.min) n++;
    });
    return n;
  }

  function refresh() {
    var n = complete();
    var all = n === QS.length;
    sendBtn.disabled = !all;
    progress.innerHTML = all
      ? 'הכל מוכן. אפשר לשלוח.'
      : '<b>' + n + '</b> מתוך ' + QS.length + ' תשובות מוכנות';
  }

  /* ---------- שמירה מקומית, כדי ששום דבר לא ילך לאיבוד ---------- */
  function save() { try { localStorage.setItem(KEY, JSON.stringify(values())); } catch (e) {} }
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }

  /* ---------- שליחה ---------- */
  sendBtn.addEventListener('click', function () {
    var url = window.SCRIPT_URL || '';
    errBox.classList.remove('on');

    if (!url || url.indexOf('PASTE_') === 0) {
      showErr('הטופס עוד לא חובר לגיליון. שיר — יש להדביק את הכתובת ב-forms/config.js');
      return;
    }

    sendBtn.disabled = true;
    sendBtn.textContent = 'שולח…';
    save();

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ who: WHO, answers: values() })
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res && res.ok) { finish(); }
        else { throw new Error((res && res.error) || 'unknown'); }
      })
      .catch(function () {
        /* יש רשתות שחוסמות קריאת תשובה. שולחים שוב בעיוורון ומוודאים בקריאה */
        fetch(url, {
          method: 'POST', mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ who: WHO, answers: values() })
        })
          .then(function () { return verify(url); })
          .catch(function () { return verify(url); });
      });
  });

  /* מוודאים מול הגיליון שהתשובה באמת נחתה */
  function verify(url) {
    return fetch(url + '?t=' + Date.now())
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res && res.ok && res.answers && res.answers[WHO] && res.answers[WHO].q1) finish();
        else throw new Error('not saved');
      })
      .catch(function () {
        sendBtn.disabled = false;
        sendBtn.textContent = 'לשלוח שוב';
        showErr(g('התשובות נשמרו בטלפון, אבל השליחה לא עברה — כנראה הרשת. נסה שוב, ואם זה נתקע תראה את המסך לשיר.','התשובות נשמרו בטלפון, אבל השליחה לא עברה — כנראה הרשת. נסי שוב, ואם זה נתקע תראי את המסך לשיר.'));
      });
  }

  function finish() {
    doneBox.classList.add('on');
    document.body.style.overflow = 'hidden';
  }

  function showErr(msg) {
    errBox.textContent = msg;
    errBox.classList.add('on');
    errBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  document.getElementById('again').addEventListener('click', function () {
    doneBox.classList.remove('on');
    document.body.style.overflow = '';
    sendBtn.disabled = false;
    sendBtn.textContent = 'לשלוח את התשובות';
    refresh();
  });

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  refresh();
})();
