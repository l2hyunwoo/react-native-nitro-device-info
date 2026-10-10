@file:Suppress("UNUSED_PARAMETER")

import kotlinx.coroutines.*

/** Minimal platform doubles; DeviceIntegrity.kt itself is compiled unchanged except imports. */
annotation class DoNotStrip
class Context
object NitroModules { val applicationContext: Context? = Context() }
object ConnectionResult { const val SUCCESS = 0 }
class GoogleApiAvailability {
    fun isGooglePlayServicesAvailable(context: Context) = ConnectionResult.SUCCESS
    companion object { fun getInstance() = GoogleApiAvailability() }
}
enum class IntegrityProviderType { PLAYINTEGRITY, UNSUPPORTED }
abstract class HybridDeviceIntegritySpec {
    abstract val isSupported: Boolean
    abstract val providerType: IntegrityProviderType
    abstract fun prepareStandardProvider(cloudProjectNumber: String): Promise<Unit>
    abstract fun requestIntegrityToken(requestHash: String): Promise<String>
    abstract fun requestClassicIntegrityToken(nonce: String, cloudProjectNumber: String): Promise<String>
    abstract fun generateKey(): Promise<String>
    abstract fun attestKey(keyId: String, clientDataHash: String): Promise<String>
    abstract fun generateAssertion(keyId: String, clientDataHash: String): Promise<String>
    abstract fun getDeviceCheckToken(): Promise<String>
}
class Promise<T>(val result: Deferred<T>) {
    companion object {
        fun <T> async(body: suspend () -> T) = Promise(CoroutineScope(Dispatchers.Unconfined).async { body() })
        fun <T> rejected(error: Throwable) = Promise(CompletableDeferred<T>().also { it.completeExceptionally(error) })
    }
}
class Task<T>(val result: CompletableDeferred<T> = CompletableDeferred()) {
    @OptIn(ExperimentalCoroutinesApi::class)
    fun addOnSuccessListener(callback: (T) -> Unit) = apply {
        result.invokeOnCompletion { if (it == null) callback(result.getCompleted()) }
    }
    fun addOnFailureListener(callback: (Throwable) -> Unit) = apply {
        result.invokeOnCompletion { if (it != null && it !is CancellationException) callback(it) }
    }
    fun addOnCanceledListener(callback: () -> Unit) = apply {
        result.invokeOnCompletion { if (it is CancellationException) callback() }
    }
    companion object {
        fun <T> completed(value: T) = Task(CompletableDeferred(value))
    }
}
class StandardIntegrityException(val errorCode: Int) : RuntimeException("Standard failure $errorCode")
class IntegrityServiceException(val errorCode: Int) : RuntimeException()
class StandardIntegrityManager {
    class PrepareIntegrityTokenRequest(val cloudProjectNumber: Long) {
        class Builder {
            private var number = 0L
            fun setCloudProjectNumber(value: Long) = apply { number = value }
            fun build() = PrepareIntegrityTokenRequest(number)
        }
        companion object { fun builder() = Builder() }
    }
    class StandardIntegrityTokenRequest(val requestHash: String) {
        class Builder {
            private var hash = ""
            fun setRequestHash(value: String) = apply { hash = value }
            fun build() = StandardIntegrityTokenRequest(hash)
        }
        companion object { fun builder() = Builder() }
    }
    class StandardIntegrityToken(private val value: String) { fun token() = value }
    interface StandardIntegrityTokenProvider {
        fun request(request: StandardIntegrityTokenRequest): Task<StandardIntegrityToken>
    }
    val projects = mutableListOf<Long>()
    val providers = ArrayDeque<StandardIntegrityTokenProvider>()
    fun prepareIntegrityToken(request: PrepareIntegrityTokenRequest): Task<StandardIntegrityTokenProvider> {
        projects.add(request.cloudProjectNumber)
        return Task.completed(providers.removeFirst())
    }
}
typealias PrepareIntegrityTokenRequest = StandardIntegrityManager.PrepareIntegrityTokenRequest
typealias StandardIntegrityTokenRequest = StandardIntegrityManager.StandardIntegrityTokenRequest
typealias StandardIntegrityToken = StandardIntegrityManager.StandardIntegrityToken
typealias StandardIntegrityTokenProvider = StandardIntegrityManager.StandardIntegrityTokenProvider
class IntegrityTokenRequest {
    class Builder {
        fun setNonce(value: String) = this
        fun setCloudProjectNumber(value: Long) = this
        fun build() = IntegrityTokenRequest()
    }
    companion object { fun builder() = Builder() }
}
class IntegrityManager {
    fun requestIntegrityToken(request: IntegrityTokenRequest) = Task.completed(StandardIntegrityToken("classic"))
}
object IntegrityManagerFactory {
    var standard = StandardIntegrityManager()
    fun createStandard(context: Context) = standard
    fun create(context: Context) = IntegrityManager()
}
class ControlledProvider : StandardIntegrityTokenProvider {
    val requests = mutableListOf<Task<StandardIntegrityToken>>()
    val hashes = mutableListOf<String>()
    override fun request(request: StandardIntegrityTokenRequest): Task<StandardIntegrityToken> {
        hashes.add(request.requestHash)
        return Task<StandardIntegrityToken>().also { requests.add(it) }
    }
}

