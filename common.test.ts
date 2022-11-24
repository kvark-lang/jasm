// as to varying length instructions - these are unit tests
// we only have the same type of instructions in every .asm file
export function* splitBytes(
  bytes: Uint8Array,
  step?: number,
) {
  // step in bytes, default 2
  step = step ?? 2;
  // get next <step> bytes
  for (let l = step; l <= bytes.length; l += step) {
    yield bytes.subarray(l - step, l);
  }
  // if EOF, return empty and quit
  return new Uint8Array([]);
}
