const assert = require('assert');
const postcss = require('postcss');
const plugin = require('../');

function compare(fixture, expected, options = { encode: false }, warnings = []) {
    return postcss([
        plugin(options)
    ]).process(fixture, options).then(result => {
        const resultWarnings = result.warnings();
        resultWarnings.forEach((warning, index) => {
            assert.equal(warnings[index], warning.text);
        });
        assert.equal(resultWarnings.length, warnings.length);
        assert.equal(result.css, expected);
    });
}

describe('options', () => {
    it('should take file relatively to "from" option', () => {
        return compare(
            `
            @svg-load icon url(basic.svg) {}
            background: svg-load('basic.svg');
            background: svg-inline(icon);
            `,
            `
            background: url("data:image/svg+xml;charset=utf-8,<svg id='basic'/>");
            background: url("data:image/svg+xml;charset=utf-8,<svg id='basic'/>");
            `,
            {
                encode: false,
                from: './fixtures/index.css'
            }
        );
    });

    it('should take file relatively to "path" option', () => {
        return compare(
            `
            @svg-load icon url(basic.svg) {}
            background: svg-load('basic.svg');
            background: svg-inline(icon);
            `,
            `
            background: url("data:image/svg+xml;charset=utf-8,<svg id='basic'/>");
            background: url("data:image/svg+xml;charset=utf-8,<svg id='basic'/>");
            `,
            {
                encode: false,
                path: './fixtures'
            }
        );
    });

    it('should prefer "path" option over "from"', () => {
        return compare(
            `
            @svg-load icon url(basic.svg) {}
            background: svg-load('basic.svg');
            background: svg-inline(icon);
            `,
            `
            background: url("data:image/svg+xml;charset=utf-8,<svg id='basic'/>");
            background: url("data:image/svg+xml;charset=utf-8,<svg id='basic'/>");
            `,
            {
                encode: false,
                from: './fixtures/deeper/index.css',
                path: './fixtures'
            }
        );
    });

    it('should transform result svg into url', () => {
        return compare(
            `
            @svg-load icon url(fixtures/basic.svg) {
                fill: #fff;
            }
            background: svg-load('fixtures/basic.svg', fill=#fff);
            background: svg-inline(icon);
            `,
            `
            background: url(basic.svg: transformed content);
            background: url(basic.svg: transformed content);
            `,
            {
                encode: false,
                transform(result, file) {
                    assert.equal(result, '<svg id="basic" fill="#fff"/>');
                    return file.split(/\\|\//).pop() + ': transformed content';
                }
            }
        );
    });

    it('should encode result svg', () => {
        return compare(
            `
            @svg-load icon url(fixtures/basic.svg) {}
            background: svg-load('fixtures/basic.svg');
            background: svg-inline(icon);
            `,
            `
            background: url("data:image/svg+xml;charset=utf-8,%3Csvg id='basic'/%3E");
            background: url("data:image/svg+xml;charset=utf-8,%3Csvg id='basic'/%3E");
            `,
            {}
        );
    });

    it('should encode result svg with custom encoder', () => {
        return compare(
            `
            @svg-load icon url(fixtures/basic.svg) {}
            background: svg-load('fixtures/basic.svg');
            background: svg-inline(icon);
            `,
            `
            background: url("data:image/svg+xml;charset=utf-8,1234567890");
            background: url("data:image/svg+xml;charset=utf-8,1234567890");
            `,
            {
                encode(code) {
                    assert.equal(code, `<svg id="basic"/>`);
                    return '1234567890';
                }
            }
        );
    });

    it('shoud combine results of "encode" and "transform"', () => {
        return compare(
            `background: svg-load('fixtures/basic.svg');`,
            `background: url([transform: encode]);`,
            {
                encode() {
                    return 'encode';
                },
                transform(code) {
                    return `[transform: ${code}]`;
                }
            }
        );
    });
});
