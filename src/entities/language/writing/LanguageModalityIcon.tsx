import {
  HandIcon,
  MessageCircleDashedIcon,
  MessageCircleIcon,
  NotepadTextDashedIcon,
  NotepadTextIcon,
} from 'lucide-react';
import React from 'react';

import { Button } from '@shared/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@shared/ui/hover-card';

import { getLanguageModalityDescription } from '@strings/LanguageModalityStrings';

import { LanguageModality } from './LanguageModality';

// Including a tooltip with the icon to explain the modality, can also be used for screen readers
const LanguageModalityIcon: React.FC<{ modality: LanguageModality | undefined }> = ({
  modality,
}) => {
  if (modality == null) return null;
  const description = getLanguageModalityDescription(modality);
  return (
    <HoverCard>
      <HoverCardTrigger
        delay={10}
        closeDelay={100}
        render={
          <Button aria-label={description} className="p-0" variant="ghost">
            <LanguageModalityBaseIcon modality={modality} />
          </Button>
        }
      />
      <HoverCardContent className="flex w-fit flex-col gap-0.5">{description}</HoverCardContent>
    </HoverCard>
  );
};

const LanguageModalityBaseIcon: React.FC<{ modality: LanguageModality }> = ({ modality }) => {
  switch (modality) {
    case LanguageModality.Written:
      return <NotepadTextIcon />;
    case LanguageModality.MostlyWritten:
      return (
        <>
          <NotepadTextIcon />
          <MessageCircleDashedIcon className="text-muted-foreground" />
        </>
      );
    case LanguageModality.SpokenAndWritten:
      return (
        <>
          <NotepadTextIcon />
          <MessageCircleIcon />
        </>
      );
    case LanguageModality.MostlySpoken:
      return (
        <>
          <NotepadTextDashedIcon className="text-muted-foreground" />
          <MessageCircleIcon />
        </>
      );
    case LanguageModality.Spoken:
      return <MessageCircleIcon />;
    case LanguageModality.Sign:
      // While HandMetalIcon would be more fun, we should be more serious here
      return <HandIcon />;
  }
};

export default LanguageModalityIcon;
