export function GetRandomInt(minValue: number, maxValue: number): number {
   if (minValue > maxValue)
      throw new Error(`minValue > maxValue: ${minValue} > ${maxValue}`);
   let r = Math.floor(Math.random() * (maxValue - minValue)) + minValue;
   return r;
}