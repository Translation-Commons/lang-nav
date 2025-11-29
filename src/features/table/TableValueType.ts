/**
 * Used by ObjectTable to change
 * Cell alignment (numeric cells are right-aligned)
 * Sorting icon style (01, AZ, or wide/narrow bars)
 */
enum TableValueType {
  Population = 'population', // large count, will round <10 to >=0
  Count = 'count', // eg. number of languages
  Decimal = 'decimal', // eg. percent
  Date = 'date',
  String = 'string',
  Enum = 'enum',
}

export default TableValueType;
