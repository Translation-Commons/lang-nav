import React from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';

import { getEcrmlDescription, getEcrmlTitle } from '@entities/locale/LocaleStrings';
import { LocaleData } from '@entities/locale/LocaleTypes';

import Deemphasized from '@shared/ui/Deemphasized';

type Props = {
  locale: LocaleData;
};

const LocaleEcrmlCoverage: React.FC<Props> = ({ locale }) => {
  if (locale.ecrmlProtection == null) {
    return <Deemphasized>None</Deemphasized>;
  }

  const title = getEcrmlTitle(locale.ecrmlProtection);
  const description = getEcrmlDescription(locale.ecrmlProtection);

  if (!title || !description) {
    return <Deemphasized>None</Deemphasized>;
  }

  return (
    <Hoverable
      hoverContent={
        <div>
          <strong>{title}</strong>
          <div style={{ marginTop: '0.5em', maxWidth: '300px' }}>{description}</div>
        </div>
      }
    >
      {title}
    </Hoverable>
  );
};

export default LocaleEcrmlCoverage;
