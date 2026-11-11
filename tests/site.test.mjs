/* Tests voor de site van Team Noel-Willockx (acht pagina's).
   Uitvoeren:  npm test   (of: node --test tests/site.test.mjs)
   Geen dependencies. De render-tests gebruiken een geïnstalleerde Chrome of
   Edge in headless modus en worden overgeslagen als die er niet is. */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import http from 'node:http';
import { execFileSync, execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const css = read('style.css');
const js = read('style.js');

/* De navigatie van de referentiesite, in het Nederlands, met hun pagina. */
const NAV = [
  ['Home', 'index.html'],
  ['Nieuws', 'nieuws.html'],
  ['Over ons', 'over-ons.html'],
  ['Bloedlijnen', 'bloedlijnen.html'],
  ['Duiven te koop', 'duiven-te-koop.html'],
  ['Uitslagen', 'uitslagen.html'],
  ['Referenties', 'referenties.html'],
  ['Contact', 'contact.html']
];
const PAGES = NAV.map(([, f]) => f);
const html = Object.fromEntries(PAGES.map((f) => [f, read(f)]));

const strip = (s) => s.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const anchors = (block) => [...block.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map((m) => ({
  href: m[1].match(/href="([^"]*)"/)?.[1], current: /aria-current="page"/.test(m[1]), text: strip(m[2]).trim()
}));
const block = (page, re) => { const m = html[page].match(re); assert.ok(m, `${page}: blok ${re} gevonden`); return m[0]; };
const idsOf = (page) => [...html[page].matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);

const data = (() => {
  const ctx = { window: {} };
  vm.runInNewContext(read('data.js'), ctx);
  return ctx.window.NW_DATA;
})();

/* ids die style.js pas in de browser tekent, per pagina */
const dynamicIds = {
  'nieuws.html': Array.from(data.nieuws, (n) => n.id),
  'bloedlijnen.html': Array.from(data.lijnen, (l) => 'lijn-' + l.id)
};

describe('structuur van de site', () => {
  test('de acht pagina\'s uit de navigatie bestaan', () => {
    for (const f of PAGES) assert.ok(fs.existsSync(path.join(ROOT, f)), f);
    const extra = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html') && !PAGES.includes(f));
    assert.deepEqual(extra, [], 'geen losse HTML-pagina\'s buiten de navigatie');
  });

  test('titels en meta descriptions zijn uniek en hebben een bruikbare lengte', () => {
    const titles = PAGES.map((f) => html[f].match(/<title>([^<]+)<\/title>/)[1]);
    const descs = PAGES.map((f) => html[f].match(/<meta name="description" content="([^"]+)"/)[1]);
    assert.equal(new Set(titles).size, PAGES.length, 'unieke titels');
    assert.equal(new Set(descs).size, PAGES.length, 'unieke descriptions');
    titles.forEach((t, i) => assert.ok(t.includes('Team Noel-Willockx'), `${PAGES[i]}: titel bevat de teamnaam`));
    descs.forEach((d, i) => assert.ok(d.length >= 70 && d.length <= 170, `${PAGES[i]}: description is ${d.length} tekens`));
  });

  test('kop, mobiel menu en voet zijn op elke pagina gelijk (op de actieve link na)', () => {
    const norm = (s) => s.replace(/ aria-current="page"/g, '');
    const ref = {
      head: norm(block('index.html', /<header class="head"[\s\S]*?<\/header>/)),
      mnav: norm(block('index.html', /<div class="mnav"[\s\S]*?<\/div>/)),
      foot: norm(block('index.html', /<footer[\s\S]*?<\/footer>/))
    };
    for (const f of PAGES) {
      assert.equal(norm(block(f, /<header class="head"[\s\S]*?<\/header>/)), ref.head, `${f}: kop`);
      assert.equal(norm(block(f, /<div class="mnav"[\s\S]*?<\/div>/)), ref.mnav, `${f}: mobiel menu`);
      assert.equal(norm(block(f, /<footer[\s\S]*?<\/footer>/)), ref.foot, `${f}: voet`);
    }
  });
});

for (const page of PAGES) {
  describe(page, () => {
    const h = html[page];

    test('is een Nederlandstalig document met basis-meta', () => {
      assert.match(h, /^<!doctype html>/i);
      assert.match(h, /<html lang="nl">/);
      assert.match(h, /<meta charset="utf-8">/);
      assert.match(h, /<meta name="viewport" content="width=device-width, initial-scale=1">/);
    });

    test('heeft exact één h1 en geen overgeslagen kopniveaus', () => {
      const levels = [...h.matchAll(/<h([1-6])\b/g)].map((m) => +m[1]);
      assert.equal(levels.filter((l) => l === 1).length, 1);
      levels.reduce((prev, cur) => { assert.ok(cur <= prev + 1, `h${cur} volgt op h${prev}`); return cur; }, 0);
    });

    test('hoofd-, mobiele en voetnavigatie tonen de 8 items in volgorde en markeren deze pagina', () => {
      for (const re of [/<nav class="nav"[\s\S]*?<\/nav>/, /<div class="mnav"[\s\S]*?<\/nav>/, /<nav class="foot-nav"[\s\S]*?<\/nav>/]) {
        const a = anchors(block(page, re));
        assert.deepEqual(a.map((x) => [x.text, x.href]), NAV);
        assert.deepEqual(a.filter((x) => x.current).map((x) => x.href), [page], 'alleen deze pagina is actief');
      }
    });

    test('elke link wijst naar een bestaande pagina, een bestaand bestand of een bestaand id', () => {
      const own = new Set(idsOf(page));
      const hrefs = [...h.matchAll(/\s(?:href|src|action)="([^"]+)"/g)].map((m) => m[1]).filter((u) => !/^(https?:|mailto:|tel:|data:)/.test(u));
      assert.ok(hrefs.length >= 20);
      for (const u of hrefs) {
        const [file, hash] = u.split('#');
        const target = file.split('?')[0];
        if (target) assert.ok(fs.existsSync(path.join(ROOT, target)), `${u}: bestand bestaat`);
        if (hash) {
          const p = target || page;
          const known = target ? new Set([...idsOf(p), ...(dynamicIds[p] || [])]) : own;
          assert.ok(known.has(hash), `${u}: id #${hash} bestaat op ${p}`);
        }
      }
    });

    test('ids zijn uniek', () => {
      const ids = idsOf(page);
      assert.equal(new Set(ids).size, ids.length);
    });

    test('elk formulierveld heeft een label, elke knop een type en een naam', () => {
      const labels = (h.match(/<label[\s\S]*?<\/label>/g) || []).join('\n');
      for (const m of h.matchAll(/<(input|select|textarea)\b([^>]*)>/g)) {
        if (/aria-hidden="true"/.test(m[2])) continue; // honeypot
        const name = m[2].match(/name="([^"]+)"/)?.[1];
        assert.ok(name && labels.includes(`name="${name}"`), `<${m[1]} name="${name}"> zit in een label`);
      }
      for (const m of h.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)) {
        assert.match(m[1], /type="(button|submit)"/, 'knop heeft een type');
        assert.ok(/aria-label="[^"]+"/.test(m[1]) || strip(m[2]).trim().length > 0, 'knop heeft een toegankelijke naam');
      }
    });

    test('zichtbare tekst is Nederlands en demo-inhoud is gemarkeerd', () => {
      const tekst = strip(h);
      for (const w of ['Read more', 'Buy me', 'More information', 'For sale', 'Pigeons', 'About us', 'Race results', 'References', 'Contact us', 'Submit', 'Learn more', 'Sold', 'Bloodlines', 'News']) {
        assert.ok(!new RegExp(`\\b${w}\\b`, 'i').test(tekst), `geen "${w}" in de tekst`);
      }
      assert.match(h, /Demo-ontwerp: .*voorbeeldinhoud/);
    });
  });
}

