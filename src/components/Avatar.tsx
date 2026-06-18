import type { MemberId } from "../lib/types";
import { MEMBERS } from "../lib/brand";

export { memberLabel as memberName } from "../lib/brand";

/**
 * Advisor avatar: a colored circle with initials, or a dashed "unassigned"
 * placeholder when no advisor is set. Shared by cards, the detail panel, tasks,
 * the activity trail, and the "acting as" switcher — hence the optional size.
 */
export function Avatar({ member, size = 22 }: { member: MemberId | null; size?: number }) {
  const m = member ? MEMBERS[member] : null;
  return (
    <span
      className="avatar"
      style={{
        width: size,
        height: size,
        // Scale the initials with the circle so small avatars stay legible.
        fontSize: Math.round(size * 0.4),
        ...(m
          ? { background: m.bg, color: "#fff" }
          : { background: "#f3efe6", color: "#b0a693", border: "1px dashed #cfc5b0" }),
      }}
    >
      {m ? m.initials : "?"}
    </span>
  );
}
