/**
 * @author       Marcus Sanatan <msanatan@gmail.com>
 * @copyright    2020 Marcus Sanatan
 * @description  Cuadrado's Trials
 */
export const PLAYER_KEY = 'player';
export const DOOR_KEY = 'door';
export const TILES_KEY = 'tiles';
export const BACKGROUND_KEY = 'background';
export const HORIZONTAL_PLATFORM_KEY = 'horizontal';
export const VERTICAL_PLATFORM_KEY = 'vertical';
export const SPIKE_KEY = 'spike';
export const PARTICLE_KEY = 'particle';
export const COIN_KEY = 'coin';
export const COIN_ICON_KEY = 'coin-icon';
export const CERTIFICATE_BACKGROUND_KEY = 'certificate-background';
export const CUADRADO_BIG_KEY = 'cuadrado-big';
export const TITLE_BACKGROUND_KEY = 'title-background';

export const AUDIO_MENU_SELECT_KEY = 'menu-select';
export const AUDIO_PLAYER_JUMP_KEY = 'player-jump';
export const AUDIO_LEVEL_COMPLETE_KEY = 'level-complete';
export const AUDIO_PLAYER_DIES_KEY = 'player-dies';
export const AUDIO_PLAYER_COLLECTS_COIN_KEY = 'player-collects-coin';
export const AUDIO_GAME_COMPLETE_KEY = 'game-complete';

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
export const TILED_COINS_LAYER = 'Coins';

export const TILED_TILESET_NAME = "Cuadrado's Tiles";

export const TILED_DOOR_KEY = 'Door';
export const TILED_HORIZONTAL_MOVING_PLATFORM_KEY = 'Horizontal';
export const TILED_VERTICAL_MOVING_PLATFORM_KEY = 'Vertical';
export const TILED_SPIKES_Key = 'Spike';
export const TILED_COIN_KEY = 'Coin';

export const TILE_SIZE = 32;
export const TILE_CORRECTION = 1;

export const PARTICLE_COUNT = 10;
