/* Headless test harness for "Cache Me If You Can".
   Run: node tests/balance_harness.js   (or via tests/run_all.js)
   Implements the bot policies of 02_DESIGN.md §14 (lazy/novice/greedy) plus
   human-like policies (human/expert) and the regression tests required by the
   P0/P1 review: determinism, reroute invariant, menu-loop smoke, tutorial
   completion, tray labels, warmth-ring geometry, swipe radii, difficulty bands.
   Exits non-zero when any test or band fails. */
'use strict';
const fs = require('fs');
const path = require('path');
const HTML = path.join(__dirname, '..', 'index.html');
const DT = 1 / 60;

/* ---------- minimal browser stubs ---------- */
global.__arcs = [];
function fakeCtx() {
  return new Proxy({}, {
    get: (t, k) => {
      if (k === 'createLinearGradient' || k === 'createRadialGradient') return () => ({ addColorStop() {} });
      if (k === 'canvas') return {};
      if (k === 'arc') return (...a) => { global.__arcs.push(a); };
      return () => {};
    },
    set: () => true
  });
}
function fakeEl() {
  return {
    style: {}, classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
    addEventListener() {}, setAttribute() {}, getContext: () => fakeCtx(),
    getBoundingClientRect: () => ({ left: 0, top: 0 }),
    querySelectorAll: () => [], createElement: () => fakeEl(), appendChild() {},
    textContent: '', value: '', className: '', offsetWidth: 0, offsetHeight: 0
  };
}
global.window = { addEventListener() {}, matchMedia: () => ({ matches: false }), AudioContext: null, webkitAudioContext: null, innerWidth: 390, innerHeight: 844 };
global.document = {
  getElementById: () => fakeEl(), querySelector: () => fakeEl(), querySelectorAll: () => [],
  addEventListener() {}, createElement: () => fakeEl(), hidden: false,
  documentElement: { style: { setProperty() {} } }, fonts: null
};
global.location = { search: '', href: 'http://localhost/' };
global.localStorage = { getItem: () => null, setItem() {} };
Object.defineProperty(global, 'navigator', { value: {}, configurable: true, writable: true });
global.requestAnimationFrame = () => {};
global.performance = { now: () => Date.now() };

