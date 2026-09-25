import React from 'react';

import { getViewIcon } from '@widgets/controls/selectors/ViewDisplay';
import DetailsSection from '@widgets/details/ui/DetailsSection';

import { View } from '@features/params/PageParamTypes';

import { Tabs, TabsList, TabsTrigger } from '@shared/ui/tabs';

import { LanguageData } from '../LanguageTypes';
import LanguageOrthographies from './LanguageOrthographies';

const LanguageDetailsOrthographies: React.FC<{ lang: LanguageData }> = ({ lang }) => {
    const [sectionView, setSectionView] = React.useState(View.CardList);
    const orthographies = lang.orthographies ?? [];

    if (orthographies.length === 0) return null;

    return (
        <DetailsSection
            score={orthographies.length}
            startCollapsed={true}
            title="Orthographies"
            headerOptions={
                <Tabs value={sectionView} onValueChange={setSectionView}>
                    <TabsList>
                        {[View.CardList, View.Table].map((v) => (
                            <TabsTrigger key={v} value={v} className="cursor-pointer">
                                {getViewIcon(v)}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            }
        >
            <LanguageOrthographies lang={lang} view={sectionView} />
        </DetailsSection>
    );
};

export default LanguageDetailsOrthographies;