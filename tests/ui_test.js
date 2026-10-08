const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
// v0.3：常數題（AC20）、只用 NAND（AC22）、XOR 形式與分頁（AC26）
async function v03DesktopTest(pg, out, ok) {
  // AC20 UI：注入常數題，作答 1 判為正確
  await pg.evaluate(() => { P.form = 'SOP'; P.vals = Array(1 << P.n).fill(1); P.revealed = false; P.attempted = false; P.solved = false; renderPractice(); });
  await pg.fill('#ansInput', '1'); await pg.click('#submitBtn');
  ok('AC20 UI constant', (await pg.textContent('#fbP')).includes('正確'));
  // AC22 UI：電路分頁切換
  await pg.click('.tabs button[data-mode="simplify"]');
  await pg.click('#nSegS [data-n="3"]');
  await pg.fill('#mdInput', 'm(0,1,2,5,6,7)');
  await pg.click('#circS [data-circ="pure"]');
  ok('AC22 UI NAND only', (await pg.textContent('#circS .gatecount')).includes('共 7 個閘') && await pg.isVisible('#circS svg'));
  // AC26 UI：XOR 形式與分頁
  await pg.fill('#mdInput', 'm(1,2,4,7)');
  ok('AC26 UI XOR line', (await pg.textContent('#xorS')).includes('3 個 literal'));
  await pg.click('#circS [data-circ="xor"]');
  ok('AC26 UI XOR tab', (await pg.textContent('#circS .gatecount')).includes('XOR'));
  await pg.screenshot({ path: out + '/desktop_5_xor.png', fullPage: true });
}
// v0.5：Π 輸入按鍵（AC48）、DeMorgan 與 X 說明（AC41、AC42）、OR-NAND 分頁（AC43）、練習 POS 題目（AC49）
async function v05Test(b, url, out, errs, ok) {
  const pg = await b.newPage({ viewport: { width: 375, height: 812 } });
  pg.on('pageerror', e => errs.push('v0.5 pageerror ' + e.message));
  await pg.goto(url);
  await pg.click('#clearBtn');
  for (const k of ['Π', '(', '1', ',', '3', ')']) await pg.click(`#keypadS [data-k="${k}"]`);
  const v = await pg.inputValue('#mdInput');
  const c1 = await pg.textContent('#kmapS [data-m="1"] .val'), c0 = await pg.textContent('#kmapS [data-m="0"] .val');
  await pg.click('#kmapS [data-m="0"]');
  const kept = await pg.inputValue('#mdInput');
  await pg.click('#noKbdS');
  const mode = await pg.getAttribute('#mdInput', 'inputmode');
  ok('AC48 keypad Π', v === 'Π(1,3)' && c1 === '0' && c0 === '1' && kept === 'Π(1,3)+d(0)' && mode === 'none', [v, c1, c0, kept, mode].join(' | '));
  await pg.fill('#mdInput', 'm(0,2,8,10)');
  await pg.click('#formSegS [data-form="POS"]');
  ok('AC41 UI F\'', (await pg.textContent('#demS')).includes("F' = B + D"));
  await pg.fill('#mdInput', 'm(1,3,7,11,15)+d(0,2,5)');
  await pg.click('#formSegS [data-form="SOP"]');
  ok('AC42 UI X usage', (await pg.textContent('#dcS')).includes('d0、d2 當成 1'));
  await pg.click('#circS [data-circ="on"]');
  ok('AC43 UI OR-NAND tab', await pg.isVisible('#circS svg') && (await pg.textContent('#circS .gatecount')).includes('OR'));
  ok('AC48 no h-scroll', await pg.evaluate(() => document.documentElement.scrollWidth) === 375);
  await pg.screenshot({ path: out + '/mobile_6_v05.png', fullPage: true });
  await pg.click('.tabs button[data-mode="practice"]');
  await pg.click('#formSegP [data-form="POS"]');
  ok('AC49 POS problem ΠM', (await pg.textContent('#probP')).includes('ΠM('));
  await pg.close();
}
// AC37：作答按鍵（5 變數）
async function keypadTest(b, url, errs, ok) {
  const pg = await b.newPage({ viewport: { width: 1280, height: 900 } });
  pg.on('pageerror', e => errs.push('keypad pageerror ' + e.message));
  await pg.goto(url);
  await pg.click('.tabs button[data-mode="practice"]');
  await pg.click('#nSegP [data-n="5"]');
  await pg.click('#ansInput');
  for (const k of ['A', 'B', "'", '⊕', 'C']) await pg.click(`#keypad [data-k="${k}"]`);
  const v1 = await pg.inputValue('#ansInput');
  const focused = await pg.evaluate(() => document.activeElement.id === 'ansInput');
  await pg.evaluate(() => document.querySelector('#ansInput').setSelectionRange(2, 2));
  await pg.click('#keypad [data-k="("]');
  const v2 = await pg.inputValue('#ansInput');
  await pg.click('#keypad [data-k="BS"]');
  const v3 = await pg.inputValue('#ansInput');
  await pg.click('#keypad [data-k="CLR"]');
  const v4 = await pg.inputValue('#ansInput');
  await pg.click('#noKbd');
  const mode = await pg.getAttribute('#ansInput', 'inputmode');
  const keys = await pg.$$eval('#keypad .key.var', els => els.map(e => e.dataset.k).join(''));
  ok('AC37 keypad', v1 === "AB'⊕C" && focused && v2 === "AB('⊕C" && v3 === "AB'⊕C" && v4 === '' && mode === 'none' && keys === 'ABCDE', [v1, focused, v2, v3, v4, mode, keys].join(' | '));
  await pg.close();
}
// AC32 UI 與 AC38：5 變數兩張圖、手機版連續 200 題不水平捲動
async function fiveVarMobileTest(b, url, out, errs, ok) {
  const pg = await b.newPage({ viewport: { width: 375, height: 812 } });
  pg.on('pageerror', e => errs.push('5var pageerror ' + e.message));
  await pg.goto(url);
  await pg.click('#nSegS [data-n="5"]');
  await pg.fill('#mdInput', 'm(0,2,4,6,9,13,21,23,25,29,31)');
  const maps = await pg.$$eval('#kmapS .kmwrap', els => els.length);
  const expr = (await pg.textContent('#exprS')).replace(/\s/g, '');
  ok('AC32 UI two maps', maps === 2 && expr === "F=A'B'E'+BD'E+ACE", maps + ' ' + expr);
  let worst = await pg.evaluate(() => document.documentElement.scrollWidth);
  await pg.screenshot({ path: out + '/mobile_5_5var.png', fullPage: true });
  await pg.click('.tabs button[data-mode="practice"]');
  await pg.click('#nSegP [data-n="5"]');
  await pg.click('#dcP');
  for (let i = 0; i < 200; i++) {
    await pg.click('#newBtn');
    if (i % 20 === 0) await pg.click('#showBtn');
    worst = Math.max(worst, await pg.evaluate(() => document.documentElement.scrollWidth));
  }
  ok('AC38 5-var mobile no h-scroll', worst === 375, worst);
  await pg.close();
}
(async () => {
  const b = await chromium.launch();
  const errs = [];
  const url = 'file://' + require('path').resolve(__dirname, '..', 'index.html');
  const out = process.env.SHOT_DIR || '.';
  const res = [];
  const ok = (n, c, i='') => { res.push(c); console.log(c ? 'PASS' : 'FAIL', n, i); };
  for (const [name, vp] of [['desktop', { width: 1280, height: 900 }], ['mobile', { width: 375, height: 812 }]]) {
    const pg = await b.newPage({ viewport: vp });
    pg.on('pageerror', e => errs.push(name + ' pageerror ' + e.message));
    pg.on('console', m => { if (m.type() === 'error') errs.push(name + ' console ' + m.text()); });
    await pg.goto(url);
    await pg.screenshot({ path: out + '/' + name + '_1_main.png', fullPage: true });
    if (name === 'mobile') ok('375px no h-scroll', await pg.evaluate(() => document.documentElement.scrollWidth) === 375, await pg.evaluate(() => document.documentElement.scrollWidth));
    // AC2: click cell 4 three times
    const seq = [];
    for (let i = 0; i < 3; i++) { await pg.click('#kmapS [data-m="4"]'); seq.push(await pg.textContent('#kmapS [data-m="4"] .val')); }
    ok(name + ' AC2', seq.join() === '1,X,0', seq.join());
    // AC3 via UI
    await pg.click('#clearBtn');
    await pg.fill('#mdInput', 'm(0,2,8,10)');
    await pg.click('#kmapS [data-m="5"]'); await pg.click('#kmapS [data-m="5"]');
    ok(name + ' AC3', await pg.inputValue('#mdInput') === 'm(0,2,8,10)+d(5)', await pg.inputValue('#mdInput'));
    // AC4
    await pg.fill('#mdInput', 'm(16)');
    ok(name + ' AC4', (await pg.textContent('#mdMsg')).includes('0–15') && await pg.textContent('#kmapS [data-m="5"] .val') === 'X');
    // AC11: 3 vars, m(0,1,2,5,6,7), solution 2
    await pg.click('#nSegS [data-n="3"]');
    await pg.fill('#mdInput', 'm(0,1,2,5,6,7)');
    await pg.click('#solTabsS [data-sol="1"]');
    const e2 = (await pg.textContent('#exprS')).replace(/\s/g, '');
    ok(name + ' AC11', e2 === "F=A'C'+B'C+AB", e2);
    if (name === 'desktop') await pg.hover('#exprS [data-t="1"]');
    else await pg.tap('#exprS [data-t="1"]').catch(() => pg.click('#exprS [data-t="1"]'));
    ok(name + ' hover HL', await pg.evaluate(() => document.querySelectorAll('#kmapS .grp.hl').length === 1));
    await pg.screenshot({ path: out + '/' + name + '_2_sol2_hover.png', fullPage: true });
    // POS + steps
    await pg.click('#nSegS [data-n="4"]');
    await pg.fill('#mdInput', 'm(0,2,8,10)');
    await pg.click('#formSegS [data-form="POS"]');
    const ep = (await pg.textContent('#exprS')).replace(/\s/g, '');
    ok(name + ' AC9 UI', ep === "F=(B')(D')", ep);
    await pg.click('#formSegS [data-form="SOP"]');
    await pg.click('#stepsS summary');
    await pg.screenshot({ path: out + '/' + name + '_3_steps.png', fullPage: true });
    // Practice
    await pg.click('.tabs button[data-mode="practice"]');
    await pg.fill('#ansInput', 'A');
    await pg.click('#submitBtn');
    const fb = await pg.textContent('#fbP');
    ok(name + ' practice feedback', fb.length > 0, fb.slice(0, 40));
    await pg.click('#showBtn');
    ok(name + ' show solution', await pg.isVisible('#solP'));
    await pg.screenshot({ path: out + '/' + name + '_4_practice.png', fullPage: true });
    // AC17: 10 problems, answer correctly each via revealed? count correct by submitting solver answer
    if (name === 'desktop') {
      for (let i = 0; i < 10; i++) {
        await pg.click('#nextBtn');
        const ans = await pg.evaluate(() => { const r = solve(P.n, P.vals, P.form); return exprStr(r.solutions[0], P.n, P.form); });
        await pg.fill('#ansInput', ans); await pg.click('#submitBtn');
      }
      const sc = await pg.textContent('#scoreP');
      ok('AC17 UI', sc.includes('答對 10 題／作答 11 題'), sc);
      await v03DesktopTest(pg, out, ok);
    }
    if (name === 'mobile') ok('375px no h-scroll (end)', await pg.evaluate(() => document.documentElement.scrollWidth) === 375);
    await pg.close();
  }
  await keypadTest(b, url, errs, ok);
  await v05Test(b, url, out, errs, ok);
  await fiveVarMobileTest(b, url, out, errs, ok);
  ok('no pageerror/console error', errs.length === 0, errs.join('\n'));
  await b.close();
  console.log(res.every(x => x) ? 'ALL UI PASS' : 'UI FAILURES');
})();
