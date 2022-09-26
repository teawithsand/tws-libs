# tws-gatsby-plugin

Plugin for handling misc things in gatsby.

It does:
- Rename webpack produced files to have random(hash based) names rather than names like `src--components--blah.js`
- Removes inlined CSS from HTML files. Instead CSS stylesheets are included.
- Handles gatsby redirects via ``<meta http-equiv="refresh" ... />` HTML meta tag
- (configurable) Removes generator tag. By default it removes gatsby version only, and replaces tag with just "Gatsby"
- (configurable) Prefixes routes with one of languages provided and passes that language via page context
- (configurable) Simplifies gatsby config creation via providing some predefined values and builders for configs