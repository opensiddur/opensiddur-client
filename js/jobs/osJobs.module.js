var osJobsModule = angular.module('osClient.jobs', ['osClient.error'])
    .constant("osJobsConst", { 
        partial : {
            jobs: "/js/jobs/Jobs.view.html",
            jobstatus: "/js/compiler/Compiler.view.html"    // TODO: this module is not really independent!
        }
    })
    ;
