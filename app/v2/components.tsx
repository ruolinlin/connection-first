"use client";

import { ArrowLeft, ShieldAlert } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { safetyCopy } from "./content";

export function FlowShell({
  children,
  canGoBack,
  onBack,
  riskElevated,
  waveMode = "normal",
}: {
  children: ReactNode;
  canGoBack: boolean;
  onBack: () => void;
  riskElevated: boolean;
  waveMode?: "normal" | "urgent" | "completion";
}) {
  return (
    <div className={`v2-scene wave-mode-${waveMode}`}>
      <div className="ambient-waves" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="v2-shell">
      <header className="v2-header">
        <div className="v2-brand" aria-label="拆弹行动">
          <span className="brand-mark" aria-hidden="true">
            <i className="brand-ring brand-ring--outer" />
            <i className="brand-ring brand-ring--inner" />
          </span>
          拆弹行动
        </div>
        {canGoBack ? (
          <button className="ghost-button" type="button" onClick={onBack}>
            <ArrowLeft aria-hidden="true" size={17} />
            返回
          </button>
        ) : (
          <span className="header-principle">先连接，再解决</span>
        )}
      </header>

      <main className="v2-main">{children}</main>

      <SafetyNotice elevated={riskElevated} />
        <footer className="v2-footer">不用一次想清楚，我们先找下一步。</footer>
      </div>
    </div>
  );
}

export function FocusCard({
  children,
  intensity,
  quiet = false,
}: {
  children: ReactNode;
  intensity?: "tense" | "arguing" | "losing-control";
  quiet?: boolean;
}) {
  return (
    <section
      className={`focus-card${intensity ? ` intensity-${intensity}` : ""}${quiet ? " pause-canvas" : ""}`}
    >
      {children}
    </section>
  );
}

export function SayThisCard({ children }: { children: ReactNode }) {
  return (
    <aside className="say-this-card" aria-label="可以这样说">
      <span>可以这样说</span>
      <blockquote>{children}</blockquote>
    </aside>
  );
}

export function SafetyNotice({ elevated }: { elevated: boolean }) {
  return (
    <aside
      className={`safety-notice${elevated ? " safety-notice--elevated" : ""}`}
      aria-label="安全提示"
    >
      <ShieldAlert aria-hidden="true" size={20} />
      <div>
        <strong>{elevated ? "先确认人身安全" : "安全提示"}</strong>
        <p>{safetyCopy}</p>
      </div>
    </aside>
  );
}

export function CalmVisual({ reducedMotion }: { reducedMotion: boolean }) {
  const visualRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState({
    key: "inhale",
    label: "吸气",
    seconds: 4,
  });

  useEffect(() => {
    let animationFrame = 0;
    const startedAt = performance.now();
    const cycleDuration = 12_000;

    const update = (now: number) => {
      const elapsed = (now - startedAt) % cycleDuration;
      let key = "inhale";
      let label = "吸气";
      let seconds = Math.max(1, Math.ceil((4_000 - elapsed) / 1_000));
      let breathLevel = 0;

      if (elapsed < 4_000) {
        const progress = elapsed / 4_000;
        breathLevel = progress * progress * (3 - 2 * progress);
      } else if (elapsed < 5_000) {
        key = "hold-full";
        label = "停";
        seconds = 1;
        breathLevel = 1;
      } else if (elapsed < 11_000) {
        key = "exhale";
        label = "呼气";
        const progress = (elapsed - 5_000) / 6_000;
        seconds = Math.max(1, Math.ceil((11_000 - elapsed) / 1_000));
        breathLevel = 1 - progress * progress * (3 - 2 * progress);
      } else {
        key = "hold-empty";
        label = "停";
        seconds = 1;
      }

      const visual = visualRef.current;
      if (visual && !reducedMotion) {
        visual.style.setProperty("--breath-level", breathLevel.toFixed(4));
      }
      setPhase((current) =>
        current.key === key && current.seconds === seconds
          ? current
          : { key, label, seconds },
      );
      animationFrame = window.requestAnimationFrame(update);
    };

    animationFrame = window.requestAnimationFrame(update);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [reducedMotion]);

  return (
    <div
      ref={visualRef}
      className={`calm-visual${reducedMotion ? " calm-visual--still" : ""}`}
      data-phase={phase.key}
      role="img"
      aria-label={`呼吸引导：${phase.label}，还剩 ${phase.seconds} 秒`}
    >
      <span className="breath-ring breath-ring--outer" aria-hidden="true" />
      <span className="breath-ring breath-ring--inner" aria-hidden="true" />
      <span className="breath-glow" aria-hidden="true" />
      <strong className="breath-phase" aria-hidden="true">
        {phase.label} <small>{phase.seconds}</small>
      </strong>
    </div>
  );
}

export function CompletionConvergence() {
  return (
    <div className="completion-convergence" aria-hidden="true">
      <span />
      <span />
      <i />
    </div>
  );
}
