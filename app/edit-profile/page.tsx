import TbaScreen from "@/components/options/TbaScreen";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Profile" };

export default function EditProfilePage() {
  return <TbaScreen title="Edit Profile" doneHref="/" />;
}
