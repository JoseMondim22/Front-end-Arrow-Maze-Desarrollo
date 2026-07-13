import { ArrowChain } from '@domain/game-session/ArrowChain';
import { ChainId } from '@domain/shared/value-objects/ChainId';
import { Direction } from '@domain/shared/value-objects/Direction';
import { GridDirection } from '@domain/shared/value-objects/GridDirection';
import { NodeId } from '@domain/shared/value-objects/NodeId';

/** Object Mother for ArrowChain (internal entity of GameSession). */
export class ArrowChainMother {
  static singleNode(direction: Direction = GridDirection.Right): ArrowChain {
    return ArrowChain.create(ChainId.of('c1'), [NodeId.of('n0')], direction);
  }

  static straightPair(direction: Direction = GridDirection.Right): ArrowChain {
    return ArrowChain.create(
      ChainId.of('c1'),
      [NodeId.of('n0'), NodeId.of('n1')],
      direction,
    );
  }

  static uShaped(): ArrowChain {
    return ArrowChain.create(
      ChainId.of('c1'),
      [NodeId.of('a'), NodeId.of('b'), NodeId.of('c'), NodeId.of('d')],
      GridDirection.Up,
    );
  }

  static facing(direction: Direction): ArrowChain {
    return ArrowChainMother.singleNode(direction);
  }
}
