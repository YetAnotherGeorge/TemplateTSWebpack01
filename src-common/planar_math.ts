// WARNING: THIS FILE WILL BE SHARED BY BOTH NODE.JS SERVER AND FRONTEND

//#region BACKEND_FRONTEND_COMMON_LIBS
import * as HashUtils from "./hash_utils";

//#endregion
export interface IPrimitiveValues_vec2 {
   x: number;
   y: number;
}
export class vec2 implements HashUtils.IStaticHash {
   public readonly x: number;
   public readonly y: number;

   public constructor(x: number, y: number) {
      this.x = x;
      this.y = y;
   }

   public apply(f: (comp: number) => number): vec2;
   public apply(fx: (x: number) => number, fy: (y: number) => number): vec2;
   public apply(fx: (x: number) => number, fy: ((y: number) => number) | null = null): vec2 {
      if (fy == null) 
         fy = fx;
      return new vec2(fx(this.x), fy(this.y));
   }

   public asTuple(): [number, number] {
      return [this.x, this.y];
   }

   public divide(by: number) {
      return new vec2(this.x / by, this.y / by);
   }

   public multiply(by: number) {
      return new vec2(this.x * by, this.y * by);
   }

   public subtract(amm: number): vec2;
   public subtract(vec2: vec2): vec2;
   public subtract(sub: number | vec2): vec2 {
      if (typeof (sub) === "object") {
         return new vec2(this.x - sub.x, this.y - sub.y);
      } else {
         return new vec2(this.x - sub, this.y - sub);
      }
   }

   public add(amm: number): vec2;
   public add(vec2: vec2): vec2;
   public add(amm: number | vec2): vec2 {
      if (typeof (amm) === "object") {
         let v = amm as vec2;
         return new vec2(this.x + v.x, this.y + v.y);
      } else {
         let v = amm as number;
         return new vec2(this.x + v, this.y + v);
      }
   }

   public magnitude(): number {
      return Math.sqrt(this.x * this.x + this.y * this.y);
   }

   public normalize(): vec2 {
      let m: number = this.magnitude();
      return new vec2(this.x / m, this.y / m);
   }
   /**
    * 
    * @param angle in radians
    * @param amm
    * @returns
    */
   public moveByVector(angle: number, amm: number): vec2 {
      return new vec2(this.x + Math.cos(angle) * amm, this.y + Math.sin(angle) * amm);
   }

   public getCirclePoints(pointCount: number, radius: number) {
      let inc = (2 * Math.PI) / pointCount;
      let arr: vec2[] = [];

      for (let a = 0; a < (2 * Math.PI); a += inc) {
         let p = new vec2(this.x + Math.cos(a) * radius, this.y + Math.sin(a) * radius);
         arr.push(p);
      }
      return arr;
   }

   public toString(precision: number = 3): string {
      return `VEC2: [${this.x.toFixed(precision)}, ${this.y.toFixed(precision)}]`;
   }

   public GetHash(): number {
      let hash: number = 0;
      if (this.x != 0)
         hash += Math.max(Math.abs(Math.sin(1.0 / this.x)), this.x) | 0;
      if (this.y != 0)
         hash += Math.max(Math.abs(Math.sin(1.0 / this.y)), this.y) | 0;
      return hash | 0;
   }

   public ToPrimitiveValues(): IPrimitiveValues_vec2 {
      let pv: IPrimitiveValues_vec2 = {
         x: this.x,
         y: this.y
      };
      return pv;
   }

   public static FromPrimitiveValues(v: IPrimitiveValues_vec2): vec2 {
      return new vec2(v.x, v.y);
   }

   public static Equals(lhs: vec2, rhs: vec2) {
      if (lhs.x === rhs.x && lhs.y === rhs.y)
         return true;
      return false;
   }

   public static fromTuple(arr: [x: number, y: number]): vec2 {
      return new vec2(arr[0], arr[1]);
   }
 
   public static GenerateGrid(start: vec2, count: vec2, increment: vec2, onEach: (p: vec2) => void) {
      for (let yn = 0; yn < count.y; yn++) {
         let yc = start.y + yn * increment.y;

         for (let xn = 0; xn < count.x; xn++) {
            let xc = start.x + xn * increment.x;

            onEach(new vec2(xc, yc));
         }
      }
   }

   public static distance(a: vec2, b: vec2) {
      let x: number = a.x - b.x; x *= x;
      let y: number = a.y - b.y; y *= y;
      return Math.sqrt(x + y);
   }

   /**
    * 
    * @param a
    * @param aMult
    * @param b
    * @param bMult
    * @returns a * aMult + b * bMult
    */
   public static mad(a: vec2, aMult: number, b: vec2, bMult: number) {
      let res: vec2 = new vec2(
         a.x * aMult + b.x * bMult,
         a.y * aMult + b.y * bMult
      );
      return res;
   }
   /**
    * 
    * @param from
    * @param to
    * @returns Normalized vector
    */
   public static GetVector(from: vec2, to: vec2): vec2 {
      let v = new vec2(to.x - from.x, to.y - from.y).normalize();
      return v;
   }
   /**
    * 
    * @param a Normalized vector
    * @param b Normalized vector
    * @returns angle in radians
    */
   public static GetAngleBetween(a: vec2, b: vec2): number {
      let dot: number = a.x * b.x + a.y * b.y;
      return Math.acos(dot);
   }
}

