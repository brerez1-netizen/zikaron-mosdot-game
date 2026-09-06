/**
 * מייצר את עשרת האיורים לזוגות שאין להם תמונה בבנק המצגות.
 * רובם כללי מספרים (מניין, מועדים, עונשים), ושרטוט שמסמן את המספר עצמו
 * עדיף שם על צילום אווירה. הסגנון מועתק ממצגת השיעור: רקע פחם, אור ירוק.
 *
 *   node tools/make-svgs.mjs
 */
import { writeFileSync } from "node:fs";

const BG = "#141d24";
const INK = "#eef3f0";
const DIM = "#8fa3a0";
const GREEN = "#4ade80";
const LIME = "#b6e34a";
const RED = "#e5675d";

const W = 800;
const H = 600;

/** ראש כל קובץ: רקע, זוהר רך במרכז, וגופן מערכת שתומך בעברית. */
const head = (glow = GREEN) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="Segoe UI, Arial, sans-serif" direction="rtl">
<defs>
  <radialGradient id="g" cx="50%" cy="45%" r="65%">
    <stop offset="0%" stop-color="${glow}" stop-opacity=".20"/>
    <stop offset="100%" stop-color="${glow}" stop-opacity="0"/>
  </radialGradient>
  <filter id="blur"><feGaussianBlur stdDeviation="9"/></filter>
</defs>
<rect width="${W}" height="${H}" fill="${BG}"/>
<rect width="${W}" height="${H}" fill="url(#g)"/>`;

const tail = `</svg>`;

/** כותרת עליונה וכיתוב תחתון, זהים בכל האיורים כדי שייקראו כסדרה. */
const title = (t) =>
  `<text x="${W / 2}" y="62" fill="${INK}" font-size="34" font-weight="700" text-anchor="middle">${t}</text>`;
const caption = (t, color = DIM) =>
  `<text x="${W / 2}" y="${H - 38}" fill="${color}" font-size="24" text-anchor="middle">${t}</text>`;

/** כיסא סביב שולחן. mode: on = נוכח, off = ריק, out = יצא מהחדר. */
function seat(cx, cy, mode, r = 21) {
  const fill = mode === "on" ? GREEN : "none";
  const stroke = mode === "out" ? RED : mode === "on" ? GREEN : DIM;
  const dash = mode === "off" ? ' stroke-dasharray="5 5"' : "";
  const op = mode === "off" ? ".55" : "1";
  let s = `<g opacity="${op}"><circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="3"${dash}/>`;
  if (mode === "out") {
    const d = r * 0.6;
    s += `<line x1="${cx - d}" y1="${cy - d}" x2="${cx + d}" y2="${cy + d}" stroke="${RED}" stroke-width="3.5"/>`;
    s += `<line x1="${cx + d}" y1="${cy - d}" x2="${cx - d}" y2="${cy + d}" stroke="${RED}" stroke-width="3.5"/>`;
  }
  return s + `</g>`;
}

/** מסמנים את היו"ר בכתר קטן מעל הכיסא, כי כמעט כל כלל מניין תלוי בו. */
const chairMark = (cx, cy) =>
  `<text x="${cx}" y="${cy - 34}" fill="${LIME}" font-size="19" font-weight="700" text-anchor="middle">יו"ר</text>`;

/** שולחן עגול עם n מושבים; present = אילו מהם נוכחים, chairIdx = מי היו"ר. */
function roundTable(n, present, { cx = W / 2, cy = 300, rx = 210, ry = 130, chairIdx = 0, outIdx = -1 } = {}) {
  let s = `<ellipse cx="${cx}" cy="${cy}" rx="${rx - 60}" ry="${ry - 45}" fill="none" stroke="${DIM}" stroke-width="2" opacity=".5"/>`;
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    const x = cx + rx * Math.cos(a);
    const y = cy + ry * Math.sin(a);
    const mode = i === outIdx ? "out" : present.includes(i) ? "on" : "off";
    s += seat(x, y, mode);
    if (i === chairIdx) s += chairMark(x, y);
  }
  return s;
}

const files = {};

/* ---------- לוח ב': כללי ישיבה ---------- */

