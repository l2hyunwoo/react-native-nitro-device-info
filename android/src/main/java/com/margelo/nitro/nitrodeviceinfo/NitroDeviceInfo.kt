package com.margelo.nitro.nitrodeviceinfo
  
import com.facebook.proguard.annotations.DoNotStrip

@DoNotStrip
class NitroDeviceInfo : HybridNitroDeviceInfoSpec() {
  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }
}
