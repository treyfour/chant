// Shared seed data for all collection prototypes.
// Inlined into each mock so files stay self-contained — edit here, paste there.

const COLLECTOR = { handle: 'trey', name: 'Trey Schulte', since: 'Oct 2025' };

// kind: 'owned' (bought a product) | 'backed' (supported, no product yet)
// state: 'open' (run still selling) | 'soldout' (run closed forever)
const COINS = [
  { seller:'Ferrous',            run:'pre-seed',    n:2,   of:50,  date:'Oct 2025', tint:'#B7410E', glyph:'▰', kind:'owned',  state:'soldout', private:false, note:'Machining marketplace. Two people in a garage in Oakland.' },
  { seller:'Arc',                run:'founding',    n:19,  of:30,  date:'Nov 2025', tint:'#5C6B73', glyph:'◐', kind:'owned',  state:'soldout', private:false, note:'Ambient status displays for small teams.' },
  { seller:'Lumen',              run:'pre-seed',    n:7,   of:50,  date:'Dec 2025', tint:'#D4A017', glyph:'✦', kind:'owned',  state:'soldout', private:false, note:'Daylight-tracking desk lamp. Kickstarter refugees.' },
  { seller:'Orbit',              run:'founding',    n:3,   of:25,  date:'Jan 2026', tint:'#3B5BA5', glyph:'◆', kind:'owned',  state:'soldout', private:false, note:'Calendar that hides itself when you are focused.' },
  { seller:'Mossbook',           run:'v1',          n:88,  of:200, date:'Feb 2026', tint:'#4A7C59', glyph:'⬡', kind:'owned',  state:'soldout', private:false, note:'Field notebooks printed on stone paper.' },
  { seller:'Kettle & Co.',       run:'pre-seed',    n:35,  of:50,  date:'Mar 2026', tint:'#C87137', glyph:'▲', kind:'owned',  state:'open',    private:false, note:'Countertop fermentation, for people who ruined their first batch.' },
  { seller:'Tidepool',           run:'early',       n:401, of:500, date:'Apr 2026', tint:'#2E7D7B', glyph:'≈', kind:'owned',  state:'open',    private:false, note:'Tide and swell forecasting that is not an ad for a wetsuit.' },
  { seller:'Ninth St Roasters',  run:'first roast', n:61,  of:150, date:'May 2026', tint:'#6F4E37', glyph:'⬮', kind:'owned',  state:'open',    private:false, note:'One origin at a time. Roasted Tuesday, shipped Wednesday.' },
  { seller:'Halvard',            run:'pre-seed',    n:14,  of:50,  date:'May 2026', tint:'#7B4B94', glyph:'✲', kind:'backed', state:'open',    private:true,  note:'Nothing to sell yet. Backed them anyway.' },
  { seller:'Kettle & Co.',       run:'launch',      n:12,  of:100, date:'Jun 2026', tint:'#C87137', glyph:'▲', kind:'owned',  state:'open',    private:false, note:'Second run. The one that shipped.' },
  { seller:'Casa Verde Dive',    run:'season pass', n:22,  of:40,  date:'Jul 2026', tint:'#1B9AAA', glyph:'⌇', kind:'owned',  state:'open',    private:false, note:'Playa Guiones, Costa Rica. Four dives and a bad sunburn.' },
  { seller:'Wren',               run:'founding',    n:5,   of:25,  date:'Jul 2026', tint:'#A8324A', glyph:'❈', kind:'backed', state:'open',    private:true,  note:'Two designers, no website, one very good demo.' },
  { seller:'Pallet',             run:'v1',          n:130, of:300, date:'Jul 2026', tint:'#8A8253', glyph:'◬', kind:'owned',  state:'open',    private:false, note:'Shipping cost calculator for people who hate shipping.' },
  { seller:'Understory',         run:'pre-seed',    n:9,   of:50,  date:'Jul 2026', tint:'#356859', glyph:'❀', kind:'owned',  state:'open',    private:true,  note:'Forestry data. Quiet company, loud founders.' },
];
