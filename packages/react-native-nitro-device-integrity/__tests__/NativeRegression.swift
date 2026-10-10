import Foundation

// Minimal platform doubles; DeviceIntegrity.swift itself is compiled except framework imports.
class HybridDeviceIntegritySpec {}
enum IntegrityProviderType { case appattest, unsupported }
struct Promise<Value> {
  let body: () async throws -> Value
  static func async(_ body: @escaping () async throws -> Value) -> Promise<Value> { Promise(body: body) }
  static func rejected(withError error: Error) -> Promise<Value> { Promise { throw error } }
}
struct DCError: Error {
  enum Code: Int { case invalidKey, invalidInput, serverUnavailable, featureUnsupported, unknownSystemFailure }
  let code: Code
  var localizedDescription: String { "DeviceCheck error" }
}
class DCAppAttestService {
  static let shared = DCAppAttestService()
  var isSupported = true
  var hashes: [Data] = []
  func generateKey(_ callback: (String?, Error?) -> Void) { callback("key", nil) }
  func attestKey(_ keyId: String, clientDataHash: Data, _ callback: (Data?, Error?) -> Void) {
    hashes.append(clientDataHash)
    callback(Data("attestation".utf8), nil)
  }
  func generateAssertion(_ keyId: String, clientDataHash: Data, _ callback: (Data?, Error?) -> Void) {
    hashes.append(clientDataHash)
    callback(Data("assertion".utf8), nil)
  }
}
class DCDevice {
  static let current = DCDevice()
  var isSupported = false
  func generateToken(_ callback: (Data?, Error?) -> Void) { callback(nil, DCError(code: .featureUnsupported)) }
}

@main struct NativeRegression {
  static func main() async throws {
    let integrity = DeviceIntegrity()
    for supported in [true, false] {
      DCAppAttestService.shared.isSupported = supported
      for method in [integrity.attestKey, integrity.generateAssertion] {
        for count in [0, 1, 31, 33] {
          let value = Data(repeating: 0, count: count).base64EncodedString()
          await rejects(try method("key", value), code: "INVALID_INPUT", detail: "32-byte SHA-256 digest")
        }
        await rejects(try method("key", "not valid base64!!"), code: "INVALID_BASE64")
      }
    }
    precondition(DCAppAttestService.shared.hashes.isEmpty, "Invalid hashes must never reach App Attest")
    let hash = Data((0..<32).map(UInt8.init))
    DCAppAttestService.shared.isSupported = true
    let attestation = try await integrity.attestKey(keyId: "key", clientDataHash: hash.base64EncodedString()).body()
    let assertion = try await integrity.generateAssertion(keyId: "key", clientDataHash: hash.base64EncodedString()).body()
    precondition(attestation == Data("attestation".utf8).base64EncodedString())
    precondition(assertion == Data("assertion".utf8).base64EncodedString())
    precondition(DCAppAttestService.shared.hashes == [hash, hash])
    DCAppAttestService.shared.isSupported = false
    await rejects(try integrity.attestKey(keyId: "key", clientDataHash: hash.base64EncodedString()), code: "UNSUPPORTED_PLATFORM")
    await rejects(try integrity.generateAssertion(keyId: "key", clientDataHash: hash.base64EncodedString()), code: "UNSUPPORTED_PLATFORM")
    print("iOS native regression checks passed")
  }

  static func rejects(_ promise: Promise<String>, code: String, detail: String = "") async {
    do {
      _ = try await promise.body()
      preconditionFailure("Expected rejection: \(code)")
    } catch {
      precondition(error.localizedDescription.hasPrefix("\(code):"), "Unexpected error: \(error)")
      precondition(detail.isEmpty || error.localizedDescription.contains(detail), "Missing detail: \(error)")
    }
  }
}
