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
import { LanguageDictionary, LanguageSource } from '../types/LanguageTypes';
import { LocaleSeparator } from '../types/PageParamTypes';
import { getLocaleCode, getLocaleName } from '../views/locale/LocaleStrings';

import { CoreData, EMPTY_LANGUAGES_BY_SCHEMA, useCoreData } from './CoreData';
import { loadSupplementalData } from './SupplementalData';

type DataContextType = CoreData & {
  languages: LanguageDictionary;
};

const DataContext = createContext<DataContextType | undefined>({
  censuses: {},
  languagesBySource: EMPTY_LANGUAGES_BY_SCHEMA,
  languages: {},
  locales: {},
  territories: {},
  writingSystems: {},
  variantTags: {},
});

// Create a provider component
export const DataProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { languageSource, localeSeparator } = usePageParams();
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
      };

      loadSecondaryData(coreData);
    }
  }, [coreData, loadProgress]); // this is called once after page load

  useEffect(() => {
    updateLanguageBasedOnSource(coreData, setLanguages, languageSource, localeSeparator);
  }, [languageSource, loadProgress, localeSeparator]); // when core language data or the language source changes

  return <DataContext.Provider value={{ ...coreData, languages }}>{children}</DataContext.Provider>;
};

function updateLanguageBasedOnSource(
  coreData: CoreData,
  setLanguages: Dispatch<SetStateAction<LanguageDictionary>>,
  languageSource: LanguageSource,
  localeSeparator: LocaleSeparator,
): void {
  const languages = coreData.languagesBySource[languageSource];
  // Update language codes and other values used for filtering
  Object.values(languages).forEach((lang) => {
    const specific = lang.sourceSpecific[languageSource];
    lang.codeDisplay = specific.code ?? lang.ID;
    lang.nameDisplay = specific.name ?? lang.nameCanonical;
    lang.names = uniqueBy(
      [
        lang.nameCanonical,
        lang.nameEndonym,
        ...Object.values(lang.sourceSpecific).map((l) => l.name),
      ].filter((s) => s != null),
      (s) => s,
    );
    lang.scope = specific.scope ?? lang.scope;
    lang.populationOfDescendents = specific.populationOfDescendents ?? undefined;
    lang.populationEstimate = lang.populationCited ?? specific.populationOfDescendents;
    lang.parentLanguage = specific.parentLanguage ?? undefined;
    lang.childLanguages = specific.childLanguages ?? [];
  });

  // Update locales too, their codes and their names
  Object.values(coreData.locales).forEach((loc) => {
    loc.codeDisplay = getLocaleCode(loc, localeSeparator);
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
