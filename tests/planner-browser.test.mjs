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
  assert.deepEqual(errors, []);
});
