xquery version "3.0";
declare namespace exist="http://exist.sourceforge.net/NS/exist";
 
declare variable $exist:root external;
declare variable $exist:prefix external;
declare variable $exist:controller external;
declare variable $exist:path external;
declare variable $exist:resource external;

if (doc-available($exist:path) 
  or util:binary-doc-available($exist:path)
  or xmldb:collection-available($exist:path)
  )
then
    (: if the document literally exists, just serve it :)
    <exist:ignore/>
else
    (: forward every request that comes here and is not to one of the special dirs to index.html :)
    <exist:dispatch>{
        if (matches($exist:path, "^/(js|partials|css|img|ico|xsl)/"))
        then
            <exist:ignore/>
        else
            <exist:forward url="index.html"/>
    }</exist:dispatch>
