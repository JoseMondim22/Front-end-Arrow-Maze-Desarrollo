import { Board } from '@domain/game-session/Board';
import { BoardBuilder } from '@domain/level/BoardBuilder';
import { BoardDefinition } from '@domain/level/value-objects/BoardDefinition';
import { ChainDefinition } from '@domain/level/value-objects/ChainDefinition';
import { CellNode } from '@domain/shared/board/CellNode';
import { CellType } from '@domain/shared/board/cells/CellType';
import { EmptyCell } from '@domain/shared/board/cells/EmptyCell';
import { ExitCell } from '@domain/shared/board/cells/ExitCell';
import { GridArrowCell } from '@domain/shared/board/cells/GridArrowCell';
import { WallCell } from '@domain/shared/board/cells/WallCell';
import { Edge } from '@domain/shared/board/Edge';
import { ChainId } from '@domain/shared/value-objects/ChainId';
import { Direction } from '@domain/shared/value-objects/Direction';
import { GridDirection } from '@domain/shared/value-objects/GridDirection';
import { GridDirection3D } from '@domain/shared/value-objects/GridDirection3D';
import { GridPosition } from '@domain/shared/value-objects/GridPosition';
import { GridPosition3D } from '@domain/shared/value-objects/GridPosition3D';
import { NodeId } from '@domain/shared/value-objects/NodeId';

/**
 * Object Mother for the runtime Board (internal entity of GameSession). Builds boards
 * the realistic way — through BoardDefinition + BoardBuilder — so the same adjacency
 * derivation the game uses is exercised. Each valid topology exposes a *Definition()
 * (for BoardBuilder/Level tests) and a built board; invalid definitions are meant to
 * be fed to new BoardBuilder(def).build() inside a toThrow assertion.
 */
export class BoardMother {
  // --- private construction helpers -----------------------------------------

  private static node(
    id: string,
    row: number,
    column: number,
    cell: CellType,
  ): CellNode {
    return new CellNode(NodeId.of(id), GridPosition.of(row, column), cell);
  }

  private static node3d(
    id: string,
    row: number,
    column: number,
    layer: number,
    cell: CellType,
  ): CellNode {
    return new CellNode(NodeId.of(id), GridPosition3D.of(row, column, layer), cell);
  }

  private static edge(from: string, to: string): Edge {
    return new Edge(NodeId.of(from), NodeId.of(to));
  }

  private static arrow(direction: Direction): GridArrowCell {
    return new GridArrowCell(direction);
  }

  private static chainDef(id: string, ...nodeIds: string[]): ChainDefinition {
    return ChainDefinition.of(
      ChainId.of(id),
      nodeIds.map((nodeId) => NodeId.of(nodeId)),
    );
  }

  private static build(definition: BoardDefinition): Board {
    return new BoardBuilder(definition).build();
  }

  // --- valid topologies -----------------------------------------------------

  /** Two-node train [n0, n1] whose head sits next to an exit and slides out. */
  static straightPathToExitDefinition(): BoardDefinition {
    return BoardDefinition.of({
      nodes: [
        BoardMother.node('n0', 0, 0, new EmptyCell()),
        BoardMother.node('n1', 0, 1, BoardMother.arrow(GridDirection.Right)),
        BoardMother.node('exit', 0, 2, new ExitCell()),
      ],
      edges: [BoardMother.edge('n0', 'n1'), BoardMother.edge('n1', 'exit')],
      chains: [BoardMother.chainDef('c1', 'n0', 'n1')],
    });
  }

  static straightPathToExit(): Board {
    return BoardMother.build(BoardMother.straightPathToExitDefinition());
  }

  /** Single-node head that slides across an empty gap before reaching the exit. */
  static slidesThroughGapToExitDefinition(): BoardDefinition {
    return BoardDefinition.of({
      nodes: [
        BoardMother.node('n0', 0, 0, BoardMother.arrow(GridDirection.Right)),
        BoardMother.node('gap', 0, 1, new EmptyCell()),
        BoardMother.node('exit', 0, 2, new ExitCell()),
      ],
      edges: [BoardMother.edge('n0', 'gap'), BoardMother.edge('gap', 'exit')],
      chains: [BoardMother.chainDef('c1', 'n0')],
    });
  }

  static slidesThroughGapToExit(): Board {
    return BoardMother.build(BoardMother.slidesThroughGapToExitDefinition());
  }

  /** Single-node chain one step from the exit: sliding wins the level. */
  static headOneStepFromExitDefinition(): BoardDefinition {
    return BoardDefinition.of({
      nodes: [
        BoardMother.node('n0', 0, 0, BoardMother.arrow(GridDirection.Right)),
        BoardMother.node('exit', 0, 1, new ExitCell()),
      ],
      edges: [BoardMother.edge('n0', 'exit')],
      chains: [BoardMother.chainDef('c1', 'n0')],
    });
  }

