import { SimulationNodeDatum, SimulationLinkDatum } from 'd3-force';

import { Recipe, Ingredient } from 'data/Recipes';

interface BaseUninitializedNodeDatum<T extends string, D> extends SimulationNodeDatum
{
  id: string;
  name: string;
  type: T;
  data: D;
}

export type UninitializedNodeDatum = (
  BaseUninitializedNodeDatum<'recipe', Recipe> |
  BaseUninitializedNodeDatum<'ingredient', Ingredient>
);

export type NodeDatum = Required<UninitializedNodeDatum>;

export interface UninitializedLinkDatum extends SimulationLinkDatum<UninitializedNodeDatum>
{
  id: string;
}

export interface LinkDatum extends UninitializedLinkDatum
{
  source: NodeDatum;
  target: NodeDatum;
}

export function isNodeInitialized( node: UninitializedNodeDatum ): node is NodeDatum
{
  return (
    typeof node.x === 'number' &&
    typeof node.y === 'number'
  );
}

export function isLinkInitialized( link: UninitializedLinkDatum ): link is LinkDatum
{
  return (
    typeof link.source === 'object' &&
    typeof link.target === 'object' &&
    isNodeInitialized( link.source ) &&
    isNodeInitialized( link.target )
  );
}
