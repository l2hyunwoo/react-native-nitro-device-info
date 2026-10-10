package com.margelo.nitro.nitrodeviceintegrity

import com.google.android.gms.tasks.Task
import com.google.android.play.core.integrity.StandardIntegrityException
import com.google.android.play.core.integrity.StandardIntegrityManager
import com.google.android.play.core.integrity.StandardIntegrityManager.PrepareIntegrityTokenRequest
import com.google.android.play.core.integrity.StandardIntegrityManager.StandardIntegrityToken
import com.google.android.play.core.integrity.StandardIntegrityManager.StandardIntegrityTokenProvider
import com.google.android.play.core.integrity.StandardIntegrityManager.StandardIntegrityTokenRequest
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

/** Keeps provider recovery independent of the JNI-backed Nitro Promise. */
internal class StandardIntegrityProvider(private val createManager: () -> StandardIntegrityManager) {
    /** Cached Standard token provider, prepared once and reused. */
    @Volatile
    private var standardProvider: StandardIntegrityTokenProvider? = null

    /** Cloud project number used for the last successful prepare (for auto re-prepare). */
    @Volatile
    private var preparedCloudProjectNumber: Long? = null

    /** Serializes provider preparation and snapshots. */
    private val providerMutex = Mutex()

    suspend fun prepare(cloudProjectNumber: String) {
        val number = parseCloudProjectNumber(cloudProjectNumber)
        providerMutex.withLock {
            prepareLocked(number)
        }
    }

    suspend fun request(requestHash: String): String {
        val provider = providerMutex.withLock { requireStandardProvider() }
        return try {
            requestStandardToken(provider, requestHash)
        } catch (e: StandardIntegrityException) {
            // Provider expired -> re-prepare once and retry.
            if (e.errorCode == EXPIRED_PROVIDER_ERROR_CODE) {
                val refreshedProvider =
                    providerMutex.withLock {
                        // Skip re-prepare if another coroutine already refreshed it.
                        if (standardProvider === provider) {
                            val number =
                                preparedCloudProjectNumber
                                    ?: throw integrityError(
                                        "PROVIDER_NOT_PREPARED",
                                        "Call prepareStandardProvider() before requestIntegrityToken().",
                                        e,
                                    )
                            prepareLocked(number)
                        }
                        requireStandardProvider()
                    }
                try {
                    requestStandardToken(refreshedProvider, requestHash)
                } catch (retry: StandardIntegrityException) {
                    throw mapStandardException(retry)
                }
            } else {
                throw mapStandardException(e)
            }
        }
    }

    /** Prepares the Standard provider. Caller must hold [providerMutex]. */
    private suspend fun prepareLocked(cloudProjectNumber: Long) {
        val manager = createManager()
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

    private fun requireStandardProvider(): StandardIntegrityTokenProvider =
        standardProvider
            ?: throw integrityError(
                "PROVIDER_NOT_PREPARED",
                "Call prepareStandardProvider() before requestIntegrityToken().",
            )

    private suspend fun requestStandardToken(
        provider: StandardIntegrityTokenProvider,
        requestHash: String,
    ): String {
        val request =
            StandardIntegrityTokenRequest.builder()
                .setRequestHash(requestHash)
                .build()
        val token: StandardIntegrityToken = provider.request(request).await()
        return token.token()
    }

    private fun mapStandardException(e: StandardIntegrityException): Throwable =
        integrityError("STANDARD_INTEGRITY_ERROR_${e.errorCode}", e.message ?: "Standard integrity request failed", e)

    companion object {
        /** StandardIntegrityErrorCode.INTEGRITY_TOKEN_PROVIDER_INVALID (-19). */
        private const val EXPIRED_PROVIDER_ERROR_CODE = -19
    }
}

internal fun parseCloudProjectNumber(value: String): Long =
    value.trim().toLongOrNull()?.takeIf { it > 0 }
        ?: throw integrityError(
            "CLOUD_PROJECT_NUMBER_IS_INVALID",
            "cloudProjectNumber must be a positive integer string, got: $value",
        )

internal fun integrityError(
    code: String,
    message: String,
    cause: Throwable? = null,
): Throwable = RuntimeException("$code: $message", cause)

/** Bridges a Play Services [Task] into a coroutine. */
internal suspend fun <T> Task<T>.await(): T =
    suspendCancellableCoroutine { continuation ->
        addOnSuccessListener { result -> continuation.resume(result) }
        addOnFailureListener { error -> continuation.resumeWithException(error) }
        addOnCanceledListener { continuation.cancel() }
    }
