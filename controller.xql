xquery version "3.0";
declare namespace exist="http://exist.sourceforge.net/NS/exist";
 
declare variable $exist:root external;
declare variable $exist:prefix external;
declare variable $exist:controller external;
declare variable $exist:path external;
declare variable $exist:resource external;

(: forward every request that comes here to index.html :)
if (matches($exist:path, "^/(js|partials|css|img|ico|xsl)/"))
then
  <ignore xmlns="http://exist.sourceforge.net/NS/exist"/>
else
  <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
    <forward url="{$exist:controller}/index.html">
    </forward>
  </dispatch>

