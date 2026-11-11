/* ==========================================================================
   Team Noel-Willockx · gedrag
   Inhoud staat in data.js (window.NW_DATA). Dit bestand tekent en bedient.
   Het wordt op elke pagina geladen; elk onderdeel start alleen als zijn
   element op die pagina staat.
   ========================================================================== */
(function () {
  'use strict';

  var D = window.NW_DATA || { lijnen: [], duiven: [], lossingen: [], uitslagen: {}, vlucht: { km: 0 } };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var REDUCED = document.documentElement.classList.contains('rustig');
  var lenis = null;

  /* ---------- hulpjes ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function getal(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function euro(n) { return '€ ' + getal(n); }
  function hoofd(s) { s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); }
  function zaad(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function lijnVan(id) {
    for (var i = 0; i < D.lijnen.length; i++) if (D.lijnen[i].id === id) return D.lijnen[i];
    return null;
  }
  function duifVan(id) {
    for (var i = 0; i < D.duiven.length; i++) if (D.duiven[i].id === id) return D.duiven[i];
    return null;
  }

  /* ==========================================================================
     Tekenen: oogteken, stamboom, ring
     Kleuren en lettertypes komen uit style.css (klassen), niet uit dit bestand.
     ========================================================================== */

  /* Schema van het oogteken: iris, correlatiecirkel, adaptatiecirkel, pupil */
  function irisSVG(seedStr) {
    var r = rng(zaad(seedStr)), vezels = '', i, a, r1, r2;
    for (i = 0; i < 120; i++) {
      a = r() * Math.PI * 2; r1 = 20.6 + r() * 6; r2 = 30 + r() * 17;
      vezels += '<line x1="' + (Math.cos(a) * r1).toFixed(2) + '" y1="' + (Math.sin(a) * r1).toFixed(2) +
        '" x2="' + (Math.cos(a) * r2).toFixed(2) + '" y2="' + (Math.sin(a) * r2).toFixed(2) +
        '" stroke-width="' + (.25 + r() * .5).toFixed(2) + '" opacity="' + (.3 + r() * .5).toFixed(2) + '"/>';
    }
    return '<svg viewBox="-60 -60 120 120" class="diagram" role="img" aria-label="Schema van het oogteken: iris, correlatiecirkel, adaptatiecirkel en pupil" focusable="false">' +
      '<circle class="i-grond" r="57"/>' +
      '<g class="iris-draai"><g class="i-vezel" stroke-linecap="round">' + vezels + '</g></g>' +
      '<circle class="i-ring" r="48" stroke-width="1.2"/>' +
      '<circle class="i-ring" r="19.5" stroke-width=".9"/>' +
      '<circle class="i-ring" r="14.6" stroke-width=".9"/>' +
      '<circle class="iris-pupil i-pupil" r="11"/>' +
      '</svg>';
  }

  /* Stamboom: de duif (ringjaar), haar ouders en vier grootouders */
  function grootouders(o) {
    return String(o.ouders || '').split('×').map(function (s) { return s.replace(/['‘’]/g, '').trim(); });
  }
  function tekstSVG(x, y, cls, s, max, perTeken) {
    var pers = s.length * perTeken > max ? ' textLength="' + max + '" lengthAdjust="spacingAndGlyphs"' : '';
    return '<text x="' + x + '" y="' + y + '" class="' + cls + '"' + pers + '>' + esc(s) + '</text>';
  }
  function stamboomSVG(d) {
    var v = d.vader, m = d.moeder, gv = grootouders(v), gm = grootouders(m);
    var jaar = (/^[A-Z]+(\d{2})-/.exec(d.ring) || [])[1] || '';
    var label = 'Stamboom van ' + d.naam + ': vader ' + v.naam + ' uit ' + gv.join(' en ') + ', moeder ' + m.naam + ' uit ' + gm.join(' en ');
    return '<svg viewBox="0 0 360 290" class="stamboom" role="img" aria-label="' + esc(label) + '" focusable="false">' +
      '<path class="stam-l" pathLength="1" d="M52 145H68M68 82V208M68 82H80M68 208H80"/>' +
      '<path class="stam-l" pathLength="1" d="M212 82H222M222 46V118M222 46H232M222 118H232"/>' +
      '<path class="stam-l" pathLength="1" d="M212 208H222M222 172V244M222 172H232M222 244H232"/>' +
      '<circle class="stam-kern" cx="30" cy="145" r="22"/>' +
      '<text class="stam-jaar" x="30" y="152" text-anchor="middle">' + esc(jaar) + '</text>' +
      tekstSVG(88, 80, 'stam-o', v.naam, 118, 8.3) + tekstSVG(88, 98, 'stam-r', v.ring, 118, 7.2) +
      tekstSVG(88, 206, 'stam-o', m.naam, 118, 8.3) + tekstSVG(88, 224, 'stam-r', m.ring, 118, 7.2) +
      tekstSVG(240, 51, 'stam-g', gv[0] || '', 112, 7.4) + tekstSVG(240, 123, 'stam-g', gv[1] || '', 112, 7.4) +
      tekstSVG(240, 177, 'stam-g', gm[0] || '', 112, 7.4) + tekstSVG(240, 249, 'stam-g', gm[1] || '', 112, 7.4) +
      '</svg>';
  }

  function ringHTML(ring) {
    var m = /^([A-Z]+)(\d{2})-(\d+)$/.exec(ring);
    if (!m) return '<span class="ring"><span>' + esc(ring) + '</span></span>';
    return '<span class="ring" title="Ringnummer ' + esc(ring) + '"><span class="ring-land">' + m[1] + '</span><span class="ring-jaar">' + m[2] + '</span><span>' + m[3] + '</span></span>';
  }
  function sexeHTML(g) {
    return '<span class="sexe">' + (g === 'duivin' ? 'Duivin' : 'Doffer') + '</span>';
  }
  /* "1e Prov. Melun · 3 204 duiven" wordt: uitslag links, aantal duiven rechts */
  function palmHTML(p) {
    var d = String(p).split(' · ');
    return '<li><span>' + esc(d[0]) + '</span>' + (d[1] ? '<span class="veld">' + esc(d[1]) + '</span>' : '') + '</li>';
  }
  function kenmerkHTML(d) {
    return '<dl class="kenmerk"><div><dt>Kleur</dt><dd>' + esc(hoofd(d.kleur)) + '</dd></div><div><dt>Oog</dt><dd>' + esc(hoofd(d.oog)) +
      '</dd></div><div><dt>Geslacht</dt><dd>' + esc(hoofd(d.geslacht)) + '</dd></div></dl>';
  }
  /* De plaat: een studiofoto als die er is, anders de stamboom; een stamduif zonder ouders toont haar ring */
  function visHTML(d) {
    var tag = d.status === 'nieuw' ? '<span class="tag">Nieuw</span>' : d.status === 'verkocht' ? '<span class="tag is-verkocht">Verkocht</span>' : '';
    if (d.foto) return '<span class="vis">' + tag + '<img class="vis-foto" src="' + esc(d.foto) + '" alt="Studiofoto van ' + esc(d.naam) + '" loading="lazy"></span>';
    if (d.vader && d.moeder) return '<span class="vis">' + tag + stamboomSVG(d) + '</span>';
    var m = /^([A-Z]+\d{2})-(\d+)$/.exec(d.ring);
    return '<span class="vis vis-ring" role="img" aria-label="Ring ' + esc(d.ring) + '"><span>' + (m ? m[1] : esc(d.ring)) + '</span>' + (m ? '<span>' + m[2] + '</span>' : '') + '</span>';
  }

  /* ==========================================================================
     Bloedlijnen (bloedlijnen.html: uitklapbare lijst · index.html: korte lijst)
     ========================================================================== */
  function vrijInLijn(id) {
    return D.duiven.filter(function (d) { return d.lijn === id && d.status !== 'verkocht'; }).length;
  }
  function tekenLijnen() {
    var el = $('#lijnList');
    if (el) {
      var doel = location.hash.replace('#lijn-', '');
      var open = lijnVan(doel) ? doel : (D.lijnen[0] || {}).id;
      el.innerHTML = D.lijnen.map(function (l) {
        var aantal = vrijInLijn(l.id);
        return '<details class="lijn" name="lijn" id="lijn-' + l.id + '"' + (l.id === open ? ' open' : '') + '>' +
          '<summary><span class="lijn-naam">' + esc(l.naam) + '</span><span class="lijn-disc">' + esc(l.discipline) + '</span>' + ringHTML(l.ring) + '<span class="lijn-plus" aria-hidden="true"></span></summary>' +
          '<div class="lijn-body">' + visHTML({ naam: l.naam, ring: l.ring, status: '' }) +
          '<div class="lijn-txt"><p>' + esc(l.intro) + '</p>' + kenmerkHTML(l) + '<ul class="palm">' + l.palmares.map(palmHTML).join('') + '</ul>' +
          (aantal
            ? '<a class="btn btn-ink" href="duiven-te-koop.html?lijn=' + l.id + '">' + (aantal === 1 ? 'Bekijk 1 duif uit deze lijn' : 'Bekijk ' + aantal + ' duiven uit deze lijn') + '</a>'
            : '<a class="btn btn-line" href="contact.html?onderwerp=wachtlijst">Vraag naar jongen uit deze lijn</a>') +
          '</div></div></details>';
      }).join('');
    }
    var kort = $('#lijnKort');
    if (kort) {
      kort.innerHTML = D.lijnen.map(function (l) {
        return '<a class="lijn-rij" href="bloedlijnen.html#lijn-' + l.id + '"><span class="lijn-naam" data-roost="tekst" data-roost-n="2">' + esc(l.naam) + '</span><span class="lijn-disc">' + esc(l.discipline) + '</span>' +
          ringHTML(l.ring) + '</a>';
      }).join('');
    }
  }

  /* ==========================================================================
     Duiven te koop (duiven-te-koop.html: alles met filters · index.html: nieuwste)
     ========================================================================== */
  function kaartHTML(d) {
    var lijn = lijnVan(d.lijn);
    return '<article class="duif" data-status="' + esc(d.status) + '">' +
      '<a class="duif-vis" href="duiven-te-koop.html?duif=' + d.id + '" data-open="' + d.id + '" aria-label="Meer over ' + esc(d.naam) + '">' + visHTML(d) + '</a>' +
      '<div><div class="duif-top"><h3 class="duif-naam">' + esc(d.naam) + '</h3>' + sexeHTML(d.geslacht) + '</div>' +
      '<div class="duif-meta">' + ringHTML(d.ring) + (lijn ? '<span class="sexe">Lijn ' + esc(lijn.naam) + '</span>' : '') + '</div>' +
      '<p class="duif-afst">' + esc(d.afstamming) + '</p>' +
      '<div class="duif-end"><span class="prijs">' + euro(d.prijs) + '</span>' +
      '<button type="button" class="btn btn-line btn-sm" data-open="' + d.id + '">Meer info<span class="sr"> over ' + esc(d.naam) + '</span></button></div></div></article>';
  }
  function rang(d) { return d.status === 'verkocht' ? 2 : d.status === 'nieuw' ? 0 : 1; }
  function nieuwsteEerst(a, b) { return rang(a) - rang(b) || b.ring.localeCompare(a.ring); }

  function tekenDuiven() {
    var el = $('#duiven'), f = $('#filters'); if (!el || !f) return;
    var g = (f.querySelector('input[name="geslacht"]:checked') || {}).value || '';
    var l = $('#fLijn').value, s = $('#fSort').value;

    var lijst = D.duiven.filter(function (d) { return (!g || d.geslacht === g) && (!l || d.lijn === l); });
    lijst.sort(function (a, b) {
      var va = a.status === 'verkocht', vb = b.status === 'verkocht';
      if (va !== vb) return va ? 1 : -1;
      if (s === 'laag') return a.prijs - b.prijs;
      if (s === 'hoog') return b.prijs - a.prijs;
      return nieuwsteEerst(a, b);
    });
    el.innerHTML = lijst.map(kaartHTML).join('');

    var vrij = lijst.filter(function (d) { return d.status !== 'verkocht'; }).length;
    $('#fCount').textContent = lijst.length + (lijst.length === 1 ? ' duif' : ' duiven') + ' · ' + vrij + ' beschikbaar';
    $('#duivenLeeg').hidden = lijst.length > 0;
  }

  function startKoop() {
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-open]'); if (!b) return;
      if (dlg) e.preventDefault(); // zonder venster volgt de link naar het aanbod
      openDuif(b.getAttribute('data-open'), b);
    });

    var uit = $('#uitgelicht');
    if (uit) {
      var max = +uit.getAttribute('data-max') || 4;
      uit.innerHTML = D.duiven.filter(function (d) { return d.status !== 'verkocht'; }).sort(nieuwsteEerst).slice(0, max).map(kaartHTML).join('');
    }

    var sel = $('#fLijn'); if (!sel) return;
    D.lijnen.forEach(function (l) {
      var o = document.createElement('option'); o.value = l.id; o.textContent = l.naam; sel.appendChild(o);
    });
    var q = new URLSearchParams(location.search);
    if (lijnVan(q.get('lijn'))) sel.value = q.get('lijn');
    $('#filters').addEventListener('change', tekenDuiven);
    $('#fReset').addEventListener('click', function () {
      sel.value = ''; $('#filters').querySelector('input[name="geslacht"][value=""]').checked = true; tekenDuiven();
    });
    tekenDuiven();
    if (duifVan(q.get('duif'))) openDuif(q.get('duif'));
  }

  /* ---------- detailvenster ---------- */
  var dlg, dlgTerug = null;
  function ouderHTML(titel, o) {
    return '<section><h3>' + titel + '</h3><p class="stam-naam">' + esc(o.naam) + '</p>' + ringHTML(o.ring) +
      '<p class="stam-uit">uit ' + esc(o.ouders) + '</p><ul>' + o.palmares.map(palmHTML).join('') + '</ul></section>';
  }
  function openDuif(id, bron) {
    var d = duifVan(id); if (!d || !dlg) return;
    var lijn = lijnVan(d.lijn), weg = d.status === 'verkocht';
    $('#dlgIn').innerHTML =
      '<div class="dlg-vis">' + visHTML(d) + '</div>' +
      '<div class="dlg-txt"><div class="duif-meta">' + ringHTML(d.ring) + sexeHTML(d.geslacht) + (lijn ? '<span class="sexe">Lijn ' + esc(lijn.naam) + '</span>' : '') +
      '<span class="sexe">' + esc(hoofd(d.kleur)) + ', ' + esc(d.oog) + ' oog</span></div>' +
      '<h2 class="dlg-naam" id="dlgNaam">' + esc(d.naam) + '</h2>' +
      '<p class="dlg-afst">' + esc(d.afstamming) + '</p><p class="dlg-p">' + esc(d.tekst) + '</p>' +
      '<div class="stam">' + ouderHTML('Vader', d.vader) + ouderHTML('Moeder', d.moeder) + '</div>' +
      '<div class="dlg-koop"><p class="prijs">' + (weg ? 'Verkocht' : euro(d.prijs)) + '<small>' + (weg ? 'Deze duif is niet meer beschikbaar' : 'Met stamkaart en eigendomsbewijs') + '</small></p>' +
      '<a class="btn btn-iris" href="contact.html?duif=' + d.id + '">' + (weg ? 'Vraag naar een gelijkaardige duif' : 'Vraag deze duif aan') + '</a></div></div>';
    dlgTerug = bron || null;
    $('#dlgIn').scrollTop = 0;
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    if (lenis) lenis.stop();
  }
  function startDialog() {
    dlg = $('#dlg'); if (!dlg) return;
    $('#dlgX').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', function () {
      if (lenis) lenis.start();
      if (dlgTerug && document.contains(dlgTerug)) dlgTerug.focus({ preventScroll: true });
    });
  }

  /* ==========================================================================
     Uitslagen (uitslagen.html: alles met tabs en lat · index.html: laatste vluchten)
     ========================================================================== */
  var jaar = null, cat = '';
  function tekenUitslagen() {
    var body = $('#resBody'); if (!body) return;
    var max = +body.getAttribute('data-max') || 0;
    var rijen = (D.uitslagen[jaar] || []).filter(function (u) { return !cat || u.cat === cat; });
    if (max) rijen = rijen.slice(0, max);
    body.innerHTML = rijen.length ? rijen.map(function (u) {
      var plaatsen = String(u.prijzen).split(',').map(function (p) {
        p = p.trim(); return '<span class="plaats' + (p === '1' ? ' is-1' : '') + '">' + esc(p) + '</span>';
      }).join('');
      return '<tr><td class="dat">' + esc(u.datum) + '</td><td class="vl">' + esc(u.vlucht) + '</td><td class="num km">' + u.km + ' km</td><td class="niv">' + esc(u.niveau) +
        '</td><td class="num dv">' + getal(u.duiven) + '</td><td class="pr">' + plaatsen + '</td></tr>';
    }).join('') : '<tr><td colspan="6">Geen vluchten in deze discipline in ' + jaar + '.</td></tr>';
  }
  function startUitslagen() {
    var jaren = Object.keys(D.uitslagen).sort().reverse();
    jaar = jaren[0];

    var tabs = $('#jaarTabs');
    if (tabs) {
      tabs.innerHTML = jaren.map(function (j) {
        return '<button type="button" class="tab" role="tab" aria-selected="' + (j === jaar) + '" data-jaar="' + j + '">' + j + '</button>';
      }).join('');
      tabs.addEventListener('click', function (e) {
        var b = e.target.closest('[data-jaar]'); if (!b) return;
        jaar = b.getAttribute('data-jaar');
        $$('.tab', tabs).forEach(function (t) { t.setAttribute('aria-selected', String(t === b)); });
        tekenUitslagen();
      });
    }
    var chips = $('#catChips');
    if (chips) {
      chips.addEventListener('click', function (e) {
        var b = e.target.closest('[data-cat]'); if (!b) return;
        cat = b.getAttribute('data-cat');
        $$('.chip', chips).forEach(function (c) { c.classList.toggle('is-on', c === b); c.setAttribute('aria-pressed', String(c === b)); });
        tekenUitslagen();
      });
      $$('.chip', chips).forEach(function (c) { c.setAttribute('aria-pressed', String(c.classList.contains('is-on'))); });
    }
    var pts = $('#latPts');
    if (pts) {
      pts.innerHTML = '<li class="is-hok" style="--km:0"><b>Hok</b><small>0 km</small></li>' + D.lossingen.map(function (p) {
        return '<li style="--km:' + p.km + '"><b>' + esc(p.naam) + '</b><small>' + getal(p.km) + ' km</small></li>';
      }).join('');
    }
    tekenUitslagen();
  }

  /* ==========================================================================
     Nieuws (nieuws.html: alle berichten · index.html: de laatste vier)
     ========================================================================== */
  function tijdHTML(n) {
    var p = String(n.datum).split('-');
    return '<time datetime="' + esc(n.datum) + '"><b>' + esc(p[2] + '/' + p[1]) + '</b><span>' + esc(p[0]) + '</span></time>';
  }
  function tekenNieuws() {
    var N = D.nieuws || [];
    var kort = $('#nieuwsKort');
    if (kort && N.length) {
      kort.innerHTML = '<article class="news-lead" data-reveal>' + tijdHTML(N[0]) + '<h3>' + esc(N[0].titel) + '</h3><p>' + esc(N[0].intro) + '</p>' +
        '<a class="more" href="nieuws.html#' + N[0].id + '">Lees het bericht</a></article><ul class="news-list">' +
        N.slice(1, 4).map(function (n) {
          return '<li data-reveal>' + tijdHTML(n) + '<h3>' + esc(n.titel) + '</h3><p>' + esc(n.intro) + '</p>' +
            '<a class="more" href="nieuws.html#' + n.id + '">Lees<span class="sr"> ' + esc(n.titel) + '</span></a></li>';
        }).join('') + '</ul>';
    }
    var alle = $('#nieuwsAlle');
    if (alle) {
      alle.innerHTML = N.map(function (n) {
        return '<article class="artikel" id="' + esc(n.id) + '" data-reveal>' + tijdHTML(n) + '<div class="artikel-in"><h2>' + esc(n.titel) + '</h2>' +
          '<p class="artikel-intro">' + esc(n.intro) + '</p>' + (n.tekst || []).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') +
          (n.link ? '<a class="more" href="' + esc(n.link.href) + '">' + esc(n.link.tekst) + '</a>' : '') + '</div></article>';
      }).join('');
    }
  }

  /* ==========================================================================
     Contactformulier
     ========================================================================== */
  function startForm() {
    var form = $('#contactForm'); if (!form) return;
    var note = $('#formNote');
    var MAIL = 'info@teamnoelwillockx.be';

    function fout(veld, tekst) {
      var wrap = veld.closest('.fld') || veld.closest('.consent');
      wrap.classList.toggle('is-fout', !!tekst);
      var s = wrap.querySelector('.fout');
      if (tekst && wrap.classList.contains('fld')) {
        if (!s) { s = document.createElement('small'); s.className = 'fout'; wrap.appendChild(s); }
        s.textContent = tekst; veld.setAttribute('aria-invalid', 'true');
      } else if (s) { s.remove(); veld.removeAttribute('aria-invalid'); }
      return !tekst;
    }
    function check() {
      var e = form.elements, ok = true, eerste = null;
      var regels = [
        [e.name, e.name.value.trim() ? '' : 'Vul je naam in.'],
        [e.email, /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.email.value.trim()) ? '' : 'Vul een geldig e-mailadres in, bv. jan@voorbeeld.be.'],
        [e.message, e.message.value.trim() ? '' : 'Schrijf kort wat je wil weten.'],
        [e.consent, e.consent.checked ? '' : 'x']
      ];
      regels.forEach(function (r) { if (!fout(r[0], r[1])) { ok = false; eerste = eerste || r[0]; } });
      if (eerste) eerste.focus();
      return ok;
    }
    form.addEventListener('input', function (e) {
      var w = e.target.closest('.is-fout'); if (w) fout(e.target, '');
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      note.className = 'form-note'; note.textContent = '';
      if (!check()) {
        note.classList.add('is-fout');
        note.textContent = form.elements.consent.checked ? 'Kijk de gemarkeerde velden na.' : 'Vink het akkoord aan om te versturen.';
        return;
      }
      var knop = form.querySelector('button[type="submit"]'), tekst = knop.textContent;
      knop.disabled = true; knop.textContent = 'Bezig met versturen…';
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok && j.success, msg: j.message }; }); })
        .then(function (r) {
          if (!r.ok) throw new Error(r.msg || '');
          form.reset();
          note.classList.add('is-ok'); note.textContent = r.msg || 'Bericht verstuurd. We antwoorden binnen twee werkdagen.';
        })
        .catch(function () {
          note.classList.add('is-fout');
          note.innerHTML = 'Het bericht is niet verstuurd. Mail ons rechtstreeks op <a href="mailto:' + MAIL + '">' + MAIL + '</a>.';
        })
        .then(function () { knop.disabled = false; knop.textContent = tekst; });
    });
    var onderwerp = $('#cSubject'), wrap = $('#cDuifWrap'), keuze = $('#cDuif');
    D.duiven.forEach(function (d) {
      if (d.status === 'verkocht') return;
      var o = document.createElement('option'); o.value = d.naam + ' (' + d.ring + ')'; o.textContent = d.naam + ' · ' + d.ring; o.setAttribute('data-id', d.id); keuze.appendChild(o);
    });
    // contact.html?duif=mistral  of  ?onderwerp=wachtlijst | bezoek
    var q = new URLSearchParams(location.search), d = duifVan(q.get('duif'));
    if (d) {
      onderwerp.value = 'Duif aankopen';
      var optie = keuze.querySelector('option[data-id="' + d.id + '"]');
      keuze.value = optie ? optie.value : '';
      form.elements.message.value = d.status === 'verkocht'
        ? "Ik zoek een duif zoals '" + d.naam + "' (" + d.ring + '). Hebben jullie iets gelijkaardigs?'
        : "Ik heb interesse in '" + d.naam + "' (" + d.ring + '). Kan ik langskomen om de duif te bekijken?';
    }
    if (q.get('onderwerp') === 'wachtlijst') onderwerp.value = 'Wachtlijst jongen 2027';
    if (q.get('onderwerp') === 'bezoek') onderwerp.value = 'Hokbezoek plannen';
    function toonDuif() { wrap.hidden = onderwerp.value !== 'Duif aankopen'; }
    onderwerp.addEventListener('change', toonDuif); toonDuif();
  }

  /* ==========================================================================
     Navigatie, scroll, vluchtteller
     ========================================================================== */
  function naar(sel, klaar) {
    var el = typeof sel === 'string' ? $(sel) : sel; if (!el) return;
    var kop = $('#head').offsetHeight;
    var top = sel === '#head' ? 0 : el.getBoundingClientRect().top + window.pageYOffset - kop + 1;
    if (lenis) {
      lenis.start();
      lenis.scrollTo(top, { duration: 1.2, onComplete: klaar });
    } else {
      window.scrollTo({ top: top, behavior: REDUCED ? 'auto' : 'smooth' });
      if (klaar) setTimeout(klaar, REDUCED ? 0 : 700);
    }
  }

  function startNav() {
    var head = $('#head'), burger = $('#burger'), mnav = $('#mnav');
    var hudKm = $('#hudKm'), hudLbl = $('#hudLbl'), hud = $('#hud');
    var KM = D.vlucht.km || 462, SNELHEID = D.vlucht.snelheid || 1412;
    var start = (D.vlucht.uur || '07:15').split(':'), startMin = (+start[0]) * 60 + (+start[1]);
    var duur = KM * 1000 / SNELHEID; // minuten
    function klok(min) {
      var h = Math.floor(min / 60), m = Math.floor(min % 60);
      return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
    }
    var eind = startMin + duur;
    var tk = $('#thuisKlok');
    if (tk) tk.innerHTML = 'Geklokt om ' + klok(eind) + ':' + ('0' + Math.floor((eind % 1) * 60)).slice(-2) + '<span>' + getal(SNELHEID) + ' m/min</span>';

    var wacht = false;
    function bij() {
      wacht = false;
      var y = window.pageYOffset, max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      head.classList.toggle('is-solid', y > 24);
      var rest = Math.round(KM * (1 - p));
      var thuis = p > .992;
      hud.classList.toggle('is-thuis', thuis);
      hudKm.textContent = thuis ? 'Thuis' : rest + ' km';
      hudLbl.textContent = thuis ? klok(eind) : 'tot thuis';
    }
    function vraag() { if (!wacht) { wacht = true; requestAnimationFrame(bij); } }
    window.addEventListener('scroll', vraag, { passive: true });
    window.addEventListener('resize', vraag);
    bij();

    function menu(open) {
      mnav.hidden = !open;
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Menu sluiten' : 'Menu openen');
      document.documentElement.style.overflow = open ? 'hidden' : '';
      head.classList.toggle('is-solid', open || window.pageYOffset > 24);
      if (lenis) { if (open) lenis.stop(); else lenis.start(); }
    }
    burger.addEventListener('click', function () { menu(mnav.hidden); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !mnav.hidden) { menu(false); burger.focus(); } });
    window.addEventListener('resize', function () { if (window.innerWidth > 1180 && !mnav.hidden) menu(false); });

    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]'); if (!a || a.classList.contains('skip')) return;
      var h = a.getAttribute('href'); if (h.length < 2 || !$(h)) return;
      e.preventDefault();
      if (!mnav.hidden) menu(false);
      naar(h);
      history.replaceState(null, '', h === '#head' ? location.pathname + location.search : h);
    });
  }

  /* ==========================================================================
     De vlucht: één vast canvas achter de tekst.
     De duiven wielen boven de paginakop, landen op wat [data-roost] draagt
     (de bovenkant van kapitalen of de bovenrand van een element), vliegen op
     als hun plek uit beeld schuift of de cursor te dicht komt, en landen
     onderaan op het woord "Thuis".
     ========================================================================== */
  function startVlucht() {
    var cv = $('#flock'); if (!cv || !cv.getContext) return;
    var ctx = cv.getContext('2d'), W = 0, H = 0, headH = 64;
    var css = getComputedStyle(document.documentElement);
    var WIT = css.getPropertyValue('--wolk').trim() || 'white', BLAUW = css.getPropertyValue('--lei').trim() || 'navy';
    var r = rng(20261111), schaal = +cv.getAttribute('data-schaal') || 1;
    var kop = cv.parentNode, head = $('#head'), titel = $('.kop-titel');
    var vogels = [], stilLucht = [], roosts = [], lettertypes = {}, vlakken = $$('.donker');
    var muis = null, loopt = false, vorige = 0, nu = 0, pauze = REDUCED;
    var WEG = 0, VLIEG = 1, LAND = 2, ZIT = 3;

    // waar een duif op een kapitaal kan zitten: punten, of een vlak stuk van-tot (deel van de letterbreedte)
    var PUNT = { A: [.5], C: [.5], G: [.5], O: [.5], Q: [.5], S: [.5], I: [.5], J: [.62], L: [.2], H: [.14, .86], K: [.14, .84], M: [.12, .88], N: [.14, .86], U: [.14, .86], V: [.1, .9], W: [.08, .92], X: [.14, .86], Y: [.1, .9] };
    var VLAK = { T: [.1, .9], E: [.14, .86], F: [.14, .86], Z: [.14, .86], B: [.14, .5], D: [.14, .5], P: [.14, .5], R: [.14, .5] };

    function maat() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight; headH = head.offsetHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    /* ---------- landingsplekken meten ---------- */
    function meet() {
      vogels.forEach(function (a) { if (a.slot) loslaten(a); });
      roosts = $$('[data-roost]').map(function (el, idx) {
        var b = el.getBoundingClientRect(); if (b.width < 8) return null;
        var n = +el.getAttribute('data-roost-n') || 4, m = 17, kand = [], slots = [], rr = rng(zaad('roost' + idx)), i, j;
        if (el.getAttribute('data-roost') === 'tekst') {
          var cs = getComputedStyle(el), fs = parseFloat(cs.fontSize) || 40, lh = parseFloat(cs.lineHeight) || fs;
          // basislijn van de eerste regel: de onderkant van een leeg inline-blok voor de tekst
          var peil = document.createElement('span'); peil.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
          el.insertBefore(peil, el.firstChild); var basis = peil.getBoundingClientRect().bottom - b.top; el.removeChild(peil);
          lettertypes[cs.fontWeight + ' 48px ' + cs.fontFamily] = 1;
          ctx.save(); ctx.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + fs + 'px ' + cs.fontFamily;
          var kap = ctx.measureText('H').actualBoundingBoxAscent; ctx.restore();
          if (!(kap > 0)) kap = fs * .72;
          m = Math.max(16, Math.min(34, fs * .16));
          var tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), node, rg = document.createRange(), tekens = [];
          while ((node = tw.nextNode())) {
            for (i = 0; i < node.length; i++) {
              var ch = node.data.charAt(i).toUpperCase(); if (!PUNT[ch] && !VLAK[ch]) continue;
              rg.setStart(node, i); rg.setEnd(node, i + 1);
              var q = rg.getBoundingClientRect(); if (q.width < 2) continue;
              tekens.push({ ch: ch, x: q.left - b.left, w: q.width, top: q.top });
            }
          }
          var boven = tekens.length ? tekens[0].top : 0;
          tekens.forEach(function (t) {
            var y = basis + Math.round((t.top - boven) / lh) * lh - kap, f = VLAK[t.ch];
            if (f) {
              var k = Math.max(1, Math.floor((f[1] - f[0]) * t.w / (m * 1.7)));
              for (i = 0; i < k; i++) kand.push({ dx: t.x + t.w * (k === 1 ? (f[0] + f[1]) / 2 : f[0] + (f[1] - f[0]) * i / (k - 1)), dy: y });
            } else PUNT[t.ch].forEach(function (p) { kand.push({ dx: t.x + t.w * p, dy: y }); });
          });
        } else {
          var k2 = Math.max(1, Math.min(n * 2, Math.floor(b.width / (m * 1.9))));
          for (i = 0; i < k2; i++) kand.push({ dx: b.width * (i + .2 + rr() * .6) / k2, dy: 0 });
        }
        for (i = kand.length - 1; i > 0; i--) { j = Math.floor(rr() * (i + 1)); var t2 = kand[i]; kand[i] = kand[j]; kand[j] = t2; }
        kand.forEach(function (c) {
          if (slots.length >= n) return;
          for (j = 0; j < slots.length; j++) if (Math.abs(slots[j].dy - c.dy) < 2 && Math.abs(slots[j].dx - c.dx) < m * 1.3) return;
          c.vogel = null; c.kant = rr() > .5 ? 1 : -1; slots.push(c);
        });
        return { el: el, slots: slots, m: m, thuis: el.id === 'thuisWord', x: 0, y: 0 };
      }).filter(Boolean);
    }
    function kader() {
      for (var i = 0; i < roosts.length; i++) { var b = roosts[i].el.getBoundingClientRect(); roosts[i].x = b.left; roosts[i].y = b.top; }
    }
    function landbaar(ro, s) { var y = ro.y + s.dy; return y > headH + ro.m + 10 && y < H - 10; }

    /* ---------- de zwerm ---------- */
    function maak() {
      var basis = +cv.getAttribute('data-n') || 0;
      var n = basis ? (W < 700 ? Math.round(basis * .6) : basis) : W < 700 ? 14 : W < 1200 ? 26 : 34;
      vogels = [];
      stilLucht = [];
      for (var q = 0; q < Math.round(n * .45); q++) stilLucht.push({ h: r() * 6.2832, k: .35 + r() * .75, z: .4 + r() * .6, ph: r() * 6.28 });
      for (var i = 0; i < n; i++) vogels.push({ x: 0, y: 0, vx: 0, vy: 0, z: .4 + r() * .6, ph: r() * 6.28, fs: .2 + r() * .08, st: WEG, slot: null, ro: null, rust: 0, tot: 0 });
    }
    function lucht() {
      var kb = kop.getBoundingClientRect(), tt = titel ? titel.getBoundingClientRect() : kb;
      var dak = Math.max(headH, kb.top) + 16, bodem = Math.max(dak + 70, tt.top + tt.height * .14);
      return { zicht: kb.bottom > headH + 140, dak: dak, bodem: bodem, cx: W * (W < 700 ? .5 : .6), cy: (dak + bodem) / 2, R: Math.min(W * .3, 360) };
    }
    function herstart() {
      var L = lucht();
      nu = performance.now();
      vogels.forEach(function (a) {
        if (a.slot) loslaten(a);
        var hoek = r() * Math.PI * 2;
        a.vx = Math.cos(hoek) * 2; a.vy = Math.sin(hoek) * 1.2;
        a.rust = nu + 700 + r() * 5200;
        if (L.zicht) { a.st = VLIEG; a.x = L.cx + (r() - .5) * L.R * 2; a.y = L.dak + r() * (L.bodem - L.dak); }
        else { a.st = WEG; a.rust = nu + r() * 1800; }
      });
    }
    function loslaten(a) { if (a.slot) a.slot.vogel = null; a.slot = null; a.ro = null; if (a.st === ZIT || a.st === LAND) a.st = VLIEG; }
    function opvliegen(a, schrik) {
      a.y -= a.ro.m * .5;
      loslaten(a);
      a.vx = (r() - .5) * 4; a.vy = -(2 + r() * 2); a.ph = r() * 6.28;
      a.rust = nu + (schrik ? 2600 : 1200) + r() * 4200;
    }
    function kies(lijst) {
      if (!lijst.length) return null;
      return lijst.splice(Math.floor(r() * lijst.length), 1)[0];
    }
    function neem(a, doel) { a.st = LAND; a.ro = doel[0]; a.slot = doel[1]; doel[1].vogel = a; }

    function stap(dt) {
      kader();
      var L = lucht(), vrij = [], thuisVrij = [], thuisZicht = false, i, j, a, b, dx, dy, d2, d, doel;
      for (i = 0; i < roosts.length; i++) {
        for (j = 0; j < roosts[i].slots.length; j++) {
          var s = roosts[i].slots[j];
          if (!landbaar(roosts[i], s)) continue;
          if (roosts[i].thuis) thuisZicht = true;
          if (!s.vogel) (roosts[i].thuis ? thuisVrij : vrij).push([roosts[i], s]);
        }
      }
      for (i = 0; i < vogels.length; i++) {
        a = vogels[i];

        if (a.st === ZIT) {
          a.x = a.ro.x + a.slot.dx; a.y = a.ro.y + a.slot.dy;
          var schrik = false;
          if (muis) { dx = a.x - muis.x; dy = a.y - a.ro.m * .5 - muis.y; schrik = dx * dx + dy * dy < 4900; }
          if (schrik || !landbaar(a.ro, a.slot) || (!a.ro.thuis && (nu > a.tot || (thuisZicht && thuisVrij.length)))) opvliegen(a, schrik);
          continue;
        }

        if (a.st === WEG) {
          if (nu < a.rust) continue;
          doel = kies(thuisVrij) || kies(vrij);
          if (doel) {
            a.x = Math.max(20, Math.min(W - 20, doel[0].x + doel[1].dx + (r() - .5) * W * .5)); a.y = headH - 16;
            a.vx = (r() - .5) * 2; a.vy = 1.6; neem(a, doel);
          } else if (L.zicht && r() < .04 * dt) {
            a.st = VLIEG; a.x = r() * W; a.y = headH - 16; a.vx = (r() - .5) * 2; a.vy = 1.4; a.rust = nu + 800 + r() * 3000;
          }
          continue;
        }

        if (a.st === VLIEG && nu > a.rust && r() < .04 * dt) {
          doel = kies(thuisVrij) || kies(vrij);
          if (doel) neem(a, doel);
        }

        if (a.st === LAND) {
          if (!landbaar(a.ro, a.slot)) loslaten(a);
          else {
            dx = a.ro.x + a.slot.dx - a.x; dy = a.ro.y + a.slot.dy - a.ro.m * .5 - a.y;
            d = Math.sqrt(dx * dx + dy * dy) || 1;
            if (d < 5) { a.st = ZIT; a.tot = nu + 8000 + r() * 18000; continue; }
            if (d > 70) { dy -= Math.min(48, d * .3); d = Math.sqrt(dx * dx + dy * dy) || 1; } // van boven aanvliegen
            var snel = Math.min(1.8 + a.z * 2.2, d * .055 + .5);
            a.vx += (dx / d * snel - a.vx) * Math.min(1, .14 * dt); a.vy += (dy / d * snel - a.vy) * Math.min(1, .14 * dt);
            a.x += a.vx * dt; a.y += a.vy * dt; a.ph += a.fs * dt * 1.5;
            continue;
          }
        }

        // vrij vliegen: bij elkaar blijven, niet botsen
        var sx = 0, sy = 0, ax = 0, ay = 0, kx = 0, ky = 0, nb = 0;
        for (j = 0; j < vogels.length; j++) {
          b = vogels[j]; if (i === j || b.st !== VLIEG) continue;
          dx = b.x - a.x; dy = b.y - a.y; d2 = dx * dx + dy * dy;
          if (d2 < 25600) {
            nb++; ax += b.vx; ay += b.vy; kx += b.x; ky += b.y;
            if (d2 < 2300 && d2 > 0) { sx -= dx / d2; sy -= dy / d2; }
          }
        }
        if (nb) {
          a.vx += (ax / nb - a.vx) * .03 + (kx / nb - a.x) * .0005;
          a.vy += (ay / nb - a.vy) * .03 + (ky / nb - a.y) * .0005;
        }
        a.vx += sx * 5; a.vy += sy * 5;
        if (L.zicht) {
          // wielen boven de kop: trek naar de cirkel en duw langs de raaklijn
          dx = a.x - L.cx; dy = (a.y - L.cy) * 2.2;
          var afst = Math.sqrt(dx * dx + dy * dy) || 1, trek = (afst - L.R) / L.R;
          a.vx += (-dx / afst) * trek * .09 + (-dy / afst) * .035;
          a.vy += (-dy / afst) * trek * .05 + (dx / afst) * .02;
          if (a.y < L.dak) a.vy += .14 + (L.dak - a.y) * .006;
          if (a.y > L.bodem) a.vy -= .16 + (a.y - L.bodem) * .004;
        } else {
          // geen lucht en geen plek: omhoog en uit beeld, tot er weer iets is om op te landen
          a.vy -= .22 * dt;
          if (a.y < headH - 30) { a.st = WEG; a.rust = nu + 500 + r() * 1600; continue; }
        }
        if (muis) {
          dx = a.x - muis.x; dy = a.y - muis.y; d2 = dx * dx + dy * dy;
          if (d2 < 22500 && d2 > 1) { var k = 46 / d2; a.vx += dx * k; a.vy += dy * k; }
        }
        var v = Math.sqrt(a.vx * a.vx + a.vy * a.vy) || 1, wil = 1.5 + a.z * 1.5;
        var nv = v + (wil - v) * .08, max = wil * 1.7;
        if (nv > max) nv = max;
        a.vx = a.vx / v * nv; a.vy = a.vy / v * nv;
        a.x += a.vx * dt; a.y += a.vy * dt; a.ph += a.fs * dt * (1 + (nv - wil) * .2);
        if (a.x < -40) a.x = W + 40; if (a.x > W + 40) a.x = -40;
      }
    }

    /* ---------- tekenen ---------- */
    function vliegend(a) {
      var s = (7 + a.z * 11) * schaal, slag = Math.sin(a.ph), span = s * (.28 + .9 * Math.abs(slag));
      ctx.save();
      ctx.translate(a.x, a.y); ctx.rotate(Math.atan2(a.vy, a.vx));
      ctx.globalAlpha = .5 + a.z * .5;
      ctx.beginPath();
      ctx.moveTo(s * .5, 0);
      ctx.quadraticCurveTo(s * .42, -s * .15, s * .16, -s * .15);
      ctx.bezierCurveTo(s * .3, -span * .55, s * .02, -span * .98, -s * .42, -span);
      ctx.quadraticCurveTo(-s * .12, -span * .5, -s * .2, -s * .13);
      ctx.lineTo(-s * .6, -s * .17); ctx.quadraticCurveTo(-s * .68, 0, -s * .6, s * .17); ctx.lineTo(-s * .2, s * .13);
      ctx.quadraticCurveTo(-s * .12, span * .5, -s * .42, span);
      ctx.bezierCurveTo(s * .02, span * .98, s * .3, span * .55, s * .16, s * .15);
      ctx.quadraticCurveTo(s * .42, s * .15, s * .5, 0);
      ctx.fill();
      ctx.restore();
    }
    // zittende duif van opzij: 26 breed, 20 hoog, poten op (0, 0)
    function zittend(x, y, m, kant, knik) {
      ctx.save();
      ctx.translate(x, y); ctx.scale(kant * m / 20, m / 20);
      ctx.beginPath(); ctx.moveTo(-13, -5.4); ctx.lineTo(-4, -10); ctx.lineTo(-1.5, -4.6); ctx.lineTo(-12, -2.6); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.ellipse(.6, -8.6, 7.7, 5.5, -.36, 0, 6.2832); ctx.fill();
      ctx.beginPath(); ctx.moveTo(2.2, -11.6); ctx.quadraticCurveTo(3.6, -16.4, 6 + knik, -17.6); ctx.lineTo(9.2 + knik, -14); ctx.lineTo(7, -8.4); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.arc(7 + knik, -16.9, 3.25, 0, 6.2832); ctx.fill();
      ctx.beginPath(); ctx.moveTo(9.4 + knik, -18.1); ctx.lineTo(13.4 + knik, -16.3); ctx.lineTo(9.6 + knik, -15.3); ctx.closePath(); ctx.fill();
      ctx.fillRect(-.5, -3.8, 1.2, 3.8); ctx.fillRect(2.6, -3.8, 1.2, 3.8);
      ctx.restore();
    }
    function alles(stil) {
      var i, j, a;
      if (stil) {
        var L = lucht();
        if (L.zicht) {
          for (i = 0; i < stilLucht.length; i++) {
            a = stilLucht[i];
            vliegend({ x: L.cx + Math.cos(a.h) * L.R * a.k, y: L.cy + Math.sin(a.h) * (L.bodem - L.dak) * .5 * a.k, vx: -Math.sin(a.h), vy: Math.cos(a.h) * .4, z: a.z, ph: a.ph });
          }
        }
        for (i = 0; i < roosts.length; i++) {
          for (j = 0; j < roosts[i].slots.length; j++) {
            var s = roosts[i].slots[j];
            if (landbaar(roosts[i], s)) zittend(roosts[i].x + s.dx, roosts[i].y + s.dy, roosts[i].m, s.kant, 0);
          }
        }
        return;
      }
      for (i = 0; i < vogels.length; i++) {
        a = vogels[i];
        if (a.st === WEG) continue;
        if (a.st === ZIT) zittend(a.x, a.y, a.ro.m, a.slot.kant, Math.sin(nu / 700 + a.ph * 9) > .93 ? 1.3 : 0);
        else vliegend(a);
      }
    }
    // twee keer tekenen: nachtblauw boven de lichte vlakken, wit boven de donkere
    function teken(stil) {
      var banden = [], i, b;
      for (i = 0; i < vlakken.length; i++) { b = vlakken[i].getBoundingClientRect(); if (b.bottom > 0 && b.top < H && b.height > 0) banden.push(b); }
      ctx.clearRect(0, 0, W, H);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H);
      for (i = 0; i < banden.length; i++) ctx.rect(0, banden[i].top, W, banden[i].height);
      ctx.clip('evenodd'); ctx.fillStyle = BLAUW; alles(stil); ctx.restore();
      if (!banden.length) return;
      ctx.save(); ctx.beginPath();
      for (i = 0; i < banden.length; i++) ctx.rect(0, banden[i].top, W, banden[i].height);
      ctx.clip(); ctx.fillStyle = WIT; alles(stil); ctx.restore();
    }
    function stilstaand() { kader(); teken(true); }

    function lus(t) {
      if (!loopt) return;
      var dt = Math.min(2.2, (t - vorige) / 16.67 || 1); vorige = t; nu = t;
      stap(dt); teken(false);
      requestAnimationFrame(lus);
    }
    var knop = $('#vluchtKnop');
    function zetKnop() {
      if (!knop) return;
      knop.setAttribute('aria-pressed', String(pauze));
      knop.querySelector('b').textContent = pauze ? 'Laat ze vliegen' : 'Pauzeer vlucht';
    }
    function regel(opnieuw) {
      var moet = !pauze && !document.hidden;
      if (moet && !loopt) { if (opnieuw) herstart(); loopt = true; vorige = performance.now(); requestAnimationFrame(lus); }
      if (!moet) { loopt = false; if (pauze) stilstaand(); }
    }
    if (knop) {
      knop.hidden = false;
      knop.addEventListener('click', function () { pauze = !pauze; zetKnop(); regel(true); });
      zetKnop();
    }

    maat(); maak(); meet();
    if (pauze) stilstaand(); else regel(true);

    // lettertypes en late opmaak verschuiven de plekken: opnieuw meten
    // (alleen als de breedte of de paginahoogte echt veranderde: de adresbalk van een telefoon telt niet)
    var docH = document.documentElement.scrollHeight;
    function hermeet(moet) {
      var w = W, h = document.documentElement.scrollHeight;
      maat();
      if (moet === true || pauze || w !== W || Math.abs(h - docH) > 2) { docH = h; meet(); }
      if (pauze) stilstaand();
    }
    function vers() { hermeet(true); }
    if (document.fonts && document.fonts.load) {
      Promise.all(Object.keys(lettertypes).map(function (f) { return document.fonts.load(f); })).then(vers, vers);
      if (document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', vers);
    }
    window.addEventListener('load', vers);
    [400, 1200, 2600].forEach(function (ms) { setTimeout(hermeet, ms); });
    document.addEventListener('animationend', function () { if (pauze) stilstaand(); });
    var rt;
    function straks() { cancelAnimationFrame(rt); rt = requestAnimationFrame(hermeet); }
    window.addEventListener('resize', straks);
    if ('ResizeObserver' in window) new ResizeObserver(straks).observe(document.documentElement);
    var wacht = false;
    window.addEventListener('scroll', function () {
      if (!pauze || wacht) return;
      wacht = true; requestAnimationFrame(function () { wacht = false; stilstaand(); });
    }, { passive: true });
    document.addEventListener('visibilitychange', function () { regel(false); });
    window.addEventListener('pointermove', function (e) { muis = { x: e.clientX, y: e.clientY }; }, { passive: true });
    window.addEventListener('pointerup', function (e) { if (e.pointerType !== 'mouse') muis = null; }, { passive: true });
    document.documentElement.addEventListener('pointerleave', function () { muis = null; });
  }

  /* ==========================================================================
     Beweging: zacht scrollen, onthullen, details
     ========================================================================== */
  function startBeweging() {
    // oogteken in "Over ons"
    var oog = $('#oogDisc');
    if (oog && D.lijnen[0]) oog.innerHTML = irisSVG(D.lijnen[0].ring);

    var te = $$('[data-reveal], .lat');
    if ('IntersectionObserver' in window && !REDUCED) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
      te.forEach(function (el) { io.observe(el); });
    } else {
      te.forEach(function (el) { el.classList.add('in'); });
    }

    if (REDUCED) return;

    var heeftGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
    if (typeof window.Lenis !== 'undefined') {
      lenis = new window.Lenis({ lerp: .11, wheelMultiplier: 1 });
      if (heeftGsap) {
        lenis.on('scroll', window.ScrollTrigger.update);
        window.gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
        window.gsap.ticker.lagSmoothing(0);
      } else {
        (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
      }
    }
    if (!heeftGsap) return;
    var gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    // twee namen schuiven naar elkaar toe tot ze één naam zijn
    var duo = $('.duo');
    if (duo) {
      var ruimte = function () {
        var w = 0; $$('span', duo).forEach(function (s) { w += s.offsetWidth; });
        return Math.max(0, (duo.clientWidth - w) / 2);
      };
      gsap.timeline({ scrollTrigger: { trigger: duo, start: 'top 96%', end: 'top 46%', scrub: .6, invalidateOnRefresh: true } })
        .fromTo('.duo-a', { x: function () { return -ruimte(); } }, { x: 0, ease: 'none' }, 0)
        .fromTo('.duo-b', { x: function () { return ruimte(); } }, { x: 0, ease: 'none' }, 0)
        .fromTo('.duo-s', { scaleX: 0 }, { scaleX: 1, ease: 'none' }, .3);
    }

    // het oog: de iris draait, de pupil vernauwt
    if (oog) {
      var tl = gsap.timeline({ scrollTrigger: { trigger: '.oog', start: 'top bottom', end: 'bottom top', scrub: .6 } });
      tl.fromTo('#oogDisc .iris-draai', { rotation: -50, svgOrigin: '0 0' }, { rotation: 40, svgOrigin: '0 0', ease: 'none' }, 0)
        .fromTo('#oogDisc .iris-pupil', { attr: { r: 14 } }, { attr: { r: 8.5 }, ease: 'none' }, 0);
    }
  }

  /* ---------- start ---------- */
  function start() {
    startDialog();
    tekenLijnen();
    tekenNieuws();
    startKoop();
    startUitslagen();
    startForm();
    startBeweging();
    startNav();
    startVlucht();
    // anker naar iets dat pas door dit script getekend is (bv. nieuws.html#id, bloedlijnen.html#lijn-id)
    if (location.hash.length > 1) {
      var doel = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (doel) setTimeout(function () { naar(doel); }, 120);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
