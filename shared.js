// ═══════════════════════════════════════════════════════════════
// TBC GUILD MANAGER — shared.js
// Gemeinsame Datenbasis für alle Seiten.
// Wird von index.html, members.html, dungeon.html, raid.html geladen.
// ═══════════════════════════════════════════════════════════════

// ─── STORAGE ────────────────────────────────────────────────────
const LS_KEY = 'tbc_guild_v1';
const HAS_WS = typeof window.storage !== 'undefined';

async function guildSave(state) {
  try {
    const d = JSON.stringify(state);
    if (HAS_WS) await window.storage.set(LS_KEY, d);
    else localStorage.setItem(LS_KEY, d);
    return true;
  } catch(e) { console.error('Save failed', e); return false; }
}

async function guildLoad() {
  try {
    let raw = null;
    if (HAS_WS) {
      try { const r = await window.storage.get(LS_KEY); raw = r ? r.value : null; } catch(e) { raw = null; }
    } else {
      raw = localStorage.getItem(LS_KEY);
    }
    if (raw) {
      const s = JSON.parse(raw);
      // Datenmigration & Sicherheit
      if (!s.members)     s.members = [];
      if (!s.raidNights)  s.raidNights = [];
      if (!s.dungeonRuns) s.dungeonRuns = [];
      if (!s.softReserves) s.softReserves = {};
      if (!s.activeRaid)  s.activeRaid = null;
      if (!s.activeDungeon) s.activeDungeon = null;
      if (!s.guildName)   s.guildName = 'Deine Gilde';
      if (!s.guildMotto)  s.guildMotto = 'For the Horde!';
      if (!s.raidSchedule) s.raidSchedule = [];
      s.members.forEach(m => { if (!m.gp || m.gp < 1) m.gp = 1; });
      return s;
    }
  } catch(e) { console.error('Load failed', e); }
  return guildDefault();
}

function guildDefault() {
  return {
    guildName:    'Deine Gilde',
    guildMotto:   'For the Horde!',
    members:      [],
    softReserves: {},
    raidNights:   [],
    dungeonRuns:  [],
    activeRaid:   null,
    activeDungeon:null,
    raidSchedule: [], // [{date, instId, note}]
  };
}

// ─── UTILS ──────────────────────────────────────────────────────
function uid() { return Math.random().toString(36).substr(2, 9); }
function PR(ep, gp) { return ep / Math.max(gp, 1); }
function f2(n) { return Number(n).toFixed(2); }

const CLASS_NAMES = {
  warrior:'Krieger', paladin:'Paladin', hunter:'Jäger', rogue:'Schurke',
  priest:'Priester', shaman:'Schamane', mage:'Magier', warlock:'Hexenmeister', druid:'Druide'
};
const CLASS_COLORS = {
  warrior:'#C79C6E', paladin:'#F58CBA', hunter:'#ABD473', rogue:'#FFF569',
  priest:'#eeeeee', shaman:'#0099ff', mage:'#69CCF0', warlock:'#9482C9', druid:'#FF7D0A'
};
const ROLE_LABELS = { tank:'Tank', healer:'Heiler', dps:'DPS' };

function classColor(cls) { return CLASS_COLORS[cls] || '#e8dcc8'; }
function className(cls)  { return CLASS_NAMES[cls]  || cls; }

// HTML-Hilfsfunktionen
function ccStyle(cls) { return `color:${classColor(cls)};`; }
function roleBadge(role) {
  const c={tank:'#7fb3d3',healer:'#82e0aa',dps:'#e59866'};
  const b={tank:'rgba(41,128,185,.3)',healer:'rgba(39,174,96,.3)',dps:'rgba(192,57,43,.3)'};
  const bc={tank:'rgba(41,128,185,.6)',healer:'rgba(39,174,96,.6)',dps:'rgba(192,57,43,.6)'};
  return `<span style="display:inline-block;padding:2px 7px;font-size:.6rem;font-family:'Cinzel',serif;letter-spacing:.05em;background:${b[role]};border:1px solid ${bc[role]};color:${c[role]};">${ROLE_LABELS[role]||role}</span>`;
}
function qualityColor(q) {
  return q==='epic'?'#a335ee':q==='rare'?'#0070dd':q==='uncommon'?'#1eff00':'#e8dcc8';
}

