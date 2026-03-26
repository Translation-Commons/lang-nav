import React from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';

import ExternalLink from '@shared/ui/ExternalLink';

const CreativeCommonsLicense: React.FC = () => {
  return (
    <Hoverable
      hoverContent={
        <span>
          This work is licensed under a{' '}
          <ExternalLink href="https://creativecommons.org/licenses/by-sa/4.0/">
            Creative Commons Attribution-ShareAlike 4.0 International License
          </ExternalLink>
          .
        </span>
      }
    >
      <a
        href="https://creativecommons.org/licenses/by-sa/4.0/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          alt="Creative Commons License"
          src="https://i.creativecommons.org/l/by-sa/4.0/88x31.png"
        />
      </a>
    </Hoverable>
  );
};

export default CreativeCommonsLicense;
