/**
 * Used by ObjectTable to change
 * Cell alignment (numeric cells are right-aligned)
 * Sorting icon style (01, AZ, or wide/narrow bars)
 */
enum TableValueType {
  Numeric = 'numeric',
  String = 'string',
  Enum = 'enum',
}

export default TableValueType;
