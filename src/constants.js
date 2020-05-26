export const PLAYER_KEY = 'player';
export const DOOR_KEY = 'door';
export const TILES_KEY = 'tiles';
export const BACKGROUND_KEY = 'background';
export const HORIZONTAL_PLATFORM_KEY = 'horizontal';
export const VERTICAL_PLATFORM_KEY = 'vertical';
export const SPIKE_KEY = 'spike';

/**
 * Generates a key for levels
 * @param {number} levelNum - Level identifier
 * @return {string}
 */
export const getLevelKey = (levelNum) => {
  return `tilemap_level_${levelNum}`;
};

export const TILED_EXIT_DOOR_LAYER = 'ExitDoor';
export const TILED_PLATFORMS_LAYER = 'Platforms';
export const TILED_HORIZONTAL_MOVING_PLATFORMS_LAYER = 'HorizontalMovingPlatforms';
export const TILED_VERTICAL_MOVING_PLATFORMS_LAYER = 'VerticalMovingPlatforms';
export const TILED_SPIKES_LAYER = 'Spikes';
export const TILED_CHECKPOINTS_LAYER = 'Checkpoints';
export const TILED_PLATFORM_BOUNDARIES_LAYER = 'PlatformBoundaries';

export const TILED_TILESET_NAME = "Cuadrado's Tiles";

export const TILED_DOOR_KEY = 'Door';
export const TILED_HORIZONTAL_MOVING_PLATFORM_KEY = 'Horizontal';
export const TILED_VERTICAL_MOVING_PLATFORM_KEY = 'Vertical';
export const TILED_SPIKES_Key = 'Spike';

export const TILE_SIZE = 32;
export const TILE_CORRECTION = 1;
