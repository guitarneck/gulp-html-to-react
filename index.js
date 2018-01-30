'use strict';

var PluginError = require('gulp-util').PluginError,
    path        = require('path'),

    camelcase   = require('camel-case'),
    indent      = require('indent-string'),

    through     = require('through2'),
    HTMLtoJSX   = require('htmltojsx'),

    pk          = require('./package.json');

var cons = '\n%0constructor (props)\n%0{\n%0%0super(props);\n%0}';

const tmpljsx =
[
    [ //0 - ok, ~ 16.2.0
        'class %1 extends React.Component\n{'+cons+'\n%0render ()\n%0{\n%0%0return (\n',
        '\n%0%0);\n%0}\n};'
    ],

    [ //1 - ok ~ 15.6.2
        'const %1 = React.createClass({\n%0render ()\n%0{\n%0%0return (\n',
        '\n%0%0);\n%0}\n});'
    ],

    [ //2 - ok
        'var %1 = \n',
        ';'
    ],    

    [ //3 - create-react-class needed !!
        'var %1 = createReactClass({\n%0render: function ()\n%0{\n%0%0return (\n',
        '\n%0%0);\n%0}\n});'
    ]
];

function ucfirst (s)
{
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function reactTags (s)
{
    return s.replace(/\{\/\*\?REACT\s*([\s\S]+?)\s*\?\*\/\}/gi,'{$1}').replace(/"<\?REACT\s*([\s\S]+?)\s*\?>"/gi,'{$1}');
}

module.exports = function ( opts )
{
    opts = opts || {};
    opts.indent     = opts.indent || '\t';
    opts.encoding   = opts.encoding || 'utf8';
    opts.ext        = opts.ext || null;
    opts.style      = opts.style || 0;

    opts.style = Math.min(opts.style,tmpljsx.length - 1);

    var converter = new HTMLtoJSX({createClass:false,indent:opts.indent});

    function createContents ( header ,fileContents ,footer )
    {
        var jsxed = (converter.convert(fileContents.toString(opts.encoding))).trim();
        var datas = indent(jsxed,3,{indent:opts.indent});
            datas = reactTags(datas);
        return new Buffer(header+datas+footer,opts.encoding);
    }

    return through.obj(function (file ,enc ,cb)
    {
        if ( ! file.isNull() )
        {
            try {
                // for multi .ext
                var filename = path.basename(file.path) ,e='' ,ext='';
                while ( (e = path.extname(filename)) !== '' )
                {
                    filename = path.basename(filename ,e);
                    ext = e + ext;
                }

                var cameled = ucfirst(camelcase(filename));
                var header = (tmpljsx[opts.style][0]).replace(/%0/g,opts.indent).replace(/%1/,cameled);
                var footer = (tmpljsx[opts.style][1]).replace(/%0/g,opts.indent).replace(/%1/,cameled);

                if ( file.isStream() )
                {
                    var streamer = through(function (fileContents ,enc ,cb){
                        cb(null,createContents(header,fileContents,footer));
                    });
                    streamer.on('error',function(err){ cb(err); });
                    file.contents = file.contents.pipe(streamer);
                }
            
                if ( file.isBuffer() )
                {
                    file.contents = createContents(header,file.contents,footer)
                }
            
                if ( opts.ext !== null )
                {
                    file.path = path.join(path.dirname(file.path),filename+opts.ext);
                }
            } catch (err) {
                cb(new PluginError(pk.name,err,{fileName:file.path}));
            }
        }
        cb(null,file);
    });
};