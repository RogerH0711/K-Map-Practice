# K-Map Practice — 專案交接

TAICA「生成式AI：文字與圖像生成的原理與實務」第五週作業。本檔把 claude.ai 對話中的決定、規格與進度整理成 Claude Code 可以直接接手的版本，每次開始工作前先讀完。

- 回覆語言：繁體中文（台灣），技術名詞保留英文。
- 需求有歧義、會明顯影響結果時，先問 1–3 個關鍵問題；否則直接做，並在回覆中標明假設（事實／推測／假設分開寫）。

---

## 1. 作業要求

**主題**：用 Vibe Coding 做出一個互動網頁。流程是「把想法說清楚 → 和 AI 討論出規格 → Vibe Coding 實作 → 公開在 GitHub Pages」，不要求自己從頭寫程式。

1. 和 AI 討論想法，整理出規格書。
2. 依規格書用 Vibe Coding 完成網頁：最後整理成單一 `index.html`（CSS、JS 可內嵌），要能實際開啟與操作。
3. 上傳 GitHub，用 GitHub Pages 公開。

**期限**：2026-10-19 23:59（遲交期限 2026-10-20 16:00）

**繳交**：NTU COOL「文字輸入」區，不需 PDF 或附件。
- 標題格式：`學校 學號 系級 姓名 主題`，學校與系級用簡稱 → `成大 〈學號〉 資訊二 〈姓名〉 K-Map Practice`
  - 成大稱資訊工程學系為「資訊系」，系級寫「資訊二」，**不要寫「資工」**（成大另有資源工程學系）。
- 內容必須包含：網站連結、網站介面截圖、規格文字說明。

**評分重點**（9–10 分）：規格書清楚具體；網頁有實際互動；作品與規格良好對應；看得出透過 AI 反覆調整。連結打不開會直接掉到 2 分。抄襲者該次 0 分且總成績 −10。

**成大端額外規定**：每週作業除了上述項目，還要另外上傳 `.ipynb`（增加，不是取代）。本週沒有 notebook；使用者 2026-10-07 表示這次作業只需要在 NTU COOL 交文字，不另交檔案。

---

## 2. 目前進度（2026-10-07，v0.2）

| 項目 | 狀態 |
| --- | --- |
| 規格書 v1.3 | 完成；全文在 `README.md`，已與成品 v0.2 的實際行為逐條比對。v1.1 原始文件在 claude.ai Docs「K-Map Practice 規格書」 |
| `index.html` v0.2 | 完成並已上線（PR #2 合併後確認線上檔案與 main 相同、頁尾顯示 v0.2）；不等價時的說明改為指出是哪一項圈錯、哪些格子漏圈（朋友回饋）。AC1–AC19 全數通過 |
| SonarQube Cloud | repo 改 public 後會自動檢查每個 PR；PR #2 經兩輪修正後 Quality Gate 通過。規則與經過見第 5 節第 3 點 |
| GitHub repo | 已建立 `RogerH0711/K-Map-Practice`，`index.html` v0.1 已在 main；2026-10-07 在 Claude Code 重跑第 5 節全部測試通過 |
| GitHub Pages | 已上線：https://rogerh0711.github.io/K-Map-Practice/ （repo 改為 public 後啟用，從 main / root 發布）。2026-10-07 確認：線上檔案與 main 的 `index.html` 完全相同；用 Chromium 開線上網址，1280 px 與 375 px 都能正常化簡、無水平捲動、無 console error；使用者本人也已用瀏覽器開啟確認 |
| 手機實測、使用者回饋 | 本人實測無問題，iPhone 實機操作正常（AC18）；朋友回饋「不等價的解釋很奇怪」→ v0.2 |
| 截圖、繳交文字 | 2026-10-07 已用 Playwright 對線上網址截圖 4 張（多解切換與連動標示、化簡過程、練習回饋、手機版），並擬好繳交文字草稿（HTML，複製後貼進 NTU COOL）；截圖另存一份在 repo 的 `screenshots/`，README 開頭的「畫面截圖」引用。使用者已把截圖上傳到 NTU COOL 編輯器並貼上繳交文字 |

---

## 3. 規格書（v1.3，全文在 `README.md`）

