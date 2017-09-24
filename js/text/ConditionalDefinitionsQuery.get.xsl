<!-- Parse conditional definitions query results into the result expected by a results box
<results>
    <result>
        <title/>
        <url/>
        <contexts>
            <previous/>
            <match/>
            <following/>
        </contexts>
    </result>
</results>


    Copyright 2017 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, v3 or later
-->
<xsl:stylesheet version="2.0"
                xmlns:r="http://jewishliturgy.org/ns/results/1.0"
                xmlns:tei="http://www.tei-c.org/ns/1.0"
                xmlns:j="http://jewishliturgy.org/ns/jlptei/1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:xs="http://www.w3.org/2001/XMLSchema">

    <!-- default language -->
    <xsl:param name="lang" as="xs:string?" select="'en'"/>

    <xsl:template match="r:conditional-results">
        <results>
            <xsl:apply-templates/>
        </results>
    </xsl:template>

    <xsl:template match="r:conditional-result">
        <result>
            <title><xsl:sequence select="tokenize(@resource, '/')[last()]"/></title>
            <url><xsl:sequence select="replace(@resource, '^/exist/restxq', '')"/></url>
        </result>
        <xsl:apply-templates/>
    </xsl:template>

    <xsl:template match="tei:fsDecl">
        <result>
            <title><xsl:sequence select="concat('...', @type)"/></title>
            <url><xsl:sequence select="replace(ancestor::r:conditional-result/@resource, '^/exist/restxq', '')"/></url>
            <xsl:apply-templates select="tei:fsDescr[1]"/>
        </result>
        <xsl:apply-templates select="tei:fDecl"/>
    </xsl:template>

    <xsl:template match="tei:fsDescr|tei:fDescr">
        <contexts>
            <match><xsl:sequence select="normalize-space(.)"/></match>
        </contexts>
    </xsl:template>

    <xsl:template match="tei:fDecl">
        <result>
            <title><xsl:sequence select="concat('......', @name)"/></title>
            <url><xsl:sequence select="replace(ancestor::r:conditional-result/@resource, '^/exist/restxq', '')"/></url>
            <xsl:apply-templates select="tei:fDescr[1]"/>
        </result>
    </xsl:template>


</xsl:stylesheet>