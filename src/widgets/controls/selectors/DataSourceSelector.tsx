import { DatabaseZapIcon, FilesIcon, LucideIcon } from 'lucide-react';
import React from 'react';

import { EndpointSource, getDataSource, setDataSource } from '@features/data/api/core/endpoints';

import { Button } from '@shared/ui/button';
import ContextIcon from '@shared/ui/ContextIcon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@shared/ui/dropdown-menu';

const OPTIONS: Record<EndpointSource, { label: string; Icon: LucideIcon }> = {
  [EndpointSource.API]: { label: 'API', Icon: DatabaseZapIcon },
  [EndpointSource.Files]: { label: 'Files', Icon: FilesIcon },
};

const DataSourceSelector: React.FC = () => {
  const source = getDataSource();
  const { label, Icon } = OPTIONS[source];

  return (
    <>
      <div className="text-right">
        Data Source{' '}
        <ContextIcon>
          API asks the LangNav server for each view it can answer; the other views keep using the
          files. Files computes everything in your browser from the data files. Changing this
          reloads the page.
        </ContextIcon>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button className="cursor-pointer" variant="outline" role="dropdown">
              <Icon className="size-4" />
              {label}
            </Button>
          }
        />
        <DropdownMenuContent>
          <DropdownMenuRadioGroup
            value={source}
            onValueChange={(value: EndpointSource) => {
              if (value === source) return;
              setDataSource(value);
              // Each endpoint reads its source once, so the switch needs a fresh load.
              window.location.reload();
            }}
          >
            {Object.values(EndpointSource).map((option) => {
              const { label: optionLabel, Icon: OptionIcon } = OPTIONS[option];
              return (
                <DropdownMenuRadioItem key={option} value={option} className="cursor-pointer">
                  <OptionIcon className="size-4" />
                  {optionLabel}
                </DropdownMenuRadioItem>
              );
            })}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default DataSourceSelector;
