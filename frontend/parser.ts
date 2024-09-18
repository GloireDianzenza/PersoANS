import {Stmt,Program,Expression,BinaryExpression,Identifier,NumericLiteral, VariableDeclaration, AssignExpression, Property, ObjectLiteral, CallExpression, MemberExpression, FunctionDeclaration} from "./ast.ts";
import {tokenize,Token,TokenType} from "./lexer.ts";

export default class Parser{
    private tokens: Token[] = [];

    private notEOF():boolean{
        return this.tokens[0].type !== TokenType.EOF;
    }

    public produceAST(src:string):Program{
        this.tokens = tokenize(src);
        const program: Program = {kind:"Program",body:[]};
        while(this.notEOF()){
            program.body.push(this.parse_statement());
        }
        return program;
    }

    private parse_statement():Stmt{
        switch(this.at().type){
            case TokenType.Let:
            case TokenType.Const:
                return this.parse_var_declaration();
            case TokenType.Fn:
                return this.parse_fn_declaration();
            default:
                return this.parse_exp();
        }
    }

    parse_fn_declaration(): Stmt {
      this.eat();
      const name = this.expect(TokenType.Identifier,"Expected function name after keyword").value;
      const args = this.parse_args();
      const params : string[] = [];
      for(const arg of args){
        if(arg.kind !== "Identifier"){
            console.log(arg);
            throw 'parameters expected of type string';
        }
        params.push((arg as Identifier).symbol);
      }

      this.expect(TokenType.OpenBrace,"Expect function body following declaration");
      const body : Stmt[] = [];
      while(this.at().type !== TokenType.EOF && this.at().type !== TokenType.CloseBrace){
        body.push(this.parse_statement());
      }
      this.expect(TokenType.CloseBrace,"Expected closing brace");
      const fn = {kind:"FunctionDeclaration",body,name,parameters:params} as FunctionDeclaration;
      return fn;
    }

    parse_var_declaration(): Stmt {
      const isConstant = this.eat().type == TokenType.Const;
      const ident = this.expect(TokenType.Identifier,"Expected identifier after var declaration").value;
      if(this.at().type == TokenType.SemiColon){
        this.eat();
        if(isConstant){
            throw "Must assign value to constant expression !";
        }
        return {kind:"VarDeclaration",constant:false,identifier:ident,value:undefined} as VariableDeclaration;
      }

      this.expect(TokenType.Equals,"Expected equals after identifier !");

      const declaration = {kind:"VarDeclaration",constant:isConstant,value:this.parse_exp(),identifier:ident} as VariableDeclaration;

      this.expect(TokenType.SemiColon,"Expected semi-colon after declaration !")

      return declaration;
    }

    private parse_exp():Expression{
        return this.parse_assignment_exp();
    }

    parse_assignment_exp(): Expression {
        const left = this.parse_object_exp();
        if(this.at().type == TokenType.Equals){
            this.eat();
            const value = this.parse_assignment_exp();
            return {kind:"AssignExpression",value:value,assign:left} as AssignExpression;
        }
        return left;
    }

    parse_object_exp():Expression {
        if(this.at().type !== TokenType.OpenBrace){
            return this.parse_additive_exp();
        }
        this.eat();
        const properties = new Array<Property>();
        while(this.notEOF() && this.at().type != TokenType.CloseBrace){
            const key = this.expect(TokenType.Identifier,"Key expected").value;
            if(this.at().type == TokenType.Comma){
                this.eat();
                properties.push({key,kind:"Property"} as Property);
                continue;
            }
            else if(this.at().type == TokenType.CloseBrace){
                properties.push({key,kind:"Property"} as Property);
                continue;
            }

            this.expect(TokenType.Colon,"Missing colon following key");
            const value = this.parse_exp();

            properties.push({kind:"Property",key,value} as Property);
            if(this.at().type != TokenType.CloseBrace){
                this.expect(TokenType.Comma,"Expected comma or closing brace");
            }
        }
        this.expect(TokenType.CloseBrace,"Object missing closing brace");
        return {kind:"ObjectLiteral",properties} as ObjectLiteral;
    }

