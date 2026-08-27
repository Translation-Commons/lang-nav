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

import { DecoderDirection, useDecoderOptionsContext } from './DecoderOptionsContext';

const OPTIONS = [
  LanguageSource.Combined,
  LanguageSource.ISO,
  LanguageSource.BCP,
  LanguageSource.CLDR,
  LanguageSource.Glottolog,
];

const DecoderLanguageSourceSelector: React.FC = () => {
  const { updatePageParams, languageSource } = usePageParams();
  const { direction } = useDecoderOptionsContext();

  return (
    <tr>
      <td>
        {direction === DecoderDirection.CodesToNames ? 'Output name source' : 'Output code format'}
      </td>
      <td>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button className="cursor-pointer" variant="secondary">
                {getSourceLabel(languageSource, direction)}
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
                  {getSourceLabel(value, direction)}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
};

function getSourceLabel(languageSource: LanguageSource, direction: DecoderDirection): string {
  switch (languageSource) {
    case LanguageSource.Combined:
      return direction === DecoderDirection.CodesToNames
        ? 'LangNav'
        : 'ISO-639-3/5, otherwise Glottolog';
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