const js = fs.readFileSync(HTML, 'utf8').match(/<script>([\s\S]*)<\/script>/)[1];
eval(js);
const G = window.__game;
const dist = (a, b, c, d) => Math.hypot(a - c, b - d);
function mulberry32Local(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const nodePos = (S, n) => [S.cities[n.cityIdx].x, S.cities[n.cityIdx].y];

/* ---------- policies ---------- */
function makePolicy(policy, S, rngSeed) {
  const prand = mulberry32Local(rngSeed || 12345);
  const st = { react: 1 + prand() * 2, seen: new Map(), rolled: new Map(), swiped: new Set(), retried: new Set(), relocated: new Set(), gi: 0, placeT: 0 };
  const greedyOrder = [0, 1, 2, 4, 3];
  const humanOrder = [0, 2, 1, 3, 4];
  const killR = G.CONFIG.bots.killRadiusPx / G.mapScale;   // explicit WORLD radii => deterministic
  const friendR = G.CONFIG.bots.friendlyRadiusPx / G.mapScale;
  const isHuman = policy === 'human' || policy === 'expert';
  const reactLo = policy === 'expert' ? 0.3 : 0.5, reactHi = policy === 'expert' ? 0.6 : 1.0;
  const missP = policy === 'expert' ? 0.05 : 0.25;
  const placeLo = policy === 'expert' ? 1.0 : 2.0, placeHi = policy === 'expert' ? 2.0 : 4.0;
  function swipeAt(b) {
    // human-like: aim with pixel error, converted to world units
    const errPx = (prand() + prand() - 1) * 14; // ~±14 px
    const e = errPx / G.mapScale;
    G.applyAction({ type: 'swipe', x1: b.x - 30, y1: b.y + e, x2: b.x + 30, y2: b.y + e, killR, friendR });
  }
  return function tick() {
    if (policy === 'lazy') return;
    if (policy === 'greedy') {
      while (st.gi < greedyOrder.length && S.nodes.length < S.slotsTotal) { G.applyAction({ type: 'place', city: greedyOrder[st.gi] }); st.gi++; }
      for (const b of S.bots) {
        if (!b.alive || (st.swiped.has(b.id)&&(!b.mega||S.t-b.lastHit<0.17))) continue;
        const n = S.nodes.find(n => n.id === b.targetNodeId); if (!n) continue;
        const [nx, ny] = nodePos(S, n);
        if (dist(b.x, b.y, nx, ny) < 250) { G.applyAction({ type: 'swipe', x1: b.x, y1: b.y - 30, x2: b.x, y2: b.y + 30, killR, friendR }); st.swiped.add(b.id); }
      }
      return;
    }
    if (policy === 'novice') {
      st.react -= DT;
      if (st.react <= 0) { if (S.nodes.length < S.slotsTotal) G.applyAction({ type: 'place', city: Math.floor(prand() * 15) }); st.react = 1 + prand() * 2; }
      for (const b of S.bots) {
        if (!b.alive || st.rolled.has(b.id)) continue; st.rolled.set(b.id, 1);
        if (prand() < 0.35) G.applyAction({ type: 'swipe', x1: b.x, y1: b.y - 30, x2: b.x, y2: b.y + 30, killR, friendR });
      }
      if (S.nodes.length > 0 && prand() < DT / 25) { const n = S.nodes[Math.floor(prand() * S.nodes.length)]; G.applyAction({ type: 'move', node: n.id, city: Math.floor(prand() * 15) }); }
      return;
    }
    /* expert reacts once to an outage by moving a different, idle online node to an uncovered city. */
    if (policy === 'expert' && S.activeEvent && S.activeEvent.type === 'outage') {
      const key=S.activeEvent.endT;
      if (!st.relocated.has(key)) {
        st.relocated.add(key);
        const n=S.nodes.find(x=>x.state==='online' && x.load===0 && x.cityIdx>=3);
        const target=[0,1,2,4,3].find(ci=>!S.nodes.some(x=>x.cityIdx===ci));
        if(n && target!==undefined) G.applyAction({type:'move',node:n.id,city:target});
      }
    }
    /* human / expert */
    st.placeT -= DT;
    if (st.placeT <= 0 && st.gi < humanOrder.length && S.nodes.length < S.slotsTotal) { G.applyAction({ type: 'place', city: humanOrder[st.gi] }); st.gi++; st.placeT = placeLo + prand() * (placeHi - placeLo); }
    for (const b of S.bots) {
      if (!b.alive) continue;
      if(b.mega&&b.hitsLeft<3&&b.lastHit>=0&&S.t-b.lastHit>=0.2&&(policy==='expert'||policy==='human'&&prand()<0.03)){swipeAt(b);continue}
      if (!st.seen.has(b.id)) { st.seen.set(b.id, S.t + reactLo + prand() * (reactHi - reactLo)); continue; }
      const at = st.seen.get(b.id);
      if (at === -1) {
        // expert watches bots that survived the first swipe and retries, aimed, as they close in
        if (policy === 'expert' && !st.retried.has(b.id)) {
          const n = S.nodes.find(n => n.id === b.targetNodeId);
          if (n) { const [nx, ny] = nodePos(S, n); if (dist(b.x, b.y, nx, ny) < 120) { st.retried.add(b.id); const e = (prand() - 0.5) * 8 / G.mapScale; G.applyAction({ type: 'swipe', x1: b.x - 30, y1: b.y + e, x2: b.x + 30, y2: b.y + e, killR, friendR }); } }
        }
        continue;
      }
      if (policy === 'expert') { // expert waits for the approach, like greedy, but with human aim; panic-swipes point-blank bots
        const tn = S.nodes.find(n => n.id === b.targetNodeId);
        if (tn) { const [nx, ny] = nodePos(S, tn); const dd = dist(b.x, b.y, nx, ny); if (dd > 60 && (S.t < at || dd > 220)) continue; }
        else if (S.t < at) continue;
      } else if (S.t < at) continue;
      st.seen.set(b.id, -1);
      if (prand() < missP) continue;                       // whiff
      swipeAt(b);

      if (prand() < (policy === 'expert' ? 0.01 : 0.08))   // careless swipe => possible friendly fire
        G.applyAction({ type: 'swipe', x1: S.cities[0].x - 40, y1: S.cities[0].y, x2: S.cities[0].x + 40, y2: S.cities[0].y, killR, friendR });
    }
  };
}

function runBot(seed, policy, maxT, dailyDate, campaignLevel) {
  G.newRun(seed, campaignLevel!=null?'campaign':dailyDate?'daily':'endless', { tutorial: false, dailyDate, campaignLevel });
  const S = G.state;
  const tick = makePolicy(policy, S, seed * 7919 + 17);
  let t = 0;
  while (!S.over && t < (maxT || 600)) {
    if(S.phase==='upgrade')G.chooseUpgrade(S.upgradeOffer[0]);
    tick();
    G.step(DT); t += DT;
    if (S.sla < 0 || S.sla > 100) throw new Error('SLA out of range ' + S.sla);
    if (S.originInFlight < 0) throw new Error('originInFlight negative');
    for (const r of S.requests) if (r.nodeId && !r.done && !r.released) {
      const n = S.nodes.find(x => x.id === r.nodeId);
      if (n && n.state !== 'online') throw new Error('invariant: live request on non-online node');
    }
  }
  return { t: S.t, score: S.score, upgrades: S.upgrades.slice(), won: S.won };
}

/* ---------- tests ---------- */
let failures = 0;
function check(name, ok, extra) {
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (extra ? ' — ' + extra : ''));
  if (!ok) failures++;
}
function q(ts, p) { ts = ts.slice().sort((a, b) => a - b); return ts[Math.min(ts.length - 1, Math.floor(p * ts.length))]; }

