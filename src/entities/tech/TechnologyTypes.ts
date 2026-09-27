import { EntityBase, EntityType } from '@entities/types/EntityTypes';

export interface TechnologyData extends EntityBase {
  type: EntityType.Technology;
  ID: string; // A stable ID to use with indexing, eg. "tech.Android" -- should always be prefixed by `tech.` to avoid conflicts
  codeDisplay: string; // The short name eg. "Android" "FB4A"
  nameDisplay: string; // long name eg. "Android" "Facebook for Android"
}
