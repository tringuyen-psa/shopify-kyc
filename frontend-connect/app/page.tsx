import { redirect } from "next/navigation";

export default function HomePage() {
  // Redirect to account selection
  redirect("/select-account");
}