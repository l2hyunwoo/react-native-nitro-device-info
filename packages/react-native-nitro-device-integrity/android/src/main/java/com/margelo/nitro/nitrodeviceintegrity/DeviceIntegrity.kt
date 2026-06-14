/**
 * DeviceIntegrity.kt - Android implementation (Play Integrity API)
 *
 * Implements the DeviceIntegrity HybridObject. Issues Play Integrity tokens
 * (Standard and Classic). This is a token-issuing client only: the returned
 * tokens are opaque, encrypted JWTs that MUST be verified by the developer's
 * server (Google `:decodeIntegrityToken` or self-managed keys).
 *
 * @author HyunWoo Lee
 */
package com.margelo.nitro.nitrodeviceintegrity

import android.content.Context
import com.facebook.proguard.annotations.DoNotStrip
import com.google.android.gms.common.ConnectionResult
import com.google.android.gms.common.GoogleApiAvailability
import com.google.android.gms.tasks.Task
import com.google.android.play.core.integrity.IntegrityManagerFactory
import com.google.android.play.core.integrity.IntegrityServiceException
import com.google.android.play.core.integrity.IntegrityTokenRequest
import com.google.android.play.core.integrity.StandardIntegrityException
import com.google.android.play.core.integrity.StandardIntegrityManager.PrepareIntegrityTokenRequest
import com.google.android.play.core.integrity.StandardIntegrityManager.StandardIntegrityToken
import com.google.android.play.core.integrity.StandardIntegrityManager.StandardIntegrityTokenProvider
import com.google.android.play.core.integrity.StandardIntegrityManager.StandardIntegrityTokenRequest
import com.margelo.nitro.NitroModules
import com.margelo.nitro.core.Promise
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

/**
 * Android implementation of DeviceIntegrity backed by the Play Integrity API.
 */
@DoNotStrip
class DeviceIntegrity : HybridDeviceIntegritySpec() {
    /** React application context. */
    private val context: Context
        get() =
            NitroModules.applicationContext
                ?: throw IllegalStateException("React context not available")

    /** Cached Standard token provider, prepared once and reused. */
    @Volatile
    private var standardProvider: StandardIntegrityTokenProvider? = null

    /** Cloud project number used for the last successful prepare (for auto re-prepare). */
    @Volatile
    private var preparedCloudProjectNumber: Long? = null

    /** Serializes prepare/request so a provider is prepared at most once at a time. */
    private val providerMutex = Mutex()

    // MARK: - Availability

    /**
     * Best-effort availability hint: whether Google Play Services is present.
     * Does not guarantee the Play Integrity API is onboarded for this app.
     */
    override val isSupported: Boolean
        get() =
            runCatching {
                GoogleApiAvailability.getInstance()
                    .isGooglePlayServicesAvailable(context) == ConnectionResult.SUCCESS
            }.getOrDefault(false)

    override val providerType: IntegrityProviderType
        get() =
            if (isSupported) {
                IntegrityProviderType.PLAYINTEGRITY
            } else {
                IntegrityProviderType.UNSUPPORTED
            }

    // MARK: - Play Integrity (Standard)

    override fun prepareStandardProvider(cloudProjectNumber: String): Promise<Unit> {
        return Promise.async {
            val number = parseCloudProjectNumber(cloudProjectNumber)
            providerMutex.withLock {
                prepareLocked(number)
            }
        }
    }

    override fun requestIntegrityToken(requestHash: String): Promise<String> {
        return Promise.async {
            try {
                requestStandardToken(requestHash)
            } catch (e: StandardIntegrityException) {
                // Provider expired -> re-prepare once and retry.
                if (e.errorCode == EXPIRED_PROVIDER_ERROR_CODE) {
                    val expiredProvider = standardProvider
                    val number =
                        preparedCloudProjectNumber
                            ?: throw integrityError(
                                "PROVIDER_NOT_PREPARED",
                                "Call prepareStandardProvider() before requestIntegrityToken().",
                                e,
                            )
                    providerMutex.withLock {
                        // Skip re-prepare if another coroutine already refreshed it.
                        if (standardProvider === expiredProvider) {
                            prepareLocked(number)
                        }
                    }
                    try {
                        requestStandardToken(requestHash)
                    } catch (retry: StandardIntegrityException) {
                        throw mapStandardException(retry)
                    }
                } else {
                    throw mapStandardException(e)
                }
            }
        }
    }

