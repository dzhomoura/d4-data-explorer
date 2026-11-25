export const LEGENDARY_BOARD_SOURCE_REVISION = "75e619f0d90a0951945747f45feef59c076a5db0";
export const LEGENDARY_BOARD_BUDGET = 0.15; // Tooltip calibration, runtime binding unresolved.

export const LEGENDARY_SCENARIO_FIELDS = Object.freeze({
  armorDamageReduction: { label: "Armor Damage Reduction", unit: "fraction" },
  blockChance: { label: "Total Block Chance", unit: "fraction" },
  bonusAttackSpeed: { label: "Qualifying Bonus Attack Speed", unit: "fraction" },
  fervorStacks: { label: "Active Fervor stacks", unit: "count" },
  inArbiter: { label: "In Arbiter form", unit: "boolean" },
  targetVulnerable: { label: "Target is Vulnerable", unit: "boolean" },
  moving: { label: "Actor is moving", unit: "boolean" },
  secondsSinceStopped: { label: "Seconds since stopping", unit: "seconds" },
  targetJudgedByPlayer: { label: "Target Judged by this player", unit: "boolean" },
  targetAlive: { label: "Target is alive", unit: "boolean" },
  fortified: { label: "Actor is Fortified", unit: "boolean" },
  qualifyingAuraOccupants: { label: "Allies or mercenaries in your Auras", unit: "count" }
});

export function normalizeLegendaryScenario(scenario = {}) {
  if (!scenario || typeof scenario !== "object" || Array.isArray(scenario)) {
    throw new TypeError("Legendary scenario must be an object.");
  }
  const values = {};
  for (const [key, value] of Object.entries(scenario)) {
    if (!Object.hasOwn(LEGENDARY_SCENARIO_FIELDS, key)) {
      throw new TypeError(`Unknown Legendary scenario input ${key}.`);
    }
    if (value === null || value === undefined) continue;
    const { label, unit } = LEGENDARY_SCENARIO_FIELDS[key];
    const valid = unit === "boolean" ? typeof value === "boolean"
      : Number.isFinite(value) && value >= 0 && value <= Number.MAX_SAFE_INTEGER
        && (unit !== "count" || Number.isInteger(value));
    if (!valid) throw new TypeError(`Invalid Legendary scenario input for ${label}.`);
    values[key] = value;
  }
  return values;
}

function allConditions(...conditions) {
  if (conditions.includes(false)) return false;
  return conditions.includes(undefined) ? undefined : true;
}

const motion = ({ moving, secondsSinceStopped }) =>
  moving === true ? true : moving === false && secondsSinceStopped !== undefined ? secondsSinceStopped <= 2 : undefined;
const hasCount = value => value === undefined ? undefined : value > 0;
const component = (id, type, scope, notation, formula, requiredInputs, details) =>
  ({ id, type, scope, notation, formula, requiredInputs, ...details });

