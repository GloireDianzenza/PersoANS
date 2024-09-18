import { Stmt } from "../frontend/ast.ts";
import Environment from "./environment.ts";

export type ValueType = "null" | "number" | "boolean" | "object" | 'native' | 'function'

export interface RuntimeVal{
    type:ValueType
}

export interface NullVal extends RuntimeVal{
    type:"null",value:null
}

export interface NumberVal extends RuntimeVal{
    type:"number",value:number
}

export interface BooleanVal extends RuntimeVal{
    type:"boolean",value:boolean
}

export interface ObjectVal extends RuntimeVal{
    type:"object",properties:Map<string,RuntimeVal>
}

export function MK_NUMBER(n:number=0):NumberVal{
    return {type:"number",value:n} as NumberVal;
}

export function MK_NULL():NullVal{
    return {type:"null",value:null} as NullVal;
}

export function MK_BOOL(v:boolean=false):BooleanVal{
    return {type:"boolean",value:v} as BooleanVal;
}

export type FunctionCall = (env:Environment,args:RuntimeVal[]) => RuntimeVal;

export interface NativeFunctionVal extends RuntimeVal{
    type:"native";caller:FunctionCall
}

export function MK_NATIVE_FN(call:FunctionCall):NativeFunctionVal{
    return {type:"native",caller:call} as NativeFunctionVal;
}

export interface FunctionVal extends RuntimeVal{
    type:"function";name:string;parameters:string[];variableEnv:Environment;
    body:Stmt[]
}