// דחיית פתיחת הישיבה בחמש עשרה דקות
files["b-15min"] =
  head() +
  title("אין מניין בפתיחה") +
  `<circle cx="${W / 2}" cy="300" r="118" fill="none" stroke="${DIM}" stroke-width="6"/>
   <path d="M400 182 A118 118 0 0 1 518 300 L400 300 Z" fill="${GREEN}" opacity=".30"/>
   <line x1="400" y1="300" x2="400" y2="196" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
   <line x1="400" y1="300" x2="496" y2="300" stroke="${LIME}" stroke-width="7" stroke-linecap="round"/>
   <circle cx="400" cy="300" r="9" fill="${INK}"/>
   <text x="565" y="250" fill="${LIME}" font-size="46" font-weight="700">15</text>
   <text x="565" y="286" fill="${DIM}" font-size="23">דקות</text>` +
  caption("היושב ראש דוחה את פתיחת הישיבה") +
  tail;

// המשך ישיבה שנפתחה כדין
files["b-continue"] =
  head() +
  title("המשך ישיבה שנפתחה כדין") +
  roundTable(9, [0, 3, 6], { chairIdx: 0 }) +
  `<text x="${W / 2}" y="470" fill="${LIME}" font-size="30" font-weight="700" text-anchor="middle">יו"ר + 2 חברים, לכל אורך הישיבה</text>` +
  caption("ירדו מתחת לזה, והמשך הדיון אינו כדין") +
  tail;

// מוסד תכנון קטן משלושה חברים
files["b-small"] =
  head() +
  title("מוסד תכנון עם פחות מארבעה חברים") +
  roundTable(3, [0, 1], { chairIdx: 0, rx: 165, ry: 105 }) +
  `<text x="${W / 2}" y="470" fill="${LIME}" font-size="34" font-weight="700" text-anchor="middle">מניין של שניים לפחות</text>` +
  caption("כלל נפרד, שלא נגזר ממחצית ולא משליש") +
  tail;

// דעות שקולות
files["b-tie"] =
  head(LIME) +
  title("הדעות בהצבעה שקולות") +
  `<g stroke="${DIM}" stroke-width="3" fill="none">
     <line x1="400" y1="180" x2="400" y2="410"/>
     <line x1="235" y1="215" x2="565" y2="215"/>
     <line x1="235" y1="215" x2="235" y2="270"/>
     <line x1="565" y1="215" x2="565" y2="270"/>
     <path d="M330 410 L470 410"/>
   </g>
   <rect x="170" y="270" width="130" height="58" rx="9" fill="${GREEN}" opacity=".25" stroke="${GREEN}" stroke-width="2.5"/>
   <rect x="500" y="270" width="130" height="58" rx="9" fill="${RED}" opacity=".25" stroke="${RED}" stroke-width="2.5"/>
   <text x="235" y="308" fill="${INK}" font-size="27" font-weight="700" text-anchor="middle">בעד</text>
   <text x="565" y="308" fill="${INK}" font-size="27" font-weight="700" text-anchor="middle">נגד</text>
   <circle cx="400" cy="150" r="27" fill="${LIME}" opacity=".28" stroke="${LIME}" stroke-width="3"/>
   <text x="400" y="159" fill="${LIME}" font-size="26" font-weight="700" text-anchor="middle">+1</text>` +
  `<text x="${W / 2}" y="470" fill="${LIME}" font-size="30" font-weight="700" text-anchor="middle">ליושב ראש קול נוסף באותו עניין</text>` +
  caption("לא הצבעה חוזרת ולא דחייה לישיבה הבאה") +
  tail;

// שבעה ימים לסדר היום
files["b-agenda7"] =
  head() +
  title("משלוח סדר היום לחברים") +
  (() => {
    let s = "";
    for (let i = 0; i < 8; i++) {
      const x = 108 + i * 74;
      const last = i === 7;
      s += `<rect x="${x}" y="250" width="58" height="66" rx="8" fill="${last ? GREEN : "none"}" opacity="${last ? ".28" : "1"}" stroke="${last ? GREEN : DIM}" stroke-width="2.5"/>`;
      s += `<text x="${x + 29}" y="292" fill="${last ? INK : DIM}" font-size="22" text-anchor="middle">${last ? "ישיבה" : 7 - i}</text>`;
    }
    return s;
  })() +
  `<line x1="108" y1="352" x2="580" y2="352" stroke="${LIME}" stroke-width="3"/>
   <text x="344" y="392" fill="${LIME}" font-size="30" font-weight="700" text-anchor="middle">שבעה ימים לפחות</text>` +
  caption("ומצורפים אליו המסמכים הנדרשים לדיון") +
  tail;

/* ---------- לוח ג': טוהר המידות ---------- */

