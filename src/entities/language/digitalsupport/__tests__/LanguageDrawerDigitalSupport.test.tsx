import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { getBaseLanguageData, LanguageData } from '@entities/language/LanguageTypes';
import { TechScope, TechSupportData } from '@entities/tech/TechnologyTypes';
import { CLDRCoverageData, CLDRCoverageLevel } from '@entities/types/CLDRTypes';
import { EntityType } from '@entities/types/EntityTypes';

import { getDigitalSupportDimensionLabel } from '@strings/DigitalSupportStrings';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import { computeDigitalSupportScores } from '../computeLanguageDigitalSupportScore';
import {
  DIGITAL_SUPPORT_CATEGORIES,
  getDigitalSupportStatus,
} from '../computeLanguageDigitalSupportStatus';
import { DigitalSupportDimension } from '../DigitalSupportTypes';
import LanguageDrawerDigitalSupport from '../LanguageDrawerDigitalSupport';

// The drawer field relies on page params for its copy action; the data context is only reached
// once a category is expanded, and these languages never expand a tech-backed category.
vi.mock('@features/params/usePageParams', () => ({ default: () => createMockUsePageParams() }));
vi.mock('@features/data/context/useDataContext', () => ({
  useDataContext: () => ({ getTechnology: () => undefined }),
}));

function getPlatformSupport(name: string): TechSupportData {
  return {
    languageCodePath: 'tst',
    name,
    techShortName: name,
    tech: {
      type: EntityType.Technology,
      ID: name,
      codeDisplay: name,
      nameDisplay: name,
      names: [name],
      scope: TechScope.OperatingSystem,
      organizationCode: 'Apple',
    },
  };
}

function getCoverage(actualCoverageLevel: CLDRCoverageLevel): CLDRCoverageData {
  return {
    countOfCLDRLocales: 1,
    targetCoverageLevel: actualCoverageLevel,
    actualCoverageLevel,
    inICU: true,
  };
}

/** A language with a deliberate mix of supported, partial and unsupported categories. */
function getMixedLanguage(): LanguageData {
  const lang = getBaseLanguageData('tst', 'Test');
  lang.techSupport = [getPlatformSupport('macOS')]; // Interfaces: partial (1 of 4)
  lang.CLDR.coverage = getCoverage(CLDRCoverageLevel.Basic); // I18n: partial
  lang.digitalSupportScore = computeDigitalSupportScores(lang);
  return lang;
}

describe('LanguageDrawerDigitalSupport', () => {
  it('shows the overall semantic status instead of a numeric score', () => {
    const lang = getMixedLanguage();
    render(<LanguageDrawerDigitalSupport lang={lang} />);

    const overall = getDigitalSupportStatus(lang, DigitalSupportDimension.Overall);
    expect(screen.getByText(overall.label)).toBeTruthy();
    // The old X/10 meter wording should be gone.
    expect(screen.queryByText(/\/10/)).toBeNull();
  });

  it('renders every category with the same semantic status as the main details view', async () => {
    const lang = getMixedLanguage();
    const user = userEvent.setup();
    render(<LanguageDrawerDigitalSupport lang={lang} />);

    await user.click(screen.getByText('Digital support'));

    for (const dimension of DIGITAL_SUPPORT_CATEGORIES) {
      const title = getDigitalSupportDimensionLabel(dimension);
      const expected = getDigitalSupportStatus(lang, dimension).label;
      const row = screen.getByRole('button', { name: new RegExp(title, 'i') });
      // The drawer must derive the status from the shared util, matching the main view exactly.
      expect(row).toHaveTextContent(expected);
    }
  });

  it('expands a category from the keyboard to reveal its supporting evidence', async () => {
    const lang = getMixedLanguage();
    const user = userEvent.setup();
    render(<LanguageDrawerDigitalSupport lang={lang} />);

    await user.click(screen.getByText('Digital support'));

    const keyboardsRow = screen.getByRole('button', { name: /keyboards/i });
    expect(keyboardsRow).toHaveAttribute('aria-expanded', 'false');

    keyboardsRow.focus();
    await user.keyboard('{Enter}');

    expect(keyboardsRow).toHaveAttribute('aria-expanded', 'true');
    const contentId = keyboardsRow.getAttribute('aria-controls') ?? '';
    const region = document.getElementById(contentId);
    expect(region).not.toBeNull();
    expect(
      within(region as HTMLElement).getByText(
        'No known keyboards are available on Keyman or GBoard',
      ),
    ).toBeTruthy();
  });
});
