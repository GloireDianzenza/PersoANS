import { MK_BOOL, MK_NATIVE_FN, MK_NULL, MK_NUMBER, RuntimeVal } from "./values.ts";

export function createGlobalEnvironment(){
    const scope = new Environment();
    scope.declareVariable("null",MK_NULL(),true);
    scope.declareVariable("pi",MK_NUMBER(Math.PI),true)
    scope.declareVariable("true",MK_BOOL(true),true)
    scope.declareVariable("false",MK_BOOL(false),true)

    scope.declareVariable("print",MK_NATIVE_FN((scope,args)=>{
        console.log(...args);
        return MK_NULL();
    }),true);

    function timeFunction(env:Environment,args:RuntimeVal[]){
        return MK_NUMBER(Date.now());
    }

    scope.declareVariable("time",MK_NATIVE_FN(timeFunction),true);

    return scope;
}

export default class Environment{
    private parent?:Environment;
    private variables:Map<string,RuntimeVal>;
    private constants:Set<string>;

    constructor(parentEnv?:Environment){
        const global = parentEnv ? true : false;
        this.parent = parentEnv;
        this.variables = new Map();
        this.constants = new Set();
    }

    public declareVariable(variableName: string, value: RuntimeVal = MK_NULL(), constant: boolean = false) : RuntimeVal{
        if(this.variables.has(variableName)){
            throw `Cannot declare variable ${variableName}; already declared`;
        }
        this.variables.set(variableName,value);
        if(constant)this.constants.add(variableName);
        return value;
    }

    public assignVariable(variableName:string,value:RuntimeVal) : RuntimeVal{
        const env = this.resolve(variableName);
        if(env.constants.has(variableName)){
            throw "Cannot assign variable : it already exists but especially it is a constant !"
        }
        env.variables.set(variableName,value);
        return value;
    }

    public resolve(variableName:string):Environment{
        if(this.variables.has(variableName))return this;
        if(this.parent == undefined)throw `Cannot resolve ${variableName}; doesn't exist`;
        return this.parent.resolve(variableName);
    }

    public lookUpVar(variableName:string):RuntimeVal{
        const env = this.resolve(variableName);
        return env.variables.get(variableName) as RuntimeVal;
    }
}