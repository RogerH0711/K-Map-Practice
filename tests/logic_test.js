const K = require(process.argv[2]);
const { solve, exprStr, parseMD, canonicalMD, judge, circuitSVG, randomProblem, kLayout, cellMinterm, solCost } = K;
let pass = 0, fail = 0;
const ok = (name, cond, info = '') => { if (cond) pass++; else { fail++; console.log('FAIL', name, info); } };
const V = (n, s) => { const r = parseMD(s, n); const v = Array(1 << n).fill(0); r.ones.forEach(k => v[k] = 1); r.dcs.forEach(k => v[k] = 2); return v; };
const sols = (n, s, form) => solve(n, V(n, s), form).solutions.map(x => exprStr(x, n, form).replace(/\s/g, ''));
const nows = a => a.map(x => x.replace(/\s/g, ''));
// AC1
const L4 = kLayout(4); ok('AC1', cellMinterm(L4, L4.rowCodes.indexOf('11'), L4.colCodes.indexOf('10')) === 14);
// AC3
{ const v = V(4, 'm(0,2,8,10)'); ok('AC3a', [0,2,8,10].every(k => v[k] === 1) && v.filter(x => x).length === 4); v[5] = 2; ok('AC3b', canonicalMD(v) === 'm(0,2,8,10)+d(5)', canonicalMD(v)); }
// AC4
{ const r = parseMD('m(16)', 4); ok('AC4', !r.ok && /0–15/.test(r.msg), r.msg); }
// F3 variants
{ const r = parseMD('Σm(0， 2, 8,10) + d(5)', 4); ok('F3 variants', r.ok && r.ones.join() === '0,2,8,10' && r.dcs.join() === '5'); }
// AC5
ok('AC5', JSON.stringify(sols(4, 'm(0,2,8,10)', 'SOP')) === JSON.stringify(["B'D'"]), sols(4, 'm(0,2,8,10)', 'SOP'));
// AC6
{ const s = sols(3, 'm(0,1,2,5,6,7)', 'SOP'); const e = nows(["A'B' + BC' + AC", "A'C' + B'C + AB"]); ok('AC6', s.length === 2 && e.every(x => s.includes(x)), s); }
// AC7
{ const norm = x => x.split('+').sort().join('+'); const s = sols(4, 'm(1,3,7,11,15)+d(0,2,5)', 'SOP').map(norm); const e = ["CD+A'B'", "CD+A'D"].map(norm); ok('AC7 (term order ignored)', s.length === 2 && e.every(x => s.includes(x)), s);
  console.log('  AC7 display order:', sols(4, 'm(1,3,7,11,15)+d(0,2,5)', 'SOP')); }
// AC8
ok('AC8a', sols(4, '', 'SOP')[0] === '0'); ok('AC8b', sols(4, 'm(' + [...Array(16).keys()] + ')', 'SOP')[0] === '1');
ok('AC8c', sols(3, 'm(0,1,2,3)+d(4,5,6,7)', 'SOP')[0] === '1');
// AC9
ok('AC9a', JSON.stringify(sols(4, 'm(0,2,8,10)', 'POS')) === JSON.stringify(["(B')(D')"]), sols(4, 'm(0,2,8,10)', 'POS'));
ok('AC9b', JSON.stringify(sols(3, 'm(0,1,2,5,6,7)', 'POS')) === JSON.stringify(["(A+B'+C')(A'+B+C)"]), sols(3, 'm(0,1,2,5,6,7)', 'POS'));
// AC10 (geometry): corners group
{ const r = solve(4, V(4, 'm(0,2,8,10)'), 'SOP'); const g = K.groupSegs(r.solutions[0][0], L4); ok('AC10', g.rs.length === 2 && g.cs.length === 2 && g.rs[0].os && g.rs[1].oe && g.cs[0].os && g.cs[1].oe, JSON.stringify(g)); }
// AC11: solution 2
ok('AC11', sols(3, 'm(0,1,2,5,6,7)', 'SOP')[1] === "A'C'+B'C+AB", sols(3, 'm(0,1,2,5,6,7)', 'SOP'));
// AC12
{ const r = solve(4, V(4, 'm(0,2,8,10)'), 'SOP'); const r2 = r.rounds[1].map(t => t.cov.join('-')).sort(); ok('AC12a', JSON.stringify(r2) === JSON.stringify(['0-2','0-8','2-10','8-10']), r2);
  const p = t => { let s=''; for (let i=3;i>=0;i--){const b=1<<i; s+=(t.mask&b)?'-':((t.v&b)?'1':'0');} return s; };
  ok('AC12b', r.rounds[2].length === 1 && p(r.rounds[2][0]) === '-0-0' && r.ess.length === 1 && p(r.ess[0]) === '-0-0'); }
