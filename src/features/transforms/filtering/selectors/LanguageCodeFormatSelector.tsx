import React from 'react';

import usePageParams from '@features/params/usePageParams';

import { LanguageCodeFormat } from '@entities/language/LanguageTypes';

import { Button } from '@shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@shared/ui/dropdown-menu';

import { getFormatLabel } from '@strings/LanguageCodeFormatStrings';

type Props = { dataSettings?: boolean };

const LanguageCodeFormatSelector: React.FC<Props> = ({ dataSettings = true }) => {
  const { languageCodeFormat, setLanguageCodeFormat } = usePageParams();

  return (
    <>
      {dataSettings && <div className="text-right">Language Codes</div>}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              className={dataSettings ? 'max-w-30 truncate justify-start' : ''}
              variant="outline"
            >
              {getFormatLabel(languageCodeFormat)}
            </Button>
          }
        />
        <DropdownMenuContent className="min-w-40">
          <DropdownMenuGroup>
            <DropdownMenuRadioGroup
              value={languageCodeFormat}
              onValueChange={setLanguageCodeFormat}
            >
              {Object.values(LanguageCodeFormat).map((value) => (
                <DropdownMenuRadioItem key={value} value={value} className="cursor-pointer">
                  {getFormatLabel(value)}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default LanguageCodeFormatSelector;
