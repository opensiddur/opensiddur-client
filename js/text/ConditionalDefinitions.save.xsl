<!-- Save a conditionals document
    The input is the conditionals document, a parameter contains the

    Open Siddur Project
    Copyright 2016 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3 or later
-->
<xsl:stylesheet version="2.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:ixsl="http://saxonica.com/ns/interactiveXSLT"
                xmlns:xs="http://www.w3.org/2001/XMLSchema"
                xmlns:tei="http://www.tei-c.org/ns/1.0"
                xmlns:j="http://jewishliturgy.org/ns/jlptei/1.0">
    <xsl:param name="new-definitions" as="element(definitions)"/>

    <xsl:template match="definitions">
        <tei:fsdDecl xml:id="decls">
            <xsl:apply-templates/>
        </tei:fsdDecl>
    </xsl:template>

    <xsl:template match="definition">
        <tei:fsDecl type="{name}">
            <xsl:apply-templates select="(description, feature)"/>
        </tei:fsDecl>
    </xsl:template>

    <xsl:template match="description">
        <xsl:variable name="element-name" as="xs:string"
                      select="if (parent::definition) then 'tei:fsDescr' else 'tei:fDescr'"/>
        <xsl:element name="{$element-name}">
            <xsl:attribute name="xml:lang" select="lang"/>
            <xsl:value-of select="desc"/>
        </xsl:element>
    </xsl:template>

    <xsl:template match="feature">
        <tei:fDecl>
            <xsl:attribute name="name" select="name"/>
            <xsl:apply-templates select="(description, type)"/>
            <xsl:if test="default">
                <tei:vDefault>
                    <xsl:apply-templates select="default"/>
                </tei:vDefault>
            </xsl:if>
        </tei:fDecl>
    </xsl:template>

    <xsl:template match="type[.=('yes-no-maybe', 'on-off', 'yes-no')]">
        <j:vSwitch>
            <xsl:attribute name="type" select="."/>
        </j:vSwitch>
    </xsl:template>

    <xsl:template match="type[.='string']">
        <tei:vRange>
            <tei:string/>
        </tei:vRange>
    </xsl:template>

    <xsl:template match="value[lower(.)=('yes','no','maybe','on','off')]">
        <xsl:element name="j:{lower(.)}"/>
    </xsl:template>

    <xsl:template match="value[not(lower(.)=('yes','no','maybe','on','off'))]">
        <tei:string><xsl:sequence select="string(.)"/></tei:string>
    </xsl:template>

    <xsl:template match="default[not(normalize-space(expression))]">
        <xsl:apply-templates select="value"/>
    </xsl:template>

    <xsl:template match="default[normalize-space(expression)]">
        <tei:if>
            <xsl:sequence select="ixsl:call(ixsl:window(), 'conditionalsToXmlParser.parse', expression/string())"/>
            <tei:then/>
            <xsl:apply-templates select="value"/>
        </tei:if>
    </xsl:template>

</xsl:stylesheet>