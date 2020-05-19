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

export const TILED_EXIT_DOOR_LAYER = 'ExitDoor';
export const TILED_PLATFORMS_LAYER = 'Platforms';
export const TILED_MOVING_PLATFORMS_LAYER = 'MovingPlatforms';
export const TILED_SPIKES_LAYER = 'Spikes';

export const TILED_DOOR_KEY = 'Door';
export const TILED_HORIZONTAL_MOVING_PLATFORM_KEY = 'Horizontal';
export const TILED_VERTICAL_MOVING_PLATFORM_KEY = 'Vertical';
