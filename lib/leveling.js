// Constants
export const growth = Math.pow(Math.PI / Math.E, 1.618) * Math.E * 0.75;

/**
 * Calculate the XP range for a given level.
 * @param {number} level - The level to calculate the XP range for.
 * @param {number} [multiplier=1] - The multiplier for XP calculation.
 * @returns {Object} The min, max XP values, and the XP required to level up.
 * @throws {TypeError} Throws an error if the level is negative.
 */
export function xpRange(level, multiplier = global.multiplier || 1) {
  if (level < 0) throw new TypeError('Level cannot be a negative value');
  level = Math.floor(level);
  const min = level === 0 ? 0 : Math.round(Math.pow(level, growth) * multiplier) + 1;
  const max = Math.round(Math.pow(level + 1, growth) * multiplier);
  return {
    min,
    max,
    xp: max - min,
  };
}

/**
 * Find the level for a given XP.
 * @param {number} xp - The XP to find the level for.
 * @param {number} [multiplier=1] - The multiplier for XP calculation.
 * @returns {number} The level corresponding to the XP.
 */
export function findLevel(xp, multiplier = global.multiplier || 1) {
  if (xp === Infinity) return Infinity;
  if (isNaN(xp)) return NaN;
  if (xp <= 0) return -1;
  let level = 0;
  do {
    level++;
  } while (xpRange(level, multiplier).min <= xp);
  return level - 1;
}

/**
 * Check if a level can be upgraded with the given XP.
 * @param {number} level - The current level.
 * @param {number} xp - The current XP.
 * @param {number} [multiplier=1] - The multiplier for XP calculation.
 * @returns {boolean} True if the level can be upgraded, false otherwise.
 */
export function canLevelUp(level, xp, multiplier = global.multiplier || 1) {
  if (level < 0) return false;
  if (xp === Infinity) return true;
  if (isNaN(xp)) return false;
  if (xp <= 0) return false;
  return level < findLevel(xp, multiplier);
}
