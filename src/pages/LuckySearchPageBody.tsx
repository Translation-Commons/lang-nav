import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useDataContext } from '@features/data/context/useDataContext';
import usePageParams from '@features/params/usePageParams';
import useFilteredObjects from '@features/transforms/filtering/useFilteredObjects';
import SearchBar from '@features/transforms/search/SearchBar';

const SearchContainer: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
  children,
  style,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const LuckySearchPageBody: React.FC = () => {
  const navigate = useNavigate();
  const { searchString } = usePageParams();
  const { getLanguage, languagesInSelectedSource } = useDataContext();
  const { filteredObjects } = useFilteredObjects({});
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

    if (filteredObjects.length > 0) {
      // Navigate to data page with the first filtered result
      navigate(
        `/data?searchString=${encodeURIComponent(searchString)}&objectID=${filteredObjects[0].ID}`,
      );
      return;
    }

    setIsSearching(false);
  }, [searchString, getLanguage, languagesInSelectedSource, filteredObjects, navigate]);

  if (isSearching) {
    return (
      <SearchContainer>
        <div style={{ fontSize: '1.5em', marginBottom: '1em' }}>Searching...</div>
      </SearchContainer>
    );
  }

  // Display SearchBar and message if no results found
  return (
    <SearchContainer style={{ padding: '2em' }}>
      <div style={{ fontSize: '1.5em', marginBottom: '1em' }}>No results found</div>
      <div style={{ marginBottom: '1em' }}>
        Sorry, we couldn&apos;t find any languages matching &quot;{searchString}&quot;.
      </div>
      <div style={{ marginBottom: '1em' }}>Try searching again:</div>
      <SearchBar />
      <div style={{ marginTop: '1em' }}>
        <a href="/intro">
          <button style={{ padding: '0.5em 1em' }}>Back to Home</button>
        </a>
      </div>
    </SearchContainer>
  );
};

export default LuckySearchPageBody;
