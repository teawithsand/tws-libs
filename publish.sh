publish() {
    cd $1 && npm run build && npm publish --registry http://verdaccio:4873/; cd ..
}

publish "tws-stl";
publish "tws-stl-react";
publish "tws-ui";

publish "tws-gatsby-plugin";
publish "tws-gatsby-plugin-sw";
publish "tws-goatcounter-gatsby-plugin";

publish "tws-seo";
publish "tws-trans";

publish "tws-gallery";
publish "tws-player";

publish "tws-peer";
publish "tws-peer-react";

publish "tws-qr";
publish "tws-config";