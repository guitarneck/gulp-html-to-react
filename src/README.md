# gulp-html-to-react

A Gulp plugin to turn HTML into React component with embedded React code.

[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url] [![dependencies][dependencies-image]][dependencies-url] [![dev dependencies][dev-dependencies-image]][dev-dependencies-url]

---

> Based on [reactjs/react-magic](https://github.com/reactjs/react-magic).

## Table of Contents

* [Install](#install)
* [Usage](#usage)
* [Embendding React code in HTML](#embedding-react-code-in-html)
* [Options](#options)
* [License](#license)

## Install

```
$ npm i -D gulp-html-to-react
```

Or:

```
$ npm install --save-dev gulp-html-to-react
```

## Usage

```javascript
'use strict';

var toreact     = require('gulp-html-to-react'),
    diff        = require('gulp-diff-build');

module.exports = function(gulp,config){

    gulp.task(config.task,function(){

        gulp.src(config.src) // ,{buffer:false}) // Caution ! Diff not working in stream mode
            .pipe(toreact(config.opts))
            .pipe(diff({clean:true,hash:config.task}))
            .pipe(gulp.dest(config.dst));

    });

};
```

Used with stream or buffer. See [gulp.src/options.buffer](https://github.com/gulpjs/gulp/blob/master/docs/API.md#gulpsrcglobs-options)

## Embedding React code in HTML

A special tag can be used to write React code embedded in an HTML document.

```html
<?REACT...?>
```

**Example:**
```html
<button class="square" onclick="<?REACT() => alert('click')?>">
    <?REACTthis.props.value?>
</button>
```
**Giving:**
```html
<button className="square" onclick={() => alert('click')}>
    {this.props.value}
</button>
```

## Options

### indent

Type: `string` Default value: `\t`

Character(s) to be used for indenting the component.

### encoding

Type: `string` Default value: `utf8`

Type of the encoding for the output.

### ext

Type: `string` Default value: `null`

The extension for the output file. When `null`, the extension remain the same as the input file.

### style

Type: `integer` Default value: `0`

The style to be used to create the component.

Values:
  * `0`: React.Component (~ v16.2.0)
  * `1`: React.createClass (~ v15.6.2)
  * `2`: var
  * `3`: createReactClass (create-react-class needed)

## License

[MIT © guitarneck](./LICENSE)

[downloads-image]: https://img.shields.io/npm/dm/gulp-html-to-react.svg
[npm-image]: https://img.shields.io/npm/v/gulp-html-to-react.svg
[npm-url]: https://www.npmjs.com/package/gulp-html-to-react

[travis-image]: https://img.shields.io/travis/guitarneck/gulp-html-to-react.svg?label=travis-ci
[travis-url]: https://travis-ci.org/guitarneck/gulp-html-to-react

[coveralls-image]: https://coveralls.io/repos/github/guitarneck/gulp-html-to-react/badge.svg?<%= forceCache %>&branch=master
[coveralls-url]: https://coveralls.io/github/guitarneck/gulp-html-to-react?branch=master

[dev-dependencies-image]: https://david-dm.org/guitarneck/gulp-html-to-react/dev-status.svg
[dev-dependencies-url]: https://david-dm.org/guitarneck/gulp-html-to-react?type=dev
[dependencies-image]: https://david-dm.org/guitarneck/gulp-html-to-react/status.svg
[dependencies-url]: https://david-dm.org/guitarneck/gulp-html-to-react
