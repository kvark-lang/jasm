export type BinaryFormat = "elf" | "pe";
export type BinaryCalculable = (binary: Array<number>) => Array<number>;
export type BinaryPart = string | number | BinaryCalculable;
export type BinaryWithAddressGaps = Array<BinaryPart>;

export interface FactoryOptions {
  arch: "x86";
  withFormat: BinaryFormat;
}

export type BinaryFactory = Record<
  string,
  (...data: (string | number)[]) => BinaryPart
>;

export function factory(
  options: FactoryOptions,
): BinaryFactory {
  console.log(options);
  return {};
}
