import { getPaladinGlyph, isGlyphConfiguration, paladinGlyphCatalogue } from "./paladin-glyph-catalogue.js";
import { getGlyphProgression, GLYPH_LEVEL_INPUT, LEGENDARY_GLYPH_LEVEL } from "./glyph-progression.js";

const { glyphs, affixes, thresholds } = paladinGlyphCatalogue;
const glyphInitials = {
  Challenger: "CL",
  Chip: "CP",
  Resplendence: "RS",
  Retribution: "RT",
  Revenge: "RV"
};

export function formatGlyphPrimary(value, destination) {
  const precision = { 256: 1, 1105: 1, 288: 0 }[destination.id];
  const display = precision === undefined ? Number(value.toFixed(2)) : value.toFixed(precision);
  return `+${display}%`;
}

export function formatAmplifiedCore(value) {
  return Math.trunc(value);
}

export function describeAdditionalRequirement(additional, includeHeading = true) {
  const values = additional.requirements.map(({ attribute, effective, required, resolved }) =>
    `${attribute.name.replace(/_Core$/, "")} ${resolved ? `${formatAmplifiedCore(effective)}/${required}` : "unresolved"}`);
  const status = additional.resolved ? additional.satisfied ? "satisfied" : "unmet" : "unresolved";
  return `${includeHeading ? "Additional · " : ""}${values.join(" · ")} · ${status}`;
}

const percent = value => Number((value * 100).toFixed(8));

function describePassiveEffect(effect) {
  const { type, magnitude, unit, scope, predicate, alternative, trigger, per, cap, durationSeconds, cooldownSeconds,
    cooldownScope, authoredStackLimit, scalingStatus } = effect;
  const suffix = type === "additive-modifier" ? "%[+]" : type === "damage-reduction" ? "% DR" : "%[x]";
  const amount = value => unit === "fraction" ? `${percent(value)}${suffix}`
    : `${value} ${unit === "seconds" ? "s" : unit}`;
  const subject = type === "apply-vulnerable" ? "Vulnerable on the affected enemy"
    : type === "cooldown-event" ? "off each active non-Aura cooldown"
    : type === "resource-generation" ? "generated" : scope;
  const value = magnitude === null ? `Up to ${amount(cap)}` : amount(magnitude);
  const alternatives = alternative ? `, or ${amount(alternative.magnitude)} vs ${alternative.predicate}` : "";
  const limit = cap !== undefined && magnitude !== null ? ` · Max ${amount(cap)}` : "";
  const duration = durationSeconds === undefined ? "" : ` · ${durationSeconds} s duration`;
  const cooldown = cooldownSeconds === undefined ? "" : ` · ${cooldownSeconds} s cooldown ${cooldownScope}`;
  const stackLimit = authoredStackLimit === undefined ? "" : ` · Authored limit ${authoredStackLimit} stacks`;
  return `${value} ${subject}${per ? ` per ${per}` : ""}${predicate ? ` · ${predicate}` : ""}${alternatives}${limit}${trigger ? ` · Trigger: ${trigger}` : ""}${duration}${cooldown}${stackLimit}${scalingStatus === "unresolved" ? " · Scaling unresolved" : ""}`;
}

export function describeAdditionalEffects(additional, draft = false) {
  const labels = { granted: draft ? "Would grant on save" : "Granted", unmet: "Unmet", unpurchased: "Unpurchased socket",
    unresolved: "Unresolved", preview: "Unsaved preview" };
  return [labels[additional.status], ...additional.effects.map(describePassiveEffect)].join(" · ");
}

export function describeLegendaryEffects(preview, modifiers, { draft = false, includeHeading = true } = {}) {
  const labels = { locked: `Locked preview until level ${LEGENDARY_GLYPH_LEVEL}`, unpurchased: "Unpurchased socket preview",
    unresolved: "Unresolved", preview: "Unsaved preview", applied: draft ? "Unlocked · Would apply on save" : "Applied" };
  const status = preview?.status ?? modifiers[0]?.status;
  if (!status) return "";
  const destinations = (preview?.destinations ?? modifiers)
    .map(({ fraction, scope }) => `${(100 * fraction).toFixed(1)}%[x] ${scope}`);
  return [includeHeading ? "Legendary" : "", labels[status], ...destinations].filter(Boolean).join(" · ");
}

