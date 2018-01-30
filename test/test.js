var gutil       = require('gulp-util'),
    should      = require('should');

var HTML2React  = require('../index');

var MOCKPATH = "tmp";

/*===*/
function streamToBuffer(stream)
{
    return new Promise(function(resolve, reject) {
        var buffers = [];
        stream.on('error', reject);
        stream.on('data', function(data){ buffers.push(data) });
        stream.on('end', function(){ resolve(Buffer.concat(buffers)) });
    });
}

var Duplex = require('stream').Duplex || require('readable-stream').Duplex;
function bufferToStream(buffer)
{
    var stream = new Duplex();
    stream.push(buffer);
    stream.push(null);
    return stream;
}
/*===*/


function MockHTML2React ( in_filename ,in_contents , out_filename ,out_contents ,buffer )
{
    this.in     = {filename:in_filename ,contents:in_contents};
    this.out    = {filename:out_filename,contents:out_contents};

    this._mode   = (typeof buffer === 'undefined') ? 'b' : (buffer ? 'b' : 's');

    this.buffer = function (boolean) { this._mode = boolean ? 'b' : 's' }
    this.isBuffer = function () { return this._mode === 'b' }
    this.isStream = function () { return this._mode === 's' }

    this.createFile = function ()
    {
        var opts = {
            path        : MOCKPATH + "/" + this.in.filename,
            base        : MOCKPATH,
            cwd         : "test/",
        }

        if ( this.isBuffer() )
        {
            opts.contents = this.in.contents !== null ? new Buffer( this.in.contents ) : null
        }
        else
        {
            opts.contents = bufferToStream( this.in.contents !== null ? new Buffer( this.in.contents ) : null )
        }

        return new gutil.File(opts)
    }

    this.execute = function ( options ,method ,done )
    {
        var file = this.createFile();
        
        var that = this;

        var streamz  = HTML2React( options );

            streamz.on('error' ,done);

            if ( ! this.isStream() )
            {
                streamz.on('data' ,function( file ){
                    method.call( that ,file ,options );
                    done();
                });
                streamz.write( file );
            }
            else
            {
                streamz.on('data' ,function( file ){
                    streamToBuffer(file.contents).then(function(){
                        method.call( that ,file ,options );
                    })
                    done();
                });
                streamz.write( file );
            }
/***
            var converter = new stream.Writable();
            converter.data = []; // We'll store all the data inside this array
            converter._write = function (chunk) {
                this.data.push(chunk);
            };
            converter.on('end', function() { // Will be emitted when the input stream has ended, ie. no more data will be provided
                var b = Buffer.concat(this.data); // Create a buffer from all the received chunks
                // Insert your business logic here
            });
***/
    };

    this.methodFile = function ( file ,options )
    {
        should.exist(file);
        file.path.should.equal(MOCKPATH + "/" + this.out.filename);
        file.relative.should.equal(this.out.filename);
    }

    this.methodContent = function ( file ,options )
    {
        file.contents.toString().should.equal(this.out.contents.toString(options.encoding));
    }

    this.methodNull = function ( file ,options )
    {
        should.exist(file);
        file.isNull().should.equal(true);
    }
};

describe('gulp-html-to-react : options' ,function(){

    it('should have the defaut options when undefined' ,function(done){
        var mock = new MockHTML2React(
            'toto.jsx.html',
            '<div><?react this.props.something ?></div>',
            'toto.jsx.html',
            '<div>{ this.props.something }</div>'
        );
        mock.execute( undefined ,mock.methodFile ,done );
    });

    it('should have the defaut options' ,function(done){
        var options = {
        };

        var mock = new MockHTML2React(
            'toto.jsx.html',
            '<div><?react this.props.something ?></div>',
            'toto.jsx.html',
            '<div>{ this.props.something }</div>'
        );
        mock.execute( options ,mock.methodFile ,done );
    });

    it('should have the defaut indent' ,function(done){
        var options = {
            style       : 0
        };

        var mock = new MockHTML2React(
            'toto.jsx.html',
            '<div><?react this.props.something ?></div>',
            'toto.jsx.html',
            '<div>{ this.props.something }</div>'
        );
        mock.execute( options ,mock.methodFile ,done );
    });

    it('should have the defaut encoding' ,function(done){
        var options = {
            indent      : '\t',
            style       : 0
        };

        var mock = new MockHTML2React(
            'toto.jsx.html',
            '<div><?react this.props.something ?></div>',
            'toto.jsx.html',
            '<div>{ this.props.something }</div>'
        );
        mock.execute( options ,mock.methodFile ,done );
    });

    it('should have the same extension' ,function(done){
        var options = {
            indent      : '\t',
            encoding    : 'utf8',
            style       : 0
        };

        var mock = new MockHTML2React(
            'toto.jsx.html',
            '<div><?react this.props.something ?></div>',
            'toto.jsx.html',
            '<div>{ this.props.something }</div>'
        );
        mock.execute( options ,mock.methodFile ,done );
    });
});