規格書全文以 repo 根目錄的 `README.md` 為準，開始工作前也要讀。README 是公開頁面，修改時措辭要適合給評分者與使用者看。改功能時，同一個 PR 要同步更新 README 的功能、判分規則、驗收標準與版本紀錄，以及本檔第 6 節的迭代紀錄。

README 的結構：
1. 專案概述
2. 動機與使用情境
3. 功能 F1–F10，含判分規則與式子語法
4. 驗收標準 AC1–AC19
5. 畫面配置與操作流程
6. 技術規格
7. 不做的範圍

另有測試摘要與版本紀錄。

v1.3 相對 v1.2：只把規格改成與成品 v0.2 的實際行為一致，程式沒有改。
- AC7 項的順序
- AC12 合併表輪次的寫法
- AC4、AC15 的訊息文字
- 判分規則補上「等價但不是要求的形式」
- 補寫原本沒寫的行為：
  - 電路的閘也能觸發連動標示
  - 全形符號與重複編號的錯誤
  - 改設定就出新題、看解答後不計分
  - 最多列 64 組解

---

## 4. `index.html` 程式結構（v0.2）

全部在一個 `<script>` 裡，前半是純邏輯、後半是畫面：

| 區塊 | 主要函式 | 說明 |
| --- | --- | --- |
| 基本定義 | `kLayout`、`cellMinterm`、`literals`、`termStr`、`exprStr`、`solCost` | 版面（Gray code）、項的表示法 `{v, mask, cov}`（mask 的 bit = 1 代表 `-`） |
| 化簡 | `solve(n, vals, form)` | vals 每格 0／1／2（2 = X）；回傳 rounds、pis、ess、remaining、cand、kMin、covers、solutions。POS 的解依變數順序排序 |
| 輸入解析 | `parseMD`、`valsFromMD`、`canonicalMD` | m()/d() 的解析與正規化 |
| 練習判分 | `parseExpr`、`evalNode`、`sopCost`、`posCost`、`nodeStr`、`answerShape`、`topItems`、`diffGroups`、`judge`、`randomProblem` | `judge` 回傳 kind：syntax／wrong／form／notmin／correct；wrong 另含 `groups`（type：over 圈到不該圈的格子／under 漏圈／diff 非 SOP、POS 形式），畫面由 `groupHTML` 依 `GROUP_TEXT` 句型表轉成文字 |
| 電路 | `circuitSVG`、`gatePath`、`orBack` | 變數匯流排 + NOT + 兩層閘；第一層閘填入與 K-map 圈相同的顏色 |
| K-map 圈 | `segments`、`groupSegs`、`renderKmap` | 環繞的圈拆成多段，用 clipPath 裁切成「開口」造型 |
| 畫面 | `renderSimplify`、`renderPractice`、`stepsHTML`、`piTableHTML`、`setHL`、`bindHL` | 狀態物件 `S`（化簡）、`P`（練習）；每次狀態變動整塊重繪 |

檔尾有 `if (typeof module !== 'undefined') module.exports = {...}`，方便用 Node 直接載入邏輯做測試。

視覺方向：淡綠方格「計算紙」背景、原子筆藍墨色、圈選用螢光筆色；標題與算式用襯線斜體（課本變數的樣子）。修改 UI 時維持這個方向。

---

## 5. 測試方式

每輪修改後都要跑，結果寫進迭代紀錄。測試腳本與執行指令在 `tests/`（見 `tests/README.md`）。

1. **邏輯測試（Node）**：用 Python 把 `index.html` 的 `<script>` 內容抽出成 `km.js`，`require` 後跑（隨機測資用固定種子的 `rand()`，每次執行內容相同）：
   - AC1、AC3–AC17、AC19 的測資逐條比對（POS 比對前先去掉空白；多解時連解與項的順序一起比對）
   - 2000 組隨機錯誤答案：`groups` 必須剛好涵蓋每個不同的格子一次，且 over 類一定有指出是哪一項
   - 3000 組隨機函數（2–4 變數、含／不含 X）：每組最簡解都要與原函數等價，且把解答丟回 `judge` 必須判為 correct
   - 3 變數 300 組：以暴力窮舉所有 implicant 組合，確認 `solve` 的（項數, literal 數）就是最小值
