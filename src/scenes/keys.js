export const PLAYER_KEY = 'player';
export const DOOR_KEY = 'door';
export const TILES_KEY = 'tiles';
export const BACKGROUND_KEY = 'background';

/**
 * Generates a key for levels
 * @param {number} levelNum - Level identifier
 * @return {string}
 */
export const getLevelKey = (levelNum) => {
  return `tilemap_level_${levelNum}`;
}