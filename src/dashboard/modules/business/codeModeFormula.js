import CodeMirror from "codemirror";
import Config from "dashboard/modules/common/Config";

const config = new Config();
const CALC_FN = config.DATA_BIND.CALC_FN || [];
let calcFnList = [];

CALC_FN.forEach(item => {
    if (item.children) {
        let fns = item.children.map(v => v.name);
        calcFnList = calcFnList.concat(fns);
    }
});

CodeMirror.defineMode("formula", function(config, parserConfig) {
    var indentUnit = config.indentUnit;
    var statementIndent = parserConfig.statementIndent;
    var jsonldMode = parserConfig.jsonld;
    var jsonMode = parserConfig.json || jsonldMode;
    var isTS = parserConfig.typescript;
    var wordRE = parserConfig.wordCharacters || /[\w$\xa1-\uffff]/;

    // Tokenizer
    var keywords = (function() {
        function kw(type) {
            return { type: type, style: "keyword" };
        }
        var operator = kw("operator");
        var formula = { type: "formula", style: "formula" };

        return (() => {
            let result = {};
            calcFnList.forEach(v => {
                result[v] = formula;
            });
            return result;
        })();
    })();

    var isOperatorChar = /[+\-*&%=<>!?|~^@]/;

    // Used as scratch variables to communicate multiple values without
    // consing up tons of objects.
    var type, content;
    function ret(tp, style, cont) {
        type = tp;
        content = cont;
        return style;
    }
    function tokenBase(stream, state) {
        var ch = stream.next();
        if (ch == '"' || ch == "'") {
            state.tokenize = tokenString(ch);
            return state.tokenize(stream, state);
        } else if (ch == "." && stream.match(/^\d+(?:[eE][+\-]?\d+)?/)) {
            return ret("number", "number");
        } else if (/[\[\]]/.test(ch)) {
            return ret("parentheses", "parentheses");
        } else if (/[{}\(\),;\:\.]/.test(ch)) {
            return ret(ch);
        } else if (
            ch == "0" &&
            stream.match(/^(?:x[\da-f]+|o[0-7]+|b[01]+)n?/i)
        ) {
            return ret("number", "number");
        } else if (/\d/.test(ch)) {
            stream.match(/^\d*(?:n|(?:\.\d*)?(?:[eE][+\-]?\d+)?)?/);
            return ret("number", "number");
        } else if (isOperatorChar.test(ch)) {
            if (ch != ">" || !state.lexical || state.lexical.type != ">") {
                if (stream.eat("=")) {
                    if (ch == "!" || ch == "=") stream.eat("=");
                } else if (/[<>*+\-]/.test(ch)) {
                    stream.eat(ch);
                    if (ch == ">") stream.eat(ch);
                }
            }
            return ret("operator", "operator", stream.current());
        } else if (wordRE.test(ch)) {
            stream.eatWhile(wordRE);
            var word = stream.current();
            if (state.lastType != ".") {
                if (keywords.propertyIsEnumerable(word)) {
                    var kw = keywords[word];
                    return ret(kw.type, kw.style, word);
                }
                if (
                    word == "async" &&
                    stream.match(/^(\s|\/\*.*?\*\/)*[\[\(\w]/, false)
                )
                    return ret("async", "keyword", word);
            }
            return ret("variable", "variable", word);
        }
    }

    function tokenString(quote) {
        return function(stream, state) {
            var escaped = false,
                next;

            while ((next = stream.next()) != null) {
                if (next == quote && !escaped) break;
                escaped = !escaped && next == "\\";
            }
            if (!escaped) state.tokenize = tokenBase;
            return ret("string", "string");
        };
    }

    var brackets = "([{}])";

    function JSLexical(indented, column, type, align, prev, info) {
        this.indented = indented;
        this.column = column;
        this.type = type;
        this.prev = prev;
        this.info = info;
        if (align != null) this.align = align;
    }

    function inScope(state, varname) {
        for (var v = state.localVars; v; v = v.next)
            if (v.name == varname) return true;
        for (var cx = state.context; cx; cx = cx.prev) {
            for (var v = cx.vars; v; v = v.next)
                if (v.name == varname) return true;
        }
    }

    function parseJS(state, style, type, content, stream) {
        var cc = state.cc;
        // Communicate our context to the combinators.
        // (Less wasteful than consing up a hundred closures on every call.)
        cx.state = state;
        cx.stream = stream;
        (cx.marked = null), (cx.cc = cc);
        cx.style = style;

        if (!state.lexical.hasOwnProperty("align")) state.lexical.align = true;

        while (true) {
            var combinator = cc.length ? cc.pop() : expression;
            if (combinator(type, content)) {
                while (cc.length && cc[cc.length - 1].lex) cc.pop()();
                if (cx.marked) return cx.marked;
                if (type == "variable" && inScope(state, content))
                    return "variable-2";
                return style;
            }
        }
    }

    function property(type) {
        if (type == "variable") {
            cx.marked = "property";
            return cont();
        }
    }

    // Combinator utils
    var cx = { state: null, column: null, marked: null, cc: null };
    function pass() {
        for (var i = arguments.length - 1; i >= 0; i--)
            cx.cc.push(arguments[i]);
    }
    function cont() {
        pass.apply(null, arguments);
        return true;
    }
    function pushlex(type, info) {
        var result = function() {
            var state = cx.state,
                indent = state.indented;
            if (state.lexical.type == "stat") indent = state.lexical.indented;
            else
                for (
                    var outer = state.lexical;
                    outer && outer.type == ")" && outer.align;
                    outer = outer.prev
                )
                    indent = outer.indented;
            state.lexical = new JSLexical(
                indent,
                cx.stream.column(),
                type,
                null,
                state.lexical,
                info
            );
        };
        result.lex = true;
        return result;
    }
    function poplex() {
        var state = cx.state;
        if (state.lexical.prev) {
            if (state.lexical.type == ")")
                state.indented = state.lexical.indented;
            state.lexical = state.lexical.prev;
        }
    }
    poplex.lex = true;

    function expect(wanted) {
        function exp(type) {
            if (type == wanted) return cont();
            else if (wanted == ";" || type == "}" || type == ")" || type == "]")
                return pass();
            else return cont(exp);
        }
        return exp;
    }

    function expression(type, value) {
        return expressionInner(type, value, false);
    }
    function expressionNoComma(type, value) {
        return expressionInner(type, value, true);
    }
    function expressionInner(type, value, noComma) {
        if (cx.state.fatArrowAt == cx.stream.start) {
            var body = noComma ? arrowBodyNoComma : arrowBody;
            if (type == "(")
                return cont(
                    pushcontext,
                    pushlex(")"),
                    commasep(funarg, ")"),
                    poplex,
                    expect("=>"),
                    body,
                    popcontext
                );
            else if (type == "variable")
                return pass(
                    pushcontext,
                    pattern,
                    expect("=>"),
                    body,
                    popcontext
                );
        }

        var maybeop = noComma ? maybeoperatorNoComma : maybeoperatorComma;
        if (type == "(")
            return cont(
                pushlex(")"),
                maybeexpression,
                expect(")"),
                poplex,
                maybeop
            );
        if (type == "operator" || type == "spread")
            return cont(noComma ? expressionNoComma : expression);
        if (type == "[")
            return cont(pushlex("]"), arrayLiteral, poplex, maybeop);
        return cont();
    }
    function maybeexpression(type) {
        if (type.match(/[;\}\)\],]/)) return pass();
        return pass(expression);
    }

    function maybeoperatorComma(type, value) {
        if (type == ",") return cont(expression);
        return maybeoperatorNoComma(type, value, false);
    }
    function maybeoperatorNoComma(type, value, noComma) {
        var me = noComma == false ? maybeoperatorComma : maybeoperatorNoComma;
        var expr = noComma == false ? expression : expressionNoComma;
        if (type == "operator") {
            if (/\+\+|--/.test(value) || (isTS && value == "!"))
                return cont(me);
            if (
                isTS &&
                value == "<" &&
                cx.stream.match(/^([^>]|<.*?>)*>\s*\(/, false)
            )
                return cont(pushlex(">"), commasep(typeexpr, ">"), poplex, me);
            if (value == "?") return cont(expression, expect(":"), expr);
            return cont(expr);
        }
        if (type == "(")
            return contCommasep(expressionNoComma, ")", "call", me);
        if (type == ".") return cont(property, me);
        if (type == "[")
            return cont(pushlex("]"), maybeexpression, expect("]"), poplex, me);
    }
    function commasep(what, end, sep) {
        function proceed(type, value) {
            if (sep ? sep.indexOf(type) > -1 : type == ",") {
                var lex = cx.state.lexical;
                if (lex.info == "call") lex.pos = (lex.pos || 0) + 1;
                return cont(function(type, value) {
                    if (type == end || value == end) return pass();
                    return pass(what);
                }, proceed);
            }
            if (type == end || value == end) return cont();
            return cont(expect(end));
        }
        return function(type, value) {
            if (type == end || value == end) return cont();
            return pass(what, proceed);
        };
    }
    function contCommasep(what, end, info) {
        for (var i = 3; i < arguments.length; i++) cx.cc.push(arguments[i]);
        return cont(pushlex(end, info), commasep(what, end), poplex);
    }
    function arrayLiteral(type) {
        if (type == "]") return cont();
        return pass(commasep(expressionNoComma, "]"));
    }

    // Interface
    return {
        startState: function(basecolumn) {
            var state = {
                tokenize: tokenBase,
                lastType: "sof",
                cc: [],
                lexical: new JSLexical(
                    (basecolumn || 0) - indentUnit,
                    0,
                    "block",
                    false
                ),
                localVars: parserConfig.localVars,
                context:
                    parserConfig.localVars && new Context(null, null, false),
                indented: basecolumn || 0
            };
            if (
                parserConfig.globalVars &&
                typeof parserConfig.globalVars == "object"
            )
                state.globalVars = parserConfig.globalVars;
            return state;
        },

        token: function(stream, state) {
            if (stream.sol()) {
                if (!state.lexical.hasOwnProperty("align"))
                    state.lexical.align = false;
                state.indented = stream.indentation();
            }
            var style = state.tokenize(stream, state);
            state.lastType =
                type == "operator" && (content == "++" || content == "--")
                    ? "incdec"
                    : type;
            return parseJS(state, style, type, content, stream);
        },
        helperType: jsonMode ? "json" : "javascript"
    };
});

