import React from 'react';

import {
  CARD_COLUMNS,
  CARD_WIDTH,
  CardHeading,
  getCardHeadingOffset,
  ListRow,
  ListRowProps,
  PreviewCard,
  PreviewSvg,
  SkeletonIcon,
  SkeletonLine,
} from './PreviewPrimitives';

type LanguageCard = [
  name: string[],
  code: string,
  endonym?: string,
  scope?: string,
  population?: string,
  digitalSupport?: number,
  countries?: ListRowProps,
];

const IL = 'Individual Language';
const MACRO = 'Macrolanguage';

const LANGUAGES: LanguageCard[] = [
  [
    ['English'],
    'eng',
    'English',
    IL,
    '1,363,431,935',
    1,
    { lines: ['United States, India,', 'Pakistan, Philippines,'], more: '+160 more' },
  ],
  [
    ['Chinese', 'languages'],
    'zho',
    '中文',
    MACRO,
    '1,321,250,579',
    1,
    { lines: ['China, Taiwan,', 'Hong Kong, Malaysia,'], more: '+29 more' },
  ],
  [
    ['Mandarin', 'Chinese'],
    'cmn',
    '普通话',
    IL,
    '1,161,035,923',
    1,
    { lines: ['China, Taiwan,', 'Singapore, Canada,'], more: '+9 more' },
  ],
  [
    ['Hindi'],
    'hin',
    'हिन्दी',
    IL,
    '811,271,173',
    1,
    { lines: ['India, South Africa,', 'United States, Canada'], more: '+9 more' },
  ],
  [
    ['Spanish'],
    'spa',
    'español',
    IL,
    '547,349,636',
    1,
    { lines: ['Mexico, Colombia,', 'Spain, Argentina,'], more: '+54 more' },
  ],
  [
    ['Arabic'],
    'ara',
    'العربية',
    MACRO,
    '431,592,145',
    1,
    { lines: ['Egypt, Sudan, Algeria,', 'Morocco,'], more: '+53 more', inlineMore: true },
  ],
  [
    ['Malayic'],
    'msa',
    'Melayu',
    MACRO,
    '302,144,190',
    1,
    { lines: ['Indonesia, Malaysia,', 'Singapore, Brunei,'], more: '+9 more' },
  ],
  [
    ['Bengali'],
    'ben',
    'বাংলা',
    IL,
    '278,544,943',
    0.94,
    { lines: ['Bangladesh, India,', 'Pakistan,', 'United States,'], more: '+6 more' },
  ],
  [
    ['Indonesian'],
    'ind',
    'bahasa Indonesia',
    IL,
    '275,337,936',
    1,
    { lines: ['Indonesia,', 'Netherlands,', 'Singapore, Australia,'], more: '+4 more' },
  ],
  [
    ['French'],
    'fra',
    'français',
    IL,
    '270,037,243',
    1,
    { lines: ['France,', 'Congo - Kinshasa,', 'Cameroon, Germany,'], more: '+116 more' },
  ],
  [['Portuguese'], 'por'],
  [['Punjabi'], 'pan'],
  [['Russian'], 'rus'],
  [['Urdu'], 'urd'],
  [['German'], 'deu'],
];

const ROWS = [
  { top: 16, height: 236 },
  { top: 277, height: 229 },
  { top: 538, height: 236 },
];

const LanguageCardPreview: React.FC<{ card: LanguageCard; index: number }> = ({ card, index }) => {
  const [name, code, endonym, scope, population, digitalSupport = 0, countries] = card;
  const left = CARD_COLUMNS[index % 5];
  const { top, height } = ROWS[Math.floor(index / 5)];
  const x = left + 18;
  const y = top + getCardHeadingOffset({ name, code });
  return (
    <>
      <PreviewCard x={left} y={top} width={CARD_WIDTH} height={height} />
      <CardHeading x={left + 17} y={top + 36} name={name} code={code} />
      {endonym && scope && population && countries && (
        <>
          <SkeletonLine x={left + 17} y={y + 52} text={endonym} />
          <SkeletonIcon x={x} y={y + 78} />
          <SkeletonLine x={x + 17} y={y + 78} text={scope} />
          <SkeletonIcon x={x} y={y + 100} />
          <SkeletonLine x={x + 17} y={y + 100} text={population} />
          <SkeletonIcon x={x} y={y + 122} />
          <rect x={x + 17} y={y + 120} width={96} height={5} rx={2.5} className="fill-muted" />
          <rect
            x={x + 17}
            y={y + 120}
            width={96 * digitalSupport}
            height={5}
            rx={2.5}
            className="fill-green"
          />
          <ListRow x={x} y={y + 144} {...countries} />
        </>
      )}
    </>
  );
};

const LanguagesPreview: React.FC<{ className?: string }> = ({ className }) => (
  <PreviewSvg
    width={1024}
    height={576}
    label="Grid of language cards for English, Chinese, Hindi, Spanish and more"
    className={className}
  >
    {LANGUAGES.map((card, i) => (
      <LanguageCardPreview key={card[1]} card={card} index={i} />
    ))}
  </PreviewSvg>
);

export default LanguagesPreview;
