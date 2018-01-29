var gulp        = require('gulp');
    
var config = {

    'default':
    {
        task    : 'default',
        desc    : 'The default task.',
             
        tasks   : ['readme']
    },

    'readme'    :
    {
        task    : 'readme',
        desc    : 'Build the readme file.',
        
        src     : './src/README.md',
        bas     : './src',
        dst     : './',
        
        datas   :
        {
            forceCache  : null
        },
                    
        onlaunch: function()
        {
           config.readme.datas.forceCache = '' + Math.round(Math.random() * 1000000);
        }
    }
};

try {
    require('./tasks/gulp-templater.js')(gulp,config.readme);

    gulp.task(config.default.task ,config.default.tasks);
} catch (err) { gutil.log(err) }
