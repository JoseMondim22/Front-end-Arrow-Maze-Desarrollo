import { BoardDefinition } from '@domain/level/value-objects/BoardDefinition';
import { ChainDefinition } from '@domain/level/value-objects/ChainDefinition';
import { CellNode } from '@domain/shared/board/CellNode';
import { CellType } from '@domain/shared/board/cells/CellType';
import { EmptyCell } from '@domain/shared/board/cells/EmptyCell';
import { ExitCell } from '@domain/shared/board/cells/ExitCell';
import { GridArrowCell } from '@domain/shared/board/cells/GridArrowCell';
import { Edge } from '@domain/shared/board/Edge';
import { DomainError } from '@domain/shared/errors/DomainError';
import { ChainId } from '@domain/shared/value-objects/ChainId';
import { GridDirection } from '@domain/shared/value-objects/GridDirection';
import { GridPosition } from '@domain/shared/value-objects/GridPosition';
import { NodeId } from '@domain/shared/value-objects/NodeId';

const node = (id: string, row: number, column: number, cell: CellType): CellNode =>
  new CellNode(NodeId.of(id), GridPosition.of(row, column), cell);
const exitNode = (): CellNode => node('exit', 0, 0, new ExitCell());
const arrowNode = (): CellNode =>
  node('n0', 0, 1, new GridArrowCell(GridDirection.Right));
const chainOnN0 = (): ChainDefinition =>
  ChainDefinition.of(ChainId.of('c1'), [NodeId.of('n0')]);

describe('BoardDefinition', () => {
  it('should_build_when_valid', () => {
    const definition = BoardDefinition.of({
      nodes: [exitNode(), arrowNode()],
      edges: [new Edge(NodeId.of('n0'), NodeId.of('exit'))],
      chains: [chainOnN0()],
    });

    expect(definition.nodes).toHaveLength(2);
    expect(definition.chains).toHaveLength(1);
  });

  it('should_fail_when_no_nodes', () => {
    expect(() =>
      BoardDefinition.of({ nodes: [], edges: [], chains: [chainOnN0()] }),
    ).toThrow(DomainError);
  });

  it('should_fail_when_no_chains', () => {
    expect(() =>
      BoardDefinition.of({ nodes: [exitNode()], edges: [], chains: [] }),
    ).toThrow(DomainError);
  });

  it('should_fail_when_no_exit_cell', () => {
    expect(() =>
      BoardDefinition.of({
        nodes: [arrowNode()],
        edges: [],
        chains: [chainOnN0()],
      }),
    ).toThrow(DomainError);
  });

  it('should_fail_when_node_id_is_duplicated', () => {
    expect(() =>
      BoardDefinition.of({
        nodes: [exitNode(), node('exit', 0, 1, new EmptyCell())],
        edges: [],
        chains: [ChainDefinition.of(ChainId.of('c1'), [NodeId.of('exit')])],
      }),
    ).toThrow(DomainError);
  });

  it('should_fail_when_edge_references_unknown_node', () => {
    expect(() =>
      BoardDefinition.of({
        nodes: [exitNode(), arrowNode()],
        edges: [new Edge(NodeId.of('n0'), NodeId.of('ghost'))],
        chains: [chainOnN0()],
      }),
    ).toThrow(DomainError);
  });

  it('should_fail_when_chain_references_unknown_node', () => {
    expect(() =>
      BoardDefinition.of({
        nodes: [exitNode()],
        edges: [],
        chains: [ChainDefinition.of(ChainId.of('c1'), [NodeId.of('ghost')])],
      }),
    ).toThrow(DomainError);
  });
});
