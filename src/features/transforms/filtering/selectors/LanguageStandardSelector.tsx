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

import { getSourceLabel } from '@strings/LanguageSourceStrings';

const OPTIONS = [
  LanguageSource.Combined,
  LanguageSource.ISO,
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

export default DecoderLanguageSourceSelector;
