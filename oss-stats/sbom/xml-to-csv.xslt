<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:bom="http://cyclonedx.org/schema/bom/1.4">
    <xsl:output method="text" />

    <xsl:template match="/">
        <xsl:text>type,bom_ref,license-id,group,name,version,description&#10;</xsl:text>

        <!-- Iterate over each component in the BOM -->
        <xsl:for-each select="//bom:component">
            <!-- Extracting the attributes and elements -->
            <xsl:value-of select="@type"/><xsl:text>,</xsl:text>
            <xsl:value-of select="@bom-ref"/><xsl:text>,</xsl:text>

            <!-- Extract the license id -->
            <xsl:if test="bom:licenses/bom:license/bom:id">
                <xsl:value-of select="bom:licenses/bom:license/bom:id"/>
            </xsl:if>
            <xsl:text>,</xsl:text>

            <!-- The 'group' element is optional, so check if it exists -->
            <xsl:if test="bom:group">
                <xsl:value-of select="bom:group"/>
            </xsl:if>
            <xsl:text>,</xsl:text>

            <xsl:value-of select="bom:name"/><xsl:text>,</xsl:text>
            <xsl:value-of select="bom:version"/><xsl:text>,</xsl:text>

            <!-- Extract and replace commas in the description -->
            <xsl:variable name="description" select="bom:description"/>
            <xsl:call-template name="replace-commas">
                <xsl:with-param name="text" select="$description"/>
            </xsl:call-template>
            <xsl:text>&#10;</xsl:text>
        </xsl:for-each>
    </xsl:template>

    <!-- Template to replace commas with ~ -->
    <xsl:template name="replace-commas">
        <xsl:param name="text"/>
        <xsl:choose>
            <xsl:when test="contains($text, ',')">
                <!-- Replace comma with ~ and process the rest -->
                <xsl:value-of select="substring-before($text, ',')"/>
                <xsl:text>~</xsl:text>
                <xsl:call-template name="replace-commas">
                    <xsl:with-param name="text" select="substring-after($text, ',')"/>
                </xsl:call-template>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="$text"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
</xsl:stylesheet>