// ─── ALLE TBC INSTANZEN ──────────────────────────────────────────
const TBC_INSTANCES = [
  // ══ RAIDS ══
  {id:'karazhan', name:'Karazhan', type:'raid', phase:1, size:10, zone:'Gebirgspass der Totenwinde', icon:'🏰', bosses:[
    {name:'Attumen der Jagdherr', items:[
      {id:'i001',name:"Fiery Warhorse's Reins",       slot:'Mount',         gp:400,q:'epic'},
      {id:'i002',name:"Handwraps of Flowing Thought", slot:'Handschuhe',    gp:180,q:'epic'},
      {id:'i003',name:"Mosscovered Gauntlets",        slot:'Handschuhe',    gp:170,q:'epic'},
      {id:'i004',name:"Spectral Band of Innate Power",slot:'Ring',          gp:140,q:'epic'},
    ]},
    {name:'Moroes', items:[
      {id:'i005',name:"Romulo's Poison Vial",         slot:'Trinket',       gp:220,q:'epic'},
      {id:'i006',name:"Brooch of Unquenchable Fury",  slot:'Hals',          gp:200,q:'epic'},
      {id:'i007',name:"Pocketwatch of St. Moroes",    slot:'Trinket',       gp:240,q:'epic'},
      {id:'i008',name:"Garrote-String Choker",        slot:'Hals',          gp:195,q:'epic'},
    ]},
    {name:'Maiden der Tugend', items:[
      {id:'i009',name:"Bracers of the White Doe",     slot:'Armschutz',     gp:160,q:'epic'},
      {id:'i010',name:"Ring of Recurrence",           slot:'Ring',          gp:155,q:'epic'},
      {id:'i011',name:"Gloves of the Fallen Hero (T4)",slot:'Token Hände',  gp:280,q:'epic'},
      {id:'i012',name:"Bands of Indwelling",          slot:'Armschutz',     gp:165,q:'epic'},
    ]},
    {name:'Der Kurator', items:[
      {id:'i013',name:"Garment of the Oracle",        slot:'Brust',         gp:280,q:'epic'},
      {id:'i014',name:"Fathom-Stone",                 slot:'Trinket',       gp:215,q:'epic'},
      {id:'i015',name:"Pauldrons Fallen Defender (T4)",slot:'Token Schultern',gp:290,q:'epic'},
      {id:'i016',name:"Gloves of Dexterous Manipulation",slot:'Handschuhe', gp:190,q:'epic'},
    ]},
    {name:'Netherspite', items:[
      {id:'i017',name:"Jewel of Infinite Possibilities",slot:'Trinket',     gp:220,q:'epic'},
      {id:'i018',name:"Nether Vortex",                slot:'Crafting',      gp:100,q:'epic'},
      {id:'i019',name:"Nether Scale Leggings",        slot:'Beine',         gp:260,q:'epic'},
    ]},
    {name:'Schachboss', items:[
      {id:'i020',name:"Queen of Suffering",           slot:'Schwert 1H',    gp:290,q:'epic'},
      {id:'i021',name:"Legacy",                       slot:'Polearm',       gp:370,q:'epic'},
      {id:'i022',name:"Boots of Witchcraft",          slot:'Füße',          gp:200,q:'epic'},
      {id:'i023',name:"Bishop's Cloak",               slot:'Umhang',        gp:175,q:'rare'},
    ]},
    {name:'Erzmagier Arugal', items:[
      {id:'i024',name:"Robe of the Elder Scribes",    slot:'Brust',         gp:270,q:'epic'},
      {id:'i025',name:"Staff of Infinite Mysteries",  slot:'Stab',          gp:380,q:'epic'},
      {id:'i026',name:"Orb of the Shadow Council",    slot:'Off-Hand',      gp:230,q:'epic'},
    ]},
    {name:'Nightbane', items:[
      {id:'i027',name:"Tattered Cape of Antonidas",   slot:'Umhang',        gp:200,q:'epic'},
      {id:'i028',name:"Stonebough Jerkin",            slot:'Brust Leder',   gp:260,q:'epic'},
      {id:'i029',name:"Pauldrons of the Argent Sentinel",slot:'Schultern',  gp:250,q:'epic'},
    ]},
    {name:'Prinz Malchezaar', items:[
      {id:'i030',name:"Helm Fallen Champion (T4)",    slot:'Token Helm',    gp:310,q:'epic'},
      {id:'i031',name:"Helm Fallen Defender (T4)",    slot:'Token Helm',    gp:310,q:'epic'},
      {id:'i032',name:"Helm Fallen Hero (T4)",        slot:'Token Helm',    gp:310,q:'epic'},
      {id:'i033',name:"Gorehowl",                     slot:'2H Axt',        gp:480,q:'epic'},
      {id:'i034',name:"Inferno Tempered Gauntlets",   slot:'Handschuhe',    gp:195,q:'epic'},
    ]},
  ]},
  {id:'gruul', name:"Gruul's Unterschlupf", type:'raid', phase:1, size:25, zone:'Scherbenwelt', icon:'🪨', bosses:[
    {name:'Hochkönig Raufgar', items:[
      {id:'g001',name:"Gauntlets Fallen Champion (T4)",slot:'Token Hände',  gp:290,q:'epic'},
      {id:'g002',name:"Gauntlets Fallen Defender (T4)",slot:'Token Hände',  gp:290,q:'epic'},
      {id:'g003',name:"Gauntlets Fallen Hero (T4)",   slot:'Token Hände',   gp:290,q:'epic'},
      {id:'g004',name:"Aldori Legacy Defender",       slot:'Schild',        gp:350,q:'epic'},
    ]},
    {name:'Gruul der Drachentöter', items:[
      {id:'g005',name:"Leggings Fallen Champion (T4)",slot:'Token Beine',   gp:310,q:'epic'},
      {id:'g006',name:"Leggings Fallen Defender (T4)",slot:'Token Beine',   gp:310,q:'epic'},
      {id:'g007',name:"Leggings Fallen Hero (T4)",    slot:'Token Beine',   gp:310,q:'epic'},
      {id:'g008',name:"Dragonspine Trophy",           slot:'Trinket',       gp:340,q:'epic'},
      {id:'g009',name:"Teeth of Gruul",               slot:'Trinket',       gp:280,q:'epic'},
    ]},
  ]},
  {id:'magtheridon', name:"Magtheridons Kammer", type:'raid', phase:1, size:25, zone:'Hellfire-Halbinsel', icon:'👹', bosses:[
    {name:'Magtheridon', items:[
      {id:'m001',name:"Chest Fallen Champion (T4)",   slot:'Token Brust',   gp:340,q:'epic'},
      {id:'m002',name:"Chest Fallen Defender (T4)",   slot:'Token Brust',   gp:340,q:'epic'},
      {id:'m003',name:"Chest Fallen Hero (T4)",       slot:'Token Brust',   gp:340,q:'epic'},
      {id:'m004',name:"Talon of the Tempest",         slot:'Dolch',         gp:370,q:'epic'},
    ]},
  ]},
  {id:'ssc', name:"Höhlen des Schlangenschreins", type:'raid', phase:2, size:25, zone:'Zangarmarschen', icon:'🐍', bosses:[
    {name:'Hydross der Unstabile', items:[
      {id:'s001',name:"Shoulderpads of the Stranger", slot:'Schultern',     gp:340,q:'epic'},
      {id:'s002',name:"Pauldrons of the Wardancer",   slot:'Schultern',     gp:340,q:'epic'},
    ]},
    {name:'Der Lurker Darunter', items:[
      {id:'s003',name:"Glowing Breastplate of Truth", slot:'Brust',         gp:360,q:'epic'},
      {id:'s004',name:"Fang of the Leviathan",        slot:'Dolch',         gp:420,q:'epic'},
    ]},
    {name:'Leotheras der Blinde', items:[
      {id:'s005',name:"Cord of Screaming Terrors",    slot:'Gürtel',        gp:300,q:'epic'},
      {id:'s006',name:"Warp-Storm Warblade",          slot:'Zweihandschwert',gp:460,q:'epic'},
    ]},
    {name:'Fathom-Lord Karathress', items:[
      {id:'s007',name:"Claw of the Nethermancer",     slot:'Zauberstab',    gp:380,q:'epic'},
      {id:'s008',name:"Earring of Soulful Meditation",slot:'Ohrring',       gp:280,q:'epic'},
    ]},
    {name:'Morogrim Tidewalker', items:[
      {id:'s009',name:"Girdle of the Tidal Call",     slot:'Gürtel',        gp:310,q:'epic'},
      {id:'s010',name:"Coral-Barbed Shoulderpads",    slot:'Schultern',     gp:330,q:'epic'},
    ]},
    {name:'Lady Vashj', items:[
      {id:'s011',name:"Coilfang Plate",               slot:'Brust',         gp:400,q:'epic'},
      {id:'s012',name:"Vashj's Vial Remnant",         slot:'Trinket',       gp:380,q:'epic'},
      {id:'s013',name:"Serpent-Coil Braid",           slot:'Ring',          gp:350,q:'epic'},
    ]},
  ]},
  {id:'tk', name:"Festung der Stürme", type:'raid', phase:2, size:25, zone:'Nethersturm', icon:'⚡', bosses:[
    {name:"Al'ar", items:[
      {id:'t001',name:"Ashes of Al'ar",               slot:'Mount',         gp:500,q:'epic'},
      {id:'t002',name:"Pauldrons of the Solace-Giver",slot:'Schultern T5',  gp:360,q:'epic'},
    ]},
    {name:'Void Reaver', items:[
      {id:'t003',name:"Pauldrons Fallen Champion (T5)",slot:'Token Schultern',gp:360,q:'epic'},
      {id:'t004',name:"Pauldrons Fallen Defender (T5)",slot:'Token Schultern',gp:360,q:'epic'},
      {id:'t005',name:"Pauldrons Fallen Hero (T5)",   slot:'Token Schultern',gp:360,q:'epic'},
    ]},
    {name:'Hochastrologe Solarian', items:[
      {id:'t006',name:"Solarian's Sapphire",          slot:'Trinket',       gp:360,q:'epic'},
      {id:'t007',name:"The Lightning Capacitor",      slot:'Trinket',       gp:370,q:'epic'},
    ]},
    {name:"Kael'thas Sonnenwanderer", items:[
      {id:'t008',name:"Chest Fallen Champion (T5)",   slot:'Token Brust',   gp:400,q:'epic'},
      {id:'t009',name:"Chest Fallen Defender (T5)",   slot:'Token Brust',   gp:400,q:'epic'},
      {id:'t010',name:"Chest Fallen Hero (T5)",       slot:'Token Brust',   gp:400,q:'epic'},
      {id:'t011',name:"Verdant Sphere",               slot:'Trinket',       gp:200,q:'rare'},
      {id:'t012',name:"Warp-Slicer",                  slot:'Schwert 1H',    gp:440,q:'epic'},
    ]},
  ]},
  {id:'hyjal', name:"Schlacht um Hyjal", type:'raid', phase:3, size:25, zone:'Caverns of Time', icon:'🌋', bosses:[
    {name:'Rage Winterchill', items:[
      {id:'h001',name:"Bracers of the Pathfinder",    slot:'Armschutz',     gp:350,q:'epic'},
      {id:'h002',name:"Gloves of Immortal Dusk",      slot:'Handschuhe',    gp:360,q:'epic'},
    ]},
    {name:'Anetheron', items:[
      {id:'h003',name:"Ring of Flowing Life",         slot:'Ring',          gp:330,q:'epic'},
      {id:'h004',name:"Pitch Black Boots",            slot:'Füße',          gp:340,q:'epic'},
    ]},
    {name:"Kaz'rogal", items:[
      {id:'h005',name:"Tracker's Blade",              slot:'Dolch',         gp:410,q:'epic'},
      {id:'h006',name:"Girdle of Hope",               slot:'Gürtel',        gp:310,q:'epic'},
    ]},
    {name:'Azgalor', items:[
      {id:'h007',name:"Leggings of Channeled Elements",slot:'Beine',        gp:380,q:'epic'},
      {id:'h008',name:"Mantle of the Tireless Tracker",slot:'Schultern',    gp:360,q:'epic'},
    ]},
    {name:'Archimonde', items:[
      {id:'h009',name:"Forgotten Shadow Hood",        slot:'Helm',          gp:400,q:'epic'},
      {id:'h010',name:"Swiftstrike Shoulders",        slot:'Schultern',     gp:380,q:'epic'},
      {id:'h011',name:"Wristbands of Certainty",      slot:'Armschutz',     gp:340,q:'epic'},
    ]},
  ]},
  {id:'bt', name:"Schwarzer Tempel", type:'raid', phase:3, size:25, zone:'Shadowmoon Valley', icon:'🏛', bosses:[
    {name:"Hochwächter Naj'entus", items:[
      {id:'b001',name:"Naj'entus Spine",              slot:'Wurfwaffe',     gp:370,q:'epic'},
      {id:'b002',name:"Helm of Vast Intelligence",    slot:'Helm',          gp:390,q:'epic'},
    ]},
    {name:'Supremus', items:[
      {id:'b003',name:"Girdle of the Lightbearer",    slot:'Gürtel',        gp:320,q:'epic'},
      {id:'b004',name:"Tide-Stomper's Greaves",       slot:'Füße',          gp:360,q:'epic'},
    ]},
    {name:'Illidan Sturmgrimm', items:[
      {id:'b018',name:"Warglaive of Azzinoth (Main)", slot:'Einhandschwert',gp:650,q:'epic'},
      {id:'b019',name:"Warglaive of Azzinoth (Off)",  slot:'Einhandschwert',gp:650,q:'epic'},
      {id:'b021',name:"Apolyon, the Soul-Render",     slot:'Zweihandschwert',gp:520,q:'epic'},
      {id:'b022',name:"Memento of Tyrande",           slot:'Trinket',       gp:400,q:'epic'},
    ]},
  ]},
  {id:'zuljaman', name:"Zul'Aman", type:'raid', phase:3, size:10, zone:'Ghostlands', icon:'🐯', bosses:[
    {name:"Nalorakk", items:[
      {id:'z001',name:"Pauldrons of Surging Mana",    slot:'Schultern',     gp:330,q:'epic'},
      {id:'z002',name:"Shadowrend Longbow",           slot:'Bogen',         gp:370,q:'epic'},
    ]},
    {name:"Zul'jin", items:[
      {id:'z011',name:"Amani War Bear",               slot:'Mount',         gp:600,q:'epic'},
      {id:'z012',name:"Arrowhead of Devastation",     slot:'Stab',          gp:410,q:'epic'},
    ]},
  ]},
  {id:'sunwell', name:'Sonnenbrunnenplateau', type:'raid', phase:5, size:25, zone:"Isle of Quel'Danas", icon:'☀', bosses:[
    {name:'Brutallus', items:[
      {id:'sw003',name:"Shiv of Exsanguination",      slot:'Dolch',         gp:480,q:'epic'},
      {id:'sw004',name:"Boots of Entombment",         slot:'Füße',          gp:420,q:'epic'},
    ]},
    {name:"Kil'jaeden", items:[
      {id:'sw011',name:"Thori'dal, the Stars' Fury",  slot:'Bogen Legendär',gp:1000,q:'epic'},
      {id:'sw012',name:"Leggings of Immortal Night",  slot:'Beine',         gp:480,q:'epic'},
      {id:'sw013',name:"Ring of Ancient Knowledge",   slot:'Ring',          gp:440,q:'epic'},
    ]},
  ]},

  // ══ DUNGEONS (Normal) ══
  {id:'ramps', name:'Blutkessel', type:'dungeon', phase:1, size:5, zone:'Hellfire-Halbinsel', icon:'🔥', bosses:[
    {name:'Omor der Unsehbare', items:[{id:'d001',name:"Ironblade Gauntlets",slot:'Handschuhe',gp:80,q:'uncommon'}]},
    {name:'Nazan & Vazruden', items:[{id:'d002',name:"Heartrazor",slot:'Dolch',gp:100,q:'uncommon'}]},
  ]},
  {id:'blood_furnace', name:'Blutschmelze', type:'dungeon', phase:1, size:5, zone:'Hellfire-Halbinsel', icon:'⚗', bosses:[
    {name:'Der Maker', items:[{id:'d010',name:"Maker's Edge",slot:'Einhandschwert',gp:85,q:'uncommon'}]},
    {name:'Keli\'dan der Brecher', items:[{id:'d011',name:"Breaker's Mace",slot:'Streitkolben',gp:95,q:'uncommon'}]},
  ]},
  {id:'shattered_halls', name:'Zerschmetterte Hallen', type:'dungeon', phase:1, size:5, zone:'Hellfire-Halbinsel', icon:'💀', bosses:[
    {name:'Warchief Kargath Klingenfaust', items:[{id:'d020',name:"Quickstrider Moccasins",slot:'Füße',gp:100,q:'uncommon'}]},
  ]},
  {id:'slave_pens', name:'Sklavenkammern', type:'dungeon', phase:1, size:5, zone:'Zangarmarschen', icon:'⛓', bosses:[
    {name:'Quagmirran', items:[{id:'d030',name:"Quagmirran's Eye",slot:'Trinket',gp:120,q:'uncommon'}]},
  ]},
  {id:'underbog', name:'Untermaul', type:'dungeon', phase:1, size:5, zone:'Zangarmarschen', icon:'🌿', bosses:[
    {name:'Warlord Kalithresh', items:[{id:'d040',name:"Mennu's Scaled Hide",slot:'Ring',gp:95,q:'uncommon'}]},
  ]},
  {id:'steam_vaults', name:'Dampfkammer', type:'dungeon', phase:1, size:5, zone:'Zangarmarschen', icon:'💨', bosses:[
    {name:'Thespia', items:[{id:'d050',name:"Bogstrok Scale Cloak",slot:'Umhang',gp:85,q:'uncommon'}]},
    {name:'Mekgineer Steamrigger', items:[{id:'d051',name:"Steamrigger Mechanics",slot:'Gürtel',gp:90,q:'uncommon'}]},
  ]},
  {id:'mana_tombs', name:'Mana-Gewölbe', type:'dungeon', phase:1, size:5, zone:'Terrokar-Wald', icon:'💜', bosses:[
    {name:"Nexus-Fürst Shaffar", items:[{id:'d060',name:"Shaffar's Stasis Chamber",slot:'Trinket',gp:115,q:'uncommon'}]},
  ]},
  {id:'auchenai', name:'Auchenai-Krypta', type:'dungeon', phase:1, size:5, zone:'Terrokar-Wald', icon:'⚰', bosses:[
    {name:'Exarch Maladaar', items:[{id:'d070',name:"Auchenai Staff",slot:'Stab',gp:110,q:'uncommon'}]},
  ]},
  {id:'sethekk', name:'Sethekkhallen', type:'dungeon', phase:1, size:5, zone:'Terrokar-Wald', icon:'🦅', bosses:[
    {name:'Talon King Ikiss', items:[{id:'d080',name:"Shoulderpads of Absolution",slot:'Schultern',gp:120,q:'uncommon'}]},
  ]},
  {id:'shadow_lab', name:'Schattenlabyrinth', type:'dungeon', phase:1, size:5, zone:'Terrokar-Wald', icon:'🌑', bosses:[
    {name:'Murmur', items:[{id:'d090',name:"Murmur's Shawl",slot:'Umhang',gp:100,q:'uncommon'}]},
  ]},
  {id:'botanica', name:'Botanica', type:'dungeon', phase:1, size:5, zone:'Nethersturm', icon:'🌸', bosses:[
    {name:'Pathaleon der Rechner', items:[{id:'d100',name:"Pauldrons of Wild Magic",slot:'Schultern',gp:110,q:'uncommon'}]},
  ]},
  {id:'mechanar', name:'Mechanar', type:'dungeon', phase:1, size:5, zone:'Nethersturm', icon:'⚙', bosses:[
    {name:'Warp-Spalter', items:[{id:'d110',name:"Jagged Talisman",slot:'Trinket',gp:105,q:'uncommon'}]},
  ]},
  {id:'arcatraz', name:'Arkatraz', type:'dungeon', phase:1, size:5, zone:'Nethersturm', icon:'🔒', bosses:[
    {name:'Harbinger Skyriss', items:[{id:'d120',name:"Band of Eternity",slot:'Ring',gp:105,q:'uncommon'}]},
  ]},
  {id:'old_hillsbrad', name:'Alte Hügel der Verbannung', type:'dungeon', phase:1, size:5, zone:'Caverns of Time', icon:'⏳', bosses:[
    {name:'Epoch Hunter', items:[{id:'d130',name:"Epoch's Edge",slot:'Dolch',gp:115,q:'uncommon'}]},
  ]},
  {id:'black_morass', name:'Das Schwarze Morast', type:'dungeon', phase:1, size:5, zone:'Caverns of Time', icon:'🌊', bosses:[
    {name:'Aeonus', items:[{id:'d140',name:"Hourglass of the Unraveller",slot:'Trinket',gp:140,q:'rare'}]},
  ]},
  {id:'magisters', name:"Terrasse der Magister", type:'dungeon', phase:5, size:5, zone:"Isle of Quel'Danas", icon:'💎', bosses:[
    {name:"Kael'thas Sonnenwanderer", items:[
      {id:'d150',name:"Shard of the Virtuous",    slot:'Stab',    gp:160,q:'epic'},
      {id:'d151',name:"Bangle of Endless Blessings",slot:'Trinket',gp:145,q:'epic'},
    ]},
  ]},

  // ══ HEROIC DUNGEONS ══
  {id:'ramps_h',         name:'Blutkessel (Heroic)',            type:'heroic', phase:1, size:5, zone:'Hellfire-Halbinsel', icon:'🔥', bosses:[
    {name:'Nazan H', items:[{id:'h001',name:"Heartrazor (H)",slot:'Dolch',gp:160,q:'epic'}]},
  ]},
  {id:'blood_furnace_h', name:'Blutschmelze (Heroic)',          type:'heroic', phase:1, size:5, zone:'Hellfire-Halbinsel', icon:'⚗', bosses:[
    {name:"Keli'dan H", items:[{id:'h010',name:"Rift Stalker Hauberk",slot:'Brust',gp:165,q:'epic'}]},
  ]},
  {id:'shattered_halls_h',name:'Zerschmetterte Hallen (Heroic)',type:'heroic', phase:1, size:5, zone:'Hellfire-Halbinsel', icon:'💀', bosses:[
    {name:'Kargath H', items:[{id:'h020',name:"Gauntlets of Commemoration",slot:'Handschuhe',gp:155,q:'epic'}]},
  ]},
  {id:'slave_pens_h',    name:'Sklavenkammern (Heroic)',        type:'heroic', phase:1, size:5, zone:'Zangarmarschen', icon:'⛓', bosses:[
    {name:'Quagmirran H', items:[{id:'h030',name:"Quagmirran's Eye (H)",slot:'Trinket',gp:160,q:'epic'}]},
  ]},
  {id:'underbog_h',      name:'Untermaul (Heroic)',             type:'heroic', phase:1, size:5, zone:'Zangarmarschen', icon:'🌿', bosses:[
    {name:'Kalithresh H', items:[{id:'h040',name:"Nordrassil Wrath-Kilt",slot:'Beine',gp:165,q:'epic'}]},
  ]},
  {id:'steam_vaults_h',  name:'Dampfkammer (Heroic)',           type:'heroic', phase:1, size:5, zone:'Zangarmarschen', icon:'💨', bosses:[
    {name:'Steamrigger H', items:[{id:'h050',name:"Boots of the Specialist",slot:'Füße',gp:155,q:'epic'}]},
  ]},
  {id:'mana_tombs_h',    name:'Mana-Gewölbe (Heroic)',          type:'heroic', phase:1, size:5, zone:'Terrokar-Wald', icon:'💜', bosses:[
    {name:'Shaffar H', items:[{id:'h060',name:"Pendant of the Violet Eye",slot:'Hals',gp:155,q:'epic'}]},
  ]},
  {id:'auchenai_h',      name:'Auchenai-Krypta (Heroic)',       type:'heroic', phase:1, size:5, zone:'Terrokar-Wald', icon:'⚰', bosses:[
    {name:'Maladaar H', items:[{id:'h070',name:"Boots of the Uncivilized",slot:'Füße',gp:160,q:'epic'}]},
  ]},
  {id:'sethekk_h',       name:'Sethekkhallen (Heroic)',         type:'heroic', phase:1, size:5, zone:'Terrokar-Wald', icon:'🦅', bosses:[
    {name:'Ikiss H', items:[{id:'h080',name:"Terokk's Shadowstaff",slot:'Stab',gp:175,q:'epic'}]},
  ]},
  {id:'shadow_lab_h',    name:'Schattenlabyrinth (Heroic)',     type:'heroic', phase:1, size:5, zone:'Terrokar-Wald', icon:'🌑', bosses:[
    {name:'Murmur H', items:[{id:'h090',name:"Ruby Drape of the Mysticant",slot:'Umhang',gp:170,q:'epic'}]},
  ]},
  {id:'botanica_h',      name:'Botanica (Heroic)',              type:'heroic', phase:1, size:5, zone:'Nethersturm', icon:'🌸', bosses:[
    {name:'Pathaleon H', items:[{id:'h100',name:"Botanica Ring (H)",slot:'Ring',gp:160,q:'epic'}]},
  ]},
  {id:'mechanar_h',      name:'Mechanar (Heroic)',              type:'heroic', phase:1, size:5, zone:'Nethersturm', icon:'⚙', bosses:[
    {name:'Warp-Spalter H', items:[{id:'h110',name:"Eternium Chip",slot:'Trinket',gp:155,q:'epic'}]},
  ]},
  {id:'arcatraz_h',      name:'Arkatraz (Heroic)',              type:'heroic', phase:1, size:5, zone:'Nethersturm', icon:'🔒', bosses:[
    {name:'Skyriss H', items:[{id:'h120',name:"Band of Eternity (H)",slot:'Ring',gp:165,q:'epic'}]},
  ]},
  {id:'old_hillsbrad_h', name:'Alte Hügel (Heroic)',            type:'heroic', phase:1, size:5, zone:'Caverns of Time', icon:'⏳', bosses:[
    {name:'Epoch Hunter H', items:[{id:'h130',name:"Gauntlets of the Redeemed Vindicator",slot:'Handschuhe',gp:160,q:'epic'}]},
  ]},
  {id:'black_morass_h',  name:'Das Schwarze Morast (Heroic)',   type:'heroic', phase:1, size:5, zone:'Caverns of Time', icon:'🌊', bosses:[
    {name:'Aeonus H', items:[{id:'h140',name:"Hourglass of the Unraveller (H)",slot:'Trinket',gp:170,q:'epic'}]},
  ]},
  {id:'magisters_h',     name:"Terrasse der Magister (Heroic)", type:'heroic', phase:5, size:5, zone:"Isle of Quel'Danas", icon:'💎', bosses:[
    {name:"Kael'thas H", items:[
      {id:'h150',name:"Orb of the Sin'dorei",      slot:'Off-Hand', gp:185,q:'epic'},
      {id:'h151',name:"Bangle of Endless Blessings (H)",slot:'Trinket',gp:190,q:'epic'},
    ]},
  ]},
];

