import { CellFactory } from '../../domain/level/CellFactory';
import { Level } from '../../domain/level/Level';
import { PositionFactory } from '../../domain/level/PositionFactory';
import { BoardDefinition } from '../../domain/level/value-objects/BoardDefinition';
import { ChainDefinition } from '../../domain/level/value-objects/ChainDefinition';
import { CellNode } from '../../domain/shared/board/CellNode';
import { Edge } from '../../domain/shared/board/Edge';
import { ChainId } from '../../domain/shared/value-objects/ChainId';
import { LevelId } from '../../domain/shared/value-objects/LevelId';
import { LevelOrder } from '../../domain/shared/value-objects/LevelOrder';
import { LevelRules } from '../../domain/shared/value-objects/LevelRules';
import { NodeId } from '../../domain/shared/value-objects/NodeId';
import { LevelDTO } from '../dtos/output/LevelDTO';

/**
 * DTO -> domain for a level (GET /levels). Builds only the static BoardDefinition
 * via CellFactory — it does NOT invoke BoardBuilder, which builds the runtime Board
 * and only runs later, inside Level.startSession(). `difficulty` is not mapped: the
 * domain has no such concept, it is purely a display concern for the UI layer.
 */
export class LevelMapper {
  static toDomain(dto: LevelDTO): Level {
    const nodes = dto.board.nodes.map(
      (node) =>
        new CellNode(
          NodeId.of(node.id),
          PositionFactory.create({
            positionType: node.positionType,
            row: node.row,
            column: node.column,
            layer: node.layer,
          }),
          CellFactory.create({
            type: node.type,
            direction: node.direction,
            positionType: node.positionType,
          }),
        ),
    );

    const edges = dto.board.edges.map(
      (edge) => new Edge(NodeId.of(edge.from), NodeId.of(edge.to)),
    );

    const chains = dto.board.chains.map((chain) =>
      ChainDefinition.of(
        ChainId.of(chain.id),
        chain.nodeIds.map((nodeId) => NodeId.of(nodeId)),
      ),
    );

    const board = BoardDefinition.of({ nodes, edges, chains });

    const rules = LevelRules.of({
      timeLimitSeconds: dto.timeLimit,
      maxMoves: dto.maxMoves,
      maxPossibleScore: dto.maxPossibleScore,
    });

    return Level.reconstitute(
      LevelId.of(dto.id),
      board,
      rules,
      LevelOrder.of(dto.order),
    );
  }
}
