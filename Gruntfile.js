var config = require('./config');
module.exports = function(grunt) {
  grunt.initConfig({
    lambda_invoke: {
        default: {
            options: {}
        },
        Menu: {
          options: {
            event: "testData/menu.json"
          }
        },
        MenuOne: {
          options: {
            event: "testData/menu_one.json"
          }
        },
        MenuTwo: {
          options: {
            event: "testData/menu_two.json"
          }
        },
        MenuThree: {
          options: {
            event: "testData/menu_three.json"
          }
        },
        PackageQuery: {
          options: {
            event: "testData/package_query.json"
          }
        },
        NumberNotOnWhitelist: {
          options: {
            event: "testData/number_not_on_whitelist.json"
          }
        },
        UnknownNumber: {
          options: {
            event: "testData/unknown_number.json"
          }
        },
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

  grunt.registerTask('test', ['lambda_invoke:Menu', 'lambda_invoke:MenuOne', 'lambda_invoke:PackageQuery', 'lambda_invoke:MenuTwo', 'lambda_invoke:MenuThree', 'lambda_invoke:NumberNotOnWhitelist', 'lambda_invoke:UnknownNumber'])

  grunt.registerTask('deploy', ['lambda_package', 'lambda_deploy']);
  grunt.registerTask('default', ['lambda_package']);
};