export function describePrimaryGlyph(primary) {
  if (primary.status === "unresolved") return primary.reason;
  if (primary.kind === "amplification") {
    const rarity = primary.targetKind[0].toUpperCase() + primary.targetKind.slice(1);
    const count = new Set(primary.contributions.map(line => line.sourceIndex)).size;
    return `+${primary.percentagePoints.toFixed(1)}% ${rarity} node bonuses · ${count} amplified purchased ${count === 1 ? "node" : "nodes"}`;
  }
  const attribute = primary.source.name.replace(/_Core$/, "");
  const amount = formatGlyphPrimary(primary.percentagePoints, primary.destination);
  const pool = `${primary.localAttribute} purchased ${attribute} in radius`;
  return `+${primary.perFive.toFixed(1)}% per 5 ${attribute} · ${pool} · ${amount} ${primary.label}`;
}

export function createGlyphEmblem(glyph) {
  // The pinned extraction contains icon handles without image files.
  const emblem = document.createElement("span");
  emblem.className = "glyph-emblem";
  emblem.dataset.iconHandle = glyph.iconHandles[1];
  emblem.textContent = glyphInitials[glyph.displayName] ?? glyph.displayName.slice(0, 2).toUpperCase();
  emblem.setAttribute("aria-hidden", "true");
  return emblem;
}

const catalogue = [...glyphs].sort((a, b) => a.displayName.localeCompare(b.displayName));

function element(tag, text = "", className = "") {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  return node;
}

function renderRequirements(list, additional) {
  list.replaceChildren();
  for (const requirement of additional?.requirements ?? []) {
    const { attribute, required, effective, resolved, satisfied } = requirement;
    const row = element("li", "", satisfied ? "is-met" : "is-unmet");
    const amount = resolved ? `${formatAmplifiedCore(effective)}/${required}` : "Unresolved";
    row.append(element("span", `${attribute.name.replace(/_Core$/, "")} ${amount}`),
      element("span", resolved ? satisfied ? "Met" : "Unmet" : "Unknown", "node-card-requirement-state"));
    if (resolved && required > 0) {
      const bar = element("progress");
      bar.max = required;
      bar.value = Math.min(effective, required);
      bar.setAttribute("aria-hidden", "true");
      row.append(bar);
    }
    list.append(row);
  }
}

