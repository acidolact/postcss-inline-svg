# postcss-inline-svg [![Build Status][travis-img]][travis]

[PostCSS] plugin to reference an SVG file and control its attributes with CSS syntax.

[PostCSS]: https://github.com/postcss/postcss

```css

.up {
    background: svg-load('img/arrow-up.svg', 'path{fill=#000, stroke=#fff}');
}
```

```css
.up {
    background: url("data:image/svg+xml;charset=utf-8,%3Csvg fill='%23000' stroke='%23fff'%3E...%3C/svg%3E");
}
```

PostCSS parsers allow to use different syntax (but only one syntax in one svg-load() definition):

```css
.down {
    background: svg-load('img/arrow-down.svg', fill=#000, stroke=#fff);
}
```

## Usage

```js
postcss([ require('postcss-inline-svg-simplified')(options) ])
```

See [PostCSS] docs for examples for your environment.

### Options

#### options.path

Path to resolve url.

Default: `false` - path will be relative to source file if it was specified.

#### options.removeFill

Default: `false` - with `true` removes all `fill` attributes before applying specified.
Passed RegExp filters files by id.

#### options.encode(svg)

Processes svg after applying parameters. Default will be ommited if passed `false`.

Default:

```js
function encode(code) {
    return code
        .replace(/%/g, '%25')
        .replace(/</g, '%3C')
        .replace(/>/g, '%3E')
        .replace(/&/g, '%26')
        .replace(/#/g, '%23');
}
```

#### options.transform(svg, path)

Transforms svg after `encode` function and generates url.

# License

MIT © [Bogdan Chadkin](mailto:trysound@yandex.ru)
