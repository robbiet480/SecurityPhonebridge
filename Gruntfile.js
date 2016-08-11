var config = require('./config');
module.exports = function(grunt) {
  grunt.initConfig({
    lambda_invoke: {
        default: {
            options: {}
        }
    },
    lambda_package: {
        default: {
            options: {
              include_files: ['config.js']
            }
        }
    },
    lambda_deploy: {
        default: {
            arn: config.lambda_arn
        }
    }
  });

  grunt.loadNpmTasks('grunt-aws-lambda');

  grunt.registerTask('test', ['lambda_invoke'])

  grunt.registerTask('deploy', ['lambda_package', 'lambda_deploy']);
  grunt.registerTask('default', ['lambda_package']);
};