  static headOneStepFromExit(): Board {
    return BoardMother.build(BoardMother.headOneStepFromExitDefinition());
  }

  /** Head aimed straight into a wall; an exit exists elsewhere (so no deadlock). */
  static headFacingWallDefinition(): BoardDefinition {
    return BoardDefinition.of({
      nodes: [
        BoardMother.node('n0', 0, 0, BoardMother.arrow(GridDirection.Right)),
        BoardMother.node('wall', 0, 1, new WallCell()),
        BoardMother.node('exit', 1, 0, new ExitCell()),
      ],
      edges: [BoardMother.edge('n0', 'wall'), BoardMother.edge('n0', 'exit')],
      chains: [BoardMother.chainDef('c1', 'n0')],
    });
  }

  static headFacingWall(): Board {
    return BoardMother.build(BoardMother.headFacingWallDefinition());
  }

  /**
   * Folded (U-shaped) chain [a, b, c, d]: a-d are grid-adjacent (the cycle), so the
   * order cannot be derived from edges — it comes from the explicit chain order.
   */
  static uShapedChainDefinition(): BoardDefinition {
    return BoardDefinition.of({
      nodes: [
        BoardMother.node('a', 0, 0, new EmptyCell()),
        BoardMother.node('b', 1, 0, new EmptyCell()),
        BoardMother.node('c', 1, 1, new EmptyCell()),
        BoardMother.node('d', 0, 1, BoardMother.arrow(GridDirection.Up)),
        BoardMother.node('exit', 0, 2, new ExitCell()),
      ],
      edges: [
        BoardMother.edge('a', 'b'),
        BoardMother.edge('b', 'c'),
        BoardMother.edge('c', 'd'),
        BoardMother.edge('a', 'd'),
        BoardMother.edge('d', 'exit'),
      ],
      chains: [BoardMother.chainDef('c1', 'a', 'b', 'c', 'd')],
    });
  }

  static uShapedChainFacingWall(): Board {
    return BoardMother.build(BoardMother.uShapedChainDefinition());
  }

  /** Two chains in a row: A's head faces B, so A reverts; B could still exit. */
  static twoChainsCollidingDefinition(): BoardDefinition {
    return BoardDefinition.of({
      nodes: [
        BoardMother.node('a0', 0, 0, BoardMother.arrow(GridDirection.Right)),
        BoardMother.node('b0', 0, 1, BoardMother.arrow(GridDirection.Right)),
        BoardMother.node('exit', 0, 2, new ExitCell()),
      ],
      edges: [BoardMother.edge('a0', 'b0'), BoardMother.edge('b0', 'exit')],
      chains: [
        BoardMother.chainDef('A', 'a0'),
        BoardMother.chainDef('B', 'b0'),
      ],
    });
  }

  static twoChainsColliding(): Board {
    return BoardMother.build(BoardMother.twoChainsCollidingDefinition());
  }

  /** A single chain walled in on all four sides: no legal move -> deadlock. */
  static boxedInDeadlockDefinition(): BoardDefinition {
    return BoardDefinition.of({
      nodes: [
        BoardMother.node('n0', 1, 1, BoardMother.arrow(GridDirection.Right)),
        BoardMother.node('up', 0, 1, new WallCell()),
        BoardMother.node('down', 2, 1, new WallCell()),
        BoardMother.node('left', 1, 0, new WallCell()),
        BoardMother.node('right', 1, 2, new WallCell()),
        BoardMother.node('exit', 3, 3, new ExitCell()),
      ],
      edges: [
        BoardMother.edge('n0', 'up'),
        BoardMother.edge('n0', 'down'),
        BoardMother.edge('n0', 'left'),
        BoardMother.edge('n0', 'right'),
      ],
      chains: [BoardMother.chainDef('c1', 'n0')],
    });
  }

  static boxedInDeadlock(): Board {
    return BoardMother.build(BoardMother.boxedInDeadlockDefinition());
  }

  // --- invalid definitions (feed to BoardBuilder inside toThrow) -------------

  /** An edge whose endpoints are two grid steps apart. */
  static edgeConnectsNonAdjacentNodesDefinition(): BoardDefinition {
    return BoardDefinition.of({
      nodes: [
        BoardMother.node('n0', 0, 0, BoardMother.arrow(GridDirection.Right)),
        BoardMother.node('far', 0, 2, new EmptyCell()),
        BoardMother.node('exit', 1, 0, new ExitCell()),
      ],
      edges: [BoardMother.edge('n0', 'far')],
      chains: [BoardMother.chainDef('c1', 'n0')],
    });
  }

