import { LanguageData, LanguagesBySource, LanguageSource } from '@entities/language/LanguageTypes';
import { ScriptCode, WritingSystemData } from '@entities/types/DataTypes';

export function computeDescendantPopulation(
  languagesBySource: LanguagesBySource,
  writingSystems: Record<ScriptCode, WritingSystemData>,
): void {
  // Organizing writing systems by population is a bit funny because some fundamental writing systems
  // like Egyptian have no people but writing systems that descend from then certainly do. Thereby we
  // separately compute an upper bound for how many people speak the descendants. This is safe
  // recursively because the writing system lineage is not a cycle.
  Object.values(writingSystems)
    .filter((writingSystem) => writingSystem.parentWritingSystem == null)
    .forEach(computeWritingSystemDescendantPopulation);

  // Need to compute the language descendant populations 3 times because nodes will be organized
  // differently in the different language sources
  Object.values(LanguageSource).forEach((source) => {
    Object.values(languagesBySource[source])
      .filter((lang) => lang[source].parentLanguage == null) // start at roots
      .forEach((lang) => computeLanguageDescendantPopulation(lang, source));
  });
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

function computeLanguageDescendantPopulation(lang: LanguageData, source: LanguageSource): number {
  const childLanguages = lang[source].childLanguages ?? [];
  const descendantPopulation = childLanguages.reduce(
    (total, childLang) => total + computeLanguageDescendantPopulation(childLang, source),
    1,
  );
  lang[source].populationOfDescendants = descendantPopulation;
  return Math.max(lang.populationCited || 0, descendantPopulation) + 1; // Tiebreaker = number of child nodes
}
