import Selector from '@features/params/ui/Selector';
import usePageParams from '@features/params/usePageParams';

import LanguageSourceDescription from '@entities/language/LanguageSourceDescription';
import { LanguageSource } from '@entities/language/LanguageTypes';

const DecoderLanguageSourceSelector: React.FC = () => {
  const { updatePageParams, languageSource } = usePageParams();

  return (
    <div className="flex flex-row gap-1">
      Language code format and list of languages:
      <Selector
        options={[
          LanguageSource.Combined,
          LanguageSource.ISO,
          LanguageSource.BCP,
          LanguageSource.CLDR,
          LanguageSource.Glottolog,
        ]}
        onChange={(languageSource: LanguageSource) => updatePageParams({ languageSource })}
        selected={languageSource}
        getOptionLabel={(languageSource) => {
          switch (languageSource) {
            case LanguageSource.Combined:
              return 'ISO-639-3/5, otherwise Glottolog glottocodes';
            case LanguageSource.ISO:
              return 'ISO-639-3 and ISO-639-5';
            case LanguageSource.BCP:
              return 'BCP-47 (ISO-639-1, otherwise ISO-639-3/5)';
            case LanguageSource.CLDR:
              return 'CLDR (BCP-47 with macrolanguage adjustments)';
            case LanguageSource.Glottolog:
              return 'Glottolog glottocodes';
            default:
              return '';
          }
        }}
        getOptionDescription={(languageSource) => (
          <LanguageSourceDescription languageSource={languageSource} />
        )}
      />
    </div>
  );
};

export default DecoderLanguageSourceSelector;
