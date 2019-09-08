export function distinct( values: string[] ): string[];
export function distinct( values: number[] ): number[];
export function distinct<T extends object>( values: T[], getKey: ( value: T ) => string ): T[];
export function distinct<T extends object>( values: T[], getKey?: ( value: T ) => string ): T[]
{
  let distinctValues: T[] = [];
  let keys = new Set<string>();

  for( let value of values )
  {
    let key = getKey ? getKey( value ) : value.toString();
    if( !keys.has( key ) )
    {
      distinctValues.push( value );
      keys.add( key );
    }
  }

  return distinctValues;
}
