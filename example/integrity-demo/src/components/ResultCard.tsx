/**
 * Displays the state of a single attestation call: idle / loading / success /
 * error, with the (optionally truncated) opaque token value.
 */

import { StyleSheet, Text, View } from 'react-native';

export type ResultState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; value: string }
  | { status: 'error'; value: string };

export function ResultCard({
  title,
  state,
  truncate,
}: {
  title: string;
  state: ResultState;
  truncate?: boolean;
}) {
  if (state.status === 'idle') return null;

  return (
    <View style={[styles.card, cardStyleFor(state.status)]}>
      <Text style={styles.title}>{title}</Text>
      {state.status === 'loading' && <Text style={styles.muted}>…</Text>}
      {state.status === 'success' && (
        <Text style={styles.value} selectable>
          {truncate ? truncateToken(state.value) : state.value}
        </Text>
      )}
      {state.status === 'error' && (
        <Text style={styles.error} selectable>
          {state.value}
        </Text>
      )}
    </View>
  );
}

function truncateToken(token: string): string {
  if (token.length <= 64) return token;
  return `${token.slice(0, 40)}…${token.slice(-12)} (${token.length} chars)`;
}

function cardStyleFor(status: ResultState['status']) {
  switch (status) {
    case 'success':
      return styles.success;
    case 'error':
      return styles.errorCard;
    default:
      return styles.neutral;
  }
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
  },
  neutral: {
    backgroundColor: '#f4f4f4',
    borderColor: '#e0e0e0',
  },
  success: {
    backgroundColor: '#eafbf0',
    borderColor: '#bce8cd',
  },
  errorCard: {
    backgroundColor: '#fdecec',
    borderColor: '#f3c0c0',
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: '#444',
    marginBottom: 4,
  },
  value: {
    fontSize: 12,
    color: '#1a5c33',
    fontFamily: 'Courier',
  },
  error: {
    fontSize: 12,
    color: '#a11414',
  },
  muted: {
    fontSize: 14,
    color: '#999',
  },
});
