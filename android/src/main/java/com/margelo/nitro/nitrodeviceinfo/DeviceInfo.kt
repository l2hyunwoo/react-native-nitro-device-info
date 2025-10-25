/**
 * DeviceInfo.kt React Native Nitro Device Info - Android Implementation
 *
 * Implements the DeviceInfo HybridObject for Android devices. Provides comprehensive device
 * information through Nitro's JSI bindings.
 *
 * @author HyunWoo Lee
 * @version 0.1.0
 */
package com.margelo.nitro.nitrodeviceinfo

import android.app.ActivityManager
import android.app.KeyguardManager
import android.content.Context
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.content.res.Configuration
import android.location.LocationManager
import android.media.AudioManager
import android.os.BatteryManager
import android.os.Build
import android.os.Debug
import android.os.Environment
import android.os.StatFs
import android.provider.Settings
import android.telephony.TelephonyManager
import android.util.Log
import com.facebook.proguard.annotations.DoNotStrip
import com.margelo.nitro.NitroModules
import com.margelo.nitro.core.Promise

/**
 * Main implementation of DeviceInfo for Android
 *
 * This class provides all device information methods for Android devices, using Android SDK APIs
 * like Build, PackageManager, ActivityManager, etc.
 */
@DoNotStrip
class DeviceInfo : HybridDeviceInfoSpec() {
    // MARK: - Memory Optimization - Lazy Cached Values

    /** Get the React Application Context */
    private val context: Context
        get() = NitroModules.applicationContext ?: throw RuntimeException("React context not available")

    /** Cached activity manager to avoid repeated system service lookups */
    private val activityManager: ActivityManager by lazy {
        context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
    }

    /** Cached package manager to avoid repeated lookups */
    private val packageManager: PackageManager by lazy { context.packageManager }

    /** Cached package info to avoid repeated queries */
    private val packageInfo: PackageInfo by lazy {
        try {
            packageManager.getPackageInfo(context.packageName, 0)
        } catch (e: PackageManager.NameNotFoundException) {
            throw RuntimeException("Package not found: ${context.packageName}", e)
        }
    }

    /** Cached battery manager to avoid repeated system service lookups */
    private val batteryManager: BatteryManager by lazy {
        context.getSystemService(Context.BATTERY_SERVICE) as BatteryManager
    }

    // MARK: - Synchronous Properties (Cached Values)

    /** Device model identifier (e.g., "SM-G998B") From Build.MODEL */
    override val deviceId: String
        get() = Build.MODEL

    /** Device brand/manufacturer name (e.g., "Samsung", "Google") From Build.BRAND */
    override val brand: String
        get() = Build.BRAND

    /** Operating system name (always "Android") */
    override val systemName: String
        get() = "Android"

    /** Operating system version (e.g., "12", "13") From Build.VERSION.RELEASE */
    override val systemVersion: String
        get() = Build.VERSION.RELEASE

    /** Device model name (e.g., "Galaxy S21", "Pixel 7") From Build.DEVICE */
    override val model: String
        get() = Build.DEVICE

    /** Device type category Determined from screen size and UI mode */
    override val deviceType: DeviceType
        get() {
            val uiMode = context.resources.configuration.uiMode
            val screenLayout = context.resources.configuration.screenLayout

            // Check if TV
            if ((uiMode and Configuration.UI_MODE_TYPE_MASK) ==
                Configuration.UI_MODE_TYPE_TELEVISION
            ) {
                return DeviceType.TV
            }

            // Check if tablet (smallest width >= 600dp)
            val smallestScreenWidthDp = context.resources.configuration.smallestScreenWidthDp
            return if (smallestScreenWidthDp >= 600) {
                DeviceType.TABLET
            } else {
                DeviceType.HANDSET
            }
        }

    // MARK: - Synchronous Methods

    /** Check if device is a tablet Based on smallest screen width >= 600dp */
    override fun isTablet(): Boolean {
        val smallestScreenWidthDp = context.resources.configuration.smallestScreenWidthDp
        return smallestScreenWidthDp >= 600
    }

    /**
     * Check if device has a display notch Not implemented for Android (detection complex and varies
     * by manufacturer)
     */
    override fun hasNotch(): Boolean {
        // Android notch detection is complex and manufacturer-specific
        // For MVP, return false
        return false
    }

    /**
     * Check if device has Dynamic Island Android devices don't have Dynamic Island (iOS-only feature)
     */
    override fun hasDynamicIsland(): Boolean {
        return false
    }