export function createGlyphPicker(dialog, showDialog) {
  const find = selector => dialog.querySelector(selector);
  const title = find("#glyph-picker-title");
  const socketState = find("#glyph-socket-state");
  const allocate = find("#glyph-allocate-socket");
  const sessionNote = find("#glyph-session-note");
  const search = find("#glyph-search");
  const options = find("#glyph-options");
  const noMatches = find("#glyph-no-matches");
  const previewPanel = find(".glyph-preview");
  const heading = find("#glyph-preview-heading");
  const progression = find("#glyph-progression");
  const level = find("#glyph-level");
  const slider = find("#glyph-level-slider");
  const presets = find(".glyph-level-presets");
  const primaryDescription = find(".glyph-primary-description");
  const primaryResult = find(".glyph-primary-result");
  const socketSummary = find(".glyph-socket-summary");
  const requirement = find(".glyph-requirement");
  const requirementProgress = find(".glyph-additional-progress");
  const additionalEffects = find(".glyph-additional-effects");
  const runtimeNote = find(".glyph-runtime-note");
  const legendaryEffect = find(".glyph-legendary-effect");
  const rarePreview = find("#glyph-rare-preview");
  const draftStatus = find("#glyph-draft-status");
  const remove = find("#glyph-remove");
  const save = find("#glyph-save");
  const feedback = find("#glyph-feedback");
  let session;
  let selectedGlyph;

  for (const input of [level, slider]) {
    input.min = GLYPH_LEVEL_INPUT.min;
    input.max = GLYPH_LEVEL_INPUT.max;
  }

  function report(message) {
    feedback.textContent = message;
    feedback.hidden = !message;
  }

  function renderOptions() {
    const query = search.value.trim().toLowerCase();
    const matches = catalogue.filter(glyph => glyph.displayName.toLowerCase().includes(query));
    options.replaceChildren(...matches.map(glyph => {
      const item = element("li");
      const button = element("button");
      button.type = "button";
      button.dataset.glyphSnoId = glyph.snoId;
      button.setAttribute("aria-controls", previewPanel.id);
      button.append(createGlyphEmblem(glyph), element("span", glyph.displayName, "glyph-option-name"));
      if (glyph.snoId === session.configuration?.snoId) {
        button.append(element("span", "Assigned", "glyph-option-assigned"));
      }
      item.append(button);
      return item;
    }));
    noMatches.hidden = matches.length !== 0;
    syncOptions();
  }

  function syncOptions() {
    const buttons = [...options.querySelectorAll("button")];
    const current = buttons.find(button => Number(button.dataset.glyphSnoId) === selectedGlyph.snoId);
    for (const button of buttons) {
      button.setAttribute("aria-pressed", String(button === current));
      button.tabIndex = button === (current ?? buttons[0]) ? 0 : -1;
    }
  }

  function setOptionFocus(button) {
    options.querySelector('button[tabindex="0"]')?.setAttribute("tabindex", "-1");
    button.tabIndex = 0;
    button.focus();
    button.scrollIntoView({ block: "nearest", container: "nearest" });
  }

  function isAssigned(configuration) {
    return session.configuration?.snoId === configuration.snoId && session.configuration.level === configuration.level;
  }

  function renderProgression() {
    const current = getGlyphProgression(level.valueAsNumber);
    const configuration = { snoId: selectedGlyph.snoId, level: current?.level };
    const saved = Boolean(current) && isAssigned(configuration);
    progression.dataset.rarity = current?.rarity.toLowerCase() ?? "";
    const evaluation = current ? session.evaluateGlyph(configuration, saved) : null;
    const primary = evaluation?.primary;
    const additional = evaluation?.additional;
    const changes = evaluation?.rareChanges ?? [];

    const primaryState = primary?.status === "unresolved" ? "Unresolved"
      : !session.allocated ? "Preview · Purchase the socket to apply"
      : saved ? "Applied Primary" : "Unsaved preview";
    primaryResult.textContent = primary ? `${primaryState} · ${describePrimaryGlyph(primary)}` : "";
    socketSummary.replaceChildren(...(primary?.deltasByAttribute ?? []).map(line => element("li", session.describeSocketDelta(line))));
    socketSummary.hidden = socketSummary.childElementCount === 0;
    renderRequirements(requirementProgress, additional);
    additionalEffects.textContent = additional ? describeAdditionalEffects(additional, !saved) : "";
    runtimeNote.hidden = !additional;
    legendaryEffect.textContent = evaluation
      ? describeLegendaryEffects(evaluation.preview, evaluation.modifiers, { draft: !saved, includeHeading: false })
      : `Unlocks at level ${LEGENDARY_GLYPH_LEVEL}.`;
    rarePreview.hidden = changes.length === 0;
    rarePreview.querySelector("ul").replaceChildren(...changes.map(change => element("li", change)));

    draftStatus.textContent = !current ? "Invalid level" : saved ? "Assigned configuration" : "Unsaved preview";
    draftStatus.classList.toggle("is-draft", Boolean(current) && !saved);
    if (!current) {
      progression.textContent = `Enter a whole level from ${level.min} to ${level.max}.`;
      return;
    }
    slider.value = current.level;
    slider.setAttribute("aria-valuetext", `Level ${current.level}, radius ${current.radius}, ${current.rarity}`);
    const next = current.nextRadiusLevel ? ` · Next radius at level ${current.nextRadiusLevel}` : "";
    const cap = current.atMaxLevel ? "Maximum level" : `Max ${level.max}`;
    progression.textContent = `Level ${current.level} · Radius ${current.radius} · ${current.rarity}${next} · ${cap}`;
  }

  function selectGlyph(glyph) {
    selectedGlyph = glyph;
    const label = element("div");
    label.append(element("h3", glyph.displayName), element("p", glyph.eligibility.classes.join(", ")));
    heading.replaceChildren(createGlyphEmblem(glyph), label);
    primaryDescription.textContent = affixes[glyph.bonuses.primary].description;
    const additional = affixes[glyph.bonuses.additional];
    requirement.textContent = additional.thresholdSnoIds.flatMap(id => thresholds[id].requirements)
      .map(({ amount, attribute }) => `Requires ${amount} ${attribute.name.replace(/_Core$/, "")} purchased within range.`).join(" ");
    const assigned = session.configuration;
    const sameGlyph = glyph.snoId === assigned?.snoId;
    level.value = sameGlyph ? assigned.level : GLYPH_LEVEL_INPUT.min;
    save.textContent = sameGlyph ? "Save level" : assigned ? "Replace glyph" : "Save glyph";
    level.removeAttribute("aria-invalid");
    previewPanel.scrollTop = 0;
    report("");
    renderProgression();
  }

  function renderSocketState() {
    const { allocated, eligible, configuration } = session;
    const state = allocated ? "Socket allocated" : eligible ? "Socket can be allocated" : "Socket is outside the allocated path";
    const current = configuration ? `Assigned · ${getPaladinGlyph(configuration.snoId).displayName} · Level ${configuration.level}` : "Empty socket";
    socketState.textContent = `${current} · ${state}`;
    allocate.hidden = allocated;
    allocate.disabled = !eligible;
  }

  search.addEventListener("input", renderOptions);
  search.addEventListener("keydown", event => {
    const first = options.querySelector('button[tabindex="0"]');
    if (event.key !== "ArrowDown" || !first) return;
    event.preventDefault();
    setOptionFocus(first);
  });
  options.addEventListener("keydown", event => {
    if (!["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    const buttons = [...options.querySelectorAll("button")];
    const index = buttons.indexOf(event.target);
    if (index < 0) return;
    event.preventDefault();
    const target = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1
      : Math.max(0, Math.min(buttons.length - 1, index + (event.key === "ArrowDown" ? 1 : -1)));
    setOptionFocus(buttons[target]);
  });
  options.addEventListener("click", event => {
    const button = event.target.closest("[data-glyph-sno-id]");
    const glyph = getPaladinGlyph(Number(button?.dataset.glyphSnoId));
    if (!glyph || glyph === selectedGlyph) return;
    selectGlyph(glyph);
    syncOptions();
  });

  function editLevel() {
    if (getGlyphProgression(level.valueAsNumber)) level.removeAttribute("aria-invalid");
    else level.setAttribute("aria-invalid", "true");
    report("");
    renderProgression();
  }

  level.addEventListener("input", editLevel);
  slider.addEventListener("input", () => {
    level.value = slider.value;
    editLevel();
  });
  presets.addEventListener("click", event => {
    const button = event.target.closest("[data-glyph-level]");
    if (!button) return;
    level.value = button.dataset.glyphLevel;
    editLevel();
  });
  level.addEventListener("keydown", event => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    save.focus();
  });

  function apply(configuration) {
    if (!dialog.open) return;
    try {
      session.onSave(configuration);
      dialog.close();
    } catch (error) {
      report(error.message);
    }
  }

  save.addEventListener("click", () => {
    if (!dialog.open) return;
    const configuration = { snoId: selectedGlyph.snoId, level: level.valueAsNumber };
    if (!level.validity.valid || !isGlyphConfiguration(configuration)) {
      report(`Enter a whole glyph level from ${level.min} to ${level.max}.`);
      level.setAttribute("aria-invalid", "true");
      level.focus();
      return;
    }
    if (isAssigned(configuration)) dialog.close();
    else apply(configuration);
  });
  remove.addEventListener("click", () => apply(null));
  allocate.addEventListener("click", () => {
    if (!session.onAllocate()) return;
    session.allocated = true;
    renderSocketState();
    renderProgression();
    search.focus({ preventScroll: true });
  });
  for (const selector of ["#glyph-picker-close", "#glyph-cancel"]) {
    find(selector).addEventListener("click", () => dialog.close());
  }
  dialog.addEventListener("close", () => {
    if (dialog.open || !session) return;
    const { onClose } = session;
    session = null;
    onClose();
  });

  return {
    open(context) {
      if (dialog.open) return;
      session = context;
      title.textContent = `${context.boardName} glyph socket`;
      sessionNote.hidden = context.persistent;
      search.value = "";
      remove.hidden = !context.configuration;
      selectGlyph(getPaladinGlyph(context.configuration?.snoId) ?? catalogue[0]);
      renderOptions();
      renderSocketState();
      find(".glyph-picker-content").scrollTop = 0;
      showDialog(dialog, 540);
      options.querySelector('[aria-pressed="true"]')?.scrollIntoView({ block: "nearest", container: "nearest" });
    }
  };
}