    /** Prepares the Standard provider. Caller must hold [providerMutex]. */
    private suspend fun prepareLocked(cloudProjectNumber: Long) {
        val manager = IntegrityManagerFactory.createStandard(context)
        val request =
            PrepareIntegrityTokenRequest.builder()
                .setCloudProjectNumber(cloudProjectNumber)
                .build()
        standardProvider =
            try {
                manager.prepareIntegrityToken(request).await()
            } catch (e: StandardIntegrityException) {
                throw mapStandardException(e)
            }
        preparedCloudProjectNumber = cloudProjectNumber
    }

    private suspend fun requestStandardToken(requestHash: String): String {
        val provider =
            standardProvider
                ?: throw integrityError(
                    "PROVIDER_NOT_PREPARED",
                    "Call prepareStandardProvider() before requestIntegrityToken().",
                )
        val request =
            StandardIntegrityTokenRequest.builder()
                .setRequestHash(requestHash)
                .build()
        val token: StandardIntegrityToken = provider.request(request).await()
        return token.token()
    }

    // MARK: - Play Integrity (Classic)

    override fun requestClassicIntegrityToken(
        nonce: String,
        cloudProjectNumber: String,
    ): Promise<String> {
        return Promise.async {
            val number = parseCloudProjectNumber(cloudProjectNumber)
            val manager = IntegrityManagerFactory.create(context)
            val request =
                IntegrityTokenRequest.builder()
                    .setNonce(nonce)
                    .setCloudProjectNumber(number)
                    .build()
            try {
                manager.requestIntegrityToken(request).await().token()
            } catch (e: IntegrityServiceException) {
                throw integrityError(
                    "CLASSIC_INTEGRITY_ERROR_${e.errorCode}",
                    e.message ?: "Classic integrity request failed",
                    e,
                )
            }
        }
    }

    // MARK: - iOS-only methods (rejected on Android)

    override fun generateKey(): Promise<String> = rejectIosOnly("generateKey")

    override fun attestKey(
        keyId: String,
        clientDataHash: String,
    ): Promise<String> = rejectIosOnly("attestKey")

    override fun generateAssertion(
        keyId: String,
        clientDataHash: String,
    ): Promise<String> = rejectIosOnly("generateAssertion")

    override fun getDeviceCheckToken(): Promise<String> = rejectIosOnly("getDeviceCheckToken")

    // MARK: - Helpers

    private fun <T> rejectIosOnly(method: String): Promise<T> =
        Promise.rejected(
            integrityError(
                "UNSUPPORTED_PLATFORM",
                "$method is only available on iOS (App Attest / DeviceCheck).",
            ),
        )

    private fun parseCloudProjectNumber(value: String): Long =
        value.trim().toLongOrNull()?.takeIf { it > 0 }
            ?: throw integrityError(
                "CLOUD_PROJECT_NUMBER_IS_INVALID",
                "cloudProjectNumber must be a positive integer string, got: $value",
            )

    private fun mapStandardException(e: StandardIntegrityException): Throwable =
        integrityError("STANDARD_INTEGRITY_ERROR_${e.errorCode}", e.message ?: "Standard integrity request failed", e)

    private fun integrityError(
        code: String,
        message: String,
        cause: Throwable? = null,
    ): Throwable = RuntimeException("$code: $message", cause)

    /** Bridges a Play Services [Task] into a coroutine. */
    private suspend fun <T> Task<T>.await(): T =
        suspendCancellableCoroutine { continuation ->
            addOnSuccessListener { result -> continuation.resume(result) }
            addOnFailureListener { error -> continuation.resumeWithException(error) }
            addOnCanceledListener { continuation.cancel() }
        }

    companion object {
        /** StandardIntegrityErrorCode.INTEGRITY_TOKEN_PROVIDER_INVALID (-19). */
        private const val EXPIRED_PROVIDER_ERROR_CODE = -19
    }
}