describe('links die style.js en data.js maken', () => {
  test('wijzen naar bestaande pagina\'s', () => {
    const bron = js + read('data.js');
    const refs = [...bron.matchAll(/['"]([a-z-]+\.html)(?:[?#][^'"]*)?['"]/g)].map((m) => m[1]);
    assert.ok(refs.length >= 6);
    for (const r of refs) assert.ok(PAGES.includes(r), `${r} bestaat`);
  });

  test('ankers in nieuwsberichten bestaan op de doelpagina', () => {
    for (const n of data.nieuws) {
      if (!n.link) continue;
      const [file, hash] = n.link.href.split('#');
      const p = file.split('?')[0];
      assert.ok(PAGES.includes(p), `${n.id}: ${p}`);
      if (hash) assert.ok([...idsOf(p), ...(dynamicIds[p] || [])].includes(hash), `${n.id}: #${hash} op ${p}`);
      const duif = n.link.href.match(/[?&]duif=([a-z0-9-]+)/)?.[1];
      if (duif) assert.ok(data.duiven.some((d) => d.id === duif), `${n.id}: duif ${duif} bestaat`);
    }
  });

  test('tekst in style.js is Nederlands', () => {
    const tekst = [...js.matchAll(/'([^'\\]*(?:\\.[^'\\]*)*)'/g)].map((m) => m[1]).filter((s) => / /.test(s) && !/[<>=;{}]/.test(s)).join(' ');
    for (const w of ['Read more', 'Buy me', 'More information', 'Submit', 'Learn more', 'Sold']) assert.ok(!new RegExp(`\\b${w}\\b`, 'i').test(tekst), `geen "${w}"`);
  });
});

describe('style.css', () => {
  test('accolades zijn in balans', () => {
    const kaal = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/"[^"]*"/g, '""');
    assert.equal((kaal.match(/{/g) || []).length, (kaal.match(/}/g) || []).length);
  });

  test('elke gebruikte CSS-variabele is gedefinieerd of krijgt inline een waarde', () => {
    const defined = new Set([...css.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));
    for (const m of (Object.values(html).join('') + js).matchAll(/(--[\w-]+)\s*:/g)) defined.add(m[1]);
    for (const m of css.matchAll(/var\((--[\w-]+)(,[^)]*)?\)/g)) assert.ok(defined.has(m[1]) || m[2], `${m[1]} is gedefinieerd`);
  });

  test('elke class in de HTML heeft een stijl of wordt door het script gebruikt', () => {
    const used = new Set(Object.values(html).flatMap((h) => [...h.matchAll(/\sclass="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/))));
    // omhulsels en naamhaken die bewust geen eigen stijl hebben
    const HAKEN = ['roof-birds', 'lijn-list', 'board', 'board-wrap', 'demo', 'artikels', 'refs', 'foot-form'];
    const zonder = [...used].filter((c) => c && !HAKEN.includes(c) && !new RegExp(`\\.${c}(?![\\w-])`).test(css) && !js.includes(c));
    assert.deepEqual(zonder, []);
  });

  test('respecteert "minder beweging" en toont zichtbare focus', () => {
    assert.match(css, /\.rustig \*/);
    assert.match(css, /prefers-reduced-motion: reduce/);
    assert.match(css, /:focus-visible\s*{[^}]*outline/);
  });

  test('tekstkleuren halen WCAG AA-contrast op hun achtergrond', () => {
    const v = Object.fromEntries([...css.matchAll(/(--[\w-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]));
    const lum = (hex) => {
      const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
      return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    };
    const ratio = (a, b) => { const [x, y] = [lum(v[a]), lum(v[b])].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
    const paren = [['--lei', '--mist'], ['--veer', '--mist'], ['--veer', '--wolk'], ['--iris-d', '--mist'], ['--mist', '--lei'], ['--veer-2', '--lei'], ['--lei', '--iris'], ['--iris', '--lei']];
    for (const [fg, bg] of paren) {
      const r = ratio(fg, bg);
      assert.ok(r >= 4.5, `${fg} op ${bg} = ${r.toFixed(2)}:1`);
    }
  });
});

describe('JavaScript', () => {
  test('style.js en data.js zijn syntactisch geldig', () => {
    for (const f of ['style.js', 'data.js']) execFileSync(process.execPath, ['--check', path.join(ROOT, f)]);
  });

  test('beweging komt uit CSS en style.js zelf, zonder bibliotheken, en is zonder script niet nodig', () => {
    for (const f of PAGES) assert.ok(!/vendor\/|gsap|lenis/i.test(html[f]), `${f}: geen animatiescripts`);
    assert.ok(!/gsap|lenis/i.test(js), 'style.js gebruikt geen animatiebibliotheek');
    // de verborgen begintoestand hangt aan attributen die style.js zet, niet aan de HTML
    for (const f of PAGES) assert.ok(!/data-rv|data-split|class="w"/.test(html[f]), `${f}: niets verborgen zonder script`);
    assert.match(js, /classList\.contains\('rustig'\)/, 'bij minder beweging start style.js de beweging niet');
  });
});

describe('data.js', () => {
  const KLEUR = ['blauwband', 'schalie', 'donker', 'schimmel', 'vaal', 'witpen'];
  const OOG = ['oranje', 'rood', 'parel', 'geel'];
  const RING = /^[A-Z]{2}\d{2}-\d{7}$/;

  test('bloedlijnen zijn volledig', () => {
    assert.ok(data.lijnen.length >= 3);
    for (const l of data.lijnen) {
      assert.match(l.ring, RING, l.naam);
      assert.ok(KLEUR.includes(l.kleur) && OOG.includes(l.oog), l.naam);
      assert.ok(l.intro.length > 30 && l.palmares.length >= 2, l.naam);
    }
    assert.equal(new Set(data.lijnen.map((l) => l.id)).size, data.lijnen.length);
  });

  test('elke duif heeft geldige ring, kleur, oog, lijn, prijs en ouders', () => {
    const lijnen = new Set(data.lijnen.map((l) => l.id));
    assert.ok(data.duiven.length >= 6);
    for (const d of data.duiven) {
      assert.match(d.id, /^[a-z0-9-]+$/, d.naam);
      assert.match(d.ring, RING, d.naam);
      assert.ok(['doffer', 'duivin'].includes(d.geslacht), `${d.naam}: geslacht`);
      assert.ok(KLEUR.includes(d.kleur), `${d.naam}: kleur`);
      assert.ok(OOG.includes(d.oog), `${d.naam}: oog`);
      assert.ok(lijnen.has(d.lijn), `${d.naam}: lijn`);
      assert.ok(Number.isInteger(d.prijs) && d.prijs > 0, `${d.naam}: prijs`);
      assert.ok(['', 'nieuw', 'verkocht'].includes(d.status), `${d.naam}: status`);
      assert.ok(d.afstamming && d.tekst, `${d.naam}: tekst`);
      for (const o of [d.vader, d.moeder]) {
        assert.match(o.ring, RING, `${d.naam}: ring ouder`);
        assert.ok(o.naam && o.ouders && o.palmares.length >= 1, `${d.naam}: ouder volledig`);
      }
    }
  });

  test('ids en ringnummers van duiven zijn uniek', () => {
    assert.equal(new Set(data.duiven.map((d) => d.id)).size, data.duiven.length);
    assert.equal(new Set(data.duiven.map((d) => d.ring)).size, data.duiven.length);
  });

  test('nieuwsberichten zijn volledig en staan van nieuw naar oud', () => {
    assert.ok(data.nieuws.length >= 4, 'minstens vier berichten (de homepage toont er vier)');
    const datums = Array.from(data.nieuws, (n) => n.datum);
    assert.deepEqual(datums, [...datums].sort().reverse());
    for (const n of data.nieuws) {
      assert.match(n.id, /^[a-z0-9-]+$/);
      assert.match(n.datum, /^\d{4}-\d{2}-\d{2}$/);
      assert.ok(n.titel && n.intro && n.tekst.length >= 1, n.id);
    }
    assert.equal(new Set(data.nieuws.map((n) => n.id)).size, data.nieuws.length);
  });

  test('uitslagen en lossingsplaatsen kloppen met de afstandslat', () => {
    const kms = Array.from(data.lossingen, (l) => l.km); // Array.from: data.js draait in een eigen vm-context
    assert.deepEqual(kms, [...kms].sort((a, b) => a - b));
    assert.ok(Math.max(...kms) <= 1120, 'past op de lat (max 1120 km)');
    const jaren = Object.keys(data.uitslagen);
    assert.ok(jaren.length >= 1);
    for (const j of jaren) {
      for (const u of data.uitslagen[j]) {
        assert.match(u.datum, /^\d{2}\/\d{2}$/);
        assert.match(String(u.prijzen), /^\d+(, \d+)*$/);
        assert.ok(['snelheid', 'halvefond', 'fond'].includes(u.cat));
        assert.ok(u.km > 0 && u.duiven > 0 && u.vlucht && u.niveau);
      }
    }
  });
});

/* ---------- render-tests in een echte browser (headless) ---------- */
const BROWSERS = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'
].filter(Boolean);
const browser = BROWSERS.find((p) => fs.existsSync(p));

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.json': 'application/json' };
function serve() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split('?')[0]);
      const file = path.join(ROOT, rel === '/' ? 'index.html' : rel);
      if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    });
    srv.listen(0, '127.0.0.1', () => resolve(srv));
  });
}
function dumpDom(url, size) {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'nw-test-'));
  return new Promise((resolve, reject) => {
    execFile(browser, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--hide-scrollbars',
      `--user-data-dir=${profile}`, `--window-size=${size}`, '--virtual-time-budget=6000', '--dump-dom', url],
    { maxBuffer: 64 * 1024 * 1024, timeout: 60000 }, (err, stdout) => {
      try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 3 }); } catch { /* profiel nog in gebruik */ }
      if (err && !stdout) reject(err); else resolve(stdout);
    });
  });
}
const count = (dom, re) => (dom.match(re) || []).length;
const schoon = (dom) => assert.ok(!/undefined|NaN|\[object Object\]/.test(strip(dom)), 'geen undefined/NaN in de tekst');
const vrij = data.duiven.filter((d) => d.status !== 'verkocht');
const laatste = Object.keys(data.uitslagen).sort().reverse()[0];

