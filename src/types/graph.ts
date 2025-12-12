import type { NodeData } from "@antv/g6"

export interface GraphNodeData extends NodeData {}

export interface SearchResult {
  id: string
  source: string
  target: string
  relation: string
  description: string
}
