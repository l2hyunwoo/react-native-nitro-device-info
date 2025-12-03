/**
 * DeviceInfo.kt React Native Nitro Device Info - Android Implementation
 *
 * Implements the DeviceInfo HybridObject for Android devices. Provides comprehensive device
 * information through Nitro's JSI bindings.
 *
 * @author HyunWoo Lee
 */
package com.margelo.nitro.nitrodeviceinfo

import android.annotation.SuppressLint
import android.app.ActivityManager
import android.app.KeyguardManager
import android.content.Context
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.content.res.Configuration
import android.location.LocationManager
import android.media.AudioDeviceInfo
import android.media.AudioManager
import android.media.MediaCodecList
import android.os.BatteryManager
import android.os.Build
import android.os.Debug
import android.os.Environment
import android.os.Handler
import android.os.Looper
import android.os.StatFs
import android.os.SystemClock
import android.provider.Settings
import android.telephony.TelephonyManager
import android.util.Log
import android.webkit.WebSettings
import androidx.core.content.getSystemService
import com.android.installreferrer.api.InstallReferrerClient
import com.android.installreferrer.api.InstallReferrerStateListener
import com.facebook.proguard.annotations.DoNotStrip
import com.google.android.gms.common.ConnectionResult
import com.google.android.gms.common.GoogleApiAvailability
import com.margelo.nitro.NitroModules
import com.margelo.nitro.core.Promise
import kotlinx.coroutines.isActive
import kotlinx.coroutines.suspendCancellableCoroutine
import java.net.Inet4Address
import java.net.NetworkInterface
import java.security.KeyStore
import java.util.Locale
import kotlin.coroutines.resume

/** Build information cache to avoid repeated Build.* lookups */
private data class BuildInfoCache(
    val serialNumber: String,
    val androidId: String,
    val securityPatch: String,
    val bootloader: String,
    val codename: String,
    val device: String,
    val display: String,
    val fingerprint: String,
    val hardware: String,
    val host: String,
    val product: String,
    val tags: String,
    val type: String,
    val baseOs: String,
    val previewSdkInt: Double,
    val incremental: String,
    val buildId: String,
)

/**
 * Main implementation of DeviceInfo for Android
 *
 * This class provides all device information methods for Android devices, using Android SDK APIs
 * like Build, PackageManager, ActivityManager, etc.
 */
@SuppressLint("HardwareIds")
@DoNotStrip
class DeviceInfo : HybridDeviceInfoSpec() {
    // MARK: - Memory Optimization - Lazy Cached Values

    /** Get the React Application Context */
    private val context: Context
        get() {
            return NitroModules.applicationContext
                ?: throw RuntimeException("React context not available")
        }

    /** Cached activity manager to avoid repeated system service lookups */
    private val activityManager: ActivityManager by lazy {
        context.getSystemService<ActivityManager>() as ActivityManager
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
        context.getSystemService<BatteryManager>() as BatteryManager
    }

    /** Cached audio manager for headphone detection */
    private val audioManager: AudioManager by lazy {
        context.getSystemService<AudioManager>() as AudioManager
    }

