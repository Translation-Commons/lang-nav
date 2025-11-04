export enum PositionInGroup {
  Standalone = 'standalone', // its not visualized with the group
  First = 'first',
  Middle = 'middle',
  Last = 'last',
  Only = 'only', // first & last
}

// 0 indexed
export function getPositionInGroup(index: number, length: number): PositionInGroup {
  if (length === 1) return PositionInGroup.Only;
  if (index === 0) return PositionInGroup.First;
  if (index === length - 1) return PositionInGroup.Last;
  return PositionInGroup.Middle;
}
