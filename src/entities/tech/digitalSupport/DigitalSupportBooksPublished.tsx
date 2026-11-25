import type { LanguageData } from '@entities/language/LanguageTypes';

import Deemphasized from '@shared/ui/Deemphasized';

export function BooksPublishedExplanation({ ent }: { ent: LanguageData }) {
  const booksPublished = ent.booksEst;
  if (booksPublished == null) return <Deemphasized>No data, potentially 0</Deemphasized>;
  const { perMillion, rawScore, score } = computeBooksPublishedScores(
    ent.booksEst,
    ent.pop.overall,
  );
  return (
    <dl>
      {ent.books == null && <Deemphasized>Estimated from descendants</Deemphasized>}
      <dt>Books published annually:</dt>
      <dd className="ml-4">
        {booksPublished.toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </dd>
      <dt>Books per million speakers:</dt>
      <dd className="ml-4">{perMillion.toLocaleString(undefined, { maximumFractionDigits: 1 })}</dd>

      <dt>Raw Score (square root of books per million)):</dt>
      <dd className="ml-4">{rawScore.toLocaleString(undefined, { maximumFractionDigits: 2 })}</dd>

      <dt>Score (Bounded to between 0 and 10):</dt>
      <dd className="ml-4">{score.toLocaleString(undefined, { maximumFractionDigits: 1 })}</dd>
    </dl>
  );
}

export function computeBooksPublishedScores(books?: number, pop?: number) {
  if (!books || !pop) return { perMillion: 0, rawScore: 0, score: 0 };
  if (!pop) return { perMillion: books, rawScore: 0, score: 0 };
  const perMillion = books / (pop / 1_000_000);
  // const rawScore = Math.log(perMillion) / Math.log(3);
  const rawScore = perMillion ** 0.5;
  const score = Math.min(Math.max(rawScore, 0), 10);
  return { perMillion, rawScore, score };
}
