import {
  HandIcon,
  MessageCircleDashedIcon,
  MessageCircleIcon,
  NotepadTextDashedIcon,
  NotepadTextIcon,
} from 'lucide-react';
import React from 'react';

import { LanguageModality } from './LanguageModality';

function getModalityLabel(modality: LanguageModality | undefined): string | undefined {
  if (modality == null) return undefined;
  switch (modality) {
    case LanguageModality.Written:
      return 'Written';
    case LanguageModality.MostlyWritten:
      return 'Mostly Written';
    case LanguageModality.SpokenAndWritten:
      return 'Spoken & Written';
    case LanguageModality.MostlySpoken:
      return 'Mostly Spoken';
    case LanguageModality.Spoken:
      return 'Spoken';
    case LanguageModality.Sign:
      return 'Sign';
  }
}

export function getModalityFromLabel(label: string | undefined): LanguageModality | undefined {
  if (label == null || label === '') return undefined;
  switch (label.trim()) {
    case 'Written':
      return LanguageModality.Written;
    case 'Mostly Written':
      return LanguageModality.MostlyWritten;
    case 'Spoken & Written':
    case 'Spoken and Written':
      return LanguageModality.SpokenAndWritten;
    case 'Mostly Spoken':
      return LanguageModality.MostlySpoken;
    case 'Spoken':
      return LanguageModality.Spoken;
    case 'Sign':
      return LanguageModality.Sign;
  }
  return undefined;
}

function getLanguageModalityDescription(modality: LanguageModality): string {
  switch (modality) {
    case LanguageModality.Written:
      return 'This language exists in a written form in modern times.';
    case LanguageModality.MostlyWritten:
      return 'This language is mostly written, but also has a spoken form.';
    case LanguageModality.SpokenAndWritten:
      return 'This language is actively spoken and written.';
    case LanguageModality.MostlySpoken:
      return 'This language is mostly spoken, but is sometimes used for writing.';
    case LanguageModality.Spoken:
      return 'This language is primarily spoken, it is rarely used in writing.';
    case LanguageModality.Sign:
      return 'This language is a sign language.';
  }
}

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

export { getModalityLabel, LanguageModalityIcon };
