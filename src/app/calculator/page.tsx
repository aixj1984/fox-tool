"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  CopyButton,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";

const DESCRIPTION =
  "计算器是一款功能强大、实用的计算工具，适用于各种数学计算场景。该工具包含了多种数学函数、计算公式和各种数据类型，可以使用户轻松地进行乘除、开方、指数、三角函数运算等各种数学计算。";

type Op = "+" | "-" | "*" | "/" | null;

export default function Page() {
  const [display, setDisplay] = useState("0");
  const [previous, setPrevious] = useState<number | null>(null);
  const [op, setOp] = useState<Op>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [scientific, setScientific] = useState(false);

  const inputDigit = useCallback(
    (d: string) => {
      setDisplay((cur) => {
        if (waitingForOperand) {
          setWaitingForOperand(false);
          return d;
        }
        if (cur === "0") return d;
        if (cur.replace("-", "").length >= 16) return cur;
        return cur + d;
      });
    },
    [waitingForOperand],
  );

  const inputDot = useCallback(() => {
    setDisplay((cur) => {
      if (waitingForOperand) {
        setWaitingForOperand(false);
        return "0.";
      }
      if (cur.includes(".")) return cur;
      return cur + ".";
    });
  }, [waitingForOperand]);

  const clearAll = useCallback(() => {
    setDisplay("0");
    setPrevious(null);
    setOp(null);
    setWaitingForOperand(false);
  }, []);

  const toggleSign = useCallback(() => {
    setDisplay((cur) => {
      if (cur === "0") return cur;
      return cur.startsWith("-") ? cur.slice(1) : "-" + cur;
    });
  }, []);

  const percent = useCallback(() => {
    setDisplay((cur) => {
      const n = parseFloat(cur);
      if (Number.isNaN(n)) return cur;
      return String(n / 100);
    });
  }, []);

  const applyOp = useCallback(
    (nextOp: Op) => {
      const cur = parseFloat(display);
      if (Number.isNaN(cur)) return;
      if (previous === null) {
        setPrevious(cur);
      } else if (op && !waitingForOperand) {
        const result = compute(previous, cur, op);
        if (result === null) {
          setDisplay("错误");
          setPrevious(null);
          setOp(null);
          setWaitingForOperand(true);
          return;
        }
        setPrevious(result);
        setDisplay(formatNum(result));
      }
      setOp(nextOp);
      setWaitingForOperand(true);
    },
    [display, previous, op, waitingForOperand],
  );

  const equals = useCallback(() => {
    if (op === null || previous === null) return;
    const cur = parseFloat(display);
    if (Number.isNaN(cur)) return;
    const result = compute(previous, cur, op);
    if (result === null) {
      setDisplay("错误");
    } else {
      setDisplay(formatNum(result));
    }
    setPrevious(null);
    setOp(null);
    setWaitingForOperand(true);
  }, [op, previous, display]);

  const applyFunc = useCallback(
    (fn: (x: number) => number) => {
      const cur = parseFloat(display);
      if (Number.isNaN(cur)) return;
      const r = fn(cur);
      if (!Number.isFinite(r)) {
        setDisplay("错误");
        return;
      }
      setDisplay(formatNum(r));
      setWaitingForOperand(true);
    },
    [display],
  );

  const inputConstant = useCallback((v: number) => {
    setDisplay(formatNum(v));
    setWaitingForOperand(false);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key;
      if (/^[0-9]$/.test(k)) inputDigit(k);
      else if (k === ".") inputDot();
      else if (k === "+") applyOp("+");
      else if (k === "-") applyOp("-");
      else if (k === "*") applyOp("*");
      else if (k === "/") {
        e.preventDefault();
        applyOp("/");
      } else if (k === "Enter" || k === "=") {
        e.preventDefault();
        equals();
      } else if (k === "Escape" || k.toLowerCase() === "c") clearAll();
      else if (k === "%") percent();
      else if (k === "Backspace") {
        setDisplay((cur) => {
          if (waitingForOperand) return cur;
          const s = cur.slice(0, -1);
          return s === "" || s === "-" ? "0" : s;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inputDigit, inputDot, applyOp, equals, clearAll, percent, waitingForOperand]);

  const btn =
    "h-[52px] rounded-[10px] text-[18px] font-medium transition-colors select-none";
  const numBtn = `${btn} bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]`;
  const opBtn = `${btn} bg-[#136CE9] text-white hover:bg-[#0f5fc4]`;
  const fnBtn = `${btn} bg-[#EEF3FE] text-[#136CE9] hover:bg-[#e1ebfd] text-[15px]`;
  const eqBtn = `${btn} bg-[#FF8A00] text-white hover:bg-[#e67c00]`;

  return (
    <ToolPageShell title="计算器" description={DESCRIPTION}>
      <ToolCard className="max-w-[420px]">
        <div className="mb-[16px] flex items-center justify-between">
          <div className="text-[13px] text-[#8F8F8F]">
            支持键盘输入：0-9 + − × ÷ Enter Esc
          </div>
          <ToolButton
            variant="ghost"
            onClick={() => setScientific((s) => !s)}
            className="h-[32px] px-[12px] text-[13px]"
          >
            {scientific ? "标准模式" : "科学模式"}
          </ToolButton>
        </div>

        <div className="mb-[14px] flex items-center justify-between rounded-[10px] bg-[#F6F7FA] px-[16px] py-[18px]">
          <div className="truncate text-right text-[34px] font-semibold tracking-wide text-[#242424]">
            {display}
          </div>
          <div className="ml-[12px] shrink-0 text-[13px] text-[#8F8F8F]">
            {previous !== null && op ? `${formatNum(previous)} ${op}` : ""}
          </div>
        </div>

        {scientific ? (
          <div className="grid grid-cols-5 gap-[8px]">
            <button className={fnBtn} onClick={() => applyFunc((x) => Math.sin((x * Math.PI) / 180))}>sin</button>
            <button className={fnBtn} onClick={() => applyFunc((x) => Math.cos((x * Math.PI) / 180))}>cos</button>
            <button className={fnBtn} onClick={() => applyFunc((x) => Math.tan((x * Math.PI) / 180))}>tan</button>
            <button className={fnBtn} onClick={() => applyFunc((x) => Math.sqrt(x))}>√x</button>
            <button className={fnBtn} onClick={() => applyFunc((x) => Math.log(x))}>ln</button>
            <button className={fnBtn} onClick={() => applyFunc((x) => x * x)}>x²</button>
            <button className={fnBtn} onClick={() => applyFunc((x) => Math.pow(x, 3))}>x³</button>
            <button className={fnBtn} onClick={() => applyFunc((x) => 1 / x)}>1/x</button>
            <button className={fnBtn} onClick={() => applyFunc((x) => Math.exp(x))}>eˣ</button>
            <button className={fnBtn} onClick={() => applyFunc((x) => Math.pow(10, x))}>10ˣ</button>
            <button className={fnBtn} onClick={() => inputConstant(Math.PI)}>π</button>
            <button className={fnBtn} onClick={() => inputConstant(Math.E)}>e</button>
            <button className={fnBtn} onClick={() => applyFunc((x) => Math.abs(x))}>|x|</button>
            <button className={fnBtn} onClick={() => applyFunc((x) => Math.log10(x))}>lg</button>
            <button className={fnBtn} onClick={() => applyFunc(factorial)}>n!</button>
            <button className={numBtn} onClick={() => clearAll()}>C</button>
            <button className={fnBtn} onClick={() => toggleSign()}>±</button>
            <button className={fnBtn} onClick={() => percent()}>%</button>
            <button className={opBtn} onClick={() => applyOp("/")}>÷</button>
            <button className={opBtn} onClick={() => applyOp("*")}>×</button>
            <button className={numBtn} onClick={() => inputDigit("7")}>7</button>
            <button className={numBtn} onClick={() => inputDigit("8")}>8</button>
            <button className={numBtn} onClick={() => inputDigit("9")}>9</button>
            <button className={opBtn} onClick={() => applyOp("-")}>−</button>
            <button className={opBtn} onClick={() => applyOp("+")} style={{ gridRow: "span 1" }}>＋</button>
            <button className={numBtn} onClick={() => inputDigit("4")}>4</button>
            <button className={numBtn} onClick={() => inputDigit("5")}>5</button>
            <button className={numBtn} onClick={() => inputDigit("6")}>6</button>
            <button className={numBtn} onClick={() => inputDigit("1")}>1</button>
            <button className={numBtn} onClick={() => inputDigit("2")}>2</button>
            <button className={numBtn} onClick={() => inputDigit("3")}>3</button>
            <button className={numBtn} onClick={() => inputDigit("0")} style={{ gridColumn: "span 2" }}>0</button>
            <button className={numBtn} onClick={() => inputDot()}>.</button>
            <button className={eqBtn} onClick={() => equals()} style={{ gridColumn: "span 2" }}>=</button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-[8px]">
            <button className={numBtn} onClick={() => clearAll()}>C</button>
            <button className={fnBtn} onClick={() => toggleSign()}>±</button>
            <button className={fnBtn} onClick={() => percent()}>%</button>
            <button className={opBtn} onClick={() => applyOp("/")}>÷</button>
            <button className={numBtn} onClick={() => inputDigit("7")}>7</button>
            <button className={numBtn} onClick={() => inputDigit("8")}>8</button>
            <button className={numBtn} onClick={() => inputDigit("9")}>9</button>
            <button className={opBtn} onClick={() => applyOp("*")}>×</button>
            <button className={numBtn} onClick={() => inputDigit("4")}>4</button>
            <button className={numBtn} onClick={() => inputDigit("5")}>5</button>
            <button className={numBtn} onClick={() => inputDigit("6")}>6</button>
            <button className={opBtn} onClick={() => applyOp("-")}>−</button>
            <button className={numBtn} onClick={() => inputDigit("1")}>1</button>
            <button className={numBtn} onClick={() => inputDigit("2")}>2</button>
            <button className={numBtn} onClick={() => inputDigit("3")}>3</button>
            <button className={opBtn} onClick={() => applyOp("+")}>＋</button>
            <button className={numBtn} onClick={() => inputDigit("0")} style={{ gridColumn: "span 2" }}>0</button>
            <button className={numBtn} onClick={() => inputDot()}>.</button>
            <button className={eqBtn} onClick={() => equals()}>=</button>
          </div>
        )}

        <div className="mt-[14px] flex items-center justify-between">
          <span className="text-[13px] text-[#8F8F8F]">
            {op ? `运算中：${op === "*" ? "×" : op === "/" ? "÷" : op}` : "就绪"}
          </span>
          <CopyButton text={display} label="复制结果" />
        </div>
      </ToolCard>
    </ToolPageShell>
  );
}

function compute(a: number, b: number, op: Op): number | null {
  switch (op) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "*":
      return a * b;
    case "/":
      if (b === 0) return null;
      return a / b;
    default:
      return null;
  }
}

function formatNum(n: number): string {
  if (!Number.isFinite(n)) return "错误";
  const rounded = Math.round(n * 1e10) / 1e10;
  if (Math.abs(rounded) >= 1e16) return rounded.toExponential(6);
  return String(rounded);
}

function factorial(x: number): number {
  if (x < 0 || !Number.isInteger(x)) return NaN;
  if (x > 170) return Infinity;
  let r = 1;
  for (let i = 2; i <= x; i++) r *= i;
  return r;
}
