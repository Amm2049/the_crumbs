import ProfileClient from "@/components/client/ProfileClient";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "My Profile | The Crumbs",
  description: "Manage your account information and preferences.",
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return <ProfileClient session={session} />;
}