//========================================= hint start ====================================

var Pos = CodeMirror.Pos;
var javascriptKeywords = calcFnList;

function forEach(arr, f) {
    for (var i = 0, e = arr.length; i < e; ++i) f(arr[i]);
}

function arrayContains(arr, item) {
    if (!Array.prototype.indexOf) {
        var i = arr.length;
        while (i--) {
            if (arr[i] === item) {
                return true;
            }
        }
        return false;
    }
    return arr.indexOf(item) != -1;
}

function scriptHint(editor, keywords, getToken, options) {
    // Find the token at the cursor
    var cur = editor.getCursor(),
        token = getToken(editor, cur);
    if (/\b(?:string|comment)\b/.test(token.type)) return;
    var innerMode = CodeMirror.innerMode(editor.getMode(), token.state);
    if (innerMode.mode.helperType === "json") return;
    token.state = innerMode.state;

    // If it's not a 'word-style' token, ignore the token.
    if (!/^[\w$_]*$/.test(token.string)) {
        token = {
            start: cur.ch,
            end: cur.ch,
            string: "",
            state: token.state,
            type: token.string == "." ? "property" : null
        };
    } else if (token.end > cur.ch) {
        token.end = cur.ch;
        token.string = token.string.slice(0, cur.ch - token.start);
    }

    var tprop = token;
    // If it is a property, find out what it is a property of.
    while (tprop.type == "property") {
        tprop = getToken(editor, Pos(cur.line, tprop.start));
        if (tprop.string != ".") return;
        tprop = getToken(editor, Pos(cur.line, tprop.start));
        if (!context) var context = [];
        context.push(tprop);
    }
    return {
        list: getCompletions(token, context, keywords, options),
        from: Pos(cur.line, token.start),
        to: Pos(cur.line, token.end)
    };
}

