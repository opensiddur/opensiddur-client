/*
 Parser for conditionals language to XML (string)

  To compile to parser:
  pegjs -e conditionalsToXmlParser ConditionalsToXml.pegjs
  produces ConditionalsToXml.js
 */
expression 
	= operators / negation / equality

commalist
	= e:expression ","? c:(commalist)? { return e + (c ? c : "") } 

operators 
	= o:("ALL" / "ANY" / "ONEOF") "(" c:commalist ")" { 
    	var tr = {
        	ALL : "all",
            ANY : "any",
            ONEOF : "oneOf"
        };
        var operator = tr[o];
    	return ("<j:" + operator + ">" + c + "</j:" + operator + ">" )
    }

negation
	= "NOT(" e:expression ")" { return "<j:not>" + e + "</j:not>" } 

equality 
  = type:[^$,]+ "$" name:[^=,]+ "=" val:value { 
      return (
        "<tei:fs type=\"" + type + "\">" + 
          "<tei:f name=\"" + name + "\">" +
            val +
          "</tei:f>" +
        "</tei:fs>"
      ) } 

value 
  = v:("YES" / "NO" / "MAYBE" / "ON" / "OFF") { return "<j:" + v.toLowerCase() + "/>" }
