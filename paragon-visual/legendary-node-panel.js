import { LEGENDARY_SCENARIO_FIELDS } from "./legendary-board-nodes.js";

const eligibility = {
  satisfied: "Eligible in scenario",
  "not-satisfied": "Condition not satisfied",
  unknown: "Indeterminate"
};

function appendText(parent, tag, text, className = "") {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  parent.append(element);
  return element;
}

function amount(effect, fraction) {
  const points = fraction * 100;
  const display = effect.authoredCap || effect.authoredInputCap ? points.toFixed(1) : Number(points.toFixed(3));
  const marker = { additive: "[+]", multiplicative: "[x]" }[effect.notation] ?? "";
  return `${display}%${marker}`;
}

function describeEffect(effect) {
  if (effect.currentMagnitude !== null) return `Current bonus · ${amount(effect, effect.currentMagnitude)} ${effect.scope}`;
  const potential = effect.magnitude === null
    ? effect.perStack === undefined ? "Needs scenario input" : `${amount(effect, effect.perStack)} per stack`
    : amount(effect, effect.magnitude);
  const state = effect.eligibilityStatus === "satisfied" && effect.grantStatus === "unallocated"
    ? "" : ` · ${eligibility[effect.eligibilityStatus]}`;
  return `Potential · ${potential} · ${effect.scope}${state}`;
}

const grantLabel = effect => effect.grantStatus === "granted" ? "Allocated · Granted" : "Unallocated preview";
const inputLabels = names => names.map(name => LEGENDARY_SCENARIO_FIELDS[name].label).join(" · ");

export function renderLegendaryNodeTooltip(tooltip, effects) {
  const [node] = effects;
  appendText(tooltip, "p", grantLabel(node), "tooltip-trait");
  appendText(tooltip, "p", node.description, "tooltip-trait");
  for (const effect of effects) appendText(tooltip, "p", describeEffect(effect), "tooltip-trait");
  const missing = new Set(effects.filter(effect => effect.eligibilityStatus === "unknown")
    .flatMap(effect => effect.requiredInputs.filter(key => effect.inputs[key] === null)));
  if (missing.size) appendText(tooltip, "p", `Scenario inputs · ${inputLabels([...missing])}`, "tooltip-formula-note");
}

export function createLegendaryNodePanel(details, onChange) {
  const scenarioPanel = details.querySelector("#legendary-scenario");
  const fieldsPanel = scenarioPanel.querySelector(".legendary-scenario-fields");
  const feedback = scenarioPanel.querySelector("#legendary-scenario-feedback");
  const effectsPanel = details.querySelector("#legendary-board-effects");
  const list = effectsPanel.querySelector("#legendary-board-effect-list");
  const controls = new Map();
  for (const [key, { label, unit }] of Object.entries(LEGENDARY_SCENARIO_FIELDS)) {
    const field = document.createElement("label");
    appendText(field, "span", unit === "fraction" ? `${label} (%)` : label);
    const input = document.createElement(unit === "boolean" ? "select" : "input");
    input.id = `legendary-scenario-${key}`;
    input.setAttribute("aria-describedby", "legendary-scenario-feedback");
    if (unit === "boolean") {
      for (const [value, text] of [["", "Unknown"], ["true", "Yes"], ["false", "No"]]) {
        const option = appendText(input, "option", text);
        option.value = value;
      }
    } else {
      input.type = "number";
      input.min = "0";
      input.step = unit === "count" ? "1" : "any";
      input.max = String(Number.MAX_SAFE_INTEGER);
      input.placeholder = "Unknown";
    }
    field.append(input);
    fieldsPanel.append(field);
    controls.set(key, { field, input, unit });
  }

  function readScenario() {
    const scenario = {};
    let invalid = false;
    for (const [key, { input, field, unit }] of controls) {
      if (input.validity.valid) input.removeAttribute("aria-invalid");
      else input.setAttribute("aria-invalid", "true");
      if (!input.validity.valid) {
        if (!field.hidden) invalid = true;
        continue;
      }
      if (input.value === "") continue;
      scenario[key] = unit === "boolean" ? input.value === "true" : input.valueAsNumber / (unit === "fraction" ? 100 : 1);
    }
    feedback.hidden = !invalid;
    return scenario;
  }

  fieldsPanel.addEventListener("input", () => onChange(readScenario()));
  scenarioPanel.querySelector("button").addEventListener("click", () => {
    for (const { input } of controls.values()) input.value = "";
    onChange(readScenario());
  });

  return {
    render(effects) {
      const groups = new Map();
      for (const effect of effects) {
        const key = `${effect.instanceId}:${effect.sourceIndex}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(effect);
      }
      const visible = new Set(effects.flatMap(effect => effect.requiredInputs));
      effectsPanel.hidden = groups.size === 0;
      scenarioPanel.hidden = visible.size === 0;
      for (const [key, { field }] of controls) field.hidden = !visible.has(key);
      feedback.hidden = ![...controls.values()].some(({ field, input }) => !field.hidden && !input.validity.valid);
      list.replaceChildren();
      for (const group of groups.values()) {
        const [node] = group;
        const item = document.createElement("li");
        appendText(item, "h3", node.nodeName);
        const passive = node.passiveLabel === node.nodeName ? "" : ` · Source passive ${node.passiveLabel}`;
        appendText(item, "p", `${grantLabel(node)}${passive}`, "legendary-node-status");
        appendText(item, "p", node.description);
        for (const effect of group) {
          appendText(item, "p", describeEffect(effect), "legendary-node-effect");
          if (effect.requiredInputs.length) appendText(item, "p", `Inputs · ${inputLabels(effect.requiredInputs)}`);
        }
        const diagnostics = document.createElement("details");
        appendText(diagnostics, "summary", "Formulas and evidence");
        appendText(diagnostics, "p", `Cell ${node.sourceIndex} · Node SNO ${node.nodeSnoId} · Power SNO ${node.powerSnoId}`);
        for (const effect of group) {
          appendText(diagnostics, "p", `${effect.formula} · ${effect.evidence === "tooltip-calibrated" ? "Tooltip-calibrated" : "Pinned source and player tooltip"}`);
        }
        for (const assumption of node.assumptions) appendText(diagnostics, "p", assumption);
        item.append(diagnostics);
        list.append(item);
      }
    }
  };
}
