ROOT_DIR=$(shell pwd)
BUILD_DIR=${ROOT_DIR}/.build

run: clean nasm-test jasm-test

jasm-test:
	deno test --coverage=.build/.cov --allow-read .

nasm-test: mov inc

mov:
	nasm -felf32 ${ROOT_DIR}/test/$@.asm -o ${BUILD_DIR}/$@.bin
	objcopy -O binary -j .firstTest ${BUILD_DIR}/$@.bin ${BUILD_DIR}/$@.rr.bin
	objcopy -O binary -j .secondTest ${BUILD_DIR}/$@.bin ${BUILD_DIR}/$@.ri.bin

inc:
	nasm -felf32 ${ROOT_DIR}/test/$@.asm -o ${BUILD_DIR}/$@.bin
	objcopy -O binary -j .firstTest ${BUILD_DIR}/$@.bin ${BUILD_DIR}/$@.na.bin

clean:
	rm -rf ${BUILD_DIR}
	mkdir ${BUILD_DIR}
