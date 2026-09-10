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
import React from 'react';
import { Link } from 'react-router-dom';

import { LangNavPageName } from '@app/PageRoutes';

import { getNewURLSearchParams } from '@features/params/getNewURLSearchParams';
import { getParamsForLanguageFocus, LanguageFocus } from '@features/params/LanguageFocus';
import { EntityType, PageParams, View } from '@features/params/PageParamTypes';
import Field from '@features/transforms/fields/Field';

import { buttonVariants } from '@shared/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@shared/ui/card';

type Task = {
  icon: LucideIcon;
  title: string;
  text: string;
  cta: string;
  focus: LanguageFocus;
  params: Partial<PageParams>;
};

const TASKS: Task[] = [
  {
    icon: MessageCircleIcon,
    title: 'Explore a language',
    text: "Learn about a language's speakers, writing systems, digital support, and geographic distribution.",
    cta: 'Browse Languages',
    focus: LanguageFocus.AllLanguages,
    params: { entType: EntityType.Language },
  },
  {
    icon: MapPinIcon,
    title: 'Find Languages in a Region',
    text: 'Discover which languages are spoken, written, or used within a specific country or territory.',
    cta: 'Explore Regions',
    focus: LanguageFocus.SpokenLanguages,
    params: { entType: EntityType.Territory },
  },
  {
    icon: LaptopIcon,
    title: 'Assess Digital Support',
    text: 'Check whether a language is supported by keyboards, fonts, translation tools, speech technologies, and other digital resources.',
    cta: 'View Digital Support',
    focus: LanguageFocus.DigitizedLanguages,
    params: {
      entType: EntityType.Language,
      view: View.Map,
      limit: -1,
      colorBy: Field.DigitalSupport,
    },
  },
  {
    icon: PenLineIcon,
    title: 'Explore Writing Systems',
    text: 'Understand how languages are written and discover the scripts used around the world.',
    cta: 'Browse Writing Systems',
    focus: LanguageFocus.WrittenLanguages,
    params: { entType: EntityType.WritingSystem },
  },
  {
    icon: LanguagesIcon,
    title: 'Support Localization and Translation',
    text: 'Identify languages, scripts, and digital requirements needed to expand products and services into new markets.',
    cta: 'Find Supported Languages',
    focus: LanguageFocus.DigitizedLanguages,
    params: { entType: EntityType.Locale, view: View.Table },
  },
  {
    icon: UsersIcon,
    title: 'Understand Language Communities',
    text: 'Explore the linguistic diversity of a region and identify languages used by local communities.',
    cta: 'Explore Communities',
    focus: LanguageFocus.AllLanguoids,
    params: { entType: EntityType.Language, view: View.Hierarchy },
  },
];

function dataPageURL(focus: LanguageFocus, params: Partial<PageParams>): string {
  const query = getNewURLSearchParams({
    ...getParamsForLanguageFocus(focus),
    ...params,
  }).toString();
  return '/' + LangNavPageName.Data + (query ? '?' + query : '');
}

const IntroTaskCards: React.FC = () => {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {TASKS.map(({ icon: Icon, title, text, cta, focus, params }) => (
        <Card key={title} size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              {title}
            </CardTitle>
            <CardDescription>{text}</CardDescription>
          </CardHeader>
          <CardFooter className="mt-auto justify-end">
            <Link
              to={dataPageURL(focus, params)}
              data-slot="button"
              className={buttonVariants({ variant: 'outline' })}
            >
              {cta}
              <ArrowRightIcon />
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default IntroTaskCards;
