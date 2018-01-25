module.exports = function( grunt ) {
  
  let path = require('path'),
      extend = require('extend'),
      pkg = require('./package.json'),
      config = require('./package-config.json');
  
  const PATHS = config.paths;
  
  grunt.config.set('pkg', pkg);
  grunt.config.set('config', (config = grunt.config.process(config)));
  
  let type = function( thing ) {
    
        if( thing === null ) return 'null';
        else if ( thing instanceof Array === true ) return 'array';
        else if ( typeof thing === 'object' ) return 'object';
        else return typeof thing;
    
      },
      replacement = function( options ) {
    
        let result = [],
            settings = extend({
              sources: [],
              path: '.',
              template: '',
              ext: null,
              match: ':file'
            }, options);

        if( !settings.sources ) return; 

        if( type(settings.sources) === 'object' ) settings.sources = Object.keys(settings.sources);
        
        settings.sources = settings.sources.reduce((previous, current) => {

          return type(current) === 'object' ? [...previous, ...Object.keys(current)] : [...previous, current];
          
        }, []);

        settings.sources.forEach(function(source){

          let ext = path.extname(source),
              file = source.indexOf('//') == -1 ? source.replace( ext, '') + settings.ext : source,
              src = source.indexOf('//') == -1 ? settings.path + file : file,
              template = settings.template.replace( settings.match, src );

          result.push( template ); 

        });

        return result.join("\n");

      };

  grunt.config.merge({
    watch: {
      options: {
        livereload: true
      },
      js: {
        files: [path.resolve(PATHS.src.js, '**/*.js')],
        tasks: ['jshint:dev', 'babel:dev']
      },
      scss: {
        files: [path.resolve(PATHS.src.scss, '**/*.scss')],
        tasks: ['sass:dev', 'postcss:dev']
      },
      php: {
        files: [path.resolve(PATHS.src.php, '**/*.php')],
        tasks: ['copy:dev']
      },
      html: {
        files: [path.resolve(PATHS.src.root, '*.html'), path.resolve(PATHS.src.partials, '**/*.html')],
        tasks: ['includes:dev', 'replace:dev']
      },
      assets: {
        files: [path.resolve(PATHS.src.images, '**/*'), path.resolve(PATHS.src.fonts, '**/*')],
        tasks: ['copy:dev']
      },
      config: {
        options: {
          reload: true,
        },
        files: [
          'package.json', 
          'package-config.json', 
          'Gruntfile.js',
          '.babelrc',
          '.jshintrc',
          '.todo'
        ],
        tasks: ['dev:startup', 'includes:dev', 'replace:dev']
      },
      data: {
        options: { dot: true },
        files: [path.resolve(PATHS.data.root, '**/*')],
        tasks: ['copy:dev']
      }
    },
    copydeps: {
      dev: {
        options: {
          unminified: true,
          css: true,
          include: {
            js: {
              'codemirror/mode/**/*.js': 'codemirror/'
            }
          }
        },
        pkg: 'package.json',
        dest: {
          js: PATHS.dev.dependencies.js,
          css: PATHS.dev.dependencies.css
        }
      },
      dist: {
        options: {
          unminified: true,
          css: true,
          include: {
            js: {
              'codemirror/mode/**/*.js': 'codemirror/'
            }
          }
        },
        pkg: 'package.json',
        dest: {
          js: PATHS.dist.dependencies.js,
          css: PATHS.dist.dependencies.css
        }
      }
    },
    includes: {
      dev: {
        options: {
          includePath: PATHS.src.partials
        },
        files: [
          {
            expand: true,
            cwd: path.resolve(PATHS.src.root),
            src: ['*.html'],
            dest: path.resolve(PATHS.dev.root)
          }
        ]
      },
      dist: {
        options: {
          includePath: PATHS.src.partials
        },
        files: [
          {
            expand: true,
            cwd: path.resolve(PATHS.src.root),
            src: ['*.html'],
            dest: path.resolve(PATHS.dist.root)
          }
        ]
      }
    },
    replace: {
      dev: {
        options: {
          patterns: [
            {
              match: 'css',
              replacement: replacement({
                sources: config.css, 
                path: PATHS.dev.css.replace('dev/', ''),  
                template: '<link rel="stylesheet" href=":file">',
                ext: '.css'
              })
            },
            { 
              match: 'js',
              replacement: replacement({
                sources: config.js, 
                path: PATHS.dev.js.replace('dev/', ''),  
                template: '<script src=":file"></script>',
                ext: '.js'
              })
            },
            { 
              match: 'dependencies:css',
              replacement: replacement({
                sources: config.dependencies.css, 
                path: PATHS.dev.dependencies.css.replace('dev/', ''),  
                template: '<link rel="stylesheet" href=":file">',
                ext: '.css'
              })
            },
            { 
              match: 'dependencies:js',
              replacement: replacement({
                sources: config.dependencies.js, 
                path: PATHS.dev.dependencies.js.replace('dev/', ''),  
                template: '<script src=":file"></script>',
                ext: '.js'
              })
            },
            {
              match: 'livereload',
              replacement: '<script src="//localhost:35729/livereload.js"></script>'
            }
          ]
        },
        files: [
          {
            expand: true,
            flatten: true,
            src: [path.resolve(PATHS.dev.root, '*.html')],
            dest: path.resolve(PATHS.dev.root)
          }
        ]
      },
      dist: {
        options: {
          patterns: [
            {
              match: 'css',
              replacement: replacement({
                sources: config.css, 
                path: PATHS.dist.css.replace('dist/', ''),  
                template: '<link rel="stylesheet" href=":file">',
                ext: '.min.css'
              })
            },
            { 
              match: 'js',
              replacement: replacement({
                sources: config.js, 
                path: PATHS.dist.js.replace('dist/', ''),  
                template: '<script src=":file"></script>',
                ext: '.min.js'
              })
            },
            { 
              match: 'dependencies:css',
              replacement: replacement({
                sources: config.dependencies.css, 
                path: PATHS.dist.dependencies.css.replace('dist/', ''),  
                template: '<link rel="stylesheet" href=":file">',
                ext: '.min.css'
              })
            },
            { 
              match: 'dependencies:js',
              replacement: replacement({
                sources: config.dependencies.js, 
                path: PATHS.dist.dependencies.js.replace('dist/', ''),  
                template: '<script src=":file"></script>',
                ext: '.min.js'
              })
            },
            {
              match: 'livereload',
              replacement: ''
            }
          ]
        },
        files: [
          {
            expand: true,
            flatten: true,
            src: [path.resolve(PATHS.dist.root, '*.html')],
            dest: path.resolve(PATHS.dist.root)
          }
        ]
      },
    },
    copy: {
      dev: {
        files: [
          {
            expand: true,
            cwd: PATHS.src.images,
            src: ['**/*'],
            dest: PATHS.dev.images
          },
          {
            expand: true,
            cwd: PATHS.src.fonts,
            src: ['**/*'],
            dest: PATHS.dev.fonts
          },
          {
            expand: true,
            cwd: PATHS.src.php,
            src: ['**/*'],
            dest: PATHS.dev.php
          },
          {
            expand: true,
            cwd: PATHS.data.root,
            src: ['**/*'],
            dest: PATHS.dev.root,
            dot: true
          }, 
          {
            expand: true,
            cwd: PATHS.composer.root,
            src: ['**/*'],
            dest: PATHS.dev.dependencies.php
          }
        ]
      },
      dist: {
        files: [
          {
            expand: true,
            cwd: PATHS.src.images,
            src: ['**/*'],
            dest: PATHS.dist.images
          },
          {
            expand: true,
            cwd: PATHS.src.fonts,
            src: ['**/*'],
            dest: PATHS.dist.fonts
          },
          {
            expand: true,
            cwd: PATHS.src.php,
            src: ['**/*'],
            dest: PATHS.dist.php
          },
          {
            expand: true,
            cwd: PATHS.data.root,
            src: ['**/*'],
            dest: PATHS.dist.root,
            dot: true
          },
          {
            expand: true,
            cwd: PATHS.composer.root,
            src: ['**/*'],
            dest: PATHS.dist.dependencies.php
          }
        ]
      },
    },
    clean: {
      dev: [PATHS.dev.root],
      dist: [PATHS.dist.root],
      unmincss: [path.resolve(PATHS.dist.css, '**/*.css'), '!' + path.resolve(PATHS.dist.css, '**/*.min.css')],
      unminjs: [path.resolve(PATHS.dist.js, '**/*.js'), '!' + path.resolve(PATHS.dist.js, '**/*.min.js')]
    },
    jshint: {
      dev: {
        options: {
          jshintrc: true
        },
        src: [path.resolve(PATHS.src.js, '*.js')]
      }
    },
    sass: {
      dev: {
        options: {
          sourcemap: 'none',
          noCache: true,
          style: 'expanded',
          update: true
        },
        files: [
          {
            expand: true,
            cwd: PATHS.src.scss,
            src: ['*.scss'],
            dest: PATHS.dev.css,
            ext: '.css'
          }
        ]
      },
      dist: {
        options: {
          sourcemap: 'none',
          noCache: true,
          style: 'compressed'
        },
        files: [
          {
            expand: true,
            cwd: PATHS.src.scss,
            src: ['*.scss'],
            dest: PATHS.dist.css,
            ext: '.css'
          }
        ]
      }
    },
    postcss: {
      options: {
        processors: [
          require('autoprefixer')({ browsers: 'last 2 versions' })
        ]
      },
      dev: {
        src: [path.resolve(PATHS.dev.css, '**/*.css')]
      },
      dist: {
        src: [path.resolve(PATHS.dist.css, '**/*.css')]
      }
    },
    cssmin: {
      dist: {
        files: [
          {
            expand: true,
            cwd: PATHS.dist.css,
            src: ['**/*.css', '!**/*.min.css'],
            dest: PATHS.dist.css,
            ext: '.min.css'
          }
        ]
      }
    },
    uglify: {
      dist: {
        files: [
          {
            expand: true,
            cwd: PATHS.dist.js,
            src: [
              '**/*.js', 
              '!**/*.min.js',
              '!' + path.resolve(PATHS.dist.dependencies.js, '**/vue.js'),
              '!' + path.resolve(PATHS.dist.dependencies.js, '/codemirror/*.js')
            ],
            dest: PATHS.dist.js,
            ext: '.min.js'
          }
        ]
      }
    },
    babel: {
      dev: {
        files: [
          {
            expand: true,
            cwd: path.resolve(PATHS.src.js),
            src: ['**/*.js'],
            dest: path.resolve(PATHS.dev.js)
          }
        ]
      },
      dist: {
        files: [
          {
            expand: true,
            cwd: path.resolve(PATHS.src.js),
            src: ['**/*.js'],
            dest: path.resolve(PATHS.dist.js)
          }
        ]
      }
    }
  });
  
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-includes');
  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-copy-deps');
  grunt.loadNpmTasks('grunt-postcss');
  
  grunt.registerTask('default', ['dev']);
   grunt.registerTask('dev:startup', [
    'clean:dev',
    'copydeps:dev',
    'copy:dev',
    'sass:dev',
    'postcss:dev',
    'jshint:dev',
    'babel:dev',
    'includes:dev',
    'replace:dev'
  ]);
  grunt.registerTask('dev', [
    'dev:startup', 
    'watch'
  ]);
  grunt.registerTask('dist', [
    'clean:dist',
    'copydeps:dist',
    'copy:dist',
    'sass:dist',
    'postcss:dist',
    'cssmin:dist',
    'clean:unmincss',
    'babel:dist',
    'uglify:dist',
    'clean:unminjs',
    'includes:dist',
    'replace:dist' 
  ]);
  
};