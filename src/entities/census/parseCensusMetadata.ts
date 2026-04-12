import { ObjectType } from '@features/params/PageParamTypes';

import {
  CensusCollectorType,
  CensusData,
  CensusLanguageUse,
  CensusQuantity,
} from '@entities/census/CensusTypes';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';

import { CensusMetadataField } from './CensusMetadataField';

export type CensusMetadataResults = {
  // Metadata about the data collection
  censuses: CensusData[];

  // Warnings about potential issues with the data
  warnings: string[];

  // The line number where the metadata ends and the main data begins, used for error reporting
  endOfMetadataLine: number;

  // The column numbers (0-indexed) which contain census data (as opposed to metadata or context columns)
  tsvColumnsWithData: number[];
};

export function parseCensusMetadata(lines: string[], filePath: string): CensusMetadataResults {
  const warnings: string[] = [];
  const filename = filePath.match(/\/([^/]+)\.tsv$/)?.[1] || 'census';

  function addWarning(message: string, lineNumber?: number): void {
    warnings.push(
      message +
        (filePath ? ` in ${filePath}` : '') +
        (lineNumber != null ? ` (line ${lineNumber + 1})` : ''),
    );
  }

  // Create an array based on the number of census columns
  // (number of censusNames, which is columns after the first two)
  // This will be used to initialize metadatas and other arrays
  const tsvColumnsWithData = getColumnIndicesWithData(lines);
  if (tsvColumnsWithData.length <= 0) {
    addWarning('No census data columns found. Check that the file has the correct format.');
  }

  const censuses: CensusData[] = tsvColumnsWithData.map((_tsvColumnNumber, index) => ({
    type: ObjectType.Census,
    ID: filePath + '.' + (index + 1), // stable unique ID based on the full file path and column number
    codeDisplay: filename + '.' + (index + 1), // May be overridden later

    // This will be set later -- its just initialized here because they are strictly required
    nameDisplay: '',
    names: [],
    isoRegionCode: '',
    languageCount: 0,
    yearCollected: 0,
    population: 0,
    languageEstimates: {},
    collectorType: CensusCollectorType.Government,
    url: '',
  }));

  // Iterate through the rest of the lines to collect metadata until we hit the break line
  let lineNumber = 0;
  for (lineNumber = 0; lineNumber < lines.length; lineNumber++) {
    const line = lines[lineNumber];

    if (line.startsWith('##')) {
      // This is a line to break up the metadata into sections, it can be ignored for parsing purposes
      continue;
    }

    if (!line.startsWith('#')) {
      // If the line does not start with a '#', it is part of the main data section
      // so end this loop and start processing the main data section
      break;
    }

    // If the line starts with a '#', it's metadata about the census
    const parts = line.split('\t').map((part) => part.trim());
    // const key = parts[0].slice(1) as keyof CensusData;
    const keyRaw = parts[0].slice(1); // Remove the leading '#' and use as key
    if (!(Object.values(CensusMetadataField) as string[]).includes(keyRaw)) {
      addWarning(`Unrecognized metadata field: ${keyRaw}`, lineNumber);
      continue;
    }
    const key = keyRaw as CensusMetadataField;
    const defaultValue = parts[1] || ''; // Default value is the second column, or empty if not provided
    const values = tsvColumnsWithData.map((col) => parts[col]); // Get the values from importable columns (ones without # prefix)

    if (values.length !== censuses.length) {
      addWarning(
        `Census field ${key} has ${values.length + 1} columns but expected ${censuses.length + 1}.`,
        lineNumber,
      );
    }
    values.forEach((maybeValue, index) => {
      const value = maybeValue != '' ? maybeValue : defaultValue;
      if (value == null) {
        addWarning(`Row ended early at column ${tsvColumnsWithData[index] + 1}`, lineNumber);
        return;
      }
      parseValueByKey(censuses[index], key, value, (message) => addWarning(message, lineNumber));
    });
  }

  // Set other fields required for objects and report an error if an important one is missing
  censuses.forEach((census) => {
    // Collect names for the census
    census.names = [census.nameDisplay, census.documentName, census.tableName].filter(
      (n) => n != null,
    );
    if (census.isoRegionCode === '') addWarning('isoRegionCode is not specified');
    if (census.yearCollected === 0) addWarning('yearCollected is not specified');
    if (census.population === 0) addWarning('population is not specified');
    if (census.nameDisplay === '') addWarning('nameDisplay is not specified');
    if (census.url === '') addWarning('url is not specified');
  });

  return {
    censuses,
    warnings,
    endOfMetadataLine: lineNumber,
    tsvColumnsWithData,
  };
}

