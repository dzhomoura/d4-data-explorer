import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";
import test from "node:test";
import { setTimeout as delay } from "node:timers/promises";

const chromePath = process.env.CHROME_PATH;
const root = new URL("../", import.meta.url);
const v1 = "d4-paragon-paladin-connected-v1";
const v2 = "d4-paragon-paladin-connected-v2";
const single = "d4-paragon-paladin-00-v1";
const revision = "75e619f0d90a0951945747f45feef59c076a5db0";

async function until(check) {
  for (let i = 0; i < 120; i++) {
    const result = await check();
    if (result) return result;
    await delay(50);
  }
  throw new Error("Timed out waiting for the browser.");
}

test("interactive planner in Chrome", { skip: !chromePath && "set CHROME_PATH to run the browser checks", timeout: 90000 }, async t => {
  const profile = await mkdtemp(join(tmpdir(), "d4-planner-"));
  const contentTypes = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json" };
  let missing;
  const server = createServer(async (request, response) => {
    const { pathname } = new URL(request.url, "http://localhost");
    const path = pathname.endsWith("/") ? pathname + "index.html" : pathname;
    if (path === missing || !/^\/(?:paragon-visual\/[a-z0-9.-]+|paladin-board-\d\d\.json)$/.test(path)) {
      response.writeHead(path === "/favicon.ico" ? 204 : 404).end();
      return;
    }
    try {
      const body = await readFile(new URL(path.slice(1), root));
      response.writeHead(200, { "Content-Type": contentTypes[extname(path)], "Cache-Control": "no-store" }).end(body);
    } catch {
      response.writeHead(404).end();
    }
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const base = `http://127.0.0.1:${server.address().port}/paragon-visual/`;
  const chrome = spawn(chromePath, ["--headless", "--no-first-run", "--remote-debugging-port=0",
    `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore" });
  const exited = once(chrome, "exit");
  t.after(async () => {
    chrome.kill();
    await exited;
    server.closeAllConnections();
    server.close();
    await rm(profile, { recursive: true, force: true, maxRetries: 4 });
  });
  const port = await until(async () => {
    try {
      return (await readFile(join(profile, "DevToolsActivePort"), "utf8")).split("\n")[0];
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      return null;
    }
  });
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const socket = new WebSocket(targets.find(tab => tab.type === "page").webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  t.after(() => socket.close());
  const pending = new Map();
  const errors = [];
  let sequence = 0;
  let acceptConfirmation = false;
  let confirmations = 0;
  function send(method, params = {}) {
    const id = ++sequence;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      socket.send(JSON.stringify({ id, method, params }));
    });
  }
  socket.addEventListener("message", event => {
    const data = JSON.parse(event.data);
    if (data.method === "Page.javascriptDialogOpening") {
      confirmations++;
      void send("Page.handleJavaScriptDialog", { accept: acceptConfirmation });
    }
    if (data.method === "Runtime.exceptionThrown") errors.push(data.params.exceptionDetails);
    const request = pending.get(data.id);
    if (!request) return;
    pending.delete(data.id);
    if (data.error) request.reject(new Error(data.error.message));
    else request.resolve(data.result);
  });
  async function evaluate(expression) {
    const { result, exceptionDetails } = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text);
    return result.value;
  }
  async function ready() {
    await until(() => evaluate("document.querySelector('#connected-mode-toggle')?.getAttribute('aria-pressed') === 'true'"));
    await evaluate(`
      window.q = selector => document.querySelector(selector);
      window.qa = selector => [...document.querySelectorAll(selector)];
      window.gate = (boardId, i) => q('.node[data-board-id="' + boardId + '"][data-node-index="' + i + '"]');
      window.header = boardId => q('.connected-board-header[data-board-id="' + boardId + '"]');
      window.option = boardId => q('.board-picker-option[data-board-id="' + boardId + '"]');
      window.pick = () => q('#board-picker');
      window.raw = () => localStorage.getItem(${JSON.stringify(v2)});
      window.save = () => JSON.parse(raw());
      window.points = () => Number(q('#points-spent').textContent);
      window.center = () => q('#board-stage').scrollIntoView({block:'center'});
      window.check = (value, message) => { if (!value) throw new Error(message); };
      window.tip = node => {
        node.dispatchEvent(new PointerEvent('pointerenter'));
        return q('#node-tooltip').textContent;
      };
    `);
    await evaluate("center()");
  }
  async function point(expression) {
    return evaluate(`(() => {
      const node = ${expression};
      const rect = node.getBoundingClientRect();
      const x = (rect.left + rect.right) / 2, y = (rect.top + rect.bottom) / 2;
      check(node.contains(document.elementFromPoint(x, y)), 'Covered or offscreen: ' + ${JSON.stringify(expression)});
      return {x, y};
    })()`);
  }
  async function click(expression, button = "left") {
    const at = await point(expression);
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", ...at });
    await send("Input.dispatchMouseEvent", { type: "mousePressed", clickCount: 1, button, ...at });
    await send("Input.dispatchMouseEvent", { type: "mouseReleased", clickCount: 1, button, ...at });
  }
  async function key(key, code, windowsVirtualKeyCode) {
    const press = key === " " ? { type: "keyDown", text: " " } : { type: "rawKeyDown" };
    await send("Input.dispatchKeyEvent", { ...press, key, code, windowsVirtualKeyCode });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode });
  }
  async function tap(expression) {
    const at = await point(expression);
    await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [at] });
    await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  }
  async function reload() {
    await send("Page.reload");
    await delay(120);
    await ready();
  }

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1050, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url: base + "#connected" });
  await ready();
  await evaluate(`check(qa('.connected-board-header').length === 1 && points() === 0, 'Fresh draft starts with Starting only');
    localStorage.setItem(${JSON.stringify(single)}, '[304]'); gate('board00',10).focus({preventScroll:true});`);
  await key("Enter", "Enter", 13);
  await evaluate(`check(pick().open && document.activeElement === option('board01'), 'Keyboard opens and focuses the picker');
    check(qa('.board-picker-option:enabled').length === 9 && points() === 0, 'All nine options start enabled without spending points');`);
  await key("Escape", "Escape", 27);
  await until(() => evaluate("!pick().open && document.activeElement === gate('board00',10)"));
  await click("gate('board00',10)");
  await click("option('board01')");
  await until(() => evaluate("!pick().open && document.activeElement === gate('board00',10)"));
  await evaluate(`check(save().boards.length === 2 && points() === 0, 'Castle attached without spending');
    gate('board01', 430).click();
    check(!qa('.board-picker-option:enabled').length, 'Incoming gate cannot attach');
    check(q('#board-picker-description').textContent.includes('Starting Board'), 'Occupied gate identifies the attached board');
    pick().close();`);
  await until(() => evaluate("!pick().open && document.activeElement === gate('board01',430)"));
  await evaluate("q('#board-stage').focus({preventScroll:true}); window.originalTransform = q('#board-frame').style.transform;");
  await key("Tab", "Tab", 9);
  await evaluate(`check(document.activeElement === header('board01').querySelector('[data-rotation-step="-90"]'),
    'Contextual controls are reachable before the board cells');`);
  await key(" ", "Space", 32);
  await evaluate(`check(save().boards[1].rotation === 270 && save().boards[1].incoming.entryGateIndex === 210, 'Keyboard rotates Castle');
    check(q('#board-frame').style.transform === originalTransform, 'Leaf rotation preserves camera');`);
  await click("header('board01').querySelector('[data-rotation-step=\"90\"]')");
  await evaluate(`check(save().boards[1].rotation === 0 && save().boards[1].incoming.entryGateIndex === 430, 'Pointer rotates Castle back');
    window.statsRect = q('#total-stats').getBoundingClientRect().toJSON();`);
  const panStart = await evaluate(`(() => {
    const rect = q('#board-stage').getBoundingClientRect();
    return {x: rect.left + 30, y: rect.top + rect.height / 2};
  })()`);
  await send("Input.dispatchMouseEvent", { type: "mousePressed", button: "left", clickCount: 1, ...panStart });
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", buttons: 1, x: panStart.x + 45, y: panStart.y + 10 });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", button: "left", clickCount: 1, x: panStart.x + 45, y: panStart.y + 10 });
  await evaluate("check(q('#board-frame').style.transform !== originalTransform, 'Canvas pans')");
  const panned = await evaluate("q('#board-frame').style.transform");
  await send("Input.dispatchMouseEvent", { type: "mouseWheel", deltaX: 0, deltaY: -100, ...panStart });
  await until(async () => await evaluate("q('#board-frame').style.transform") !== panned);
  await evaluate(`check(q('#connected-board-headers').style.transform === q('#board-frame').style.transform, 'Headers follow zoom and pan');
    check(JSON.stringify(q('#total-stats').getBoundingClientRect().toJSON()) === JSON.stringify(statsRect), 'Total Stats stays viewport anchored');
    q('#zoom-reset').click();`);

  for (const [gateIndex, boardId] of [[230, "board02"], [210, "board08"], [10, "board03"]]) {
    await click(`gate('board01',${gateIndex})`);
    await evaluate("check(option('board01').disabled, 'Already equipped catalog choice is disabled')");
    await click(`option('${boardId}')`);
    await until(() => evaluate("!pick().open"));
  }
  await evaluate(`check(save().boards.map(board=>board.boardId).join() === 'board00,board01,board02,board08,board03', 'Five boards follow attachment order');
    check(points() === 0 && qa('.board-connection--bridge').length === 4, 'Branch before allocation');
    gate('board02',10).click();
    check(!qa('.board-picker-option:enabled').length && q('#board-picker-description').textContent.includes('five'), 'Five-board cap in picker');
    pick().close();
    window.stored = raw();
    header('board01').querySelector('[data-rotation-step="90"]').click();
    check(raw() === stored && q('#allocation-message').textContent.includes('more than one attachment'), 'Invalid rotation keeps the save');
    header('board01').querySelector('[data-remove-board]').click();
    check(raw() === stored && q('#allocation-message').textContent.includes('child boards'), 'Reject parent removal');
    check(tip(gate('board03',178)).includes('2520'), 'Knight placement 4 requirement reaches the tooltip');`);
  await send("Emulation.setDeviceMetricsOverride", { width: 320, height: 640, deviceScaleFactor: 1, mobile: true });
  await evaluate("q('#zoom-reset').click(); center();");
  await delay(100);
  await evaluate(`check(qa('.connected-board-header').every(element => {
    const header = element.getBoundingClientRect(), stage = q('#board-stage').getBoundingClientRect();
    return header.top >= stage.top && header.left >= stage.left && header.right <= stage.right;
  }), 'Fitted mobile view includes each board label');`);
  for (const boardId of ["board01", "board02", "board08", "board03"]) {
    await point(`header('${boardId}').querySelector('[data-rotation-step="90"]')`);
  }
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1050, deviceScaleFactor: 1, mobile: false });
  await evaluate("q('#zoom-reset').click(); center();");
  await delay(100);
  await click("header('board02').querySelector('[data-remove-board]')");
  assert.equal(confirmations, 1);
  await evaluate("check(raw() === stored, 'Cancel removal preserves the save')");
  acceptConfirmation = true;
  await click("header('board02').querySelector('[data-remove-board]')");
  assert.equal(confirmations, 2);
  await evaluate(`check(save().boards.length === 4, 'Confirmed leaf removal');
    check(header('board03').querySelector('h3 span').textContent.startsWith('#4'), 'Later header renumbered');
    check(tip(gate('board03',178)).includes('2065'), 'Rare requirements update after renumbering');`);

  await evaluate(`(async () => {
    const {readConnectedSaveV2} = await import('./connected-boards.js');
    const {mergeSharedNodeDefinitions} = await import('./shared-node-definitions.js');
    const resources = new Map(await Promise.all(save().boards.map(async ({boardId}) => {
      const suffix = boardId.slice(-2);
      const read = async url => (await fetch(url)).json();
      return [boardId, {board: await read('../paladin-board-' + suffix + '.json'),
        database: mergeSharedNodeDefinitions(await read('node-data' + (suffix === '00' ? '' : '-' + suffix) + '.json'))}];
    })));
    const {layout} = readConnectedSaveV2(resources, save());
    const target = save().boards.find(board => board.boardId === 'board03').instanceId + ':178';
    const previous = new Map([[layout.root, null]]);
    const queue = [layout.root];
    for (let i = 0; i < queue.length && !previous.has(target); i++) {
      for (const next of layout.graph.get(queue[i])) {
        if (!previous.has(next)) { previous.set(next, queue[i]); queue.push(next); }
      }
    }
    const path = [];
    for (let id = target; id !== null; id = previous.get(id)) path.unshift(id);
    for (const id of path.slice(1)) {
      const node = layout.nodes.get(id);
      gate(node.boardId, node.sourceIndex).click();
      if (pick().open) q('#board-picker-gate-action').click();
    }
    check(points() === path.length - 1, 'Path allocated across boards and both sides of each bridge');
    for (const attr of ['strength','willpower']) {
      const input = q('#external-' + attr);
      input.value = '2500';
      input.dispatchEvent(new Event('input', {bubbles:true}));
    }
    check(tip(gate('board03',178)).includes('Conditional bonus is active.'), 'External inputs activate Knight');
    const strength = q('[data-stat-key="core:Strength"]');
    strength.focus({preventScroll:true});
    check(qa('.node--stat-highlight').some(node=> node.dataset.boardId === 'board03'), 'Total Stats highlights branch contributors');
    window.stored = raw();
    gate('board00',10).dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true}));
    check(raw() === stored && q('#allocation-message').textContent.includes('disconnect'), 'Invalid refund preserves draft');
    header('board03').querySelector('[data-remove-board]').click();
    check(q('#allocation-message').textContent.includes('Refund this board'), 'Allocated leaf removal rejected');
  })()`);
  const savedBranch = await evaluate("raw()");
  await reload();
  assert.equal(await evaluate("raw()"), savedBranch);
  await evaluate("check(points() > 0 && gate('board03',178).classList.contains('node--allocated'), 'Reload restores connected allocation')");
  assert.equal(await evaluate(`localStorage.getItem(${JSON.stringify(single)})`), "[304]");

  const legacy = JSON.stringify({version: 1, sourceRevision: revision,
    attachment: {startingGateIndex: 10, castleEntryIndex: 230, castleRotation: 90},
    allocations: [["board00", 304], ["board00", 283]]});
  await evaluate(`localStorage.removeItem(${JSON.stringify(v2)}); localStorage.setItem(${JSON.stringify(v1)},${JSON.stringify(legacy)});`);
  await reload();
  assert.equal(await evaluate(`localStorage.getItem(${JSON.stringify(v1)})`), legacy);
  await evaluate(`check(save().version === 2 && save().boards[1].rotation === 90
    && save().boards[1].incoming.entryGateIndex === 230 && points() === 1, 'Version 1 migrated with rotation, seam and allocation');`);

  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 740, deviceScaleFactor: 1, mobile: true });
  await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
  await evaluate("q('#zoom-reset').click(); center();");
  await delay(100);
  await tap("gate('board01',10)");
  await until(() => evaluate("pick().open"));
  await tap("option('board02')");
  await until(() => evaluate("save().boards.length === 3 && !pick().open"));
  await evaluate("check(points() === 1, 'Touch attachment preserves allocation')");
  await tap("header('board01').querySelector('[data-rotation-step=\"-90\"]')");
  await until(() => evaluate("save().boards[1].rotation === 0 && save().boards[2].rotation === 270"));
  const rotated = await evaluate("raw()");
  await reload();
  assert.equal(await evaluate("raw()"), rotated);
  await evaluate(`check(header('board02').querySelector('output').textContent === '270°' && points() === 1,
    'Reload restores descendant rotation and allocation');`);

  for (const invalid of ["{", '{"version":3}']) {
    await evaluate(`localStorage.setItem(${JSON.stringify(v2)},${JSON.stringify(invalid)});`);
    await reload();
    await evaluate(`check(q('#save-status').textContent === 'Connected save unavailable', 'Unreadable v2 reported');
      gate('board00',10).click(); option('board05').click();`);
    assert.equal(await evaluate("raw()"), invalid);
    assert.equal(await evaluate(`localStorage.getItem(${JSON.stringify(v1)})`), legacy);
  }
  missing = "/paladin-board-08.json";
  await evaluate(`localStorage.setItem(${JSON.stringify(v2)},${JSON.stringify(savedBranch)});`);
  await reload();
  await evaluate(`check(q('#save-status').textContent === 'Connected save unavailable', 'Missing resources protect the draft');
    gate('board00',10).click(); option('board05').click();`);
  assert.equal(await evaluate("raw()"), savedBranch);
  missing = null;
  await reload();
  await evaluate("check(points() > 0 && gate('board03',178).classList.contains('node--allocated'), 'Draft restores when resources return')");
  assert.deepEqual(errors, []);
});
