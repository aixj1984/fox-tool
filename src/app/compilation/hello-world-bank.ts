// Hello World programs for many languages.
// Used by the "开发语言输出Hello World" tool (src/app/compilation).
// Each entry is a real, runnable Hello World snippet.

export interface HelloEntry {
  lang: string;
  code: string;
}

export const HELLO_WORLD: HelloEntry[] = [
  { lang: "Python", code: `print("Hello, World!")` },
  { lang: "Python 3 (REPL)", code: `>>> print("Hello, World!")\nHello, World!` },
  {
    lang: "JavaScript",
    code: `console.log("Hello, World!");`,
  },
  {
    lang: "JavaScript (Browser)",
    code: `document.write("Hello, World!");\n// or\nalert("Hello, World!");`,
  },
  {
    lang: "TypeScript",
    code: `const greeting: string = "Hello, World!";\nconsole.log(greeting);`,
  },
  {
    lang: "Node.js",
    code: `const http = require("http");\nhttp\n  .createServer((req, res) => res.end("Hello, World!"))\n  .listen(3000);`,
  },
  {
    lang: "C",
    code: `#include <stdio.h>\n\nint main(void) {\n    printf("Hello, World!\\n");\n    return 0;\n}`,
  },
  {
    lang: "C++",
    code: `#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}`,
  },
  {
    lang: "C#",
    code: `using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}`,
  },
  {
    lang: "Java",
    code: `public class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
  },
  {
    lang: "Go",
    code: `package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}`,
  },
  {
    lang: "Rust",
    code: `fn main() {\n    println!("Hello, World!");\n}`,
  },
  {
    lang: "Ruby",
    code: `puts "Hello, World!"`,
  },
  {
    lang: "PHP",
    code: `<?php\necho "Hello, World!";\n`,
  },
  {
    lang: "Swift",
    code: `print("Hello, World!")`,
  },
  {
    lang: "Kotlin",
    code: `fun main() {\n    println("Hello, World!")\n}`,
  },
  {
    lang: "Scala",
    code: `object HelloWorld extends App {\n  println("Hello, World!")\n}`,
  },
  {
    lang: "Haskell",
    code: `main = putStrLn "Hello, World!"`,
  },
  {
    lang: "Lisp (Common Lisp)",
    code: `(princ "Hello, World!")\n(terpri)`,
  },
  {
    lang: "Scheme",
    code: `(display "Hello, World!")\n(newline)`,
  },
  {
    lang: "Clojure",
    code: `(println "Hello, World!")`,
  },
  {
    lang: "Elixir",
    code: `IO.puts "Hello, World!"`,
  },
  {
    lang: "Erlang",
    code: `-module(hello).\n-export([world/0]).\n\nworld() -> io:format("Hello, World!~n").`,
  },
  {
    lang: "Perl",
    code: `print "Hello, World!\\n";`,
  },
  {
    lang: "R",
    code: `print("Hello, World!")`,
  },
  {
    lang: "Julia",
    code: `println("Hello, World!")`,
  },
  {
    lang: "Dart",
    code: `void main() {\n  print("Hello, World!");\n}`,
  },
  {
    lang: "Lua",
    code: `print("Hello, World!")`,
  },
  {
    lang: "Bash / Shell",
    code: `echo "Hello, World!"`,
  },
  {
    lang: "PowerShell",
    code: `Write-Host "Hello, World!"`,
  },
  {
    lang: "Batch (Windows)",
    code: `@echo off\necho Hello, World!`,
  },
  {
    lang: "SQL (MySQL)",
    code: `SELECT 'Hello, World!';`,
  },
  {
    lang: "SQL (PostgreSQL)",
    code: `SELECT 'Hello, World!';`,
  },
  {
    lang: "HTML",
    code: `<!DOCTYPE html>\n<html>\n  <head><title>Hello</title></head>\n  <body>\n    <h1>Hello, World!</h1>\n  </body>\n</html>`,
  },
  {
    lang: "CSS (content)",
    code: `body::before {\n  content: "Hello, World!";\n}`,
  },
  {
    lang: "JSON",
    code: `{\n  "message": "Hello, World!"\n}`,
  },
  {
    lang: "YAML",
    code: `message: "Hello, World!"`,
  },
  {
    lang: "XML",
    code: `<?xml version="1.0"?>\n<message>Hello, World!</message>`,
  },
  {
    lang: "Markdown",
    code: `# Hello, World!`,
  },
  {
    lang: "Assembly (x86 Linux)",
    code: `section .data\n    msg db "Hello, World!", 10\n    len equ $ - msg\nsection .text\n    global _start\n_start:\n    mov eax, 4\n    mov ebx, 1\n    mov ecx, msg\n    mov edx, len\n    int 0x80\n    mov eax, 1\n    xor ebx, ebx\n    int 0x80`,
  },
  {
    lang: "Objective-C",
    code: `#import <Foundation/Foundation.h>\n\nint main() {\n    @autoreleasepool {\n        NSLog(@"Hello, World!");\n    }\n    return 0;\n}`,
  },
  {
    lang: "Groovy",
    code: `println "Hello, World!"`,
  },
  {
    lang: "F#",
    code: `printfn "Hello, World!"`,
  },
  {
    lang: "VB.NET",
    code: `Module HelloWorld\n    Sub Main()\n        System.Console.WriteLine("Hello, World!")\n    End Sub\nEnd Module`,
  },
  {
    lang: "Pascal",
    code: `program HelloWorld;\nbegin\n  WriteLn('Hello, World!');\nend.`,
  },
  {
    lang: "Fortran",
    code: `program hello\n  print *, "Hello, World!"\nend program hello`,
  },
  {
    lang: "COBOL",
    code: `IDENTIFICATION DIVISION.\nPROGRAM-ID. HELLO.\nPROCEDURE DIVISION.\n    DISPLAY "Hello, World!".\n    STOP RUN.`,
  },
  {
    lang: "Ada",
    code: `with Ada.Text_IO;\nprocedure Hello is\nbegin\n  Ada.Text_IO.Put_Line("Hello, World!");\nend Hello;`,
  },
  {
    lang: "Prolog",
    code: `:- initialization(main).\nmain :- write('Hello, World!'), nl.`,
  },
  {
    lang: "MATLAB",
    code: `disp('Hello, World!');`,
  },
  {
    lang: "Octave",
    code: `printf("Hello, World!\\n");`,
  },
  {
    lang: "Zig",
    code: `const std = @import("std");\n\npub fn main() !void {\n    try std.io.getStdOut().writer().print("Hello, World!\\n", .{});\n}`,
  },
  {
    lang: "Crystal",
    code: `puts "Hello, World!"`,
  },
  {
    lang: "Nim",
    code: `echo "Hello, World!"`,
  },
  {
    lang: "V (Vlang)",
    code: `fn main() {\n    println("Hello, World!")\n}`,
  },
  {
    lang: "Solidity",
    code: `pragma solidity ^0.8.0;\ncontract Hello {\n    function greet() public pure returns (string memory) {\n        return "Hello, World!";\n    }\n}`,
  },
  {
    lang: "GraphQL",
    code: `query {\n  hello\n}\n# server returns: { "data": { "hello": "Hello, World!" } }`,
  },
  {
    lang: "Brainfuck",
    code: `++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.`,
  },
];