const nodes = [
  {
    board: 1, boardSnoId: 2436511, sourceIndex: 320, nodeSnoId: 2437020, powerSnoId: 2488259, name: "Castle",
    description: "Gain damage equal to 125% of the Damage Reduction granted by Armor.",
    assumptions: ["Armor-to-DR conversion and runtime cap behavior are unresolved."],
    components: [component("armor-damage", "damage-modifier", "damage", "multiplicative",
      "min(1.50, armorDamageReduction × 1.25)", ["armorDamageReduction"], {
        authoredCap: 1.50, coefficient: 1.25,
        input: "armorDamageReduction", evaluate: value => Math.min(1.50, value * 1.25)
      })]
  },
  {
    board: 2, boardSnoId: 2436844, sourceIndex: 198, nodeSnoId: 2438097, powerSnoId: 2489348, name: "Shield Bearer",
    passiveLabel: "Phalanx", description: "Gain damage equal to 110% of total character Block Chance.",
    assumptions: ["Combat application and behavior at the authored chance cap remain unresolved."],
    components: [component("block-damage", "damage-modifier", "damage", "multiplicative",
      "min(1, blockChance) × 1.10", ["blockChance"], {
        authoredInputCap: 1, coefficient: 1.10,
        input: "blockChance", evaluate: value => Math.min(1, value) * 1.10
      })]
  },
  {
    board: 3, boardSnoId: 2438913, sourceIndex: 216, nodeSnoId: 2438099, powerSnoId: 2490466, name: "Fervent",
    description: "Each active Fervor stack grants 35%[x] Critical Strike Damage and 3%[+] Critical Strike Chance.",
    consumer: { name: "Paladin_Oath_Zealot", snoId: 2273665, formulaIndices: [15, 16, 17] },
    assumptions: ["The preview scales linearly per stack. Runtime stacking and caps remain unresolved."],
    components: [
      component("fervor-critical-damage", "damage-modifier", "Critical Strike Damage", "multiplicative",
        "fervorStacks × 0.35", ["fervorStacks"], { perStack: 0.35, input: "fervorStacks",
          evaluate: value => value * 0.35, condition: s => hasCount(s.fervorStacks) }),
      component("fervor-critical-chance", "chance-modifier", "Critical Strike Chance", "additive",
        "fervorStacks × 0.03", ["fervorStacks"], { perStack: 0.03, input: "fervorStacks",
          evaluate: value => value * 0.03, condition: s => hasCount(s.fervorStacks) })
    ]
  },
  {
    board: 4, boardSnoId: 2438973, sourceIndex: 325, nodeSnoId: 2438101, powerSnoId: 2490759, name: "Preacher",
    passiveLabel: "Fervent",
    description: "Zealot skills gain 15%[+] Attack Speed. Gain damage equal to 65% of qualifying Bonus Attack Speed.",
    assumptions: ["The runtime conversion input and damage bucket remain unresolved. Zealot Attack Speed is a separate component."],
    components: [
      component("zealot-attack-speed", "attack-speed-modifier", "Zealot skill Attack Speed", "additive",
        "0.15", [], { fixed: 0.15, applicability: { skillTag: { name: "Skill_Zealot", gbid: 3900331213 } } }),
      component("attack-speed-damage", "damage-modifier", "damage", "unspecified",
        "bonusAttackSpeed × 0.65", ["bonusAttackSpeed"], { coefficient: 0.65,
          input: "bonusAttackSpeed", evaluate: value => value * 0.65 })
    ]
  },
  {
    board: 5, boardSnoId: 2438992, sourceIndex: 80, nodeSnoId: 2438120, powerSnoId: 2493403, name: "Divinity",
    description: "Gain 90%[x] damage in Arbiter form against Vulnerable enemies.",
    consumer: { name: "Paladin_Sub_Angel", snoId: 2360526, formulaIndices: [29, 30] },
    assumptions: ["The Legendary node budget is tooltip-calibrated. Its runtime binding and global array index remain unresolved."],
    components: [component("arbiter-vulnerable-damage", "damage-modifier", "damage against Vulnerable enemies in Arbiter", "multiplicative",
      "6 × ParagonPowerBudgetMultiplierNodeLegendary()", ["inArbiter", "targetVulnerable"], {
        fixed: 6 * LEGENDARY_BOARD_BUDGET, calibratedBudget: LEGENDARY_BOARD_BUDGET,
        condition: s => allConditions(s.inArbiter, s.targetVulnerable)
      })]
  },
  {
    board: 6, boardSnoId: 2439024, sourceIndex: 136, nodeSnoId: 2438118, powerSnoId: 2493521, name: "Relentless",
    description: "Gain 80%[x] damage and 30%[+] Cooldown Reduction while moving and for 2 seconds after stopping.",
    assumptions: ["Movement events and cooldown composition remain unresolved. The Cooldown Reduction budget is tooltip-calibrated."],
    components: [
      component("moving-damage", "damage-modifier", "damage while moving or in the grace period", "multiplicative",
        "0.80", ["moving", "secondsSinceStopped"], { fixed: 0.80, gracePeriodSeconds: 2, condition: motion }),
      component("moving-cooldown-reduction", "cooldown-reduction", "Cooldown Reduction while moving or in the grace period", "additive",
        "2 × ParagonPowerBudgetMultiplierNodeLegendary()", ["moving", "secondsSinceStopped"], {
          fixed: 2 * LEGENDARY_BOARD_BUDGET, calibratedBudget: LEGENDARY_BOARD_BUDGET, gracePeriodSeconds: 2, condition: motion
        })
    ]
  },
  {
    board: 7, boardSnoId: 2439031, sourceIndex: 260, nodeSnoId: 2438124, powerSnoId: 2493735, name: "Sentencing",
    description: "Enemies you Judge take 90%[x] more damage from you until they die.",
    consumer: { name: "Paladin_Sub_Judgement", snoId: 2263340, formulaIndices: [13, 14] },
    assumptions: ["Judging event order, lifetime resets and composition with Judicator Oath and Law remain unresolved."],
    components: [component("judged-target-damage", "target-damage-amplification", "damage from the applying player to the Judged target", "multiplicative",
      "0.90", ["targetJudgedByPlayer", "targetAlive"], {
        fixed: 0.90, trigger: "judging", owner: "applying-player", lifetime: "until-target-death",
        condition: s => allConditions(s.targetJudgedByPlayer, s.targetAlive)
      })]
  },
  {
    board: 8, boardSnoId: 2439033, sourceIndex: 374, nodeSnoId: 2438126, powerSnoId: 2494628, name: "Endure",
    description: "Gain 90%[x] damage while Fortified.",
    assumptions: ["Fortify amount does not establish the Fortified state for this preview."],
    components: [component("fortified-damage", "damage-modifier", "damage while Fortified", "multiplicative",
      "0.90", ["fortified"], { fixed: 0.90, condition: s => s.fortified })]
  },
  {
    board: 9, boardSnoId: 2439035, sourceIndex: 283, nodeSnoId: 2438128, powerSnoId: 2494939, name: "Beacon",
    description: "Gain 90%[x] damage with at least one ally or mercenary within one of your Auras.",
    consumer: { name: "Paladin_Aura_Controller", snoId: 2362053, formulaIndices: [2, 3] },
    assumptions: ["Aura occupant recognition and update timing remain unresolved."],
    components: [component("aura-occupancy-damage", "damage-modifier", "damage with qualifying Aura occupancy", "multiplicative",
      "0.90", ["qualifyingAuraOccupants"], { fixed: 0.90, condition: s => hasCount(s.qualifyingAuraOccupants) })]
  }
];

