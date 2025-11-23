import { LanguageData, LanguagesBySource, LanguageSource } from '@entities/language/LanguageTypes';
import { ScriptCode, WritingSystemData } from '@entities/types/DataTypes';

export function computeDescendentPopulation(
  languagesBySource: LanguagesBySource,
  writingSystems: Record<ScriptCode, WritingSystemData>,
): void {
  // Organizing writing systems by population is a bit funny because some fundamental writing systems
  // like Egyptian have no people but writing systems that descend from then certainly do. Thereby we
  // separately compute an upper bound for how many people speak the descendents. This is safe
  // recursively because the writing system lineage is not a cycle.
  Object.values(writingSystems)
    .filter((writingSystem) => writingSystem.parentWritingSystem == null)
    .forEach(computeWritingSystemDescendentPopulation);

  // Need to compute the language descendent populations 3 times because nodes will be organized
  // differently in the different language sources
  Object.values(LanguageSource).forEach((source) => {
    Object.values(languagesBySource[source])
      .filter((lang) => lang[source].parentLanguage == null) // start at roots
      .forEach((lang) => computeLanguageDescendentPopulation(lang, source));
  });
}

function computeWritingSystemDescendentPopulation(writingSystem: WritingSystemData): number {
  const { childWritingSystems } = writingSystem;
  const descendentPopulation =
    childWritingSystems?.reduce(
      (total, childSystem) => total + computeWritingSystemDescendentPopulation(childSystem),
      0,
    ) || 0;
  writingSystem.populationOfDescendents = descendentPopulation || undefined;
  return descendentPopulation + (writingSystem.populationUpperBound ?? 0);
}

function computeLanguageDescendentPopulation(lang: LanguageData, source: LanguageSource): number {
  const childLanguages = lang[source].childLanguages ?? [];
  const descendentPopulation = childLanguages.reduce(
    (total, childLang) => total + computeLanguageDescendentPopulation(childLang, source),
    1,
  );
  lang[source].populationOfDescendents = descendentPopulation;
  return Math.max(lang.populationCited || 0, descendentPopulation) + 1; // Tiebreaker = number of child nodes
}
