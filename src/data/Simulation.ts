import * as d3 from 'd3';

import { Recipe, Ingredient } from 'data/Recipes';

interface BaseNodeDatum<T extends string, D> extends d3.SimulationNodeDatum
{
  id: string;
  name: string;
  type: T;
  data: D;
}

export type NodeDatum = (
  BaseNodeDatum<'recipe', Recipe> |
  BaseNodeDatum<'ingredient', Ingredient>
);

export interface LinkDatum extends d3.SimulationLinkDatum<NodeDatum>
{
  id: string;
}
