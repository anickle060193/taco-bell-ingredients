import { GraphComponent } from 'components/graphs/CommonGraph';
import CanvasGraph from 'components/graphs/CanvasGraph';
import HtmlGraph from 'components/graphs/HtmlGraph';

const USE_CANVAS = false;

const Graph: GraphComponent = USE_CANVAS ? CanvasGraph : HtmlGraph;

export default Graph;
