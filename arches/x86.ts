import { instructions } from "./x86.raw.ts";

export type BinaryFormat = "elf" | "pe";
export type BinaryCalculable = (binary: Array<number>) => Array<number>;
export type BinaryPart = string | number[] | BinaryCalculable;
export type BinaryWithAddressGaps = Array<BinaryPart>;
export type InstructionData = (string | number)[];
export type Instruction = (...data: InstructionData) => BinaryPart;
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
export type Register8 = "ah" | "al" | "bh" | "bl" | "ch" | "cl" | "dh" | "dl";

export type Register = Register64 | Register32 | Register16 | Register8;

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

export const x86 = {} as Record<string, Instruction>;

const determineTypes = (data: InstructionData) => {
  type TypeofTuple = `${TypeofTypeof},${TypeofTypeof}`;
  interface DstSrc {
    dst?: { a: string; t: string };
    src?: { a: string; t: string };
  }
  const [arg1, arg2] = data;
  const types = [typeof arg1, typeof arg2];
  const typesAsString = types.toString() as TypeofTuple;
  const variants = {
    "string,number": (data: InstructionData) => {
      return { dst: { a: "Z", t: "vqp" }, src: { a: "I", t: "vqp" } };
    },
  } as Record<
    TypeofTuple,
    (
      data: InstructionData,
    ) => DstSrc
  >;
  return variants[typesAsString](data);
};

instructions.forEach((instruction) => {
  const mnem = instruction.mnem.toLowerCase();
  if (!x86[mnem]) {
    x86[mnem] = (...data: InstructionData) => {
      const types = determineTypes(data);
      const variants = instructions.filter((i) => {
        let correctDst = true;
        let correctSrc = true;
        if (i.dst && types.dst) {
          correctDst = i.dst.a === types.dst.a && i.dst.t === types.dst.t;
        }
        if (i.src && types.src) {
          correctSrc = i.src.a === types.src.a && i.src.t === types.src.t;
        }
        return i.mnem.toLowerCase() === mnem && correctDst && correctSrc;
      });

      throw "no correct combination of types found";
    };
  }
});
