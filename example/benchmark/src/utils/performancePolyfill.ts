if (typeof global.performance === 'undefined') {
  global.performance = {} as any;
}

if (typeof global.performance.now === 'undefined') {
  const startTime = Date.now();
  global.performance.now = () => Date.now() - startTime;
}

export const performance = global.performance;
