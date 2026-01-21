/**
 * Type definitions for Claude Code Bots game
 * These interfaces match the configuration objects used throughout the game
 */

// ============================================================================
// Resource Types
// ============================================================================

/** Resource identifier strings used in the game */
export type ResourceId =
  | 'scrap'
  | 'energy'
  | 'circuits'
  | 'dataCores'
  | 'advancedCircuits'
  | 'botFrames'
  | 'powerCores';

/** Configuration for a resource type */
export interface ResourceConfig {
  /** Unique identifier for the resource */
  id: ResourceId;
  /** Display name shown in UI */
  name: string;
  /** Hex color code for visual representation */
  color: string;
  /** Maximum amount player can store (before upgrades) */
  maxCapacity: number;
  /** Base regeneration rate per second (for resource nodes) */
  regenRate: number;
}

/** Map of resource enum keys to their configurations */
export type ResourcesMap = Record<string, ResourceConfig>;

/** Generic resource cost/amount mapping */
export type ResourceCost = Partial<Record<ResourceId, number>>;

// ============================================================================
// Building Types
// ============================================================================

/** Building identifier strings */
export type BuildingId =
  | 'generator'
  | 'harvester'
  | 'assembler'
  | 'researchTerminal'
  | 'storageBay'
  | 'repairStation';

/** Building grid size */
export interface BuildingSize {
  width: number;
  height: number;
}

/** Configuration for a building type */
export interface BuildingConfig {
  /** Unique identifier for the building */
  id: BuildingId;
  /** Display name shown in UI */
  name: string;
  /** Resources required to construct this building */
  cost: ResourceCost;
  /** Power units consumed per tick when active */
  powerConsumption: number;
  /** Time in milliseconds to complete one production cycle */
  productionTime: number;
  /** Tooltip description */
  description: string;
  /** Grid size of the building */
  size: BuildingSize;
}

/** Map of building enum keys to their configurations */
export type BuildingsMap = Record<string, BuildingConfig>;

// ============================================================================
// Recipe Types
// ============================================================================

/** Input requirement for a recipe */
export interface RecipeInput {
  /** Resource type required */
  resource: ResourceId;
  /** Amount of resource consumed per craft */
  amount: number;
}

/** Configuration for a crafting recipe */
export interface RecipeConfig {
  /** Unique identifier for the recipe */
  id: string;
  /** Display name shown in UI */
  name: string;
  /** List of input resources required */
  inputs: RecipeInput[];
  /** Resource type produced */
  output: ResourceId;
  /** Amount produced per craft */
  outputAmount: number;
  /** Building type that can process this recipe */
  buildingType: BuildingId;
  /** Time in milliseconds to complete one craft */
  productionTime: number;
}

// ============================================================================
// Research Types
// ============================================================================

/** Types of research effects */
export type ResearchEffectType =
  | 'harvesterSpeed'
  | 'storageCapacity'
  | 'unlockRecipe'
  | 'allBuildingsSpeed'
  | 'unlockBuilding';

/** Base research effect */
export interface ResearchEffectBase {
  type: ResearchEffectType;
}

/** Speed bonus effect (harvester or all buildings) */
export interface SpeedBonusEffect extends ResearchEffectBase {
  type: 'harvesterSpeed' | 'allBuildingsSpeed';
  /** Percentage bonus as decimal (0.25 = 25%) */
  bonus: number;
}

/** Storage capacity effect */
export interface StorageCapacityEffect extends ResearchEffectBase {
  type: 'storageCapacity';
  /** Flat capacity increase */
  bonus: number;
}

/** Unlock recipe effect */
export interface UnlockRecipeEffect extends ResearchEffectBase {
  type: 'unlockRecipe';
  /** ID of recipe to unlock */
  recipeId: string;
}

/** Unlock building effect */
export interface UnlockBuildingEffect extends ResearchEffectBase {
  type: 'unlockBuilding';
  /** ID of building to unlock */
  buildingId: BuildingId;
}

