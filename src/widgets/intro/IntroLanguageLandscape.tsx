import { useState } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/ui/tabs';

import IntroLandscapeByScale from './IntroLandscapeByScale';
import IntroLandscapeByTerritory from './IntroLandscapeByTerritory';

type LandscapeTab = 'territory' | 'scale';

const IntroLanguageLandscape: React.FC = () => {
  const [tab, setTab] = useState<LandscapeTab>('territory');

  return (
    <section className="flex w-full flex-col items-center gap-4">
      <div className="text-center">
        <h2 className="text-2xl leading-tight">The Language Landscape</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Search a territory, switch on a lens, or grasp the scale.
        </p>
      </div>
      <Tabs value={tab} onValueChange={setTab} className="w-full items-center">
        <TabsList>
          <TabsTrigger value="territory">By territory</TabsTrigger>
          <TabsTrigger value="scale">By scale</TabsTrigger>
        </TabsList>
        <TabsContent value="territory" className="w-full">
          <IntroLandscapeByTerritory />
        </TabsContent>
        <TabsContent value="scale" className="w-full">
          <IntroLandscapeByScale />
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default IntroLanguageLandscape;
