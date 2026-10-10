package com.margelo.nitro.nitrodeviceintegrity

import com.google.android.gms.tasks.OnFailureListener
import com.google.android.gms.tasks.OnSuccessListener
import com.google.android.gms.tasks.Task
import com.google.android.play.core.integrity.StandardIntegrityException
import com.google.android.play.core.integrity.StandardIntegrityManager
import com.google.android.play.core.integrity.StandardIntegrityManager.PrepareIntegrityTokenRequest
import com.google.android.play.core.integrity.StandardIntegrityManager.StandardIntegrityToken
import com.google.android.play.core.integrity.StandardIntegrityManager.StandardIntegrityTokenProvider
import com.google.android.play.core.integrity.StandardIntegrityManager.StandardIntegrityTokenRequest
import kotlinx.coroutines.CoroutineStart
import kotlinx.coroutines.async
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.yield
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import org.mockito.Answers
import org.mockito.Mockito.mock
import org.mockito.Mockito.verifyNoInteractions
import org.mockito.Mockito.`when`

class StandardIntegrityProviderTest {
    @Test(timeout = 10000)
    fun requestBeforePrepareIsRejected() =
        runBlocking {
            val manager = Manager()
            assertRejected("PROVIDER_NOT_PREPARED") { manager.subject.request("") }
            verifyNoInteractions(manager.sdk)
        }

    @Test(timeout = 10000)
    fun invalidProjectNumbersAreRejected() =
        runBlocking {
            val manager = Manager()
            for (number in listOf("", "invalid", "0", "-1", "9223372036854775808")) {
                assertRejected("CLOUD_PROJECT_NUMBER_IS_INVALID") { manager.subject.prepare(number) }
            }
            verifyNoInteractions(manager.sdk)
        }

    @Test(timeout = 10000)
    fun twoExpiredRequestsRefreshTheProviderOnlyOnce() =
        runBlocking {
            val initial = Provider()
            val refreshed = Provider()
            val manager = Manager(initial, refreshed)
            manager.subject.prepare("1")
            val first = async(start = CoroutineStart.UNDISPATCHED) { manager.subject.request("first-hash") }
            val second = async(start = CoroutineStart.UNDISPATCHED) { manager.subject.request("second-hash") }

            initial.requests[0].fail(standardError(-19))
            initial.requests[1].fail(standardError(-19))
            yield()

            manager.assertProjects(1, 1)
            assertEquals(listOf("first-hash", "second-hash"), refreshed.hashes)
            refreshed.requests.forEach { it.succeed(token("token")) }
            assertEquals("token", first.await())
            assertEquals("token", second.await())
        }

    @Test(timeout = 10000)
    fun expiredRequestKeepsTheProviderPreparedForAnotherProject() =
        runBlocking {
            val initial = Provider()
            val replacement = Provider()
            val manager = Manager(initial, replacement)
            manager.subject.prepare("1")
            val result = async(start = CoroutineStart.UNDISPATCHED) { manager.subject.request("request-hash") }
            manager.subject.prepare("2")

            initial.requests.single().fail(standardError(-19))
            yield()

            manager.assertProjects(1, 2)
            assertEquals(listOf("request-hash"), replacement.hashes)
            replacement.requests.single().succeed(token("replacement-token"))
            assertEquals("replacement-token", result.await())
        }

    @Test(timeout = 10000)
    fun secondExpiryIsRejectedWithoutAnotherRetry() =
        runBlocking {
            val initial = Provider()
            val refreshed = Provider()
            val manager = Manager(initial, refreshed)
            manager.subject.prepare("1")
            val result =
                async(start = CoroutineStart.UNDISPATCHED) {
                    runCatching { manager.subject.request("hash") }
                }

            initial.requests.single().fail(standardError(-19))
            yield()
            refreshed.requests.single().fail(standardError(-19))

            assertTrue(result.await().exceptionOrNull()?.message?.startsWith("STANDARD_INTEGRITY_ERROR_-19:") == true)
            manager.assertProjects(1, 1)
            assertEquals(listOf("hash"), refreshed.hashes)
        }

