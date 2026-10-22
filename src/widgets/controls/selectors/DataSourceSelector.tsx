import { DatabaseZapIcon, LaptopIcon, LucideIcon } from 'lucide-react';
import React from 'react';

import { DataSource, setDataSource } from '@features/data/api/apiClient';
import { useEffectiveDataSource } from '@features/data/api/useDataSource';

import { Button } from '@shared/ui/button';
import ContextIcon from '@shared/ui/ContextIcon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@shared/ui/dropdown-menu';

const OPTIONS: Record<DataSource, { label: string; Icon: LucideIcon }> = {
  [DataSource.Local]: { label: 'Local', Icon: LaptopIcon },
  [DataSource.API]: { label: 'API', Icon: DatabaseZapIcon },
};

const DataSourceSelector: React.FC = () => {
  // Shows Local when the backend is unreachable; picking API again retries after the reload.
  const source = useEffectiveDataSource();
  const { label, Icon } = OPTIONS[source];

  return (
    <>
      <div className="text-right">
        Data Source{' '}
        <ContextIcon>
          Local computes everything in your browser from the data files. API loads the tables that
          support it page by page from the LangNav server; everything else stays local. Changing
          this reloads the page.
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
            onValueChange={(value: DataSource) => {
              if (value === source) return;
              setDataSource(value);
              // The source is read during render, so a fresh load applies it everywhere at once.
              window.location.reload();
            }}
          >
            {Object.values(DataSource).map((option) => {
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
