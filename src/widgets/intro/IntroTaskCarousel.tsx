import Autoplay from 'embla-carousel-autoplay';
import {
  ArrowRightIcon,
  LanguagesIcon,
  LaptopIcon,
  type LucideIcon,
  MapPinIcon,
  MessageCircleIcon,
  PenLineIcon,
  UsersIcon,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { getDataPageURL } from '@features/params/getDataPageURL';
import { getParamsForLanguageFocus, LanguageFocus } from '@features/params/LanguageFocus';
import { PageParams, View } from '@features/params/PageParamTypes';

import { EntityType } from '@entities/types/EntityTypes';

import { cn } from '@shared/lib/utils';
import { Button, buttonVariants } from '@shared/ui/button';
import { Card } from '@shared/ui/card';
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@shared/ui/carousel';

import DigitalSupportPreview from './previews/DigitalSupportPreview';
import LanguagesPreview from './previews/LanguagesPreview';
import LanguageTreePreview from './previews/LanguageTreePreview';
import LocalesPreview from './previews/LocalesPreview';
import LocaleTablePreview from './previews/LocaleTablePreview';
import WritingSystemsPreview from './previews/WritingSystemsPreview';

type Task = {
  icon: LucideIcon;
  title: string;
  text: string;
  cta: string;
  focus: LanguageFocus;
  params: Partial<PageParams>;
  Preview: React.FC<{ className?: string }>;
};

const TASKS: Task[] = [
  {
    icon: MessageCircleIcon,
    title: 'Explore a language',
    text: "Learn about a language's speakers, writing systems, digital support, and geographic distribution.",
    cta: 'Browse Languages',
    focus: LanguageFocus.AllLanguages,
    params: { entType: EntityType.Language },
    Preview: LanguagesPreview,
  },
  {
    icon: MapPinIcon,
    title: 'Find Languages in a Region',
    text: 'Discover which languages are spoken, written, or used within a specific country or territory.',
    cta: 'Explore Regions',
    focus: LanguageFocus.SpokenLanguages,
    params: { entType: EntityType.Locale, territoryFilter: 'India [IN]' },
    Preview: LocalesPreview,
  },
  {
    icon: LaptopIcon,
    title: 'Assess Digital Support',
    text: 'Check whether a language is supported by keyboards, fonts, translation tools, speech technologies, and other digital resources.',
    cta: 'View Digital Support',
    focus: LanguageFocus.DigitizedLanguages,
    params: { entType: EntityType.Language, view: View.Chart },
    Preview: DigitalSupportPreview,
  },
  {
    icon: PenLineIcon,
    title: 'Explore Writing Systems',
    text: 'Understand how languages are written and discover the scripts used around the world.',
    cta: 'Browse Writing Systems',
    focus: LanguageFocus.WrittenLanguages,
    params: { entType: EntityType.WritingSystem },
    Preview: WritingSystemsPreview,
  },
  {
    icon: LanguagesIcon,
    title: 'Support Localization and Translation',
    text: 'Identify languages, scripts, and digital requirements needed to expand products and services into new markets.',
    cta: 'Find Supported Languages',
    focus: LanguageFocus.DigitizedLanguages,
    params: { entType: EntityType.Locale, view: View.Table },
    Preview: LocaleTablePreview,
  },
  {
    icon: UsersIcon,
    title: 'Understand Language Relationships',
    text: 'Explore the family tree of languages and see how they relate to each other.',
    cta: 'Explore Language Families',
    focus: LanguageFocus.AllLanguoids,
    params: { entType: EntityType.Language, view: View.Hierarchy },
    Preview: LanguageTreePreview,
  },
];

const TaskSlide: React.FC<{ task: Task }> = ({ task }) => {
  const { icon: Icon, title, text, cta, focus, params, Preview } = task;
  return (
    <Card className="relative h-full gap-0 py-0 ring-foreground/30 transition-colors has-[a:hover]:bg-muted/50">
      <div className="aspect-4/3 max-h-[35vh] overflow-hidden border-b bg-card pt-3 pl-3 sm:aspect-video sm:pt-4 sm:pl-4">
        <Preview className="size-full" />
      </div>
      <div className="flex flex-1 flex-col gap-4 p-6 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-2 sm:basis-4/5">
          <h3 className="flex items-center gap-2 text-xl font-medium">
            <Icon className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            {title}
          </h3>
          <p className="text-sm/relaxed text-muted-foreground">{text}</p>
        </div>
        <div className="flex sm:basis-1/5 sm:justify-end">
          <Link
            to={getDataPageURL({ ...getParamsForLanguageFocus(focus), ...params })}
            data-slot="button"
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'after:absolute after:inset-0 active:not-aria-[haspopup]:translate-none',
            )}
          >
            {cta}
            <ArrowRightIcon />
          </Link>
        </div>
      </div>
    </Card>
  );
};

const IntroTaskCarousel: React.FC = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const autoplay = useRef(
    Autoplay({ delay: 6000, stopOnInteraction: true, stopOnMouseEnter: true }),
  );

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setSelectedIndex(api.selectedScrollSnap());
    onSelect();
    api.on('select', onSelect).on('reInit', onSelect);
    return () => {
      api.off('select', onSelect).off('reInit', onSelect);
    };
  }, [api]);

  return (
    <Carousel
      setApi={setApi}
      opts={{ align: 'start', loop: true }}
      plugins={[autoplay.current]}
      className="w-full"
    >
      <CarouselContent className="py-1">
        {TASKS.map((task, index) => (
          <CarouselItem
            key={task.title}
            className="basis-[90%] pl-[calc(1rem+1px)]"
            inert={index !== selectedIndex}
          >
            <TaskSlide task={task} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="mt-4 flex items-center justify-center gap-3">
        <CarouselPrevious className="static my-0" />
        <div className="flex gap-1.5">
          {TASKS.map(({ title }, index) => (
            <Button
              key={title}
              variant="ghost"
              aria-label={`Show ${title}`}
              aria-current={index === selectedIndex ? 'true' : undefined}
              onClick={() => api?.scrollTo(index)}
              className={cn(
                "relative h-2 w-2 rounded-full border-0 bg-foreground/20 p-0 after:absolute after:-inset-x-0.75 after:-inset-y-3 after:content-[''] hover:bg-foreground/40",
                index === selectedIndex && 'w-5 bg-foreground/70 hover:bg-foreground/70',
              )}
            />
          ))}
        </div>
        <CarouselNext className="static my-0" />
      </div>
    </Carousel>
  );
};

export default IntroTaskCarousel;