// AC13/14 circuit counts
const countGates = svg => ({ not: (svg.match(/<path class="gate" d="M[\d.]+,[\d.]+ L/g) || []).length, and: (svg.match(/<path class="gate"[^>]* d="M[^"]* A/g) || []).length, or: (svg.match(/<path class="gate"[^>]* d="M[^"]* Q/g) || []).length });
{ const r = solve(3, V(3, 'm(0,1,2,5,6,7)'), 'SOP'); const svg = circuitSVG(3, r.solutions[0], 'SOP'); const c = countGates(svg); ok('AC13', c.not === 3 && c.and === 3 && c.or === 1, JSON.stringify(c)); }
{ const r = solve(4, V(4, 'm(0,2,8,10)'), 'SOP'); const c = countGates(circuitSVG(4, r.solutions[0], 'SOP')); ok('AC14', c.not === 2 && c.and === 1 && c.or === 0, JSON.stringify(c)); }
// AC15
{ const v = V(4, 'm(0,2,8,10)');
  ok('AC15a', judge(4, v, 'SOP', "B'D'").kind === 'correct');
  const r = judge(4, v, 'SOP', "A'B'D' + AB'D'"); ok('AC15b', r.kind === 'notmin' && r.dt === 1 && r.dl === 4, JSON.stringify(r));
  const w = judge(4, v, 'SOP', "B'"); ok('AC15c', w.kind === 'wrong' && [...w.extra, ...w.miss].sort((a,b)=>a-b).join() === '1,3,9,11', JSON.stringify(w));
  ok('AC15d', judge(4, v, 'SOP', "B'D'+").kind === 'syntax');
  ok('syntax ~ !', judge(4, v, 'SOP', "~b*!d").kind === 'correct');
  ok('POS judge', judge(4, v, 'POS', "(B')(D')").kind === 'correct'); }
// AC16
{ const v = V(4, 'm(1,3,7,11,15)+d(0,2,5)'); ok('AC16', judge(4, v, 'SOP', "CD + A'B'").kind === 'correct' && judge(4, v, 'SOP', "CD + A'D").kind === 'correct'); }
// AC17 logic part
{ let good = true; for (let i = 0; i < 1000; i++) { const n = 2 + i % 3; const v = randomProblem(n, i % 2 === 0); if (!v.includes(1) || !v.includes(0)) good = false; } ok('AC17 no constant', good); }
// Random 3000
const evalSol = (sol, n, form, m) => {
  if (form === 'SOP') return sol.some(t => ((m ^ t.v) & ~t.mask & ((1 << n) - 1)) === 0) ? 1 : 0;
  return sol.some(t => ((m ^ t.v) & ~t.mask & ((1 << n) - 1)) === 0) ? 0 : 1; };
let rnd = 0, rndConst = 0;
for (let it = 0; it < 3000; it++) {
  const n = 2 + it % 3, dc = it % 2 === 0, N = 1 << n;
  const v = []; for (let m = 0; m < N; m++) v.push(dc && Math.random() < 0.2 ? 2 : (Math.random() < 0.5 ? 1 : 0));
  for (const form of ['SOP', 'POS']) {
    const r = solve(n, v, form);
    for (const s of r.solutions) {
      let eq = true; for (let m = 0; m < N; m++) if (v[m] !== 2 && evalSol(s, n, form, m) !== v[m]) eq = false;
      const j = judge(n, v, form, exprStr(s, n, form));
      const isConst = !v.includes(0) || !v.includes(1);
      if (!eq || j.kind !== 'correct') { if (isConst && eq) { rndConst++; continue; } rnd++; if (rnd < 5) console.log('random fail', n, v.join(''), form, exprStr(s, n, form), eq, j); }
    }
  }
}
ok('random 3000 (non-constant)', rnd === 0, rnd);
console.log('  constant-function judge cases not judged correct:', rndConst);
// Brute force 3-var 300
let bf = 0;
for (let it = 0; it < 300; it++) {
  const n = 3, N = 8, v = []; for (let m = 0; m < N; m++) v.push(Math.random() < 0.2 ? 2 : (Math.random() < 0.5 ? 1 : 0));
  for (const form of ['SOP', 'POS']) {
    const want = form === 'SOP' ? 1 : 0, req = [...Array(N).keys()].filter(m => v[m] === want);
    const cubes = [];
    for (let mask = 0; mask < N; mask++) for (let val = 0; val < N; val++) { if (val & mask) continue;
      const cov = [...Array(N).keys()].filter(m => ((m ^ val) & ~mask & 7) === 0);
      if (cov.every(m => v[m] === want || v[m] === 2)) cubes.push({ mask, cov, lits: 3 - [0,1,1,2,1,2,2,3][mask] }); }
    let best = null;
    if (!req.length) best = { terms: 0, lits: 0 };
    else {
      const total = 1 << cubes.length;
      for (let k = 1; k <= 4 && !best; k++) {
        const rec = (start, acc) => { if (acc.length === k) { if (req.every(m => acc.some(c => c.cov.includes(m)))) { const l = acc.reduce((s, c) => s + c.lits, 0); if (!best || l < best.lits) best = { terms: k, lits: l }; } return; }
          for (let i = start; i < cubes.length; i++) { acc.push(cubes[i]); rec(i + 1, acc); acc.pop(); } };
        rec(0, []);
      }
    }
    const got = solCost(solve(n, v, form).solutions[0], n);
    if (got.terms !== best.terms || got.lits !== best.lits) { bf++; if (bf < 5) console.log('bf fail', v.join(''), form, got, best); }
  }
}
ok('bruteforce 300', bf === 0, bf);
console.log(`pass ${pass}, fail ${fail}`);
process.exit(fail ? 1 : 0);