function getColumnIndicesWithData(lines: string[]): number[] {
  return lines[0]
    .split('\t')
    .slice(2) // Skip the first 2 columns since they are the metadata field names & the default values
    .map((col, tsvColumnNumber) => {
      // Drop columns which have a "#" in the codeDisplay -- that means they are provided for context
      // but LangNav doesn't have a good way to show it.
      if (col[0] === '#') return null;
      return tsvColumnNumber + 2; // +2 to account for the skipped columns
    })
    .filter((col) => col !== null);
}

function parseValueByKey(
  census: CensusData,
  key: CensusMetadataField,
  value: string,
  addWarning: (message: string) => void,
): void {
  if (value == '') return; // Skip empty values it may be okay since some of the fields are optional

  switch (key) {
    // Dates
    case CensusMetadataField.datePublished:
    case CensusMetadataField.dateAccessed:
      census[key] = new Date(value);
      break;

    // Numbers
    case CensusMetadataField.population:
    case CensusMetadataField.populationWithPositiveResponses:
    case CensusMetadataField.populationSurveyed:
    case CensusMetadataField.yearCollected:
      census[key] = Number.parseInt(value.replace(/,/g, ''));
      break;
    case CensusMetadataField.sampleRate:
      census[key] = Number.parseFloat(value) || value;
      break;

    // Enums
    case CensusMetadataField.collectorType:
      // If its not a valid collector type, add a warning
      if (!Object.values(CensusCollectorType).some((v) => v === value))
        addWarning(`Invalid collectorType: ${value}`);
      census[key] = value as CensusCollectorType;
      break;
    case CensusMetadataField.languageUse:
      // If its not a valid language use, add a warning
      if (!Object.values(CensusLanguageUse).some((v) => v === value))
        addWarning(`Invalid language use: ${value}`);
      census[key] = value as CensusLanguageUse;
      break;
    case CensusMetadataField.quantity:
      if (!Object.values(CensusQuantity).some((v) => v === value.toLowerCase()))
        addWarning(`Invalid quantity: ${value}`);
      census[key] = value.toLowerCase() as CensusQuantity;
      break;

    // These are string fields that don't require special parsing
    case CensusMetadataField.codeDisplay:
    case CensusMetadataField.nameDisplay:
    case CensusMetadataField.isoRegionCode:
    case CensusMetadataField.proficiency:
    case CensusMetadataField.age:
    case CensusMetadataField.gender:
    case CensusMetadataField.domain:
    case CensusMetadataField.acquisitionOrder:
    case CensusMetadataField.populationSource:
    case CensusMetadataField.responsesPerIndividual:
    case CensusMetadataField.languagesIncluded:
    case CensusMetadataField.geographicScope:
    case CensusMetadataField.nationality:
    case CensusMetadataField.residenceBasis:
    case CensusMetadataField.notes:
    case CensusMetadataField.collectorName:
    case CensusMetadataField.collectorNameShort:
    case CensusMetadataField.author:
    case CensusMetadataField.presentedBy:
    case CensusMetadataField.url:
    case CensusMetadataField.documentName:
    case CensusMetadataField.tableName:
    case CensusMetadataField.columnName:
    case CensusMetadataField.citation:
      // Strings without structured format or validation
      census[key] = value.trim();
      break;
    default:
      enforceExhaustiveSwitch(key);
  }
}
