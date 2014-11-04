<!-- Automatically add tei:seg elements to text inside a j:streamText,
    where each segment is separated by a newline 

    Open Siddur Project
    Copyright 2014 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3 or later
-->
<xsl:stylesheet 
    version="2.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:j="http://jewishliturgy.org/ns/jlptei/1.0"
    xmlns:jf="http://jewishliturgy.org/ns/jlptei/flat/1.0"
    exclude-result-prefixes="#all"
    >
    <xsl:output method="xml" indent="yes"/>
    
    <xsl:template match="j:streamText">
        <xsl:copy copy-namespaces="no">
            <xsl:sequence select="@*"/>
            <xsl:for-each-group select="node()" 
                group-adjacent=". instance of text()">
                <xsl:choose>
                    <xsl:when test="current-grouping-key()">
                        <xsl:variable name="text" as="xs:string" 
                            select="string-join(current-group(), ' ')"/>
                        <xsl:for-each select="(for $t in tokenize($text, '&#x0a;') return normalize-space($t))[.]">
                            <tei:seg><xsl:value-of select="."/></tei:seg>
                        </xsl:for-each>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:sequence select="current-group()"/>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:for-each-group>
        </xsl:copy>
    </xsl:template>

    <xsl:template match="comment()">
        <xsl:copy/>
    </xsl:template>

    <xsl:template match="*">
        <xsl:copy copy-namespaces="no">
            <xsl:sequence select="@*"/>
            <xsl:apply-templates/>
        </xsl:copy>
    </xsl:template>
</xsl:stylesheet>
