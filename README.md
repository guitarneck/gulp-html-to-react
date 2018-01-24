# gulp-html-to-react

A Gulp plugin to turn HTML into React component with embedded React code.

---

> Based on [reactjs/react-magic](https://github.com/reactjs/react-magic).

## Table of Contents

* [Embendding React code in HTML](#embedding-react-code-in-html)
* [Usage](#usage)
* [Options](#options)
* [License](#license)

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

## Options

list of valid options.

- `indent`: String to be used as indent for the component. (Default: '\t').
- `encoding`: String to encode the output. (Default: 'utf8').
- `ext`: String to be used as extension for the output file. (Default: null).
- `style`: Integer for the style used to create the component. (Default: 0).
  * `0`: React.Component (~ v16.2.0)
  * `1`: React.createClass (~ v15.6.2)
  * `2`: var
  * `3`: createReactClass (create-react-class needed)

## License

[MIT © guitarneck](./LICENSE)
