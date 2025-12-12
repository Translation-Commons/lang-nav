import { ScriptCode, WritingSystemData } from '@entities/types/DataTypes';

export function computeDescendantPopulation(
  writingSystems: Record<ScriptCode, WritingSystemData>,
): void {
  // Organizing writing systems by population is a bit funny because some fundamental writing systems
  // like Egyptian have no people but writing systems that descend from then certainly do. Thereby we
  // separately compute an upper bound for how many people speak the descendants. This is safe
  // recursively because the writing system lineage is not a cycle.
  Object.values(writingSystems)
    .filter((writingSystem) => writingSystem.parentWritingSystem == null)
    .forEach(computeWritingSystemDescendantPopulation);
}

function computeWritingSystemDescendantPopulation(writingSystem: WritingSystemData): number {
  const { childWritingSystems } = writingSystem;
  const descendantPopulation =
    childWritingSystems?.reduce(
      (total, childSystem) => total + computeWritingSystemDescendantPopulation(childSystem),
      0,
    ) || 0;
  writingSystem.populationOfDescendants = descendantPopulation || undefined;
  return descendantPopulation + (writingSystem.populationUpperBound ?? 0);
}
