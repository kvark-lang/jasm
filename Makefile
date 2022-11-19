ROOT_DIR=$(shell pwd)
BUILD_DIR=${ROOT_DIR}/.build

run: clean mov jasm-test

jasm-test:
	deno test --coverage=.build/.cov --allow-read .

nasm-test: mov

mov:
	nasm -fbin ${ROOT_DIR}/assembly/$@.asm -o ${BUILD_DIR}/$@.bin

clean:
	rm -rf ${BUILD_DIR}
	mkdir ${BUILD_DIR}