function javascriptHint(editor, options) {
    return scriptHint(
        editor,
        javascriptKeywords,
        function(e, cur) {
            return e.getTokenAt(cur);
        },
        options
    );
}

function getCompletions(token, context, keywords, options) {
    var found = [],
        start = token.string,
        global = (options && options.globalScope) || window;

    function maybeAdd(str) {
        if (str.lastIndexOf(start, 0) == 0 && !arrayContains(found, str))
            found.push(str);
    }

    if (context && context.length) {
        // If this is a property, see if it belongs to some object we can
        // find in the current environment.
        var obj = context.pop(),
            base;
        if (obj.type && obj.type.indexOf("variable") === 0) {
            if (options && options.additionalContext)
                base = options.additionalContext[obj.string];
            if (!options || options.useGlobalScope !== false)
                base = base || global[obj.string];
        } else if (obj.type == "string") {
            base = "";
        } else if (obj.type == "atom") {
            base = 1;
        } else if (obj.type == "function") {
            if (
                global.jQuery != null &&
                (obj.string == "$" || obj.string == "jQuery") &&
                typeof global.jQuery == "function"
            )
                base = global.jQuery();
            else if (
                global._ != null &&
                obj.string == "_" &&
                typeof global._ == "function"
            )
                base = global._();
        }
        while (base != null && context.length)
            base = base[context.pop().string];
    } else {
        forEach(keywords, maybeAdd);
    }
    return found;
}

CodeMirror.registerHelper("hint", "formula", javascriptHint);
//========================================= hint end ====================================

export default CodeMirror;
