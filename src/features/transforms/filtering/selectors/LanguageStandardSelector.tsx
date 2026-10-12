import usePageParams from '@features/params/usePageParams';

import { LanguageSource } from '@entities/language/LanguageTypes';

import { Button } from '@shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@shared/ui/dropdown-menu';

const OPTIONS = [
  LanguageSource.Combined,
  LanguageSource.ISO,
  LanguageSource.BCP,
  LanguageSource.CLDR,
  LanguageSource.Glottolog,
];

/**
 * Different wording for the language source selector
 */
const DecoderLanguageSourceSelector: React.FC = () => {
  const { updatePageParams, languageSource } = usePageParams();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button className="cursor-pointer" variant="outline">
            {getSourceLabel(languageSource)}
          </Button>
        }
      />
      <DropdownMenuContent className="min-w-40">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Language List & Formatting</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={languageSource}
            onValueChange={(value) => updatePageParams({ languageSource: value })}
          >
            {OPTIONS.map((value) => (
              <DropdownMenuRadioItem key={value} value={value} className="cursor-pointer">
                {getSourceLabel(value)}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

function getSourceLabel(languageSource: LanguageSource): string {
  switch (languageSource) {
    case LanguageSource.Combined:
      return 'Combined by LangNav (prefer ISO, include Glottolog)';
    case LanguageSource.ISO:
      return 'ISO-639-3 and ISO-639-5';
    case LanguageSource.BCP:
      return 'BCP-47 (ISO-639-1, otherwise ISO-639-3/5)';
    case LanguageSource.CLDR:
      return 'CLDR (BCP-47 with macrolanguage adjustments)';
    case LanguageSource.Glottolog:
      return 'Glottolog';
    default:
      return '';
  }
}

export default DecoderLanguageSourceSelector;
