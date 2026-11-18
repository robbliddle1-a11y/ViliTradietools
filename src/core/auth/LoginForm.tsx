"use client";
import { useActionState } from "react";
import { Button, Field, Input, Notice } from "@/core/ui";
import { loginAction, type LoginState } from "./actions";
import { prettyAuMobile } from "./identity";

export function LoginForm() {
  const [state, act, pending] = useActionState<LoginState, FormData>(loginAction, { step: "enter", kind: "phone" });

  if (state.step === "code") {
    const shown = state.kind === "phone" ? prettyAuMobile(state.target) : state.target;
    return (
      <form action={act} className="space-y-5">
        <input type="hidden" name="kind" value={state.kind} />
        <input type="hidden" name="target" value={state.target} />
        <div>
          <h1 className="font-display text-[30px] font-[750] tracking-[-0.02em] leading-tight">Enter your code</h1>
          <p className="text-muted mt-1">
            We sent 6 numbers to <span className="font-semibold text-ink">{shown}</span>
          </p>
        </div>
        {state.mockCode && (
          <Notice tone="info" title={`Test mode: your code is ${state.mockCode}`}>
            No SMS or email provider is connected yet, so the code shows here.
          </Notice>
        )}
        <Field label="Code" error={state.error}>
          <Input
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9 ]*"
            maxLength={7}
            autoFocus
            className="text-center text-[28px] tracking-[0.4em] font-semibold num"
            placeholder="••••••"
          />
        </Field>
        <Button name="intent" value="verify" variant="accent" block disabled={pending}>
          {pending ? "Checking…" : "Log in"}
        </Button>
        <div className="flex justify-between">
          <Button name="intent" value="back" variant="ghost" size="md" type="submit" formNoValidate>
            ← Change {state.kind === "phone" ? "number" : "email"}
          </Button>
          <Button name="intent" value="resend" variant="ghost" size="md" type="submit" formNoValidate>
            Send again
          </Button>
        </div>
      </form>
    );
  }

  const phone = state.kind === "phone";
  return (
    <form action={act} className="space-y-5">
      <input type="hidden" name="kind" value={state.kind} />
      <div>
        <h1 className="font-display text-[30px] font-[750] tracking-[-0.02em] leading-tight">Log in or sign up</h1>
        <p className="text-muted mt-1">
          {phone ? "We'll text you a 6-digit code. No passwords." : "We'll email you a 6-digit code. No passwords."}
        </p>
      </div>
      <Field label={phone ? "Mobile number" : "Email"} error={state.error}>
        <Input
          key={state.kind}
          name="identifier"
          defaultValue={state.raw}
          type={phone ? "tel" : "email"}
          inputMode={phone ? "tel" : "email"}
          autoComplete={phone ? "tel" : "email"}
          placeholder={phone ? "04xx xxx xxx" : "you@yourbusiness.com.au"}
          autoFocus
        />
      </Field>
      <Button name="intent" value="send" variant="accent" block disabled={pending}>
        {pending ? "Sending…" : "Send code"}
      </Button>
      <Button name="intent" value="switch" variant="ghost" block size="md" formNoValidate>
        {phone ? "Use email instead" : "Use mobile instead"}
      </Button>
    </form>
  );
}
