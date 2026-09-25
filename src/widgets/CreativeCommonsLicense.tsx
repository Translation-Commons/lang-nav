import React from 'react';

import ExternalLink from '@shared/ui/ExternalLink';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@shared/ui/hover-card';

const CreativeCommonsLicense: React.FC = () => {
  return (
    <HoverCard>
      <HoverCardTrigger
        render={
          <a
            className="h-fit"
            href="https://creativecommons.org/licenses/by-sa/4.0/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              alt="Creative Commons License"
              src="https://i.creativecommons.org/l/by-sa/4.0/88x31.png"
            />
          </a>
        }
      />
      <HoverCardContent className="w-fit max-w-[400px]">
        <span>
          This work is licensed under a{' '}
          <ExternalLink href="https://creativecommons.org/licenses/by-sa/4.0/">
            Creative Commons Attribution-ShareAlike 4.0 International License
          </ExternalLink>
          .
        </span>
      </HoverCardContent>
    </HoverCard>
  );
};

export default CreativeCommonsLicense;