// Flat item-map für schnellen Zugriff
const ITEM_MAP = {};
TBC_INSTANCES.forEach(inst =>
  inst.bosses.forEach(b =>
    b.items.forEach(i => {
      ITEM_MAP[i.id] = { ...i, bossName: b.name, instId: inst.id, instName: inst.name, instType: inst.type };
    })
  )
);

// Hilfsfunktionen für Instanzen
function getInstance(id) { return TBC_INSTANCES.find(i => i.id === id); }
function getRaids()    { return TBC_INSTANCES.filter(i => i.type === 'raid'); }
function getDungeons() { return TBC_INSTANCES.filter(i => i.type === 'dungeon'); }
function getHeroics()  { return TBC_INSTANCES.filter(i => i.type === 'heroic'); }

// ─── NAVBAR HTML (wird von jeder Seite eingefügt) ───────────────
function buildNavbar(activePage, guildName) {
  const pages = [
    {id:'index',   label:'Startseite', href:'index.html'},
    {id:'members', label:'Mitglieder', href:'members.html'},
    {id:'dungeon', label:'Dungeons',   href:'dungeon.html'},
    {id:'raid',    label:'Raid',       href:'raid.html'},
  ];
  return `
  <nav class="navbar" id="navbar">
    <div class="navbar-inner">
      <a class="navbar-brand" href="index.html">
        <span class="navbar-icon">⚔</span>
        <span class="navbar-title">${guildName || 'Deine Gilde'}</span>
      </a>
      <div class="navbar-links" id="navbar-links">
        ${pages.map(p => `
          <a href="${p.href}" class="navbar-link ${activePage===p.id?'active':''}">${p.label}</a>
        `).join('')}
      </div>
      <div class="navbar-right">
        <span class="save-ind" id="save-ind">✓</span>
        <button class="navbar-burger" id="navbar-burger" onclick="toggleMobileNav()" aria-label="Menü">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </nav>`;
}

