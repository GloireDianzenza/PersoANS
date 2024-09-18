import Parser from "./frontend/parser.ts";
import Environment, { createGlobalEnvironment } from "./runtime/environment.ts";
import {evaluate} from "./runtime/eval/statements.ts";
import { MK_BOOL, MK_NULL, MK_NUMBER } from "./runtime/values.ts";

async function run(filename:string) {
    const parser = new Parser();
    const env = createGlobalEnvironment();
    console.log("\nANS v1.0");

    const input = await Deno.readTextFile(filename);
    const program = parser.produceAST(input);
    const result = evaluate(program,env);
}

function ans(){
    const parser = new Parser();
    const env = createGlobalEnvironment();
    env.declareVariable("null",MK_NULL(),true);
    env.declareVariable("pi",MK_NUMBER(Math.PI),true)
    env.declareVariable("true",MK_BOOL(true),true)
    env.declareVariable("false",MK_BOOL(false),true)
    console.log("\nANS v1.0");
    while(true){
        let input = prompt(">  ");
        if(!input || input.includes("exit")){
            Deno.exit(1);
        }

        const program = parser.produceAST(input);
        const result = evaluate(program,env);
        console.log(result);

        console.log("------\n\n");
    }
}

run("./test.txt");