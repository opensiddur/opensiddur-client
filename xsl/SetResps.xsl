<!-- Set responsibility statements

    Open Siddur Project
    Copyright 2014 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3 or later
-->
<xsl:stylesheet
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    version="2.0"
    >
    <xsl:param name="new-respStmts" as="document-node(element(respStmts))"/>

    <xsl:template match="respStmt">
        <xsl:if test="string(respName)">
            <tei:respStmt>
                <tei:resp key="{respType}"><xsl:value-of select="respText"/></tei:resp>
                <tei:name ref="{respRef}"><xsl:value-of select="respName"/></tei:name>
            </tei:respStmt>
        </xsl:if>
    </xsl:template>

    <xsl:template match="tei:titleStmt">
        <xsl:copy copy-namespaces="no">
            <xsl:sequence select="@*"/>
            <xsl:apply-templates/>
            <xsl:apply-templates select="$new-respStmts/respStmts/respStmt"/>
        </xsl:copy>
    </xsl:template>

    <xsl:template match="tei:titleStmt/tei:respStmt"/>

    <xsl:template match="*">
        <xsl:copy copy-namespaces="no">
            <xsl:sequence select="@*"/>
            <xsl:apply-templates />
        </xsl:copy>
    </xsl:template>
    
    <xsl:template match="comment()|text()"><xsl:copy/></xsl:template>

</xsl:stylesheet>
