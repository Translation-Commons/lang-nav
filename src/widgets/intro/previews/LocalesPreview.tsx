import React from 'react';

import {
  CARD_COLUMNS,
  CARD_WIDTH,
  CardHeading,
  LINE_HEIGHT,
  ListRow,
  PreviewCard,
  PreviewSvg,
  SkeletonIcon,
  SkeletonLine,
} from './PreviewPrimitives';

type LocaleCard = [
  name: string[],
  code: string,
  population?: string,
  percent?: string,
  status?: string[],
  origin?: string[],
];

const OFFICIAL = ['Official'];
const REGIONAL = ['Official in a Region'];
const FORMED_HERE = ['Formed here, Historic'];

const LOCALES: LocaleCard[] = [
  [['Hindi (India)'], 'hin_IN', '807,201,578', '57.1% of country', OFFICIAL, FORMED_HERE],
  [
    ['English (India)'],
    'eng_IN',
    '150,032,320',
    '10.6% of country',
    OFFICIAL,
    ['From abroad, after', '1500 CE'],
  ],
  [['Bengali (India)'], 'ben_IN', '125,442,851', '8.88% of country', REGIONAL, FORMED_HERE],
  [['Marathi (India)'], 'mar_IN', '115,622,566', '8.18% of country', REGIONAL, FORMED_HERE],
  [['Telugu (India)'], 'tel_IN', '110,303,369', '7.80% of country', REGIONAL, FORMED_HERE],
  [['Tamil (India)'], 'tam_IN', '89,403,585', '6.33% of country', REGIONAL, FORMED_HERE],
  [['Urdu (India)'], 'urd_IN', '73,813,815', '5.22% of country', REGIONAL, FORMED_HERE],
  [['Gujarati (India)'], 'guj_IN', '70,370,382', '4.98% of country', REGIONAL, FORMED_HERE],
  [['Kannada (India)'], 'kan_IN', '68,574,615', '4.85% of country', REGIONAL, FORMED_HERE],
  [
    ['Bhojpuri (India)'],
    'bho_IN',
    '59,036,918',
    '4.18% of country',
    ['Recognized in a', 'Region'],
    FORMED_HERE,
  ],
  [['Punjabi (India)'], 'pan_IN'],
  [['Malayalam', '(India)'], 'mal_IN'],
  [['Oriya (India)'], 'ory_IN'],
  [['Assamese', '(India)'], 'asm_IN'],
  [['Chhattisgarhi', '(India)'], 'hne_IN'],
];

const ROW_TOPS = [16, 259, 502];

const LocaleCardPreview: React.FC<{ card: LocaleCard; index: number }> = ({ card, index }) => {
  const [name, code, population, percent, status, origin] = card;
  const left = CARD_COLUMNS[index % 5];
  const top = ROW_TOPS[Math.floor(index / 5)];
  const x = left + 18;
  return (
    <>
      <PreviewCard x={left} y={top} width={CARD_WIDTH} height={218} />
      <CardHeading
        x={left + 17}
        y={top + 36}
        name={name}
        code={code}
        codeBelow={name.length === 1}
      />
      {population && percent && status && origin && (
        <>
          <SkeletonIcon x={x} y={top + 82} />
          <SkeletonLine x={x + 17} y={top + 82} text={population} />
          <SkeletonIcon x={x} y={top + 104} />
          <SkeletonLine x={x + 17} y={top + 104} text="CensusIndia 2011" />
          <SkeletonIcon x={x} y={top + 126} />
          <SkeletonLine x={x + 17} y={top + 126} text={percent} />
          <ListRow x={x} y={top + 148} lines={status} />
          <ListRow x={x} y={top + 154 + status.length * LINE_HEIGHT} lines={origin} />
        </>
      )}
    </>
  );
};

const LocalesPreview: React.FC<{ className?: string }> = ({ className }) => (
  <PreviewSvg
    width={1024}
    height={576}
    label="Grid of locale cards for the languages of India, led by Hindi"
    className={className}
  >
    {LOCALES.map((card, i) => (
      <LocaleCardPreview key={card[1]} card={card} index={i} />
    ))}
  </PreviewSvg>
);

export default LocalesPreview;
