/*global module:false*/
/*jshint camelcase:false */
module.exports = function(grunt) {

  grunt.util.linefeed = '\n';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    banner: '/**' +
      '\n * <%= pkg.title || pkg.name %> - v<%= pkg.version %>' +
      '<%= pkg.description ? "\\n * " + pkg.description : "" %>' +
      '<%= pkg.homepage ? "\\n * " + pkg.homepage : "" %>' +
      '\n *\/',
    clean: {
      build: ['dist/']
    },
    concat: {
      options: {
        banner: '<%= banner %>' + '\n',
      },
      dist: {
        src: [
            'dist/<%= pkg.name %>'
        ],
        dest: 'dist/<%= pkg.name %>'
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib_test: {
        src: ['lib/**/*.js', 'test/**/*.js']
      }
    },
    qunit: {
      files: ['test/**/*.html']
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      lib_test: {
        files: '<%= jshint.lib_test.src %>',
        tasks: ['jshint:lib_test', 'qunit']
      }
    },
    browserify: {
      dist: {
        files: {
          'dist/<%= pkg.name %>': ['lib/base.js'],
        }
      }
    }
  });

  Object.keys(grunt.file.readJSON('package.json').devDependencies)
    .filter(function(npmTaskName) { return npmTaskName.indexOf('grunt-contrib') === 0; })
    .filter(function(npmTaskName) { return npmTaskName !== 'grunt-cli'; })
    .forEach(function(npmTaskName) { grunt.loadNpmTasks(npmTaskName); });

  grunt.loadNpmTasks('grunt-browserify');

  // Default task.
  grunt.registerTask('default', ['clean', 'browserify', 'concat']);

};
