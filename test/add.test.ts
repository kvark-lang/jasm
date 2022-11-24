import { assertEquals } from "https://deno.land/std@0.154.0/testing/asserts.ts";
import { factory } from "../mod.ts";
import { splitBytes } from "../common.test.ts";

const testAddRR = await Deno.readFile(".build/add.rr.bin");

Deno.test({
	// testing varying mov instructions, 32 bit
	name: "test jasm - mov reg reg",
	fn: async (t) => {
		// create factory to emit linux binaries in 32 bit mode
		const { add } = factory();

		// set up byte splitter to process consequent instructions
		const bytes = splitBytes(testAddRR);

		// run first test as defined in mov.asm
		await t.step({
			name: "add eax, eax",
			fn: () => {
				// real bytes from nasm run
				const realValue = [...bytes.next().value];
				// assert that jasm emitted the same thing
				assertEquals(add("eax", "eax"), realValue);
			},
		});

		await t.step({
			name: "add eax, ebx",
			fn: () => {
				const realValue = [...bytes.next().value];
				assertEquals(add("eax", "ebx"), realValue);
			},
		});

		await t.step({
			name: "add ecx, edx",
			fn: () => {
				const realValue = [...bytes.next().value];
				assertEquals(add("ecx", "edx"), realValue);
			},
		});
	},
});

const testAddRI = await Deno.readFile(".build/add.ri.bin");

// same as above, but different section of the asm file
Deno.test({
	// testing varying mov instructions, 32 bit
	name: "test jasm - mov reg imm",
	fn: async (t) => {
		const { add } = factory();

		const bytes = splitBytes(testAddRI, 3);

		await t.step({
			name: "add eax, 1",
			fn: () => {
				const realValue = [...bytes.next().value];
				assertEquals(add("eax", 1), realValue);
			},
		});

		await t.step({
			name: "add ebx, 0",
			fn: () => {
				const realValue = [...bytes.next().value];
				assertEquals(add("ebx", 0), realValue);
			},
		});
	},
});