// Navbar CSS (eingebettet via <style> in jeder Seite)
const NAVBAR_CSS = `
  .navbar {
    position: sticky; top: 0; z-index: 200;
    background: linear-gradient(180deg, rgba(8,3,16,.98) 0%, rgba(14,8,28,.96) 100%);
    border-bottom: 1px solid rgba(200,168,75,.4);
    box-shadow: 0 2px 24px rgba(0,0,0,.8);
  }
  .navbar-inner {
    max-width: 1300px; margin: 0 auto;
    display: flex; align-items: center; gap: 0;
    padding: 0 20px; height: 56px;
  }
  .navbar-brand {
    display: flex; align-items: center; gap: 9px;
    text-decoration: none; margin-right: 32px; flex-shrink: 0;
  }
  .navbar-icon { font-size: 1.3rem; }
  .navbar-title {
    font-family: 'Cinzel', serif; font-size: .95rem; font-weight: 700;
    color: #c8a84b; text-shadow: 0 0 14px rgba(200,168,75,.5);
    white-space: nowrap;
  }
  .navbar-links {
    display: flex; gap: 2px; flex: 1;
  }
  .navbar-link {
    font-family: 'Cinzel', serif; font-size: .65rem; letter-spacing: .1em;
    text-transform: uppercase; text-decoration: none; color: #8a7a60;
    padding: 8px 14px; border-bottom: 2px solid transparent;
    transition: color .2s, border-color .2s;
  }
  .navbar-link:hover { color: #c8a84b; }
  .navbar-link.active { color: #f0d070; border-bottom-color: #c8a84b; }
  .navbar-right { margin-left: auto; display: flex; align-items: center; gap: 10px; }
  .save-ind {
    font-size: .6rem; font-family: 'Cinzel', serif; letter-spacing: .06em;
    padding: 3px 8px; border: 1px solid rgba(46,204,113,.4); color: #2ecc71;
  }
  .navbar-burger {
    display: none; flex-direction: column; gap: 4px; background: none;
    border: none; cursor: pointer; padding: 6px;
  }
  .navbar-burger span {
    display: block; width: 20px; height: 2px; background: #8a7a60; transition: all .2s;
  }
  @media (max-width: 700px) {
    .navbar-links { display: none; position: fixed; top: 56px; left: 0; right: 0;
      background: rgba(8,3,16,.97); border-bottom: 1px solid rgba(200,168,75,.3);
      flex-direction: column; padding: 8px 0; gap: 0; z-index: 199; }
    .navbar-links.open { display: flex; }
    .navbar-link { padding: 13px 24px; border-bottom: none; border-left: 2px solid transparent; }
    .navbar-link.active { border-left-color: #c8a84b; }
    .navbar-burger { display: flex; }
  }
`;

