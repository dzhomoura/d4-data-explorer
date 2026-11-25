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

export function describeAmplificationRequirement(additional) {
  const values = additional.requirements.map(({ attribute, effective, required, resolved }) =>
    `${attribute.name.replace(/_Core$/, "")} ${resolved ? `${formatAmplifiedCore(effective)}/${required}` : "unresolved"}`);
  const status = additional.resolved ? additional.satisfied ? "satisfied" : "unmet" : "unresolved";
  return `Additional · ${values.join(" · ")} · ${status}`;
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

export function createGlyphPicker(dialog, showDialog) {
  const title = dialog.querySelector("#glyph-picker-title");
  const socketState = dialog.querySelector("#glyph-socket-state");
  const allocate = dialog.querySelector("#glyph-allocate-socket");
  const sessionNote = dialog.querySelector("#glyph-session-note");
  const search = dialog.querySelector("#glyph-search");
  const options = dialog.querySelector("#glyph-options");
  const noMatches = dialog.querySelector("#glyph-no-matches");
  const previewPanel = dialog.querySelector(".glyph-preview");
  const heading = dialog.querySelector("#glyph-preview-heading");
  const progression = dialog.querySelector("#glyph-progression");
  const descriptions = dialog.querySelector("#glyph-bonus-descriptions");
  const level = dialog.querySelector("#glyph-level");
  const levelNote = dialog.querySelector("#glyph-level-note");
  const remove = dialog.querySelector("#glyph-remove");
  const save = dialog.querySelector("#glyph-save");
  const feedback = dialog.querySelector("#glyph-feedback");
  let session;
  let preview;

  level.min = GLYPH_LEVEL_INPUT.min;
  level.max = GLYPH_LEVEL_INPUT.max;
  levelNote.textContent = `The planner uses level ${LEGENDARY_GLYPH_LEVEL} for the Legendary transition.`;

  function report(message) {
    feedback.textContent = message;
    feedback.hidden = !message;
  }

  function renderOptions() {
    const query = search.value.trim().toLowerCase();
    const matches = glyphs.filter(glyph => glyph.displayName.toLowerCase().includes(query));
    options.replaceChildren(...matches.map(glyph => {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.glyphSnoId = glyph.snoId;
      button.setAttribute("aria-pressed", String(glyph === preview));
      button.append(createGlyphEmblem(glyph), glyph.displayName);
      item.append(button);
      return item;
    }));
    noMatches.hidden = matches.length !== 0;
  }

  function renderProgression() {
    const current = getGlyphProgression(level.valueAsNumber);
    const legendaryStatus = descriptions.querySelector(".glyph-legendary-status");
    progression.dataset.rarity = current?.rarity.toLowerCase() ?? "";
    const primaryDetails = descriptions.querySelector(".glyph-primary-result");
    const primary = current ? session.evaluatePrimary({ snoId: preview.snoId, level: current.level }) : null;
    if (primary) {
      const saved = session.configuration?.snoId === primary.glyphSnoId && session.configuration.level === current.level;
      const prefix = primary.status === "unresolved" ? "Unresolved"
        : !session.allocated ? "Preview · Purchase the socket to apply"
          : saved ? "Applied Primary" : "Unsaved preview";
      primaryDetails.textContent = `${prefix} · ${describePrimaryGlyph(primary)}`;
    } else {
      primaryDetails.textContent = "";
    }
    const socketSummary = descriptions.querySelector(".glyph-socket-summary");
    socketSummary.textContent = primary?.deltasByAttribute?.map(line => session.describeSocketDelta(line)).join(" · ") ?? "";
    const additionalProgress = descriptions.querySelector(".glyph-additional-progress");
    additionalProgress.textContent = primary?.additional ? describeAmplificationRequirement(primary.additional) : "";
    if (!current) {
      progression.textContent = `Enter a whole level from ${level.min} to ${level.max}.`;
      legendaryStatus.textContent = `Unlocks at planner level ${LEGENDARY_GLYPH_LEVEL}.`;
      return;
    }
    const next = current.nextRadiusLevel ? ` · Next radius at level ${current.nextRadiusLevel}` : "";
    const cap = current.atMaxLevel ? "Maximum level" : `Max ${level.max}`;
    progression.textContent = `Level ${current.level} · Radius ${current.radius} · ${current.rarity}${next} · ${cap}`;
    legendaryStatus.textContent = current.rarity === "Legendary"
      ? "Available by progression" : `Locked until planner level ${LEGENDARY_GLYPH_LEVEL}.`;
  }

  function renderPreview(glyph) {
    preview = glyph;
    const name = document.createElement("h3");
    name.textContent = glyph.displayName;
    const eligibility = document.createElement("p");
    eligibility.textContent = glyph.eligibility.classes.join(", ");
    const label = document.createElement("div");
    label.append(name, eligibility);
    heading.replaceChildren(createGlyphEmblem(glyph), label);
    descriptions.replaceChildren();
    for (const [role, caption] of [["primary", "Primary"], ["additional", "Additional"], ["legendary", "Legendary"]]) {
      const affix = affixes[glyph.bonuses[role]];
      const section = document.createElement("section");
      const heading = document.createElement("h4");
      heading.textContent = caption;
      const description = document.createElement("p");
      description.textContent = affix.description;
      section.append(heading);
      if (role === "legendary") {
        const status = document.createElement("p");
        status.className = "glyph-legendary-status";
        section.append(status);
      }
      section.append(description);
      if (role === "primary") {
        const result = document.createElement("p");
        result.className = "glyph-primary-result";
        section.append(result);
        const summary = document.createElement("p");
        summary.className = "glyph-primary-result glyph-socket-summary";
        section.append(summary);
      }
      for (const id of affix.thresholdSnoIds) {
        for (const { amount, attribute } of thresholds[id].requirements) {
          const requirement = document.createElement("p");
          requirement.className = "glyph-requirement";
          requirement.textContent = `Requires ${amount} ${attribute.name.replace(/_Core$/, "")} purchased within range.`;
          section.append(requirement);
        }
      }
      if (role === "additional") {
        const progress = document.createElement("p");
        progress.className = "glyph-primary-result glyph-additional-progress";
        section.append(progress);
      }
      descriptions.append(section);
    }
    const current = session.configuration;
    const sameGlyph = glyph.snoId === current?.snoId;
    level.value = sameGlyph ? current.level : GLYPH_LEVEL_INPUT.min;
    renderProgression();
    save.textContent = sameGlyph ? "Save level" : current ? "Replace glyph" : "Save glyph";
    level.removeAttribute("aria-invalid");
    previewPanel.scrollTop = 0;
    report("");
  }

  function renderSocketState() {
    const { allocated, eligible, configuration } = session;
    const state = allocated ? "Socket allocated" : eligible ? "Socket can be allocated" : "Socket is outside the allocated path";
    const current = configuration ? `${getPaladinGlyph(configuration.snoId).displayName} · Level ${configuration.level}` : "Empty socket";
    socketState.textContent = `${current} · ${state}`;
    allocate.hidden = allocated;
    allocate.disabled = !eligible;
  }

  search.addEventListener("input", renderOptions);
  options.addEventListener("click", event => {
    const button = event.target.closest("[data-glyph-sno-id]");
    const glyph = getPaladinGlyph(Number(button?.dataset.glyphSnoId));
    if (!glyph || glyph === preview) return;
    renderPreview(glyph);
    options.querySelector('[aria-pressed="true"]')?.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-pressed", "true");
  });

  level.addEventListener("input", () => {
    level.removeAttribute("aria-invalid");
    report("");
    renderProgression();
  });
  level.addEventListener("keydown", event => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    save.click();
  });

  function apply(configuration) {
    try {
      session.onSave(configuration);
      dialog.close();
    } catch (error) {
      report(error.message);
    }
  }

  save.addEventListener("click", () => {
    const configuration = { snoId: preview.snoId, level: level.valueAsNumber };
    if (!level.validity.valid || !isGlyphConfiguration(configuration)) {
      report(`Enter a whole glyph level from ${level.min} to ${level.max}.`);
      level.setAttribute("aria-invalid", "true");
      level.focus();
      return;
    }
    apply(configuration);
  });
  remove.addEventListener("click", () => apply(null));
  allocate.addEventListener("click", () => {
    if (!session.onAllocate()) return;
    session.allocated = true;
    renderSocketState();
    renderProgression();
    search.focus({ preventScroll: true });
  });
  dialog.querySelector("#glyph-picker-close").addEventListener("click", () => dialog.close());
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
      renderPreview(getPaladinGlyph(context.configuration?.snoId) ?? glyphs[0]);
      renderOptions();
      renderSocketState();
      dialog.querySelector(".glyph-picker-content").scrollTop = 0;
      showDialog(dialog, 540);
      options.querySelector('[aria-pressed="true"]')?.scrollIntoView({ block: "nearest", container: "nearest" });
    }
  };
}
