import React, { useState } from 'react';

import IdentityRow from '@widgets/details/ui/IdentityRow';

import Deemphasized from '@shared/ui/Deemphasized';

type ResolvedWikipediaPage = {
  title: string;
  url: string;
};

const wikipediaRedirectCache = new Map<string, ResolvedWikipediaPage | null>();

const LanguageWikipediaIdentityRow: React.FC<{
  isoCode?: string;
}> = ({ isoCode }) => {
  const resolvedPage = useWikipediaRedirectTitle(isoCode);
  return (
    <IdentityRow
      sourceLabel="Wikipedia"
      name={getWikipediaIdentityName(resolvedPage, isoCode)}
      link={resolvedPage?.url ?? `https://en.wikipedia.org/wiki/ISO_639:${isoCode}`}
    />
  );
};

export default LanguageWikipediaIdentityRow;

function useWikipediaRedirectTitle(isoCode?: string): ResolvedWikipediaPage | null | undefined {
  const code = typeof isoCode === 'string' ? isoCode : undefined;
  const [resolvedPage, setResolvedPage] = useState<ResolvedWikipediaPage | null | undefined>(
    code ? wikipediaRedirectCache.get(code) : undefined,
  );

  React.useEffect(() => {
    if (!code) {
      setResolvedPage(undefined);
      return;
    }

    const cached = wikipediaRedirectCache.get(code);
    if (cached !== undefined) {
      setResolvedPage(cached);
      return;
    }

    let cancelled = false;
    setResolvedPage(undefined);

    resolveWikipediaRedirect(code)
      .then((page) => {
        wikipediaRedirectCache.set(code, page);
        if (!cancelled) setResolvedPage(page);
      })
      .catch(() => {
        wikipediaRedirectCache.set(code, null);
        if (!cancelled) setResolvedPage(null);
      });

    return () => {
      cancelled = true;
    };
  }, [code]);

  return resolvedPage;
}

async function resolveWikipediaRedirect(isoCode: string): Promise<ResolvedWikipediaPage | null> {
  const pageTitle = `ISO_639:${isoCode}`;
  const apiURL = new URL('https://en.wikipedia.org/w/api.php');
  apiURL.searchParams.set('action', 'query');
  apiURL.searchParams.set('titles', pageTitle);
  apiURL.searchParams.set('redirects', '1');
  apiURL.searchParams.set('format', 'json');
  apiURL.searchParams.set('origin', '*');

  const response = await fetch(apiURL.toString());
  if (!response.ok) throw new Error(`Failed to resolve Wikipedia redirect for ${isoCode}`);

  const data = (await response.json()) as {
    query?: {
      pages?: Record<string, { missing?: boolean; title?: string }>;
    };
  };

  const pages = data.query?.pages ? Object.values(data.query.pages) : [];
  const resolvedPage = pages.find((page) => page.title && !page.missing);
  if (!resolvedPage?.title) return null;

  return {
    title: resolvedPage.title,
    url: `https://en.wikipedia.org/wiki/${encodeURIComponent(resolvedPage.title).replace(/%20/g, '_')}`,
  };
}

function getWikipediaIdentityName(
  resolvedPage: ResolvedWikipediaPage | null | undefined,
  isoCode?: string,
): React.ReactNode {
  if (resolvedPage?.title) return resolvedPage.title;
  if (resolvedPage === null && isoCode) {
    return <Deemphasized>No redirect target found for ISO_639:{isoCode}</Deemphasized>;
  }
  return <Deemphasized>Resolving redirect title…</Deemphasized>;
}
