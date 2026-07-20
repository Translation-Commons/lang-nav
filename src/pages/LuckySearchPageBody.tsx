import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useDataContext } from '@features/data/context/useDataContext';
import usePageParams from '@features/params/usePageParams';
import useFilteredEntities from '@features/transforms/filtering/useFilteredEntities';
import SearchBar from '@features/transforms/search/SearchBar';

import { cn } from '@shared/lib/utils';

const SearchContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return (
    <div className={cn('flex h-screen flex-col items-center justify-center', className)}>
      {children}
    </div>
  );
};

const LuckySearchPageBody: React.FC = () => {
  const navigate = useNavigate();
  const { searchString } = usePageParams();
  const { getLanguage, languagesInSelectedSource } = useDataContext();
  const { filteredEntities } = useFilteredEntities({});
  const [isSearching, setIsSearching] = useState(true);

  useEffect(() => {
    if (languagesInSelectedSource.length === 0) {
      setIsSearching(true);
      return;
    }

    const directMatch = getLanguage(searchString);
    if (directMatch) {
      // Navigate to data page with the exact object ID
      navigate(`/data?searchString=${encodeURIComponent(searchString)}&objectID=${directMatch.ID}`);
      return;
    }

    if (filteredEntities.length > 0) {
      // Navigate to data page with the first filtered result
      navigate(
        `/data?searchString=${encodeURIComponent(searchString)}&objectID=${filteredEntities[0].ID}`,
      );
      return;
    }

    setIsSearching(false);
  }, [searchString, getLanguage, languagesInSelectedSource, filteredEntities, navigate]);

  if (isSearching) {
    return (
      <SearchContainer>
        <div className="mb-4 text-[1.5em]">Searching...</div>
      </SearchContainer>
    );
  }

  // Display SearchBar and message if no results found
  return (
    <SearchContainer className="p-8">
      <div className="mb-4 text-[1.5em]">No results found</div>
      <div className="mb-4">
        Sorry, we couldn&apos;t find any languages matching &quot;{searchString}&quot;.
      </div>
      <div className="mb-4">Try searching again:</div>
      <SearchBar />
      <div className="mt-4">
        <a href="/intro">
          <button className="px-4 py-2">Back to Home</button>
        </a>
      </div>
    </SearchContainer>
  );
};

export default LuckySearchPageBody;
