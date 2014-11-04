<!--
    Template for style XML documents

    Open Siddur Project
    Copyright 2014 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3 or later
-->
<xsl:stylesheet 
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    exclude-result-prefixes="#all" 
    version="2.0"
    xmlns:tei="http://www.tei-c.org/ns/1.0" 
    xmlns:j="http://jewishliturgy.org/ns/jlptei/1.0"
    >
    <xsl:output method="xml" indent="yes"/>
    <xsl:template match="/*">
        <tei:TEI 
            xml:lang="{lang}"
            >
            <xsl:namespace name="j" select="'http://jewishliturgy.org/ns/jlptei/1.0'"/>
            <tei:teiHeader>
                <tei:fileDesc>
                    <tei:titleStmt>
                        <tei:title type="main" xml:lang="{lang}"><xsl:value-of select="title/main"/></tei:title>
                        <xsl:if test="title/alt/string()">
                            <tei:title type="alt" xml:lang="{title/altLang}"><xsl:value-of select="title/alt"/></tei:title>
                        </xsl:if>
                    </tei:titleStmt>
                    <tei:publicationStmt>
                        <tei:distributor>
                            <tei:ref target="http://opensiddur.org">Open Siddur Project</tei:ref>
                        </tei:distributor>
                        <tei:availability>
                            <tei:licence target="{license}"/>
                        </tei:availability>
                        <tei:date><xsl:value-of select="format-date(current-date(), '[Y0001]-[M01]-[D01]')"/></tei:date>
                    </tei:publicationStmt>
                    <tei:sourceDesc>
                        <tei:bibl>
                            <tei:ptr type="bibl" target="{replace(source, '^((/exist/restxq)?/api)?/', '/')}"/>
                            <tei:ptr type="bibl-content" target="#style"/>
                        </tei:bibl>
                    </tei:sourceDesc>
                </tei:fileDesc>
                <tei:revisionDesc>
                    <tei:change><xsl:comment>(optional) Replace this comment with a commit message</xsl:comment></tei:change>
                </tei:revisionDesc>
            </tei:teiHeader>
            <j:stylesheet xml:id="style" scheme="css">/* Styling document */

</j:stylesheet>
            <tei:text>
                <tei:body>
                    <tei:p>CSS</tei:p>
                </tei:body>
            </tei:text>
        </tei:TEI>

    </xsl:template>
</xsl:stylesheet>
