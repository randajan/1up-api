import sapp, { argv } from "@randajan/simple-lib";
import ImportGlobPlugin from 'esbuild-plugin-import-glob';


sapp(argv.isBuild, {
    mode:"node",
    lib:{
        entries:[
            "index.js", "consts.js", "forms/configForm.js", "forms/styleForm.js", "forms/contentForms.js"
        ],
    },
    plugins:[
        ImportGlobPlugin.default()
    ],
})