export type JasmOutputFormat = "elf";
export type JasmIr = (string | number)[];
export type JasmOutputWithAddressGaps = Array<JasmIr>;
export type JasmInstruction = (...data: JasmIr) => JasmIr;

export interface JasmFactoryOptions {
  arch: "x86";
  withFormat: JasmOutputFormat;
}

export type JasmFactory = Record<
  string,
  JasmInstruction
>;