private suspend fun rejected(promise: Promise<*>, code: String) {
    val error = runCatching { promise.result.await() }.exceptionOrNull()
    check(error?.message?.startsWith("$code:") == true) { "Expected $code, got $error" }
}

fun main() = runBlocking {
    val unprepared = DeviceIntegrity()
    rejected(unprepared.requestIntegrityToken(""), "PROVIDER_NOT_PREPARED")
    for (number in listOf("", "invalid", "0", "-1", "9223372036854775808")) {
        rejected(unprepared.prepareStandardProvider(number), "CLOUD_PROJECT_NUMBER_IS_INVALID")
    }

    /** Two pending requests for the same expired provider refresh it only once. */
    run {
        val initial = ControlledProvider()
        val refreshed = ControlledProvider()
        val manager = StandardIntegrityManager().also { it.providers.addAll(listOf(initial, refreshed)) }
        IntegrityManagerFactory.standard = manager
        val integrity = DeviceIntegrity()
        integrity.prepareStandardProvider("1").result.await()
        val first = integrity.requestIntegrityToken("first-hash")
        val second = integrity.requestIntegrityToken("second-hash")
        initial.requests[0].result.completeExceptionally(StandardIntegrityException(-19))
        initial.requests[1].result.completeExceptionally(StandardIntegrityException(-19))
        check(manager.projects == listOf(1L, 1L)) { "Expected a single refresh: ${manager.projects}" }
        check(refreshed.hashes == listOf("first-hash", "second-hash"))
        refreshed.requests.forEach { it.result.complete(StandardIntegrityToken("token")) }
        check(first.result.await() == "token" && second.result.await() == "token")
    }

    /** An in-flight failure must not replace a provider prepared for another project. */
    run {
        val initial = ControlledProvider()
        val replacement = ControlledProvider()
        val manager = StandardIntegrityManager().also { it.providers.addAll(listOf(initial, replacement)) }
        IntegrityManagerFactory.standard = manager
        val integrity = DeviceIntegrity()
        integrity.prepareStandardProvider("1").result.await()
        val token = integrity.requestIntegrityToken("request-hash")
        integrity.prepareStandardProvider("2").result.await()
        initial.requests.single().result.completeExceptionally(StandardIntegrityException(-19))
        check(manager.projects == listOf(1L, 2L))
        replacement.requests.single().result.complete(StandardIntegrityToken("replacement-token"))
        check(token.result.await() == "replacement-token")
    }

    for (errorCode in listOf(-19, -3)) {
        val initial = ControlledProvider()
        val refreshed = ControlledProvider()
        val manager = StandardIntegrityManager().also { it.providers.addAll(listOf(initial, refreshed)) }
        IntegrityManagerFactory.standard = manager
        val integrity = DeviceIntegrity()
        integrity.prepareStandardProvider("1").result.await()
        val token = integrity.requestIntegrityToken("hash")
        initial.requests.single().result.completeExceptionally(StandardIntegrityException(errorCode))
        if (errorCode == -19) {
            refreshed.requests.single().result.completeExceptionally(StandardIntegrityException(-19))
        }
        rejected(token, "STANDARD_INTEGRITY_ERROR_$errorCode")
        check(manager.projects.size == if (errorCode == -19) 2 else 1)
    }
    println("Android native regression checks passed")
}
