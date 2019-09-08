import { NodeDatum, LinkDatum } from 'data/Simulation';

export interface GraphProps
{
  nodes: NodeDatum[];
  links: LinkDatum[];
}

export interface GraphComponent extends React.FC<GraphProps>
{
  nodeRadius: number;
}
