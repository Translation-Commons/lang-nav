import { LocaleData } from '@entities/locale/LocaleTypes';
import DetailsSection from '@widgets/details/ui/DetailsSection';
import React from 'react';
import LocaleGridCell from './LocaleGridCell';

type Props = {
  locales: LocaleData[];
};

const LocaleGrid: React.FC<Props> = ({ locales }) => {

  if (locales.length === 0) return null;

  return (
    <DetailsSection title="Locales" >
      {/* 3x3 grid with max height and scrollable */}
      <div className="grid grid-cols-3 gap-3 p-2.5 max-h-64 overflow-y-auto">
        {locales.map((locale) => (
          <LocaleGridCell key={locale.ID} locale={locale} />
        ))}
      </div>
    </DetailsSection>
  );
};

export default LocaleGrid;