/* wat elke pagina in de browser moet tekenen */
const RENDER = {
  'index.html': (dom) => {
    assert.equal(count(dom, /<article class="duif"/g), Math.min(4, vrij.length), 'uitgelichte duiven');
    assert.equal(count(dom, /<a class="lijn-rij"/g), data.lijnen.length, 'bloedlijnen');
    assert.equal(count(dom.match(/<tbody id="resBody"[^>]*>([\s\S]*?)<\/tbody>/)[1], /<tr>/g), Math.min(5, data.uitslagen[laatste].length), 'laatste vluchten');
    assert.equal(count(dom, /<article class="news-lead/g) + count(dom, /<li data-reveal[^>]*><time/g), Math.min(4, data.nieuws.length), 'nieuwsberichten');
  },
  'nieuws.html': (dom) => {
    assert.equal(count(dom, /<article class="artikel/g), data.nieuws.length, 'berichten');
    for (const n of data.nieuws) assert.ok(dom.includes(`id="${n.id}"`), `bericht ${n.id}`);
  },
  'over-ons.html': (dom) => {
    assert.match(dom, /id="oogDisc"><svg viewBox="-60 -60 120 120"/, 'oogtekening');
    assert.equal(count(dom, /<li data-reveal[^>]*>\s*<span class="mono">/g), 4, 'vier periodes');
  },
  'bloedlijnen.html': (dom) => {
    assert.equal(count(dom, /<details class="lijn"/g), data.lijnen.length, 'bloedlijnen');
    assert.equal(count(dom, /<details class="lijn"[^>]* open/g), 1, 'één lijn staat open');
    assert.ok(count(dom, /href="duiven-te-koop\.html\?lijn=/g) >= 1, 'link naar het aanbod per lijn');
  },
  'duiven-te-koop.html': (dom) => {
    assert.equal(count(dom, /<article class="duif"/g), data.duiven.length, 'duifkaarten');
    assert.ok(count(dom, /<svg viewBox="0 0 360 290"/g) >= data.duiven.length, 'duiftekeningen');
    assert.match(dom, /id="fCount"[^>]*>\d+ duiven · \d+ beschikbaar</, 'teller boven het aanbod');
    assert.ok(count(dom, /<option value="[a-z]+">/g) >= data.lijnen.length, 'lijnen in de filter');
  },
  'duiven-te-koop.html?lijn=bourges': (dom) => {
    assert.equal(count(dom, /<article class="duif"/g), data.duiven.filter((d) => d.lijn === 'bourges').length, 'filter via de link vanuit een bloedlijn');
  },
  'duiven-te-koop.html?duif=mistral': (dom) => {
    assert.match(dom, /<dialog[^>]* open/, 'detailvenster staat open');
    assert.match(dom, /id="dlgNaam">Mistral</, 'met de juiste duif');
    assert.match(dom, /href="contact\.html\?duif=mistral"/, 'en een link naar het contactformulier');
  },
  'uitslagen.html': (dom) => {
    assert.equal(count(dom.match(/<tbody id="resBody">([\s\S]*?)<\/tbody>/)[1], /<tr>/g), data.uitslagen[laatste].length, 'uitslagrijen');
    assert.equal(count(dom, /<li[^>]*style="--km:/g), data.lossingen.length + 1, 'punten op de afstandslat');
    assert.equal(count(dom, /class="tab"/g), Object.keys(data.uitslagen).length, 'seizoenen');
  },
  'referenties.html': (dom) => {
    assert.equal(count(dom, /<blockquote>/g), 6, 'referenties');
  },
  'contact.html': (dom) => {
    assert.equal(count(dom, /<option value="[^"]+" data-id="/g), vrij.length, 'beschikbare duiven in het formulier');
  }
};

describe('render in headless browser', { skip: browser ? false : 'geen Chrome of Edge gevonden' }, () => {
  for (const [url, check] of Object.entries(RENDER)) {
    test(`${url} tekent zijn inhoud zonder scriptfouten`, async () => {
      const srv = await serve();
      try {
        const dom = await dumpDom(`http://127.0.0.1:${srv.address().port}/${url}`, '1440,900');
        check(dom);
        assert.ok(!/<canvas\b/.test(dom), 'geen vlucht op canvas: de site blijft stil');
        schoon(dom);
      } finally { srv.close(); }
    });
  }

  test('contact.html?duif=… vult het formulier vooraf in', async () => {
    const srv = await serve();
    try {
      // waarden van formuliervelden staan niet in de DOM-dump: lees ze via de meetpagina
      const dom = await dumpDom(`http://127.0.0.1:${srv.address().port}/tests/overloop.html?pagina=${encodeURIComponent('contact.html?duif=mistral')}&formulier=1`, '500,900');
      const r = JSON.parse(dom.match(/id="uit">([^<]+)</)[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&'));
      assert.equal(r.formulier.onderwerp, 'Duif aankopen');
      assert.match(r.formulier.duif, /^Mistral \(BE\d{2}-\d{7}\)$/);
      assert.match(r.formulier.bericht, /Mistral/);
    } finally { srv.close(); }
  });

  for (const page of PAGES) {
    test(`${page} past op telefoonbreedte (375 px)`, async () => {
      const srv = await serve();
      try {
        const dom = await dumpDom(`http://127.0.0.1:${srv.address().port}/tests/overloop.html?pagina=${page}`, '500,900');
        const m = dom.match(/id="uit">([^<]+)</);
        assert.ok(m, 'meetpagina gaf een resultaat');
        const r = JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&'));
        assert.equal(r.fout, undefined, r.fout);
        assert.equal(r.innerWidth, 375);
        assert.ok(r.scrollWidth <= r.innerWidth, `pagina is ${r.scrollWidth}px breed in een venster van ${r.innerWidth}px`);
        assert.deepEqual(r.buiten, [], 'elementen die buiten het scherm steken');
        assert.deepEqual(r.teKlein, [], 'knoppen kleiner dan 40px hoog');
        assert.equal(r.navZichtbaar, false, 'desktopnavigatie is verborgen');
        assert.equal(r.burgerZichtbaar, true, 'menuknop is zichtbaar');
      } finally { srv.close(); }
    });
  }
});