    // MARK: - Asynchronous Methods - Device Identification

    /** Get unique device identifier (ANDROID_ID) Persists across app installs (usually) */
    override fun getUniqueId(): Promise<String> {
        return Promise.async {
            Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID) ?: ""
        }
    }

    /** Get device manufacturer name From Build.MANUFACTURER */
    override fun getManufacturer(): Promise<String> {
        return Promise.async { Build.MANUFACTURER }
    }

    // MARK: - Asynchronous Methods - System Resources

    /** Get total device RAM in bytes */
    override fun getTotalMemory(): Promise<Double> {
        return Promise.async {
            // Use cached ActivityManager to avoid repeated system service lookups
            val memInfo = ActivityManager.MemoryInfo()
            activityManager.getMemoryInfo(memInfo)
            memInfo.totalMem.toDouble()
        }
    }

    /** Get current app memory usage in bytes */
    override fun getUsedMemory(): Promise<Double> {
        return Promise.async {
            // Use Debug.getMemoryInfo which doesn't require ActivityManager
            val memInfo = Debug.MemoryInfo()
            Debug.getMemoryInfo(memInfo)
            (memInfo.totalPss * 1024).toDouble() // Convert KB to bytes
        }
    }

    /** Get total disk storage capacity in bytes */
    override fun getTotalDiskCapacity(): Promise<Double> {
        return Promise.async {
            val path = Environment.getDataDirectory()
            val stat = StatFs(path.path)
            (stat.blockCountLong * stat.blockSizeLong).toDouble()
        }
    }

    /** Get free disk storage in bytes */
    override fun getFreeDiskStorage(): Promise<Double> {
        return Promise.async {
            val path = Environment.getDataDirectory()
            val stat = StatFs(path.path)
            (stat.availableBlocksLong * stat.blockSizeLong).toDouble()
        }
    }

    /** Get current battery level (0.0 to 1.0) */
    override fun getBatteryLevel(): Promise<Double> {
        return Promise.async {
            // Use cached BatteryManager to avoid repeated system service lookups
            val level = batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
            (level / 100.0)
        }
    }

    /** Get comprehensive power state information */
    override fun getPowerState(): Promise<PowerState> {
        return Promise.async {
            // Use cached BatteryManager to avoid repeated system service lookups
            val level = batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
            val isCharging = batteryManager.isCharging

            val batteryState =
                when {
                    batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_STATUS) ==
                        BatteryManager.BATTERY_STATUS_FULL -> BatteryState.FULL

                    isCharging -> BatteryState.CHARGING
                    else -> BatteryState.UNPLUGGED
                }

            // Android doesn't have a direct equivalent to iOS low power mode
            PowerState(
                batteryLevel = level / 100.0,
                batteryState = batteryState,
                lowPowerMode = false,
            )
        }
    }

    /** Check if battery is currently charging */
    override fun isBatteryCharging(): Promise<Boolean> {
        return Promise.async {
            // Use cached BatteryManager to avoid repeated system service lookups
            batteryManager.isCharging
        }
    }

    // MARK: - Asynchronous Methods - Application Metadata

    /** Get application version string */
    override fun getVersion(): Promise<String> {
        return Promise.async {
            // Use cached packageInfo to avoid repeated queries
            packageInfo.versionName ?: ""
        }
    }

    /** Get application build number */
    override fun getBuildNumber(): Promise<String> {
        return Promise.async {
            // Use cached packageInfo to avoid repeated queries
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                packageInfo.longVersionCode.toString()
            } else {
                @Suppress("DEPRECATION")
                packageInfo.versionCode.toString()
            }
        }
    }

    /** Get package name (equivalent to bundle ID on iOS) */
    override fun getBundleId(): Promise<String> {
        return Promise.async { context.packageName }
    }

    /** Get application display name */
    override fun getApplicationName(): Promise<String> {
        return Promise.async {
            // Use cached packageManager to avoid repeated lookups
            val appInfo = context.applicationInfo
            packageManager.getApplicationLabel(appInfo).toString()
        }
    }

    /** Get first install timestamp (milliseconds since epoch) */
    override fun getFirstInstallTime(): Promise<Double> {
        return Promise.async {
            // Use cached packageInfo to avoid repeated queries
            packageInfo.firstInstallTime.toDouble()
        }
    }

    /** Get last update timestamp (milliseconds since epoch) */
    override fun getLastUpdateTime(): Promise<Double> {
        return Promise.async {
            // Use cached packageInfo to avoid repeated queries
            packageInfo.lastUpdateTime.toDouble()
        }
    }

    // MARK: - Asynchronous Methods - Network & Connectivity

    /** Get device IP address */
    override fun getIpAddress(): Promise<String> {
        return Promise.async {
            try {
                val en = java.net.NetworkInterface.getNetworkInterfaces()
                while (en.hasMoreElements()) {
                    val intf = en.nextElement()
                    val enumIpAddr = intf.inetAddresses
                    while (enumIpAddr.hasMoreElements()) {
                        val inetAddress = enumIpAddr.nextElement()
                        if (!inetAddress.isLoopbackAddress && inetAddress is java.net.Inet4Address) {
                            return@async inetAddress.hostAddress ?: ""
                        }
                    }
                }
                ""
            } catch (e: Exception) {
                Log.e(NAME, "Failed to get IP address", e)
                ""
            }
        }
    }

    /** Get MAC address */
    override fun getMacAddress(): Promise<String> {
        return Promise.async {
            // MAC address access is restricted on Android 6.0+
            // Return empty string
            ""
        }
    }

    /** Get cellular carrier name */
    override fun getCarrier(): Promise<String> {
        return Promise.async {
            val telephonyManager =
                context.getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager
            telephonyManager.networkOperatorName ?: ""
        }
    }

    /** Check if location services are enabled */
    override fun isLocationEnabled(): Promise<Boolean> {
        return Promise.async {
            val locationManager =
                context.getSystemService(Context.LOCATION_SERVICE) as LocationManager
            locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER) ||
                locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)
        }
    }

    /** Check if headphones are connected */
    override fun isHeadphonesConnected(): Promise<Boolean> {
        return Promise.async {
            val audioManager =
                context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
            audioManager.isWiredHeadsetOn || audioManager.isBluetoothA2dpOn
        }
    }

    // MARK: - Asynchronous Methods - Device Capabilities

    /** Check if camera is present */
    override fun isCameraPresent(): Promise<Boolean> {
        return Promise.async {
            // Use cached packageManager to avoid repeated lookups
            packageManager.hasSystemFeature(PackageManager.FEATURE_CAMERA_ANY)
        }
    }

    /** Check if PIN or biometric authentication is set */
    override fun isPinOrFingerprintSet(): Promise<Boolean> {
        return Promise.async {
            val keyguardManager =
                context.getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
            keyguardManager.isKeyguardSecure
        }
    }

    /** Check if running in emulator */
    override fun isEmulator(): Promise<Boolean> {
        return Promise.async {
            (
                Build.FINGERPRINT.startsWith("generic") ||
                    Build.FINGERPRINT.startsWith("unknown") ||
                    Build.MODEL.contains("google_sdk") ||
                    Build.MODEL.contains("Emulator") ||
                    Build.MODEL.contains("Android SDK built for x86") ||
                    Build.MANUFACTURER.contains("Genymotion") ||
                    (Build.BRAND.startsWith("generic") && Build.DEVICE.startsWith("generic")) ||
                    "google_sdk" == Build.PRODUCT
            )
        }
    }

    // MARK: - Asynchronous Methods - Platform-Specific

    /** Get Android API level */
    override fun getApiLevel(): Promise<Double> {
        return Promise.async { Build.VERSION.SDK_INT.toDouble() }
    }

    /** Get supported CPU architectures (ABIs) */
    override fun getSupportedAbis(): Promise<Array<String>> {
        return Promise.async { Build.SUPPORTED_ABIS }
    }

    /** Check if Google Mobile Services (GMS) is available */
    override fun hasGms(): Promise<Boolean> {
        return Promise.async {
            try {
                val result =
                    com.google.android.gms.common.GoogleApiAvailability.getInstance()
                        .isGooglePlayServicesAvailable(context)
                result == com.google.android.gms.common.ConnectionResult.SUCCESS
            } catch (e: Exception) {
                Log.w(NAME, "GMS not available or GMS library not found", e)
                false
            }
        }
    }

    /** Check if Huawei Mobile Services (HMS) is available */
    override fun hasHms(): Promise<Boolean> {
        return Promise.async {
            try {
                // Check if HMS Core is available - use cached packageManager
                val hmsPackageInfo = packageManager.getPackageInfo("com.huawei.hwid", 0)
                hmsPackageInfo != null
            } catch (e: PackageManager.NameNotFoundException) {
                Log.d(NAME, "HMS not available - not a Huawei device")
                false
            }
        }
    }

    companion object {
        const val NAME = "NitroDeviceInfo"
    }
}
