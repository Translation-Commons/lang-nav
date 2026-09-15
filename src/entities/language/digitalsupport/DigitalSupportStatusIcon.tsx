import { CheckCircle2Icon, CircleHelpIcon, TriangleAlertIcon, XCircleIcon } from 'lucide-react';
import React from 'react';

import { getDigitalSupportStatusLabel } from '@strings/DigitalSupportStrings';

import { DigitalSupportStatus } from './DigitalSupportTypes';

type Props = {
  status: DigitalSupportStatus;
};

/**
 * The icon shape and its label both carry the status so it is never communicated by color alone.
 */
const DigitalSupportStatusIcon: React.FC<Props> = ({ status }) => {
  const Icon = getIcon(status);
  return (
    <Icon
      aria-label={getDigitalSupportStatusLabel(status)}
      size="1em"
      style={{ color: getDigitalSupportStatusColor(status) }}
    />
  );
};

function getIcon(status: DigitalSupportStatus) {
  switch (status) {
    case DigitalSupportStatus.Supported:
      return CheckCircle2Icon;
    case DigitalSupportStatus.Partial:
      return TriangleAlertIcon;
    case DigitalSupportStatus.NotSupported:
      return XCircleIcon;
    case DigitalSupportStatus.Unknown:
      return CircleHelpIcon;
  }
}

export function getDigitalSupportStatusColor(status: DigitalSupportStatus): string {
  switch (status) {
    case DigitalSupportStatus.Supported:
      return 'var(--color-green)';
    case DigitalSupportStatus.Partial:
      return 'var(--color-yellow)';
    case DigitalSupportStatus.NotSupported:
      return 'var(--color-red)';
    case DigitalSupportStatus.Unknown:
      return 'var(--color-text-secondary)';
  }
}

export default DigitalSupportStatusIcon;
