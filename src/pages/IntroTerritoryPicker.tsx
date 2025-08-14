import React, { useEffect, useState } from 'react';

import { getOptionStyle, OptionsDisplay } from '../controls/components/Selector';
import { SelectorDropdown } from '../controls/components/SelectorDropdown';
import { getNewURL } from '../controls/PageParamsContext';
import { getPositionInGroup, PositionInGroup } from '../generic/PositionInGroup';
import { ObjectType, View } from '../types/PageParamTypes';

export type Suggestion = {
  objectID?: string;
  searchString: string;
  label: React.ReactNode;
};

type Props = {
  getSuggestions?: (query: string) => Promise<Suggestion[]>;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
};

const TextInput: React.FC<Props> = ({
  getSuggestions = () => [],
  onChange,
  placeholder,
  value,
}) => {
  // Handle suggestions
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  useEffect(() => {
    let active = true;
    (async () => {
      const result = await getSuggestions(value);
      if (active) setSuggestions(result.slice(0, 10));
    })();
    return () => {
      active = false;
    };
  }, [getSuggestions, value]);

  return (
    <>
      {showSuggestions && suggestions.length > 0 && (
        <SelectorDropdown>
          {suggestions.map((s, i) => (
            <SuggestionRow
              key={i}
              position={getPositionInGroup(i, suggestions.length)}
              setImmediateValue={onChange}
              suggestion={s}
            />
          ))}
        </SelectorDropdown>
      )}
      <input
        type="text"
        className={value === '' ? 'empty' : ''}
        value={value}
        onChange={(ev) => {
          onChange(ev.target.value);
          setShowSuggestions(true);
        }}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 500)}
        onFocus={() => setShowSuggestions(true)}
        placeholder={placeholder}
        style={{
          borderRadius: '0.5em',
          padding: '0.5em',
          lineHeight: '1.5em',
          width: '5em',
        }}
      />
    </>
  );
};

type SuggestionRowProps = {
  position?: PositionInGroup;
  setImmediateValue: (value: string) => void;
  suggestion: Suggestion;
};

const SuggestionRow: React.FC<SuggestionRowProps> = ({
  position = PositionInGroup.Standalone,
  setImmediateValue,
  suggestion,
}) => {
  const { searchString, label } = suggestion;

  const style = getOptionStyle(
    OptionsDisplay.Dropdown,
    false, // isSelected is always false here
    position,
  );

  return (
    <button onClick={() => setImmediateValue(searchString)} style={style}>
      {label}
    </button>
  );
};

const IntroTerritoryPicker: React.FC = () => {
  const [territoryName, setTerritoryName] = useState('');

  return (
    <div style={{ display: 'inline-block' }}>
      <TextInput
        placeholder="Enter country name"
        value={territoryName}
        onChange={(value) => setTerritoryName(value)}
        getSuggestions={async (query) => {
          // Simulate fetching suggestions
          const suggestions: Suggestion[] = [
            { searchString: 'United States', label: 'United States' },
            { searchString: 'Mexico', label: 'Mexico' },
            { searchString: 'France', label: 'France' },
            { searchString: 'Russia', label: 'Russia' },
            { searchString: 'Egypt', label: 'Egypt' },
            { searchString: 'India', label: 'India' },
            { searchString: 'China', label: 'China' },
            { searchString: 'Australia', label: 'Australia' },
          ];
          return suggestions.filter((s) =>
            s.searchString.toLowerCase().includes(query.toLowerCase()),
          );
        }}
      />
      <a
        href={`data${getNewURL({ territoryFilter: territoryName, view: View.Table, objectType: ObjectType.Locale })}`}
      >
        <button>GO</button>
      </a>
    </div>
  );
};

export default IntroTerritoryPicker;
