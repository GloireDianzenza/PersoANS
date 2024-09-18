export interface Token{
    value:string,type:TokenType
}

export enum TokenType{
    Number,
    Identifier,
    Equals,
    OpenParen,
    CloseParen,
    Comma,Colon,
    OpenBrace,
    CloseBrace,
    OpenBracket,
    CloseBracket,
    BinaryOperator,
    Let,
    Const,
    Fn,
    SemiColon,
    Dot,
    EOF,
}

const KEYWORDS: Record<string,TokenType> = {
    "let":TokenType.Let,"const":TokenType.Const,"fn":TokenType.Fn
}

function token(value:string = "",type:TokenType): Token{
    return {value,type};
}

function isAlpha(src:string): boolean{
    return src.toUpperCase() != src.toLowerCase();
}

function isSkippable(src:string):boolean{
    return src == " " || src == "\n" || src == "\t" || src == "" || src == "\r";
}

function isInteger(src:string): boolean{
    const c = src.charCodeAt(0);
    const bounds = ["0".charCodeAt(0),"9".charCodeAt(0)];
    return c >= bounds[0] && c <= bounds[1];
}

export function tokenize(srcCode:string) : Token[]{
    const tokens = new Array<Token>();
    const src = srcCode.split("");
    while(src.length > 0){
        if(src[0] == "("){
            tokens.push(token(src.shift(),TokenType.OpenParen));
        }
        else if(src[0] == ")"){
            tokens.push(token(src.shift(),TokenType.CloseParen));
        }
        else if(src[0] == "["){
            tokens.push(token(src.shift(),TokenType.OpenBracket));
        }
        else if(src[0] == "]"){
            tokens.push(token(src.shift(),TokenType.CloseBracket));
        }
        else if(["+","-","*","/","%"].includes(src[0])){
            tokens.push(token(src.shift(),TokenType.BinaryOperator));
        }
        else if(src[0] == "="){
            tokens.push(token(src.shift(),TokenType.Equals))
        }
        else if(src[0] == ";"){
            tokens.push(token(src.shift(),TokenType.SemiColon))
        }
        else if(src[0] == ","){
            tokens.push(token(src.shift(),TokenType.Comma))
        }
        else if(src[0] == ":"){
            tokens.push(token(src.shift(),TokenType.Colon))
        }
        else if(src[0] == "{"){
            tokens.push(token(src.shift(),TokenType.OpenBrace))
        }
        else if(src[0] == "}"){
            tokens.push(token(src.shift(),TokenType.CloseBrace))
        }
        else if(src[0] == "."){
            tokens.push(token(src.shift(),TokenType.Dot))
        }
        else{
            if(isInteger(src[0])){
                let num = "";
                while(src.length > 0 && (isInteger(src[0]) || (src[0] == "." && !num.includes(".")))){
                    num += src.shift();
                }
                tokens.push(token(num,TokenType.Number));
            }
            else if(isAlpha(src[0])){
                let ident = "";
                while(src.length > 0 && isAlpha(src[0])){
                    ident += src.shift();
                }
                const reserved = KEYWORDS[ident];
                if(typeof reserved != "number"){
                    tokens.push(token(ident,TokenType.Identifier));
                }
                else{
                    tokens.push(token(ident,reserved));
                }
            }
            else if(isSkippable(src[0])){
                src.shift();
            }
            else{
                console.error("Error: ",src);
                console.log("Unrecognized character found in source: ",src[0]);
                Deno.exit(1);
            }
        }
    }
    tokens.push(token("EndOfFile",TokenType.EOF));
    return tokens;
}