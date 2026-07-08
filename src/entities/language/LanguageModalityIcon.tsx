import {
  HandIcon,
  MessageCircleDashedIcon,
  MessageCircleIcon,
  NotepadTextDashedIcon,
  NotepadTextIcon,
} from 'lucide-react';
import React from 'react';

import { getLanguageModalityDescription } from '@strings/LanguageModalityStrings';

import { LanguageModality } from './LanguageModality';

// Including a tooltip with the icon to explain the modality, can also be used for screen readers
const LanguageModalityIcon: React.FC<{ modality: LanguageModality | undefined }> = ({
  modality,
}) => {
  if (modality == null) return null;
  return (
    <span title={getLanguageModalityDescription(modality)}>
      <LanguageModalityBaseIcon modality={modality} />
    </span>
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
          <MessageCircleDashedIcon style={{ color: 'var(--color-text-secondary)' }} />
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
          <NotepadTextDashedIcon style={{ color: 'var(--color-text-secondary)' }} />
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
