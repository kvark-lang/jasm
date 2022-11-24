export type JasmIr = (string | number)[];
export type JasmOutputWithAddressGaps = Array<JasmIr>;
export type JasmInstruction = (...data: JasmIr) => JasmIr;

export interface JasmFactoryOptions {
	arch?: "x86";
	format?: "elf";
}

export type JasmFactory = Record<
	string,
	JasmInstruction
>;
