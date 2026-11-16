import { updateEntitiesBasedOnDataParams } from '@features/data/compute/updateEntitiesBasedOnDataParams';
import {
  type CoreData,
  getCoreDataArrays,
  loadCoreDataArrays,
} from '@features/data/load/loadCoreDataArrays';
import type { LocaleSeparator } from '@features/params/LocalStorageParams';

import { LanguageCodeFormat, type LanguageSource } from '@entities/language/LanguageTypes';
import type { TerritoryData } from '@entities/territory/TerritoryTypes';
import { type EntityData, EntityType } from '@entities/types/EntityTypes';

export type PipelineRun = {
  source: LanguageSource;
  core: CoreData;
  loadMs: number;
  updateMs: number;
};

/**
 * A fresh load of the core data followed by the source-dependent update, ie. the state the app
 * reaches when opened with this language source (minus supplemental data, which is out of scope).
 */
export async function runCorePipeline(
  source: LanguageSource,
  localeSeparator: LocaleSeparator,
): Promise<PipelineRun> {
  const loadStart = performance.now();
  const loaded = await loadCoreDataArrays();
  if (loaded == null) throw new Error('Failed to load core data');
  const core = getCoreDataArrays(loaded.languages, loaded.ents, {});
  const loadMs = performance.now() - loadStart;

  const world = loaded.ents['001'] as TerritoryData | undefined;
  if (world == null) throw new Error('World territory 001 is missing');
  const updateStart = performance.now();
  updateEntitiesBasedOnDataParams(
    core.languages,
    core.locales,
    world,
    core.writingSystems,
    source,
    LanguageCodeFormat.Unset,
    localeSeparator,
  );
  return { source, core, loadMs, updateMs: performance.now() - updateStart };
}

/** The arrays useEntities hands to the filters, per type, in the same order. */
export function getQueryableEntities(core: CoreData): Record<EntityType, EntityData[]> {
  return {
    [EntityType.Language]: core.languages,
    [EntityType.Locale]: core.locales,
    [EntityType.Territory]: core.territories,
    [EntityType.WritingSystem]: core.writingSystems,
    [EntityType.Census]: Object.values(core.censuses),
    [EntityType.Variant]: core.variants,
    [EntityType.Keyboard]: core.keyboards,
    [EntityType.Org]: core.organizations,
    [EntityType.Technology]: core.technologies,
    [EntityType.Orthography]: core.orthographies,
  };
}
