/**
 * @author       Marcus Sanatan <msanatan@gmail.com>
 * @copyright    2021 Marcus Sanatan
 * @description  Cuadrado's Trials
 */
export const PLAYER_KEY: string = 'player';
export const DOOR_KEY: string = 'door';
export const TILES_KEY: string = 'tiles';
export const HORIZONTAL_PLATFORM_KEY: string = 'horizontal';
export const VERTICAL_PLATFORM_KEY: string = 'vertical';
export const SPIKE_KEY: string = 'spike';
export const PARTICLE_KEY: string = 'particle';
export const COIN_KEY: string = 'coin';
export const COIN_ICON_KEY: string = 'coin-icon';
export const CERTIFICATE_BACKGROUND_KEY: string = 'certificate-background';
export const CUADRADO_BIG_KEY: string = 'cuadrado-big';
export const TITLE_BACKGROUND_KEY: string = 'title-background';

export const AUDIO_MENU_SELECT_KEY: string = 'menu-select';
export const AUDIO_PLAYER_JUMP_KEY: string = 'player-jump';
export const AUDIO_LEVEL_COMPLETE_KEY: string = 'level-complete';
export const AUDIO_PLAYER_DIES_KEY: string = 'player-dies';
export const AUDIO_PLAYER_COLLECTS_COIN_KEY: string = 'player-collects-coin';
export const AUDIO_GAME_COMPLETE_KEY: string = 'game-complete';

/**
 * Generates a key for levels
 * @param levelNum - Level identifier
 * @return key for level
 */
export const getLevelKey = (levelNum: number): string => {
  return `tilemap_level_${levelNum}`;
};

export const TILED_EXIT_DOOR_LAYER: string = 'ExitDoor';
export const TILED_PLATFORMS_LAYER: string = 'Platforms';
export const TILED_HORIZONTAL_MOVING_PLATFORMS_LAYER: string = 'HorizontalMovingPlatforms';
export const TILED_VERTICAL_MOVING_PLATFORMS_LAYER: string = 'VerticalMovingPlatforms';
export const TILED_SPIKES_LAYER: string = 'Spikes';
export const TILED_CHECKPOINTS_LAYER: string = 'Checkpoints';
export const TILED_PLATFORM_BOUNDARIES_LAYER: string = 'PlatformBoundaries';
export const TILED_COINS_LAYER: string = 'Coins';

export const TILED_TILESET_NAME: string = "Cuadrado's Tiles";

export const TILED_DOOR_KEY: string = 'Door';
export const TILED_HORIZONTAL_MOVING_PLATFORM_KEY: string = 'Horizontal';
export const TILED_VERTICAL_MOVING_PLATFORM_KEY: string = 'Vertical';
export const TILED_SPIKES_KEY: string = 'Spike';
export const TILED_COIN_KEY: string = 'Coin';

export const TILE_SIZE: number = 32;
export const TILE_CORRECTION: number = 1;

export const PARTICLE_COUNT: number = 10;
