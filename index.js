import sapp, { argv } from "@randajan/simple-lib";
import ImportGlobPlugin from 'esbuild-plugin-import-glob';


sapp(argv.isBuild, {
    mode:"node",
    lib:{
        entries:[
            "index.js", "4server.js"
        ],
    },
    plugins:[
        ImportGlobPlugin.default()
    ],
})