import React, { useEffect, useState } from "react";

type NumberFieldProps = {
  value: number;
  onCommit: (next: number) => void;

  // 交互
  className?: string;
  placeholder?: string;

  // 输入约束（仅作为提示/键盘优化）
  min?: number;
  max?: number;
  step?: number;

  // 规则：提交时处理
  normalize?: (raw: number) => number;                 // 如：round 到 100 倍
  validate?: (next: number) => string | null;          // 返回错误文案；null 表示通过
  onInvalid?: (msg: string) => void;                   // toast.error
};

export default function NumberField({
  value,
  onCommit,
  className,
  placeholder,
  min,
  max,
  step,
  normalize,
  validate,
  onInvalid,
}: NumberFieldProps) {
  const [draft, setDraft] = useState<string>(String(value));

  // 外部 value 变化时同步（比如切换策略模板、后端回填等）
  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commit = () => {
    const s = draft.trim();

    // 允许用户清空后不提交，直接回滚显示
    if (s === "") {
      setDraft(String(value));
      return;
    }

    const raw = Number(s);
    if (Number.isNaN(raw)) {
      setDraft(String(value));
      return;
    }

    let next = normalize ? normalize(raw) : raw;

    const msg = validate ? validate(next) : null;
    if (msg) {
      onInvalid?.(msg);
      setDraft(String(value)); // 回滚
      return;
    }

    onCommit(next);
    setDraft(String(next)); // 用规范化后的数回填
  };

  return (
    <input
      type="number"
      inputMode="decimal"
      className={className}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        if (e.key === "Escape") setDraft(String(value)); // 可选：ESC 回滚
      }}
    />
  );
}