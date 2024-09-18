import { BinaryExpression, Program, Stmt, NumericLiteral, Identifier, VariableDeclaration, AssignExpression, ObjectLiteral, CallExpression, FunctionDeclaration } from "../../frontend/ast.ts";
import Environment from "../environment.ts";
import {  MK_NUMBER, RuntimeVal, MK_NULL, FunctionVal } from "../values.ts";
import { eval_assignment_expression, eval_call_expression, eval_object_expression, eval_var_declaration, evaluate_binary_expression, evaluate_identifier } from "./expressions.ts";


export function evaluate_program(prog:Program,env:Environment):RuntimeVal{
    let lastEvaluated : RuntimeVal = MK_NULL();
    for(const statement of prog.body){
        lastEvaluated = evaluate(statement,env);
    }
    return lastEvaluated;
}

export function evaluate(node:Stmt,env:Environment) : RuntimeVal{
    switch(node.kind){
        case "NumericLiteral":
            return MK_NUMBER((node as NumericLiteral).value);
        case "Program":
            return evaluate_program(node as Program,env);
        case "BinaryExpression":
            return evaluate_binary_expression(node as BinaryExpression,env);
        case "Identifier":
            return evaluate_identifier(node as Identifier,env);
        case "VarDeclaration":
            return eval_var_declaration(node as VariableDeclaration,env);
        case "AssignExpression":
            return eval_assignment_expression(node as AssignExpression,env);
        case "ObjectLiteral":
            return eval_object_expression(node as ObjectLiteral,env);
        case "CallExpression":
            return eval_call_expression(node as CallExpression,env);
        case "FunctionDeclaration":
            return eval_func_declaration(node as FunctionDeclaration,env);
        default:
            console.error("Not setup yet for interpretation, ",node);
            Deno.exit(1);
    }
}

export function eval_func_declaration(node:FunctionDeclaration,env:Environment):RuntimeVal{
    const fn = {type:"function",body:node.body,name:node.name,parameters:node.parameters,variableEnv:env} as FunctionVal;

    return env.declareVariable(node.name,fn,true);
}