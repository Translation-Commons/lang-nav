import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import IntroTaskCards from '../IntroTaskCards';

describe('IntroTaskCards', () => {
  it('links each task to the data page with the matching language focus preset', () => {
    render(
      <MemoryRouter>
        <IntroTaskCards />
      </MemoryRouter>,
    );

    const hrefs = screen
      .getAllByRole('link')
      .map((link) => [link.textContent, decodeURIComponent(link.getAttribute('href') ?? '')]);
    expect(hrefs).toEqual([
      ['Browse Languages', '/data'],
      [
        'Explore Regions',
        '/data?languageScopes=3&modalityFilter=2,1,0,3&populationFocus=speaking&entType=Territory',
      ],
      [
        'View Digital Support',
        '/data?languageSource=CLDR&populationFocus=writing&view=Map&limit=-1&colorBy=Digital+Support',
      ],
      [
        'Browse Writing Systems',
        '/data?languageSource=ISO&modalityFilter=-2,-1,0&populationFocus=writing&entType=Writing+System',
      ],
      [
        'Find Supported Languages',
        '/data?languageSource=CLDR&populationFocus=writing&entType=Locale&view=Table',
      ],
      ['Explore Communities', '/data?languageScopes=[]&view=Hierarchy'],
    ]);
  });
});
