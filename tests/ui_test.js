const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
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
    if (name === 'mobile') ok('375px no h-scroll (end)', await pg.evaluate(() => document.documentElement.scrollWidth) === 375);
    await pg.close();
  }
  ok('no pageerror/console error', errs.length === 0, errs.join('\n'));
  await b.close();
  console.log(res.every(x => x) ? 'ALL UI PASS' : 'UI FAILURES');
})();
