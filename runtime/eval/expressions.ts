import { AssignExpression, BinaryExpression, CallExpression, FunctionDeclaration, Identifier, ObjectLiteral, VariableDeclaration } from "../../frontend/ast.ts";
import { TokenType } from "../../frontend/lexer.ts";
import Environment from "../environment.ts";
import { NumberVal, MK_NUMBER, RuntimeVal, MK_NULL, ObjectVal, NativeFunctionVal, FunctionVal } from "../values.ts";
import { evaluate } from "./statements.ts";

export function eval_numeric_binary_expression(left:NumberVal,right:NumberVal,operator:string):NumberVal{
    let result :number = 0;
    switch(operator){
        case "+":
            result = left.value + right.value;
            break;
        case "-":
            result = left.value - right.value;
            break;
        case "*":
            result = left.value * right.value;
            break;
        case "/":
            result = left.value / right.value;
            break;
        default:
            result = left.value % right.value;
            break;
    }

    return MK_NUMBER(result);
}

export function evaluate_binary_expression(binop:BinaryExpression,env:Environment):RuntimeVal{
    const leftSide = evaluate(binop.left,env);
    const rightSide = evaluate(binop.right,env);
    if(leftSide.type == "number" && rightSide.type == "number"){
        return eval_numeric_binary_expression(leftSide as NumberVal,rightSide as NumberVal,binop.operator);
    }
    return MK_NULL();
}

export function evaluate_identifier(ident: Identifier, env: Environment): RuntimeVal {
    const val = env.lookUpVar(ident.symbol);
    return val;
}

export function eval_var_declaration(node: VariableDeclaration, env: Environment): RuntimeVal {
    const value = node.value ? evaluate(node.value,env) : MK_NULL();
    return env.declareVariable(node.identifier,value,node.constant);
}

export function eval_assignment_expression(node:AssignExpression,env:Environment){
    if(node.assign.kind !== "Identifier")throw `Invalid assign expression ${node.assign}`;
    const varname = (node.assign as Identifier).symbol;
    return env.assignVariable(varname,evaluate(node.value,env));
}

export function eval_object_expression(obj:ObjectLiteral,env:Environment):RuntimeVal{
    const objet = {type:"object",properties:new Map()} as ObjectVal;
    for(const {key,value} of obj.properties){

        const runtimeVal = (value == undefined) ? env.lookUpVar(key) : evaluate(value,env);
        
        objet.properties.set(key,runtimeVal);
    }
    return objet;
}

export function eval_call_expression(exp:CallExpression,env:Environment):RuntimeVal{
    const args = exp.args.map((arg)=>evaluate(arg,env));
    const fn = evaluate(exp.caller,env);
    if(fn.type == "native"){
        const result = (fn as NativeFunctionVal).caller(env,args);
        return result;
    }
    else if(fn.type == "function"){
        const func = fn as FunctionVal;
        const scope = new Environment(func.variableEnv);
        for(let i = 0;i < func.parameters.length;i++){
            const varname = func.parameters[i];
            scope.declareVariable(varname,args[i]);
        }

        let result:RuntimeVal = MK_NULL();
        for(const stmt of func.body){
            result = evaluate(stmt,scope);
        }
        return result;
    }
    else{
        throw "Cannot throw value that ain't a function: "+fn;
    }
}