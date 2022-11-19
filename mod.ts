export type BinaryFormat = "elf" | "pe";
export type BinaryCalculable = (binary: Array<number>) => Array<number>;
export type BinaryPart = string | number[] | BinaryCalculable;
export type BinaryWithAddressGaps = Array<BinaryPart>;
export type InstructionData = (string | number)[];
export type Instruction = (...data: InstructionData) => BinaryPart;

import { x86 } from "./arches/x86.ts";

export interface FactoryOptions {
  arch: "x86";
  withFormat: BinaryFormat;
}

export type BinaryFactory = Record<
  string,
  Instruction
>;

export function factory(
  options: FactoryOptions,
): BinaryFactory {
  const o = x86; // instructions defined here, can be destructured
  return o;
}
