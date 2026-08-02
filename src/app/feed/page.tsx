import { redirect } from "next/navigation";

/** Legacy path — SNS is the product surface */
export default function FeedRedirectPage() {
  redirect("/sns");
}
