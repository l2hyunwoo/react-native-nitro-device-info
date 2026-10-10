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
import com.google.android.play.core.integrity.IntegrityManagerFactory
import com.google.android.play.core.integrity.IntegrityServiceException
import com.google.android.play.core.integrity.IntegrityTokenRequest
import com.margelo.nitro.NitroModules
import com.margelo.nitro.core.Promise

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

    private val standardIntegrity = StandardIntegrityProvider { IntegrityManagerFactory.createStandard(context) }

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

    override fun prepareStandardProvider(cloudProjectNumber: String): Promise<Unit> =
        Promise.async { standardIntegrity.prepare(cloudProjectNumber) }

    override fun requestIntegrityToken(requestHash: String): Promise<String> = Promise.async { standardIntegrity.request(requestHash) }

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
}
