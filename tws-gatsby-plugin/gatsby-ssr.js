exports.onPreRenderHTML = (
    { getHeadComponents, replaceHeadComponents },
    { generatorTagValue = "Gatsby" } = {},
) => {
    // Remove/set generator tag
    {
        const isGeneratorMetaTag = (hc) => hc.type === "meta" && hc.props.name === "generator"
        let headComponents = getHeadComponents()
        if (generatorTagValue) {
            for (const hc of headComponents) {
                if (isGeneratorMetaTag(hc))
                    hc.props.content = generatorTagValue
            }
        } else {
            headComponents = headComponents.filter((hc) => !isGeneratorMetaTag(hc))
        }

        replaceHeadComponents(headComponents)
    }

    // Do not render CSS into HTML directly.
    // Instead provide external stylesheet
    // When SASS is in use

    // See https://github.com/gatsbyjs/gatsby/issues/1526
    //  l0co commented on Oct 26, 2018 
    {
        if (process.env.NODE_ENV === "production") {
            getHeadComponents().forEach(el => {
                if (el.type === "style" && el.props["data-href"]) {
                    el.type = "link"
                    el.props["href"] = el.props["data-href"]
                    el.props["rel"] = "stylesheet"
                    el.props["type"] = "text/css"

                    delete el.props["data-href"]
                    delete el.props["dangerouslySetInnerHTML"]
                }
            })
        }
    }
}
