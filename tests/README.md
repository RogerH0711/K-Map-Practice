# 測試

```bash
# 邏輯測試（AC1、AC3–AC17、3000 組隨機函數、300 組 3 變數暴力窮舉）
python3 tests/extract.py index.html /tmp/km.js
node tests/logic_test.js /tmp/km.js

# 畫面測試（Playwright + Chromium；1280×900 與 375×812，截圖存到 SHOT_DIR）
PLAYWRIGHT_MODULE=$(npm root -g)/playwright SHOT_DIR=/tmp/shots node tests/ui_test.js
```