describe('gulp-html-to-react : filename' ,function(){

    it('should change the .html extension to .jsx.js' ,function(done){
        var options = {
            indent      : '\t',
            encoding    : 'utf8',
            ext         : '.jsx.js',
            style       : 0
        };

        var mock = new MockHTML2React(
            'toto.html',
            '<div><?react this.props.something ?></div>',
            'toto.jsx.js',
            '<div>{ this.props.something }</div>'
        );
        mock.execute( options ,mock.methodFile ,done );
    });

    it('should create the .jsx.html extension to .jsx' ,function(done){
        var options = {
            indent      : '  ',
            encoding    : 'binary',
            ext         : '.jsx',
            style       : 2
        };

        var mock = new MockHTML2React(
            'toto.jsx.html',
            ['<div class="ccs1 ccs2">',
            '    <?REACT this.props.something ?>',
            '</div>'].join('\n'),
            'toto.jsx',
            ['var Toto = ',
             '      <div className="ccs1 ccs2">',
             '        {this.props.something}',
             '      </div>;'].join('\n')
        );
        mock.execute( options ,mock.methodFile ,done );
    });

});

describe('gulp-html-to-react : contents from a stream' ,function(){

    it('should create for React.Component' ,function(done){
        var options = {
            indent      : '\t',
            encoding    : 'utf8',
            ext         : '.jsx.js',
            style       : 0
        };

        var mock = new MockHTML2React(
            'toto.html',
            '<div><?REACT this.props.something ?></div>',
            'toto.jsx.js',
            ['class Toto extends React.Component',
             '{',
             '\tconstructor (props)',
             '\t{',
             '\t\tsuper(props);',
             '\t}',
             '\trender ()',
             '\t{',
             '\t\treturn (',
             '\t\t\t<div>{this.props.something}</div>',
             '\t\t);',
             '\t}',
             '};'].join('\n')
        );
        mock.buffer( false );
        mock.execute( options ,mock.methodContent ,done );
    });

});

describe('gulp-html-to-react : contents from a buffer' ,function(){

    it('should do nothing when a file is null' ,function(done){
        var mock = new MockHTML2React(
            'toto.html',
            null,
            'toto.jsx.js',
            null
        );
        mock.execute( undefined ,mock.methodNull ,done );
    });

    it('should create a React.Component' ,function(done){
        var options = {
            indent      : '\t',
            encoding    : 'utf8',
            ext         : '.jsx.js',
            style       : 0
        };

        var mock = new MockHTML2React(
            'toto.html',
            '<div><?REACT this.props.something ?></div>',
            'toto.jsx.js',
            ['class Toto extends React.Component',
             '{',
             '\tconstructor (props)',
             '\t{',
             '\t\tsuper(props);',
             '\t}',
             '\trender ()',
             '\t{',
             '\t\treturn (',
             '\t\t\t<div>{this.props.something}</div>',
             '\t\t);',
             '\t}',
             '};'].join('\n')
        );
        mock.execute( options ,mock.methodContent ,done );
    });

    it('should create a React.createClass' ,function(done){
        var options = {
            indent      : '  ',
            encoding    : 'utf8',
            ext         : '.jsx.js',
            style       : 1
        };

        var mock = new MockHTML2React(
            'toto.jsx.html',
            '<div><?REACT this.props.something ?></div>',
            'toto.jsx.js',
            ['const Toto = React.createClass({',
             '  render ()',
             '  {',
             '    return (',
             '      <div>{this.props.something}</div>',
             '    );',
             '  }',
             '});'].join('\n')
        );
        mock.execute( options ,mock.methodContent ,done );
    });

    it('should create a var component' ,function(done){
        var options = {
            indent      : '  ',
            encoding    : 'binary',
            ext         : '.jsx',
            style       : 2
        };

        var mock = new MockHTML2React(
            'toto.jsx.html',
            ['<div class="ccs1 ccs2">',
            '    <?REACT this.props.something ?>',
            '</div>'].join('\n'),
            'toto.jsx',
            ['var Toto = ',
             '      <div className="ccs1 ccs2">',
             '        {this.props.something}',
             '      </div>;'].join('\n')
        );
        mock.execute( options ,mock.methodContent ,done );
    });

    it('should create a createReactClass' ,function(done){
        var options = {
            indent      : '  ',
            encoding    : 'ascii',
            ext         : '.jsx.js',
            style       : 3
        };

        var mock = new MockHTML2React(
            'toto.jsx.html',
            ['<div onclick="<?REACT() => alert(\'click\')?>">',
            '    <?REACT this.props.something ?>',
            '</div>'].join('\n'),
            'toto.jsx.js',
            ['var Toto = createReactClass({',
             '  render: function ()',
             '  {',
             '    return (',
             '      <div onclick={() => alert(\'click\')}>',
             '        {this.props.something}',
             '      </div>',
             '    );',
             '  }',
             '});'].join('\n')
        );
        mock.execute( options ,mock.methodContent ,done );
    });

});