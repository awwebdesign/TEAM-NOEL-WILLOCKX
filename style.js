/* ==========================================================================
   Team Noel-Willockx · gedrag
   Inhoud staat in data.js (window.NW_DATA). Dit bestand tekent en bedient.
   Het wordt op elke pagina geladen; elk onderdeel start alleen als zijn
   element op die pagina staat.
   ========================================================================== */
(function () {
  'use strict';

  var D = window.NW_DATA || { lijnen: [], duiven: [], lossingen: [], uitslagen: {} };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

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
      tekstSVG(88, 79, 'stam-o', v.naam, 118, 8.3) + tekstSVG(88, 99, 'stam-r', v.ring, 118, 7.4) +
      tekstSVG(88, 205, 'stam-o', m.naam, 118, 8.3) + tekstSVG(88, 225, 'stam-r', m.ring, 118, 7.4) +
      tekstSVG(240, 51, 'stam-g', gv[0] || '', 114, 7.6) + tekstSVG(240, 123, 'stam-g', gv[1] || '', 114, 7.6) +
      tekstSVG(240, 177, 'stam-g', gm[0] || '', 114, 7.6) + tekstSVG(240, 249, 'stam-g', gm[1] || '', 114, 7.6) +
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
        return '<a class="lijn-rij" href="bloedlijnen.html#lijn-' + l.id + '"><span class="lijn-naam">' + esc(l.naam) + '</span><span class="lijn-disc">' + esc(l.discipline) + '</span>' +
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
  }
  function startDialog() {
    dlg = $('#dlg'); if (!dlg) return;
    $('#dlgX').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', function () {
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
    window.scrollTo(0, top);
    if (klaar) klaar();
  }

  function startNav() {
    var head = $('#head'), burger = $('#burger'), mnav = $('#mnav');
    var wacht = false;
    function bij() { wacht = false; head.classList.toggle('is-solid', window.pageYOffset > 24); }
    function vraag() { if (!wacht) { wacht = true; requestAnimationFrame(bij); } }
    window.addEventListener('scroll', vraag, { passive: true });
    bij();

    function menu(open) {
      mnav.hidden = !open;
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Menu sluiten' : 'Menu openen');
      document.documentElement.style.overflow = open ? 'hidden' : '';
      head.classList.toggle('is-solid', open || window.pageYOffset > 24);
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
     Oogteken in "Over ons" (stilstaand schema)
     ========================================================================== */
  function tekenOog() {
    var oog = document.getElementById('oogDisc');
    if (oog && D.lijnen[0]) oog.innerHTML = irisSVG(D.lijnen[0].ring);
  }

  /* ==========================================================================
     De vier bloedlijnen als lijntekening in de kop van de homepage
     ========================================================================== */
  function tekenKopLijnen() {
    var el = document.getElementById('kopLijnen'); if (!el || !D.lijnen.length) return;
    var n = D.lijnen.length, stap = 120, rand = 44, h = rand * 2 + stap * (n - 1), mid = h / 2;
    var pad = 'M66 ' + mid + 'H104M104 ' + rand + 'V' + (h - rand), tekst = '';
    D.lijnen.forEach(function (l, i) {
      var y = rand + stap * i;
      pad += 'M104 ' + y + 'H140';
      tekst += '<a class="kl" href="bloedlijnen.html#lijn-' + l.id + '" style="--i:' + i + '">' +
        '<text class="kl-naam" x="160" y="' + (y + 12) + '">' + esc(l.naam) + '</text>' +
        '<text class="kl-disc" x="160" y="' + (y + 38) + '">' + esc(l.discipline) + '</text></a>';
    });
    el.innerHTML = '<svg viewBox="0 0 460 ' + (h + 30) + '" class="diagram" role="group" aria-label="Onze ' + n + ' bloedlijnen" focusable="false">' +
      '<path class="kl-lijn" pathLength="1" d="' + pad + '"/>' +
      '<circle class="kl-ring" cx="40" cy="' + mid + '" r="25"/><circle class="kl-kern" cx="40" cy="' + mid + '" r="9"/>' + tekst + '</svg>';
  }

  /* ==========================================================================
     Beweging: koppen woord voor woord, secties zacht in beeld.
     Bij "minder beweging" (klasse rustig) gebeurt hier niets.
     ========================================================================== */
  function startBeweging() {
    if (document.documentElement.classList.contains('rustig') || !('IntersectionObserver' in window)) return;

    // koppen in woorden knippen: <span class="w"><span>woord</span></span>
    var teller;
    function knip(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (k) {
        if (k.nodeType === 1) { if (k.tagName !== 'BR') knip(k); return; }
        if (k.nodeType !== 3 || !k.data.trim()) return;
        var stuk = document.createDocumentFragment();
        k.data.split(/(\s+)/).forEach(function (deel) {
          if (!deel) return;
          if (/^\s+$/.test(deel)) { stuk.appendChild(document.createTextNode(' ')); return; }
          var w = document.createElement('span'), binnen = document.createElement('span');
          w.className = 'w'; binnen.textContent = deel; binnen.style.setProperty('--i', teller++);
          w.appendChild(binnen); stuk.appendChild(w);
        });
        node.replaceChild(stuk, k);
      });
    }
    var koppen = $$('h1, .sec-title, .sub-title, .news-lead h3, .artikel h2');
    koppen.forEach(function (h) { teller = 0; knip(h); h.setAttribute('data-split', ''); });

    // onderdelen die zacht in beeld schuiven, per rij na elkaar
    var delen = $$('.kop-lead, .kop-cta, .kop-lijnen, .phero-sub, .ticker-track li, .wie-txt, .sec-zij, .sec-sub, .sec-head > .more, .filters, .duif, .lijn-rij, .lijn, .lat, .board, .news-lead > :not(h3), .news-list li, .artikel > time, .artikel-in > :not(h2), .over-copy > p, .facts, .oog, .jaar li, .ref-list li, .ref-na, .cta-zij, .foot-form > :not(h2), .foot-grid .foot-info, .foot-cols > *');
    delen.forEach(function (el) {
      if (!el.style.getPropertyValue('--i') && !/kop-lead|kop-cta/.test(el.className)) {
        el.style.setProperty('--i', Math.min(6, Array.prototype.indexOf.call(el.parentNode.children, el)));
      }
      el.setAttribute('data-rv', '');
    });

    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.setAttribute('data-in', ''); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .05 });
    // eerst één beeld laten tekenen, dan pas starten: zo loopt de overgang echt
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      koppen.concat(delen).forEach(function (el) { io.observe(el); });
    }); });
  }

  /* ---------- start ---------- */
  function start() {
    startDialog();
    tekenLijnen();
    tekenNieuws();
    startKoop();
    startUitslagen();
    startForm();
    tekenOog();
    tekenKopLijnen();
    startNav();
    startBeweging();
    // anker naar iets dat pas door dit script getekend is (bv. nieuws.html#id, bloedlijnen.html#lijn-id)
    if (location.hash.length > 1) {
      var doel = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (doel) setTimeout(function () { naar(doel); }, 120);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
