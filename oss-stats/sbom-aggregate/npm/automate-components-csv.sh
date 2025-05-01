<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:bom="http://cyclonedx.org/schema/bom/1.6">
    <xsl:output method="text" />

    <xsl:template match="/">
        <xsl:text>type,bom_ref,license-id,group,author,name,version,purl,path,description,vcs-url,vcs-comment,website-url,website-comment,issue-tracker-url,issue-tracker-comment,distribution-url,distribution-comment,hash-alg,hash-value&#10;</xsl:text>

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

            <xsl:variable name="author" select="bom:author"/>
            <xsl:call-template name="replace-commas">
                <xsl:with-param name="text" select="$author"/>
            </xsl:call-template><xsl:text>,</xsl:text>

            <xsl:variable name="name" select="bom:name"/>
            <xsl:call-template name="replace-commas">
                <xsl:with-param name="text" select="$name"/>
            </xsl:call-template><xsl:text>,</xsl:text>

            <xsl:value-of select="bom:version"/><xsl:text>,</xsl:text>
            <xsl:value-of select="bom:purl"/><xsl:text>,</xsl:text>

            <!-- Extract the 'cdx:npm:package:path' property -->
            <xsl:if test="bom:properties/bom:property[@name='cdx:npm:package:path']">
                <xsl:value-of select="bom:properties/bom:property[@name='cdx:npm:package:path']"/>
            </xsl:if><xsl:text>,</xsl:text>

            <!-- Extract and replace commas in the description -->
            <xsl:variable name="description" select="bom:description"/>
            <xsl:call-template name="replace-commas">
                <xsl:with-param name="text" select="$description"/>
            </xsl:call-template><xsl:text>,</xsl:text>

            <!-- Extract external references -->
            <!-- VCS -->
            <xsl:if test="bom:externalReferences/bom:reference[@type='vcs']/bom:url">
                <xsl:value-of select="bom:externalReferences/bom:reference[@type='vcs']/bom:url"/>
            </xsl:if><xsl:text>,</xsl:text>
            <xsl:if test="bom:externalReferences/bom:reference[@type='vcs']/bom:comment">
                <xsl:value-of select="bom:externalReferences/bom:reference[@type='vcs']/bom:comment"/>
            </xsl:if><xsl:text>,</xsl:text>


             <!-- Website -->
            <xsl:if test="bom:externalReferences/bom:reference[@type='website']/bom:url">
                <xsl:value-of select="bom:externalReferences/bom:reference[@type='website']/bom:url"/>
            </xsl:if><xsl:text>,</xsl:text>
            <xsl:if test="bom:externalReferences/bom:reference[@type='website']/bom:comment">
                <xsl:value-of select="bom:externalReferences/bom:reference[@type='website']/bom:comment"/>
            </xsl:if><xsl:text>,</xsl:text>

            <!-- Issue Tracker -->
            <xsl:if test="bom:externalReferences/bom:reference[@type='issue-tracker']/bom:url">
                <xsl:value-of select="bom:externalReferences/bom:reference[@type='issue-tracker']/bom:url"/>
            </xsl:if><xsl:text>,</xsl:text>
            <xsl:if test="bom:externalReferences/bom:reference[@type='issue-tracker']/bom:comment">
                <xsl:value-of select="bom:externalReferences/bom:reference[@type='issue-tracker']/bom:comment"/>
            </xsl:if><xsl:text>,</xsl:text>

            <!-- Distribution -->
            <xsl:if test="bom:externalReferences/bom:reference[@type='distribution']/bom:url">
                <xsl:value-of select="bom:externalReferences/bom:reference[@type='distribution']/bom:url"/>
            </xsl:if><xsl:text>,</xsl:text>
            <xsl:if test="bom:externalReferences/bom:reference[@type='distribution']/bom:comment">
                <xsl:value-of select="bom:externalReferences/bom:reference[@type='distribution']/bom:comment"/>
            </xsl:if><xsl:text>,</xsl:text>
            

            <!-- Extract hash algorithm and value -->
            <xsl:if test="bom:externalReferences/bom:reference[@type='distribution']/bom:hashes/bom:hash">
                <xsl:value-of select="bom:externalReferences/bom:reference[@type='distribution']/bom:hashes/bom:hash/@alg"/>
            </xsl:if><xsl:text>,</xsl:text>
            <xsl:if test="bom:externalReferences/bom:reference[@type='distribution']/bom:hashes/bom:hash">
                <xsl:value-of select="bom:externalReferences/bom:reference[@type='distribution']/bom:hashes/bom:hash"/>
            </xsl:if>


            <xsl:text>&#10;</xsl:text>

             
        </xsl:for-each>
    </xsl:template>

    <!-- Template to replace commas with ~ and remove quotes -->
    <xsl:template name="replace-commas">
        <xsl:param name="text"/>
        <xsl:choose>
            <!-- Handle commas by replacing them with ~ -->
            <xsl:when test="contains($text, ',')">
                <xsl:value-of select="substring-before($text, ',')"/>
                <xsl:text>~</xsl:text>
                <xsl:call-template name="replace-commas">
                    <xsl:with-param name="text" select="substring-after($text, ',')"/>
                </xsl:call-template>
            </xsl:when>
            <!-- Handle quotes by removing them -->
            <xsl:when test="contains($text, '&quot;')">
                <xsl:value-of select="substring-before($text, '&quot;')"/>
                <xsl:call-template name="replace-commas">
                    <xsl:with-param name="text" select="substring-after($text, '&quot;')"/>
                </xsl:call-template>
            </xsl:when>
            <!-- Otherwise, output the text as is -->
            <xsl:otherwise>
                <xsl:value-of select="$text"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>


</xsl:stylesheet>