const assert = require('node:assert/strict');
const { test } = require('node:test');
const braces = require('braces');
const CachePolicy = require('http-cache-semantics');

for (const [open, close] of [
  ['{', '}'],
  ['(', ')'],
  ['{(', ')}'],
]) {
  for (const method of ['parse', 'compile', 'expand', 'stringify']) {
    test(`braces.${method} rejects deeply nested ${open} patterns`, () => {
      for (const suffix of [close.repeat(2000), '']) {
        assert.throws(
          () => braces[method](open.repeat(2000) + 'a,b' + suffix),
          { name: 'SyntaxError', message: /maximum depth of 128/ }
        );
      }
    });
  }
}

test('braces preserves ordinary expansion, escaping, and shallow nesting', () => {
  assert.deepEqual(braces.expand('src/{a,b}/{1..3}.ts'), [
    'src/a/1.ts',
    'src/a/2.ts',
    'src/a/3.ts',
    'src/b/1.ts',
    'src/b/2.ts',
    'src/b/3.ts',
  ]);
  assert.deepEqual(braces.expand('{a,{b,c}}'), ['a', 'b', 'c']);
  assert.equal(braces.compile('src/{a,b}.ts'), 'src/(a|b).ts');
  assert.equal(braces.stringify('\\{a,b\\}'), '{a,b}');
  assert.doesNotThrow(() =>
    braces.compile('{'.repeat(128) + 'a,b' + '}'.repeat(128))
  );
});

const request = {
  url: 'https://example.com/account',
  method: 'GET',
  headers: {},
};
for (const [name, headers, requestHeaders] of [
  ['private', { 'cache-control': 'private, max-age=3600' }, {}],
  ['no-store', { 'cache-control': 'no-store' }, {}],
  ['no-cache', { 'cache-control': 'no-cache' }, {}],
  ['session cookie', { 'set-cookie': 'session=secret' }, {}],
  [
    'authenticated',
    { 'cache-control': 'max-age=3600' },
    { authorization: 'Bearer secret' },
  ],
  ['must-revalidate', { 'cache-control': 'max-age=0, must-revalidate' }, {}],
]) {
  test(`max-stale cannot reuse a ${name} cache entry`, () => {
    const policy = new CachePolicy(
      { ...request, headers: requestHeaders },
      { status: 200, headers },
      { shared: true }
    );
    for (const directive of ['max-stale', 'max-stale=999999']) {
      const incoming = { ...request, headers: { 'cache-control': directive } };
      assert.equal(policy.satisfiesWithoutRevalidation(incoming), false);
      assert.equal(policy.evaluateRequest(incoming).response, undefined);
    }
  });
}

test('public responses remain cacheable, including explicitly permitted stale reuse', () => {
  const policy = new CachePolicy(request, {
    status: 200,
    headers: { 'cache-control': 'public, max-age=60' },
  });
  assert.equal(policy.satisfiesWithoutRevalidation(request), true);
  policy.age = () => 120;
  assert.equal(policy.satisfiesWithoutRevalidation(request), false);
  assert.equal(
    policy.satisfiesWithoutRevalidation({
      ...request,
      headers: { 'cache-control': 'max-stale=120' },
    }),
    true
  );
});
