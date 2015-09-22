// the tests can't be run until XsltService is fully loaded.
// therefore, we need to disable Karma's start until onSaxonLoad executes
window.__karma__.loaded = function() {};
var onSaxonLoad = function () {
    window.__karma__.start();
}; // onSaxonLoad


beforeEach(function() {
    jasmine.addMatchers(EquivalentXml.jasmine);
});


