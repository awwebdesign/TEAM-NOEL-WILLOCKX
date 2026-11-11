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
  var uid = 0;

  /* ---------- hulpjes ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function getal(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function euro(n) { return '€ ' + getal(n); }
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
     Tekenen: iris, duif, ring
     ========================================================================== */
  var OGEN = {
    oranje: ['#ffd98a', '#ee8318', '#9c390a', '#f8e68a'],
    rood:   ['#ffab7d', '#cc2d1b', '#6e1209', '#f1c058'],
    parel:  ['#fdf9fb', '#cdb9d1', '#75638b', '#ffffff'],
    geel:   ['#fff5b3', '#e3bb22', '#8c6a0d', '#fbf4c8']
  };

  function irisSVG(type, seedStr) {
    var c = OGEN[type] || OGEN.oranje;
    var r = rng(zaad(seedStr + type));
    var id = 'ig' + (++uid);
    var vezels = '', rand = '', i, a, r1, r2;
    for (i = 0; i < 130; i++) {
      a = r() * Math.PI * 2; r1 = 14 + r() * 9; r2 = 28 + r() * 19;
      vezels += '<line x1="' + (Math.cos(a) * r1).toFixed(2) + '" y1="' + (Math.sin(a) * r1).toFixed(2) +
        '" x2="' + (Math.cos(a) * r2).toFixed(2) + '" y2="' + (Math.sin(a) * r2).toFixed(2) +
        '" stroke="' + (r() > .5 ? c[0] : c[2]) + '" stroke-width="' + (.3 + r() * 1.1).toFixed(2) +
        '" opacity="' + (.16 + r() * .46).toFixed(2) + '"/>';
    }
    for (i = 0; i < 46; i++) {
      a = r() * Math.PI * 2; r1 = 50 + r() * 5;
      rand += '<circle cx="' + (Math.cos(a) * r1).toFixed(2) + '" cy="' + (Math.sin(a) * r1).toFixed(2) +
        '" r="' + (.5 + r() * 1.1).toFixed(2) + '" fill="#cbbfb6" opacity="' + (.3 + r() * .5).toFixed(2) + '"/>';
    }
    return '<svg viewBox="-60 -60 120 120" aria-hidden="true" focusable="false">' +
      '<defs><radialGradient id="' + id + '"><stop offset="0" stop-color="' + c[0] + '"/><stop offset=".55" stop-color="' + c[1] +
      '"/><stop offset="1" stop-color="' + c[2] + '"/></radialGradient></defs>' +
      '<circle r="57" fill="#f1ebe6"/>' + rand +
      '<g class="iris-draai"><circle r="48" fill="url(#' + id + ')"/><g stroke-linecap="round">' + vezels + '</g>' +
      '<circle r="19.5" fill="none" stroke="' + c[3] + '" stroke-width="3.4" opacity=".5"/></g>' +
      '<circle r="14.6" fill="none" stroke="#1b130e" stroke-width="5" opacity=".58"/>' +
      '<circle r="48" fill="none" stroke="#2a1a12" stroke-width="2.2" opacity=".7"/>' +
      '<circle class="iris-pupil" r="11" fill="#090b0d"/>' +
      '<ellipse cx="-5" cy="-6" rx="3.2" ry="2" fill="#fff" opacity=".88" transform="rotate(-30 -5 -6)"/>' +
      '<path d="M-41 -25A48 48 0 0 1 25 -41" stroke="#fff" stroke-width="5" opacity=".14" fill="none" stroke-linecap="round"/>' +
      '</svg>';
  }

  var VEREN = {
    blauwband: { lijf: '#93a5b6', kop: '#73879a', vleugel: '#c5d0d9', slag: '#3a4550', band: '#27303a', staart: '#8697a8', p: 'band' },
    schalie:   { lijf: '#8799ab', kop: '#6b7f93', vleugel: '#b7c4cf', slag: '#35404b', band: '#2a333d', staart: '#7f91a3', p: 'schalie' },
    donker:    { lijf: '#5f6e7d', kop: '#4a5968', vleugel: '#48545f', slag: '#222a32', band: '#1b2229', staart: '#515f6d', p: 'donker' },
    schimmel:  { lijf: '#c6ced5', kop: '#a8b3bd', vleugel: '#e6eaee', slag: '#7b8793', band: '#6d7985', staart: '#b3bdc6', p: 'schimmel' },
    vaal:      { lijf: '#dbcfc4', kop: '#c5a896', vleugel: '#eee6de', slag: '#d6c9bd', band: '#a3523a', staart: '#d3c6ba', p: 'band' },
    witpen:    { lijf: '#93a5b6', kop: '#73879a', vleugel: '#c5d0d9', slag: '#f4f6f8', band: '#27303a', staart: '#8697a8', p: 'band' }
  };
  var P_LIJF = 'M300 62C292 44 262 40 250 58c-7 12-6 28-14 46-10 20-40 32-76 52-32 16-60 30-76 44l12 24c34 14 74 23 110 21 44-2 86-23 100-67 10-30 0-56-6-74-4-12 3-20 7-27Z';
  var P_VLEUGEL = 'M252 124c-28-12-70 4-102 28-38 30-78 54-114 70l8 12c48 2 106-6 152-26 38-18 62-48 56-84Z';
  var P_SLAG = 'M150 196c-38 14-78 24-114 26l8 12c48 2 88-3 122-14Z';

  function duifSVG(kleur, oog, seedStr, label) {
    var v = VEREN[kleur] || VEREN.blauwband;
    var o = OGEN[oog] || OGEN.oranje;
    var r = rng(zaad(seedStr + kleur));
    var n = ++uid, w = 'dw' + n, b = 'db' + n, h = 'dh' + n, s = 'ds' + n;
    var patroon = '', lijfPatroon = '', i, x, y;

    var banden = '<path d="M184 140c-4 26-22 56-46 74M214 130c-2 30-18 64-44 84" fill="none" stroke="' + v.band + '" stroke-width="10" stroke-linecap="round"/>';
    if (v.p === 'band') patroon = banden;
    if (v.p === 'schalie') {
      for (i = 0; i < 34; i++) {
        x = 128 + r() * 118; y = 124 + r() * 86;
        patroon += '<ellipse cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="' + (5 + r() * 3).toFixed(1) + '" ry="3.2" fill="' + v.band +
          '" opacity="' + (.6 + r() * .35).toFixed(2) + '" transform="rotate(-32 ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')"/>';
      }
      patroon += banden;
    }
    if (v.p === 'donker') {
      for (i = 0; i < 22; i++) {
        x = 120 + r() * 124; y = 124 + r() * 84;
        patroon += '<ellipse cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="6" ry="2.6" fill="#8d9ba8" opacity="' + (.18 + r() * .22).toFixed(2) +
          '" transform="rotate(-32 ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')"/>';
      }
    }
    if (v.p === 'schimmel') {
      for (i = 0; i < 90; i++) {
        x = 60 + r() * 190; y = 118 + r() * 112;
        patroon += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (.8 + r() * 2).toFixed(1) + '" fill="' + v.band + '" opacity="' + (.35 + r() * .5).toFixed(2) + '"/>';
      }
      for (i = 0; i < 60; i++) {
        x = 230 + r() * 80; y = 48 + r() * 180;
        lijfPatroon += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (.7 + r() * 1.6).toFixed(1) + '" fill="#5d6975" opacity="' + (.25 + r() * .4).toFixed(2) + '"/>';
      }
    }

    return '<svg viewBox="0 0 360 290" role="img" aria-label="' + esc(label) + '" focusable="false">' +
      '<defs><clipPath id="' + w + '"><path d="' + P_VLEUGEL + '"/></clipPath><clipPath id="' + b + '"><path d="' + P_LIJF + '"/></clipPath>' +
      '<linearGradient id="' + h + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#17936f"/><stop offset="1" stop-color="#7b4fd0"/></linearGradient>' +
      '<linearGradient id="' + s + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".3"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#0d141b" stop-opacity=".22"/></linearGradient></defs>' +
      '<ellipse cx="196" cy="279" rx="124" ry="6" fill="#121a23" opacity=".1"/>' +
      '<g fill="none" stroke="#c2473d" stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round"><path d="M226 238l2 28M228 266l14 5M228 266l-12 5M228 266l2 9"/><path d="M200 240l-4 28M196 268l14 5M196 268l-12 5M196 268l2 9"/></g>' +
      '<rect x="191.6" y="249" width="9.6" height="8.4" rx="1.6" fill="#e4571b"/>' +
      '<path d="M96 192 20 238l10 16 74-28Z" fill="' + v.staart + '"/><path d="M40 226 20 238l10 16 22-8Z" fill="' + v.band + '" opacity=".85"/>' +
      '<path d="' + P_LIJF + '" fill="' + v.lijf + '"/>' +
      '<g clip-path="url(#' + b + ')"><ellipse cx="276" cy="62" rx="40" ry="30" fill="' + v.kop + '"/>' +
      '<ellipse cx="262" cy="120" rx="34" ry="38" fill="url(#' + h + ')" opacity=".72"/><ellipse cx="276" cy="176" rx="44" ry="52" fill="#fff" opacity=".12"/>' +
      lijfPatroon + '<path d="' + P_LIJF + '" fill="url(#' + s + ')"/></g>' +
      '<path d="' + P_VLEUGEL + '" fill="' + v.vleugel + '"/>' +
      '<g clip-path="url(#' + w + ')">' + patroon + '<path d="' + P_SLAG + '" fill="' + v.slag + '"/>' +
      '<path d="M150 196c-36 12-70 20-104 24M158 206c-36 12-72 19-108 22M166 214c-34 10-72 15-112 16" fill="none" stroke="#0d141b" stroke-width="1" opacity=".28"/>' +
      '<path d="' + P_VLEUGEL + '" fill="url(#' + s + ')" opacity=".7"/></g>' +
      '<path d="M302 61c13 1 26 7 33 16-9 2-20 2-29 1Z" fill="#2c343c"/><ellipse cx="305" cy="62.5" rx="7.4" ry="4.6" fill="#f3f0ec" transform="rotate(22 305 62.5)"/>' +
      '<circle cx="281" cy="66" r="8.4" fill="#ebe7e2"/><circle cx="281" cy="66" r="6.3" fill="' + o[1] + '"/><circle cx="281" cy="66" r="3.1" fill="#0b0d10"/><circle cx="279.4" cy="64.2" r="1.1" fill="#fff"/>' +
      '</svg>';
  }

  function ringHTML(ring) {
    var m = /^([A-Z]+)(\d{2})-(\d+)$/.exec(ring);
    if (!m) return '<span class="ring"><span>' + esc(ring) + '</span></span>';
    return '<span class="ring" title="Ringnummer ' + esc(ring) + '"><span class="ring-land">' + m[1] + '</span><span class="ring-jaar">' + m[2] + '</span><span>' + m[3] + '</span></span>';
  }
  function sexeHTML(g) {
    return '<span class="sexe"><span aria-hidden="true">' + (g === 'duivin' ? '♀' : '♂') + '</span>' + (g === 'duivin' ? 'Duivin' : 'Doffer') + '</span>';
  }
  function visHTML(d) {
    var tag = d.status === 'nieuw' ? '<span class="tag">Nieuw</span>' : d.status === 'verkocht' ? '<span class="tag is-verkocht">Verkocht</span>' : '';
    var beeld = d.foto
      ? '<img class="vis-foto" src="' + esc(d.foto) + '" alt="Studiofoto van ' + esc(d.naam) + '" loading="lazy">'
      : '<span class="vis-duif">' + duifSVG(d.kleur, d.oog, d.ring, 'Tekening van ' + d.naam + ', ' + d.kleur) + '</span>';
    return '<span class="vis">' + tag + '<span class="vis-oog">' + irisSVG(d.oog, d.ring) + '</span>' + beeld + '</span>';
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
          '<summary><span class="lijn-naam">' + esc(l.naam) + '</span><span class="lijn-disc mono">' + esc(l.discipline) + '</span>' + ringHTML(l.ring) + '<span class="lijn-plus" aria-hidden="true"></span></summary>' +
          '<div class="lijn-body">' + visHTML({ naam: l.naam, ring: l.ring, kleur: l.kleur, oog: l.oog, status: '' }) +
          '<div class="lijn-txt"><p>' + esc(l.intro) + '</p><ul class="palm">' + l.palmares.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>' +
          (aantal
            ? '<a class="btn btn-ink" href="duiven-te-koop.html?lijn=' + l.id + '">' + (aantal === 1 ? 'Bekijk 1 duif uit deze lijn' : 'Bekijk ' + aantal + ' duiven uit deze lijn') + '</a>'
            : '<a class="btn btn-line" href="contact.html?onderwerp=wachtlijst">Vraag naar jongen uit deze lijn</a>') +
          '</div></div></details>';
      }).join('');
    }
    var kort = $('#lijnKort');
    if (kort) {
      kort.innerHTML = D.lijnen.map(function (l) {
        return '<a class="lijn-rij" href="bloedlijnen.html#lijn-' + l.id + '"><span class="lijn-naam">' + esc(l.naam) + '</span><span class="lijn-disc mono">' + esc(l.discipline) + '</span>' +
          ringHTML(l.ring) + '<span class="lijn-pijl" aria-hidden="true">→</span></a>';
      }).join('');
    }
  }

  /* ==========================================================================
     Duiven te koop (duiven-te-koop.html: alles met filters · index.html: nieuwste)
     ========================================================================== */
  function kaartHTML(d) {
    var lijn = lijnVan(d.lijn);
    return '<article class="duif" data-status="' + esc(d.status) + '">' +
      '<button type="button" class="duif-vis" data-open="' + d.id + '" aria-label="Meer over ' + esc(d.naam) + '">' + visHTML(d) + '</button>' +
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
      var b = e.target.closest('[data-open]'); if (b) openDuif(b.getAttribute('data-open'), b);
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
      '<p class="stam-uit">uit ' + esc(o.ouders) + '</p><ul>' + o.palmares.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul></section>';
  }
  function openDuif(id, bron) {
    var d = duifVan(id); if (!d || !dlg) return;
    var lijn = lijnVan(d.lijn), weg = d.status === 'verkocht';
    $('#dlgIn').innerHTML =
      '<div class="dlg-vis">' + visHTML(d) + '</div>' +
      '<div class="dlg-txt"><div class="duif-meta">' + ringHTML(d.ring) + sexeHTML(d.geslacht) + (lijn ? '<span class="sexe">Lijn ' + esc(lijn.naam) + '</span>' : '') + '</div>' +
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
      return '<tr><td class="dat">' + esc(u.datum) + '</td><td class="vl">' + esc(u.vlucht) + '</td><td class="num km">' + u.km + ' km</td><td class="niv">' + esc(u.niveau) +
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
  function datumNL(iso) { var p = String(iso).split('-'); return p[2] + '/' + p[1] + '/' + p[0]; }
  function tijdHTML(n) { return '<time class="mono" datetime="' + esc(n.datum) + '">' + datumNL(n.datum) + '</time>'; }
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
    if (tk) tk.textContent = 'Geklokt om ' + klok(eind) + ':' + ('0' + Math.floor((eind % 1) * 60)).slice(-2) + ' · ' + getal(SNELHEID) + ' m/min';

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
     De vlucht boven het hok (canvas)
     ========================================================================== */
  function startVlucht() {
    var cv = $('#flock'); if (!cv || !cv.getContext) return;
    var ctx = cv.getContext('2d'), W = 0, H = 0, vogels = [], loopt = false, zichtbaar = true, muis = null, vorige = 0;
    var r = rng(20261111), schaal = +cv.getAttribute('data-schaal') || 1;

    function maat() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function maak() {
      var basis = +cv.getAttribute('data-n') || 0;
      var n = basis ? (W < 700 ? Math.round(basis * .6) : basis) : W < 700 ? 20 : W < 1200 ? 48 : 66;
      vogels = [];
      for (var i = 0; i < n; i++) {
        var a = r() * Math.PI * 2, z = .4 + r() * .6;
        vogels.push({ x: W * (.35 + r() * .5), y: H * (H < 620 ? .1 + r() * .5 : W < 700 ? .08 + r() * .22 : .12 + r() * .4), vx: Math.cos(a) * 2, vy: Math.sin(a) * 1.2, z: z, ph: r() * 6.28, fs: .2 + r() * .08 });
      }
    }
    function stap(dt) {
      var smal = W < 700, kort = H < 620; // kort = paginakop op een subpagina
      var cx = W * (kort ? (smal ? .62 : .76) : smal ? .52 : .64), cy = H * (kort ? (smal ? .3 : .46) : smal ? .13 : .29);
      var R = Math.min(W, H) * (kort ? .36 : smal ? .34 : .3), i, j, a, b, dx, dy, d2;
      // band waarin de vogels blijven: onder de kop, boven de leestekst
      var dak = kort ? 96 : smal ? 62 : 88;
      var bodem = H * (kort ? (smal ? .5 : .86) : smal ? .2 : .42);
      for (i = 0; i < vogels.length; i++) {
        a = vogels[i];
        var sx = 0, sy = 0, ax = 0, ay = 0, kx = 0, ky = 0, nb = 0;
        for (j = 0; j < vogels.length; j++) {
          if (i === j) continue; b = vogels[j];
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
        // wielen rond het hok: trek naar de cirkel en duw langs de raaklijn
        dx = a.x - cx; dy = (a.y - cy) * 1.9;
        var afst = Math.sqrt(dx * dx + dy * dy) || 1, trek = (afst - R) / R;
        a.vx += (-dx / afst) * trek * .09 + (-dy / afst) * .035;
        a.vy += (-dy / afst) * trek * .05 + (dx / afst) * .02;
        if (muis) {
          dx = a.x - muis.x; dy = a.y - muis.y; d2 = dx * dx + dy * dy;
          if (d2 < 22500 && d2 > 1) { var k = 46 / d2; a.vx += dx * k; a.vy += dy * k; }
        }
        var v = Math.sqrt(a.vx * a.vx + a.vy * a.vy) || 1, doel = 1.5 + a.z * 1.5;
        var nv = v + (doel - v) * .08, max = doel * 1.7;
        if (nv > max) nv = max;
        a.vx = a.vx / v * nv; a.vy = a.vy / v * nv;
        a.x += a.vx * dt; a.y += a.vy * dt; a.ph += a.fs * dt * (1 + (nv - doel) * .2);
        if (a.y < dak) a.vy += .14 + (dak - a.y) * .006; if (a.y > bodem) a.vy -= .16 + (a.y - bodem) * .004;
        if (a.x < -40) a.x = W + 40; if (a.x > W + 40) a.x = -40;
      }
    }
    function teken() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < vogels.length; i++) {
        var a = vogels[i], s = (6 + a.z * 13) * schaal, slag = Math.sin(a.ph), span = s * (.28 + .9 * Math.abs(slag));
        ctx.save();
        ctx.translate(a.x, a.y); ctx.rotate(Math.atan2(a.vy, a.vx));
        ctx.globalAlpha = .28 + a.z * .62;
        ctx.fillStyle = '#18222d';
        ctx.beginPath();
        // kop en borst
        ctx.moveTo(s * .5, 0);
        ctx.quadraticCurveTo(s * .42, -s * .15, s * .16, -s * .15);
        // linkervleugel: ronde voorrand, spitse slagpennen naar achter
        ctx.bezierCurveTo(s * .3, -span * .55, s * .02, -span * .98, -s * .42, -span);
        ctx.quadraticCurveTo(-s * .12, -span * .5, -s * .2, -s * .13);
        // staartwaaier
        ctx.lineTo(-s * .6, -s * .17); ctx.quadraticCurveTo(-s * .68, 0, -s * .6, s * .17); ctx.lineTo(-s * .2, s * .13);
        // rechtervleugel
        ctx.quadraticCurveTo(-s * .12, span * .5, -s * .42, span);
        ctx.bezierCurveTo(s * .02, span * .98, s * .3, span * .55, s * .16, s * .15);
        ctx.quadraticCurveTo(s * .42, s * .15, s * .5, 0);
        ctx.fill();
        ctx.restore();
      }
    }
    function lus(t) {
      if (!loopt) return;
      var dt = Math.min(2.2, (t - vorige) / 16.67 || 1); vorige = t;
      stap(dt); teken();
      requestAnimationFrame(lus);
    }
    var pauze = REDUCED, knop = $('#vluchtKnop');
    if (knop) {
      knop.hidden = false;
      var zetKnop = function () {
        knop.setAttribute('aria-pressed', String(pauze));
        knop.querySelector('b').textContent = pauze ? 'Laat ze vliegen' : 'Pauzeer vlucht';
      };
      knop.addEventListener('click', function () { pauze = !pauze; zetKnop(); regel(); });
      zetKnop();
    }
    function regel() {
      var moet = zichtbaar && !pauze && !document.hidden;
      if (moet && !loopt) { loopt = true; vorige = performance.now(); requestAnimationFrame(lus); }
      if (!moet) loopt = false;
    }

    maat(); maak();
    for (var k = 0; k < 240; k++) stap(1);
    teken();

    var hero = cv.parentNode;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { zichtbaar = es[0].isIntersecting; regel(); }).observe(hero);
    }
    document.addEventListener('visibilitychange', regel);
    hero.addEventListener('pointermove', function (e) {
      var b = cv.getBoundingClientRect(); muis = { x: e.clientX - b.left, y: e.clientY - b.top };
    });
    hero.addEventListener('pointerleave', function () { muis = null; });
    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt); rt = setTimeout(function () {
        var oud = W; maat(); if (Math.abs(oud - W) > 60) { maak(); for (var q = 0; q < 120; q++) stap(1); } teken();
      }, 150);
    });
    regel();
  }

  /* ==========================================================================
     Beweging: zacht scrollen, onthullen, details
     ========================================================================== */
  function startBeweging() {
    // oog in "Over ons"
    var oog = $('#oogDisc');
    if (oog && D.lijnen[0]) oog.innerHTML = irisSVG(D.lijnen[0].oog, D.lijnen[0].ring);

    // ticker verdubbelen voor een naadloze lus
    var tick = $('#ticker');
    if (tick && !REDUCED) {
      $$('span', tick).forEach(function (s) { var k = s.cloneNode(true); k.setAttribute('aria-hidden', 'true'); tick.appendChild(k); });
    }

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

    // de hemel schuift trager dan de daken
    var kop = $('.hero, .phero');
    if (kop) {
      if ($('.hero-in')) gsap.to('.hero-in', { yPercent: -9, ease: 'none', scrollTrigger: { trigger: kop, start: 'top top', end: 'bottom top', scrub: true } });
      if ($('.flock')) gsap.to('.flock', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: kop, start: 'top top', end: 'bottom top', scrub: true } });
    }

    // het oog: de iris draait, de pupil vernauwt
    if (oog) {
      var tl = gsap.timeline({ scrollTrigger: { trigger: '.oog', start: 'top bottom', end: 'bottom top', scrub: .6 } });
      tl.fromTo('#oogDisc .iris-draai', { rotation: -50, svgOrigin: '0 0' }, { rotation: 40, svgOrigin: '0 0', ease: 'none' }, 0)
        .fromTo('#oogDisc .iris-pupil', { attr: { r: 15 } }, { attr: { r: 8.5 }, ease: 'none' }, 0);
    }

    // thuiskomst
    if ($('#thuisWord')) gsap.from('#thuisWord', { yPercent: 38, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.thuis', start: 'top bottom', end: 'bottom bottom', scrub: .5 } });
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
