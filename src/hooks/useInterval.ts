import { useRef, useEffect } from 'react';

export function useInterval( callback: () => void, delay: number | null )
{
  const callbackRef = useRef<typeof callback>();

  useEffect( () =>
  {
    callbackRef.current = callback;
  }, [ callback ] );

  useEffect( () =>
  {
    const onTick = () => callbackRef.current && callbackRef.current();

    if( typeof delay !== 'number' )
    {
      return;
    }

    const interval = window.setInterval( onTick, delay );
    return () => window.clearInterval( interval );
  }, [ delay ] );
}