function testDeterminism() {
  const run = () => {
    G.newRun(4242, 'endless', { tutorial: false });
    G.applyAction({ type: 'place', city: 0 }); G.applyAction({ type: 'place', city: 1 });
    for (let i = 0; i < 60 * 30; i++) G.step(DT);
    return JSON.stringify(G.snapshot());
  };
  check('determinism (same seed+actions => same snapshot)', run() === run());
}
function testRerouteInvariant() {
  // move
  G.newRun(11, 'endless', { tutorial: false });
  G.applyAction({ type: 'place', city: 0 }); G.applyAction({ type: 'place', city: 1 });
  for (let i = 0; i < 60 * 15; i++) G.step(DT);
  const S = G.state;
  G.moveNode(S.nodes[0].id, 3);
  let bad = S.requests.filter(r => !r.done && r.nodeId && (S.nodes.find(n => n.id === r.nodeId) || {}).state !== 'online').length;
  check('reroute invariant after move', bad === 0, bad + ' stuck');
  // outage
  G.startEvent({ type: 'outage', u: 0.5 });
  bad = S.requests.filter(r => !r.done && r.nodeId && (S.nodes.find(n => n.id === r.nodeId) || {}).state !== 'online').length;
  check('reroute invariant after outage', bad === 0, bad + ' stuck');
  // attack (leak)
  const on = S.nodes.find(n => n.state === 'online');
  if (on) {
    const bot = { id: 99999, x: S.cities[on.cityIdx].x, y: S.cities[on.cityIdx].y, targetNodeId: on.id, speed: 0, alive: true, rot: 0 };
    S.bots.push(bot); G.leakBot(bot);
    bad = S.requests.filter(r => !r.done && r.nodeId && (S.nodes.find(n => n.id === r.nodeId) || {}).state !== 'online').length;
    check('reroute invariant after attack', bad === 0, bad + ' stuck');
  } else check('reroute invariant after attack', true, 'no online node, skipped');
}
function testMenuSmoke() {
  G.startRun('endless');
  for (let i = 0; i < 60; i++) G.loop(i * 16.7);
  G.toMenu();
  for (let i = 0; i < 300; i++) G.loop((60 + i) * 16.7);
  check('menu-loop smoke (startRun -> toMenu -> 300 frames, zero exceptions)', G.loopErrors === 0, 'loopErrors=' + G.loopErrors);
}
function testTutorial() {
  G.DB.tutorialSeen = false;
  G.startRun('endless');
  const S0 = G.state;
  const hadTut = !!(S0 && S0.tutorial);
  for (let i = 0; i < 60 * 100; i++) { G.loop(i * 16.7); if (i === 120) G.applyAction({ type: 'place', city: 0 }); }
  check('tutorial completes within 100s (tutorialSeen=true)', hadTut && G.DB.tutorialSeen === true);
}
function testTrayLabels() {
  G.newRun(5, 'endless', { tutorial: false });
  const a = G.slotLabel(2), b = G.slotLabel(3), c = G.slotLabel(4);
  check('tray lock labels (25/55/95)', a === '۲۵ث' && b === '۵۵ث' && c === '۹۵ث', [a, b, c].join(','));
}
function testWarmthRing() {
  global.__arcs = [];
  G.newRun(21, 'endless', { tutorial: false });
  G.placeNode(0);
  for (let i = 0; i < 60; i++) G.step(DT);
  G.render(1);
  const np = G.w2s(G.state.cities[0].x, G.state.cities[0].y);
  const ring = global.__arcs.find(a => a[2] >= 18 && dist(a[0], a[1], np.x, np.y - 14) <= 30);
  check('warmth ring drawn around node (<30px)', !!ring, ring ? 'center ' + ring[0].toFixed(0) + ',' + ring[1].toFixed(0) : 'no ring arc found');
}
function testSwipeRadii() {
  G.newRun(31, 'endless', { tutorial: false });
  const S = G.state;
  const b = { id: 4242, x: 500, y: 400, targetNodeId: 0, speed: 0, alive: true, rot: 0 };
  S.bots.push(b);
  const killR = G.CONFIG.bots.killRadiusPx / G.mapScale;
  let k = G.applySwipe(470, 400, 530, 400, killR, 1);
  check('swipe on the line kills (pixel radius semantics)', k === 1 && !S.bots.find(x => x.id === 4242).alive);
  const b2 = { id: 4243, x: 500, y: 400, targetNodeId: 0, speed: 0, alive: true, rot: 0 };
  S.bots.push(b2);
  const off = (G.CONFIG.bots.killRadiusPx + 30) / G.mapScale;
  k = G.applySwipe(470, 400 + off, 530, 400 + off, killR, 1);
  check('swipe far off the line misses', k === 0 && S.bots.find(x => x.id === 4243).alive);
  const b3 = {id:4244,x:500,y:400,targetNodeId:0,speed:0,alive:true,rot:0}; S.bots.push(b3);
  G.applyAction({type:'swipe',x1:470,y1:410,x2:530,y2:410,killR:2,friendR:1});
  check('applyAction passes explicit world radii', b3.alive);

}
function testBands() {
  const N = 30;
  const bands = [
    ['lazy', 25, 50], ['novice', 60, 110], ['human', 90, 180]
  ];
  const out = {};
  for (const pol of ['lazy', 'novice', 'human', 'expert', 'greedy']) {
    const res = [];
    for (let s = 1; s <= N; s++) res.push(runBot(s * 777 + 13, pol));
    const ts = res.map(r => r.t), sc = res.map(r => r.score);
    out[pol] = { t: [q(ts, .1), q(ts, .5), q(ts, .9)], s: [q(sc, .1), q(sc, .5), q(sc, .9)] };
  }
  for (const [pol, lo, hi] of bands) {
    const p50 = out[pol].t[1];
    check('band ' + pol + ' p50 in [' + lo + ',' + hi + ']', p50 >= lo && p50 <= hi, 'p50=' + p50.toFixed(1));
  }
  check('band greedy p50 >= 240', out.greedy.t[1] >= 240, 'p50=' + out.greedy.t[1].toFixed(1));
  check('band greedy p10 >= 150', out.greedy.t[0] >= 150, 'p10=' + out.greedy.t[0].toFixed(1));
  check('band expert p50 >= 240', out.expert.t[1] >= 240, 'p50=' + out.expert.t[1].toFixed(1));
  for (const pol of ['expert','greedy']) check('band '+pol+' p90 < 550 (600s test cap)', out[pol].t[2] < 550, 'p90='+out[pol].t[2].toFixed(1));
  console.log('\npolicy   survival p10/p50/p90      score p10/p50/p90');
  for (const pol of ['lazy', 'novice', 'human', 'expert', 'greedy'])
    console.log(pol.padEnd(8), out[pol].t.map(v => v.toFixed(0).padStart(4)).join('/'), '   ', out[pol].s.map(v => String(Math.round(v)).padStart(6)).join('/'));
  return out;
}
function testSoak() {
  let ok = 0;
  for (let s = 1; s <= 50; s++) { runBot(s * 31 + 7, s % 2 ? 'greedy' : 'novice'); ok++; }
  check('soak 50 seeds (invariants hold)', ok === 50);
}

function main() {
  testDeterminism();
  testRerouteInvariant();
  testMenuSmoke();
  testTutorial();
  testTrayLabels();
  testWarmthRing();
  testSwipeRadii();
  testBands();
  testSoak();
  console.log(failures ? '\n' + failures + ' FAILURES' : '\nALL TESTS PASS');
  return failures ? 1 : 0;
}
module.exports = { main, runBot, G };
if (require.main === module) process.exit(main());
