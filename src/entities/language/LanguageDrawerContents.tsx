import React from 'react';

import DrawerDetailsField from '@widgets/details/ui/DrawerDetailsField';
import DrawerDetailsSection from '@widgets/details/ui/DrawerDetailsSection';

import { EntityCLDRCoverageLevel } from '@entities/ui/CLDRCoverageInfo';
import CLDRWarningNotes from '@entities/ui/CLDRWarningNotes';

import ExternalLink from '@shared/ui/ExternalLink';

import LanguageDrawerDigitalSupport from './digitalsupport/LanguageDrawerDigitalSupport';
import LanguageDrawerISORows from './identity/LanguageDrawerISORows';
import LanguageDrawerSummary from './LanguageDrawerSummary';
import { LanguageData } from './LanguageTypes';

type Props = {
  lang: LanguageData;
};

const LanguageDrawerContents: React.FC<Props> = ({ lang }) => {
  const { ISO } = lang;

  return (
    <div className="flex flex-col gap-3">
      <LanguageDrawerSummary lang={lang} />

      <DrawerDetailsSection title="Technical Details">
        <LanguageDrawerISORows lang={lang} />
        {lang.Glottolog.code && (
          <DrawerDetailsField
            label="Glottocode"
            actions={
              <ExternalLink
                href={`https://glottolog.org/resource/languoid/id/${lang.Glottolog.code}`}
              >
                glottolog.org
              </ExternalLink>
            }
          >
            {lang.Glottolog.code}
          </DrawerDetailsField>
        )}
        {lang.CLDR.code && (
          <DrawerDetailsField label="CLDR">
            {lang.CLDR.code != ISO.code && lang.CLDR.code}
            <CLDRWarningNotes ent={lang} /> <EntityCLDRCoverageLevel ent={lang} />
          </DrawerDetailsField>
        )}

        <LanguageDrawerDigitalSupport lang={lang} />
      </DrawerDetailsSection>
    </div>
  );
};

export default LanguageDrawerContents;
