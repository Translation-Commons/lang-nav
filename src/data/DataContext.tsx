import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react';

import { usePageParams } from '../controls/PageParamsContext';
import { uniqueBy } from '../generic/setUtils';
import { LanguageDictionary, LanguageSchema } from '../types/LanguageTypes';
import { LocaleSeparator } from '../types/PageParamTypes';
import { getLocaleName } from '../views/locale/LocaleStrings';

import { CoreData, EMPTY_LANGUAGES_BY_SCHEMA, useCoreData } from './CoreData';
import { loadSupplementalData } from './SupplementalData';

type DataContextType = CoreData & {
  languages: LanguageDictionary;
};

const DataContext = createContext<DataContextType | undefined>({
  censuses: {},
  languagesBySchema: EMPTY_LANGUAGES_BY_SCHEMA,
  languages: {},
  locales: {},
  territories: {},
  writingSystems: {},
});

// Create a provider component
export const DataProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { languageSchema, localeSeparator } = usePageParams();
  const { coreData, loadCoreData } = useCoreData();
  const [loadProgress, setLoadProgress] = useState(0);
  const [languages, setLanguages] = useState<LanguageDictionary>({});

  useEffect(() => {
    const loadPrimaryData = async () => {
      await loadCoreData();
      setLoadProgress(1);
    };
    loadPrimaryData();
  }, []); // this is called once after page load

  // After the main load, load additional data
  useEffect(() => {
    if (loadProgress === 1) {
      const loadSecondaryData = async (coreData: CoreData) => {
        await loadSupplementalData(coreData);
        setLoadProgress(2);
        // updateLanguageBasedOnSchema(coreData, setLanguages, languageSchema, localeSeparator);
      };

      loadSecondaryData(coreData);
    }
  }, [coreData, loadProgress]); // this is called once after page load

  useEffect(() => {
    updateLanguageBasedOnSchema(coreData, setLanguages, languageSchema, localeSeparator);
  }, [languageSchema, loadProgress, localeSeparator]); // when core language data or the language schema changes

  return <DataContext.Provider value={{ ...coreData, languages }}>{children}</DataContext.Provider>;
};

function updateLanguageBasedOnSchema(
  coreData: CoreData,
  setLanguages: Dispatch<SetStateAction<LanguageDictionary>>,
  languageSchema: LanguageSchema,
  localeSeparator: LocaleSeparator,
): void {
  const languages = coreData.languagesBySchema[languageSchema];
  // Update language codes and other values used for filtering
  Object.values(languages).forEach((lang) => {
    const specific = lang.schemaSpecific[languageSchema];
    lang.codeDisplay = specific.code ?? lang.ID;
    lang.nameDisplay = specific.name ?? lang.nameCanonical;
    lang.names = uniqueBy(
      [
        lang.nameCanonical,
        lang.nameEndonym,
        ...Object.values(lang.schemaSpecific).map((l) => l.name),
      ].filter((s) => s != null),
      (s) => s,
    );
    lang.scope = specific.scope ?? lang.scope;
    lang.populationOfDescendents = specific.populationOfDescendents ?? undefined;
    lang.parentLanguage = specific.parentLanguage ?? undefined;
    lang.childLanguages = specific.childLanguages ?? [];
  });

  // Update locales too, their codes and their names
  Object.values(coreData.locales).forEach((loc) => {
    loc.codeDisplay = [
      loc.language?.codeDisplay ?? loc.languageCode,
      loc.explicitScriptCode,
      loc.territoryCode,
      loc.variantTag,
    ]
      .filter(Boolean)
      .join(localeSeparator);
    loc.nameDisplay = getLocaleName(loc);
  });

  setLanguages({ ...languages });
}

// Custom hook for easier usage
export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useDataContext must be used within a DataProvider');
  return context;
};

export default DataProvider;
