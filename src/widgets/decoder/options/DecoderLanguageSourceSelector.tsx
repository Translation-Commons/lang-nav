import usePageParams from '@features/params/usePageParams';

import { LanguageSource } from '@entities/language/LanguageTypes';

import { Button } from '@shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
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

const DecoderLanguageSourceSelector: React.FC = () => {
  const { updatePageParams, languageSource } = usePageParams();

  return (
    <tr>
      <td>Language code format</td>
      <td>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button className="cursor-pointer" variant="secondary">
                {getSourceLabel(languageSource)}
              </Button>
            }
          />
          <DropdownMenuContent>
            <DropdownMenuRadioGroup
              value={languageSource}
              onValueChange={(value) => updatePageParams({ languageSource: value })}
            >
              {OPTIONS.map((value) => (
                <DropdownMenuRadioItem key={value} value={value}>
                  {getSourceLabel(value)}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
};

function getSourceLabel(languageSource: LanguageSource): string {
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
}

export default DecoderLanguageSourceSelector;
