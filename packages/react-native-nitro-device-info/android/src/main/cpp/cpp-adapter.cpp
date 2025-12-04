#include <jni.h>
#include "nitrodeviceinfoOnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return margelo::nitro::nitrodeviceinfo::initialize(vm);
}
