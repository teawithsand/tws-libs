publish() {
    cd $1 && npm run build && npm publish --registry http://verdaccio:4873/; cd ..
}

publish "tws-stl";
publish "tws-stl-react";
publish "tws-gatsby-plugin";
publish "tws-player";
publish "tws-trans";
publish "tws-ui";
publish "tws-seo";
publish "tws-gallery";
publish "tws-peer";