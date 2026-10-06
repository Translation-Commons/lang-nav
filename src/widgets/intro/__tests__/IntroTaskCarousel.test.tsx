import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import IntroTaskCarousel from '../IntroTaskCarousel';

function renderCarousel() {
  render(
    <MemoryRouter>
      <IntroTaskCarousel />
    </MemoryRouter>,
  );
}

describe('IntroTaskCarousel', () => {
  it('links each task to the data page with the matching language focus preset', () => {
    renderCarousel();

    const hrefs = screen
      .getAllByRole('link', { hidden: true })
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

  it('renders a preview image on every slide', () => {
    renderCarousel();

    const slides = screen.getAllByRole('group', { hidden: true });
    expect(slides).toHaveLength(6);
    slides.forEach((slide) => expect(slide.querySelector('img')).toHaveAttribute('src'));
  });

  it('keeps only the current slide reachable by keyboard', () => {
    renderCarousel();

    const slides = screen.getAllByRole('group', { hidden: true });
    expect(slides.map((slide) => slide.hasAttribute('inert'))).toEqual([
      false,
      true,
      true,
      true,
      true,
      true,
    ]);
  });

  it('moves the current dot when Next or a dot is clicked', async () => {
    renderCarousel();
    const currentDot = () =>
      screen.getAllByRole('button', { name: /^Show / }).find((dot) => dot.ariaCurrent === 'true');

    expect(currentDot()).toHaveAccessibleName('Show Explore a language');

    await userEvent.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(currentDot()).toHaveAccessibleName('Show Find Languages in a Region');

    await userEvent.click(screen.getByRole('button', { name: 'Show Explore Writing Systems' }));
    expect(currentDot()).toHaveAccessibleName('Show Explore Writing Systems');
  });
});
