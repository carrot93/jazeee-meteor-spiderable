import { _ } from 'meteor/underscore';
import { HTTP } from 'meteor/http';
import { Spiderable } from 'meteor/jazeee:spiderable-longer-timeout';

Tinytest.add('phantom url generation', (test) => {
  const absUrl = 'http://example.com';
  _.each([
    // Requests resulting from `<meta name='fragment' content='!'>`
    // will have an `_escaped_fragment_` which is present but blank,
    // which we want to represent as having no hash fragment
    // parameter.  (Note this means we cannot distinguish between `/`
    // and `/#!`).
    {
      requestUrl: '/?_escaped_fragment_=',
      expected: '/'
    },
    // Test that a nonempty fragment is tunneled through to the generated URL
    {
      requestUrl: '/?_escaped_fragment_=1',
      expected: '/#!1'
    },
    // Test decoding the encoded escaped fragment.
    {
      requestUrl: '/?_escaped_fragment_=abc%3D123%26def%3D456',
      expected: '/#!abc=123&def=456'
    },
    // Test that query strings are preserved
    {
      requestUrl: '/?_escaped_fragment_=1&foo=bar',
      expected: '/?foo=bar#!1'
    },
    {
      requestUrl: '/?foo=bar&_escaped_fragment_=1',
      expected: '/?foo=bar#!1'
    },
    // Test that paths are preserved
    {
      requestUrl: '/foo/bar?_escaped_fragment_=1',
      expected: '/foo/bar#!1'
    },
    {
      requestUrl: '/foo/bar?_escaped_fragment_=1&foo=bar',
      expected: '/foo/bar?foo=bar#!1'
    },
    // Test with a path on the site's absolute url
    {
      requestUrl: '/foo/bar?_escaped_fragment_=1',
      expected: '/foo/bar#!1',
      absUrl: 'http://example.com/foo'
    },
    {
      requestUrl: '/bar?_escaped_fragment_=1',
      expected: '/bar#!1',
      absUrl: 'http://example.com/foo'
    }
  ], (testCase) => {
    testCase.absUrl = testCase.absUrl || absUrl;

    test.equal(
      Spiderable._urlForPhantom(absUrl, testCase.requestUrl),
      absUrl + testCase.expected
    );
  });
});

Tinytest.addAsync('rendering test', (test, ready) => {
  HTTP.get('http://localhost:3000?_escaped_fragment_=', (err, res) => {
    test.isFalse(!!err);
    try {
      test.isFalse(!!~res.content.indexOf('script'));
    } catch (e) {
      // Error
    }
    ready();
  });
});
