var osCompilerModule = angular.module('osClient.compiler', ['osClient.error', 'osClient.jobs'])
    .constant("osCompilerConst", { 
        partial : "/js/compiler/Compiler.view.html"
    })
    ;
