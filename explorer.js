
const url =
  "https://raw.githubusercontent.com/DiabloTools/d4data/master/json/base/meta/SkillKit/Paladin_NEW.skl.json";

async function inspectPaladin() {
    const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }
const data = await response.json();

console.log("\n=== ALL PALADIN ACTIVE SKILLS ===");

data.arActiveSkillEntries.forEach((skill, index) => {
  console.log(
    `${index + 1}. ${skill.snoPower?.name ?? "Unknown"}`
  );

  console.log(
    `   File: ${skill.snoPower?.__targetFileName__ ?? "Unknown"}`
  );
});
}
async function inspectSkill(skillName) {
  const baseUrl =
    "https://raw.githubusercontent.com/DiabloTools/d4data/master/json/";

  const skillKitResponse = await fetch(url);

  if (!skillKitResponse.ok) {
    throw new Error(`SkillKit HTTP ${skillKitResponse.status}`);
  }

  const skillKit = await skillKitResponse.json();

  const skill = skillKit.arActiveSkillEntries.find(
    entry => entry.snoPower?.name === skillName
  );

  if (!skill) {
    console.log("Skill not found:", skillName);
    return;
  }

  const powerPath =
    skill.snoPower.__targetFileName__ + ".json";

  const powerResponse = await fetch(baseUrl + powerPath);

  if (!powerResponse.ok) {
    throw new Error(`Power HTTP ${powerResponse.status}`);
  }

  const power = await powerResponse.json();


    console.log("\n=== SHIELD BASH FORMULAS ===");

    power.ptScriptFormulas.forEach((entry, index) => {
    const formula = entry.tFormula?.value;

    if (formula) {
        console.log(`SF_${index}: ${formula}`);
    }
    });

  console.log("\n=== SKILL POWER ===");
  console.log("Name:", skillName);
  console.log("File:", power.__fileName__);
  console.log("Type:", power.__type__);

  console.log("\n=== IMPORTANT PROPERTIES ===");

  console.log("Skill category:", power.eSkillCat);
  console.log("Damage type:", power.eDamageType);
  console.log("Channeled:", power.bChannelled);
  console.log("Passive:", power.bIsPassive);

  console.log("\n=== RESOURCE COSTS ===");
  console.dir(power.arResourceCosts, { depth: 3 });

  console.log("\n=== SKILL TAGS ===");
  console.dir(power.arSkillTags, { depth: 3 });

  console.log("\n=== FORMULA-RELATED FIELDS ===");

  for (const [key, value] of Object.entries(power)) {
    if (
      /damage|coefficient|rank|attack|cooldown/i.test(key)
    ) {
      console.log(
        key,
        JSON.stringify(value).slice(0, 250)
      );
    }
  }
}
inspectSkill("Paladin_ShieldBash").catch(console.error);
