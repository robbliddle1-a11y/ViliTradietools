import { NextResponse } from "next/server";
import { getUser } from "@/core/auth/server";
import { getBusinessForUser } from "@/core/profile/repo";
import { getFile } from "@/core/storage";

/** Serves stored files to their owner only. Client-facing share links get their own route in Stage 4. */
export async function GET(_req: Request, ctx: { params: Promise<{ key: string[] }> }) {
  const { key } = await ctx.params;
  const user = await getUser();
  if (!user) return new NextResponse("Not found", { status: 404 });
  const biz = await getBusinessForUser(user.id);
  const owner = key[0];
  if (owner !== biz?.id && owner !== `u-${user.id}`) return new NextResponse("Not found", { status: 404 });

  const f = await getFile(key.join("/"));
  if (!f) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(Buffer.from(f.data), {
    headers: {
      "content-type": f.contentType,
      "cache-control": "private, max-age=86400",
      "x-content-type-options": "nosniff",
    },
  });
}
