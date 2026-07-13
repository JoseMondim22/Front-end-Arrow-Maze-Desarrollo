import { ChainRawData } from './ChainRawData';
import { EdgeRawData } from './EdgeRawData';
import { NodeRawData } from './NodeRawData';

/** A level's board, as the backend sends it (part of LevelDTO). */
export interface BoardDTO {
  nodes: NodeRawData[];
  edges: EdgeRawData[];
  chains: ChainRawData[];
}
