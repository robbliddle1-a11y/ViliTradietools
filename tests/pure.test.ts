import { describe, expect, it } from "vitest";
import { parseDollars, splitGst, formatAud } from "../src/core/money";
import { isValidAbn } from "../src/core/profile/validate";
import { normaliseAuMobile } from "../src/core/auth/identity";
import { contractTotals } from "../src/tools/variations/totals";

describe("money", () => {
  it("parses what tradies type", () => {
    expect(parseDollars("45,200")).toBe(4_520_000);
    expect(parseDollars("$1,850.50")).toBe(185_050);
    expect(parseDollars("45k")).toBe(4_500_000);
    expect(parseDollars("-550")).toBe(-55_000);
    expect(parseDollars("abc")).toBeNull();
    expect(parseDollars("1.234")).toBeNull();
  });
  it("splits GST both ways, keeping sign", () => {
    expect(splitGst(110_00, true, true)).toEqual({ ex: 100_00, gst: 10_00, inc: 110_00 });
    expect(splitGst(100_00, false, true)).toEqual({ ex: 100_00, gst: 10_00, inc: 110_00 });
    expect(splitGst(-550_00, true, true)).toEqual({ ex: -500_00, gst: -50_00, inc: -550_00 });
    expect(splitGst(100_00, false, false)).toEqual({ ex: 100_00, gst: 0, inc: 100_00 });
  });
  it("formats", () => {
    expect(formatAud(-55_000)).toBe("−$550.00");
    expect(formatAud(185_000, true)).toBe("+$1,850.00");
  });
});

describe("validation", () => {
  it("checks ABNs", () => {
    expect(isValidAbn("51 824 753 556")).toBe(true); // ATO's own example
    expect(isValidAbn("51 824 753 557")).toBe(false);
  });
  it("normalises AU mobiles", () => {
    expect(normaliseAuMobile("0412 345 678")).toBe("+61412345678");
    expect(normaliseAuMobile("+61 412 345 678")).toBe("+61412345678");
    expect(normaliseAuMobile("07 3123 4567")).toBeNull();
  });
});

describe("contract totals", () => {
  it("only counts signed variations in the total", () => {
    const t = contractTotals(4_520_000, [
      { status: "signed", amount_inc_cents: 262_000, days_delta: 1 },
      { status: "signed", amount_inc_cents: -55_000, days_delta: 0 },
      { status: "sent", amount_inc_cents: 185_000, days_delta: 2 },
      { status: "declined", amount_inc_cents: 99_000, days_delta: 3 },
      { status: "draft", amount_inc_cents: 10_000, days_delta: 0 },
    ]);
    expect(t.current).toBe(4_727_000);
    expect(t.approved).toBe(207_000);
    expect(t.pending).toBe(185_000);
    expect(t.ifAllSigned).toBe(4_912_000);
    expect(t.approvedDays).toBe(1);
  });
});