    @Test(timeout = 10000)
    fun otherErrorsAreRejectedWithoutRefreshing() =
        runBlocking {
            val initial = Provider()
            val manager = Manager(initial)
            manager.subject.prepare("1")
            val result =
                async(start = CoroutineStart.UNDISPATCHED) {
                    runCatching { manager.subject.request("hash") }
                }

            initial.requests.single().fail(standardError(-3))

            assertTrue(result.await().exceptionOrNull()?.message?.startsWith("STANDARD_INTEGRITY_ERROR_-3:") == true)
            manager.assertProjects(1)
        }

    private suspend fun assertRejected(
        code: String,
        block: suspend () -> Unit,
    ) {
        val error = runCatching { block() }.exceptionOrNull()
        assertTrue("Expected $code, got $error", error?.message?.startsWith("$code:") == true)
    }

    private fun standardError(code: Int): StandardIntegrityException =
        mock(StandardIntegrityException::class.java).also {
            `when`(it.errorCode).thenReturn(code)
            `when`(it.message).thenReturn("Standard failure $code")
        }

    private fun token(value: String): StandardIntegrityToken =
        mock(StandardIntegrityToken::class.java).also { `when`(it.token()).thenReturn(value) }

    private class Manager(vararg providers: Provider) {
        private val available = ArrayDeque(providers.toList())
        private val preparations = mutableListOf<PrepareIntegrityTokenRequest>()
        val sdk: StandardIntegrityManager =
            mock(StandardIntegrityManager::class.java) { invocation ->
                if (invocation.method.name == "prepareIntegrityToken") {
                    preparations.add(invocation.getArgument(0))
                    PendingTask(available.removeFirst().sdk).task
                } else {
                    Answers.RETURNS_DEFAULTS.answer(invocation)
                }
            }
        val subject = StandardIntegrityProvider { sdk }

        fun assertProjects(vararg numbers: Long) {
            val expected = numbers.map { PrepareIntegrityTokenRequest.builder().setCloudProjectNumber(it).build() }
            assertEquals(expected, preparations)
        }
    }

    private class Provider {
        val requests = mutableListOf<PendingTask<StandardIntegrityToken>>()
        val hashes = mutableListOf<String>()
        val sdk: StandardIntegrityTokenProvider =
            mock(StandardIntegrityTokenProvider::class.java) { invocation ->
                if (invocation.method.name == "request") {
                    hashes.add(requireNotNull(invocation.getArgument<StandardIntegrityTokenRequest>(0).requestHash()))
                    PendingTask<StandardIntegrityToken>().also { requests.add(it) }.task
                } else {
                    Answers.RETURNS_DEFAULTS.answer(invocation)
                }
            }
    }

    /** Controls SDK callbacks without depending on an Android main Looper. */
    private class PendingTask<T>(private val completedValue: T? = null) {
        private lateinit var success: OnSuccessListener<T>
        private lateinit var failure: OnFailureListener

        @Suppress("UNCHECKED_CAST")
        val task: Task<T> =
            mock(Task::class.java) { invocation ->
                when (invocation.method.name) {
                    "addOnSuccessListener" -> {
                        success = invocation.getArgument(0)
                        completedValue?.let { success.onSuccess(it) }
                        invocation.mock
                    }
                    "addOnFailureListener" -> {
                        failure = invocation.getArgument(0)
                        invocation.mock
                    }
                    "addOnCanceledListener" -> invocation.mock
                    else -> Answers.RETURNS_DEFAULTS.answer(invocation)
                }
            } as Task<T>

        fun succeed(value: T) = success.onSuccess(value)

        fun fail(error: Exception) = failure.onFailure(error)
    }
}