  /** Chain [n0, n1] whose consecutive nodes have no connecting edge. */
  static chainNodesNotAdjacentDefinition(): BoardDefinition {
    return BoardDefinition.of({
      nodes: [
        BoardMother.node('n0', 0, 0, new EmptyCell()),
        BoardMother.node('n1', 0, 1, BoardMother.arrow(GridDirection.Right)),
        BoardMother.node('exit', 0, 2, new ExitCell()),
      ],
      edges: [BoardMother.edge('n1', 'exit')],
      chains: [BoardMother.chainDef('c1', 'n0', 'n1')],
    });
  }

  /** Chain whose head node is plain empty floor, not a grid_arrow. */
  static chainHeadNotArrowDefinition(): BoardDefinition {
    return BoardDefinition.of({
      nodes: [
        BoardMother.node('n0', 0, 0, new EmptyCell()),
        BoardMother.node('n1', 0, 1, new EmptyCell()),
        BoardMother.node('exit', 0, 2, new ExitCell()),
      ],
      edges: [BoardMother.edge('n0', 'n1'), BoardMother.edge('n1', 'exit')],
      chains: [BoardMother.chainDef('c1', 'n0', 'n1')],
    });
  }

  // --- 3D topologies (GridPosition3D / GridDirection3D) ----------------------

  /** Two-node train [n0, n1] on a single layer whose head sits next to an exit
   * (column +1 -> forward per the 3D axis mapping) and slides out. */
  static threeDeeStraightPathToExitDefinition(): BoardDefinition {
    return BoardDefinition.of({
      nodes: [
        BoardMother.node3d('n0', 0, 0, 0, new EmptyCell()),
        BoardMother.node3d('n1', 0, 1, 0, BoardMother.arrow(GridDirection3D.Forward)),
        BoardMother.node3d('exit', 0, 2, 0, new ExitCell()),
      ],
      edges: [BoardMother.edge('n0', 'n1'), BoardMother.edge('n1', 'exit')],
      chains: [BoardMother.chainDef('c1', 'n0', 'n1')],
    });
  }

  static threeDeeStraightPathToExit(): Board {
    return BoardMother.build(BoardMother.threeDeeStraightPathToExitDefinition());
  }

  /** Single-node chain (no body, so no neck to skip while rotating) — isolated
   * from the required exit, used to observe the raw 6-heading rotation cycle. */
  static threeDeeLoneArrowDefinition(): BoardDefinition {
    return BoardDefinition.of({
      nodes: [
        BoardMother.node3d('n0', 0, 0, 0, BoardMother.arrow(GridDirection3D.Forward)),
        BoardMother.node3d('exit', 5, 5, 5, new ExitCell()),
      ],
      edges: [],
      chains: [BoardMother.chainDef('c1', 'n0')],
    });
  }

  static threeDeeLoneArrow(): Board {
    return BoardMother.build(BoardMother.threeDeeLoneArrowDefinition());
  }

  /** A single chain walled in on all six 3D headings: no legal move -> deadlock. */
  static threeDeeBoxedInDeadlockDefinition(): BoardDefinition {
    return BoardDefinition.of({
      nodes: [
        BoardMother.node3d('n0', 1, 1, 1, BoardMother.arrow(GridDirection3D.Forward)),
        BoardMother.node3d('layerUp', 1, 1, 0, new WallCell()),
        BoardMother.node3d('layerDown', 1, 1, 2, new WallCell()),
        BoardMother.node3d('rowLeft', 0, 1, 1, new WallCell()),
        BoardMother.node3d('rowRight', 2, 1, 1, new WallCell()),
        BoardMother.node3d('columnBackward', 1, 0, 1, new WallCell()),
        BoardMother.node3d('columnForward', 1, 2, 1, new WallCell()),
        BoardMother.node3d('exit', 3, 3, 3, new ExitCell()),
      ],
      edges: [
        BoardMother.edge('n0', 'layerUp'),
        BoardMother.edge('n0', 'layerDown'),
        BoardMother.edge('n0', 'rowLeft'),
        BoardMother.edge('n0', 'rowRight'),
        BoardMother.edge('n0', 'columnBackward'),
        BoardMother.edge('n0', 'columnForward'),
      ],
      chains: [BoardMother.chainDef('c1', 'n0')],
    });
  }

  static threeDeeBoxedInDeadlock(): Board {
    return BoardMother.build(BoardMother.threeDeeBoxedInDeadlockDefinition());
  }

  /** An edge whose 3D endpoints are two steps apart along the column axis. */
  static threeDeeEdgeConnectsNonAdjacentNodesDefinition(): BoardDefinition {
    return BoardDefinition.of({
      nodes: [
        BoardMother.node3d('n0', 0, 0, 0, BoardMother.arrow(GridDirection3D.Forward)),
        BoardMother.node3d('far', 0, 2, 0, new EmptyCell()),
        BoardMother.node3d('exit', 1, 0, 0, new ExitCell()),
      ],
      edges: [BoardMother.edge('n0', 'far')],
      chains: [BoardMother.chainDef('c1', 'n0')],
    });
  }
}
