function popcount32(word: number): number {
  let v = word - ((word >>> 1) & 0x55555555);
  v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
  return (((v + (v >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
}

export default class Bitset {
  readonly size: number;
  readonly words: Uint32Array;

  constructor(size: number, words?: Uint32Array) {
    this.size = size;
    this.words = words ?? new Uint32Array((size + 31) >>> 5);
  }

  static fromRows(size: number, rows: ArrayLike<number>): Bitset {
    const bits = new Bitset(size);
    for (let i = 0; i < rows.length; i++) bits.add(rows[i]);
    return bits;
  }

  /** All bits in [0, end) set. */
  static range(size: number, end: number): Bitset {
    const bits = new Bitset(size);
    const fullWords = end >>> 5;
    bits.words.fill(0xffffffff, 0, fullWords);
    const rest = end & 31;
    if (rest > 0) bits.words[fullWords] = (1 << rest) - 1;
    return bits;
  }

  has(i: number): boolean {
    return (this.words[i >>> 5] & (1 << (i & 31))) !== 0;
  }

  add(i: number): void {
    if (i < 0 || i >= this.size)
      throw new RangeError(`Bit ${i} outside bitset of size ${this.size}`);
    this.words[i >>> 5] |= 1 << (i & 31);
  }

  remove(i: number): void {
    this.words[i >>> 5] &= ~(1 << (i & 31));
  }

  and(other: Bitset): this {
    this.assertSameSize(other);
    for (let w = 0; w < this.words.length; w++) this.words[w] &= other.words[w];
    return this;
  }

  or(other: Bitset): this {
    this.assertSameSize(other);
    for (let w = 0; w < this.words.length; w++) this.words[w] |= other.words[w];
    return this;
  }

  andNot(other: Bitset): this {
    this.assertSameSize(other);
    for (let w = 0; w < this.words.length; w++) this.words[w] &= ~other.words[w];
    return this;
  }

  clone(): Bitset {
    return new Bitset(this.size, this.words.slice());
  }

  count(): number {
    let total = 0;
    for (let w = 0; w < this.words.length; w++) total += popcount32(this.words[w]);
    return total;
  }

  isEmpty(): boolean {
    for (let w = 0; w < this.words.length; w++) if (this.words[w] !== 0) return false;
    return true;
  }

  forEach(fn: (i: number) => void): void {
    for (let w = 0; w < this.words.length; w++) {
      let word = this.words[w] | 0;
      while (word !== 0) {
        const lowest = word & -word;
        fn((w << 5) + 31 - Math.clz32(lowest));
        word ^= lowest;
      }
    }
  }

  toArray(): number[] {
    const out: number[] = [];
    this.forEach((i) => out.push(i));
    return out;
  }

  private assertSameSize(other: Bitset): void {
    if (other.size !== this.size) {
      throw new RangeError(`Bitset size mismatch: ${this.size} vs ${other.size}`);
    }
  }
}
