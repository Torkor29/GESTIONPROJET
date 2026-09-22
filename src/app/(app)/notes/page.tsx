import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/** Les notes personnelles vivent désormais dans le pense-bête. */
export default function PageNotes() {
  redirect("/pense-bete");
}
