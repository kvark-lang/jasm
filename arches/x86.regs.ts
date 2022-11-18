// REGISTERS
// ============================================================================================
// Setting the registers seperately, due to the fact that certain registers have a certain size
export type Register64 = "rax" | "rbx" | "rcx" | "rdx";
export type Register32 = "eax" | "ebx" | "ecx" | "edx";

export type Register16 = "ax" | "bx" | "cx" | "dx";
export type Register8 = "ah" | "al" | "bh" | "bl" | "ch" | "cl" | "dh" | "dl";

// Uniting the register types into one
export type Register = Register64 | Register32 | Register16 | Register8;

// RAX, EAX, AX, AH, AL:  Accumulator register    =>  Used for I/O port access, arithmetic, interrupt calls, etc...
// RBX, EBX, BX, BH, BL:  Base register           =>  Used as base pointer for memory access, gets some interrupt return values...
// RCX, ECX, CX, CH, CL:  Counter register        =>  Used as loop counter and for shifts, gets some interrupt values...
// RDX, EDX, DX, DH, DL:  Data register           =>  Used for I/O port access, arithmetic, some interrupt calls...

// SEGMENT-REGISTERS
// -----------------------
//         CS:  This register holds the code segment in which your programme runs.
//              Changing this value might make the computer hang...
//         DS:  This register holds the data segment that you programme accesses.
//              Changing its value might give erronous data...
// ES, FS, GS:  These registers are available for far pointer adressing
//              like video memory and such.
//         SS:  This register holds the stack segment your programme uses...
//              Sometimes has the same value as DS.
//              Changing its value can create unpredictable results,
//              mostly data related.

// INDICES AND POINTERS
// --------------------------

// CHECKS
// ------
// Check for size of register by their name
export function is8BitReg(o: string): o is Register8 {
  return o.endsWith("l") || o.endsWith("h");
}

export function is16BitReg(o: string): o is Register16 {
  return o == "ax" || o == "bx" || o == "cx" || o == "dx";
}

export function is32BitReg(o: string): o is Register32 {
  return o.startsWith("e");
}

export function is64BitReg(o: string): o is Register64 {
  return o.startsWith("r");
}
