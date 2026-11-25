import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
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
      window.attach = (boardId, i) => {
        const marker = gate(boardId, i);
        return qa('.gate-attachment').find(button => button.dataset.attachGate === marker.dataset.boardInstanceId + ':' + i);
      };
      window.manage = boardId => header(boardId).querySelector('[data-manage-board]');
      window.menu = () => q('#board-management');
      window.action = attr => q('#board-management-actions [' + attr + ']');
      window.option = boardId => q('.board-picker-option[data-board-id="' + boardId + '"]');
      window.pick = () => q('#board-picker');
      window.raw = () => localStorage.getItem(${JSON.stringify(v2)});
      window.save = () => JSON.parse(raw());
      window.points = () => Number(q('#points-spent').textContent);
      window.center = () => q('#board-stage').scrollIntoView({block:'center'});
      window.check = (value, message) => { if (!value) throw new Error(message); };
      window.checkControls = (atFit = true) => {
        const bounds = node => node.getBoundingClientRect();
        const intersects = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
        const outlines = qa('.connected-board-outline').map(bounds);
        const nodes = qa('.node').map(bounds);
        const gateControls = qa('.gate-attachment').map(bounds);
        const fixed = [bounds(q('.zoom-controls')), bounds(q('#total-stats'))];
        qa('.connected-board-header').map(bounds).forEach((header, index) => {
          const board = outlines[index];
          check(header.left >= board.left && header.top >= board.top && header.right <= board.right && header.bottom <= board.bottom,
            'Management strip is inside its own board footprint');
          const scale = board.width / (21 * 36);
          check(Math.abs((board.right - header.right) / scale - 3) < 0.1
            && Math.abs((header.top - board.top) / scale - 3) < 0.1, 'Management strip keeps the same top-right inset');
          check(![...nodes, ...gateControls].some(rect => intersects(header, rect)), 'Management strip stays clear of nodes and attachment controls');
          if (atFit) check(!fixed.some(rect => intersects(header, rect)), 'Management strip stays clear of fixed controls at Fit');
        });
        if (atFit) check(!gateControls.some(control => [...nodes, ...fixed].some(rect => intersects(control, rect))),
          'Attachment affordances stay clear of nodes and fixed controls at Fit');
        check(!intersects(fixed[0], fixed[1]), 'Fixed controls stay clear of each other');
      };
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
    const press = key === " " || key === "Enter"
      ? { type: "keyDown", text: key === "Enter" ? "\r" : " " } : { type: "rawKeyDown" };
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

  async function screenshot(name) {
    if (!process.env.SCREENSHOT_DIR) return;
    const { data } = await send("Page.captureScreenshot", { format: "png" });
    await writeFile(join(process.env.SCREENSHOT_DIR, name + ".png"), Buffer.from(data, "base64"));
  }

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1050, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url: base });
  await ready();
  await evaluate(`check(location.hash === '' && q('#board-inspector-controls').hidden, 'Default route is the player planner');
    check(qa('.connected-board-header').length === 1 && points() === 0, 'Fresh draft starts with Starting only');
    localStorage.setItem(${JSON.stringify(single)}, '[304]'); gate('board00',10).focus({preventScroll:true});`);
  await key("Enter", "Enter", 13);
  await evaluate(`check(!pick().open && q('#allocation-message').textContent.includes('not orthogonally connected'),
    'Keyboard invokes ordinary gate allocation and connectivity feedback'); attach('board00',10).focus({preventScroll:true});`);
  await key("Enter", "Enter", 13);
  await evaluate(`check(pick().open && document.activeElement === option('board01'), 'Keyboard opens and focuses the picker');
    check(qa('.board-picker-option:enabled').length === 9 && points() === 0, 'All nine options start enabled without spending points');`);
  await key("Escape", "Escape", 27);
  await until(() => evaluate("!pick().open && document.activeElement === attach('board00',10)"));
  await evaluate(`(async () => {
    const {createStartingLayout} = await import('./connected-boards.js');
    const {mergeSharedNodeDefinitions} = await import('./shared-node-definitions.js');
    const board = await (await fetch('../paladin-board-00.json')).json();
    const database = mergeSharedNodeDefinitions(await (await fetch('node-data.json')).json());
    const { root, graph } = createStartingLayout(new Map([['board00', {board, database}]]));
    const previous = new Map([[root, null]]);
    const queue = [root];
    for (const id of queue) for (const next of graph.get(id)) if (!previous.has(next)) {
      previous.set(next, id);
      queue.push(next);
    }
    const path = [];
    for (let id = previous.get('board00:10'); id !== root; id = previous.get(id)) path.unshift(Number(id.split(':')[1]));
    window.startingPath = path;
    for (const index of path) gate('board00',index).click();
    gate('board00',10).focus({preventScroll:true});
    window.beforeFreeGate = points();
  })()`);
  await key(" ", "Space", 32);
  await evaluate(`check(!pick().open && save().boards.length === 1 && points() === beforeFreeGate + 1, 'Free gate can be allocated with Space without attachment');`);
  await key("Delete", "Delete", 46);
  await evaluate(`check(points() === beforeFreeGate && !gate('board00',10).matches('.node--allocated'), 'Delete refunds the focused gate');
    q('#allocation-reset').click();`);
  await click("attach('board00',10)");
  await click("option('board01')");
  await until(() => evaluate("!pick().open && document.activeElement === gate('board00',10)"));
  await click("gate('board01',430)");
  await evaluate(`check(save().boards.length === 2 && points() === 0, 'Castle attached without spending');
    check(!pick().open && !attach('board01',430) && q('#allocation-message').textContent.includes('not orthogonally connected'),
      'Unreachable occupied gate gives allocation feedback'); window.originalTransform = q('#board-frame').style.transform;
    manage('board01').focus({preventScroll:true});`);
  await key("Enter", "Enter", 13);
  await evaluate(`check(menu().open && document.activeElement === q('#board-management-close'), 'Keyboard opens and focuses the board menu');
    action('data-rotation-step="-90"').focus();`);
  await key(" ", "Space", 32);
  await evaluate(`check(save().boards[1].rotation === 270 && save().boards[1].incoming.entryGateIndex === 210, 'Keyboard rotates Castle');
    check(q('#board-frame').style.transform === originalTransform, 'Leaf rotation preserves camera');`);
  await key("Escape", "Escape", 27);
  await until(() => evaluate("!menu().open && document.activeElement === manage('board01')"));
  await click("manage('board01')");
  await click("action('data-rotation-step=\"90\"')");
  await key("Escape", "Escape", 27);
  await until(() => evaluate("!menu().open && document.activeElement === manage('board01')"));
  await evaluate(`check(save().boards[1].rotation === 0 && save().boards[1].incoming.entryGateIndex === 430, 'Pointer rotates Castle back');
    window.statsRect = q('#total-stats').getBoundingClientRect().toJSON();
    window.zoomRect = q('.zoom-controls').getBoundingClientRect().toJSON();`);
  const panStart = await evaluate(`(() => {
    const rect = q('#board-stage').getBoundingClientRect();
    return {x: rect.left + 30, y: rect.top + rect.height / 2};
  })()`);
  await send("Input.dispatchMouseEvent", { type: "mousePressed", button: "left", clickCount: 1, ...panStart });
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", buttons: 1, x: panStart.x + 45, y: panStart.y + 85 });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", button: "left", clickCount: 1, x: panStart.x + 45, y: panStart.y + 85 });
  await evaluate("check(q('#board-frame').style.transform !== originalTransform, 'Canvas pans')");
  const panned = await evaluate("q('#board-frame').style.transform");
  await send("Input.dispatchMouseEvent", { type: "mouseWheel", deltaX: 0, deltaY: -100, ...panStart });
  await until(async () => await evaluate("q('#board-frame').style.transform") !== panned);
  await evaluate(`check(q('#connected-board-headers').style.transform === q('#board-frame').style.transform, 'Headers follow zoom and pan');
    check(JSON.stringify(q('#total-stats').getBoundingClientRect().toJSON()) === JSON.stringify(statsRect), 'Total Stats stays viewport anchored');
    check(JSON.stringify(q('.zoom-controls').getBoundingClientRect().toJSON()) === JSON.stringify(zoomRect), 'Zoom toolbar stays viewport anchored'); checkControls(false);`);
  const menuTransform = await evaluate("q('#board-frame').style.transform");
  await click("manage('board01')");
  await key("Escape", "Escape", 27);
  assert.equal(await evaluate("q('#board-frame').style.transform"), menuTransform);
  await evaluate("q('#zoom-reset').click()");
  await evaluate("checkControls()");
  await screenshot("desktop-two-boards");
  async function verifyQuarterTurns(boardId) {
    await click(`manage('${boardId}')`);
    for (const degrees of [90, 180, 270, 0]) {
      await click("action('data-rotation-step=\"90\"')");
      await evaluate(`check(header('${boardId}').querySelector('output').textContent === '${degrees}°',
        'Board reaches each quarter-turn rotation'); checkControls(false);`);
      if (boardId === "board01" && degrees === 180) {
        await key("Escape", "Escape", 27);
        await until(() => evaluate("!menu().open"));
        await screenshot("desktop-castle-tight-inset");
        await click("gate('board01',401)");
        await evaluate(`check(!menu().open && q('#allocation-message').textContent.includes('not orthogonally connected'),
          'Node beside the tight inset still receives its click');`);
        await click("manage('board01')");
      }
    }
    await key("Escape", "Escape", 27);
    await until(() => evaluate(`!menu().open && document.activeElement === manage('${boardId}')`));
  }
  await verifyQuarterTurns("board01");

  for (const [gateIndex, boardId] of [[230, "board02"], [210, "board08"], [10, "board03"]]) {
    await click(`attach('board01',${gateIndex})`);
    await evaluate("check(option('board01').disabled, 'Already equipped catalog choice is disabled')");
    await click(`option('${boardId}')`);
    await until(() => evaluate("!pick().open"));
  }
  await evaluate(`check(save().boards.map(board=>board.boardId).join() === 'board00,board01,board02,board08,board03', 'Five boards follow attachment order');
    check(points() === 0 && qa('.board-connection--bridge').length === 4, 'Branch before allocation');
    check(!qa('.gate-attachment').length, 'Five-board cap suppresses attachment offers');
    for (const index of startingPath) gate('board00',index).click();
    gate('board00',10).click();
    check(!pick().open && gate('board00',10).matches('.node--allocated'), 'Gate allocation remains available at the cap');
    q('#allocation-reset').click();
    window.stored = raw();
    check(tip(gate('board03',178)).includes('2520'), 'Knight placement 4 requirement reaches the tooltip');`);
  await click("manage('board01')");
  await click("action('data-rotation-step=\"90\"')");
  await evaluate(`check(raw() === stored && q('#allocation-message').textContent.includes('more than one attachment'), 'Invalid rotation keeps the save');
    check(!action('data-remove-board') && !action('data-attach-gate'), 'Parent removal and at-cap attachment are unavailable');`);
  await key("Escape", "Escape", 27);
  await evaluate("checkControls()");
  await screenshot("desktop-five-boards");
  await verifyQuarterTurns("board02");
  await send("Emulation.setDeviceMetricsOverride", { width: 320, height: 640, deviceScaleFactor: 1, mobile: true });
  await evaluate("q('#zoom-reset').click(); center();");
  await delay(100);
  await evaluate(`check(qa('.connected-board-header').every(element => {
    const header = element.getBoundingClientRect(), stage = q('#board-stage').getBoundingClientRect();
    return header.top >= stage.top && header.left >= stage.left && header.right <= stage.right;
  }), 'Fitted mobile view includes each board label');`);
  for (const boardId of ["board01", "board02", "board08", "board03"]) {
    await point(`manage('${boardId}')`);
  }
  await evaluate("checkControls()");
  await screenshot("mobile-five-boards");
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1050, deviceScaleFactor: 1, mobile: false });
  await evaluate("q('#zoom-reset').click(); center();");
  await delay(100);
  await click("manage('board02')");
  await evaluate("check(action('data-reset-board').disabled, 'Empty board reset is disabled')");
  await click("action('data-remove-board')");
  assert.equal(confirmations, 1);
  await evaluate("check(raw() === stored, 'Cancel removal preserves the save')");
  acceptConfirmation = true;
  await click("action('data-remove-board')");
  assert.equal(confirmations, 2);
  await evaluate(`check(save().boards.length === 4, 'Confirmed leaf removal');
    check(header('board03').querySelector('h3 span').textContent.startsWith('#4'), 'Later header renumbered');
    check(tip(gate('board03',178)).includes('2065'), 'Rare requirements update after renumbering');`);

  const allocationPath = await evaluate(`(async () => {
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
    return path.slice(1).map(id => {
      const { boardId, sourceIndex } = layout.nodes.get(id);
      return [boardId, sourceIndex];
    });
  })()`);
  for (const [boardId, index] of allocationPath) {
    const marker = `gate('${boardId}',${index})`;
    const castleExit = boardId === "board01" && index === 10;
    const ferventEntry = boardId === "board03" && index === 430;
    if (castleExit || ferventEntry) await click(marker);
    else await evaluate(`${marker}.click()`);
    await evaluate("check(!pick().open, 'Gate allocation never opens the picker')");
    if (ferventEntry) {
      await click(marker, "right");
      await evaluate(`check(!${marker}.matches('.node--allocated'), 'Reachable entry gate can be refunded with right-click')`);
      await click(marker);
    }
  }
  await evaluate(`check(points() === ${allocationPath.length}, 'Path allocated across boards and both sides of each bridge');
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
    check(!pick().open && gate('board01',10).matches('.node--allocated') && gate('board03',430).matches('.node--allocated'), 'Castle exit and Fervent entry both allocate');`);
  const savedBranch = await evaluate("raw()");
  await reload();
  assert.equal(await evaluate("raw()"), savedBranch);
  await evaluate("check(points() > 0 && gate('board03',178).classList.contains('node--allocated'), 'Reload restores connected allocation')");
  for (const [boardId, name, dependent] of [["board00", "Starting Board", "Castle"], ["board01", "Castle", "Fervent"]]) {
    await click(`manage('${boardId}')`);
    await click("action('data-reset-board')");
    await evaluate(`check(q('#board-management-feedback').textContent.includes('Cannot reset ${name}')
      && q('#board-management-feedback').textContent.includes('${dependent}'), 'Reset identifies a dependent board');
      check(!action('data-confirm-reset'), 'Rejected reset does not offer confirmation');`);
    assert.equal(await evaluate("raw()"), savedBranch);
    await key("Escape", "Escape", 27);
    await until(() => evaluate("!menu().open"));
  }
  await click("manage('board03')");
  await evaluate(`check(!action('data-remove-board'), 'Allocated board has no remove action');
    window.preResetPoints = points(); window.preResetStats = q('#total-stats-list').textContent;
    window.leafPoints = save().boards.find(board => board.boardId === 'board03').allocatedSourceIndices.length;`);
  await click("action('data-reset-board')");
  await evaluate(`check(q('#board-management-feedback').textContent.includes('Fervent and refund ' + leafPoints)
    && document.activeElement === action('data-cancel-reset'), 'Confirmation names the board and exact cost, with Cancel focused');`);
  await click("action('data-cancel-reset')");
  assert.equal(await evaluate("raw()"), savedBranch);
  await click("action('data-reset-board')");
  await evaluate(`localStorage.setItem(${JSON.stringify(v2)}, JSON.stringify({...save(), testOtherTab: true}));`);
  await click("action('data-confirm-reset')");
  await evaluate(`check(points() === preResetPoints && save().testOtherTab
    && q('#board-management-feedback').textContent.includes('stored connected draft changed'), 'Save conflict leaves live allocations and newer draft intact');
    localStorage.setItem(${JSON.stringify(v2)}, ${JSON.stringify(savedBranch)});`);
  await click("action('data-confirm-reset')");
  await until(() => evaluate("!menu().open"));
  const afterLeafReset = await evaluate("raw()");
  const expectedLeaf = JSON.parse(savedBranch);
  expectedLeaf.boards.find(board => board.boardId === "board03").allocatedSourceIndices = [];
  assert.deepEqual(JSON.parse(afterLeafReset), expectedLeaf);
  await evaluate(`check(points() === preResetPoints - leafPoints && q('#total-stats-list').textContent !== preResetStats
    && !tip(gate('board03',178)).includes('Conditional bonus is active.'), 'Reset updates points, stats and thresholds');`);
  await reload();
  assert.equal(await evaluate("raw()"), afterLeafReset);
  await evaluate(`check(!gate('board03',178).matches('.node--allocated'), 'Board reset persists on reload');
    q('#allocation-reset').click(); gate('board00',283).click();`);
  await click("manage('board00')");
  await evaluate(`check(!action('data-rotation-step') && !action('data-remove-board'), 'Starting Board only offers applicable actions');`);
  await click("action('data-reset-board')");
  await click("action('data-confirm-reset')");
  await until(() => evaluate("!menu().open"));
  await evaluate(`check(points() === 0 && save().boards.length === 4 && save().boards[0].allocatedSourceIndices.join() === '304',
    'Safe Starting reset preserves the free mandatory root and the topology');`);
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
  await tap("manage('board01')");
  await tap("action('data-rotation-step=\"90\"')");
  await until(() => evaluate("save().boards[1].rotation === 180"));
  await tap("q('#board-management-close')");
  await evaluate("checkControls()");
  await screenshot("mobile-castle-tight-inset");
  await tap("manage('board01')");
  await tap("action('data-rotation-step=\"-90\"')");
  await until(() => evaluate("save().boards[1].rotation === 90"));
  await tap("q('#board-management-close')");
  await tap("gate('board01',10)");
  await evaluate("check(!pick().open, 'Touch on a free gate invokes allocation')");
  await tap("attach('board01',10)");
  await until(() => evaluate("pick().open"));
  await tap("option('board02')");
  await until(() => evaluate("save().boards.length === 3 && !pick().open"));
  await evaluate("check(points() === 1, 'Touch attachment preserves allocation')");
  await screenshot("mobile-three-boards");
  await tap("q('#zoom-in')");
  await screenshot("mobile-zoomed");
  await tap("q('#zoom-reset')");
  await tap("manage('board01')");
  await screenshot("mobile-management");
  await tap("action('data-rotation-step=\"-90\"')");
  await until(() => evaluate("save().boards[1].rotation === 0 && save().boards[2].rotation === 270"));
  await evaluate("checkControls(false)");
  await tap("q('#board-management-close')");
  const rotated = await evaluate("raw()");
  await reload();
  assert.equal(await evaluate("raw()"), rotated);
  await evaluate(`check(header('board02').querySelector('output').textContent === '270°' && points() === 1,
    'Reload restores descendant rotation and allocation');`);

  for (const invalid of ["{", '{"version":3}']) {
    await evaluate(`localStorage.setItem(${JSON.stringify(v2)},${JSON.stringify(invalid)});`);
    await reload();
    await evaluate(`check(q('#save-status').textContent === 'Connected save unavailable', 'Unreadable v2 reported');
      attach('board00',10).click(); option('board05').click();`);
    assert.equal(await evaluate("raw()"), invalid);
    assert.equal(await evaluate(`localStorage.getItem(${JSON.stringify(v1)})`), legacy);
  }
  await send("Page.navigate", { url: base + "?inspect=1" });
  await until(() => evaluate(`!document.querySelector('#board-inspector-controls')?.hidden
    && document.querySelector('#board-selector option:last-child')?.disabled === false`));
  await evaluate(`(async () => {
    const select = selector => document.querySelector(selector);
    const boardSelector = select('#board-selector');
    const exportedButton = select('#export-build');
    if (select('#connected-mode-toggle').getAttribute('aria-pressed') !== 'false'
      || exportedButton.disabled || select('#import-build').disabled
      || boardSelector.options.length !== 10) throw new Error('Diagnostic route preserves single-board tools');
    const draft = localStorage.getItem(${JSON.stringify(v2)});
    const create = URL.createObjectURL;
    const clickAnchor = HTMLAnchorElement.prototype.click;
    let blob;
    URL.createObjectURL = value => { blob = value; return 'blob:board-test'; };
    HTMLAnchorElement.prototype.click = () => {};
    try { exportedButton.click(); }
    finally { URL.createObjectURL = create; HTMLAnchorElement.prototype.click = clickAnchor; }
    const exported = JSON.parse(await blob.text());
    if (exported.schemaVersion !== 1 || exported.boardSnoId !== 2436481 || exported.allocatedNodeIndices.join() !== '304') {
      throw new Error('Board 00 export preserves historical source indices');
    }
    exported.allocatedNodeIndices.push(283);
    const transfer = new DataTransfer();
    transfer.items.add(new File([JSON.stringify(exported)], 'board.json', {type:'application/json'}));
    const input = select('#build-file');
    input.files = transfer.files;
    input.dispatchEvent(new Event('change', {bubbles:true}));
    for (let i = 0; i < 20 && select('#points-spent').textContent !== '1'; i++) {
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    if (select('#points-spent').textContent !== '1' || localStorage.getItem(${JSON.stringify(v2)}) !== draft) {
      throw new Error('Board 00 import restores its points independently of the connected draft');
    }
  })()`);
  await send("Page.navigate", { url: base + "#connected" });
  await ready();
  await evaluate("check(location.hash === '#connected' && q('#board-inspector-controls').hidden, 'Historical route opens the planner')");
  missing = "/paladin-board-08.json";
  await evaluate(`localStorage.setItem(${JSON.stringify(v2)},${JSON.stringify(savedBranch)});`);
  await reload();
  await evaluate(`check(q('#save-status').textContent === 'Connected save unavailable', 'Missing resources protect the draft');
    attach('board00',10).click(); option('board05').click();`);
  assert.equal(await evaluate("raw()"), savedBranch);
  missing = null;
  await reload();
  await evaluate("check(points() > 0 && gate('board03',178).classList.contains('node--allocated'), 'Draft restores when resources return')");

  await t.test("glyph sockets in connected and inspector views", async () => {
    const glyphDraft = {
      version: 2, sourceRevision: revision,
      boards: [{
        instanceId: "board00", boardId: "board00", placementIndex: 0, rotation: 0, incoming: null,
        allocatedSourceIndices: [304, 303, 282, 281, 260, 239, 240, 219, 198, 177, 178, 157]
      }]
    };
    await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1050, deviceScaleFactor: 1, mobile: false });
    await send("Emulation.setTouchEmulationEnabled", { enabled: false });
    await evaluate(`localStorage.setItem(${JSON.stringify(v2)}, ${JSON.stringify(JSON.stringify(glyphDraft))});`);
    await reload();
    const startingSocket = "gate('board00',136)";
    const castleSocket = "gate('board01',120)";
    async function captureRadius(name) {
      // Let the dialog's asynchronous close event restore focus before dismissing its tooltip.
      await evaluate("new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))");
      await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 2, y: 2 });
      await evaluate(`q('#board-stage').focus({preventScroll:true}); document.dispatchEvent(new KeyboardEvent('keydown', {key:'Escape'}));`);
      await screenshot(name);
    }
    const installGlyphChecks = () => evaluate(`
      window.glyphPicker = () => q('#glyph-picker');
      window.glyphStats = () => {
        const nativeDiagnostics = q('.advanced-details__content').cloneNode(true);
        nativeDiagnostics.querySelector('#glyph-calculation-details').remove();
        return JSON.stringify([points(), q('#allocated-count').textContent, q('#total-stats-list').textContent,
          nativeDiagnostics.textContent, tip(gate('board00',239))]);
      };
      window.glyphSearch = value => {
        const input = q('#glyph-search'); input.value = value; input.dispatchEvent(new Event('input', {bubbles:true}));
      };
      window.glyphChoice = id => q('#glyph-options [data-glyph-sno-id="' + id + '"]');
      window.glyphFor = boardId => save().boards.find(board => board.boardId === boardId)?.glyph;
      window.radiusFor = socket => qa('.glyph-radius-layer polygon').find(diamond =>
        diamond.dataset.boardInstanceId === socket.dataset.boardInstanceId && diamond.dataset.socketSourceIndex === socket.dataset.nodeIndex);
      window.checkRadius = (socket, radius, rarity) => {
        const diamond = radiusFor(socket);
        check(diamond?.dataset.radius === String(radius) && diamond.dataset.rarity === rarity, 'Derived radius and rarity are rendered');
        const marker = socket.getBoundingClientRect(), outline = diamond.getBoundingClientRect();
        check(Math.abs((marker.left + marker.right - outline.left - outline.right) / 2) < 1
          && Math.abs((marker.top + marker.bottom - outline.top - outline.bottom) / 2) < 1, 'Radius follows the socket center');
        check(getComputedStyle(diamond).pointerEvents === 'none' && diamond.closest('svg').getAttribute('aria-hidden') === 'true',
          'The radius is a decorative layer');
      };
      window.enterGlyphLevel = value => {
        const field = q('#glyph-level'); field.value = value; field.dispatchEvent(new Event('input', {bubbles:true}));
      };
      window.checkGlyph = (boardId, id, level) => check(glyphFor(boardId)?.snoId === id && glyphFor(boardId).level === level,
        'Glyph configuration belongs to ' + boardId);
    `);
    await installGlyphChecks();
    const before = await evaluate("glyphStats()");
    await evaluate(`
      window.glyphBefore = glyphStats(); window.frameBeforeGlyph = q('#board-frame').style.transform;
      check(!${startingSocket}.querySelector('.glyph-emblem'), 'Empty socket has no glyph icon');
      q('#board-stage').focus({preventScroll:true});
      gate('board00',239).dispatchEvent(new PointerEvent('pointerleave'));
    `);
    await screenshot("glyph-desktop-empty");
    await evaluate(`${startingSocket}.focus({preventScroll:true});`);
    await key("Enter", "Enter", 13);
    await evaluate(`
      check(glyphPicker().open && qa('#glyph-options button').length === 21, 'Socket opens the complete catalogue');
      check(q('#glyph-picker-note').textContent.includes('when the socket is allocated'), 'Calculation scope is visible');
      glyphSearch('  challe '); check(qa('#glyph-options button').length === 1, 'Search uses the glyph name');
      glyphChoice(2073373).click();
      check(qa('#glyph-bonus-descriptions h4').map(node=>node.textContent).join() === 'Primary,Additional,Legendary',
        'Three sections describe the authored bonuses');
      check(q('#glyph-progression').textContent.includes('Radius 3 · Rare · Next radius at level 25')
        && q('.glyph-legendary-status').textContent.includes('Locked'), 'Low level previews a locked Legendary bonus');
      check(q('.glyph-requirement').textContent.includes('40 Strength'), 'Additional requirement is shown');
      check(q('.glyph-additional-effects').textContent.includes('Unpurchased socket')
        && q('.glyph-additional-effects').textContent.includes('18%[x]'), 'Unpurchased sockets show passive parameters');
      check(q('.glyph-legendary-effect').textContent.includes('Locked preview until level 51')
        && q('.glyph-legendary-effect').textContent.includes('8.6%[x]'), 'Locked Legendary displays the level-51 preview');
      q('#glyph-level').value = '151'; q('#glyph-save').click();
      check(glyphPicker().open && q('#glyph-level').getAttribute('aria-invalid') === 'true' && !glyphFor('board00'),
        'Out-of-range level is rejected without saving');
      q('#glyph-level').value = '25'; q('#glyph-save').click();
    `);
    await until(() => evaluate(`!glyphPicker().open && document.activeElement === ${startingSocket}`));
    await evaluate(`
      checkGlyph('board00', 2073373, 25);
      checkRadius(${startingSocket}, 4, 'rare');
      check(${startingSocket}.querySelector('.glyph-emblem').textContent === 'CL' &&
        !${startingSocket}.matches('.node--allocated'), 'The occupied marker preserves its unallocated state');
      check(glyphStats() === glyphBefore && q('#board-frame').style.transform === frameBeforeGlyph,
        'Glyph equip preserves points, bonuses, Rare activation and viewport');
      ${startingSocket}.blur();
      ${startingSocket}.dispatchEvent(new PointerEvent('pointerleave'));
      gate('board00',239).dispatchEvent(new PointerEvent('pointerleave'));
    `);
    await screenshot("glyph-desktop-occupied");
    await captureRadius("glyph-desktop-radius-4");
    await click(startingSocket);
    await screenshot("glyph-desktop-picker");
    await evaluate(`
      enterGlyphLevel(50);
      check(q('#glyph-progression').textContent.includes('Radius 4 · Rare · Next radius at level 51'), 'Level 50 stays Rare');
      check(q('.glyph-legendary-effect').textContent.includes('Locked preview'), 'Level 50 keeps the Legendary modifier locked');
      enterGlyphLevel(51);
      check(q('.glyph-legendary-effect').textContent.includes('Unpurchased socket preview'), 'Level 51 still needs a purchased socket');
      check(q('#glyph-progression').textContent.includes('Radius 5 · Legendary')
        && q('.glyph-legendary-status').textContent.includes('8.6%[x]'), 'Level 51 previews Legendary immediately');
      enterGlyphLevel(150);
      check(q('#glyph-progression').textContent.includes('Maximum level'), 'Maximum glyph level is shown');
      q('#glyph-save').click();
      checkGlyph('board00', 2073373, 150);
      check(glyphStats() === glyphBefore, 'Level editing preserves every displayed numerical result');
      checkRadius(${startingSocket}, 5, 'legendary');
      document.activeElement.blur(); document.dispatchEvent(new KeyboardEvent('keydown', {key:'Escape'}));
    `);
    await captureRadius("glyph-desktop-radius-5");
    const panStart = await evaluate(`(() => {
      const socket = ${startingSocket}.getBoundingClientRect();
      const cellSize = radiusFor(${startingSocket}).getBoundingClientRect().width / 11;
      const x = socket.x + socket.width / 2, y = socket.y + socket.height / 2 - cellSize;
      check(document.elementFromPoint(x,y)?.matches('.board-cell'), 'An empty cell inside the radius receives canvas events');
      window.beforeRadiusPan = q('#board-frame').style.transform;
      return {x,y};
    })()`);
    const panEnd = { x: panStart.x + 48, y: panStart.y + 24 };
    await send("Input.dispatchMouseEvent", { type: "mousePressed", button: "left", clickCount: 1, ...panStart });
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", buttons: 1, ...panEnd });
    await send("Input.dispatchMouseEvent", { type: "mouseReleased", button: "left", clickCount: 1, ...panEnd });
    await evaluate(`check(q('#board-frame').style.transform !== beforeRadiusPan, 'Drag through the radius pans the board');
      checkRadius(${startingSocket}, 5, 'legendary'); q('#zoom-reset').click();`);
    await evaluate(`
      const toggle = q('#show-glyph-radii');
      toggle.click(); check(!radiusFor(${startingSocket}) && glyphFor('board00').level === 150, 'Visibility only hides the radius');
      toggle.click(); q('#zoom-in').click(); checkRadius(${startingSocket}, 5, 'legendary'); q('#zoom-reset').click();
      ${startingSocket}.click(); glyphChoice(2478228).click();
      check(q('#glyph-level').value === '1' && q('#glyph-save').textContent === 'Replace glyph', 'Replacement previews a fresh level');
      q('#glyph-save').click();
      checkGlyph('board00', 2478228, 1);
      checkRadius(${startingSocket}, 3, 'rare');
      check(glyphStats() === glyphBefore, 'Replacing a glyph preserves all displayed numerical results');
      document.activeElement.blur(); document.dispatchEvent(new KeyboardEvent('keydown', {key:'Escape'}));
    `);
    await captureRadius("glyph-desktop-radius-3");
    await reload();
    await installGlyphChecks();
    await evaluate(`
      check(glyphStats() === ${JSON.stringify(before)}, 'Numeric node data restores unchanged');
      check(${startingSocket}.getAttribute('aria-label').includes('Law, level 1'), 'Glyph and level restore on the original socket');
      checkRadius(${startingSocket}, 3, 'rare');
      ${startingSocket}.click(); q('#glyph-remove').click();
      check(!glyphFor('board00') && !${startingSocket}.querySelector('.glyph-emblem') && !radiusFor(${startingSocket}),
        'Removal clears the glyph field, emblem and radius');
      ${startingSocket}.click(); q('#glyph-allocate-socket').click();
      check(${startingSocket}.matches('.node--allocated') && points() === 12, 'Explicit socket allocation uses one existing point');
      q('#glyph-picker-close').click();
      gate('board00',135).click();
      ${startingSocket}.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true}));
      check(${startingSocket}.matches('.node--allocated') && q('#allocation-message').textContent.includes('disconnect'), 'Socket refund protects descendants');
      gate('board00',135).dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true}));
      ${startingSocket}.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true}));
      check(!${startingSocket}.matches('.node--allocated') && points() === 11, 'Ordinary socket refund returns the existing point');
    `);
    await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 740, deviceScaleFactor: 1, mobile: true });
    await send("Emulation.setTouchEmulationEnabled", { enabled: true });
    await evaluate("q('#zoom-reset').click(); center();");
    await screenshot("glyph-mobile-empty");
    await tap(startingSocket);
    await evaluate(`check(glyphPicker().open, 'Touch opens the socket'); glyphSearch('Honed'); glyphChoice(2477896).click();
      check(q('.glyph-requirement').textContent.includes('25 Intelligence'), 'Honed uses Intelligence');`);
    await screenshot("glyph-mobile-picker");
    await tap("q('#glyph-save')");
    await until(() => evaluate("!glyphPicker().open"));
    await evaluate("q('#board-stage').focus({preventScroll:true}); gate('board00',136).dispatchEvent(new PointerEvent('pointerleave'));");
    await screenshot("glyph-mobile-occupied");
    await screenshot("glyph-mobile-radius-3");
    for (const [level, radius, rarity] of [[25, 4, "rare"], [51, 5, "legendary"], [1, 3, "rare"]]) {
      await tap(startingSocket);
      await evaluate(`enterGlyphLevel(${level});`);
      await tap("q('#glyph-save')");
      await until(() => evaluate("!glyphPicker().open"));
      await evaluate(`checkRadius(${startingSocket}, ${radius}, '${rarity}'); document.dispatchEvent(new KeyboardEvent('keydown', {key:'Escape'}));`);
      if (radius > 3) await screenshot(`glyph-mobile-radius-${radius}`);
    }
    await send("Emulation.setDeviceMetricsOverride", { width: 320, height: 640, deviceScaleFactor: 1, mobile: true });
    await evaluate("q('#zoom-reset').click(); center();");
    await tap(startingSocket);
    await evaluate(`const content = q('.glyph-picker-content');
      check(content.scrollHeight > content.clientHeight, 'Narrow picker can scroll its content');
      content.scrollTop = content.scrollHeight;
      check(content.scrollTop > 0 && q('#glyph-save').getBoundingClientRect().bottom <= innerHeight, 'Narrow picker keeps actions accessible');`);
    await screenshot("glyph-mobile-narrow-picker");
    await tap("q('#glyph-picker-close')");
    await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1050, deviceScaleFactor: 1, mobile: false });
    await send("Emulation.setTouchEmulationEnabled", { enabled: false });
    await evaluate(`
      q('#zoom-reset').click(); center(); attach('board00',10).click(); option('board01').click();
      ${castleSocket}.click(); glyphChoice(2477896).click(); enterGlyphLevel(51); q('#glyph-save').click();
      checkGlyph('board00', 2477896, 1); checkGlyph('board01', 2477896, 51);
      checkRadius(${startingSocket}, 3, 'rare'); checkRadius(${castleSocket}, 5, 'legendary');
      window.castleInstance = ${castleSocket}.dataset.boardInstanceId;
      manage('board01').click(); action('data-rotation-step="90"').click();
    `);
    await evaluate(`check(save().boards[1].rotation === 90 && ${castleSocket}.dataset.boardInstanceId === castleInstance,
        'Rotation preserves the socket identity'); q('#board-management-close').click();
      checkGlyph('board01', 2477896, 51); checkRadius(${castleSocket}, 5, 'legendary');
      q('#allocation-reset').click(); checkGlyph('board00', 2477896, 1); checkGlyph('board01', 2477896, 51); checkRadius(${startingSocket}, 3, 'rare');
      q('#zoom-reset').click(); center();`);
    await screenshot("glyph-desktop-multiple-radii");
    await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 740, deviceScaleFactor: 1, mobile: true });
    await evaluate("q('#zoom-reset').click(); center();");
    await screenshot("glyph-mobile-multiple-radii");
    await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1050, deviceScaleFactor: 1, mobile: false });
    await reload();
    await installGlyphChecks();
    await evaluate(`checkRadius(${startingSocket}, 3, 'rare'); checkRadius(${castleSocket}, 5, 'legendary'); manage('board01').click();`);
    acceptConfirmation = true;
    await click("action('data-remove-board')");
    await until(() => evaluate("!gate('board01',120)"));
    await evaluate(`checkGlyph('board00', 2477896, 1);
      attach('board00',10).click(); option('board01').click();
      check(!glyphFor('board01') && !${castleSocket}.querySelector('.glyph-emblem'), 'Reattaching creates a fresh glyph socket');
      const bad = save(); bad.boards[1].glyph = {snoId:2479231,level:1};
      localStorage.setItem(${JSON.stringify(v2)}, JSON.stringify(bad));`);
    const invalidGlyphDraft = await evaluate("raw()");
    await reload();
    await installGlyphChecks();
    await evaluate(`
      check(q('#allocation-message').textContent.includes('Invalid or obsolete glyph data') && !${castleSocket}.querySelector('.glyph-emblem'),
        'Malformed glyph warning preserves the loaded board');
      check(${startingSocket}.querySelector('.glyph-emblem'), 'A valid assignment survives a malformed neighbor');
    `);
    assert.equal(await evaluate("raw()"), invalidGlyphDraft);
    await evaluate(`
      ${startingSocket}.click(); q('#glyph-level').value = '2';
      localStorage.setItem(${JSON.stringify(v2)}, JSON.stringify({...save(), otherTab: true}));
      q('#glyph-save').click(); check(glyphPicker().open && q('#glyph-feedback').textContent.includes('changed'),
        'A concurrent save conflict rejects the glyph edit');
      check(${startingSocket}.getAttribute('aria-label').includes('level 1') && save().otherTab, 'Live and saved state remain intact');
    `);
    await send("Page.navigate", { url: base + "?inspect=1" });
    await until(() => evaluate("document.querySelector('#board-selector option:last-child')?.disabled === false"));
    await evaluate(`(() => {
      const savedSingle = localStorage.getItem(${JSON.stringify(single)});
      const q = selector => document.querySelector(selector);
      q('.node[data-node-index="136"]').click();
      if (q('#glyph-session-note').hidden) throw new Error('Inspector explains session-only edits');
      q('#glyph-save').click();
      if (!q('.node[data-node-index="136"] .glyph-emblem') || localStorage.getItem(${JSON.stringify(single)}) !== savedSingle) {
        throw new Error('Inspector glyphs preserve independent storage');
      }
    })()`);
  });
  await t.test("an allocated Canny socket applies and explains the 22-Intelligence Primary", async () => {
    const indices = [304,303,282,281,260,239,240,219,198,177,178,157,136,137,116,95,96,135,134,179];
    const draft = { version: 2, sourceRevision: revision, boards: [{
      instanceId: "board00", boardId: "board00", placementIndex: 0, rotation: 0, incoming: null,
      allocatedSourceIndices: indices, glyph: { snoId: 1029487, level: 150 }
    }] };
    await evaluate(`localStorage.setItem(${JSON.stringify(v2)}, ${JSON.stringify(JSON.stringify(draft))});`);
    await send("Page.navigate", { url: base });
    await ready();
    await evaluate(`
      window.cannyRow = () => q('[data-stat-key="raw:nonPhysicalDamage"]');
      window.cannyValue = () => cannyRow()?.querySelector('strong').textContent;
      window.socket = () => gate('board00',136);
      check(cannyValue() === '+53.0%', 'Active socket is counted once in Total Stats');
      check(q('#glyph-calculation-list').textContent.includes('22 purchased Intelligence'), 'Advanced diagnostics show the local pool');
      check(tip(gate('board00',96)).includes('Canny Primary · +16.9%') && q('#node-tooltip').textContent.includes('+7'),
        'Magic node tooltip shows its glyph and native contributions separately');
      cannyRow().scrollIntoView({block:'nearest',container:'nearest'}); cannyRow().focus({preventScroll:true});
      check(qa('.node--stat-highlight').length === 4, 'Only the four local contributors highlight');
      cannyRow().blur(); tip(gate('board00',96));
    `);
    await evaluate("new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))");
    await screenshot("glyph-primary-desktop-node-and-total");
    await evaluate(`socket().click();
      check(q('#glyph-picker .glyph-primary-result').textContent.includes('Applied Primary') && q('#glyph-picker .glyph-primary-result').textContent.includes('+53.0%'),
        'Socket panel shows the applied total');
      check(q('.glyph-additional-progress').textContent.includes('22/25')
        && q('.glyph-additional-effects').textContent.startsWith('Unmet'), 'Canny Additional remains unmet');
      check(q('.glyph-legendary-effect').textContent.includes('Applied · 15.4%[x] Non-Physical damage'),
        'Legendary applies independently of the Additional requirement');
      check(q('#glyph-calculation-list').textContent.includes('[257/-1]') && q('#glyph-calculation-list').textContent.includes('Operator 7'),
        'Advanced details retain native Legendary identity and operator');`);
    await screenshot("glyph-primary-desktop-socket");
    await evaluate(`q('#glyph-picker-close').click();
      gate('board00',179).dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true}));
      check(cannyValue() === '+41.0%', 'Refunding a contributor updates the aggregate');
      gate('board00',179).click(); check(cannyValue() === '+53.0%', 'Repurchasing restores the contribution');
      socket().click(); q('#glyph-options [data-glyph-sno-id="2073373"]').click(); q('#glyph-save').click();
      check(!cannyRow() && q('#glyph-calculation-list').textContent.includes('Challenger'), 'Replacing Canny clears its category and shows amplification');`);
    await evaluate(`localStorage.setItem(${JSON.stringify(v2)}, ${JSON.stringify(JSON.stringify(draft))});`);
    await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 740, deviceScaleFactor: 1, mobile: true });
    await send("Emulation.setTouchEmulationEnabled", { enabled: true });
    await reload();
    await evaluate(`q('[data-stat-key="raw:nonPhysicalDamage"]').scrollIntoView({block:'nearest',container:'nearest'}); tip(gate('board00',96));`);
    await evaluate("new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))");
    await screenshot("glyph-primary-mobile-node-and-total");
    await tap("gate('board00',136)");
    await evaluate(`check(q('#glyph-picker .glyph-primary-result').textContent.includes('+53.0%'), 'Mobile shows the restored socket total');
      check(q('.glyph-legendary-effect').textContent.includes('Applied · 15.4%[x]'), 'Mobile preserves the applied Legendary record after reload');
      q('.glyph-legendary-effect').scrollIntoView({block:'nearest',container:'nearest'});
      const effects = q('.glyph-legendary-effect').getBoundingClientRect(), panel = q('.glyph-preview').getBoundingClientRect();
      check(effects.top >= panel.top && effects.bottom <= panel.bottom, 'Mobile Legendary preview can scroll fully into view');`);
    await screenshot("glyph-primary-mobile-socket");
    await evaluate(`q('#glyph-remove').click();
      check(!q('[data-stat-key="raw:nonPhysicalDamage"]') && !save().boards[0].glyph, 'Removing the glyph clears its calculated and saved state');`);
  });
  await t.test("Normal, Magic and Rare amplification on desktop and touch layouts", async () => {
    await evaluate(`(async () => {
      const { createStartingLayout, attachBoard, writeConnectedSaveV2 } = await import('./connected-boards.js');
      const { mergeSharedNodeDefinitions } = await import('./shared-node-definitions.js');
      const resources = new Map();
      for (const suffix of ['00','01','02']) {
        const board = await (await fetch('../paladin-board-' + suffix + '.json')).json();
        const file = suffix === '00' ? 'node-data.json' : 'node-data-' + suffix + '.json';
        const database = mergeSharedNodeDefinitions(await (await fetch(file)).json());
        resources.set('board' + suffix, { board, database });
      }
      const start = createStartingLayout(resources);
      const castle = attachBoard(resources, start, new Set([start.root]), 'board00:10', 'board01', 'castle');
      const layout = attachBoard(resources, castle, new Set([start.root]), 'castle:230', 'board02', 'shield');
      const parents = new Map([[layout.root, null]]);
      const queue = [layout.root];
      for (let cursor = 0; cursor < queue.length; cursor++) {
        const id = queue[cursor];
        for (const neighbor of layout.graph.get(id)) {
          if (parents.has(neighbor)) continue;
          parents.set(neighbor, id);
          queue.push(neighbor);
        }
      }
      const allocated = new Set([layout.root]);
      for (const target of ['board00:93','board00:133','board00:136','board00:139','board00:156','board00:157',
        'board00:159','board00:177','castle:78','castle:120','shield:261','shield:264']) {
        check(parents.has(target), 'Amplification fixture cell is reachable');
        for (let id = target; !allocated.has(id); id = parents.get(id)) allocated.add(id);
      }
      const glyphs = new Map([['board00',{snoId:2073373,level:31}],['castle',{snoId:2478548,level:1}],['shield',{snoId:2506253,level:1}]]);
      localStorage.setItem(${JSON.stringify(v2)}, JSON.stringify(writeConnectedSaveV2(layout, allocated, glyphs)));
    })()`);
    const painted = () => evaluate("new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))");
    const views = [[1440, 1050, false, "desktop"], [390, 740, true, "mobile"]];
    const samples = [
      ["normal", "board00", 157, 136, "44.3% Normal", "Strength", "core:Strength"],
      ["magic", "board01", 78, 120, "30.0% Magic", "Intelligence", "core:Intelligence"],
      ["rare", "board02", 261, 264, "25.0% Rare", "Thorns", "raw:thorns"]
    ];
    for (const [width, height, mobile, viewport] of views) {
      await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
      await send("Emulation.setTouchEmulationEnabled", { enabled: mobile });
      await reload();
      for (const [rarity, board, index, socket, heading, attribute, stat] of samples) {
        const node = `gate('${board}',${index})`;
        const socketNode = `gate('${board}',${socket})`;
        await evaluate(`(() => { center(); const nodeTip = tip(${node});
          check(${node}.classList.contains('node--amplified') && nodeTip.includes('Glyph amplification') && nodeTip.includes('Effective'),
            'Highlighted purchased node distinguishes its native and amplified values');
          check(q('[data-stat-key="${stat}"]').textContent.includes('${attribute}'), 'Updated stat appears in Total Stats');
          q('[data-stat-key="${stat}"]').scrollIntoView({block:'nearest',container:'nearest'});
          if ('${rarity}' === 'rare') check(nodeTip.includes('Conditional amplification unresolved'), 'Rare tooltip identifies provisional conditional policy'); })()`);
        await painted();
        if (mobile) await evaluate(`check(q('#node-tooltip').getBoundingClientRect().top > q('.zoom-controls').getBoundingClientRect().bottom,
          'Amplified node tooltip clears the mobile zoom buttons')`);
        await screenshot(`glyph-amplification-${viewport}-${rarity}-node`);
        await evaluate(`(() => {
          const detail = tip(${socketNode});
          check(detail.includes('${heading}') && detail.includes('${attribute}'), 'Socket tooltip shows magnitude, target and aggregate');
          if ('${rarity}' === 'normal') check(detail.includes('Additional') && detail.includes('satisfied')
            && detail.includes('Granted · 18%[x]') && detail.includes('Locked preview until level 51'), 'Challenger shows granted passive and locked Legendary');
          ${socketNode}.click();
          check(q('#glyph-picker .glyph-socket-summary').textContent.includes('${attribute}'), 'Picker shows socket totals');
          q('#glyph-picker .glyph-additional-progress').scrollIntoView({block:'end',container:'nearest'});
        })()`);
        await painted();
        await screenshot(`glyph-amplification-${viewport}-${rarity}-socket`);
        await evaluate("q('#glyph-picker-close').click()");
        if (rarity === "rare") {
          await evaluate(`${socketNode}.blur();
            ${socketNode}.dispatchEvent(new PointerEvent('pointerleave'));
            q('[data-stat-key="raw:thorns"]').scrollIntoView({block:'nearest',container:'nearest'});
            check(q('[data-stat-key="raw:thorns"] strong').textContent === '+437.5', 'Effective Thorns includes the amplified base once');`);
          await painted();
          await screenshot(`glyph-amplification-${viewport}-total-stats`);
        }
      }
      await evaluate(`q('.advanced-details').open = true;
        q('#glyph-calculation-list details').open = true;
        check(q('#glyph-calculation-list').textContent.includes('0.44255')
          && q('#glyph-calculation-list').textContent.includes('Active conditional')
          && q('#amplification-global-details').textContent.includes('Exact global threshold inputs'), 'Diagnostics preserve exact component and global values');
        check(qa('#glyph-calculation-list p').every(line => line.scrollWidth <= line.clientWidth + 1),
          'Glyph evidence and typed destinations wrap within Advanced Calculation Details');
        q('#glyph-calculation-details').scrollIntoView({block:'start'});`);
      await painted();
      await screenshot(`glyph-amplification-${viewport}-advanced`);
    }
  });
  await t.test("Legendary board effects show isolated scenario previews on desktop and mobile", async () => {
    await evaluate(`(async () => {
      const { createStartingLayout, attachBoard, writeConnectedSaveV2 } = await import('./connected-boards.js');
      const { mergeSharedNodeDefinitions } = await import('./shared-node-definitions.js');
      const resources = new Map();
      for (const suffix of ['00', '01', '02']) {
        const board = await (await fetch('../paladin-board-' + suffix + '.json')).json();
        const file = suffix === '00' ? 'node-data.json' : 'node-data-' + suffix + '.json';
        const database = mergeSharedNodeDefinitions(await (await fetch(file)).json());
        resources.set('board' + suffix, { board, database });
      }
      const start = createStartingLayout(resources);
      const castle = attachBoard(resources, start, new Set([start.root]), 'board00:10', 'board01', 'castle');
      const layout = attachBoard(resources, castle, new Set([start.root]), 'castle:230', 'board02', 'shield');
      const parents = new Map([[layout.root, null]]);
      const queue = [layout.root];
      for (const id of queue) for (const neighbor of layout.graph.get(id)) if (!parents.has(neighbor)) {
        parents.set(neighbor, id);
        queue.push(neighbor);
      }
      const allocated = new Set([layout.root]);
      for (const target of ['castle:320', 'shield:198']) {
        check(parents.has(target), 'Legendary fixture node is reachable');
        for (let id = target; !allocated.has(id); id = parents.get(id)) allocated.add(id);
      }
      allocated.delete('shield:198');
      localStorage.setItem(${JSON.stringify(v2)}, JSON.stringify(writeConnectedSaveV2(layout, allocated)));
    })()`);
    for (const [width, height, mobile] of [[1440, 1050, false], [390, 740, true]]) {
      await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
      await send("Emulation.setTouchEmulationEnabled", { enabled: mobile });
      await reload();
      await evaluate(`
        window.castleEffect = () => qa('#legendary-board-effect-list > li')[0].textContent;
        window.shieldEffect = () => qa('#legendary-board-effect-list > li')[1].textContent;
        check(castleEffect().includes('Allocated · Granted') && castleEffect().includes('Indeterminate'),
          'Reload derives the allocated Castle record with unknown inputs');
        check(shieldEffect().includes('Unallocated preview') && shieldEffect().includes('Source passive Phalanx'),
          'Shield Bearer remains an unallocated preview');
        const hover = tip(gate('board01',320));
        check(q('#node-tooltip h2').textContent === 'Castle' && hover.includes('125%') && hover.includes('Indeterminate'),
          'Legendary socket-independent tooltip shows node name, rule and status');
        window.originalLegendarySave = raw();
        window.originalLegendaryStats = q('#total-stats-list').textContent;
        q('.advanced-details').open = true;
        q('#legendary-scenario').open = true;
        q('#legendary-scenario').scrollIntoView({block:'center'});
        check(q('#legendary-scenario-fortified').closest('label').hidden,
          'Scenario displays inputs for the equipped Legendary boards');
      `);
      const setInput = (key, value) => evaluate(`
        q('#legendary-scenario-${key}').value = '${value}';
        q('#legendary-scenario-${key}').dispatchEvent(new Event('input', {bubbles:true}));
      `);
      await setInput("armorDamageReduction", 30.66);
      await setInput("blockChance", 24.6);
      await evaluate(`
        check(castleEffect().includes('Current bonus · 38.3%[x]'), 'Castle shows rounded scenario output');
        const preview = tip(gate('board02',198));
        check(q('#node-tooltip h2').textContent === 'Shield Bearer' && preview.includes('Potential · 27.1%[x]')
          && !preview.includes('Current bonus'), 'Unallocated Shield Bearer presents only a potential effect');
        check(raw() === originalLegendarySave && q('#total-stats-list').textContent === originalLegendaryStats,
          'Scenario changes neither saves nor ordinary Total Stats');
        const panel = q('#legendary-scenario');
        check(panel.scrollWidth <= panel.clientWidth + 1, 'Scenario controls fit the viewport');
        panel.scrollIntoView({block:'start'});
      `);
      await screenshot(`legendary-board-${mobile ? "mobile" : "desktop"}`);
      await evaluate(`
        gate('board02',198).click();
        check(shieldEffect().includes('Allocated · Granted') && shieldEffect().includes('Current bonus · 27.1%[x]'),
          'Allocating grants the Shield Bearer component');
        gate('board02',198).dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true}));
        check(shieldEffect().includes('Unallocated preview') && !shieldEffect().includes('Current bonus'),
          'Refunding returns the component to preview');
        q('#legendary-scenario button').click();
        check(castleEffect().includes('Indeterminate'), 'Clearing inputs restores unknown state');
      `);
    }
  });
  assert.deepEqual(errors, []);
});
