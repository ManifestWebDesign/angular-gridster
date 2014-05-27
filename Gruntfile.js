'use_strict';

module.exports = function(grunt) {

	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	var banner = ['/**',
		' * @file <%= pkg.name %> - <%= pkg.homepage %>',
		' * @module <%= pkg.name %>',
		' * ',
		' * @see <%= pkg.homepage %>',
		' * @version <%= pkg.version %>',
		' * @license <%= pkg.license %>',
		' */\n'
	].join('\n');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		bump: {
			options: {
				files: ['package.json', 'bower.json'],
				updateConfigs: [],
				commit: false,
				push: false,
				commitMessage: 'Release v%VERSION%',
				commitFiles: ['package.json', 'bower.json']
			}
		},
		cssmin: {
			options: {
				banner: banner
			},
			main: {
				files: {
					'dist/css/angular-gridster.min.css': ['dist/css/angular-gridster.css'],
					'dist/css/angular-gridster-resizable.min.css': ['dist/css/angular-gridster-resizable.css']
				}
			}
		},
		concat: {
			options: {
				banner: banner + [
					'(function(angular) {',
					'\'use strict\';\n',
				].join('\n'),
				footer: '}(angular));',
			},
			main: {
				src: ['src/js/*/*'],
				dest: 'dist/js/<%= pkg.name %>.js'
			}
		},
		connect: {
			options: {
				port: 9005,
				hostname: 'localhost'
			},
			dev: {
				options: {
					open: true,
					livereload: 35729
				}
			},
			cli: {
				options: {}
			}
		},
		jsbeautifier: {
			options: {
				config: '.jsbeautifyrc'
			},
			dev: {
				src: ['demo/**/*.{html, js}', 'src/**/*.js', 'test/**/*.js', 'Gruntfile.js', 'karma.conf.js', 'bower.json', 'index.html', 'ptor.conf.js']
			},
			dist: {
				src: ['dist/js/angular-gridster.js']
			}
		},
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			files: ['src/js/*/*.js', 'test/**/*.js']
		},
		karma: {
			unit: {
				configFile: 'karma.conf.js',
				background: true,
				singleRun: false,
				browsers: ['PhantomJS']
			},
			singleRun: {
				configFile: 'karma.conf.js',
				singleRun: true,
				browsers: ['PhantomJS']
			}
		},
		less: {
			main: {
				files: {
					'dist/css/angular-gridster.css': 'src/less/angular-gridster.less'
				}
			},
			resizable: {
				files: {
					'dist/css/angular-gridster-resizable.css': ['src/less/angular-gridster.less', 'src/less/angular-gridster-resizable.less']
				}
			}
		},
		ngmin: {
			main: {
				src: ['dist/js/angular-gridster.js'],
				dest: 'dist/js/angular-gridster.js'
			}
		},
		protractor: {
			e2e: {
				options: {
					configFile: "ptor.conf.js",
					keepAlive: true,
					args: {}
				}
			}
		},
		uglify: {
			dist: {
				options: {
					banner: banner,
				},
				src: ['dist/js/angular-gridster.js'],
				dest: 'dist/js/angular-gridster.min.js'
			}
		},
		watch: {
			dev: {
				files: ['Gruntfile.js', 'karma.conf.js', 'ptor.conf.js', 'src/**/*', 'test/*/*.js'],
				tasks: ['jshint', 'concat', 'ngmin', 'jsbeautifier:dist', 'uglify', 'less', 'cssmin', 'karma:unit:run'],
				options: {
					reload: true,
					livereload: true,
					port: 35739
				}
			},
			e2e: { // separate e2e so livereload doesn't have to wait for e2e tests
				files: ['src/*', 'test/**/*.js'],
				tasks: ['protractor']
			}
		}
	});

	grunt.registerTask('default', ['jsbeautifier:dev', 'jshint', 'concat', 'ngmin', 'jsbeautifier:dist', 'uglify', 'less', 'cssmin']);

	grunt.registerTask('dev', ['karma:unit:start', 'watch:dev']);

	grunt.registerTask('dev_e2e', ['watch:e2e', 'protractor']);

	grunt.registerTask('test', ['connect:cli', 'karma:singleRun', 'protractor']);

};
