import Hoverable from '@shared/ui/Hoverable';
import React from 'react';

const CreativeCommonsLicense: React.FC = () => {
  return (
    <Hoverable
      hoverContent={
        <span>
          This work is licensed under a{' '}
          <a href="https://creativecommons.org/licenses/by-sa/4.0/">
            Creative Commons Attribution-ShareAlike 4.0 International License
          </a>
          .
        </span>
      }
    >
      <a href="https://creativecommons.org/licenses/by-sa/4.0/">
        <img
          alt="Creative Commons License"
          src="https://i.creativecommons.org/l/by-sa/4.0/88x31.png"
        />
      </a>
    </Hoverable>
  );
};

export default CreativeCommonsLicense;
