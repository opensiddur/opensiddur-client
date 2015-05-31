/* password check 
 * code from http://blog.brunoscopelliti.com/angularjs-directive-to-check-that-passwords-match 
 */
pwCheckModule.directive(
  'osPwCheck', 
  [
   function () {
    return {
      require: 'ngModel',
      link: function (scope, elem, attrs, ctrl) {
        var firstPassword = '#' + attrs.osPwCheck;
        elem.add(firstPassword).on('keyup', function () {
          scope.$apply(function () {
            var v = elem.val()===$(firstPassword).val();
            ctrl.$setValidity('pwmatch', v);
          });
        });
      }
    }
   }
  ]
);


