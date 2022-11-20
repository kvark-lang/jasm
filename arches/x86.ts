import { instructions } from "./x86.raw.ts";
import { JasmInstruction, JasmIr } from "../mod.ts";

type TypeofTypeof =
	| "string"
	| "number"
	| "bigint"
	| "symbol"
	| "boolean"
	| "undefined"
	| "function"
	| "object";

export type Register64 = "rax" | "rbx" | "rcx" | "rdx";
export type Register32 = "eax" | "ebx" | "ecx" | "edx";

export type Register16 = "ax" | "bx" | "cx" | "dx";
export type Register8 =
	| "ah"
	| "al"
	| "bh"
	| "bl"
	| "ch"
	| "cl"
	| "dh"
	| "dl";

export type Register =
	| Register64
	| Register32
	| Register16
	| Register8;

export function is8BitReg(o: string): o is Register8 {
	return o.endsWith("l") || o.endsWith("h");
}

export function is16BitReg(o: string): o is Register16 {
	return o == "ax" || o == "bx" || o == "cx" || o == "dx";
}

export function is32BitReg(o: string): o is Register32 {
	return o.startsWith("e") && o.endsWith("x");
}

export function is64BitReg(o: string): o is Register64 {
	return o.startsWith("r") && o.endsWith("x");
}

export const x86 = {} as Record<string, JasmInstruction>;

function makeRm(...bits: number[]) {
	return parseInt(bits.join(""), 2);
}

// TODO check if these are all
const rmRegisters = {
	"eax": [0, 0, 0],
	"ecx": [0, 0, 1],
	"edx": [0, 1, 0],
	"ebx": [0, 1, 1],
	"esp": [1, 0, 0],
	"ebp": [1, 0, 1],
	"esi": [1, 1, 0],
	"edi": [1, 1, 1],
} as Record<string, number[]>;

const rmMod = {
	// TODO implement other types
	//  refer to modr/m tables
	"vqp": [1, 1],
	"v": [1, 1],
	"b": [1, 1],
};

function determineTypes(data: JasmIr) {
	type TypeofTuple = `${TypeofTypeof}_${TypeofTypeof}`;
	interface DstSrc {
		dst?: { a: string; t: string };
		src?: { a: string; t: string };
	}
	const [arg1, arg2] = data;
	const types = [typeof arg1, typeof arg2];
	const typesAsString = types.join("_") as TypeofTuple;
	const variants = {
		"string_number": (_data: JasmIr) => {
			return {
				dst: { a: "Z", t: "vqp" },
				src: { a: "I", t: "vqp" },
			};
		},
		"string_string": (_data: JasmIr) => {
			return {
				dst: { a: "E", t: "vqp" },
				src: { a: "G", t: "vqp" },
			};
		},
	} as Record<
		TypeofTuple,
		(
			data: JasmIr,
		) => DstSrc
	>;
	const variant = variants[typesAsString];
	if (!variant) {
		throw `combination of ${typesAsString} not implemented`;
	}
	return variant(data);
}

instructions.forEach((instruction) => {
	const mnem = instruction.mnem.toLowerCase();
	// if instruction does not exist yet
	if (!x86[mnem]) {
		// TODO could be made more effective with pre-filtering of mnemonics
		x86[mnem] = (...data: JasmIr) => {
			const types = determineTypes(data);
			const [arg1, arg2] = data;
			const variants = instructions.filter((i) => {
				// check instruction mnemonic match -> ADD==ADD, ADD=/=MOV
				if (!(i.mnem.toLowerCase() === mnem)) {
					return false;
				}
				// assume correct, in case it does not exist
				let correctDst = true;
				// assume for src too
				let correctSrc = true;
				// if exists, check a (operand type) and t (data type?)
				if (i.dst && types.dst) {
					correctDst = i.dst.a === types.dst.a &&
						i.dst.t === types.dst.t;
				}
				// same thing for src
				if (i.src && types.src) {
					correctSrc = i.src.a === types.src.a &&
						i.src.t === types.src.t;
				}
				// check that both are correct
				return correctDst && correctSrc;
			});
			if (!variants) {
				throw `no correct combination of types found for - ${mnem} ${
					data.join(" ")
				}`;
			}
			// fetch first variant
			// FIXME what if we have more or none?
			const variant = variants[0];
			// TODO rename rm0 - it is really just an instruction-specific REG value of r/m
			if (variant.rm0) {
				const rmREG = variant.rm0;
				// FIXME implement rm0 for inc and dec and etc.
			}
			const rmBits = [];
			rmBits.push(...rmMod["vqp"]);
			// yes, in reverse
			// dst, src
			rmBits.push(...rmRegisters[arg2]);
			rmBits.push(...rmRegisters[arg1]);
			const rmByte = makeRm(...rmBits);
			return [variant.opcode, rmByte];
		};
	}
});
