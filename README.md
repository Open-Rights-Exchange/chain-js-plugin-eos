# running examples

`npm run example {path to file}`

`npm run example src/plugin/examples/transaction.ts`

*If you'd like to run the example and have the example use your local chain-js code instead of the chain-js downloaded from npm, you can append :local*

`npm run example:local src/plugin/examples/transaction.ts`

# building the server side plugin


`npm run build`

*append :local to the build command if you'd like to build using your local chain-js project instead of the package downloaded from npm*

`npm run build:local`


# building the browser plugin

*Note that this is still a work in progress, it works, but needs refinement*

`npm run webpack:local`
