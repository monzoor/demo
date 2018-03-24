var fs = require('fs');
var path = require('path');

module.exports = function(grunt) {

    // load all grunt task
    require('grunt-task-loader')(grunt, {
        mapping: {
            sass_globbing: 'grunt-sass-globbing',
            sass: 'grunt-node-sass',
        }
    });

    grunt.initConfig({

        // Package
        pkg: grunt.file.readJSON('package.json'),

        // SASS globbing for collecting all css dynamically
        sass_globbing: {
            sb: {
                files: {
                    'assets/scss/style.scss': [
                        'assets/scss/bootstrap-custom/_bt4_variables.scss',
                        'node_modules/bootstrap/scss/bootstrap.scss',
                        'assets/scss/vendor/**/*.scss',
                        'assets/scss/common/**/*.scss',
                        'assets/scss/pages/**/*.scss'
                    ]
                },
                options: {
                    useSingleQuotes: false
                }
            }
        },

        // Compile sass
        sass: {
            dist: {
                src: 'assets/scss/style.scss',
                dest: 'build/css/style.css'
            }
        },

        autoprefixer: {
            dev: {
                options: {
                    browsers: ['last 2 versions', 'ie 9']
                },
                expand:true,
                src: 'build/css/style.css',
                dest: ''
            }
        },

        cssmin: {
            target: {
                files: [{
                    expand: true,
                    cwd: 'build/css',
                    src: ['*.css', '!*.min.css'],
                    dest: 'build/css'
                }]
            }
        },
        // Compress images
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'build/img',
                    src: '*.{png,jpg,jpeg,gif}',
                    dest: 'assets/img'
                }]
            }
        },

        // Concatenate JS
        // Config dynamically altered by 'concat_prepare'
        concat: {
            main: {
                src: [
                    'node_modules/jquery/dist/jquery.min.js',
                    'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
                    'assets/js/vendor/**/*.js',
                    'assets/js/*.js'
                ],
                dest: './build/js/app.js'
            }
        },

        // Clean
        clean: {
            post: ['.sass-cache','build']
        },

        // Copy files from assets
        copy: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'assets/fonts/',
                    src: ['**/*.{eot,svg,ttf,woff,woff2}'],
                    dest: 'build/fonts/'
                },
                {
                    expand: true,
                    cwd: 'assets/img/',
                    src: ['**'],
                    dest: 'build/img/',
                },
                {
                    expand: true,
                    cwd: 'assets/favs/',
                    src: ['**'],
                    dest: 'build/favs/',
                },
                {
                    expand: true,
                    cwd: 'assets/videos/',
                    src: ['**'],
                    dest: 'build/videos/',
                }]
            }
        },

        // Watch
        watch: {
            options: {
                livereload: true,
            },
            sass: {
                files: ['assets/scss/**/*.{sass,scss}', '*.html'],
                tasks: ['sass_globbing', 'sass', 'autoprefixer', 'copy','notify:scss']
            },
            scripts: {
                files: 'assets/js/**/*.js',
                tasks: ['concat_prepare', 'concat','notify:js']
            },
            img: {
                files: 'assets/img/**/*.*',
                tasks: ['copy','notify:copy']
            },
        },

        concurrent: {
            options: {
                logConcurrentOutput: true
            },
            serve: ['clean','js','style','copy','notify:watch','watch']
        },

        uglify: {
            options: {
                mangle: {
                    reserved: ['jQuery','bootstrap']
                }
            },
            my_target: {
                files: [{
                    expand: true,
                    cwd: 'build/js',
                    src: '**/*.js',
                    dest: 'build/js'
                }]
            }
        },
        usemin: {
            css: ['build/css/*.css'],
            js: ['build/js/*.js'],
            options: {
                assetsDirs: [
                    'build/img'
                ]
            }
        },
        filerev: {
            options: {
                algorithm: 'md5',
                length: 8
            },
            dist: {
                // src: ['build/**/*','!build/fonts/**']
                src: ['build/**/*']
            }
        },
        notify: {
            js: {
                options: {
                    title: 'Task Complete',  // optional
                    message: 'JS compiled', //required
                }
            },
            scss: {
                options: {
                    title: 'Task Complete',  // optional
                    message: 'SASS compiled', //required
                }
            },
            copy: {
                options: {
                    title: 'Task Complete',  // optional
                    message: 'Asset compiled', //required
                }
            },
            watch: {
                options: {
                    title: 'Watch Started',  // optional
                    message: 'Watching Files', //required
                }
            },
            allDev: {
                options: {
                    title: 'Dev Compiled',  // optional
                    message: 'All compiled', //required
                }
            }
        }

    });

    /**
    * Creates an app config file based on filerev summary to
    * be used by app & template helpers.
    */
    grunt.registerTask('filerev_mapping', function(task) {
        // Create json, remove all occurances of /public
        // console.log(grunt.filerev.summary);
        var json = JSON.stringify(grunt.filerev.summary, null, 2);
        json = json.replace(/build\\/g, '');
        json = json.replace(/build\//g, '/');
        json = json.replace(/\\\\/g, '\\');
        // console.log(json);

        fs.writeFileSync('./build/filerev.json', json);
    });

    grunt.registerTask('file_v', [
        'filerev',
        'filerev_mapping',
        'usemin'
    ]);

    // style
    grunt.registerTask('style', [
        'sass_globbing',
        'sass',
        'autoprefixer',
    ]);

    // js
    grunt.registerTask('js', [
        'concat_prepare',
        'concat',
    ]);

    // Register Grunt tasks
    grunt.registerTask('default', [
        'clean',
        'style',
        'js',
        'copy',
        // 'file_v',
        'notify:allDev'
    ]);

    // watch
    grunt.registerTask('server', ['concurrent:serve']);

    grunt.registerTask('build', [
        'clean',
        'style',
        'cssmin',
        'imagemin',
        'js',
        'uglify',
        'copy',
        // 'file_v'
    ]);

    /**
    * Builds the config for grunt-contrib-concat
    * Compiles all root-level js into one main js file, and
    * page-specific styles into separate files, using the
    * same name as their parent directory.
    */
    grunt.registerTask('concat_prepare', function() {
        var destDir = './build/js',
        srcDir = './assets/js',
        config = grunt.config.get('concat');

        fs.readdirSync(srcDir+'/pages')
        .filter(function(file) {
            return (file.indexOf('.') !== 0);
        })
        .forEach(function(dirname) {
            var target = destDir+'/'+dirname+'.js',
            sources = [];

            fs.readdirSync(srcDir+'/pages/'+dirname)
            .filter(function(file) {
                return (file.indexOf('.') !== 0);
            })
            .forEach(function(filename) {
                if (filename.slice(-3) !== '.js') return;
                sources.push(srcDir+'/pages/'+dirname+'/'+filename);
            });

            config[dirname] = {
                src: sources,
                dest: target
            };
        });

        grunt.config('concat', config);
    });
};
