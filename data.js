/* ==========================================================================
   Team Noel-Willockx · inhoud
   --------------------------------------------------------------------------
   DEMO-INHOUD: alle duiven, ringnummers, prijzen, uitslagen, referenties en
   nieuwsberichten hieronder zijn voorbeelden. Vervang ze door echte gegevens.

   Een duif toevoegen = één blok kopiëren in `duiven`.
   Heb je een studiofoto? Zet het pad in `foto` (bv. "images/mistral.webp",
   witte of lichtgrijze achtergrond). Zonder foto tekent de site de duif zelf
   op basis van `kleur` en `oog`.

   kleur : blauwband | schalie | donker | schimmel | vaal | witpen
   oog   : oranje | rood | parel | geel
   ========================================================================== */
window.NW_DATA = {

  vlucht: { lossing: 'Bourges', uur: '07:15', km: 462, snelheid: 1412 },

  lijnen: [
    {
      id: 'generaal',
      naam: 'De Generaal',
      ring: 'BE18-6032210',
      discipline: 'Halve fond',
      kleur: 'blauwband', oog: 'oranje', geslacht: 'doffer',
      intro: 'Onze stamdoffer. Zelf drie keer bij de eerste tien provinciaal, en als kweker nog beter dan als vlieger.',
      palmares: [
        'Vader en grootvader van 14 eerste-prijswinnaars',
        '1e Prov. Melun · 3 204 duiven',
        '4e Nat. Zone Bourges · 6 118 duiven'
      ]
    },
    {
      id: 'marie',
      naam: 'Schone Marie',
      ring: 'BE19-6077154',
      discipline: 'Snelheid & halve fond',
      kleur: 'schalie', oog: 'rood', geslacht: 'duivin',
      intro: 'Zes eerste prijzen in twee seizoenen. Haar dochters vallen vroeg van Quiévrain tot Melun.',
      palmares: [
        '6 × 1e prijs, zonder dubbelingen',
        '1e Asduif Snelheid Verbond 2021',
        'Moeder van 2e Prov. Asduif Jongen 2024'
      ]
    },
    {
      id: 'bourges',
      naam: 'Oude Bourges',
      ring: 'BE17-6090032',
      discipline: 'Fond',
      kleur: 'donker', oog: 'rood', geslacht: 'doffer',
      intro: 'De lijn voor wie verder wil. Hard weer, kopwind, 500 kilometer en meer: dan komen deze duiven boven.',
      palmares: [
        '1e Prov. Bourges · 4 812 duiven',
        '7e Nat. Châteauroux · 12 406 duiven',
        'Grootvader van 3e Nat. Asduif Fond 2025'
      ]
    },
    {
      id: 'noel',
      naam: 'Kleine Noel',
      ring: 'BE20-6145519',
      discipline: 'Jonge duiven',
      kleur: 'schimmel', oog: 'geel', geslacht: 'doffer',
      intro: 'Klein van stuk, vroeg rijp. Zijn jongen presteren al in hun geboortejaar, ook op andere hokken.',
      palmares: [
        '1e Asduif Jongen Verbond 2020',
        'Vader van 5 × 1e prijs bij de jongen',
        'Nakomelingen in de top 20 van twee one loft races'
      ]
    }
  ],

  duiven: [
    {
      id: 'mistral', naam: 'Mistral', ring: 'BE26-6041187', geslacht: 'doffer',
      kleur: 'blauwband', oog: 'oranje', lijn: 'generaal', prijs: 1850, status: 'nieuw', foto: '',
      afstamming: "Zoon 'De Generaal' × 'Schone Marie'",
      tekst: 'De koppeling waar we zelf het meest uit kweken. Soepele doffer met een lange vleugel en veel reserve in de hand.',
      vader: { naam: 'De Generaal', ring: 'BE18-6032210', ouders: "'Rik' × 'Blauwe Melun'",
        palmares: ['1e Prov. Melun · 3 204 d.', '4e Nat. Zone Bourges · 6 118 d.', 'Vader van 14 eerste-prijswinnaars'] },
      moeder: { naam: 'Schone Marie', ring: 'BE19-6077154', ouders: "'Bliksem' × 'Greet'",
        palmares: ['6 × 1e prijs', '1e Asduif Snelheid Verbond 2021'] }
    },
    {
      id: 'late-zomer', naam: 'Late Zomer', ring: 'BE26-6041203', geslacht: 'duivin',
      kleur: 'schalie', oog: 'rood', lijn: 'marie', prijs: 1450, status: '', foto: '',
      afstamming: "Kleindochter 'Schone Marie'",
      tekst: 'Late jong van 2026, rustig van karakter. Uit een dochter van Schone Marie die zelf 1e Noyon won tegen 1 942 duiven.',
      vader: { naam: 'Zesde Zin', ring: 'BE22-6102877', ouders: "'Kleine Noel' × 'Fien'",
        palmares: ['2e Noyon · 2 310 d.', '8e Prov. Melun · 4 020 d.'] },
      moeder: { naam: 'Zomerkind', ring: 'BE23-6055410', ouders: "'De Generaal' × 'Schone Marie'",
        palmares: ['1e Noyon · 1 942 d.', '3e Quiévrain · 1 118 d.'] }
    },
    {
      id: 'kleine-bourges', naam: 'Kleine Bourges', ring: 'BE25-6118842', geslacht: 'doffer',
      kleur: 'donker', oog: 'rood', lijn: 'bourges', prijs: 2400, status: '', foto: '',
      afstamming: "Zoon 'Oude Bourges'",
      tekst: 'Jaarling, zelf gespeeld in 2026: 4 op 5 op de fond, met een 12e Prov. Châteauroux als uitschieter.',
      vader: { naam: 'Oude Bourges', ring: 'BE17-6090032', ouders: "'Zwarte Fond' × 'Limoges-duivin'",
        palmares: ['1e Prov. Bourges · 4 812 d.', '7e Nat. Châteauroux · 12 406 d.'] },
      moeder: { naam: 'Stille Kracht', ring: 'BE21-6130226', ouders: "'De Generaal' × 'Donkere Brive'",
        palmares: ['Moeder van 3e Nat. Asduif Fond 2025', '11e Prov. Argenton · 2 960 d.'] }
    },
    {
      id: 'witte-veer', naam: 'Witte Veer', ring: 'BE26-6041256', geslacht: 'duivin',
      kleur: 'witpen', oog: 'parel', lijn: 'marie', prijs: 1250, status: 'nieuw', foto: '',
      afstamming: "Dochter 'Bliksem' × 'Greta'",
      tekst: 'Opvallende witpen met een parelmoer oog. Halfzus van onze eerste getekende op Melun dit seizoen.',
      vader: { naam: 'Bliksem', ring: 'BE20-6145603', ouders: "'Rappe' × 'Schone Marie'",
        palmares: ['1e Quiévrain · 1 506 d.', '1e Noyon · 988 d.', '5e Prov. Asduif Snelheid 2022'] },
      moeder: { naam: 'Greta', ring: 'BE22-6102941', ouders: "'De Generaal' × 'Witpenneke'",
        palmares: ['4e Melun · 2 204 d.', '9e Prov. Fay-aux-Loges · 5 317 d.'] }
    },
    {
      id: 'stille-willy', naam: 'Stille Willy', ring: 'BE25-6118907', geslacht: 'doffer',
      kleur: 'schimmel', oog: 'geel', lijn: 'noel', prijs: 950, status: '', foto: '',
      afstamming: "Zoon 'Kleine Noel'",
      tekst: 'Schimmel zoals zijn vader, even klein en even gretig. Ideale kweekdoffer voor het jongeduivenspel.',
      vader: { naam: 'Kleine Noel', ring: 'BE20-6145519', ouders: "'Witoog' × 'Schimmelke'",
        palmares: ['1e Asduif Jongen Verbond 2020', 'Vader van 5 × 1e prijs'] },
      moeder: { naam: 'Fien', ring: 'BE21-6130340', ouders: "'Rik' × 'Vale Noyon'",
        palmares: ['2e Quiévrain · 1 730 d.', '6e Noyon · 2 044 d.'] }
    },
    {
      id: 'greta-jr', naam: 'Jonge Greta', ring: 'BE26-6041291', geslacht: 'duivin',
      kleur: 'blauwband', oog: 'oranje', lijn: 'generaal', prijs: 1650, status: '', foto: '',
      afstamming: "Kleindochter 'De Generaal'",
      tekst: 'Typische Generaal-duivin: breed in de borst, kort in de achtervleugel. Uit ons tweede kweekkoppel.',
      vader: { naam: 'Kapitein', ring: 'BE22-6102800', ouders: "'De Generaal' × 'Blauwe Melun'",
        palmares: ['1e Melun · 1 887 d.', '6e Prov. Bourges · 3 911 d.'] },
      moeder: { naam: 'Greta', ring: 'BE22-6102941', ouders: "'De Generaal' × 'Witpenneke'",
        palmares: ['4e Melun · 2 204 d.', '9e Prov. Fay-aux-Loges · 5 317 d.'] }
    },
    {
      id: 'nachtvlucht', naam: 'Nachtvlucht', ring: 'BE25-6118960', geslacht: 'doffer',
      kleur: 'donker', oog: 'oranje', lijn: 'bourges', prijs: 2100, status: 'verkocht', foto: '',
      afstamming: "Kleinzoon 'Oude Bourges'",
      tekst: 'Vertrokken naar een fondhok in Limburg. We laten hem staan zodat je ziet wat deze lijn geeft.',
      vader: { naam: 'Zwarte Brive', ring: 'BE21-6130098', ouders: "'Oude Bourges' × 'Donkere Brive'",
        palmares: ['3e Prov. Limoges · 2 416 d.', '21e Nat. Brive · 9 042 d.'] },
      moeder: { naam: 'Avondster', ring: 'BE22-6103015', ouders: "'Oude Bourges' × 'Stille Kracht'",
        palmares: ['Moeder van 12e Prov. Châteauroux 2026'] }
    },
    {
      id: 'vale-fien', naam: 'Vale Fien', ring: 'BE26-6041312', geslacht: 'duivin',
      kleur: 'vaal', oog: 'geel', lijn: 'noel', prijs: 1100, status: '', foto: '',
      afstamming: "Dochter 'Kleine Noel' × 'Fien'",
      tekst: 'Vaal duivinneke uit het koppel dat ons de meeste vroege jongen gaf. Volle zus van Zesde Zin.',
      vader: { naam: 'Kleine Noel', ring: 'BE20-6145519', ouders: "'Witoog' × 'Schimmelke'",
        palmares: ['1e Asduif Jongen Verbond 2020', 'Vader van 5 × 1e prijs'] },
      moeder: { naam: 'Fien', ring: 'BE21-6130340', ouders: "'Rik' × 'Vale Noyon'",
        palmares: ['2e Quiévrain · 1 730 d.', '6e Noyon · 2 044 d.'] }
    },
    {
      id: 'tegenwind', naam: 'Tegenwind', ring: 'BE26-6041340', geslacht: 'doffer',
      kleur: 'schalie', oog: 'rood', lijn: 'bourges', prijs: 1750, status: 'nieuw', foto: '',
      afstamming: "Zoon 'Kleine Bourges' × 'Zomerkind'",
      tekst: 'Kruising van onze fondlijn met de snelheid van Schone Marie. Voor wie een allround kweker zoekt.',
      vader: { naam: 'Kleine Bourges', ring: 'BE25-6118842', ouders: "'Oude Bourges' × 'Stille Kracht'",
        palmares: ['12e Prov. Châteauroux · 3 388 d.', '4 op 5 op de fond in 2026'] },
      moeder: { naam: 'Zomerkind', ring: 'BE23-6055410', ouders: "'De Generaal' × 'Schone Marie'",
        palmares: ['1e Noyon · 1 942 d.', '3e Quiévrain · 1 118 d.'] }
    }
  ],

  /* Nieuws: nieuwste bovenaan. De eerste vier staan ook op de homepage.
     datum = jjjj-mm-dd · link is optioneel */
  nieuws: [
    {
      id: 'winterkweek-2026', datum: '2026-11-02',
      titel: 'Winterkweek gestart: twaalf koppels zitten samen',
      intro: "De kweekhokken zijn ontsmet, de schotels liggen klaar. Dit jaar zetten we 'De Generaal' voor het eerst tegen een dochter van 'Oude Bourges'.",
      tekst: [
        'De eerste eieren verwachten we half november. Elke koppeling lag al vast voor het seizoen afgelopen was: we kijken naar de uitslagen van ouders en grootouders, niet naar wat mooi staat op papier.',
        'De jongen uit de eerste ronde komen in februari in de verkoop. Wie eerste keuze wil, zet zich best nu al op de wachtlijst.'
      ],
      link: { tekst: 'Zet me op de wachtlijst', href: 'contact.html?onderwerp=wachtlijst' }
    },
    {
      id: 'late-jongen-te-koop', datum: '2026-10-18',
      titel: 'Late jongen van 2026 nu te koop',
      intro: 'Negen duiven uit onze eerste kweekkoppels, allemaal met stamkaart.',
      tekst: [
        "Onder meer 'Mistral', een zoon van 'De Generaal' × 'Schone Marie', en 'Tegenwind', de eerste kruising van onze fondlijn met de snelheid van Schone Marie.",
        'Elke duif kan je op afspraak komen bekijken. Verzending binnen België en Nederland regelen we in overleg.'
      ],
      link: { tekst: 'Bekijk de duiven', href: 'duiven-te-koop.html' }
    },
    {
      id: 'seizoen-in-cijfers', datum: '2026-09-27',
      titel: 'Het seizoen in cijfers: 31 eerste prijzen',
      intro: 'Van Quiévrain tot Châteauroux. De volledige lijst staat online.',
      tekst: [
        'Acht vluchten op provinciaal of nationaal niveau, vijf keer bij de eerste tien. De snelheidsploeg won op Noyon en Quiévrain telkens met meerdere duiven vooraan.',
        'We tellen geen dubbelingen mee. Elke prijs in de lijst is behaald in het hoofdconcours.'
      ],
      link: { tekst: 'Naar de uitslagen', href: 'uitslagen.html' }
    },
    {
      id: 'chateauroux-nationaal', datum: '2026-09-12',
      titel: '7e Nationaal Châteauroux tegen 12 406 duiven',
      intro: "'Kleine Bourges' sluit zijn jaar af met zijn beste vlucht.",
      tekst: [
        'Gelost om 07:10 bij kopwind, geklokt na ruim zeven uur vliegen. Het is zijn vierde prijs op vijf fondvluchten dit seizoen.',
        "'Kleine Bourges' is een zoon van onze stamdoffer 'Oude Bourges' en staat intussen zelf op het kweekhok."
      ],
      link: { tekst: 'Zijn bloedlijn', href: 'bloedlijnen.html#lijn-bourges' }
    },
    {
      id: 'dubbel-melun', datum: '2026-08-29',
      titel: '1e en 3e Provinciaal Melun',
      intro: 'Twee kleinkinderen van De Generaal bij de eerste drie tegen 3 204 duiven.',
      tekst: [
        'Het is de tweede keer dat deze lijn provinciaal wint op Melun. De winnares is een volle zus van Jonge Greta, die nu te koop staat.'
      ],
      link: { tekst: 'Bekijk Jonge Greta', href: 'duiven-te-koop.html?duif=greta-jr' }
    }
  ],

  /* Lossingsplaatsen op de afstandslat (afstanden bij benadering) */
  lossingen: [
    { naam: 'Quiévrain', km: 110 },
    { naam: 'Noyon', km: 210 },
    { naam: 'Melun', km: 320 },
    { naam: 'Bourges', km: 462 },
    { naam: 'Châteauroux', km: 535 },
    { naam: 'Limoges', km: 655 },
    { naam: 'Brive', km: 730 },
    { naam: 'Barcelona', km: 1080 }
  ],

  /* cat: snelheid | halvefond | fond */
  uitslagen: {
    2026: [
      { datum: '12/09', vlucht: 'Châteauroux', km: 535, niveau: 'Nationaal', duiven: 12406, prijzen: '7, 41, 88, 212', cat: 'fond' },
      { datum: '29/08', vlucht: 'Melun', km: 320, niveau: 'Provinciaal', duiven: 3204, prijzen: '1, 3, 14, 26, 31', cat: 'halvefond' },
      { datum: '15/08', vlucht: 'Noyon', km: 210, niveau: 'Verbond', duiven: 1942, prijzen: '1, 2, 5, 9, 17, 22', cat: 'snelheid' },
      { datum: '01/08', vlucht: 'Bourges', km: 462, niveau: 'Provinciaal', duiven: 4812, prijzen: '1, 12, 30, 55', cat: 'fond' },
      { datum: '18/07', vlucht: 'Limoges', km: 655, niveau: 'Provinciaal', duiven: 2416, prijzen: '3, 19, 44', cat: 'fond' },
      { datum: '04/07', vlucht: 'Quiévrain', km: 110, niveau: 'Verbond', duiven: 1506, prijzen: '1, 4, 6, 7, 13, 20', cat: 'snelheid' },
      { datum: '20/06', vlucht: 'Melun', km: 320, niveau: 'Verbond', duiven: 1887, prijzen: '1, 8, 11, 15', cat: 'halvefond' },
      { datum: '30/05', vlucht: 'Bourges', km: 462, niveau: 'Nationaal zone', duiven: 6118, prijzen: '4, 27, 63', cat: 'fond' }
    ],
    2025: [
      { datum: '06/09', vlucht: 'Argenton', km: 560, niveau: 'Provinciaal', duiven: 2960, prijzen: '11, 18, 52', cat: 'fond' },
      { datum: '23/08', vlucht: 'Noyon', km: 210, niveau: 'Verbond', duiven: 2310, prijzen: '2, 3, 10, 24', cat: 'snelheid' },
      { datum: '09/08', vlucht: 'Melun', km: 320, niveau: 'Provinciaal', duiven: 4020, prijzen: '8, 9, 33', cat: 'halvefond' },
      { datum: '26/07', vlucht: 'Brive', km: 730, niveau: 'Nationaal', duiven: 9042, prijzen: '21, 104', cat: 'fond' },
      { datum: '05/07', vlucht: 'Quiévrain', km: 110, niveau: 'Verbond', duiven: 1730, prijzen: '2, 5, 12, 16', cat: 'snelheid' },
      { datum: '14/06', vlucht: 'Fay-aux-Loges', km: 400, niveau: 'Provinciaal', duiven: 5317, prijzen: '9, 40, 71', cat: 'halvefond' }
    ]
  }
};
