import { instructions, RawInstruction } from "./x86.raw.ts";
import { JasmInstruction, JasmIr } from "../mod.ts";

type TypeofTuple = `${TypeofTypeof}_${TypeofTypeof}`;
interface DstSrc {
	needRm?: boolean;
	dst?: {
		a: string[];
		t: string[];
	};
	src?: {
		a: string[];
		t: string[];
	};
}

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

// TODO rewrite without using strings
function splitInt(
	number: number,
) {
	if (number < 0) {
		number = number >>> 0;
	}
	const r = number.toString(16).padStart(8, "0");
	const r1 = r.slice(0, 2);
	const r2 = r.slice(2, 4);
	const r3 = r.slice(4, 6);
	const r4 = r.slice(6, 8);
	return [
		parseInt(r1, 16),
		parseInt(r2, 16),
		parseInt(r3, 16),
		parseInt(r4, 16),
	].reverse();
}

// TODO what if r<n> is there?
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

const typeNeedRm = {
	"Z": false,
} as Record<string, boolean>;

function determineTypes(data: JasmIr) {
	const [arg1, arg2] = data;
	const types = [typeof arg1, typeof arg2];
	const typesAsString = types.join("_") as TypeofTuple;
	const variants = {
		"string_undefined": (_data: JasmIr) => {
			return {
				needRm: true,
				dst: { a: ["Z"], t: ["v"] },
			};
		},
		"string_number": (_data: JasmIr) => {
			return {
				dst: {
					a: ["Z", "E"],
					t: ["vqp"],
				},
				src: { a: ["I"], t: ["vqp", "bs"] },
			};
		},
		"string_string": (_data: JasmIr) => {
			// TODO other string_string cases
			return {
				needRm: true,
				dst: { a: ["E"], t: ["vqp"] },
				src: { a: ["G"], t: ["vqp"] },
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

export function determineInstruction(
	instructionSet: Array<RawInstruction>,
	types: DstSrc,
) {
	const variants = instructionSet.filter((i) => {
		// assume correct, in case it does not exist
		let correctDst = true;
		// assume for src too
		let correctSrc = true;
		// if exists, check a (operand type) and t (data type?)
		if (i.dst && types.dst) {
			correctDst = types.dst.a!.includes(i.dst.a) &&
				types.dst.t!.includes(i.dst.t);
		}
		// same thing for src
		if (i.src && types.src) {
			correctSrc = types.src.a!.includes(i.src.a) &&
				types.src.t!.includes(i.src.t);
		}
		// check that both are correct
		return correctDst && correctSrc;
	});
	return variants;
}

instructions.forEach((instruction) => {
	const mnem = instruction.mnem.toLowerCase();
	const instructionSet = instructions.filter((i) => {
		// check instruction mnemonic match -> ADD==ADD, ADD=/=MOV
		if (!(i.mnem.toLowerCase() === mnem)) {
			return false;
		}
		return true;
	});
	// if instruction does not exist yet
	if (!x86[mnem]) {
		x86[mnem] = (...data: JasmIr) => {
			const types = determineTypes(data);
			const [arg1, arg2] = data;
			// fetch first variant
			// FIXME what if we have more or none?
			const variants = determineInstruction(
				instructionSet,
				types,
			);
			if (!variants.length) {
				throw `no correct combination of types found for - ${mnem} ${
					data.join(" ")
				}`;
			}
			const variant = variants[0];
			console.log(variant);

			if (!variant.src && variant.dst!.a == "Z") {
				const rmBits = [];
				rmBits.push(...rmMod["vqp"]);
				rmBits.push(...rmRegisters[arg1]);
				return [
					variant.opcode + makeRm(...rmBits),
				];
			}

			if (
				variant.dst && variant.dst &&
				variant.dst.a == "Z" && variant.src!.a == "I"
			) {
				return [
					makeRm(...rmRegisters[arg1]) +
					variant.opcode,
					...splitInt(arg2 as number),
				];
			}

			if (
				variant.src && variant.dst &&
				variant.dst.a == "E" && variant.src.a == "I"
			) {
				const rmBits = [];
				rmBits.push(...rmMod["vqp"]);
				rmBits.push(0, 0, 0);
				rmBits.push(...rmRegisters[arg1]);
				return [
					variant.opcode,
					makeRm(...rmBits),
					arg2 as number,
				];
			}

			if (
				variant.src && variant.dst &&
				variant.dst.a == "E" && variant.src.a == "G"
			) {
				const rmBits = [];
				rmBits.push(...rmMod["vqp"]);
				rmBits.push(...rmRegisters[arg2]);
				rmBits.push(...rmRegisters[arg1]);
				return [variant.opcode, makeRm(...rmBits)];
			}

			return [];
		};
	}
});
