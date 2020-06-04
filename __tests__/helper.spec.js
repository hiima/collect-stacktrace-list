const { replaceUrlParams, distinctByApiName } = require('../helper');

describe('helper', () => {
  describe('replaceUrlParams()', () => {
    it('should replace url params', () => {
      expect(replaceUrlParams('/foo/v1/users/1134f228-6d93-4548-94b3-fd31ce33549c'))
        .toBe('/foo/v1/users/*');
      expect(replaceUrlParams('/foo/v1/users/1134f228-6d93-4548-94b3-fd31ce33549c/posts'))
        .toBe('/foo/v1/users/*/posts');
      expect(replaceUrlParams('/foo/v1/users/1134f228-6d93-4548-94b3-fd31ce33549c/posts/1134f228-6d93-4548-94b3-fd31ce33549c'))
        .toBe('/foo/v1/users/*/posts/*');
      expect(replaceUrlParams('/foo/v1/users/1134f228-6d93-4548-94b3-fd31ce33549c/posts/1134f228-6d93-4548-94b3-fd31ce33549c/details'))
        .toBe('/foo/v1/users/*/posts/*/details');
      expect(replaceUrlParams('/foo/v1/users/123'))
        .toBe('/foo/v1/users/*');
      expect(replaceUrlParams('/foo/v1/users/456/posts'))
        .toBe('/foo/v1/users/*/posts');
      expect(replaceUrlParams('/foo/v1/users/789/posts/012'))
        .toBe('/foo/v1/users/*/posts/*');
      expect(replaceUrlParams('/foo/v1/users/345/posts/678/details'))
        .toBe('/foo/v1/users/*/posts/*/details');
      expect(replaceUrlParams('/foo/v1/bar/20200628_56_54_1D2_by_aX337t2CuFdnDeF1jkayiuXN0KfIIF_7g4h_M'))
        .toBe('/foo/v1/bar/*');
      expect(replaceUrlParams('/foo/v1/bar/20200628_56_54_1D2_by_aX337t2CuFdnDeF1jkayiuXN0KfIIF_7g4h_M/baz'))
        .toBe('/foo/v1/bar/*/baz');
    });
  });

  describe('distinctByApiName()', () => {
    it('should sort by latency then distinct by api name', () => {
      const arr = [
        { name: '/foo/v1/', latency: 10, method: 'GET' },
        { name: '/foo/v1/', latency: 20, method: 'GET' },
        { name: '/foo/v1/', latency: 30, method: 'GET' },
        { name: '/bar/v1/', latency: 100, method: 'GET' },
        { name: '/bar/v1/', latency: 300, method: 'GET' },
        { name: '/bar/v1/', latency: 200, method: 'GET' },
        { name: '/foobar/v1/', latency: 9999, method: 'GET' },
        { name: '/baz/v1/', latency: 3000, method: 'POST' },
        { name: '/baz/v1/', latency: 3000, method: 'GET' },
        { name: '/baz/v1/', latency: 2000, method: 'GET' },
        { name: '/baz/v1/', latency: 1000, method: 'GET' }
      ];
      const expected = [
        { name: '/foobar/v1/', latency: 9999, method: 'GET' },
        { name: '/baz/v1/', latency: 3000, method: 'POST' },
        { name: '/baz/v1/', latency: 3000, method: 'GET' },
        { name: '/bar/v1/', latency: 300, method: 'GET' },
        { name: '/foo/v1/', latency: 30, method: 'GET' }
      ];
      expect(distinctByApiName(arr)).toEqual(expected);
    });
  });
});
