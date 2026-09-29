import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/** L'ancien dépôt de fichiers cède la place au pense-bête. */
export default function PageDocuments() {
  redirect("/pense-bete");
}
