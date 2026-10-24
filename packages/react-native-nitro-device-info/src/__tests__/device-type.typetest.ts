import type { DeviceType } from '../index';

const ok: DeviceType[] = ['Handset', 'Tablet', 'Tv', 'Desktop', 'GamingConsole', 'unknown'];
// @ts-expect-error not a DeviceType
const bad: DeviceType = 'Phone';
export { ok, bad };
