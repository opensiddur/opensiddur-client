<!-- Parse conditional definitions queries

    Copyright 2017 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, v3 or later
-->
<xsl:stylesheet version="2.0"
                xmlns:r="http://jewishliturgy.org/ns/results/1.0"
                xmlns:tei="http://www.tei-c.org/ns/1.0"
                xmlns:j="http://jewishliturgy.org/ns/jlptei/1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

    <!-- default language -->
    <xsl:param name="lang" as="xs:string" select="'en'"/>

    <xsl:template match="r:conditional-results">
        <results>
            <xsl:apply-templates/>
        </results>
    </xsl:template>

    <xsl:template match="r:conditional-result">
        <result>
            <type><xsl:value-of select="@type"/></type>
            <resource><xsl:sequence select="replace(@resource, '^/exist/restxq', '')"/></resource>
            <xsl:apply-templates/>
        </result>
    </xsl:template>

    <xsl:template match="tei:fsDecl">
        <fs>
            <xsl:apply-templates select="tei:fsDescr[lang($lang)]"/>
            <xsl:apply-templates select="tei:fDecl"/>
        </fs>
    </xsl:template>

    <xsl:template match="tei:fsDescr|tei:fDescr">
        <desc><xsl:value-of select="."/></desc>
    </xsl:template>

    <xsl:template match="tei:fDecl">
        <f>
            <name><xsl:value-of select="@name"/></name>
            <xsl:apply-templates select="tei:fDescr[lang($lang)]"/>
            <switch><xsl:value-of select="j:vSwitch/@type"/></switch>
            <default><xsl:apply-templates select="tei:vDefault/*"/></default>
        </f>
    </xsl:template>

    <xsl:template match="j:yes|j:no|j:maybe|j:on|j:off">
        <xsl:value-of select="local-name(.)"/>
    </xsl:template>

</xsl:stylesheet>