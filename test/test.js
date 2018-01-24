var gutil       = require('gulp-util'),
    assert      = require('assert'),
    should      = require('should');

var HTML2React  = require('../index');

var MOCKPATH = "tmp";

function MockContext ( in_filename ,in_contents , out_filename ,out_contents )
{
    this.in     = {filename:in_filename ,contents:in_contents};
    this.out    = {filename:out_filename,contents:out_contents};

    this.createFile = function ()
    {
        return new gutil.File({
            path        : MOCKPATH + "/" + this.in.filename,
            base        : MOCKPATH,
            cwd         : "test/",
            contents    : new Buffer( this.in.contents )
        })
    }

    this.execute = function ( options ,method ,done )
    {
        var file = this.createFile();
        
        var that = this;

        var stream  = HTML2React( options );

            stream.on('error' ,done);

            stream.on('data' ,function( file ){
                method.call( that ,file ,options );
                done();
            });

            stream.write( file );
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
};


describe('gulp-html-to-react : filename' ,function(){

	it('should change the .html extension to .jsx.js' ,function(done){
		var options = {
            indent      : '\t',
            encoding    : 'utf8',
            ext         : '.jsx.js',
            style       : 0
		};

        var mock = new MockContext(
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

        var mock = new MockContext(
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

describe('gulp-html-to-react : contents' ,function(){

	it('should create a React.Component' ,function(done){
		var options = {
            indent      : '\t',
            encoding    : 'utf8',
            ext         : '.jsx.js',
            style       : 0
		};

        var mock = new MockContext(
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

        var mock = new MockContext(
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

        var mock = new MockContext(
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

        var mock = new MockContext(
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