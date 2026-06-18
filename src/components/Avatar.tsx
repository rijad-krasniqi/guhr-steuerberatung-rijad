import type { MemberId } from "../lib/types";
import { MEMBERS } from "../lib/brand";

/**
 * Advisor avatar: a colored circle with initials, or a dashed "unassigned"
 * placeholder when no advisor is set. Shared between cards and the detail panel.
 */
export function Avatar({ member }: { member: MemberId | null }) {
  const m = member ? MEMBERS[member] : null;
  return (
    <span
      className="avatar"
      style={
        m
          ? { background: m.bg, color: "#fff" }
          : { background: "#f3efe6", color: "#b0a693", border: "1px dashed #cfc5b0" }
      }
    >
      {m ? m.initials : "?"}
    </span>
  );
}

/** Friendly advisor name, or "Unassigned". */
export function memberName(member: MemberId | null): string {
  return member ? MEMBERS[member].name : "Unassigned";
}
