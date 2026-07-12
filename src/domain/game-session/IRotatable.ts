/**
 * Ability to rotate 90 clockwise. Kept as a SEPARATE interface (ISP): terrain
 * cells must not be forced to implement rotation. Only ArrowChain rotates, because
 * rotating means re-aiming the train, not reshaping the floor beneath it — which is
 * why it lives with the GameSession aggregate, its single implementer.
 */
export interface IRotatable {
  rotate(): IRotatable;
}