function toggleMobileNav() {
  document.getElementById('navbar-links').classList.toggle('open');
}

// ─── TOAST ──────────────────────────────────────────────────────
function showToast(msg, dur = 2600) {
  let t = document.getElementById('g-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'g-toast';
    t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);background:#120a1e;border:1px solid #c8a84b;border-left:4px solid #c8a84b;padding:11px 18px;font-family:Cinzel,serif;font-size:.72rem;letter-spacing:.05em;color:#f0d070;z-index:9999;box-shadow:0 0 30px rgba(200,168,75,.3);opacity:0;transition:all .3s;white-space:nowrap;pointer-events:none;';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  t.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateX(-50%) translateY(20px)';
  }, dur);
}

// ─── SAVE INDICATOR ─────────────────────────────────────────────
function setSaveIndicator(state) {
  const el = document.getElementById('save-ind');
  if (!el) return;
  const map = {
    ok:     ['✓',        'rgba(46,204,113,.4)',  '#2ecc71'],
    saving: ['↻ ...',    'rgba(200,168,75,.4)',  '#c8a84b'],
    err:    ['✗ Fehler', 'rgba(231,76,60,.4)',   '#e74c3c'],
  };
  const [txt, bc, c] = map[state] || map.ok;
  el.textContent = txt;
  el.style.borderColor = bc;
  el.style.color = c;
}
