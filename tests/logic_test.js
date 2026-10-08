const K = require(process.argv[2]);
const { solve, exprStr, parseMD, canonicalMD, judge, circuitSVG, randomProblem, kLayout, cellMinterm, solCost } = K;
// 固定種子的亂數（Park–Miller），讓每次測資相同、失敗時可以重現
let seed = 20_261_007;
function rand() {
  seed = (seed * 16_807) % 2_147_483_647;
  return (seed - 1) / 2_147_483_646;
}
// 隨機格子值：含 X 時約 20% 為 X，其餘一半 1、一半 0
function randCell(withDc) {
  if (withDc && rand() < 0.2) return 2;
  return rand() < 0.5 ? 1 : 0;
}
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
{ const s = sols(4, 'm(1,3,7,11,15)+d(0,2,5)', 'SOP'); ok('AC7', JSON.stringify(s) === JSON.stringify(["A'B'+CD", "A'D+CD"]), s); }
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
const stdSVG = (n, sol) => circuitSVG(n, K.circuitPlan(n, sol, 'SOP', 'std'), 'SOP', sol);
const countGates = svg => ({ not: (svg.match(/<path class="gate" d="M[\d.]+,[\d.]+ L/g) || []).length, and: (svg.match(/<path class="gate"[^>]* d="M[^"]* A/g) || []).length, or: (svg.match(/<path class="gate"[^>]* d="M[^"]* Q/g) || []).length });
{ const r = solve(3, V(3, 'm(0,1,2,5,6,7)'), 'SOP'); const c = countGates(stdSVG(3, r.solutions[0])); ok('AC13', c.not === 3 && c.and === 3 && c.or === 1, JSON.stringify(c)); }
{ const r = solve(4, V(4, 'm(0,2,8,10)'), 'SOP'); const c = countGates(stdSVG(4, r.solutions[0])); ok('AC14', c.not === 2 && c.and === 1 && c.or === 0, JSON.stringify(c)); }
// AC15
{ const v = V(4, 'm(0,2,8,10)');
  ok('AC15a', judge(4, v, 'SOP', "B'D'").kind === 'correct');
  const r = judge(4, v, 'SOP', "A'B'D' + AB'D'"); ok('AC15b', r.kind === 'notmin' && r.dt === 1 && r.dl === 4, JSON.stringify(r));
  const w = judge(4, v, 'SOP', "B'"); ok('AC15c', w.kind === 'wrong' && [...w.extra, ...w.miss].sort((a,b)=>a-b).join() === '1,3,9,11', JSON.stringify(w));
  ok('AC15d', judge(4, v, 'SOP', "B'D'+").kind === 'syntax');
  ok('syntax ~ !', judge(4, v, 'SOP', "~b*!d").kind === 'correct');
  ok('POS judge', judge(4, v, 'POS', "(B')(D')").kind === 'correct'); }
// AC19: wrong-answer explanation names the term that covers a wrong cell
{ const v = V(4, 'm(5,7,14,15)'); const g = judge(4, v, 'SOP', 'BD+ABC').groups;
  ok('AC19 friend case', g.length === 1 && g[0].type === 'over' && g[0].terms.join() === 'BD' && g[0].ms.join() === '13', JSON.stringify(g));
  const g2 = judge(4, V(4, 'm(0,2,8,10)'), 'SOP', "B'").groups;
  ok('AC19 over only', g2.length === 1 && g2[0].terms.join() === "B'" && g2[0].ms.join() === '1,3,9,11', JSON.stringify(g2));
  const g3 = judge(4, v, 'SOP', "B'").groups;
  ok('AC19 under', g3.some(x => x.type === 'under' && x.ms.join() === '5,7,14,15'), JSON.stringify(g3));
  const g4 = judge(4, v, 'POS', '(B+D)(A+C)').groups;
  ok('AC19 POS', g4.some(x => x.type === 'over' && x.shape === 'POS' && x.terms.join() === '(A+C)' && x.ms.join() === '5'), JSON.stringify(g4));
  const g5 = judge(4, v, 'SOP', "A'BD+A(B+C)D'").groups;
  ok('AC19 non-SOP fallback', g5.every(x => x.type === 'diff'), JSON.stringify(g5)); }
// AC16
{ const v = V(4, 'm(1,3,7,11,15)+d(0,2,5)'); ok('AC16', judge(4, v, 'SOP', "CD + A'B'").kind === 'correct' && judge(4, v, 'SOP', "CD + A'D").kind === 'correct'); }
// AC17 logic part：常數題約 1/12，其餘題目一定同時有 0 和 1
{ let constant = 0, bad = 0; const total = 6000;
  for (let i = 0; i < total; i++) {
    const v = randomProblem(2 + i % 3, i % 2 === 0, rand), rest = v.filter(x => x !== 2);
    if (!rest.length) bad++;
    else if (rest.every(x => x === rest[0])) constant++;
    else if (!v.includes(1) || !v.includes(0)) bad++;
  }
  ok('AC17 constant rate', constant / total > 0.05 && constant / total < 0.12 && bad === 0, `${constant}/${total}, bad ${bad}`); }
// Random 3000
const evalSol = (sol, n, form, m) => {
  if (form === 'SOP') return sol.some(t => ((m ^ t.v) & ~t.mask & ((1 << n) - 1)) === 0) ? 1 : 0;
  return sol.some(t => ((m ^ t.v) & ~t.mask & ((1 << n) - 1)) === 0) ? 0 : 1; };
let rnd = 0;
for (let it = 0; it < 3000; it++) {
  const n = 2 + it % 3, dc = it % 2 === 0, N = 1 << n;
  const v = []; for (let m = 0; m < N; m++) v.push(randCell(dc));
  for (const form of ['SOP', 'POS']) {
    const r = solve(n, v, form);
    for (const s of r.solutions) {
      let eq = true; for (let m = 0; m < N; m++) if (v[m] !== 2 && evalSol(s, n, form, m) !== v[m]) eq = false;
      const j = judge(n, v, form, exprStr(s, n, form));
      if (!eq || j.kind !== 'correct') { rnd++; if (rnd < 5) console.log('random fail', n, v.join(''), form, exprStr(s, n, form), eq, j); }
    }
  }
}
{ let bad = 0; for (let i = 0; i < 2000; i++) { const n = 2 + i % 3; const v = randomProblem(n, i % 2 === 0);
    const lit = () => { const k = Math.floor(rand() * n); return 'ABCD'[k] + (rand() < .5 ? "'" : ''); };
    const src = i % 4 < 2 ? Array.from({ length: 1 + i % 3 }, () => lit() + lit()).join('+') : Array.from({ length: 1 + i % 3 }, () => '(' + lit() + '+' + lit() + ')').join('');
    const r = judge(n, v, i % 3 ? 'SOP' : 'POS', src); if (r.kind !== 'wrong') continue;
    const all = r.groups.flatMap(g => g.ms).sort((a, b) => a - b).join(), exp = [...r.extra, ...r.miss].sort((a, b) => a - b).join();
    if (all !== exp || r.groups.some(g => g.type === 'over' && !g.terms.length)) { bad++; if (bad < 4) console.log('groups fail', src, JSON.stringify(r)); } }
  ok('wrong groups cover every differing cell once', bad === 0, bad); }
ok('random 3000 (constant functions included)', rnd === 0, rnd);
// ===== v0.3：常數題、等價電路與用料、XOR =====
// AC20：常數題作答 0／1
{ const one4 = V(4, 'm(' + [...Array(16).keys()] + ')'), zero4 = V(4, '');
  ok('AC20 SOP F=1 "1"', judge(4, one4, 'SOP', '1').kind === 'correct');
  const r = judge(4, one4, 'SOP', "A+A'"); ok('AC20 "A+A\'" notmin', r.kind === 'notmin' && r.dt === 1 && r.dl === 2, JSON.stringify(r));
  ok('AC20 POS F=0 "0"', judge(4, zero4, 'POS', '0').kind === 'correct');
  const dc3 = V(3, 'm(0,1,2,3,4)+d(5,6,7)');
  ok('AC20 F=1 with X', judge(3, dc3, 'SOP', '1').kind === 'correct' && judge(3, dc3, 'SOP', "A'").kind === 'wrong'); }
// AC21：XOR 作答
{ const x3 = V(3, 'm(1,2,4,7)');
  ok('AC21 A^B^C', judge(3, x3, 'SOP', 'A^B^C').kind === 'xor');
  ok('AC21 A⊕B⊕C', judge(3, x3, 'SOP', 'A⊕B⊕C').kind === 'xor');
  ok('AC21 A⊕B wrong', judge(3, x3, 'SOP', 'A⊕B').kind === 'wrong');
  ok('AC21 (A⊕B⊕C)\' wrong', judge(3, x3, 'SOP', "(A⊕B⊕C)'").kind === 'wrong');
  ok('AC21 A⊙B', judge(2, V(2, 'm(0,3)'), 'SOP', 'A⊙B').kind === 'xor');
  const a = K.parseExpr('AB⊕C+D', 4); let prec = true;
  for (let m = 0; m < 16; m++) {
    const bit = i => (m >> (3 - i)) & 1;
    if (K.evalNode(a, m, 4) !== (((bit(0) & bit(1)) ^ bit(2)) | bit(3))) prec = false;
  }
  ok('AC21 precedence NOT > AND > XOR > OR', prec); }
// AC22–AC25：等價電路的閘數與用料
const circ = (n, src, form, variant) => {
  const sol = solve(n, V(n, src), form).solutions[0], gs = K.planGates(K.circuitPlan(n, sol, form, variant));
  return { gs: K.gateSummary(gs), parts: K.partsList(gs).list.map(x => `${x.part}x${x.chips}`).join(' ') };
};
{ const s = 'm(0,1,2,5,6,7)';
  let c = circ(3, s, 'SOP', 'std'); ok('AC22 AND-OR', c.gs === '3 個 NOT、3 個 2 輸入 AND、1 個 3 輸入 OR，共 7 個閘' && c.parts === '7404x1 7408x1 CD4075x1', JSON.stringify(c));
  c = circ(3, s, 'SOP', 'nn'); ok('AC22 NAND-NAND', c.gs === '3 個 NOT、3 個 2 輸入 NAND、1 個 3 輸入 NAND，共 7 個閘' && c.parts === '7404x1 7400x1 7410x1', JSON.stringify(c));
  c = circ(3, s, 'SOP', 'pure'); ok('AC22 NAND only', c.gs === '3 個 NAND（輸入短接當反相器）、3 個 2 輸入 NAND、1 個 3 輸入 NAND，共 7 個閘' && c.parts === '7400x2 7410x1', JSON.stringify(c)); }
{ const c = circ(3, 'm(1,3,4,5,6,7)', 'SOP', 'nn'); ok('AC23 single literals', c.gs === '2 個 NOT、1 個 2 輸入 NAND，共 3 個閘', JSON.stringify(c)); }
{ let c = circ(4, 'm(0,2,8,10)', 'SOP', 'nn'); ok('AC24 NAND-NAND', c.gs === '2 個 NOT、1 個 2 輸入 NAND、1 個 NAND（輸入短接當反相器），共 4 個閘', JSON.stringify(c));
  c = circ(4, 'm(0,2,8,10)', 'SOP', 'pure'); ok('AC24 NAND only', c.gs === '3 個 NAND（輸入短接當反相器）、1 個 2 輸入 NAND，共 4 個閘' && c.parts === '7400x1', JSON.stringify(c)); }
{ const c = circ(3, 'm(0,1,2,5,6,7)', 'POS', 'pure'); ok('AC25 NOR only', c.gs === '3 個 NOR（輸入短接當反相器）、2 個 3 輸入 NOR、1 個 2 輸入 NOR，共 6 個閘' && c.parts === '7402x1 7427x1', JSON.stringify(c)); }
// AC26–AC28：XOR 形式
const xorOf = (n, src) => { const v = V(n, src), sol = solve(n, v, 'SOP').solutions[0]; return K.xorFormsFor(n, v, solCost(sol, n).lits).map(f => K.xorExprStr(n, f, false)); };
ok('AC26 m(1,2,4,7)', xorOf(3, 'm(1,2,4,7)').join() === 'A⊕B⊕C', xorOf(3, 'm(1,2,4,7)'));
ok('AC27', xorOf(4, 'm(5,6,13,14)').join() === 'B(C⊕D)' && xorOf(2, 'm(0,3)').join() === 'A⊙B' && xorOf(4, 'm(1,2,4,7,8,11,13,14)').join() === 'A⊕B⊕C⊕D');
ok('AC28 none', xorOf(4, 'm(0,2,8,10)').length === 0 && xorOf(3, 'm(0,1,2,5,6,7)').length === 0);
// AC29：三種電路逐格模擬；XOR 形式字串丟回解析後等價
const gateOut = (kind, ins) => {
  const all = ins.every(Boolean), any = ins.some(Boolean);
  if (kind === 'and') return all ? 1 : 0;
  if (kind === 'or') return any ? 1 : 0;
  if (kind === 'nand') return all ? 0 : 1;
  return any ? 0 : 1;
};
function simulate(p, n, m) {
  const lit = l => { const b = (m >> (n - 1 - l.i)) & 1; return l.neg ? 1 - b : b; };
  const outs = p.terms.map(t => (t.gate ? gateOut(p.g1, t.ins.map(lit)) : lit(t.ins[0])));
  return p.hasL2 ? gateOut(p.g2, outs) : outs[0];
}
{ let bad = 0, forms = 0;
  for (let it = 0; it < 3000; it++) {
    const n = 2 + it % 3, v = [];
    for (let m = 0; m < (1 << n); m++) v.push(randCell(it % 2 === 0));
    for (const form of ['SOP', 'POS']) {
      const sol = solve(n, v, form).solutions[0];
      for (const variant of ['std', 'nn', 'pure']) {
        const p = K.circuitPlan(n, sol, form, variant);
        if (p.constant) continue;
        for (let m = 0; m < (1 << n); m++) if (v[m] !== 2 && simulate(p, n, m) !== v[m]) bad++;
      }
      for (const f of K.xorFormsFor(n, v, solCost(sol, n).lits)) {
        forms++;
        const a = K.parseExpr(K.xorExprStr(n, f, false), n);
        for (let m = 0; m < (1 << n); m++) if (v[m] !== 2 && K.evalNode(a, m, n) !== v[m]) bad++;
        if (/NaN|undefined/.test(K.xorCircuitSVG(n, f))) bad++;
      }
    }
  }
  ok(`AC29 circuits simulate to F, XOR forms equivalent (${forms} forms)`, bad === 0, bad); }
// ===== v0.4：5 變數 =====
// AC30：版面與編號範圍
{ const L5 = kLayout(5);
  ok('AC30 layout', L5.maps === 2 && L5.mapVar === 'A' && L5.rowVars === 'BC' && L5.colVars === 'DE' && cellMinterm(L5, 2, 3, 1) === 30 && cellMinterm(L5, 0, 0, 0) === 0, JSON.stringify(L5));
  ok('AC30 range', !parseMD('m(32)', 5).ok && /0–31/.test(parseMD('m(32)', 5).msg) && parseMD('m(31)', 5).ok); }
// AC31：C'E'，兩張圖都畫四個角落
{ const L5 = kLayout(5), s = sols(5, 'm(0,2,8,10,16,18,24,26)', 'SOP');
  const t = solve(5, V(5, 'm(0,2,8,10,16,18,24,26)'), 'SOP').solutions[0][0], g = K.groupSegs(t, L5);
  ok('AC31', s.join() === "C'E'" && K.mapHas(t, L5, 0) && K.mapHas(t, L5, 1) && g.rs.length === 2 && g.cs.length === 2, s); }
// AC32：課本 5 變數範例，三項分別畫在哪張圖
{ const L5 = kLayout(5), v = V(5, 'm(0,2,4,6,9,13,21,23,25,29,31)'), r = solve(5, v, 'SOP');
  const where = r.solutions[0].map(t => exprStr([t], 5, 'SOP') + ':' + [0, 1].filter(k => K.mapHas(t, L5, k)).join(''));
  ok('AC32', r.solutions.length === 1 && where.slice().sort().join() === ["A'B'E':0", "ACE:1", "BD'E:01"].join(), where); }
// AC33：5 變數隨機 1000 組（SOP、POS），等價、自我判分、三種電路模擬、效能
{ let bad = 0, maxMs = 0;
  for (let it = 0; it < 1000; it++) {
    const v = [];
    for (let m = 0; m < 32; m++) v.push(randCell(it % 2 === 0));
    for (const form of ['SOP', 'POS']) {
      const t0 = process.hrtime.bigint(), r = solve(5, v, form);
      maxMs = Math.max(maxMs, Number(process.hrtime.bigint() - t0) / 1e6);
      if (r.truncated) bad++;
      for (const s of r.solutions) {
        for (let m = 0; m < 32; m++) if (v[m] !== 2 && evalSol(s, 5, form, m) !== v[m]) bad++;
        if (judge(5, v, form, exprStr(s, 5, form)).kind !== 'correct') bad++;
        for (const variant of ['std', 'nn', 'pure']) {
          const p = K.circuitPlan(5, s, form, variant);
          if (p.constant) continue;
          for (let m = 0; m < 32; m++) if (v[m] !== 2 && simulate(p, 5, m) !== v[m]) bad++;
        }
      }
    }
  }
  ok(`AC33 5-var random 1000 (max ${maxMs.toFixed(1)} ms)`, bad === 0 && maxMs < 100, bad); }
// AC34：新的最小覆蓋搜尋與窮舉組合比對（候選 PI ≤ 18）
function refCovers(rem, cand) {
  for (let k = 1; k <= cand.length; k++) {
    let count = 0;
    const rec = (start, acc) => {
      if (acc.length === k) {
        if (rem.every(m => acc.some(p => p.cov.includes(m)))) count++;
        return;
      }
      for (let i = start; i < cand.length; i++) { acc.push(cand[i]); rec(i + 1, acc); acc.pop(); }
    };
    rec(0, []);
    if (count) return { kMin: k, count };
  }
  return { kMin: 0, count: 0 };
}
{ let mism = 0, cases = 0;
  for (let it = 0; it < 3000; it++) {
    const n = 2 + it % 4, v = [];
    for (let m = 0; m < (1 << n); m++) v.push(randCell(it % 2 === 0));
    for (const form of ['SOP', 'POS']) {
      const r = solve(n, v, form);
      if (!r.remaining.length || r.cand.length > 18) continue;
      cases++;
      const ref = refCovers(r.remaining, r.cand);
      if (ref.kMin !== r.kMin || ref.count !== r.covers.length) mism++;
    }
  }
  ok(`AC34 branch-and-bound == exhaustive (${cases} cases)`, mism === 0, mism); }
// 壓力測試：5 變數、約 40% 為 X，不應觸發搜尋上限
{ let trunc = 0;
  for (let it = 0; it < 300; it++) {
    const v = [];
    for (let m = 0; m < 32; m++) v.push(rand() < 0.4 ? 2 : randCell(false));
    for (const form of ['SOP', 'POS']) if (solve(5, v, form).truncated) trunc++;
  }
  ok('stress 5-var 40% X', trunc === 0, trunc); }
// AC35、AC36：5 變數 parity 的 XOR 形式，以及 16 輸入 OR 沒有現成晶片
{ const par = [];
  const ones = m => { let c = 0; for (let b = 0; b < 5; b++) { c += (m >> b) & 1; } return c; };
  for (let m = 0; m < 32; m++) {
    if (ones(m) % 2) par.push(m);
  }
  const v = V(5, 'm(' + par.join(',') + ')'), sol = solve(5, v, 'SOP').solutions[0], cost = solCost(sol, 5);
  const xf = K.xorFormsFor(5, v, cost.lits);
  ok('AC35 parity XOR', cost.terms === 16 && xf.length > 0 && K.xorExprStr(5, xf[0], false) === 'A⊕B⊕C⊕D⊕E', JSON.stringify(cost));
  const parts = K.partsList(K.planGates(K.circuitPlan(5, sol, 'SOP', 'std'))).list;
  ok('AC36 16-input OR has no chip', parts.some(x => x.over && x.desc === '16 輸入 OR' && x.chips === 0), JSON.stringify(parts)); }
// Brute force 3-var 300
let bf = 0;
for (let it = 0; it < 300; it++) {
  const n = 3, N = 8, v = []; for (let m = 0; m < N; m++) v.push(randCell(true));
  for (const form of ['SOP', 'POS']) {
    const want = form === 'SOP' ? 1 : 0, req = [...Array(N).keys()].filter(m => v[m] === want);
    const cubes = [];
    for (let mask = 0; mask < N; mask++) for (let val = 0; val < N; val++) { if (val & mask) continue;
      const cov = [...Array(N).keys()].filter(m => ((m ^ val) & ~mask & 7) === 0);
      if (cov.every(m => v[m] === want || v[m] === 2)) cubes.push({ mask, cov, lits: 3 - [0,1,1,2,1,2,2,3][mask] }); }
    let best = null;
    if (!req.length) best = { terms: 0, lits: 0 };
    else {
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
