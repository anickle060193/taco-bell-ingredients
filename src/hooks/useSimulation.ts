import { useEffect, useState } from 'react';
import uuid from 'uuid/v4';

import useRefInit from 'hooks/useRefInit';

export default function useSimulation<N extends d3.SimulationNodeDatum, L extends d3.SimulationLinkDatum<N>>( initSim: () => d3.Simulation<N, L> )
{
  const simulationRef = useRefInit( initSim );
  const [ , setTick ] = useState( 0 );

  useEffect( () =>
  {
    const tickEvent = `tick.${uuid()}`;
    const sim = simulationRef.current;

    function onTick()
    {
      setTick( ( oldTick ) => oldTick + 1 );
    }

    sim.on( tickEvent, onTick );

    sim.restart();

    return () =>
    {
      sim.on( tickEvent, null );

      sim.stop();
    };
  }, [ simulationRef ] );

  return simulationRef;
}
