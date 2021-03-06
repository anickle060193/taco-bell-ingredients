import color from 'color';

const GOLDEN_RATIO_GONJUGATE = 0.618033988749895;

export default function createColorSet()
{
  const colors: { [ value: string ]: string } = {};
  let h: number = 0.91018206932939563879;

  return ( value: string, s: number = 100, v: number = 100 ) =>
  {
    const key = `${value}_${s}_${v}`;
    if( !( key in colors ) )
    {
      h += GOLDEN_RATIO_GONJUGATE;
      h %= 1;
      colors[ key ] = color.hsv( h * 360, s, v ).hex();
    }
    return colors[ key ];
  };
}
