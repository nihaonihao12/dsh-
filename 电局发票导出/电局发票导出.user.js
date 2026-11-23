// ==UserScript==
// @name         陕电局·发票查询导出
// @namespace    local.sn.tax.invoice
// @version      3.3.0
// @description  多税号批量：切户→主页搜索全量发票查询→查询→导出全部，双层控制面板，失败自动重跑，日志写 xlsx
// @match        https://etax.shaanxi.chinatax.gov.cn/*
// @match        https://tpass.shaanxi.chinatax.gov.cn:8443/*
// @match        https://dppt.shaanxi.chinatax.gov.cn:8443/*
// @match        https://znhd.shaanxi.chinatax.gov.cn:8443/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_download
// @grant        GM_addStyle
// @run-at       document-idle
// @require      https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js
// ==/UserScript==

(function () {
  'use strict';

  /* ====================================================================
   * 常量与页面识别
   * ================================================================== */
  const HOME_URL = 'https://etax.shaanxi.chinatax.gov.cn/loginb/';
  const SWITCH_URL = 'https://tpass.shaanxi.chinatax.gov.cn:8443/#/identitySwitch/agent';
  const LOG_SUBDIR_DEFAULT = '发票导出';
  const SWITCH_THROTTLE_MS = 15000;
  const QUERY_CLICK_COUNT = 3;
  const NO_INVOICE_WAIT_MS = 20000;
  const PRE_CHECK_DELAY_MS = 700;
  const MAX_RERUN_ROUNDS = 20;
  const STEP_NAMES = [
    '0-未开始',
    '1-打开切户页',
    '2-切户输入税号',
    '3-切户查询',
    '4-切户进入',
    '5-切户确定',
    '6-返回主页',
    '7-主页搜索',
    '8-点击搜索结果',
    '9-点击卡片全量发票查询',
    '10-填写查询条件',
    '11-点击查询',
    '12-等待查询结果',
    '13-点击导出',
    '14-点击导出全部',
    '15-完成并写日志',
  ];

  const KEY_CFG = 'sn_inv_cfg';
  const KEY_JOB = 'sn_inv_job';

  const isHome = () => location.hostname === 'etax.shaanxi.chinatax.gov.cn' && location.pathname.startsWith('/loginb');
  const isSwitch = () => location.hostname === 'tpass.shaanxi.chinatax.gov.cn' && location.href.includes('identitySwitch');
  const isCard = () => !!document.querySelector('.g-card-menu-item__title');
  const isQueryPage = () => !!document.querySelector('.filter-btns')
    && !!document.querySelector('form.t-form')
    && !!document.querySelector('input[placeholder="开票日期起"]');

  /* ====================================================================
   * 全局停止信号
   * ================================================================== */
  let killFlag = false;

  function isKilled() {
    if (killFlag) return true;
    try {
      const j = getJob();
      if (j.stopped || !j.running) { killFlag = true; return true; }
    } catch (e) { /* ignore */ }
    return false;
  }

  async function isleep(ms) {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) {
      if (isKilled()) return false;
      await new Promise((r) => setTimeout(r, Math.min(100, ms)));
    }
    return !isKilled();
  }

  /* ====================================================================
   * 工具函数
   * ================================================================== */
  const nowStamp = (d) => {
    d = d || new Date();
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
  };

  const pad2 = (n) => String(n).padStart(2, '0');

  const hm = (d) => {
    d = d || new Date();
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  };

  function parseRange(text) {
    const s = String(text || '').trim().replace(/\s+/g, '');
    const m = s.match(/^(\d{4})[.\-/年](\d{1,2})[.\-/月](\d{1,2})日?\s*[-~—至到]\s*(\d{4})[.\-/年](\d{1,2})[.\-/月](\d{1,2})日?$/);
    if (!m) return null;
    const [, y1, mo1, d1, y2, mo2, d2] = m;
    const a = `${y1}-${pad2(+mo1)}-${pad2(+d1)}`;
    const b = `${y2}-${pad2(+mo2)}-${pad2(+d2)}`;
    const ok = (v, y, mo, d) => {
      const dt = new Date(+y, +mo - 1, +d);
      return dt.getFullYear() === +y && dt.getMonth() === +mo - 1 && dt.getDate() === +d;
    };
    if (!ok(a, +y1, +mo1, +d1) || !ok(b, +y2, +mo2, +d2)) return null;
    return { start: a, end: b };
  }

  function isValidRange(text) { return !!parseRange(text); }

  function parseTaxIds(text) {
    return Array.from(new Set(String(text || '')
      .replace(/[，；;、\s]+/g, ',')
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter((s) => s.length >= 15)));
  }

  function textMatch(el, kw) { return (el.textContent || '').replace(/\s+/g, '').includes(kw); }
  function visible(el) {
    if (!el) return false;
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || s.opacity === '0') return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }
  function qsa(root, sel) { return Array.from((root || document).querySelectorAll(sel)); }

  function clickEl(el) {
    if (!el) return false;
    try {
      el.scrollIntoView({ block: 'center', inline: 'center' });
    } catch (e) {}
    try {
      ['mouseover', 'mousedown', 'mouseup'].forEach((t) => {
        el.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true }));
      });
    } catch (e) {
      console.warn('[clickEl] 事件派发失败，直接 click', e);
    }
    try {
      el.click();
    } catch (e) {
      console.error('[clickEl] click 失败', e);
    }
    return true;
  }

  function hardClick(el) {
    if (!el) return false;
    try { el.scrollIntoView({ block: 'center', inline: 'center' }); } catch (e) {}
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const opts = { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0 };
    try {
      el.dispatchEvent(new PointerEvent('pointerdown', opts));
      el.dispatchEvent(new MouseEvent('mousedown', opts));
      el.dispatchEvent(new PointerEvent('pointerup', opts));
      el.dispatchEvent(new MouseEvent('mouseup', opts));
      el.dispatchEvent(new MouseEvent('click', opts));
    } catch (e) {
      console.warn('[hardClick] 事件派发失败', e);
    }
    try { el.click(); } catch (e) {}
    return true;
  }

  function setNativeValue(el, value) {
    const proto = Object.getPrototypeOf(el);
    const desc = Object.getOwnPropertyDescriptor(proto, 'value');
    if (desc && desc.set) desc.set.call(el, value); else el.value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'Enter' }));
    el.dispatchEvent(new Event('blur', { bubbles: true }));
  }

  async function waitFor(fn, timeout = 20000, interval = 300) {
    if (isKilled()) return null;
    if (!(await isleep(PRE_CHECK_DELAY_MS))) return null;

    const t0 = Date.now();
    while (Date.now() - t0 < timeout) {
      if (isKilled()) return null;
      try { const v = fn(); if (v) return v; } catch (e) { /* ignore */ }
      await new Promise((r) => setTimeout(r, interval));
    }
    return null;
  }

  function snapshotPageText() {
    let raw = '';
    const resBox = document.querySelector('.t-table__content')
      || document.querySelector('.invoiceQuery__table')
      || document.querySelector('.t-table');
    const statBox = document.querySelector('.statistics-infobox');
    if (resBox) {
      raw = (statBox ? statBox.innerText + '\n' : '') + (resBox.innerText || '');
    } else {
      raw = document.body ? document.body.innerText : '';
    }
    if (panel) {
      raw = raw.split(panel.innerText).join('');
    }
    raw = raw.replace(/\u00a0/g, ' ');
    return raw;
  }

  function readStatSummary() {
    const box = document.querySelector('.statistics-infobox') || document.querySelector('.statistics-info');
    if (!box) return { found: false, amountText: '', taxText: '', hasInvoice: false };

    const txt = (box.innerText || box.textContent || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ');
    const hasInvoice = /查询结果[：:]\s*合计金额/.test(txt);
    if (!hasInvoice) return { found: true, amountText: '', taxText: '', hasInvoice: false };

    const nums = qsa(box, '.info-number').map((e) => (e.textContent || '').trim());
    return { found: true, amountText: nums[0] || '', taxText: nums[1] || '', hasInvoice: true };
  }

  /* ====================================================================
   * 配置 / 任务状态
   * ================================================================== */
  const defaultCfg = () => ({
    dateRange: '',
    taxText: '',
    invType: '开具发票',
    logDir: LOG_SUBDIR_DEFAULT,
    stopOnError: false,
    closeWaitMs: 3000,
    queryWaitMs: 2000,
    panelPos: { left: 12, top: 12 },
    opacity: 1,
    layer2Open: false,
    layer2Tab: 'run',
    minimized: false,
  });
  const defaultJob = () => ({
    running: false,
    stopped: false,
    list: [],
    index: 0,
    step: 0,
    runStartedAt: '',
    logFileName: '',
    failedAt: '',
    rows: [],
    total: 0,
    stopTs: 0,
    exporting: false,
    exportTs: 0,
    switchedTaxId: '',
    switchReqTs: 0,
    rerunRound: 0,
    failedQueue: [],
  });

  const getCfg = () => Object.assign(defaultCfg(), GM_getValue(KEY_CFG, {}) || {});
  const setCfg = (c) => GM_setValue(KEY_CFG, c);
  const getJob = () => Object.assign(defaultJob(), GM_getValue(KEY_JOB, {}) || {});
  const setJob = (j) => GM_setValue(KEY_JOB, j);

  /* ====================================================================
   * 日志 xlsx（新增“失败快照”列）
   * ================================================================== */
  function buildXlsxBlob(rows, job) {
    const header = ['序号', '总户数', '税号', '发票类型', '状态', '情况记录', '合计金额', '合计税额',
      '开始时间', '完成时间', '耗时(秒)', '失败步骤', '失败URL', '错误摘要', '失败时页面快照', '页面文字快照'];
    const aoa = [header];
    rows.forEach((r) => aoa.push([
      r.no, job.total || '', r.taxId, r.type, r.status, r.history || '',
      r.amount || '', r.taxAmount || '',
      r.startAt, r.endAt, r.cost,
      r.failStep || '', r.failUrl || '', (r.error || '').slice(0, 500),
      r.failSnapshot || '', r.pageText || '',
    ]));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws['!cols'] = [{ wch: 6 }, { wch: 8 }, { wch: 24 }, { wch: 12 }, { wch: 16 }, { wch: 26 },
      { wch: 16 }, { wch: 14 }, { wch: 20 }, { wch: 20 }, { wch: 10 },
      { wch: 18 }, { wch: 40 }, { wch: 60 }, { wch: 100 }, { wch: 100 }];
    XLSX.utils.book_append_sheet(wb, ws, '导出日志');
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  function cleanDir(dir) {
    return String(dir || LOG_SUBDIR_DEFAULT).replace(/^\/+|\/+$/g, '').replace(/\\/g, '/') || LOG_SUBDIR_DEFAULT;
  }

  let lastSaveAt = 0;
  function saveLog(cfg, job) {
    if (!job.logFileName) return;
    const now = Date.now();
    if (now - lastSaveAt < 5000) return;
    lastSaveAt = now;
    try {
      const blob = buildXlsxBlob(job.rows, job);
      const url = URL.createObjectURL(blob);
      const name = `${cleanDir(cfg.logDir)}/${job.logFileName}`;
      GM_download({
        url, name, saveAs: false, conflictAction: 'overwrite',
        onerror: () => {
          const a = document.createElement('a');
          a.href = url; a.download = job.logFileName;
          document.body.appendChild(a); a.click(); a.remove();
        },
      });
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (e) {
      console.error('[日志] 保存异常', e);
    }
  }

  function closeThisTabOrGoHome() {
    if (isHome()) return;
    try { window.close(); } catch (e) { /* ignore */ }
    setTimeout(() => {
      if (!isHome()) {
        try { location.href = HOME_URL; } catch (e) { /* ignore */ }
      }
    }, 800);
  }

  /* ====================================================================
   * 下载检测
   * ================================================================== */
  const dlFlag = { armed: false, hit: 0, ts: 0 };

  function armDownloadDetect() {
    dlFlag.armed = true;
    dlFlag.hit = 0;
    dlFlag.ts = 0;
  }

  function markDownloadHit(reason) {
    if (!dlFlag.armed) return;
    dlFlag.armed = false;
    dlFlag.hit++;
    dlFlag.ts = Date.now();
    try { console.log('[下载] 检测到下载触发：' + reason); } catch (e) {}
  }

  (function installDownloadDetect() {
    const origClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function () {
      try {
        if (dlFlag.armed && this.hasAttribute('download')) markDownloadHit('a[download] click');
      } catch (e) { /* ignore */ }
      return origClick.apply(this, arguments);
    };

    document.addEventListener('click', (e) => {
      try {
        const a = e.target && e.target.closest ? e.target.closest('a[download]') : null;
        if (a && dlFlag.armed) markDownloadHit('a[download] event');
      } catch (err) { /* ignore */ }
    }, true);

    const origOpen = window.open;
    window.open = function (url) {
      try {
        if (dlFlag.armed && url && /\.(xlsx?|zip|csv|pdf)(\?|$)/i.test(String(url))) {
          markDownloadHit('window.open 下载链接');
        }
      } catch (e) { /* ignore */ }
      return origOpen.apply(this, arguments);
    };

    const origSubmit = HTMLFormElement.prototype.submit;
    HTMLFormElement.prototype.submit = function () {
      try {
        if (dlFlag.armed) {
          const action = this.getAttribute('action') || '';
          if (/export|download/i.test(action)) markDownloadHit('form submit');
        }
      } catch (e) { /* ignore */ }
      return origSubmit.apply(this, arguments);
    };
  })();

  /* ====================================================================
   * 切户页
   * ================================================================== */
  async function doSwitchPage(cfg, job, taxId) {
    const input = await waitFor(() => document.querySelector('input[placeholder="请输入统一社会信用代码"]'), 30000);
    if (isKilled()) return { ok: false, killed: true };
    if (!input) return { ok: false, step: 2, error: '未找到统一社会信用代码输入框' };
    setNativeValue(input, taxId);
    if (!(await isleep(400))) return { ok: false, killed: true };

    const qBtn = await waitFor(() => qsa(document, 'button.el-button--primary').find((b) => textMatch(b, '查询')), 12000);
    if (isKilled()) return { ok: false, killed: true };
    if (!qBtn) return { ok: false, step: 3, error: '未找到查询按钮' };
    clickEl(qBtn);

    const row = await waitFor(() => {
      const rows = qsa(document, '.el-table__row');
      return rows.find((tr) => (tr.textContent || '').toUpperCase().includes(taxId.toUpperCase()));
    }, 25000);
    if (isKilled()) return { ok: false, killed: true };
    if (!row) return { ok: false, step: 4, error: `查询结果中未找到税号 ${taxId}（共 ${qsa(document, '.el-table__row').length} 行）` };

    const enterBtn = qsa(row, 'button').find((b) => textMatch(b, '进入'));
    if (!enterBtn) return { ok: false, step: 4, error: '结果行中未找到“进入”按钮' };
    clickEl(enterBtn);

    const dlgBtn = await waitFor(() => {
      const box = document.querySelector('.el-message-box__wrapper');
      if (!box || !visible(box)) return null;
      return qsa(box, 'button').find((b) => textMatch(b, '确定'));
    }, 20000);
    if (isKilled()) return { ok: false, killed: true };
    if (!dlgBtn) return { ok: false, step: 5, error: '未出现身份切换确认弹窗或未找到“确定”' };
    if (!(await isleep(300))) return { ok: false, killed: true };
    clickEl(dlgBtn);

    const j2 = getJob();
    j2.switchedTaxId = taxId;
    j2.step = 6;
    j2.switchReqTs = Date.now();
    setJob(j2);

    if (!(await isleep(4000))) return { ok: false, killed: true };

    if (!isHome()) {
      location.href = HOME_URL;
    }
    return { ok: true };
  }

  /* ====================================================================
   * 主页搜索
   * ================================================================== */
  async function typeInto(el, text) {
    el.focus();
    if (!(await isleep(200))) return false;
    el.value = '';
    el.dispatchEvent(new Event('input', { bubbles: true }));
    if (!(await isleep(100))) return false;
    for (const ch of text) {
      if (isKilled()) return false;
      el.dispatchEvent(new KeyboardEvent('keydown', { key: ch, bubbles: true }));
      const desc = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value');
      if (desc && desc.set) desc.set.call(el, el.value + ch); else el.value += ch;
      el.dispatchEvent(new InputEvent('input', { bubbles: true, data: ch, inputType: 'insertText' }));
      el.dispatchEvent(new KeyboardEvent('keyup', { key: ch, bubbles: true }));
      if (!(await isleep(120))) return false;
    }
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  async function doHomeSearch() {
    const input = await waitFor(() => document.querySelector('input[placeholder="请输入关键词"]'), 30000);
    if (isKilled()) return { ok: false, killed: true };
    if (!input) return { ok: false, step: 7, error: '未找到主页搜索框' };

    input.click();
    if (!(await isleep(300))) return { ok: false, killed: true };
    const typed = await typeInto(input, '全量发票查询');
    if (!typed || isKilled()) return { ok: false, killed: true };

    const item = await waitFor(() => {
      const items = qsa(document, '#popDiv .listItem, #popDiv > div, .popMain1 .listItem');
      const hit = items.find((i) => textMatch(i, '全量发票查询') && visible(i));
      if (hit) return hit;
      const pop = document.querySelector('#popDiv');
      if (pop && visible(pop) && textMatch(pop, '全量发票查询')) return pop;
      return null;
    }, 25000);

    if (isKilled()) return { ok: false, killed: true };
    if (!item) return { ok: false, step: 8, error: '输入后未弹出“全量发票查询”搜索下拉' };
    if (!(await isleep(300))) return { ok: false, killed: true };
    clickEl(item);
    return { ok: true };
  }

  /* ====================================================================
   * 卡片页 → 全量发票查询
   * ================================================================== */
  async function doClickCard() {
    const title = await waitFor(() => {
      const titles = qsa(document, '.g-card-menu-item__title').filter((t) => textMatch(t, '全量发票查询'));
      return titles.length ? titles[0] : null;
    }, 60000);
    if (isKilled()) return { ok: false, killed: true };
    if (!title) {
      return { ok: false, step: 9, error: `未找到“全量发票查询”卡片（页面卡片数：${qsa(document, '.g-card-menu-item__title').length}）` };
    }

    const targets = [
      title.closest('.g-card-menu-item__content'),
      title.closest('.g-card-menu-item'),
      title,
    ].filter(Boolean);

    for (const target of targets) {
      if (isKilled()) return { ok: false, killed: true };
      hardClick(target);
      const ok = await waitFor(() => isQueryPage(), 10000);
      if (isKilled()) return { ok: false, killed: true };
      if (ok) return { ok: true };
      if (!(await isleep(500))) return { ok: false, killed: true };
    }

    return { ok: false, step: 9, error: '已尝试点击卡片（内容区/容器/标题），均未进入全量发票查询页' };
  }

  /* ====================================================================
   * 全量发票查询页
   * ================================================================== */
  function findFormItemContainer(labelText) {
    const items = qsa(document, '.t-form__item');
    for (const it of items) {
      const lab = it.querySelector('.t-form__label');
      if (lab && textMatch(lab, labelText)) return it;
    }
    return null;
  }

  async function setQueryType(type) {
    const item = await waitFor(() => findFormItemContainer('查询类型'), 25000);
    if (isKilled()) return { ok: false, killed: true };
    if (!item) return { ok: false, step: 10, error: '未找到“查询类型”表单项' };
    const input = item.querySelector('input.t-input__inner');
    if (!input) return { ok: false, step: 10, error: '未找到“查询类型”输入框' };
    if ((input.value || '').trim() === type) return { ok: true };

    clickEl(input.closest('.t-input') || input);
    const opt = await waitFor(() => {
      const list = qsa(document, '.t-select__dropdown, .t-popup, .t-select__list');
      for (const box of list) {
        if (!visible(box)) continue;
        const o = qsa(box, 'li, .t-select-option').find((x) => textMatch(x, type));
        if (o) return o;
      }
      return null;
    }, 12000);

    if (isKilled()) return { ok: false, killed: true };

    if (!opt) {
      setNativeValue(input, type);
      if (!(await isleep(500))) return { ok: false, killed: true };
      return { ok: false, step: 10, error: `下拉项“${type}”不可点击，已尝试直接赋值` };
    }
    clickEl(opt);
    if (!(await isleep(500))) return { ok: false, killed: true };

    const now = (item.querySelector('input.t-input__inner') || {}).value || '';
    if (now.trim() !== type) return { ok: false, step: 10, error: `查询类型未切换成功（当前为“${now}”）` };
    return { ok: true };
  }

  async function typeIntoAndEnter(el, text) {
    el.focus();
    if (!(await isleep(150))) return false;
    try { el.select(); } catch (e) {}
    if (!(await isleep(50))) return false;
    setNativeValue(el, '');
    if (!(await isleep(100))) return false;

    for (const ch of text) {
      if (isKilled()) return false;
      el.dispatchEvent(new KeyboardEvent('keydown', { key: ch, bubbles: true }));
      const desc = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value');
      if (desc && desc.set) desc.set.call(el, el.value + ch); else el.value += ch;
      el.dispatchEvent(new InputEvent('input', { bubbles: true, data: ch, inputType: 'insertText' }));
      el.dispatchEvent(new KeyboardEvent('keyup', { key: ch, bubbles: true }));
      if (!(await isleep(60))) return false;
    }

    el.dispatchEvent(new Event('change', { bubbles: true }));
    if (!(await isleep(150))) return false;

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
    el.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
    if (!(await isleep(100))) return false;
    el.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
    if (!(await isleep(200))) return false;
    return true;
  }

  async function setDate(placeholderKw, dateStr) {
    const input = await waitFor(() =>
      qsa(document, 'input.t-input__inner').find((i) => (i.placeholder || '').includes(placeholderKw)), 25000);
    if (isKilled()) return { ok: false, killed: true };
    if (!input) return { ok: false, step: 10, error: `未找到日期输入框（${placeholderKw}）` };

    const picker = input.closest('.t-date-picker');
    clickEl(input.closest('.t-input') || input);
    if (!(await isleep(500))) return { ok: false, killed: true };

    const editable = picker && qsa(picker, 'input:not([readonly])').find((i) => visible(i));
    const target = editable || input;

    const readVal = () => (qsa(document, 'input.t-input__inner').find((x) => (x.placeholder || '').includes(placeholderKw)) || {}).value || '';

    if (!editable) {
      for (let i = 0; i < 3; i++) {
        if (isKilled()) return { ok: false, killed: true };
        const okType = await typeIntoAndEnter(target, dateStr);
        if (!okType) return { ok: false, killed: true };
        if (readVal().trim() === dateStr) {
          document.body.click();
          if (!(await isleep(300))) return { ok: false, killed: true };
          return { ok: true };
        }
        if (!(await isleep(300))) return { ok: false, killed: true };
      }
      return { ok: false, step: 10, error: `日期写入失败（${placeholderKw}，无可编辑输入框，当前值“${readVal()}”）` };
    }

    for (let attempt = 0; attempt < 3; attempt++) {
      if (isKilled()) return { ok: false, killed: true };
      const okType = await typeIntoAndEnter(editable, dateStr);
      if (!okType) return { ok: false, killed: true };
      try { document.body.click(); } catch (e) {}
      if (!(await isleep(400))) return { ok: false, killed: true };
      if (readVal().trim() === dateStr) return { ok: true };
      clickEl(input.closest('.t-input') || input);
      if (!(await isleep(500))) return { ok: false, killed: true };
    }

    return { ok: false, step: 10, error: `日期确认失败（${placeholderKw}，当前值“${readVal()}”，已重试 3 次）` };
  }

  function findQueryButton() {
    const form = document.querySelector('form.t-form');
    if (!form) return null;
    return qsa(form, 'button[type="submit"], button').find((b) => textMatch(b, '查询') && !textMatch(b, '重置'));
  }

  async function doQueryClickThreeTimes(cfg) {
    const gap = Math.max(500, Number(cfg.queryWaitMs) || 2000);
    for (let i = 1; i <= QUERY_CLICK_COUNT; i++) {
      if (isKilled()) return { ok: false, killed: true };
      const btn = findQueryButton();
      if (!btn) return { ok: false, step: 11, error: '未找到“查询”按钮' };
      clickEl(btn);
      try { console.log(`[查询] 第 ${i}/${QUERY_CLICK_COUNT} 次点击`); } catch (e) {}
      if (i < QUERY_CLICK_COUNT) {
        if (!(await isleep(gap))) return { ok: false, killed: true };
      }
    }
    return { ok: true };
  }

  async function doExport() {
    const btn = await waitFor(() => {
      const box = document.querySelector('.button__export');
      if (!box) return null;
      return qsa(box, 'button').find((b) => textMatch(b.querySelector('.t-button__text') || b, '导出'));
    }, 20000);
    if (isKilled()) return { ok: false, killed: true };
    if (!btn) return { ok: false, step: 13, error: '未找到“导出”按钮' };

    hardClick(btn);
    if (!(await isleep(500))) return { ok: false, killed: true };

    let item = await waitFor(() => {
      const items = qsa(document, '.t-dropdown__item-text, .t-dropdown__item');
      const hit = items.find((i) => textMatch(i, '导出全部') && visible(i));
      return hit ? (hit.closest('.t-dropdown__item') || hit) : null;
    }, 8000);

    if (isKilled()) return { ok: false, killed: true };

    if (!item) {
      const arrow = btn.querySelector('svg.t-icon-chevron-down, .t-button__suffix, span[class*="chevron"]');
      hardClick(arrow || btn);
      if (!(await isleep(800))) return { ok: false, killed: true };

      item = await waitFor(() => {
        const items = qsa(document, '.t-dropdown__item-text, .t-dropdown__item');
        const hit = items.find((i) => textMatch(i, '导出全部') && visible(i));
        return hit ? (hit.closest('.t-dropdown__item') || hit) : null;
      }, 12000);
    }

    if (isKilled()) return { ok: false, killed: true };

    if (!item) {
      const allItems = qsa(document, '.t-dropdown__item-text, .t-dropdown__item').map((x) => (x.textContent || '').trim());
      return { ok: false, step: 14, error: `未找到“导出全部”下拉项（当前下拉项文字：${allItems.join('/') || '无'}）` };
    }

    if (!(await isleep(300))) return { ok: false, killed: true };
    hardClick(item);
    return { ok: true };
  }

  /* ====================================================================
   * 任务调度（含失败重跑 + 情况记录 + 失败快照清除）
   * ================================================================== */

  function finishOne(cfg, job, taxId, status, extra) {
    const startAt = job.curStartAt || '';
    const endAt = new Date();
    const cost = startAt ? Math.round((endAt - new Date(startAt)) / 1000) : '';
    const isFail = (status || '').indexOf('失败') === 0;

    const row = Object.assign({
      no: job.rows.length + 1,
      taxId,
      type: cfg.invType,
      status,
      startAt,
      endAt: `${endAt.getFullYear()}-${pad2(endAt.getMonth() + 1)}-${pad2(endAt.getDate())} ${pad2(endAt.getHours())}:${pad2(endAt.getMinutes())}:${pad2(endAt.getSeconds())}`,
      cost: cost === '' ? '' : `${cost}`,
      amount: '',
      taxAmount: '',
      failStep: '',
      failUrl: '',
      error: '',
      pageText: '',
      failSnapshot: '',
      history: '',
    }, extra || {});

    row.history = `${isFail ? '失败' : '成功'} ${hm(endAt)}`;

    job.rows.push(row);
    job.total = job.list.length;

    if (isFail) {
      row.failSnapshot = row.pageText || snapshotPageText();
    }
  }

  function isTaxDone(job, taxId) {
    return job.rows.some((r) => r.taxId === taxId && (r.status === '有票-已导出' || r.status === '无票'));
  }

  function clearFailSnapshotsOfTax(job, taxId) {
    job.rows.forEach((r) => {
      if (r.taxId !== taxId) return;
      if ((r.status || '').indexOf('失败') === 0) {
        r.failSnapshot = '';
        r.pageText = '';
      }
    });
  }

  function settleRound(cfg, job) {
    const failedIds = [];
    job.list.forEach((id) => {
      if (!isTaxDone(job, id)) failedIds.push(id);
    });

    job.total = job.list.length;
    setJob(job);
    saveLog(cfg, job);

    if (!failedIds.length) {
      job.running = false;
      job.step = 15;
      job.failedQueue = [];
      job.rerunRound = 0;
      setJob(job);
      saveLog(cfg, job);
      return { finished: true, failedIds: [] };
    }

    if (job.rerunRound >= MAX_RERUN_ROUNDS) {
      job.running = false;
      job.step = 15;
      setJob(job);
      saveLog(cfg, job);
      return { finished: true, failedIds };
    }

    job.rerunRound = (job.rerunRound || 0) + 1;
    job.failedQueue = failedIds.slice();
    job.list = failedIds.slice();
    job.index = 0;
    job.step = 0;
    job.curStartAt = '';
    job.exporting = false;
    job.exportTs = 0;
    job.switchedTaxId = '';
    job.switchReqTs = 0;
    setJob(job);
    saveLog(cfg, job);

    return { finished: false, failedIds };
  }

  async function tick() {
    if (isKilled()) return;
    const cfg = getCfg();
    const job = getJob();
    if (!job.running || job.stopped) return;

    if (job.index >= job.list.length) {
      const r = settleRound(cfg, job);
      if (r.finished) {
        renderBar();
        renderPanel();
        return;
      }
      if (!(await isleep(1500))) return;
      location.href = HOME_URL;
      return;
    }

    const taxId = job.list[job.index];

    if (isTaxDone(job, taxId)) {
      job.index++;
      job.step = 0;
      job.curStartAt = '';
      job.exporting = false;
      job.exportTs = 0;
      job.switchedTaxId = '';
      job.switchReqTs = 0;
      setJob(job);
      if (!(await isleep(800))) return;
      location.href = HOME_URL;
      return;
    }

    if (isSwitch()) {
      job.step = 2; setJob(job);
      if (!job.curStartAt) { job.curStartAt = new Date().toISOString(); setJob(job); }
      const r = await doSwitchPage(cfg, job, taxId);
      if (r && r.killed) return;
      if (!r.ok) return onRoundFail(cfg, job, taxId, r);
      return;
    }

    if (isHome()) {
      if (job.switchedTaxId !== taxId) {
        const now = Date.now();
        if (now - (job.switchReqTs || 0) < SWITCH_THROTTLE_MS) return;
        job.switchReqTs = now;
        setJob(job);
        location.href = SWITCH_URL;
        return;
      }

      if (job.step < 7) { job.step = 7; setJob(job); }

      if (job.step === 7) {
        const r = await doHomeSearch();
        if (r && r.killed) return;
        if (!r.ok) return onRoundFail(cfg, job, taxId, r);
        job.step = 8; setJob(job);
      }
      return;
    }

    if (isCard()) {
      job.step = 9; setJob(job);
      const r = await doClickCard();
      if (r && r.killed) return;
      if (!r.ok) return onRoundFail(cfg, job, taxId, r);
      return;
    }

    if (isQueryPage()) {
      await runQueryPage(cfg, job, taxId);
      return;
    }

    if (location.hostname === 'dppt.shaanxi.chinatax.gov.cn') {
      await isleep(1500);
      return;
    }
  }

  async function runQueryPage(cfg, job, taxId) {
    const range = parseRange(cfg.dateRange);
    if (!range) return onRoundFail(cfg, job, taxId, { step: 10, error: '日期范围格式错误' });
    const startD = range.start;
    const endD = range.end;

    const fresh = getJob();
    if (fresh.exporting && (Date.now() - fresh.exportTs) < 5 * 60 * 1000) return;
    if (fresh.step >= 10 && fresh.step < 15) return;

    fresh.exporting = true;
    fresh.exportTs = Date.now();
    fresh.step = 10;
    setJob(fresh);

    job.step = 10; setJob(job);
    let r = await setQueryType(cfg.invType);
    if (r && r.killed) return;
    if (!r.ok) return onRoundFail(cfg, job, taxId, r);

    r = await setDate('开票日期起', startD);
    if (r && r.killed) return;
    if (!r.ok) return onRoundFail(cfg, job, taxId, r);

    r = await setDate('开票日期止', endD);
    if (r && r.killed) return;
    if (!r.ok) return onRoundFail(cfg, job, taxId, r);

    job.step = 11; setJob(job);
    r = await doQueryClickThreeTimes(cfg);
    if (r && r.killed) return;
    if (!r.ok) return onRoundFail(cfg, job, taxId, r);

    job.step = 12; setJob(job);
    if (!(await isleep(1500))) return;

    let stat = null;
    const statT0 = Date.now();
    let stableSince = 0;
    let lastSig = '';

    while (!isKilled() && (Date.now() - statT0) < NO_INVOICE_WAIT_MS) {
      const s = readStatSummary();
      if (s.found && s.hasInvoice) { stat = s; break; }

      const tableBox = document.querySelector('.invoiceQuery__table')
        || document.querySelector('.t-table__content')
        || document.querySelector('.t-table');
      const rendered = !!tableBox;
      const sig = rendered ? String((tableBox.innerText || '').length) : 'none';

      if (rendered && sig === lastSig) {
        if (!stableSince) stableSince = Date.now();
        if (Date.now() - stableSince >= 1500) break;
      } else {
        stableSince = 0;
        lastSig = sig;
      }

      await new Promise((res) => setTimeout(res, 250));
    }
    if (isKilled()) return;

    const pageText = snapshotPageText();

    if (!stat) {
      finishOne(cfg, job, taxId, '无票', { amount: '', taxAmount: '', pageText });
      clearFailSnapshotsOfTax(job, taxId);
      await gotoNextTax(cfg, job);
      return;
    }

    job.step = 13; setJob(job);
    armDownloadDetect();
    r = await doExport();
    if (r && r.killed) return;
    if (!r.ok) return onRoundFail(cfg, job, taxId, r);

    const hit = await waitFor(() => dlFlag.hit > 0, 90000);
    if (isKilled()) return;
    if (!hit) {
      return onRoundFail(cfg, job, taxId, {
        step: 14,
        error: '点击“导出全部”后 90 秒内未检测到下载触发',
        pageText,
      });
    }

    const waitMs = Number(cfg.closeWaitMs) || 3000;
    if (!(await isleep(waitMs))) return;

    job.step = 15; setJob(job);
    finishOne(cfg, job, taxId, '有票-已导出', {
      amount: stat.amountText,
      taxAmount: stat.taxText,
      pageText,
    });

    clearFailSnapshotsOfTax(job, taxId);

    await gotoNextTax(cfg, job);
  }

  async function gotoNextTax(cfg, job) {
    job.index++;
    job.step = 0;
    job.curStartAt = '';
    job.exporting = false;
    job.exportTs = 0;
    job.switchedTaxId = '';
    job.switchReqTs = 0;
    setJob(job);
    saveLog(cfg, job);
    if (!(await isleep(1500))) return;
    closeThisTabOrGoHome();
  }

  async function onRoundFail(cfg, job, taxId, r) {
    job.exporting = false;
    job.exportTs = 0;
    job.failedAt = STEP_NAMES[r.step] || `步骤${r.step}`;
    job.step = r.step;
    setJob(job);

    const pageText = r.pageText || snapshotPageText();

    if (cfg.stopOnError) {
      job.running = false;
      job.stopped = true;
      job.stopTs = Date.now();
      job.switchedTaxId = '';
      job.switchReqTs = 0;
      finishOne(cfg, job, taxId, '失败-已停止', {
        failStep: job.failedAt,
        failUrl: location.href,
        error: r.error || '',
        pageText,
      });
      setJob(job);
      saveLog(cfg, job);
      return;
    }

    finishOne(cfg, job, taxId, '失败', {
      failStep: job.failedAt,
      failUrl: location.href,
      error: r.error || '',
      pageText,
    });

    await gotoNextTax(cfg, job);
  }

  /* ====================================================================
   * 控制面板（两层）
   * ================================================================== */
  const CSS = `
  #snInvWrap{font:13px/1.5 "Microsoft YaHei",sans-serif;color:#222}
  #snInvBar{position:fixed;display:flex;align-items:center;gap:8px;height:44px;padding:0 10px;
    background:#fff;border:1px solid #d0d5dd;border-radius:22px;box-shadow:0 4px 16px rgba(0,0,0,.14);
    cursor:move;user-select:none;white-space:nowrap;z-index:2147483000}
  #snInvBar .btnIcon{width:26px;height:26px;border:0;background:transparent;padding:0;
    display:flex;align-items:center;justify-content:center;cursor:pointer;flex:none}
  #snInvBar .btnIcon svg{display:block}
  #snInvBar .title{font-weight:600;font-size:14px;color:#1f2937}
  #snInvBar .cnt{font-weight:700;font-size:14px;color:#1677ff}
  #snInvBar .stepTxt{font-size:12px;color:#666;margin-left:2px}
  #snInvBar .spacer{flex:1}
  #snInvBar .btnTiny{width:22px;height:22px;border:1px solid #d0d5dd;border-radius:6px;background:#fff;
    cursor:pointer;line-height:1;padding:0;color:#666;flex:none}
  #snInvBar .btnTiny:hover{color:#1677ff;border-color:#1677ff}
  #snInvSpinner{width:14px;height:14px;border:2px solid #cfe3ff;border-top-color:#1677ff;
    border-radius:50%;animation:snInvSpin .8s linear infinite;flex:none}
  @keyframes snInvSpin{to{transform:rotate(360deg)}}

  #snInvPanel{position:fixed;z-index:2147482999;width:380px;margin-top:6px;background:#fff;
    border:1px solid #d0d5dd;border-radius:12px;box-shadow:0 8px 28px rgba(0,0,0,.18);display:none}
  #snInvPanel.open{display:block}
  #snInvPanel .tabs{display:flex;gap:2px;padding:8px 10px 0;border-bottom:1px solid #eef0f3}
  #snInvPanel .tab{padding:5px 12px;border:1px solid transparent;border-bottom:0;border-radius:8px 8px 0 0;
    cursor:pointer;color:#555;font-size:13px;background:transparent}
  #snInvPanel .tab.on{background:#f4f6f9;border-color:#eef0f3;color:#1677ff;font-weight:600}
  #snInvPanel .pane{padding:10px;max-height:62vh;overflow:auto;display:none}
  #snInvPanel .pane.on{display:block}
  #snInvPanel .row{display:flex;align-items:center;gap:6px;margin-bottom:8px}
  #snInvPanel .row label{width:96px;text-align:right;color:#555;flex:none}
  #snInvPanel input[type=text]{flex:1;min-width:0;padding:4px 6px;border:1px solid #ccd;border-radius:4px}
  #snInvPanel input[type=number]{width:82px;padding:4px 6px;border:1px solid #ccd;border-radius:4px}
  #snInvPanel input[type=range]{flex:1}
  #snInvPanel textarea{width:100%;height:66px;padding:4px 6px;border:1px solid #ccd;border-radius:4px;resize:vertical}
  #snInvPanel .btns{display:flex;gap:6px;margin-top:8px}
  #snInvPanel button.act{padding:5px 12px;border:1px solid #ccd;border-radius:6px;background:#fff;cursor:pointer}
  #snInvPanel button.act.primary{background:#1677ff;color:#fff;border-color:#1677ff}
  #snInvPanel button.act.danger{background:#fff2f0;color:#cf1322;border-color:#ffa39e}
  #snInvPanel .prog{margin-top:8px;padding:6px 8px;background:#f7f9fc;border-radius:6px;font-size:12px;color:#333;word-break:break-all}
  #snInvPanel .tip{font-size:12px;color:#888;margin-top:6px}
  #snInvPanel .opVal{width:44px;text-align:right;color:#666;font-size:12px;flex:none}
  `;
  try { GM_addStyle(CSS); } catch (e) { const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s); }

  let panel = null;
  let barEl = null;
  let progEl = null;
  let dragging = false;
  let lastPosSig = '';

  const ICON_START = '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M7 4.8c0-.8.9-1.3 1.6-.9l10.2 6.3c.7.4.7 1.4 0 1.8L8.6 18.3c-.7.4-1.6-.1-1.6-.9V4.8z" fill="#16a34a"/></svg>';
  const ICON_STOP = '<svg viewBox="0 0 24 24" width="20" height="20"><rect x="6" y="6" width="12" height="12" rx="2" fill="#dc2626"/></svg>';

  function renderBar() {
    if (!barEl) return;
    const job = getJob();
    const total = job.list.length || 0;
    const idx = Math.min(job.index + 1, total || 0);
    const running = job.running && !job.stopped;
    const stepName = STEP_NAMES[job.step] || '';
    const roundTxt = job.rerunRound ? `（第 ${job.rerunRound + 1} 轮）` : '';

    if (running) {
      barEl.innerHTML = `
        <button class="btnIcon" data-act="stop" title="急停">${ICON_STOP}</button>
        <span id="snInvSpinner"></span>
        <span class="cnt">${idx}/${total}</span>
        <span class="stepTxt">${stepName}${roundTxt}</span>
        <span class="spacer"></span>
        <button class="btnTiny" data-act="toggle" title="设置">⚙</button>
      `;
    } else {
      barEl.innerHTML = `
        <button class="btnIcon" data-act="start" title="开始">${ICON_START}</button>
        <span class="title">发票导出</span>
        <span class="spacer"></span>
        <button class="btnTiny" data-act="toggle" title="设置">⚙</button>
      `;
    }
  }

  function renderPanel() {
    if (!panel) return;
    const job = getJob();
    const total = job.list.length || 0;
    const cur = job.running ? (job.list[job.index] || '') : '';
    const stepName = STEP_NAMES[job.step] || '';
    const state = job.running ? '运行中' : (job.stopped ? '已停止' : (job.rows.length && job.index >= job.list.length ? '已完成' : '待开始'));
    const failCnt = job.rows.filter((r) => r.status === '失败').length;
    if (progEl) {
      progEl.innerHTML = `
        <div>已完成：<b>${job.rows.length}</b> / ${total}</div>
        <div>当前税号：${cur || '—'}</div>
        <div>当前步骤：${stepName || '—'}</div>
        <div>状态：<b>${state}</b>${job.rerunRound ? ` ｜ 第 ${job.rerunRound + 1} 轮` : ''}</div>
        ${failCnt ? `<div style="color:#cf1322">本轮失败记录：${failCnt} 条（结束后自动重跑）</div>` : ''}
        ${job.failedAt ? `<div style="color:#cf1322">上次失败：${job.failedAt}</div>` : ''}
        <div style="color:#999;font-size:11px;margin-top:4px">页面：${location.hostname}</div>
      `;
    }
  }

  function applyLayout() {
    const cfg = getCfg();
    const pos = cfg.panelPos || { left: 12, top: 12 };
    const left = Number.isFinite(Number(pos.left)) ? Number(pos.left) : 12;
    const top = Number.isFinite(Number(pos.top)) ? Number(pos.top) : 12;

    if (barEl) {
      barEl.style.opacity = String(cfg.opacity != null ? cfg.opacity : 1);
    }
    if (panel) {
      panel.style.left = left + 'px';
      panel.style.top = (top + 50) + 'px';
      panel.style.opacity = String(cfg.opacity != null ? cfg.opacity : 1);
      panel.classList.toggle('open', !!cfg.layer2Open);
    }
    if (barEl) {
      barEl.style.left = left + 'px';
      barEl.style.top = top + 'px';
    }
    lastPosSig = `${left},${top},${cfg.opacity},${cfg.layer2Open ? 1 : 0}`;
  }

  function setTab(tab) {
    if (!panel) return;
    qsa(panel, '.tab').forEach((t) => t.classList.toggle('on', t.dataset.tab === tab));
    qsa(panel, '.pane').forEach((p) => p.classList.toggle('on', p.dataset.pane === tab));
  }

  function buildPanel() {
    const cfg = getCfg();

    const wrap = document.createElement('div');
    wrap.id = 'snInvWrap';

    const bar = document.createElement('div');
    bar.id = 'snInvBar';
    barEl = bar;

    panel = document.createElement('div');
    panel.id = 'snInvPanel';
    panel.innerHTML = `
      <div class="tabs">
        <div class="tab ${cfg.layer2Tab !== 'fmt' ? 'on' : ''}" data-tab="run">运行设置</div>
        <div class="tab ${cfg.layer2Tab === 'fmt' ? 'on' : ''}" data-tab="fmt">第一层格式设置</div>
      </div>

      <div class="pane ${cfg.layer2Tab !== 'fmt' ? 'on' : ''}" data-pane="run">
        <div class="row"><label>日期范围</label><input type="text" id="snRange" placeholder="2026.01.01-2026.12.31"></div>
        <div class="row" style="align-items:flex-start"><label>税号列表</label>
          <textarea id="snTax" placeholder="多个税号用中文逗号分隔，例如：92610125MA6W5CYA5B，92610125MA6W0CQH4N"></textarea>
        </div>
        <div class="row"><label>发票类型</label>
          <label style="width:auto;text-align:left"><input type="radio" name="snType" value="开具发票" checked> 开具（销项）</label>
          <label style="width:auto;text-align:left"><input type="radio" name="snType" value="取得发票"> 取得（进项）</label>
        </div>
        <div class="row"><label>日志子目录</label><input type="text" id="snDir" placeholder="发票导出"></div>
        <div class="row"><label>查询点击间隔(毫秒)</label><input type="number" id="snQueryWait" min="500" step="500" value="2000"></div>
        <div class="row"><label>关页前等待(毫秒)</label><input type="number" id="snWait" min="0" step="500" value="3000"></div>
        <div class="row"><label style="width:auto;text-align:left">
          <input type="checkbox" id="snStop"> 出错时立即停止（保留进度）
        </label></div>
        <div class="btns">
          <button class="act primary" data-act="start">开始</button>
          <button class="act danger" data-act="stop">急停</button>
          <button class="act" data-act="clear">清空进度</button>
        </div>
        <div class="prog" id="snProg"></div>
        <div class="tip">查询按钮连点 3 次；有票判据为出现“查询结果：合计金额”；失败项会自动重跑直到成功。</div>
      </div>

      <div class="pane ${cfg.layer2Tab === 'fmt' ? 'on' : ''}" data-pane="fmt">
        <div class="row"><label>透明度</label>
          <input type="range" id="snOpacity" min="0.3" max="1" step="0.05" value="${cfg.opacity != null ? cfg.opacity : 1}">
          <span class="opVal" id="snOpacityVal">${Math.round((cfg.opacity != null ? cfg.opacity : 1) * 100)}%</span>
        </div>
        <div class="row"><label>位置</label>
          <span class="tip" style="margin:0">拖动上方第一层即可移动；此处显示当前坐标</span>
        </div>
        <div class="row"><label>当前坐标</label>
          <input type="text" id="snPosShow" readonly>
        </div>
        <div class="btns">
          <button class="act" data-act="resetPos">重置位置</button>
        </div>
        <div class="tip">透明度与位置对所有页面生效，并会被记住。</div>
      </div>
    `;

    wrap.appendChild(bar);
    wrap.appendChild(panel);
    document.body.appendChild(wrap);

    progEl = panel.querySelector('#snProg');

    panel.querySelector('#snRange').value = cfg.dateRange || '';
    panel.querySelector('#snTax').value = cfg.taxText || '';
    panel.querySelector('#snDir').value = cfg.logDir || LOG_SUBDIR_DEFAULT;
    panel.querySelector('#snQueryWait').value = String(cfg.queryWaitMs != null ? cfg.queryWaitMs : 2000);
    panel.querySelector('#snWait').value = String(cfg.closeWaitMs != null ? cfg.closeWaitMs : 3000);
    panel.querySelector('#snStop').checked = !!cfg.stopOnError;
    const radio = panel.querySelector(`input[name="snType"][value="${cfg.invType}"]`);
    if (radio) radio.checked = true;

    applyLayout();
    renderBar();
    renderPanel();

    let drag = null;
    bar.addEventListener('mousedown', (e) => {
      if (e.target.closest('button')) return;
      const r = bar.getBoundingClientRect();
      drag = { x: e.clientX, y: e.clientY, left: r.left, top: r.top };
      dragging = true;
      e.preventDefault();
    });
    window.addEventListener('mousemove', (e) => {
      if (!drag) return;
      const c = getCfg();
      c.panelPos = {
        left: Math.max(0, drag.left + e.clientX - drag.x),
        top: Math.max(0, drag.top + e.clientY - drag.y),
      };
      setCfg(c);
      applyLayout();
      const posShow = panel && panel.querySelector('#snPosShow');
      if (posShow) posShow.value = `${Math.round(c.panelPos.left)}, ${Math.round(c.panelPos.top)}`;
    });
    window.addEventListener('mouseup', () => {
      if (!drag) return;
      drag = null;
      dragging = false;
      const c = getCfg();
      lastPosSig = `${c.panelPos.left},${c.panelPos.top},${c.opacity},${c.layer2Open ? 1 : 0}`;
    });

    panel.querySelectorAll('.tab').forEach((t) => {
      t.addEventListener('click', () => {
        const tab = t.dataset.tab;
        setTab(tab);
        const c = getCfg();
        c.layer2Tab = tab;
        setCfg(c);
      });
    });

    const op = panel.querySelector('#snOpacity');
    const opVal = panel.querySelector('#snOpacityVal');
    op.addEventListener('input', () => {
      const v = Number(op.value) || 1;
      opVal.textContent = Math.round(v * 100) + '%';
      const c = getCfg();
      c.opacity = v;
      setCfg(c);
      applyLayout();
    });

    const posShow = panel.querySelector('#snPosShow');
    const c0 = getCfg();
    posShow.value = `${Math.round(c0.panelPos.left || 0)}, ${Math.round(c0.panelPos.top || 0)}`;

    function onAct(act) {
      if (act === 'toggle') {
        const c = getCfg();
        c.layer2Open = !c.layer2Open;
        setCfg(c);
        applyLayout();
        return;
      }
      if (act === 'start') { doStart(); return; }
      if (act === 'stop') { doStop(); return; }
      if (act === 'clear') { doClear(); return; }
      if (act === 'resetPos') {
        const c = getCfg();
        c.panelPos = { left: 12, top: 12 };
        c.opacity = 1;
        setCfg(c);
        if (panel) {
          panel.querySelector('#snOpacity').value = '1';
          panel.querySelector('#snOpacityVal').textContent = '100%';
        }
        applyLayout();
        return;
      }
    }

    bar.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-act]');
      if (!btn) return;
      e.stopPropagation();
      onAct(btn.dataset.act);
    });

    panel.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-act]');
      if (!btn) return;
      onAct(btn.dataset.act);
    });
  }

  function doStart() {
    const collected = collectConfig();
    if (!collected) return;
    setCfg(collected);

    killFlag = false;
    busy = false;

    const job = getJob();
    if (!job.running && job.rows.length && job.index >= job.list.length && job.list.length) {
      if (!confirm('上次已全部完成，是否重新开始？')) return;
      job.rows = []; job.index = 0; job.stopped = false; job.failedAt = '';
      job.rerunRound = 0; job.failedQueue = [];
    }
    job.running = true;
    job.stopped = false;
    job.stopTs = 0;
    job.exporting = false;
    job.exportTs = 0;
    job.switchedTaxId = '';
    job.switchReqTs = 0;
    job.list = parseTaxIds(collected.taxText);
    job.total = job.list.length;
    if (job.index >= job.list.length) job.index = 0;
    if (!job.runStartedAt) job.runStartedAt = new Date().toISOString();
    if (!job.logFileName) job.logFileName = `发票导出日志_${nowStamp()}.xlsx`;
    job.step = 0;
    setJob(job);
    renderBar();
    renderPanel();
    location.href = SWITCH_URL;
  }

  function doStop() {
    killFlag = true;
    busy = false;
    const job = getJob();
    job.running = false;
    job.stopped = true;
    job.stopTs = Date.now();
    job.exporting = false;
    job.exportTs = 0;
    job.switchedTaxId = '';
    job.switchReqTs = 0;
    setJob(job);
    renderBar();
    renderPanel();
  }

  function doClear() {
    if (!confirm('确定清空进度与历史日志行？（面板输入会保留）')) return;
    killFlag = false;
    busy = false;
    const job = defaultJob();
    job.list = parseTaxIds(getCfg().taxText);
    job.total = job.list.length;
    setJob(job);
    renderBar();
    renderPanel();
  }

  function collectConfig() {
    const range = (panel.querySelector('#snRange').value || '').trim();
    const taxText = (panel.querySelector('#snTax').value || '').trim();
    const dir = (panel.querySelector('#snDir').value || '').trim() || LOG_SUBDIR_DEFAULT;
    const waitRaw = panel.querySelector('#snWait').value;
    const waitMs = Math.max(0, Number(waitRaw) || 3000);
    const queryWaitRaw = panel.querySelector('#snQueryWait').value;
    const queryWaitMs = Math.max(500, Number(queryWaitRaw) || 2000);
    const stop = panel.querySelector('#snStop').checked;
    const typeEl = panel.querySelector('input[name="snType"]:checked');
    const type = typeEl ? typeEl.value : '开具发票';

    if (!isValidRange(range)) {
      alert('请按 2026.01.01-2026.12.31 的格式填写日期范围');
      return null;
    }
    const ids = parseTaxIds(taxText);
    if (!ids.length) { alert('请填写至少一个税号，多个税号用中文逗号分隔'); return null; }

    const r = parseRange(range);
    if (r.start > r.end) { alert('起始日期不能晚于截止日期'); return null; }

    const old = getCfg();
    return {
      dateRange: range, taxText, invType: type,
      logDir: dir, stopOnError: stop, closeWaitMs: waitMs, queryWaitMs,
      panelPos: old.panelPos, opacity: old.opacity,
      layer2Open: old.layer2Open, layer2Tab: old.layer2Tab,
      minimized: old.minimized,
    };
  }

  /* ====================================================================
   * 启动 + 跨页同步
   * ================================================================== */
  let lastHref = location.href;
  let busy = false;
  let lastStopTs = 0;

  async function safeTick() {
    if (busy || killFlag) return;
    busy = true;
    try {
      const job0 = getJob();
      if (job0.stopped || !job0.running) { killFlag = true; return; }
      await tick();
    } catch (e) {
      console.error('[tick] 异常', e);
    } finally {
      busy = false;
    }
  }

  function boot() {
    if (!document.getElementById('snInvWrap')) buildPanel();

    safeTick();

    setInterval(() => {
      if (location.href !== lastHref) {
        lastHref = location.href;
        busy = false;
        safeTick();
      }
    }, 800);

    setInterval(() => {
      const job = getJob();
      if (!job.running || job.stopped) return;
      if (busy) return;
      if (job.exporting && (Date.now() - job.exportTs) < 60000) return;
      safeTick();
    }, 2000);

    setInterval(() => {
      const job = getJob();
      if (job.stopped && job.stopTs && job.stopTs !== lastStopTs) {
        lastStopTs = job.stopTs;
        killFlag = true;
        busy = false;
      }
      if (!job.stopped) killFlag = false;
    }, 300);

    setInterval(() => {
      renderBar();
      renderPanel();
      if (dragging) return;
      const c = getCfg();
      const p = c.panelPos || { left: 12, top: 12 };
      const sig = `${Number(p.left) || 12},${Number(p.top) || 12},${c.opacity},${c.layer2Open ? 1 : 0}`;
      if (sig !== lastPosSig) applyLayout();

      if (panel) {
        const op = panel.querySelector('#snOpacity');
        if (op && document.activeElement !== op) {
          op.value = String(c.opacity != null ? c.opacity : 1);
          const opVal = panel.querySelector('#snOpacityVal');
          if (opVal) opVal.textContent = Math.round((c.opacity != null ? c.opacity : 1) * 100) + '%';
        }
        const posShow = panel.querySelector('#snPosShow');
        if (posShow && document.activeElement !== posShow) {
          posShow.value = `${Math.round(p.left || 0)}, ${Math.round(p.top || 0)}`;
        }
      }
    }, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