export class vec3 {
   public readonly x: number;
   public readonly y: number;
   public readonly z: number;

   constructor(x: number, y: number, z: number) {
      this.x = x;
      this.y = y;
      this.z = z;
   }


   public apply(f: (component: number) => number): vec3 {
      return new vec3(f(this.x), f(this.y), f(this.z));
   }

   public clamp(minVal: number = 0, maxVal: number = 1): vec3 {
      let x = Math.min(Math.max(this.x, minVal), maxVal);
      let y = Math.min(Math.max(this.y, minVal), maxVal);
      let z = Math.min(Math.max(this.z, minVal), maxVal);
      return new vec3(x, y, z);
   }

   public divide(by: number): vec3 {
      return new vec3(this.x / by, this.y / by, this.z / by);
   }

   public multiply(by: number): vec3 {
      return new vec3(this.x * by, this.y * by, this.z * by);
   }
   
   public asTuple(): [x: number, y: number, z: number] {
      return [this.x, this.y, this.z];
   }
   /**
    * Assumes all components are in [0, 1] range
    * @returns
    */
   public toColor255(): vec3 {
      return new vec3(Math.floor(this.x * 255), Math.floor(this.y * 255), Math.floor(this.z * 255));
   }
   /**
    * Assumes all components are in [0, 1] range
    * @returns
    */
   public toStringCol255(): string {
      let r: number = Math.floor(this.x * 255);
      let g: number = Math.floor(this.y * 255);
      let b: number = Math.floor(this.z * 255);
      return `rgb(${r}, ${g}, ${b})`;
   }
   /**
    * Assumes all components are in [0, 1] range
    * @returns
    */
   public toStringColHex(): string {
      let s = "#"
         + Math.floor(this.x * 255).toString(16).padStart(2, '0')
         + Math.floor(this.y * 255).toString(16).padStart(2, '0')
         + Math.floor(this.z * 255).toString(16).padStart(2, '0')
      return s;
   }
   /**
    * 
    * @param prec
    * @returns
    */
   public toString(prec: number = 3) {
      return `Vec3: [${this.x.toFixed(prec)}, ${this.y.toFixed(prec)}, ${this.z.toFixed(prec)}]`;
   }


   /**
    * Create vector from data
    * @param arr
    * @returns
    */
   public static fromUInt8Clamped(arr: Uint8ClampedArray) {
      return new vec3(arr[0], arr[1], arr[2]);
   }
   /**
    * 
    * @param hexCol
    * @returns this.component will be in range [0, 1]
    */
   public static fromColorHex(hexCol: string): vec3 {
      const hex10Map: Record<string, number> = {
         "0": 0,
         "1": 1,
         "2": 2,
         "3": 3,
         "4": 4,
         "5": 5,
         "6": 6,
         "7": 7,
         "8": 8,
         "9": 9,
         "a": 10, "A": 10,
         "b": 11, "B": 11,
         "c": 12, "C": 12,
         "d": 13, "D": 13,
         "e": 14, "E": 14,
         "f": 15, "F": 15
      }

      if (hexCol.length != 7 && !hexCol.startsWith('#')) throw new Error(`Invalid string provided: "${hexCol}"`);

      let x: number = hex10Map[hexCol[1]] * 16 + hex10Map[hexCol[2]];
      let y: number = hex10Map[hexCol[3]] * 16 + hex10Map[hexCol[4]];
      let z: number = hex10Map[hexCol[5]] * 16 + hex10Map[hexCol[6]];

      return new vec3(x / 255, y / 255, z / 255);
   }
   /**
    * 
    * @param min
    * @param max
    * @returns New vec3 with all components with random values in the given range
    */
   public static fromRandom(min: number = 0, max: number = 1):vec3 {
      let d = max - min;
      return new vec3(min + d * Math.random(), min + d * Math.random(), min + d * Math.random());
   }
   /**
    * 
    * @param a
    * @param b
    * @returns positive number 0, 3 if colors are in ranges 0, 1
    */
   public static difsum(a: vec3, b: vec3): number {
      let dx = Math.abs(a.x - b.x);
      let dy = Math.abs(a.y - b.y);
      let dz = Math.abs(a.z - b.z);
      return dx + dy + dz;
   }
   /**
    * 
    * @param a
    * @param a_factor
    * @param b
    * @returns a * a_factor + b * (1.0 - a_factor)
    */
   public static combine(a: vec3, a_factor: number, b: vec3): vec3 {
      let b_factor: number = 1.0 - a_factor;
      return new vec3(a.x * a_factor + b.x * b_factor,
         a.y * a_factor + b.y * b_factor,
         a.z * a_factor + b.z * b_factor);
   }
}