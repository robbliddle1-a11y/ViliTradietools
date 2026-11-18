import { redirect } from "next/navigation";

// Stage 0: home goes to the style guide. Stage 1 replaces this with the app shell.
export default function Home() {
  redirect("/styleguide");
}
