ROOT_DIR=$(shell pwd)
BUILD_DIR=${ROOT_DIR}/.build

run: clean mov jasm-test

jasm-test:
	deno test --coverage=.build/.cov --allow-read .

nasm-test: mov

mov:
	nasm -felf32 ${ROOT_DIR}/test/$@.asm -o ${BUILD_DIR}/$@.bin
	objcopy -O binary -j .text ${BUILD_DIR}/$@.bin ${BUILD_DIR}/$@.test.bin

clean:
	rm -rf ${BUILD_DIR}
	mkdir ${BUILD_DIR}
