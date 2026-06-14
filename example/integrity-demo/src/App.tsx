/**
 * Demo app for react-native-nitro-device-integrity
 *
 * Demonstrates ISSUING attestation tokens on-device. It deliberately does NOT
 * verify them — verification is the developer server's responsibility. Each
 * issued token is shown truncated; in a real app you would POST it to your
 * backend.
 */

import { useMemo, useState } from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { createDeviceIntegrity } from 'react-native-nitro-device-integrity';
import { ResultCard, type ResultState } from './components/ResultCard';
import { sha256Base64 } from './utils/hash';

export default function App() {
  const integrity = useMemo(() => createDeviceIntegrity(), []);
  const providerType = integrity.providerType;
  const isSupported = integrity.isSupported;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Device Integrity</Text>
        <Text style={styles.subtitle}>
          Issues hardware-backed attestation tokens. Tokens are opaque — send
          them to your own server to verify.
        </Text>

        <View style={styles.statusRow}>
          <Badge label={`provider: ${providerType}`} />
          <Badge label={`supported: ${isSupported ? 'yes' : 'no'}`} />
        </View>

        {!isSupported && (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>
              Attestation is unavailable on this device. On iOS this is expected
              in the Simulator (App Attest needs a real device). On Android it
              needs Google Play Services. The buttons below will reject with an
              explanatory error.
            </Text>
          </View>
        )}

        {Platform.OS === 'android' ? (
          <PlayIntegritySection integrity={integrity} />
        ) : (
          <AppAttestSection integrity={integrity} />
        )}

        <View style={styles.footer}>
          <Text style={styles.footerTitle}>What happens next?</Text>
          <Text style={styles.footerText}>
            In production, POST the issued token to your backend. Your server
            verifies it (Play Integrity {'→'} Google decode endpoint; App
            Attest {'→'} Apple root-CA chain). This app stops at issuing.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type Integrity = ReturnType<typeof createDeviceIntegrity>;

function PlayIntegritySection({ integrity }: { integrity: Integrity }) {
  const [cloudProjectNumber, setCloudProjectNumber] = useState('');
  const [prepare, setPrepare] = useState<ResultState>({ status: 'idle' });
  const [token, setToken] = useState<ResultState>({ status: 'idle' });

  const runPrepare = async () => {
    setPrepare({ status: 'loading' });
    try {
      await integrity.prepareStandardProvider(cloudProjectNumber.trim());
      setPrepare({ status: 'success', value: 'Provider prepared' });
    } catch (e) {
      setPrepare({ status: 'error', value: errorMessage(e) });
    }
  };

  const runRequest = async () => {
    setToken({ status: 'loading' });
    try {
      // requestHash binds the token to this specific request. Here we hash a
      // fixed payload; a real app hashes its actual request parameters.
      const requestHash = await sha256Base64('demo-action:checkout:item-42');
      const result = await integrity.requestIntegrityToken(requestHash);
      setToken({ status: 'success', value: result });
    } catch (e) {
      setToken({ status: 'error', value: errorMessage(e) });
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Play Integrity (Standard)</Text>
      <Text style={styles.label}>Google Cloud project number</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 123456789012"
        keyboardType="number-pad"
        value={cloudProjectNumber}
        onChangeText={setCloudProjectNumber}
        autoCapitalize="none"
      />
      <Button
        label="1. Prepare provider"
        disabled={cloudProjectNumber.trim().length === 0}
        onPress={runPrepare}
      />
      <ResultCard title="prepareStandardProvider" state={prepare} />
      <Button
        label="2. Request integrity token"
        disabled={prepare.status !== 'success'}
        onPress={runRequest}
      />
      <ResultCard title="requestIntegrityToken" state={token} truncate />
    </View>
  );
}

function AppAttestSection({ integrity }: { integrity: Integrity }) {
  const [keyId, setKeyId] = useState<string | null>(null);
  const [key, setKey] = useState<ResultState>({ status: 'idle' });
  const [attestation, setAttestation] = useState<ResultState>({
    status: 'idle',
  });
  const [assertion, setAssertion] = useState<ResultState>({ status: 'idle' });
  const [deviceCheck, setDeviceCheck] = useState<ResultState>({
    status: 'idle',
  });

  const runGenerateKey = async () => {
    setKey({ status: 'loading' });
    try {
      const id = await integrity.generateKey();
      setKeyId(id);
      setKey({ status: 'success', value: id });
    } catch (e) {
      setKey({ status: 'error', value: errorMessage(e) });
    }
  };

  const runAttest = async () => {
    if (!keyId) return;
    setAttestation({ status: 'loading' });
    try {
      // clientDataHash = base64(SHA-256(server challenge)). The challenge must
      // come from your server; we use a fixed string for the demo.
      const clientDataHash = await sha256Base64('demo-server-challenge');
      const result = await integrity.attestKey(keyId, clientDataHash);
      setAttestation({ status: 'success', value: result });
    } catch (e) {
      setAttestation({ status: 'error', value: errorMessage(e) });
    }
  };

  const runAssert = async () => {
    if (!keyId) return;
    setAssertion({ status: 'loading' });
    try {
      const clientDataHash = await sha256Base64('demo-request-payload');
      const result = await integrity.generateAssertion(keyId, clientDataHash);
      setAssertion({ status: 'success', value: result });
    } catch (e) {
      setAssertion({ status: 'error', value: errorMessage(e) });
    }
  };

  const runDeviceCheck = async () => {
    setDeviceCheck({ status: 'loading' });
    try {
      const result = await integrity.getDeviceCheckToken();
      setDeviceCheck({ status: 'success', value: result });
    } catch (e) {
      setDeviceCheck({ status: 'error', value: errorMessage(e) });
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>App Attest</Text>
      <Text style={styles.hint}>
        Persist the keyId yourself (Keychain). It does not survive reinstall.
      </Text>
      <Button label="1. Generate key" onPress={runGenerateKey} />
      <ResultCard title="generateKey (keyId)" state={key} />
      <Button
        label="2. Attest key (once)"
        disabled={!keyId}
        onPress={runAttest}
      />
      <ResultCard title="attestKey" state={attestation} truncate />
      <Button
        label="3. Generate assertion (per request)"
        disabled={!keyId}
        onPress={runAssert}
      />
      <ResultCard title="generateAssertion" state={assertion} truncate />

      <Text style={[styles.sectionTitle, styles.sectionSpacer]}>
        DeviceCheck
      </Text>
      <Button label="Get DeviceCheck token" onPress={runDeviceCheck} />
      <ResultCard title="getDeviceCheckToken" state={deviceCheck} truncate />
    </View>
  );
}

function Button({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

function errorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scroll: {
    padding: 16,
    paddingBottom: 48,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginTop: 6,
    lineHeight: 20,
  },
  statusRow: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 8,
  },
  badge: {
    backgroundColor: '#e3eefc',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    fontSize: 12,
    color: '#0b5bd3',
    fontWeight: '600',
  },
  notice: {
    backgroundColor: '#fff6e0',
    borderRadius: 8,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#f0d68a',
  },
  noticeText: {
    fontSize: 13,
    color: '#7a5b00',
    lineHeight: 19,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  sectionSpacer: {
    marginTop: 24,
  },
  hint: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    color: '#444',
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1a1a1a',
    backgroundColor: '#fafafa',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    backgroundColor: '#b9c7d6',
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#eef3f8',
    borderRadius: 12,
  },
  footerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  footerText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
    marginTop: 6,
  },
});
