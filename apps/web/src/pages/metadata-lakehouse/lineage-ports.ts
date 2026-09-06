export const LINEAGE_NODE_HEIGHT = 76

export function portOffsets(_count: number): number[] {
  return [LINEAGE_NODE_HEIGHT / 2]
}

export function portOffsetFor(_count: number, _index: number): number {
  return LINEAGE_NODE_HEIGHT / 2
}