    private parse_additive_exp():Expression{
        let left = this.parse_multiplicative_exp();
        while(this.at().value == "+" || this.at().value == "-"){
            const operator = this.eat().value;
            const right = this.parse_multiplicative_exp();
            left = {
              left: left,
              right: right,
              operator: operator,
              kind: "BinaryExpression"
            } as BinaryExpression
        }
        return left;
    }
    
    private parse_multiplicative_exp():Expression{
        let left = this.parse_call_member_exp();
        while(this.at().value == "/" || this.at().value == "*" || this.at().value == "%"){
            const operator = this.eat().value;
            const right = this.parse_primary_exp();
            left = {
              left: left,
              right: right,
              operator: operator,
              kind: "BinaryExpression"
            } as BinaryExpression
        }
        return left;
    }

    parse_call_member_exp() : Expression {
        const member = this.parse_member_exp();
        if(this.at().type == TokenType.OpenParen){
            return this.parse_call_exp(member);
        }
        return member;
    }
    parse_call_exp(caller: Expression) : Expression {
      let call_exp : Expression = {kind:"CallExpression",caller,args:this.parse_args()} as CallExpression;
      if(this.at().type == TokenType.OpenParen){
        call_exp = this.parse_call_exp(call_exp);
      }
      return call_exp;
    }
    parse_args() : Expression[] {
      this.expect(TokenType.OpenParen,"Expected open parenthesis");
      const args : Expression[] = this.at().type == TokenType.CloseParen ? [] : this.parse_args_list();
      this.expect(TokenType.CloseParen,"Expected closing parenthesis");
      return args;
    }
    parse_args_list() : Expression[] {
      const args : Expression[] = [this.parse_exp()];
      while(this.at().type == TokenType.Comma && this.eat()){
        args.push(this.parse_assignment_exp());
      }
      return args;
    }
    parse_member_exp() : Expression {
        let obj = this.parse_primary_exp();
        while(this.at().type == TokenType.Dot || this.at().type == TokenType.OpenBracket){
            const operator = this.eat();
            let property:Expression;
            let computed:boolean;

            if(operator.type == TokenType.Dot){
                computed = false;
                property = this.parse_primary_exp();
                if(property.kind != "Identifier"){
                    throw "Cannot use dot without right side !"
                }
            }
            else{
                computed = true;
                property = this.parse_exp();
                this.expect(TokenType.CloseBracket,"Missing closing bracket !")
            }

            obj = {kind:"MemberExpression",computed,object:obj,property} as MemberExpression;
        }

        return obj;
    }
    
    private parse_primary_exp():Expression{
        const tokenType = this.at().type;

        switch(tokenType){
            case TokenType.Identifier:
                return {kind:"Identifier",symbol:this.eat().value} as Identifier;
            case TokenType.Number:
                return {kind:"NumericLiteral",value:parseFloat(this.eat().value)} as NumericLiteral;
            case TokenType.OpenParen:
                {
                    this.eat();
                    const value = this.parse_exp();
                    this.expect(TokenType.CloseParen,"Unexpected token found. Expected closing parenthesis.");
                    return value;
                }
            default:
                console.log("Unexpected token found, ",this.at());
                Deno.exit(1);
        }
    }
    private expect(tokenType: TokenType, err: string): Token {
        const token = this.tokens.shift() as Token;
        if(!token || token.type != tokenType){
            console.error("Parser error: ",err,token,"expected: ",tokenType);
            Deno.exit(1);
        }
        return token;
    }

    private at():Token{
        return this.tokens[0] as Token;
    }

    private eat():Token{
        const prev = this.tokens.shift() as Token;
        return prev;
    }
}