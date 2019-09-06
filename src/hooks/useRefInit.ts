import { useRef } from 'react';

const UNINITIALIZED = Symbol.for( 'UNINITIALIZED' );

export default function useRefInit<T>( init: () => T )
{
  const ref = useRef<T | typeof UNINITIALIZED>( UNINITIALIZED );
  if( ref.current === UNINITIALIZED )
  {
    ref.current = init();
  }
  return ref as React.MutableRefObject<T>;
}