/** Union of all research effect types */
export type ResearchEffect =
  | SpeedBonusEffect
  | StorageCapacityEffect
  | UnlockRecipeEffect
  | UnlockBuildingEffect;

/** Configuration for a research item */
export interface ResearchConfig {
  /** Unique identifier for the research */
  id: string;
  /** Display name shown in UI */
  name: string;
  /** Resources required to complete research */
  cost: ResourceCost;
  /** Effect granted when research completes */
  effect: ResearchEffect;
  /** IDs of research items that must be completed first */
  requires: string[];
  /** Tooltip description */
  description: string;
}

// ============================================================================
// Stage/Progression Types
// ============================================================================

/** Types of stage objectives */
export type StageTargetType =
  | 'build'
  | 'collect'
  | 'craft'
  | 'research'
  | 'sandbox';

/** Configuration for a game stage */
export interface StageConfig {
  /** Unique identifier for the stage */
  id: string;
  /** Display name shown in UI */
  name: string;
  /** Description of what player needs to accomplish */
  objective: string;
  /** Type of objective */
  targetType: StageTargetType;
  /** Specific target ID (building, resource, or 'any') - null for sandbox */
  targetId: string | null;
  /** Amount required to complete (0 for sandbox) */
  targetAmount: number;
  /** Resources granted upon completion */
  rewards: ResourceCost;
  /** Tutorial hints displayed during this stage */
  tutorialHints: string[];
}

// ============================================================================
// Game State Types (for future use)
// ============================================================================

/** Current resource amounts held by player */
export type ResourceInventory = Record<ResourceId, number>;

/** State of a placed building instance */
export interface BuildingInstance {
  /** Unique instance ID */
  instanceId: string;
  /** Building type configuration */
  config: BuildingConfig;
  /** Grid position */
  position: { x: number; y: number };
  /** Whether building is currently powered */
  isPowered: boolean;
  /** Whether building is currently active/producing */
  isActive: boolean;
  /** Current production progress (0-1) */
  productionProgress: number;
  /** Currently selected recipe (for assemblers) */
  currentRecipe?: RecipeConfig;
}

/** State of a resource node on the map */
export interface ResourceNodeInstance {
  /** Unique instance ID */
  instanceId: string;
  /** Resource type this node provides */
  resourceType: ResourceId;
  /** Grid position */
  position: { x: number; y: number };
  /** Current amount available */
  currentAmount: number;
  /** Maximum capacity */
  maxAmount: number;
  /** Whether node is depleted */
  isDepleted: boolean;
}

/** Overall game state (for save/load) */
export interface GameState {
  /** Current resources held */
  resources: ResourceInventory;
  /** All placed buildings */
  buildings: BuildingInstance[];
  /** All resource nodes */
  resourceNodes: ResourceNodeInstance[];
  /** Completed research IDs */
  completedResearch: string[];
  /** Current stage ID */
  currentStage: string;
  /** Stage progress data */
  stageProgress: Record<string, number>;
  /** Total playtime in milliseconds */
  playTime: number;
}

// ============================================================================
// Event Types (for future use)
// ============================================================================

/** Game event names */
export type GameEventType =
  | 'resourceChanged'
  | 'buildingPlaced'
  | 'buildingRemoved'
  | 'productionComplete'
  | 'researchComplete'
  | 'stageComplete'
  | 'gameLoaded'
  | 'gameSaved';

/** Base event data */
export interface GameEventBase {
  type: GameEventType;
  timestamp: number;
}

/** Resource change event */
export interface ResourceChangedEvent extends GameEventBase {
  type: 'resourceChanged';
  resourceId: ResourceId;
  previousAmount: number;
  newAmount: number;
  delta: number;
}

/** Building placed event */
export interface BuildingPlacedEvent extends GameEventBase {
  type: 'buildingPlaced';
  building: BuildingInstance;
}

/** Production complete event */
export interface ProductionCompleteEvent extends GameEventBase {
  type: 'productionComplete';
  buildingInstanceId: string;
  recipe?: RecipeConfig;
  outputResource: ResourceId;
  outputAmount: number;
}
