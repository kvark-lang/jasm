BUILD_DIR=.build

run: clean dev-ndis run-dev

run-dev:
	${BUILD_DIR}/runnable

dev:
	deno run --unstable -A index.ts
	chmod +x ${BUILD_DIR}/runnable

dev-ndis: dev
	ndisasm -b64 ${BUILD_DIR}/deno.bin

dev-test:
	deno test --coverage=.build/.cov .

asm-flat: asm
	ndisasm -b64 ${BUILD_DIR}/index.bin

asm:
	nasm -fbin index.s -o ${BUILD_DIR}/index.bin

clean:
	rm -rf ${BUILD_DIR}
	mkdir ${BUILD_DIR}
