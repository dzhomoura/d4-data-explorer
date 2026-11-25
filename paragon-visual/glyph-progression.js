export const GLYPH_LEVEL_INPUT = Object.freeze({ min: 1, max: 150 });
export const LEGENDARY_GLYPH_LEVEL = 51; // Player-confirmed radius expansion. The exact upgrade transaction remains unisolated.
const FIRST_EXPANSION_LEVEL = 25;

export function getGlyphProgression(level) {
  if (!Number.isInteger(level) || level < GLYPH_LEVEL_INPUT.min || level > GLYPH_LEVEL_INPUT.max) return null;
  if (level >= LEGENDARY_GLYPH_LEVEL) {
    return { level, radius: 5, rarity: "Legendary", nextRadiusLevel: null, atMaxLevel: level === GLYPH_LEVEL_INPUT.max };
  }
  const expanded = level >= FIRST_EXPANSION_LEVEL;
  return {
    level, radius: expanded ? 4 : 3, rarity: "Rare",
    nextRadiusLevel: expanded ? LEGENDARY_GLYPH_LEVEL : FIRST_EXPANSION_LEVEL, atMaxLevel: false
  };
}