    /**
     * Get serial number with permission check Requires READ_PHONE_STATE permission on Android 8.0+
     */
    @SuppressLint("MissingPermission")
    private fun getSerialNumberInternal(): String {
        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                // Android 8.0+ requires READ_PHONE_STATE permission
                if (context.checkSelfPermission(android.Manifest.permission.READ_PHONE_STATE) ==
                    PackageManager.PERMISSION_GRANTED
                ) {
                    Build.getSerial()
                } else {
                    "unknown" // Permission not granted
                }
            } else {
                @Suppress("DEPRECATION")
                Build.SERIAL
            }
        } catch (e: SecurityException) {
            "unknown"
        }
    }

    /** Build information cache - initialized once at first access */
    private val buildInfoCache: BuildInfoCache by lazy {
        BuildInfoCache(
            serialNumber = getSerialNumberInternal(),
            androidId =
                Settings.Secure.getString(
                    context.contentResolver,
                    Settings.Secure.ANDROID_ID,
                )
                    ?: "unknown",
            securityPatch = Build.VERSION.SECURITY_PATCH,
            bootloader = Build.BOOTLOADER,
            codename = Build.VERSION.CODENAME,
            device = Build.DEVICE,
            display = Build.DISPLAY,
            fingerprint = Build.FINGERPRINT,
            hardware = Build.HARDWARE,
            host = Build.HOST,
            product = Build.PRODUCT,
            tags = Build.TAGS,
            type = Build.TYPE,
            baseOs = Build.VERSION.BASE_OS ?: "",
            previewSdkInt = Build.VERSION.PREVIEW_SDK_INT.toDouble(),
            incremental = Build.VERSION.INCREMENTAL,
            buildId = Build.ID,
        )
    }

    /** Cached system features list */
    private val systemFeatures: List<String> by lazy {
        context.packageManager.systemAvailableFeatures.mapNotNull { it.name }.sorted()
    }

    /** Cached supported media types */
    private val supportedMediaTypes: List<String> by lazy {
        try {
            val codecList = MediaCodecList(MediaCodecList.ALL_CODECS)
            val types = mutableSetOf<String>()
            codecList.codecInfos?.forEach { codecInfo ->
                codecInfo.supportedTypes.forEach { type -> types.add(type) }
            }

            types.sorted()
        } catch (e: Exception) {
            emptyList()
        }
    }

    /** Cached network info with periodic refresh (5 second cache) */
    private val ipCacheDurationMs = 5000L
    private var cachedIpAddress: String = "unknown"
    private var ipAddressCacheTime: Long = 0
    private var cachedMacAddress: String = "unknown"
    private var macAddressCacheTime: Long = 0
    private var cachedCarrier: String = "unknown"
    private var carrierCacheTime: Long = 0

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

    // MARK: - Synchronous Properties - Device Capabilities

    /** Check if device is a tablet Based on smallest screen width >= 600dp */
    override val isTablet: Boolean
        get() {
            val smallestScreenWidthDp = context.resources.configuration.smallestScreenWidthDp
            return smallestScreenWidthDp >= 600
        }

    /**
     * Check if device has a display notch Not implemented for Android (detection complex and varies
     * by manufacturer)
     */
    override fun getHasNotch(): Boolean = false

    /**
     * Check if device has Dynamic Island Android devices don't have Dynamic Island (iOS-only
     * feature)
     */
    override fun getHasDynamicIsland(): Boolean = false

    // MARK: - Synchronous Properties - Device Identification

    /** Get unique device identifier (ANDROID_ID) Persists across app installs (usually) */
    override val uniqueId: String
        get() = Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID) ?: ""

    /** Get device manufacturer name From Build.MANUFACTURER */
    override val manufacturer: String
        get() = Build.MANUFACTURER

    // MARK: - Synchronous Properties - System Resources

    /** Get total device RAM in bytes */
    override val totalMemory: Double
        get() {
            // Use cached ActivityManager to avoid repeated system service lookups
            val memInfo = ActivityManager.MemoryInfo()
            activityManager.getMemoryInfo(memInfo)
            return memInfo.totalMem.toDouble()
        }

    /** Get current app memory usage in bytes */
    override fun getUsedMemory(): Double {
        // Use Debug.getMemoryInfo which doesn't require ActivityManager
        val memInfo = Debug.MemoryInfo()
        Debug.getMemoryInfo(memInfo)
        return (memInfo.totalPss * 1024).toDouble() // Convert KB to bytes
    }

    /** Get total disk storage capacity in bytes */
    override val totalDiskCapacity: Double
        get() {
            val path = Environment.getDataDirectory()
            val stat = StatFs(path.path)
            return (stat.blockCountLong * stat.blockSizeLong).toDouble()
        }

    /** Get free disk storage in bytes */
    override fun getFreeDiskStorage(): Double {
        val path = Environment.getDataDirectory()
        val stat = StatFs(path.path)
        return (stat.availableBlocksLong * stat.blockSizeLong).toDouble()
    }

    /** Get current battery level (0.0 to 1.0) */
    override fun getBatteryLevel(): Double {
        // Use cached BatteryManager to avoid repeated system service lookups
        val level = batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
        return (level / 100.0)
    }

    /** Get comprehensive power state information */
    override fun getPowerState(): PowerState {
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
        return PowerState(
            batteryLevel = level / 100.0,
            batteryState = batteryState,
            lowPowerMode = false,
        )
    }

    /** Check if battery is currently charging */
    override fun getIsBatteryCharging(): Boolean {
        // Use cached BatteryManager to avoid repeated system service lookups
        return batteryManager.isCharging
    }

    // MARK: - Synchronous Properties - Application Metadata

    /** Get application version string */
    override val version: String
        get() {
            // Use cached packageInfo to avoid repeated queries
            return packageInfo.versionName ?: ""
        }

    /** Get application build number */
    override val buildNumber: String
        get() {
            // Use cached packageInfo to avoid repeated queries
            return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                packageInfo.longVersionCode.toString()
            } else {
                @Suppress("DEPRECATION")
                packageInfo.versionCode.toString()
            }
        }

    /** Get package name (equivalent to bundle ID on iOS) */
    override val bundleId: String
        get() = context.packageName

    /** Get application display name */
    override val applicationName: String
        get() {
            // Use cached packageManager to avoid repeated lookups
            val appInfo = context.applicationInfo
            return packageManager.getApplicationLabel(appInfo).toString()
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
                val en = NetworkInterface.getNetworkInterfaces()
                while (en.hasMoreElements()) {
                    val intf = en.nextElement()
                    val enumIpAddr = intf.inetAddresses
                    while (enumIpAddr.hasMoreElements()) {
                        val inetAddress = enumIpAddr.nextElement()
                        if (!inetAddress.isLoopbackAddress && inetAddress is Inet4Address) {
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
            val telephonyManager = context.getSystemService<TelephonyManager>()
            telephonyManager?.networkOperatorName.orEmpty()
        }
    }

    /** Check if location services are enabled */
    override fun isLocationEnabled(): Promise<Boolean> {
        return Promise.async {
            val locationManager = context.getSystemService<LocationManager>()
            locationManager?.isProviderEnabled(LocationManager.GPS_PROVIDER) == true ||
                locationManager?.isProviderEnabled(LocationManager.NETWORK_PROVIDER) == true
        }
    }

    /** Check if headphones are connected */
    override fun isHeadphonesConnected(): Promise<Boolean> {
        return Promise.async {
            val audioManager = context.getSystemService<AudioManager>()
            audioManager?.isWiredHeadsetOn == true || audioManager?.isBluetoothA2dpOn == true
        }
    }

    // MARK: - Synchronous Properties - Device Capabilities (Additional)

    /** Check if camera is present */
    override val isCameraPresent: Boolean
        get() {
            // Use cached packageManager to avoid repeated lookups
            return packageManager.hasSystemFeature(PackageManager.FEATURE_CAMERA_ANY)
        }

    /** Check if PIN or biometric authentication is set */
    override val isPinOrFingerprintSet: Boolean
        get() {
            val keyguardManager = context.getSystemService<KeyguardManager>()
            return keyguardManager?.isKeyguardSecure == true
        }

    /** Check if running in emulator */
    override val isEmulator: Boolean
        get() {
            return (
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

    // MARK: - Synchronous Properties - Platform-Specific

    /** Get Android API level */
    override val apiLevel: Double
        get() = Build.VERSION.SDK_INT.toDouble()

    /** Get supported CPU architectures (ABIs) */
    override val supportedAbis: Array<String>
        get() = Build.SUPPORTED_ABIS

    /**
     * Check if Google Mobile Services (GMS) is available
     * Catches both Exception and NoClassDefFoundError to handle cases where
     * play-services-base dependency is not included in the app.
     */
    override fun getHasGms(): Boolean {
        return try {
            val result =
                GoogleApiAvailability.getInstance().isGooglePlayServicesAvailable(context)
            result == ConnectionResult.SUCCESS
        } catch (e: Exception) {
            Log.d(NAME, "GMS not available", e)
            false
        } catch (e: NoClassDefFoundError) {
            // NoClassDefFoundError is thrown when GMS library is not included
            // This is expected in apps distributed on non-GMS stores (Amazon, Huawei AppGallery)
            Log.d(NAME, "GMS library not found", e)
            false
        }
    }

    /** Check if Huawei Mobile Services (HMS) is available */
    override fun getHasHms(): Boolean {
        return try {
            // Check if HMS Core is available - use cached packageManager
            val hmsPackageInfo = packageManager.getPackageInfo("com.huawei.hwid", 0)
            hmsPackageInfo != null
        } catch (e: PackageManager.NameNotFoundException) {
            Log.d(NAME, "HMS not available - not a Huawei device")
            false
        }
    }

    // MARK: - Android Build Information Properties

    /** Android device serial number */
    override val serialNumber: String
        get() = buildInfoCache.serialNumber

    /** Android ID (unique per device/app/user combination) */
    override val androidId: String
        get() = buildInfoCache.androidId

    /** Android security patch level */
    override val securityPatch: String
        get() = buildInfoCache.securityPatch

    /** Device bootloader version */
    override val bootloader: String
        get() = buildInfoCache.bootloader

    /** Android OS version codename */
    override val codename: String
        get() = buildInfoCache.codename

    /** Device codename */
    override val device: String
        get() = buildInfoCache.device

    /** Build display ID */
    override val display: String
        get() = buildInfoCache.display

    /** Build fingerprint */
    override val fingerprint: String
        get() = buildInfoCache.fingerprint

    /** Hardware name */
    override val hardware: String
        get() = buildInfoCache.hardware

    /** Build host */
    override val host: String
        get() = buildInfoCache.host

    /** Product name */
    override val product: String
        get() = buildInfoCache.product

    /** Build tags */
    override val tags: String
        get() = buildInfoCache.tags

    /** Build type */
    override val type: String
        get() = buildInfoCache.type

    /** Base OS version */
    override val baseOs: String
        get() = buildInfoCache.baseOs

    /** Preview SDK version */
    override val previewSdkInt: Double
        get() = buildInfoCache.previewSdkInt

    /** Incremental version */
    override val incremental: String
        get() = buildInfoCache.incremental

    /** Build ID */
    override val buildId: String
        get() = buildInfoCache.buildId

    // MARK: - Application Installation Metadata

    /** Installer package name (e.g., "com.android.vending" for Play Store) */
    override val installerPackageName: String
        get() {
            return try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                    context.packageManager.getInstallSourceInfo(context.packageName)
                        .installingPackageName
                        ?: "unknown"
                } else {
                    @Suppress("DEPRECATION")
                    context.packageManager.getInstallerPackageName(context.packageName) ?: "unknown"
                }
            } catch (e: Exception) {
                "unknown"
            }
        }

    /** Get install referrer from Google Play */
    override fun getInstallReferrer(): Promise<String> {
        return Promise.async {
            return@async suspendCancellableCoroutine { continuation ->
                val referrerClient = InstallReferrerClient.newBuilder(context).build()
                val handler = Handler(Looper.getMainLooper())

                val timeoutRunnable =
                    Runnable {
                        if (continuation.context.isActive) {
                            referrerClient.endConnection()
                            continuation.resume("unknown")
                        }
                    }

                referrerClient.startConnection(
                    object : InstallReferrerStateListener {
                        override fun onInstallReferrerSetupFinished(responseCode: Int) {
                            // Cancel timeout handler
                            handler.removeCallbacks(timeoutRunnable)

                            when (responseCode) {
                                InstallReferrerClient.InstallReferrerResponse.OK -> {
                                    try {
                                        val response = referrerClient.installReferrer
                                        val referrer = response.installReferrer ?: "unknown"
                                        referrerClient.endConnection()
                                        continuation.resume(referrer)
                                    } catch (e: Exception) {
                                        referrerClient.endConnection()
                                        continuation.resume("unknown")
                                    }
                                }
                                else -> {
                                    referrerClient.endConnection()
                                    continuation.resume("unknown")
                                }
                            }
                        }

                        override fun onInstallReferrerServiceDisconnected() {
                            // Cancel timeout handler
                            handler.removeCallbacks(timeoutRunnable)
                            continuation.resume("unknown")
                        }
                    },
                )

                // Timeout after 5 seconds
                handler.postDelayed(timeoutRunnable, 5000)
            }
        }
    }

    /** Device boot time in milliseconds since epoch */
    override val startupTime: Double
        get() {
            val bootTime = System.currentTimeMillis() - SystemClock.elapsedRealtime()
            return bootTime.toDouble()
        }

    /** Readable version string (version.build) */
    override val readableVersion: String
        get() = "$version.$buildNumber"

    /** First install time in milliseconds since epoch */
    override val firstInstallTimeSync: Double
        get() = packageInfo.firstInstallTime.toDouble()

    /** Last update time in milliseconds since epoch */
    override val lastUpdateTimeSync: Double
        get() = packageInfo.lastUpdateTime.toDouble()

    // MARK: - Device Capability Detection

    /** Check if wired headphones are connected */
    override fun getIsWiredHeadphonesConnected(): Boolean {
        return try {
            val audioDevices = audioManager.getDevices(AudioManager.GET_DEVICES_OUTPUTS)
            audioDevices.any { device ->
                device.type == AudioDeviceInfo.TYPE_WIRED_HEADPHONES ||
                    device.type == AudioDeviceInfo.TYPE_WIRED_HEADSET ||
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        device.type == AudioDeviceInfo.TYPE_USB_HEADSET
                    } else {
                        true
                    }
            }
        } catch (e: Exception) {
            false
        }
    }

    /** Check if Bluetooth headphones are connected */
    override fun getIsBluetoothHeadphonesConnected(): Boolean {
        return try {
            val audioDevices = audioManager.getDevices(AudioManager.GET_DEVICES_OUTPUTS)
            audioDevices.any { device ->
                device.type == AudioDeviceInfo.TYPE_BLUETOOTH_A2DP ||
                    device.type == AudioDeviceInfo.TYPE_BLUETOOTH_SCO
            }
        } catch (e: Exception) {
            false
        }
    }

    /** Check if airplane mode is enabled */
    override fun getIsAirplaneMode(): Boolean {
        return try {
            Settings.Global.getInt(
                context.contentResolver,
                Settings.Global.AIRPLANE_MODE_ON,
                0,
            ) != 0
        } catch (e: Exception) {
            false
        }
    }

    /** Check if device is low RAM device */
    override val isLowRamDevice: Boolean
        get() = activityManager.isLowRamDevice

    /** Check if mouse is connected (Windows-specific, returns false on Android) */
    override val isMouseConnected: Boolean
        get() = false

    /** Check if keyboard is connected (Windows-specific, returns false on Android) */
    override val isKeyboardConnected: Boolean
        get() = false

    /** Check if device is in landscape orientation */
    override fun getIsLandscape(): Boolean {
        val orientation = context.resources.configuration.orientation
        return orientation == Configuration.ORIENTATION_LANDSCAPE
    }

    // MARK: - Advanced System Information

    /** Get supported 32-bit ABIs */
    override val supported32BitAbis: Array<String>
        get() = Build.SUPPORTED_32_BIT_ABIS.toList().toTypedArray()

    /** Get supported 64-bit ABIs */
    override val supported64BitAbis: Array<String>
        get() = Build.SUPPORTED_64_BIT_ABIS.toList().toTypedArray()

    /** Get system font scale */
    override fun getFontScale(): Double = context.resources.configuration.fontScale.toDouble()

    /** Check if system has a specific feature */
    override fun hasSystemFeature(feature: String): Boolean {
        return try {
            context.packageManager.hasSystemFeature(feature)
        } catch (e: Exception) {
            false
        }
    }

    /** Get list of all system features */
    override val systemAvailableFeatures: Array<String>
        get() = systemFeatures.toTypedArray()

    /** Get list of enabled location providers */
    override fun getAvailableLocationProviders(): Array<String> {
        return try {
            val locationManager =
                context.getSystemService(Context.LOCATION_SERVICE) as LocationManager

            locationManager
                .allProviders
                .filter { locationManager.isProviderEnabled(it) }
                .toTypedArray()
        } catch (e: Exception) {
            emptyArray()
        }
    }

    /** Get host names (Windows-specific, not available on Android) */
    override val hostNames: Array<String>
        get() = arrayOf()

    /** Get maximum memory available to the app */
    override val maxMemory: Double
        get() = Runtime.getRuntime().maxMemory().toDouble()

    // MARK: - Network & Display Information

    /** Get WebView user agent string */
    override fun getUserAgent(): Promise<String> {
        return Promise.async {
            return@async try {
                WebSettings.getDefaultUserAgent(context)
            } catch (e: Exception) {
                "unknown"
            }
        }
    }

    /** Get device name */
    override val deviceName: String
        get() {
            return try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N_MR1) {
                    Settings.Global.getString(context.contentResolver, Settings.Global.DEVICE_NAME)
                        ?: Settings.Secure.getString(context.contentResolver, "bluetooth_name")
                        ?: "unknown"
                } else {
                    Settings.Secure.getString(context.contentResolver, "bluetooth_name")
                        ?: "unknown"
                }
            } catch (e: Exception) {
                "unknown"
            }
        }

    /** Get device token (iOS-specific, throws error on Android) */
    override fun getDeviceToken(): Promise<String> {
        return Promise.async { throw Exception("getDeviceToken() is only available on iOS") }
    }

    /** Get IP address with 5-second cache */
    override fun getIpAddressSync(): String {
        val now = System.currentTimeMillis()
        if (now - ipAddressCacheTime > ipCacheDurationMs) {
            cachedIpAddress = queryIpAddressInternal()
            ipAddressCacheTime = now
        }
        return cachedIpAddress
    }

    /** Query IP address from network interfaces */
    private fun queryIpAddressInternal(): String {
        return try {
            val interfaces = NetworkInterface.getNetworkInterfaces()
            for (intf in interfaces) {
                val addrs = intf.inetAddresses
                for (addr in addrs) {
                    if (!addr.isLoopbackAddress && addr is Inet4Address) {
                        return addr.hostAddress ?: "unknown"
                    }
                }
            }
            "unknown"
        } catch (e: Exception) {
            "unknown"
        }
    }

    /** Get MAC address with 5-second cache */
    override fun getMacAddressSync(): String {
        val now = System.currentTimeMillis()
        if (now - macAddressCacheTime > ipCacheDurationMs) {
            cachedMacAddress = queryMacAddressInternal()
            macAddressCacheTime = now
        }
        return cachedMacAddress
    }

    /** Query MAC address from network interfaces */
    private fun queryMacAddressInternal(): String {
        return try {
            val interfaces = NetworkInterface.getNetworkInterfaces()
            for (intf in interfaces) {
                if (intf.name.equals("wlan0", ignoreCase = true)) {
                    val mac = intf.hardwareAddress ?: continue
                    return mac.joinToString(":") { "%02X".format(it) }
                }
            }
            "unknown"
        } catch (e: Exception) {
            "unknown"
        }
    }

    /** Get carrier name with 5-second cache */
    override fun getCarrierSync(): String {
        val now = System.currentTimeMillis()
        if (now - carrierCacheTime > ipCacheDurationMs) {
            val telephonyManager =
                context.getSystemService(Context.TELEPHONY_SERVICE) as? TelephonyManager
            cachedCarrier = telephonyManager?.networkOperatorName ?: "unknown"
            carrierCacheTime = now
        }
        return cachedCarrier
    }

    /** Check if location services are enabled */
    override fun getIsLocationEnabled(): Boolean {
        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                val locationManager =
                    context.getSystemService(Context.LOCATION_SERVICE) as LocationManager
                locationManager.isLocationEnabled
            } else {
                val mode =
                    Settings.Secure.getInt(
                        context.contentResolver,
                        Settings.Secure.LOCATION_MODE,
                        Settings.Secure.LOCATION_MODE_OFF,
                    )
                mode != Settings.Secure.LOCATION_MODE_OFF
            }
        } catch (e: Exception) {
            false
        }
    }

    /** Check if any headphones are connected */
    override fun getIsHeadphonesConnected(): Boolean = getIsWiredHeadphonesConnected() || getIsBluetoothHeadphonesConnected()

    override val isLiquidGlassAvailable: Boolean = false

    /**
     * Check if hardware-backed key storage is available Android KeyStore is always hardware-backed
     * on API 23+ (TEE or StrongBox)
     */
    override val isHardwareKeyStoreAvailable: Boolean
        get() {
            return try {
                // AndroidKeyStore provider existence indicates hardware-backed storage
                KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
                true
            } catch (e: Exception) {
                Log.w(NAME, "AndroidKeyStore not available", e)
                false
            }
        }

    // MARK: - iOS-Specific Features

    /** Check if display is zoomed (iOS-specific, returns false on Android) */
    override val isDisplayZoomed: Boolean
        get() = false

    /** Get screen brightness (iOS-specific, returns -1 on Android) */
    override fun getBrightness(): Double = -1.0

    /** Get unique ID from Keychain (iOS-specific, returns device ID on Android) */
    override fun syncUniqueId(): Promise<String> {
        return Promise.async {
            return@async uniqueId
        }
    }

    // MARK: - Media & Battery Helpers

    /** Get list of supported media types/codecs */
    override val supportedMediaTypeList: Array<String>
        get() = supportedMediaTypes.toTypedArray()

    /** Check if battery level is below threshold */
    override fun isLowBatteryLevel(threshold: Double): Boolean {
        return getBatteryLevel() < threshold
    }

    /** Check if device is in tablet mode (Windows-specific, returns false on Android) */
    override val isTabletMode: Boolean
        get() = false

    /** Get total disk capacity using old API (for legacy compatibility) */
    override val totalDiskCapacityOld: Double
        get() {
            return try {
                val stat = StatFs(Environment.getDataDirectory().path)
                stat.blockCountLong * stat.blockSizeLong.toDouble()
            } catch (e: Exception) {
                -1.0
            }
        }

    /** Get free disk storage using old API (for legacy compatibility) */
    override fun getFreeDiskStorageOld(): Double {
        return try {
            val stat = StatFs(Environment.getDataDirectory().path)
            stat.availableBlocksLong * stat.blockSizeLong.toDouble()
        } catch (e: Exception) {
            -1.0
        }
    }

    // MARK: - Localization & Navigation

    /** Get device system language in BCP 47 format */
    override val systemLanguage: String
        get() = Locale.getDefault().toLanguageTag()

    /** Get Android navigation mode Values: 0 = 3-button, 1 = 2-button, 2 = gesture */
    override val navigationMode: NavigationMode
        get() {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
                // Pre-Android 10 only has 3-button navigation
                return NavigationMode.BUTTONS
            }
            return try {
                when (Settings.Secure.getInt(context.contentResolver, "navigation_mode", 0)) {
                    0 -> NavigationMode.BUTTONS // 3-button navigation
                    1 -> NavigationMode.TWOBUTTONS // 2-button navigation
                    2 -> NavigationMode.GESTURE // Gesture navigation
                    else -> NavigationMode.UNKNOWN
                }
            } catch (e: Exception) {
                Log.w(NAME, "Failed to get navigation mode", e)
                NavigationMode.UNKNOWN
            }
        }

    // MARK: - Device Integrity / Security

    /**
     * Synchronously checks for root status
     *
     * Always returns false on emulator for development convenience.
     * Uses multiple detection methods to identify root status.
     */
    override fun isDeviceCompromised(): Boolean {
        // Emulator exception - for development convenience
        if (isEmulator) {
            return false
        }

        return checkSuBinaries() ||
            checkMagisk() ||
            checkKernelSU() ||
            checkAPatch() ||
            checkBusybox() ||
            checkBuildProps() ||
            checkSuperuserApps()
    }

    /**
     * Asynchronous wrapper for device integrity verification
     *
     * Currently identical to isDeviceCompromised() but wrapped in a Promise.
     * Provided for API consistency with iOS and for future extensibility.
     */
    override fun verifyDeviceIntegrity(): Promise<Boolean> {
        return Promise.async {
            isDeviceCompromised()
        }
    }

    // MARK: - Root Detection Helpers

    /**
     * Checks su binary paths
     */
    private fun checkSuBinaries(): Boolean {
        return SU_PATHS.any { path ->
            java.io.File(path).exists()
        }
    }

    /**
     * Detects Magisk
     */
    private fun checkMagisk(): Boolean {
        if (MAGISK_PATHS.any { java.io.File(it).exists() }) {
            return true
        }
        return isAnyPackageInstalled(MAGISK_PACKAGES)
    }

    /**
     * Detects KernelSU
     */
    private fun checkKernelSU(): Boolean {
        if (KERNELSU_PATHS.any { java.io.File(it).exists() }) {
            return true
        }
        return isAnyPackageInstalled(KERNELSU_PACKAGES)
    }

    /**
     * Detects APatch
     */
    private fun checkAPatch(): Boolean {
        if (APATCH_PATHS.any { java.io.File(it).exists() }) {
            return true
        }
        return isAnyPackageInstalled(APATCH_PACKAGES)
    }

    /**
     * Checks for Busybox
     */
    private fun checkBusybox(): Boolean {
        return BUSYBOX_PATHS.any { java.io.File(it).exists() }
    }

    /**
     * Helper to check if any package from a list is installed
     */
    private fun isAnyPackageInstalled(packages: List<String>): Boolean {
        return packages.any { pkg ->
            try {
                packageManager.getPackageInfo(pkg, 0)
                true
            } catch (e: PackageManager.NameNotFoundException) {
                false
            }
        }
    }

    /**
     * Checks build props
     *
     * Uses Runtime.exec("getprop") for maximum compatibility across Android versions
     * and manufacturer customizations. SystemProperties reflection was considered but
     * rejected due to Hidden API restrictions in Android 9+ (API 28).
     */
    private fun checkBuildProps(): Boolean {
        // Check debug build
        val debuggable = getSystemProp("ro.debuggable") == "1"

        // Check security settings
        val notSecure = getSystemProp("ro.secure") == "0"

        // Check build tags
        val testKeys = Build.TAGS?.contains("test-keys") == true

        return debuggable || notSecure || testKeys
    }

    /**
     * Gets system property via getprop command with proper resource cleanup
     */
    private fun getSystemProp(key: String): String? {
        var process: Process? = null
        return try {
            process = Runtime.getRuntime().exec("getprop $key")
            process.inputStream.bufferedReader().use { reader ->
                reader.readLine()
            }
        } catch (e: Exception) {
            null
        } finally {
            process?.destroy()
        }
    }

    /**
     * Checks for Superuser apps (legacy)
     */
    private fun checkSuperuserApps(): Boolean {
        return SUPERUSER_PATHS.any { java.io.File(it).exists() }
    }

    companion object {
        const val NAME = "NitroDeviceInfo"

        // Root detection constant paths (moved here to avoid repeated memory allocation)
        private val SU_PATHS = listOf(
            "/system/xbin/su",
            "/system/bin/su",
            "/sbin/su",
            "/su/bin/su",
            "/data/local/xbin/su",
            "/data/local/bin/su",
            "/data/local/su",
            "/system/sd/xbin/su",
            "/system/bin/failsafe/su",
            "/system/bin/.ext/.su",
            "/system/usr/we-need-root/su-backup",
            "/system/xbin/mu"
        )

        private val MAGISK_PATHS = listOf(
            "/data/adb/magisk",
            "/data/adb/magisk.db",
            "/data/adb/magisk.img",
            "/cache/.disable_magisk",
            "/sbin/.magisk",
            "/sbin/.core",
            "/dev/.magisk.unblock"
        )

        private val MAGISK_PACKAGES = listOf(
            "com.topjohnwu.magisk",
            "io.github.vvb2060.magisk",  // Magisk Delta
            "com.kingroot.kinguser",
            "com.kingo.root",
            "com.noshufou.android.su",
            "eu.chainfire.supersu",
            "com.koushikdutta.superuser",
            "com.thirdparty.superuser",
            "com.yellowes.su"
        )

        private val KERNELSU_PATHS = listOf(
            "/data/adb/ksu",
            "/data/adb/ksud",
            "/data/adb/ksu/modules"
        )

        private val KERNELSU_PACKAGES = listOf(
            "me.weishu.kernelsu",
            "com.topjohnwu.magisk.ksu"  // KernelSU Manager
        )

        private val APATCH_PATHS = listOf(
            "/data/adb/apatch",
            "/data/adb/ap",
            "/data/adb/apd"
        )

        private val APATCH_PACKAGES = listOf(
            "me.bmax.apatch"
        )

        private val BUSYBOX_PATHS = listOf(
            "/system/xbin/busybox",
            "/system/bin/busybox",
            "/sbin/busybox",
            "/su/bin/busybox",
            "/data/local/xbin/busybox"
        )

        private val SUPERUSER_PATHS = listOf(
            "/system/app/Superuser.apk",
            "/system/app/SuperSU.apk",
            "/system/app/SuperSU/SuperSU.apk"
        )
    }
}
