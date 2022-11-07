publish() {
    cd $1 && npm publish --registry http://verdaccio:4873/; cd ..
}

npm run build --workspaces

publish "tws-stl";
publish "tws-stl-react";
publish "tws-gatsby-plugin";
publish "tws-player";
publish "tws-trans";