export type NodeType = "Program" | "NumericLiteral" | "Identifier" | "BinaryExpression" | "CallExpression" | "FunctionDeclaration" | "VarDeclaration" | "AssignExpression" | "Property" | "ObjectLiteral" | "MemberExpression"

export interface Stmt{
    kind:NodeType
}

export interface Program extends Stmt{
    kind:"Program";
    body:Stmt[]
}

export interface Expression extends Stmt{}

export interface VariableDeclaration extends Stmt{
    kind:"VarDeclaration",constant:boolean,
    identifier:string,value?:Expression
}

export interface FunctionDeclaration extends Stmt{
    kind:"FunctionDeclaration",parameters:string[],name:string,body:Stmt[]
}

export interface BinaryExpression extends Expression{
    left:Expression;right:Expression;operator:string,kind:"BinaryExpression"
}

export interface Identifier extends Expression{
    kind:"Identifier",symbol:string
}

export interface NumericLiteral extends Expression{
    kind:"NumericLiteral";value:number
}

export interface ObjectLiteral extends Expression{
    kind:"ObjectLiteral",properties:Property[]
}
export interface Property extends Expression{
    kind:"Property",key:string,value?:Expression
}

export interface AssignExpression extends Expression{
    kind:"AssignExpression",assign:Expression,value:Expression
}

export interface MemberExpression extends Expression{
    kind:"MemberExpression",object:Expression,property:Expression,computed:boolean
}

export interface CallExpression extends Expression{
    kind:"CallExpression",caller:Expression,args:Expression[]
}