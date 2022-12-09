# In order to install sharp

1. Unplug all deps from package.json
2. Unplug local verdaccio registry
3. Install gatsby-sharp and sharp
4. Plug verdaccio and dps 
5. run npm install

TODO: report this bug to verdaciio or/and sharp git repos

Also: one has to downgrade npm to version 8 as version 9 does not support same auth
routine as version 8, and verdaccio supports only legacy auth.