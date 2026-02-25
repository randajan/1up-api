import { Form } from "../reforms";

export const apiForm = new Form("api", {
    fields:define=>{
        define("config", {
            fetch:{ type:"function", req:true },
            rootUrl: { type:"url", fb:"https://1up.cz/api/qr/gen", req:true },
            token: { type:"text", min:32, max:64, req:true },
            filename: { type:"text", max:32, fb:"qr", req:true },
            defaults:{ type:"object", req:true }
        });
    }
});


