import { assertEquals } from "https://deno.land/std@0.154.0/testing/asserts.ts";
import { factory } from "../mod.ts";

const testMov = await Deno.readFile(".build/mov.test.bin");

// as to varying length instructions - these are unit tests
// we only have the same type of instructions in every .asm file
function* splitBytes(bytes: Uint8Array, step?: number) {
	// step in bytes, default 2
	step = step ?? 2;
	// get next <step> bytes
	for (let l = step; l <= bytes.length; l += step) {
		yield bytes.subarray(l - step, l);
	}
	// if EOF, return empty and quit
	return new Uint8Array([]);
}

Deno.test({
	// testing varying mov instructions, 32 bit
	name: "test jasm - mov reg reg",
	fn: async (t) => {
		// create factory to emit linux binaries in 32 bit mode
		const { mov } = factory({
			arch: "x86",
			withFormat: "elf",
		});

		// set up byte splitter to process consequent instructions
		const bytes = splitBytes(testMov);

		// run first test as defined in mov.asm
		await t.step({
			name: "mov eax, eax",
			fn: () => {
				// real bytes from nasm run
				const realValue = [...bytes.next().value];
				// assert that jasm emitted the same thing
				assertEquals(mov("eax", "eax"), realValue);
			},
		});

		await t.step({
			name: "mov eax, ebx",
			fn: () => {
				// real bytes from nasm run
				const realValue = [...bytes.next().value];
				// assert that jasm emitted the same thing
				assertEquals(mov("eax", "ebx"), realValue);
			},
		});

		await t.step({
			name: "mov eax, ebx",
			fn: () => {
				// real bytes from nasm run
				const realValue = [...bytes.next().value];
				// assert that jasm emitted the same thing
				assertEquals(mov("ecx", "edx"), realValue);
			},
		});
	},
});
