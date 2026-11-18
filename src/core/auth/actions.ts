"use server";
import { redirect } from "next/navigation";
import { parseTarget } from "./identity";
import { sendCode, verifyCode } from "./otp";
import { endSession, startSession } from "./server";

export type LoginState =
  | { step: "enter"; kind: "phone" | "email"; error?: string; raw?: string }
  | { step: "code"; kind: "phone" | "email"; target: string; mockCode?: string; error?: string };

export async function loginAction(prev: LoginState, form: FormData): Promise<LoginState> {
  const intent = String(form.get("intent") ?? "");
  const kind = (form.get("kind") === "email" ? "email" : "phone") as "phone" | "email";

  if (intent === "switch") return { step: "enter", kind: kind === "phone" ? "email" : "phone" };
  if (intent === "back") return { step: "enter", kind };

  if (intent === "send" || intent === "resend") {
    const raw = String(form.get(intent === "resend" ? "target" : "identifier") ?? "");
    const t = parseTarget(kind, raw);
    if (!t)
      return {
        step: "enter",
        kind,
        raw,
        error: kind === "phone" ? "That doesn't look like an Aussie mobile. Try 04xx xxx xxx." : "That email doesn't look right.",
      };
    const res = await sendCode(t);
    if (!res.ok) return { step: "enter", kind, raw, error: res.error };
    return { step: "code", kind, target: t.value, mockCode: res.mockCode };
  }

  if (intent === "verify") {
    const target = String(form.get("target") ?? "");
    const t = parseTarget(kind, target);
    if (!t) return { step: "enter", kind, error: "Something went wrong. Start again." };
    const res = await verifyCode(t, String(form.get("code") ?? ""));
    if (!res.ok) return { step: "code", kind, target, error: res.error, mockCode: prev.step === "code" ? prev.mockCode : undefined };
    await startSession(res.userId);
    redirect("/home");
  }

  return prev;
}

export async function logoutAction() {
  await endSession();
  redirect("/login");
}