// עניין אישי: יציאה מהחדר
files["c-recuse"] =
  head(RED) +
  title("לחבר יש עניין אישי בנושא שעל הפרק") +
  roundTable(8, [0, 1, 2, 4, 5, 6, 7], { chairIdx: 0, outIdx: 3 }) +
  `<text x="${W / 2}" y="470" fill="${INK}" font-size="27" font-weight="700" text-anchor="middle">מודיע מיד ליו"ר, יוצא מהדיון, לא מצביע</text>` +
  caption("לא מספיק להימנע בהצבעה ולהישאר בחדר", RED) +
  tail;

// עונש על הפרת חובת ניגוד העניינים
files["c-1year"] =
  head(RED) +
  title("הפר את חובת ניגוד העניינים") +
  `<text x="${W / 2}" y="300" fill="${RED}" font-size="150" font-weight="700" text-anchor="middle" filter="url(#blur)" opacity=".45">1</text>
   <text x="${W / 2}" y="300" fill="${INK}" font-size="150" font-weight="700" text-anchor="middle">1</text>
   <text x="${W / 2}" y="358" fill="${INK}" font-size="42" font-weight="700" text-anchor="middle">שנת מאסר</text>
   <text x="${W / 2}" y="412" fill="${DIM}" font-size="24" text-anchor="middle">סעיף 47(ג)</text>` +
  caption("ואין בכך כדי לגרוע מאחריות אזרחית") +
  tail;

// עונש על הצבעה בעד אישור שלא כדין
files["c-3years"] =
  head(RED) +
  title("הצביע בעד אישור בניגוד לחוק") +
  `<text x="${W / 2}" y="300" fill="${RED}" font-size="150" font-weight="700" text-anchor="middle" filter="url(#blur)" opacity=".45">3</text>
   <text x="${W / 2}" y="300" fill="${INK}" font-size="150" font-weight="700" text-anchor="middle">3</text>
   <text x="${W / 2}" y="358" fill="${INK}" font-size="42" font-weight="700" text-anchor="middle">שנות מאסר</text>
   <text x="${W / 2}" y="412" fill="${DIM}" font-size="24" text-anchor="middle">סעיף 251</text>` +
  caption("רק אם ההחלטה אושרה במוסד התכנון") +
  tail;

// ניגוד עניינים תדיר
files["c-tadir"] =
  head(RED) +
  title("ניגוד עניינים תדיר") +
  `<rect x="196" y="196" width="408" height="150" rx="14" fill="none" stroke="${DIM}" stroke-width="3" stroke-dasharray="8 7"/>
   <text x="400" y="272" fill="${DIM}" font-size="32" text-anchor="middle">כיסא חבר מוסד תכנון</text>
   <text x="400" y="314" fill="${DIM}" font-size="24" text-anchor="middle">נשאר ריק</text>
   <line x1="230" y1="352" x2="570" y2="228" stroke="${RED}" stroke-width="5"/>
   <text x="${W / 2}" y="430" fill="${INK}" font-size="28" font-weight="700" text-anchor="middle">לא יתחיל לכהן, ואם כיהן - יחדל</text>` +
  caption("זו פסילה מהתפקיד, לא הימנעות מדיון אחד", RED) +
  tail;

// בדיקת ניגוד עניינים בוועדה מקומית
files["c-21days"] =
  head() +
  title("בדיקת ניגוד עניינים בוועדה מקומית") +
  `<rect x="150" y="200" width="215" height="110" rx="12" fill="none" stroke="${DIM}" stroke-width="2.5"/>
   <text x="257" y="248" fill="${INK}" font-size="24" text-anchor="middle">החבר מוסר</text>
   <text x="257" y="282" fill="${INK}" font-size="24" text-anchor="middle">את המידע</text>
   <rect x="435" y="200" width="215" height="110" rx="12" fill="${GREEN}" opacity=".18" stroke="${GREEN}" stroke-width="2.5"/>
   <text x="542" y="248" fill="${INK}" font-size="24" text-anchor="middle">היועץ המשפטי</text>
   <text x="542" y="282" fill="${INK}" font-size="24" text-anchor="middle">של הוועדה קובע</text>
   <line x1="425" y1="255" x2="375" y2="255" stroke="${LIME}" stroke-width="3.5" marker-end="url(#a)"/>
   <path d="M375 255 l16 -8 v16 z" fill="${LIME}"/>
   <text x="400" y="378" fill="${LIME}" font-size="38" font-weight="700" text-anchor="middle">21 ימים</text>` +
  caption("לא היועץ המשפטי לממשלה, אלא של הוועדה עצמה") +
  tail;

for (const [name, svg] of Object.entries(files)) {
  writeFileSync(`images/${name}.svg`, svg.replace(/\n\s+/g, "\n  "), "utf8");
  console.log(`images/${name}.svg`);
}
