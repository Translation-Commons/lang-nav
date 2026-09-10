import { ArrowDownIcon } from 'lucide-react';
import React from 'react';

import IntroHeroSearch from '@widgets/intro/IntroHeroSearch';
import IntroHighlights from '@widgets/intro/IntroHighlights';
import IntroTaskCards from '@widgets/intro/IntroTaskCards';

import { Badge } from '@shared/ui/badge';

const HELP_HEADING_ID = 'how-can-we-help';

const IntroPage: React.FC = () => {
  // App renders this page inside a fixed-height scroll container, so h-full is that container.
  return (
    <div className="flex h-full flex-col">
      <div className="relative isolate flex min-h-3/4 w-full shrink-0 flex-col justify-center">
        <div className="absolute inset-0 -z-10 bg-checkered mask-b-from-10%" aria-hidden="true" />
        <div className="mx-auto flex w-full max-w-[1000px] flex-col items-center gap-8 px-4 py-8 text-center">
          <div className="flex w-full flex-col items-center">
            <h1 className="text-4xl leading-tight sm:text-5xl">
              Explore the world&apos;s languages
            </h1>
            <p className="mt-3 max-w-[620px] text-base/relaxed text-muted-foreground">
              Everything you need to understand a language, where it&apos;s spoken, how it&apos;s
              written, and how well it&apos;s supported today.
            </p>
            <div className="mt-6 w-full max-w-[560px]">
              <IntroHeroSearch />
            </div>
            <a
              href={'#' + HELP_HEADING_ID}
              className="mt-5 inline-flex items-center gap-1 text-sm text-muted-foreground"
            >
              Not sure where to start?
              <ArrowDownIcon className="size-4" aria-hidden="true" />
            </a>
          </div>
          <IntroHighlights />
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-[1000px] flex-col items-center gap-10 px-4 py-10">
        <section className="w-full" aria-labelledby={HELP_HEADING_ID}>
          <div className="text-center">
            <h2 id={HELP_HEADING_ID} className="text-2xl leading-tight">
              How can Language Navigator help?
            </h2>
            <p className="mt-2 mb-5 text-sm text-muted-foreground">
              Choose a task below to jump into the most relevant language data and tools.
            </p>
          </div>
          <IntroTaskCards />
        </section>
        <p className="max-w-[560px] text-center text-xs/relaxed text-muted-foreground">
          <Badge variant="outline" className="mr-1">
            Beta β
          </Badge>
          Most functionality is present, but there still may be errors, particularly with data.
        </p>
      </div>
    </div>
  );
};

export default IntroPage;
