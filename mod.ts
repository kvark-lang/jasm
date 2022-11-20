import { x86 } from "./arches/x86.ts";
import {
	JasmFactory,
	JasmFactoryOptions,
	JasmInstruction,
	JasmIr,
	JasmOutputFormat,
	JasmOutputWithAddressGaps,
} from "./types.ts";

export function factory(
	_options: JasmFactoryOptions,
): JasmFactory {
	// TODO not just x86
	return x86;
}

export type {
	JasmFactory,
	JasmFactoryOptions,
	JasmInstruction,
	JasmIr,
	JasmOutputFormat,
	JasmOutputWithAddressGaps,
};
