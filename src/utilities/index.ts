export function distinct<T>( values: T[], getKey: ( value: T ) => string )
{
  let distinctValues: T[] = [];
  let keys = new Set<string>();

  for( let value of values )
  {
    let key = getKey( value );
    if( !keys.has( key ) )
    {
      distinctValues.push( value );
      keys.add( key );
    }
  }

  return distinctValues;
}
