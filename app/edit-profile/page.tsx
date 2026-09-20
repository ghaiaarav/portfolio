"use client";

import McMenuScreen from "@/components/mc/McMenuScreen";
import { ConfirmLink } from "@/components/ExternalConfirmProvider";

const RICKROLL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

export default function EditProfilePage() {
  return (
    <McMenuScreen title="Edit Profile" doneHref="/">
      <p className="mc-edit-profile-copy">
        Profile edits are handled on an external site.
      </p>
      <span className="mc-button-wrap mc-button-wrap--full">
        <ConfirmLink href={RICKROLL} className="mc-button">
          Continue
        </ConfirmLink>
      </span>
    </McMenuScreen>
  );
}
