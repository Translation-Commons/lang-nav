import {
  WikipediaData,
  WikipediaStatus,
} from '@entities/language/digitalsupport/DigitalSupportTypes';
import type { LanguageData } from '@entities/language/LanguageTypes';

import Deemphasized from '@shared/ui/Deemphasized';
import ExternalLink from '@shared/ui/ExternalLink';

export function computeWikipediaScore(lang: LanguageData): number {
  const { wikipedias } = lang;
  if (!wikipedias || wikipedias.length === 0) return 0;
  const bestWiki = getBestWikipedia(wikipedias);
  if (bestWiki?.status === WikipediaStatus.Active) {
    const articlesPerMillion = bestWiki.articles / ((lang.pop.overall ?? 1) / 100_000);
    return Math.min(Math.max(Math.sqrt(articlesPerMillion) * 10, 25), 100);
  }
  if (bestWiki?.status === WikipediaStatus.Incubator) return 25; // incubator
  return 10; // deleted (WikipediaStatus.Closed)
}

function getBestWikipedia(wikipedias?: WikipediaData[]): WikipediaData | undefined {
  return wikipedias
    ?.sort((a, b) => b.articles - a.articles)
    .sort((a, b) => getWikipediaStatusRank(b.status) - getWikipediaStatusRank(a.status))?.[0];
}

function getWikipediaStatusRank(status: WikipediaStatus): number {
  switch (status) {
    case WikipediaStatus.Active:
      return 100;
    case WikipediaStatus.Incubator:
      return 25;
    case WikipediaStatus.Closed:
      return 10;
    default:
      return 0;
  }
}

export function DigitalSupportWikipediaExplanation({ ent }: { ent: LanguageData }) {
  const wiki = getBestWikipedia(ent.wikipedias);
  if (!wiki) return <Deemphasized>No Wikipedia presence (score = 0)</Deemphasized>;
  const articlesPerMillion = wiki.articles / ((ent.pop.overall ?? 1) / 100_000);

  return (
    <dl>
      <dt>Status</dt>
      <dd className="ml-4">
        {wiki.status === WikipediaStatus.Active
          ? 'Active'
          : wiki.status === WikipediaStatus.Incubator
            ? 'Incubator'
            : 'Closed'}
      </dd>
      <dt>Articles</dt>
      <dd className="ml-4">
        {wiki.articles.toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </dd>
      {wiki.status === WikipediaStatus.Active ? (
        <>
          <dt>Articles per 100 thousand speakers</dt>
          <dd className="ml-4">
            {articlesPerMillion.toLocaleString(undefined, {
              maximumFractionDigits: 1,
            })}
          </dd>
          <dt>Raw score (square root of articles per 100k)</dt>
          <dd className="ml-4">
            {Math.sqrt(articlesPerMillion).toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </dd>
          <dt>Score (*10 and bounded to between 25 (25 = min for active wikipedias) and 100)</dt>
          <dd className="ml-4">
            {Math.min(Math.max(Math.sqrt(articlesPerMillion) * 10, 25), 100).toFixed(0)}
          </dd>
        </>
      ) : (
        <>
          <dt>Score by status</dt>
          <dd className="ml-4">
            {wiki.status === WikipediaStatus.Incubator ? '25 (Incubator)' : '10 (Closed)'}
          </dd>
        </>
      )}
      {wiki.url && (
        <>
          <dt>Wikipedia URL</dt>
          <dd className="ml-4">
            <ExternalLink href={wiki.url} />
          </dd>
        </>
      )}
    </dl>
  );
}