2. **畫面測試（Playwright + Chromium）**：開 `file://.../index.html`，截圖 1280×900 桌機與 375×812 手機；檢查 `document.documentElement.scrollWidth === 375`、沒有 `pageerror` 與 console error；操作切換解、切 POS、展開化簡過程、練習模式送出錯誤答案與看解答，各截一張圖目視檢查。

v0.1、v0.2 的測試結果：上述全部通過。

已知、尚未處理的小問題（2026-10-07 重測時發現，不影響 AC）：
- 函數本身是常數（例如全 1 加 X）時，`judge` 對答案 `1`／`0` 回傳 `form` 而非 `correct`。練習模式的 `randomProblem` 不會出常數題，所以使用者碰不到。

3. **SonarQube Cloud（PR 自動檢查）**

   repo 改成 public 後，SonarQube Cloud 會自動分析每個 PR，並由 `sonarqubecloud[bot]` 留言、寄信。Quality Gate 要求 New Code 的 Security 與 Maintainability Rating 都是 A，沒過時 PR 上會有紅色的 check。它不影響網站；是否設定成「沒過就不能合併」沒有查過，原則上修到通過再合併。

   - **看明細**：SonarQube 上的專案不是公開的，匿名呼叫 API 會回「Project doesn't exist」，所以 Claude 查不到明細。要請使用者登入 SonarQube Cloud，在 PR 的 Issues 頁截圖（規則、檔案、行數）。GitHub 上的 check runs 有時也查不到最新 commit 的結果，一樣以使用者的截圖為準。
   - **它實際分析的範圍**（推測）：PR #2 的三次分析中，issue 全部出現在 `tests/*.js`，`index.html` 一個都沒有。推測它沒有把 HTML 內嵌的 JS 當成程式碼分析。
   - **「New Code」的範圍**：PR 裡改到的每一行都算新程式碼。只是把舊的一行改個名稱，那一行原本的寫法（例如巢狀三元運算子）也會被標出來。
   - **寫測試時避開**：
     - 不用 `Math.random()`，會被當成 Security 問題；改用 `tests/logic_test.js` 開頭的固定種子 `rand()`。
     - 不寫巢狀三元運算子 `a ? b : (c ? d : e)`，改抽成小函式。
     - 不留沒用到的變數。
     - 不用 `x | 0` 取整數。它會建議改成 `Math.trunc`，但兩者語意不同，要先確認再改。
     - `if (…) return x; return y;` 不要寫在同一行（`no-unenclosed-multiline-block`）。
   - **push 前在本機預查**：
     - 工具：`eslint@9` + `eslint-plugin-sonarjs` + `eslint-plugin-unicorn`。`sonarjs` 還需要 `typescript` 與 `ts-api-utils`，裝在暫存目錄即可，不要放進 repo。
     - 只看這個 PR 改到的行：`git diff -U0 origin/main`。
     - `unicorn` 規則集比 Sonar 預設的「Sonar way」嚴格很多。`.join()` 未寫分隔符號、`.length > 0`、變數縮寫這類 Sonar 沒標過的，不用處理。
   - **`index.html` 的 `randomProblem` 用 `Math.random()`**：這是出題本來就需要的。若日後被標出來，在 SonarQube 上標成 Safe，不要改掉。

---

## 6. 迭代紀錄（最新在上）

繳交時連同 GitHub commit 歷史一起附上。每輪新增一列，並同步更新頁尾版本號。

