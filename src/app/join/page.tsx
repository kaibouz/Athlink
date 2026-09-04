import { redirect } from "next/navigation";

/** Legacy alias — role gateway lives at /get-started. */
export default function JoinIndexPage() {
  redirect("/get-started");
}