const byBoardSno = new Map(nodes.map(node => {
  const suffix = String(node.board).padStart(3, "0");
  const nodeName = `Paladin_Legendary_${suffix}`;
  const powerName = `Paragon_${nodeName}`;
  return [node.boardSnoId, {
    ...node, nodeName, powerName,
    sourcePath: `json/base/meta/ParagonNode/${nodeName}.pgn.json`,
    powerSourcePath: `json/base/meta/Power/${powerName}.pow.json`,
    tooltipSourcePath: `json/enUS_Text/meta/StringList/Power_${powerName}.stl.json`
  }];
}));

export function resolveLegendaryBoardNode(board, definitions, sourceRevision) {
  const node = byBoardSno.get(board.__snoID__);
  if (!node || sourceRevision !== LEGENDARY_BOARD_SOURCE_REVISION) return null;
  const entry = board.arEntries[node.sourceIndex];
  const definition = definitions.get(node.nodeName);
  if (entry?.name !== node.nodeName || entry.__raw__ !== node.nodeSnoId || definition?.kind !== "legendary"
    || definition.snoId !== node.nodeSnoId || definition.sourcePath !== node.sourcePath
    || definition.passivePower?.name !== node.powerName || definition.passivePower.snoId !== node.powerSnoId
    || definition.passivePower.target !== `base/meta/Power/${node.powerName}.pow`) return null;
  return node;
}

export function evaluateLegendaryBoardNode(node, instanceId, allocated, scenario) {
  if (!node) return [];
  const { boardSnoId, sourceIndex, nodeSnoId, powerSnoId, name, passiveLabel, description, sourcePath,
    powerSourcePath, tooltipSourcePath, consumer, assumptions, components } = node;
  return components.map(({ id, input, evaluate, condition, fixed, requiredInputs, ...details }) => {
    const magnitude = input ? scenario[input] === undefined ? null : evaluate(scenario[input]) : fixed;
    const eligible = condition ? condition(scenario) : magnitude === null ? undefined : true;
    return {
      instanceId, boardSnoId, sourceIndex, nodeSnoId, powerSnoId, nodeName: name, passiveLabel: passiveLabel ?? name,
      componentId: id, description, sourceRevision: LEGENDARY_BOARD_SOURCE_REVISION,
      sourcePath, powerSourcePath, tooltipSourcePath,
      ...(consumer && { consumer: { ...consumer, formulaIndices: [...consumer.formulaIndices] } }),
      grantStatus: allocated ? "granted" : "unallocated",
      eligibilityStatus: eligible === undefined ? "unknown" : eligible ? "satisfied" : "not-satisfied",
      requiredInputs: [...requiredInputs],
      inputs: Object.fromEntries(requiredInputs.map(key => [key, scenario[key] ?? null])),
      magnitude, currentMagnitude: allocated && eligible ? magnitude : null, unit: "fraction",
      evidence: details.calibratedBudget ? "tooltip-calibrated" : "pinned-source-and-player-tooltip",
      ...structuredClone(details),
      runtimeStatus: "unresolved",
      assumptions: [...assumptions, "Combat application and stacking are unresolved."]
    };
  });
}