| 版本 | 日期 | 發現的問題／需求 | 給 AI 的指示 | 結果 |
| --- | --- | --- | --- | --- |
| 規格 v1.3 | 2026-10-07 | 規格書要同步到與成品一致，並放到 README.md；比對時發現 AC7 項的順序、AC12 輪次、AC4 訊息與成品不同，判分規則少了「等價但不是要求的形式」，還有幾個成品行為規格沒寫 | 以成品 v0.2 的實際行為為準改寫規格（用瀏覽器逐項確認），全文放 README.md；CLAUDE.md 第 3 節改為指向 README，避免兩份不一致；AC7 測試改為連順序一起比對 | README.md 完成；程式沒有改；邏輯與畫面測試全部通過 |
| 程式 v0.2（SonarQube 修正） | 2026-10-07 | 開 PR #2 後 SonarQube Cloud 的 Quality Gate 沒過（Security C、Maintainability B）。第 1 輪 4 個 issue 都在 `tests/logic_test.js`：沒用到的變數 `N`、`Math.random()`。修完後第 2 輪又出 3 個：`\| 0` 建議改 `Math.trunc`；`Math.random` 換成 `rand` 時改到的兩行，原本的巢狀三元運算子被算成新程式碼 | 刪掉沒用到的變數；測試改用固定種子亂數，最後改成不用位元運算的 Park–Miller，因為 `\| 0` 改 `Math.trunc` 語意不同；巢狀三元運算子抽成 `randCell()`。另外依本機 sonarjs 檢查，把 `index.html` 新增的判分說明改寫，拿掉巢狀三元運算子，行為不變 | 第 3 輪 Quality Gate 通過；測試全部通過，且隨機測資每次相同、可重現；PR #2 合併，線上確認為 v0.2 |
| 程式 v0.2／規格 v1.2 | 2026-10-07 | 朋友練習 `m(5,7,14,15)` 答 `BD + ABC`，回饋只寫「K-map 上紅框的格子算錯了；F 應為 0，你的式子卻是 1：m13」，覺得解釋很奇怪：看不出是哪一項錯、錯在哪 | 不等價時改成指出原因：哪一項包含了不該圈的格子（例如「BD 這一項包含 m13，但題目在這格是 0…這個圈圈到了 0」），哪些格子漏圈；POS 用和項說明；同原因的格子合併成一句；頁尾改 v0.2 | 新增 AC19 與 2000 組隨機錯誤答案測試；AC1–AC19、隨機與暴力窮舉測試、桌機／375 px 畫面測試全部通過 |
| 程式 v0.1 | 2026-10-07 | 依規格 v1.1 產生第一版；用 AC 測資自動測試時發現 POS 項順序是 (D')(B')，與 AC9 預期的 (B')(D') 不同；截圖檢查發現格子編號被圈遮住、切換後算式殘留半透明 | 照規格 F1–F10 實作單一 index.html；POS 和項依變數順序排列；格子編號移到圈的上層；每次重繪時清除反白狀態 | AC1–AC18 全部通過，另加 3000 組隨機函數驗證等價、300 組 3 變數暴力窮舉驗證最簡；桌機與 375 px 手機版面正常 |
| 規格 v1.1 | 2026-10-07 | 名稱要反映用途：實驗課以插麵包板為主，這個純計算工具比較接近理論課的練習 | 名稱改為 K-Map Practice；確認版面（列 AB、欄 CD）、最簡定義、補數符號 `'` | 規格書改名，其餘內容不變 |
| 規格 v1 | 2026-10-07 | 選定 K-map 化簡器為題目，需要定出範圍 | 決定：變數 2–4、練習模式用輸入式子判分、加入 m()/d() 輸入、列出所有最簡解、顯示化簡過程、畫邏輯閘電路 | 完成規格書 v1（F1–F10、AC1–AC18） |

---

## 7. 接下來要做

- [x] 建 GitHub public repo `RogerH0711/K-Map-Practice`，`index.html` 已在 main
- [x] repo 改為 public → Settings → Pages → Deploy from a branch → main / (root)；網址 `https://rogerh0711.github.io/K-Map-Practice/` 已上線
- [x] 用手機與電腦實際操作，收集想改的地方 → 第二輪修改（v0.2：不等價說明）
- [ ] 繼續收集回饋 → v0.3（若有），每輪一個 commit
- [x] 規格書同步更新到與成品一致，全文放在 `README.md`（規格 v1.3）
- [x] 本週 `.ipynb`：使用者表示只需在 NTU COOL 交文字
- [x] 截圖 4 張：多解切換／hover 標示、化簡過程、練習模式回饋、手機版
- [x] 整理 NTU COOL 繳交文字草稿：Pages 連結 + repo 連結、截圖位置、規格書、規格對照清單（F1 ✅…）、迭代紀錄
- [ ] 使用者填入學號、姓名，插入截圖，送出
- [ ] 交之前用無痕視窗與手機行動網路各開一次連結；建議 10/18 前送出
