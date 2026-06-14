/**
 * DeviceIntegrity.swift
 * React Native Nitro Device Integrity - iOS Implementation
 *
 * Implements the DeviceIntegrity HybridObject. Issues App Attest
 * (DCAppAttestService) attestations/assertions and DeviceCheck (DCDevice)
 * tokens. This is a token-issuing client only: every returned value is an
 * opaque blob (base64) that MUST be validated by the developer's server
 * against Apple's root CA / DeviceCheck API.
 *
 * @author HyunWoo Lee
 */

import Foundation
import NitroModules
import DeviceCheck

/// iOS implementation of DeviceIntegrity backed by App Attest + DeviceCheck.
class DeviceIntegrity: HybridDeviceIntegritySpec {

  // MARK: - Availability

  var isSupported: Bool {
    return DCAppAttestService.shared.isSupported
  }

  var providerType: IntegrityProviderType {
    return DCAppAttestService.shared.isSupported ? .appattest : .unsupported
  }

  // MARK: - App Attest

  func generateKey() throws -> Promise<String> {
    return Promise.async {
      guard DCAppAttestService.shared.isSupported else {
        throw self.unsupportedError("App Attest")
      }
      return try await withCheckedThrowingContinuation { continuation in
        DCAppAttestService.shared.generateKey { keyId, error in
          if let keyId = keyId {
            continuation.resume(returning: keyId)
          } else {
            continuation.resume(throwing: self.mapError(error, fallback: "Failed to generate App Attest key"))
          }
        }
      }
    }
  }

  func attestKey(keyId: String, clientDataHash: String) throws -> Promise<String> {
    return Promise.async {
      guard DCAppAttestService.shared.isSupported else {
        throw self.unsupportedError("App Attest")
      }
      let hash = try self.decodeBase64(clientDataHash, field: "clientDataHash")
      return try await withCheckedThrowingContinuation { continuation in
        DCAppAttestService.shared.attestKey(keyId, clientDataHash: hash) { attestation, error in
          if let attestation = attestation {
            continuation.resume(returning: attestation.base64EncodedString())
          } else {
            continuation.resume(throwing: self.mapError(error, fallback: "Failed to attest key"))
          }
        }
      }
    }
  }

  func generateAssertion(keyId: String, clientDataHash: String) throws -> Promise<String> {
    return Promise.async {
      guard DCAppAttestService.shared.isSupported else {
        throw self.unsupportedError("App Attest")
      }
      let hash = try self.decodeBase64(clientDataHash, field: "clientDataHash")
      return try await withCheckedThrowingContinuation { continuation in
        DCAppAttestService.shared.generateAssertion(keyId, clientDataHash: hash) { assertion, error in
          if let assertion = assertion {
            continuation.resume(returning: assertion.base64EncodedString())
          } else {
            continuation.resume(throwing: self.mapError(error, fallback: "Failed to generate assertion"))
          }
        }
      }
    }
  }

  // MARK: - DeviceCheck

  func getDeviceCheckToken() throws -> Promise<String> {
    return Promise.async {
      guard DCDevice.current.isSupported else {
        throw self.unsupportedError("DeviceCheck")
      }
      return try await withCheckedThrowingContinuation { continuation in
        DCDevice.current.generateToken { data, error in
          if let data = data {
            continuation.resume(returning: data.base64EncodedString())
          } else {
            continuation.resume(throwing: self.mapError(error, fallback: "Failed to generate DeviceCheck token"))
          }
        }
      }
    }
  }

  // MARK: - Android-only methods (rejected on iOS)

  func prepareStandardProvider(cloudProjectNumber: String) throws -> Promise<Void> {
    return Promise.rejected(withError: unsupportedError("Play Integrity (prepareStandardProvider)"))
  }

  func requestIntegrityToken(requestHash: String) throws -> Promise<String> {
    return Promise.rejected(withError: unsupportedError("Play Integrity (requestIntegrityToken)"))
  }

  func requestClassicIntegrityToken(nonce: String, cloudProjectNumber: String) throws -> Promise<String> {
    return Promise.rejected(withError: unsupportedError("Play Integrity (requestClassicIntegrityToken)"))
  }

  // MARK: - Helpers

  private func decodeBase64(_ value: String, field: String) throws -> Data {
    guard let data = Data(base64Encoded: value) else {
      throw NSError(
        domain: "DeviceIntegrity",
        code: 1001,
        userInfo: [NSLocalizedDescriptionKey: "INVALID_BASE64: \(field) is not valid base64"]
      )
    }
    return data
  }

  private func unsupportedError(_ feature: String) -> NSError {
    return NSError(
      domain: "DeviceIntegrity",
      code: 1002,
      userInfo: [NSLocalizedDescriptionKey: "UNSUPPORTED_PLATFORM: \(feature) is not available on this device/platform"]
    )
  }

  private func mapError(_ error: Error?, fallback: String) -> NSError {
    if let dcError = error as? DCError {
      let code: String
      switch dcError.code {
      case .invalidKey: code = "INVALID_KEY"
      case .invalidInput: code = "INVALID_INPUT"
      case .serverUnavailable: code = "SERVER_UNAVAILABLE"
      case .featureUnsupported: code = "FEATURE_UNSUPPORTED"
      case .unknownSystemFailure: code = "UNKNOWN_SYSTEM_FAILURE"
      @unknown default: code = "UNKNOWN"
      }
      return NSError(
        domain: "DeviceIntegrity",
        code: dcError.code.rawValue,
        userInfo: [
          NSLocalizedDescriptionKey: "\(code): \(dcError.localizedDescription)",
          NSUnderlyingErrorKey: dcError,
        ]
      )
    }
    if let error = error {
      return error as NSError
    }
    return NSError(
      domain: "DeviceIntegrity",
      code: -1,
      userInfo: [NSLocalizedDescriptionKey: fallback]
    )
  }
}
