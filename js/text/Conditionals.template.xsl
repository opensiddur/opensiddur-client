<!--
    Template for conditionals documents

    Open Siddur Project
    Copyright 2014, 2017 Efraim Feinstein, efraim@opensiddur.org
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
            xml:lang="{lang}">
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
                            <tei:title><xsl:value-of select="sourceTitle"/></tei:title>
                            <tei:ptr type="bibl" target="{replace(source, '^((/exist/restxq)?/api)?/', '/')}"/>
                            <tei:ptr type="bibl-content" target="#cond"/>
                        </tei:bibl>
                    </tei:sourceDesc>
                </tei:fileDesc>
                <tei:revisionDesc>
                    <tei:change><xsl:comment>(optional) Replace this comment with a commit message</xsl:comment></tei:change>
                </tei:revisionDesc>
            </tei:teiHeader>
            <tei:fsdDecl xml:id="cond">
                <xsl:choose>
                    <xsl:when test="exists(content)">
                        <xsl:sequence select="content/*"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <tei:fsDecl type="TYPE_ME">
                            <tei:fsDescr xml:lang="en"><!--Describe the feature type here--></tei:fsDescr>
                            <tei:fDecl name="NAME_ME">
                                <tei:fDescr><!--Describe the feature here--></tei:fDescr>
                                <j:vSwitch type="yes-no-maybe"/>
                                <tei:vDefault>
                                    <j:yes/>
                                </tei:vDefault>
                            </tei:fDecl>
                        </tei:fsDecl>
                    </xsl:otherwise>
                </xsl:choose>
            </tei:fsdDecl>    
        </tei:TEI>
    </xsl:template>
</xsl:stylesheet>
