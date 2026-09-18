import SecretRoomScreen from "@/components/easter-eggs/SecretRoomScreen";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Secret Room" };

export default function SecretRoomPage() {
  return <SecretRoomScreen />;
}
