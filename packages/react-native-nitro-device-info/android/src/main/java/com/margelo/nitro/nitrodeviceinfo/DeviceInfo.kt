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

private data class BuildInfoCache(
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

@SuppressLint("HardwareIds")
@DoNotStrip
class DeviceInfo : HybridDeviceInfoSpec() {
    // Private Properties & Caches

    private val context: Context
        get() {
            return NitroModules.applicationContext
                ?: throw RuntimeException("React context not available")
        }

    private val activityManager: ActivityManager by lazy {
        context.getSystemService<ActivityManager>() as ActivityManager
    }

    private val packageManager: PackageManager by lazy { context.packageManager }

    private val packageInfo: PackageInfo by lazy {
        try {
            packageManager.getPackageInfo(context.packageName, 0)
        } catch (e: PackageManager.NameNotFoundException) {
            throw RuntimeException("Package not found: ${context.packageName}", e)
        }
    }

    private val batteryManager: BatteryManager by lazy {
        context.getSystemService<BatteryManager>() as BatteryManager
    }

    private val audioManager: AudioManager by lazy {
        context.getSystemService<AudioManager>() as AudioManager
    }

    private val carrierTelephonyManager: TelephonyManager? by lazy {
        context.getSystemService(Context.TELEPHONY_SERVICE) as? TelephonyManager
    }

    @SuppressLint("MissingPermission")
    private fun getSerialNumberInternal(): String {
        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                if (context.checkSelfPermission(android.Manifest.permission.READ_PHONE_STATE) ==
                    PackageManager.PERMISSION_GRANTED
                ) {
                    Build.getSerial()
                } else {
                    "unknown"
                }
            } else {
                @Suppress("DEPRECATION")
                Build.SERIAL
            }
        } catch (e: SecurityException) {
            "unknown"
        }
    }

    // Identifiers stay out of buildInfoCache so reading build fields never reads them.
    private val cachedSerialNumber: String by lazy { getSerialNumberInternal() }

    private val cachedAndroidId: String by lazy {
        Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID) ?: "unknown"
    }

    private val buildInfoCache: BuildInfoCache by lazy {
        BuildInfoCache(
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

    private val systemFeatures: List<String> by lazy {
        context.packageManager.systemAvailableFeatures.mapNotNull { it.name }.sorted()
    }

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

    private val ipCacheDurationMs = 5000L
    private var cachedIpAddress: String = "unknown"
    private var ipAddressCacheTime: Long = 0
    private var cachedMacAddress: String = "unknown"
    private var macAddressCacheTime: Long = 0
    private var cachedCarrier: String = "unknown"
    private var carrierCacheTime: Long = 0

    override val deviceYearClass: Double by lazy {
        calculateYearClass().toDouble()
    }

    // Core Device Information

    override val deviceId: String
        get() = Build.MODEL

    override val brand: String
        get() = Build.BRAND

    override val model: String
        get() = Build.DEVICE

    override val systemName: String
        get() = "Android"

    override val systemVersion: String
        get() = Build.VERSION.RELEASE

    override val deviceType: DeviceType
        get() {
            val uiMode = context.resources.configuration.uiMode

            if ((uiMode and Configuration.UI_MODE_TYPE_MASK) ==
                Configuration.UI_MODE_TYPE_TELEVISION
            ) {
                return DeviceType.TV
            }

            val smallestScreenWidthDp = context.resources.configuration.smallestScreenWidthDp
            return if (smallestScreenWidthDp >= 600) {
                DeviceType.TABLET
            } else {
                DeviceType.HANDSET
            }
        }

    override val uniqueId: String
        get() = Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID) ?: ""

    override val manufacturer: String
        get() = Build.MANUFACTURER

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

    // Device Capabilities

    override val isTablet: Boolean
        get() {
            val smallestScreenWidthDp = context.resources.configuration.smallestScreenWidthDp
            return smallestScreenWidthDp >= 600
        }

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

    override val isCameraPresent: Boolean
        get() = packageManager.hasSystemFeature(PackageManager.FEATURE_CAMERA_ANY)

    override val isPinOrFingerprintSet: Boolean
        get() {
            val keyguardManager = context.getSystemService<KeyguardManager>()
            return keyguardManager?.isKeyguardSecure == true
        }

    override val isHardwareKeyStoreAvailable: Boolean
        get() {
            return try {
                KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
                true
            } catch (e: Exception) {
                Log.w(NAME, "AndroidKeyStore not available", e)
                false
            }
        }

    override val isLowRamDevice: Boolean
        get() = activityManager.isLowRamDevice

    // Display & Screen

    override fun getHasNotch(): Boolean = false

    override fun getHasDynamicIsland(): Boolean = false

    override val isDisplayZoomed: Boolean
        get() = false

    override fun getIsLandscape(): Boolean {
        val orientation = context.resources.configuration.orientation
        return orientation == Configuration.ORIENTATION_LANDSCAPE
    }

    override fun getBrightness(): Double = -1.0

    override fun getFontScale(): Double = context.resources.configuration.fontScale.toDouble()

    override val isLiquidGlassAvailable: Boolean = false

    // System Resources

    override val totalMemory: Double
        get() {
            val memInfo = ActivityManager.MemoryInfo()
            activityManager.getMemoryInfo(memInfo)
            return memInfo.totalMem.toDouble()
        }

    override fun getUsedMemory(): Double {
        val memInfo = Debug.MemoryInfo()
        Debug.getMemoryInfo(memInfo)
        return (memInfo.totalPss * 1024).toDouble()
    }

    override val maxMemory: Double
        get() = Runtime.getRuntime().maxMemory().toDouble()

    override val totalDiskCapacity: Double
        get() {
            val path = Environment.getDataDirectory()
            val stat = StatFs(path.path)
            return (stat.blockCountLong * stat.blockSizeLong).toDouble()
        }

    override fun getFreeDiskStorage(): Double {
        val path = Environment.getDataDirectory()
        val stat = StatFs(path.path)
        return (stat.availableBlocksLong * stat.blockSizeLong).toDouble()
    }

    override fun getUptime(): Double {
        return SystemClock.uptimeMillis().toDouble()
    }

    override val startupTime: Double
        get() {
            val bootTime = System.currentTimeMillis() - SystemClock.elapsedRealtime()
            return bootTime.toDouble()
        }

    // Battery & Power

    override fun getBatteryLevel(): Double {
        val level = batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
        return if (level in 0..100) level / 100.0 else -1.0
    }

    override fun getPowerState(): PowerState {
        val level = getBatteryLevel()
        val isCharging = batteryManager.isCharging

        val batteryState =
            when {
                batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_STATUS) ==
                    BatteryManager.BATTERY_STATUS_FULL -> BatteryState.FULL
                isCharging -> BatteryState.CHARGING
                else -> BatteryState.UNPLUGGED
            }

        return PowerState(
            batteryLevel = level,
            batteryState = batteryState,
            lowPowerMode = false,
        )
    }

    override fun getIsBatteryCharging(): Boolean {
        return batteryManager.isCharging
    }

    override fun isLowBatteryLevel(threshold: Double): Boolean {
        val level = getBatteryLevel()
        return level >= 0 && level <= 1 && level < threshold
    }

    // Application Metadata

    override val version: String
        get() = packageInfo.versionName ?: ""

    override val buildNumber: String
        get() {
            return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                packageInfo.longVersionCode.toString()
            } else {
                @Suppress("DEPRECATION")
                packageInfo.versionCode.toString()
            }
        }

    override val bundleId: String
        get() = context.packageName

    override val applicationName: String
        get() {
            val appInfo = context.applicationInfo
            return packageManager.getApplicationLabel(appInfo).toString()
        }

    override val readableVersion: String
        get() = "$version.$buildNumber"

    override fun getFirstInstallTime(): Promise<Double> {
        return Promise.async {
            packageInfo.firstInstallTime.toDouble()
        }
    }

    override fun getLastUpdateTime(): Promise<Double> {
        return Promise.async {
            packageInfo.lastUpdateTime.toDouble()
        }
    }

    override val firstInstallTimeSync: Double
        get() = packageInfo.firstInstallTime.toDouble()

    override val lastUpdateTimeSync: Double
        get() = packageInfo.lastUpdateTime.toDouble()

    // Network

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

    override fun getIpAddressSync(): String {
        val now = System.currentTimeMillis()
        if (now - ipAddressCacheTime > ipCacheDurationMs) {
            cachedIpAddress = queryIpAddressInternal()
            ipAddressCacheTime = now
        }
        return cachedIpAddress
    }

    override fun getMacAddress(): Promise<String> {
        return Promise.async { getMacAddressSync() }
    }

    override fun getMacAddressSync(): String {
        val now = System.currentTimeMillis()
        if (now - macAddressCacheTime > ipCacheDurationMs) {
            cachedMacAddress = queryMacAddressInternal()
            macAddressCacheTime = now
        }
        return cachedMacAddress
    }

    override fun getUserAgent(): Promise<String> {
        return Promise.async {
            return@async try {
                WebSettings.getDefaultUserAgent(context)
            } catch (e: Exception) {
                "unknown"
            }
        }
    }

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

    // Carrier Information

    override fun getCarrier(): Promise<String> {
        return Promise.async {
            val telephonyManager = context.getSystemService<TelephonyManager>()
            telephonyManager?.networkOperatorName.orEmpty()
        }
    }

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

    override val carrierAllowsVOIP: Boolean
        get() = true

    override val carrierIsoCountryCode: String
        get() = carrierTelephonyManager?.simCountryIso?.uppercase() ?: ""

    override val mobileCountryCode: String
        get() {
            val operator = carrierTelephonyManager?.simOperator
            if (operator.isNullOrEmpty() || operator.length < 3) {
                return ""
            }
            return operator.substring(0, 3)
        }

    override val mobileNetworkCode: String
        get() {
            val operator = carrierTelephonyManager?.simOperator
            if (operator.isNullOrEmpty() || operator.length < 5) {
                return ""
            }
            return operator.substring(3)
        }

    override val mobileNetworkOperator: String
        get() = carrierTelephonyManager?.simOperator ?: ""

    // Audio Accessories

    override fun isHeadphonesConnected(): Promise<Boolean> {
        return Promise.async { getIsHeadphonesConnected() }
    }

    override fun getIsHeadphonesConnected(): Boolean = getIsWiredHeadphonesConnected() || getIsBluetoothHeadphonesConnected()

    override fun getIsWiredHeadphonesConnected(): Boolean {
        return try {
            val audioDevices = audioManager.getDevices(AudioManager.GET_DEVICES_OUTPUTS)
            audioDevices.any { device ->
                device.type == AudioDeviceInfo.TYPE_WIRED_HEADPHONES ||
                    device.type == AudioDeviceInfo.TYPE_WIRED_HEADSET ||
                    (
                        Build.VERSION.SDK_INT >= Build.VERSION_CODES.O &&
                            device.type == AudioDeviceInfo.TYPE_USB_HEADSET
                    )
            }
        } catch (e: Exception) {
            false
        }
    }

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

    // Location Services

    override fun isLocationEnabled(): Promise<Boolean> {
        return Promise.async {
            val locationManager = context.getSystemService<LocationManager>()
            locationManager?.isProviderEnabled(LocationManager.GPS_PROVIDER) == true ||
                locationManager?.isProviderEnabled(LocationManager.NETWORK_PROVIDER) == true
        }
    }

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

    // Localization

    override val systemLanguage: String
        get() = Locale.getDefault().toLanguageTag()

    // CPU & Architecture

    override val supportedAbis: Array<String>
        get() = Build.SUPPORTED_ABIS

    override val supported32BitAbis: Array<String>
        get() = Build.SUPPORTED_32_BIT_ABIS.toList().toTypedArray()

    override val supported64BitAbis: Array<String>
        get() = Build.SUPPORTED_64_BIT_ABIS.toList().toTypedArray()

    // Android Platform

    override val apiLevel: Double
        get() = Build.VERSION.SDK_INT.toDouble()

    override val navigationMode: NavigationMode
        get() {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
                return NavigationMode.BUTTONS
            }
            return try {
                when (Settings.Secure.getInt(context.contentResolver, "navigation_mode", 0)) {
                    0 -> NavigationMode.BUTTONS
                    1 -> NavigationMode.TWOBUTTONS
                    2 -> NavigationMode.GESTURE
                    else -> NavigationMode.UNKNOWN
                }
            } catch (e: Exception) {
                Log.w(NAME, "Failed to get navigation mode", e)
                NavigationMode.UNKNOWN
            }
        }

    override fun getHasGms(): Boolean {
        return try {
            val result =
                GoogleApiAvailability.getInstance().isGooglePlayServicesAvailable(context)
            result == ConnectionResult.SUCCESS
        } catch (e: Exception) {
            Log.d(NAME, "GMS not available", e)
            false
        } catch (e: NoClassDefFoundError) {
            Log.d(NAME, "GMS library not found", e)
            false
        }
    }

    override fun getHasHms(): Boolean {
        return try {
            val hmsPackageInfo = packageManager.getPackageInfo("com.huawei.hwid", 0)
            hmsPackageInfo != null
        } catch (e: PackageManager.NameNotFoundException) {
            Log.d(NAME, "HMS not available - not a Huawei device")
            false
        }
    }

    override fun hasSystemFeature(feature: String): Boolean {
        return try {
            context.packageManager.hasSystemFeature(feature)
        } catch (e: Exception) {
            false
        }
    }

    override val systemAvailableFeatures: Array<String>
        get() = systemFeatures.toTypedArray()

    override val supportedMediaTypeList: Array<String>
        get() = supportedMediaTypes.toTypedArray()

    // Android Build Information

    override val serialNumber: String
        get() = cachedSerialNumber

    /** Android ID (unique per device/app/user combination) */
    override val androidId: String
        get() = cachedAndroidId

    override val previewSdkInt: Double
        get() = buildInfoCache.previewSdkInt

    override val securityPatch: String
        get() = buildInfoCache.securityPatch

    override val codename: String
        get() = buildInfoCache.codename

    override val incremental: String
        get() = buildInfoCache.incremental

    override val board: String
        get() = Build.BOARD

    override val bootloader: String
        get() = buildInfoCache.bootloader

    override val device: String
        get() = buildInfoCache.device

    override val display: String
        get() = buildInfoCache.display

    override val fingerprint: String
        get() = buildInfoCache.fingerprint

    override val hardware: String
        get() = buildInfoCache.hardware

    override val host: String
        get() = buildInfoCache.host

    override val product: String
        get() = buildInfoCache.product

    override val tags: String
        get() = buildInfoCache.tags

    override val type: String
        get() = buildInfoCache.type

    override val baseOs: String
        get() = buildInfoCache.baseOs

    override val radioVersion: String
        get() = Build.getRadioVersion() ?: "unknown"

    override val buildId: String
        get() = buildInfoCache.buildId

    // iOS Platform

    override fun getDeviceToken(): Promise<String> {
        return Promise.async { throw Exception("getDeviceToken() is only available on iOS") }
    }

    override fun syncUniqueId(): Promise<String> {
        return Promise.async {
            return@async uniqueId
        }
    }

    // Installation & Distribution

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
                            handler.removeCallbacks(timeoutRunnable)
                            continuation.resume("unknown")
                        }
                    },
                )

                handler.postDelayed(timeoutRunnable, 5000)
            }
        }
    }

    override fun isSideLoadingEnabled(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.packageManager.canRequestPackageInstalls()
        } else {
            runCatching {
                @Suppress("DEPRECATION")
                Settings.Global.getInt(
                    context.contentResolver,
                    Settings.Global.INSTALL_NON_MARKET_APPS,
                    0,
                ) == 1
            }.getOrElse { false }
        }
    }

    // Legacy Compatibility

    override val totalDiskCapacityOld: Double
        get() {
            return try {
                val stat = StatFs(Environment.getDataDirectory().path)
                stat.blockCountLong * stat.blockSizeLong.toDouble()
            } catch (e: Exception) {
                -1.0
            }
        }

    override fun getFreeDiskStorageOld(): Double {
        return try {
            val stat = StatFs(Environment.getDataDirectory().path)
            stat.availableBlocksLong * stat.blockSizeLong.toDouble()
        } catch (e: Exception) {
            -1.0
        }
    }

    // Device Integrity / Security

    override fun isDeviceCompromised(): Boolean {
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

    override fun verifyDeviceIntegrity(): Promise<Boolean> {
        return Promise.async {
            isDeviceCompromised()
        }
    }

    // Windows Platform (Unsupported)

    override val isMouseConnected: Boolean
        get() = false

    override val isKeyboardConnected: Boolean
        get() = false

    override val hostNames: Array<String>
        get() = arrayOf()

    override val isTabletMode: Boolean
        get() = false

    // Helper Methods

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

    // Year Class Calculation

    /** Calculate year class using extended 2025 algorithm */
    private fun calculateYearClass(): Int {
        val totalRam = getTotalMemoryBytes()
        if (totalRam <= 0) {
            return calculateYearClassFallback()
        }

        return when {
            totalRam <= 768 * MB -> if (getCpuCoreCount() <= 1) 2009 else 2010
            totalRam <= 1 * GB -> if (getCpuMaxFreqKHzSafe() < 1300 * MHZ_IN_KHZ) 2011 else 2012
            totalRam <= 1536 * MB -> if (getCpuMaxFreqKHzSafe() < 1800 * MHZ_IN_KHZ) 2012 else 2013
            totalRam <= 2 * GB -> 2013
            totalRam <= 3 * GB -> 2014
            totalRam <= 4 * GB -> 2015
            totalRam <= 6 * GB -> 2017
            totalRam <= 8 * GB -> 2019
            totalRam <= 12 * GB -> 2021
            totalRam <= 16 * GB -> 2023
            else -> 2025
        }
    }

    /** Fallback method using median of component years */
    private fun calculateYearClassFallback(): Int {
        val years = mutableListOf<Int>()

        getCpuCoresYear().takeIf { it != -1 }?.let { years.add(it) }
        getCpuFreqYear().takeIf { it != -1 }?.let { years.add(it) }
        getRamYear().takeIf { it != -1 }?.let { years.add(it) }

        if (years.isEmpty()) return -1

        years.sort()
        return if (years.size % 2 == 1) {
            years[years.size / 2]
        } else {
            val baseIndex = years.size / 2 - 1
            years[baseIndex] + (years[baseIndex + 1] - years[baseIndex]) / 2
        }
    }

    private fun getCpuCoreCount(): Int {
        val runtimeCores = Runtime.getRuntime().availableProcessors()
        if (runtimeCores > 0) return runtimeCores

        return runCatching {
            val possibleFile = java.io.File("/sys/devices/system/cpu/possible")
            if (possibleFile.exists() && possibleFile.canRead()) {
                val content = possibleFile.readText().trim()
                if (content.matches(Regex("0-\\d+"))) {
                    return content.substring(2).toInt() + 1
                }
            }
            runtimeCores.coerceAtLeast(1)
        }.getOrElse { runtimeCores.coerceAtLeast(1) }
    }

    private fun getCpuMaxFreqKHzSafe(): Int {
        return runCatching {
            var maxFreq = -1
            val coreCount = getCpuCoreCount()

            for (i in 0 until coreCount) {
                val file = java.io.File("/sys/devices/system/cpu/cpu$i/cpufreq/cpuinfo_max_freq")
                if (file.exists() && file.canRead()) {
                    val freq = file.readText().trim().toIntOrNull()
                    if (freq != null && freq > maxFreq) {
                        maxFreq = freq
                    }
                }
            }
            maxFreq
        }.getOrElse { -1 }
    }

    private fun getTotalMemoryBytes(): Long {
        return runCatching {
            val memInfo = ActivityManager.MemoryInfo()
            activityManager.getMemoryInfo(memInfo)
            memInfo.totalMem
        }.getOrElse { -1L }
    }

    private fun getCpuCoresYear(): Int {
        val cores = getCpuCoreCount()
        return when {
            cores < 1 -> -1
            cores == 1 -> 2008
            cores <= 3 -> 2011
            cores <= 5 -> 2012
            cores <= 7 -> 2015
            else -> 2018
        }
    }

    private fun getCpuFreqYear(): Int {
        val freqKHz = getCpuMaxFreqKHzSafe()
        if (freqKHz <= 0) return -1
        return when {
            freqKHz <= 528 * MHZ_IN_KHZ -> 2008
            freqKHz <= 620 * MHZ_IN_KHZ -> 2009
            freqKHz <= 1020 * MHZ_IN_KHZ -> 2010
            freqKHz <= 1220 * MHZ_IN_KHZ -> 2011
            freqKHz <= 1520 * MHZ_IN_KHZ -> 2012
            freqKHz <= 2020 * MHZ_IN_KHZ -> 2013
            freqKHz <= 2500 * MHZ_IN_KHZ -> 2015
            freqKHz <= 3000 * MHZ_IN_KHZ -> 2018
            else -> 2021
        }
    }

    private fun getRamYear(): Int {
        val totalRam = getTotalMemoryBytes()
        if (totalRam <= 0) return -1
        return when {
            totalRam <= 192 * MB -> 2008
            totalRam <= 290 * MB -> 2009
            totalRam <= 512 * MB -> 2010
            totalRam <= 1 * GB -> 2011
            totalRam <= 1536 * MB -> 2012
            totalRam <= 2 * GB -> 2013
            totalRam <= 3 * GB -> 2014
            totalRam <= 4 * GB -> 2015
            totalRam <= 6 * GB -> 2017
            totalRam <= 8 * GB -> 2019
            totalRam <= 12 * GB -> 2021
            totalRam <= 16 * GB -> 2023
            else -> 2025
        }
    }

    // Root Detection Helpers

    private fun checkSuBinaries(): Boolean {
        return SU_PATHS.any { path ->
            java.io.File(path).exists()
        }
    }

    private fun checkMagisk(): Boolean {
        if (MAGISK_PATHS.any { java.io.File(it).exists() }) {
            return true
        }
        return isAnyPackageInstalled(MAGISK_PACKAGES)
    }

    private fun checkKernelSU(): Boolean {
        if (KERNELSU_PATHS.any { java.io.File(it).exists() }) {
            return true
        }
        return isAnyPackageInstalled(KERNELSU_PACKAGES)
    }

    private fun checkAPatch(): Boolean {
        if (APATCH_PATHS.any { java.io.File(it).exists() }) {
            return true
        }
        return isAnyPackageInstalled(APATCH_PACKAGES)
    }

    private fun checkBusybox(): Boolean {
        return BUSYBOX_PATHS.any { java.io.File(it).exists() }
    }

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

    private fun checkBuildProps(): Boolean {
        val debuggable = getSystemProp("ro.debuggable") == "1"
        val notSecure = getSystemProp("ro.secure") == "0"
        val testKeys = Build.TAGS?.contains("test-keys") == true

        return debuggable || notSecure || testKeys
    }

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

    private fun checkSuperuserApps(): Boolean {
        return SUPERUSER_PATHS.any { java.io.File(it).exists() }
    }

    companion object {
        const val NAME = "NitroDeviceInfo"

        private const val MB = 1024L * 1024L
        private const val GB = 1024L * MB
        private const val MHZ_IN_KHZ = 1000

        private val SU_PATHS =
            listOf(
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
                "/system/xbin/mu",
            )

        private val MAGISK_PATHS =
            listOf(
                "/data/adb/magisk",
                "/data/adb/magisk.db",
                "/data/adb/magisk.img",
                "/cache/.disable_magisk",
                "/sbin/.magisk",
                "/sbin/.core",
                "/dev/.magisk.unblock",
            )

        private val MAGISK_PACKAGES =
            listOf(
                "com.topjohnwu.magisk",
                "io.github.vvb2060.magisk",
                "com.kingroot.kinguser",
                "com.kingo.root",
                "com.noshufou.android.su",
                "eu.chainfire.supersu",
                "com.koushikdutta.superuser",
                "com.thirdparty.superuser",
                "com.yellowes.su",
            )

        private val KERNELSU_PATHS =
            listOf(
                "/data/adb/ksu",
                "/data/adb/ksud",
                "/data/adb/ksu/modules",
            )

        private val KERNELSU_PACKAGES =
            listOf(
                "me.weishu.kernelsu",
                "com.topjohnwu.magisk.ksu",
            )

        private val APATCH_PATHS =
            listOf(
                "/data/adb/apatch",
                "/data/adb/ap",
                "/data/adb/apd",
            )

        private val APATCH_PACKAGES =
            listOf(
                "me.bmax.apatch",
            )

        private val BUSYBOX_PATHS =
            listOf(
                "/system/xbin/busybox",
                "/system/bin/busybox",
                "/sbin/busybox",
                "/su/bin/busybox",
                "/data/local/xbin/busybox",
            )

        private val SUPERUSER_PATHS =
            listOf(
                "/system/app/Superuser.apk",
                "/system/app/SuperSU.apk",
                "/system/app/SuperSU/SuperSU.apk",
            )
    }
}
