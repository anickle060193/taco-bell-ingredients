import { MutableRefObject } from 'react';
import { Simulation } from 'd3';

import { NodeDatum, LinkDatum } from 'data/Simulation';

export interface GraphProps
{
  simulationRef: MutableRefObject<Simulation<NodeDatum, LinkDatum>>;
  nodes: NodeDatum[];
  links: LinkDatum[];
}

export interface GraphComponent extends React.FC<GraphProps>
{
  nodeRadius: number;
}
