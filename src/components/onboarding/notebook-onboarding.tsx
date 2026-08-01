"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BookOpen, Check, Loader2, FileText, Link2, Upload, X,
} from "lucide-react";
import { createNotebook } from "@/lib/actions/notebooks";
import TextType from "@/components/ui/text-type/TextType";

const TOTAL_STEPS = 3;
const DEFAULT_COLOR = "#7c3aed";

interface Source {
  id: string;
  name: string;
  type: "file" | "url";
  size?: number;
  url?: string;
  content?: string;
}

interface WipeRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface NotebookOnboardingProps {
  open: boolean;
  onClose: () => void;
  origin?: WipeRect | null;
}

const EASE_WIPE = "cubic-bezier(0.76, 0, 0.24, 1)";

export function NotebookOnboarding({ open, onClose, origin }: NotebookOnboardingProps) {
  const router = useRouter();
  const [stage, setStage] = useState<"wipe" | "content" | "closing">("wipe");
  const [geo, setGeo] = useState<{ cx: number; cy: number; r: number } | null>(null);
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState(false);
  const [error, setError] = useState("");
  const [leaving, setLeaving] = useState(false);
  const [sources, setSources] = useState<Source[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const reducedMotion = useRef(
    typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
  ).current;

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  function addSource(source: Source) {
    setSources((prev) => [...prev, source]);
  }

  function removeSource(id: string) {
    setSources((prev) => prev.filter((s) => s.id !== id));
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      try {
        const content = await file.text();
        addSource({
          id: crypto.randomUUID(),
          name: file.name,
          type: "file",
          size: file.size,
          content,
        });
      } catch {
        addSource({
          id: crypto.randomUUID(),
          name: file.name,
          type: "file",
          size: file.size,
        });
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleAddUrl() {
    const url = urlInput.trim();
    if (!url) return;
    try {
      new URL(url);
      addSource({
        id: crypto.randomUUID(),
        name: url.length > 40 ? url.slice(0, 37) + "..." : url,
        type: "url",
        url,
      });
      setUrlInput("");
    } catch {
      setError("Enter a valid URL (e.g., https://example.com)");
    }
  }

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const vw = window.innerWidth || 1280;
    const vh = window.innerHeight || 800;
    let cx = vw / 2;
    let cy = vh / 2;
    if (origin && Number.isFinite(origin.x) && Number.isFinite(origin.y) && Number.isFinite(origin.width) && Number.isFinite(origin.height)) {
      cx = origin.x + origin.width / 2;
      cy = origin.y + origin.height / 2;
    }
    const r = Math.hypot(Math.max(cx, vw - cx), Math.max(cy, vh - cy)) + 60;
    setGeo({ cx, cy, r });
  }, [open, origin]);

  useEffect(() => {
    if (!open) return;
    clearTimers();
    setStep(0);
    setTitle("");
    setDescription("");
    setBusy(false);
    setCreated(false);
    setError("");
    setLeaving(false);
    setSources([]);
    setUrlInput("");
    if (reducedMotion) { setStage("content"); return; }
    setStage("wipe");
    timersRef.current.push(setTimeout(() => setStage("content"), 680));
    return clearTimers;
  }, [open, reducedMotion, clearTimers]);

  useEffect(() => {
    if (stage !== "content" || created) return;
    const t = setTimeout(() => {
      if (step === 0) inputRef.current?.focus();
      if (step === 1) textareaRef.current?.focus();
      if (step === 2) fileInputRef.current?.focus();
    }, 450);
    return () => clearTimeout(t);
  }, [stage, step, created]);

  function handleClose() {
    if (busy || created || stage !== "content") return;
    if (reducedMotion) { onClose(); return; }
    setStage("closing");
    timersRef.current.push(setTimeout(onClose, 680));
  }

  function goTo(next: number) {
    setLeaving(true);
    timersRef.current.push(setTimeout(() => { setStep(next); setLeaving(false); }, 180));
  }

  function handleNext() {
    if (step === 0 && !title.trim()) {
      setError("Name your project to continue.");
      inputRef.current?.focus();
      return;
    }
    setError("");
    if (step < TOTAL_STEPS - 1) { goTo(step + 1); return; }
    void handleCreate();
  }

  async function handleCreate() {
    setBusy(true);
    setError("");
    try {
      const { id } = await createNotebook({
        title: title.trim(),
        description: description.trim() || null,
        sources: sources.map((s) => ({
          name: s.name,
          type: s.type,
          size: s.size,
          url: s.url,
          content: s.content,
        })),
      });
      void id;
      setCreated(true);
      setBusy(false);
      timersRef.current.push(setTimeout(() => { onClose(); router.refresh(); }, 1400));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { if (!busy && !created) handleClose(); }
      else if (e.key === "Enter" && step === 0 && stage === "content") { if (!busy && !created && !leaving) { e.preventDefault(); handleNext(); } }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, busy, created, step, stage, leaving, handleClose, handleNext]);

  if (!open) return null;

  const closing = stage === "closing";
  const whiteVisible = stage === "wipe" || closing;
  const wipeMs = closing ? 460 : 640;

  const steps = [
    {
      label: "Name",
      headline: ["Name", "your", "project"],
      hint: "Something you'll recognize in a list of twenty.",
      placeholder: "e.g. Thesis — Quantum Foundations",
    },
    {
      label: "Focus",
      headline: ["What's", "the", "focus?"],
      hint: "One sentence. What are you trying to figure out?",
      placeholder: "The central question, the goal, the audience…",
    },
    {
      label: "Sources",
      headline: ["Add", "your", "sources"],
      hint: "Upload files or paste URLs. You can add more later.",
    },
  ];

  return (
    <div className="fixed inset-0 z-[400] overflow-hidden" style={{ background: "radial-gradient(125% 125% at 50% 10%, #16161e 45%, #6d28d9 140%)" }}>
      {/* Wipe layer */}
      <div
        className="absolute inset-0 bg-white"
        style={{
          clipPath: geo ? `circle(${closing ? "0px" : `${geo.r}px`} at ${geo.cx}px ${geo.cy}px)` : "circle(0px at 50% 50%)",
          opacity: whiteVisible ? 1 : 0,
          transition: `clip-path ${wipeMs}ms ${EASE_WIPE}, opacity ${whiteVisible ? 150 : 380}ms ease`,
          willChange: "clip-path, opacity",
        }}
        aria-hidden
      />

      {/* Content layer */}
      <div
        className={cn("absolute inset-0", closing && "pointer-events-none")}
        style={{ opacity: stage === "content" && !closing ? 1 : 0, transition: "opacity 380ms ease" }}
      >
        {/* Ambient orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="onboarding-orb h-[500px] w-[500px] -top-32 -left-32" style={{ background: "radial-gradient(circle, rgba(124,92,255,0.12) 0%, transparent 70%)" }} />
          <div className="onboarding-orb h-[400px] w-[400px] -bottom-32 right-0" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)", animationDelay: "-7s" }} />
        </div>

        {created ? (
          /* ─── Success state ─── */
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center text-center px-6">
              <div className="relative mb-8">
                <div className="h-24 w-24 rounded-full border onboarding-ring-pop" style={{ borderColor: `${DEFAULT_COLOR}44`, boxShadow: `0 0 64px -8px ${DEFAULT_COLOR}88` }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-16 w-16 rounded-full flex items-center justify-center onboarding-check-pop" style={{ background: `${DEFAULT_COLOR}18`, border: `1px solid ${DEFAULT_COLOR}44` }}>
<Check size={32} strokeWidth={2} style={{ color: DEFAULT_COLOR }} />
                  </div>
                </div>
              </div>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-white onboarding-fade-slide" style={{ fontFamily: "Geist, sans-serif" }}>
                {title.trim()} is ready.
              </h2>
              <p className="mt-3 text-[15px] text-white/40 onboarding-fade-slide" style={{ animationDelay: "100ms", fontFamily: "Geist, sans-serif" }}>
                Opening your workspace…
              </p>
            </div>
          </div>
        ) : (
          /* ─── Main layout ─── */
          <>
            {/* Logo — top-left */}
            <div className="absolute top-6 left-6 z-30">
              <img src="/images/Logo_2.png" alt="Mythrix" className="h-12 w-auto rounded-xl" />
            </div>            {/* Vertical step timeline — far left */}
            <div className="hidden lg:flex flex-col items-center justify-center absolute left-6 top-0 bottom-0 z-20">
              <div className="flex flex-col items-center gap-0">
                {steps.map((_, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="relative flex items-center justify-center">
                      <div
                        className={cn(
                          "h-2.5 w-2.5 rounded-full transition-all duration-500",
                          i === step && "scale-125",
                          i < step ? "bg-white/60" : i === step ? "bg-white" : "bg-white/20"
                        )}
                        style={i === step ? { boxShadow: `0 0 12px ${DEFAULT_COLOR}88` } : undefined}
                      />
                      {i === step && (
                        <div className="absolute inset-0 h-2.5 w-2.5 rounded-full animate-ping" style={{ background: DEFAULT_COLOR, opacity: 0.3 }} />
                      )}
                    </div>
                    {i < steps.length - 1 && (
                      <div className="w-px h-10 bg-white/10 my-1">
                        <div
                          className="w-full transition-all duration-500 ease-out"
                          style={{ height: i < step ? "100%" : "0%", background: `linear-gradient(to bottom, ${DEFAULT_COLOR}, ${DEFAULT_COLOR}44)` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Preview card — absolute right edge */}
            <div className="hidden lg:block absolute right-20 top-1/2 -translate-y-1/2 z-20">
              <div className="relative">
                {/* Glow behind card */}
                <div className="absolute -inset-12 rounded-full blur-[100px] opacity-15 transition-DEFAULT_COLORs duration-700" style={{ background: DEFAULT_COLOR }} />

                {/* Preview card */}
                <div
                  className="onboarding-preview-card relative w-[320px] rounded-3xl overflow-hidden transition-all duration-500 onboarding-fade-slide"
                  style={{
                    animationDelay: "480ms",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 32px 80px -24px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03) inset",
                  }}
                >
                  <div className="h-1.5 shrink-0 transition-DEFAULT_COLORs duration-500" style={{ background: `linear-gradient(90deg, ${DEFAULT_COLOR}, ${DEFAULT_COLOR}88)` }} />
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div
                        className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500"
                        style={{ background: `${DEFAULT_COLOR}15`, color: DEFAULT_COLOR, boxShadow: `0 8px 24px -8px ${DEFAULT_COLOR}33` }}
                      >
                        <BookOpen size={20} strokeWidth={1.5} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[16px] font-medium text-white truncate transition-all duration-300" style={{ fontFamily: "Geist, sans-serif" }}>
                          {title.trim() || "Untitled project"}
                        </p>
                        <p className="text-[13px] text-white/35 truncate mt-1 leading-relaxed" style={{ fontFamily: "Geist, sans-serif" }}>
                          {description.trim() || "Add a description…"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 h-px bg-white/[0.06]" />
                    <div className="mt-5 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-6 w-6 rounded-lg bg-white/[0.04] shrink-0" />
                        <div className="h-2.5 flex-1 rounded-full bg-white/[0.04]" />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-6 w-6 rounded-lg bg-white/[0.04] shrink-0" />
                        <div className="h-2.5 w-3/4 rounded-full bg-white/[0.04]" />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-6 w-6 rounded-lg bg-white/[0.04] shrink-0" />
                        <div className="h-2.5 w-1/2 rounded-full bg-white/[0.04]" />
                      </div>
                    </div>
                    <div className="mt-5 pt-4 border-t border-white/[0.05] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full transition-DEFAULT_COLORs duration-500" style={{ background: DEFAULT_COLOR }} />
                        <span className="text-[11px] text-white/25" style={{ fontFamily: "Geist, sans-serif" }}>New notebook</span>
                      </div>
                      <span className="text-[11px] text-white/15" style={{ fontFamily: "Geist, sans-serif" }}>0 sources</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main content — left side */}
            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-center pl-24 pr-8 lg:pr-[440px] w-full z-10">
              {/* Mobile step indicator */}
              <div className="lg:hidden flex items-center gap-2 mb-8">
                {steps.map((_, i) => (
                  <div key={i}>
                    <div
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-500",
                        i === step ? "w-6" : "w-1.5",
                        i <= step ? "bg-white" : "bg-white/20"
                      )}
                      style={i === step ? { background: DEFAULT_COLOR } : undefined}
                    />
                  </div>
                ))}
                <span className="ml-2 text-[11px] font-mono text-white/30" style={{ fontFamily: "Geist Mono, monospace" }}>
                  {step + 1}/{TOTAL_STEPS}
                </span>
              </div>

              {/* Headline */}
              <div className="mb-4">
                <h1 className="text-5xl sm:text-6xl lg:text-[68px] font-semibold tracking-[-0.04em] text-white leading-[1.0]">
                  <TextType
                    key={step}
                    text={steps[step].headline.join(" ")}
                    typingSpeed={45}
                    initialDelay={200}
                    loop={false}
                    showCursor={true}
                    cursorCharacter="|"
                    cursorClassName="text-white/40"
                    className="font-inherit"
                  />
                </h1>
              </div>

              {/* Hint */}
              <p className="text-[15px] text-white/35 onboarding-fade-slide" style={{ animationDelay: "350ms", fontFamily: "Geist, sans-serif" }}>
                {steps[step].hint}
              </p>

              {/* Error */}
              {error && (
                <div className="mt-5 rounded-xl bg-red-500/10 border border-red-500/25 px-4 py-3 text-sm text-red-300 onboarding-fade-slide" role="alert">
                  {error}
                </div>
              )}

              {/* Input area */}
              <div className="mt-8 max-w-md">
                {step === 0 && (
                  <div className="onboarding-fade-slide" style={{ animationDelay: "420ms" }}>
                    <input
                      ref={inputRef}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={steps[0].placeholder}
                      className="w-full h-14 rounded-2xl bg-white/[0.04] border border-white/[0.1] px-5 text-lg text-white placeholder:text-white/20 outline-none focus:border-[#7c5cff]/50 focus:ring-4 focus:ring-[#7c5cff]/8 transition-all duration-300"
                      style={{ fontFamily: "Geist, sans-serif" }}
                    />
                  </div>
                )}

                {step === 1 && (
                  <div className="onboarding-fade-slide" style={{ animationDelay: "420ms" }}>
                    <textarea
                      ref={textareaRef}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={steps[1].placeholder}
                      rows={4}
                      className="w-full rounded-2xl bg-white/[0.04] border border-white/[0.1] px-5 py-4 text-base text-white placeholder:text-white/20 outline-none focus:border-[#7c5cff]/50 focus:ring-4 focus:ring-[#7c5cff]/8 transition-all duration-300 resize-none"
                      style={{ fontFamily: "Geist, sans-serif" }}
                    />
                  </div>
                )}

                {step === 2 && (
                  <div className="onboarding-fade-slide space-y-4" style={{ animationDelay: "420ms" }}>
                    {/* Upload zone */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-24 rounded-2xl border-2 border-dashed border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 flex flex-col items-center justify-center gap-2 cursor-pointer group"
                    >
                      <Upload size={20} className="text-white/30 group-hover:text-white/50 transition-DEFAULT_COLORs" />
                      <span className="text-[13px] text-white/30 group-hover:text-white/50 transition-DEFAULT_COLORs">
                        Click to upload files
                      </span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                    />

                    {/* URL input */}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Link2 size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                        <input
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddUrl(); } }}
                          placeholder="Paste a URL and press Enter"
                          className="w-full h-12 rounded-xl bg-white/[0.04] border border-white/[0.1] pl-10 pr-4 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#7c5cff]/50 focus:ring-4 focus:ring-[#7c5cff]/8 transition-all duration-300"
                          style={{ fontFamily: "Geist, sans-serif" }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddUrl}
                        className="h-12 px-4 rounded-xl bg-white/[0.06] border border-white/[0.1] text-sm text-white/60 hover:text-white hover:bg-white/[0.1] transition-all duration-200"
                        style={{ fontFamily: "Geist, sans-serif" }}
                      >
                        Add
                      </button>
                    </div>

                    {/* Source list */}
                    {sources.length > 0 && (
                      <div className="space-y-2 mt-3">
                        {sources.map((source) => (
                          <div
                            key={source.id}
                            className="flex items-center gap-3 h-11 px-3 rounded-xl bg-white/[0.03] border border-white/[0.06] group"
                          >
                            {source.type === "file" ? (
                              <FileText size={14} className="text-white/30 shrink-0" />
                            ) : (
                              <Link2 size={14} className="text-white/30 shrink-0" />
                            )}
                            <span className="text-[13px] text-white/60 truncate flex-1" style={{ fontFamily: "Geist, sans-serif" }}>
                              {source.name}
                            </span>
                            {source.size != null && (
                              <span className="text-[11px] text-white/25 shrink-0">
                                {(source.size / 1024).toFixed(source.size > 1024 * 1024 ? 0 : 1)}{source.size > 1024 * 1024 ? " MB" : " KB"}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => removeSource(source.id)}
                              className="h-6 w-6 rounded-lg flex items-center justify-center text-white/20 hover:text-white/60 hover:bg-white/[0.06] transition-all opacity-0 group-hover:opacity-100"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {sources.length === 0 && (
                      <p className="text-[12px] text-white/20 text-center mt-2">
                        No sources added yet. You can always add them later.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="mt-12 flex items-center gap-4 onboarding-fade-slide" style={{ animationDelay: "500ms" }}>
                <button
                  onClick={() => (step > 0 ? goTo(step - 1) : handleClose())}
                  className="h-12 px-5 rounded-full text-sm text-white/45 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
                  style={{ fontFamily: "Geist, sans-serif" }}
                >
                  {step > 0 ? "Back" : "Cancel"}
                </button>
                <button
                  onClick={handleNext}
                  disabled={busy}
                  className="h-12 px-7 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-all duration-200 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none flex items-center gap-2"
                  style={{ fontFamily: "Geist, sans-serif" }}
                >
                  {busy ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Creating…
                    </>
                  ) : step === TOTAL_STEPS - 1 ? (
                    "Create Project"
                  ) : (
                    "Continue"
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
