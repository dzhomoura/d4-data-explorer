import { paladinGlyphData } from "./paladin-glyph-data.js";
import { getGlyphProgression } from "./glyph-progression.js";

export { GLYPH_LEVEL_INPUT } from "./glyph-progression.js";
export { getGlyphSocketSourceIndex } from "./glyph-spatial.js";

function freezeData(value) {
  if (value && typeof value === "object") {
    for (const entry of Object.values(value)) freezeData(entry);
    Object.freeze(value);
  }
  return value;
}

const observedPrimaryGlyphs = new Set([1029487, 2506847, 2506810]); // Canny, Turf, Spirit.
export const paladinGlyphCatalogue = freezeData({
  ...paladinGlyphData,
  glyphs: paladinGlyphData.glyphs.map(glyph => ({
    ...glyph,
    primaryEvidence: glyph.snoId === 2073373 ? "experimentally-supported-amplification"
      : observedPrimaryGlyphs.has(glyph.snoId) ? "calibrated-with-in-game-observations" : "source-derived-extrapolation"
  }))
});
const glyphsBySno = new Map(paladinGlyphCatalogue.glyphs.map(glyph => [glyph.snoId, glyph]));

export function getPaladinGlyph(snoId) {
  return glyphsBySno.get(snoId);
}

export function isGlyphConfiguration(configuration) {
  return Boolean(configuration && !Array.isArray(configuration)
    && getPaladinGlyph(configuration.snoId) && getGlyphProgression(configuration.level));
}
