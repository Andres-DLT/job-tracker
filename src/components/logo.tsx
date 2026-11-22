import Link from "next/link";
import { BriefcaseIcon } from "./icons";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-semibold tracking-tight">
      <span className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground">
        <BriefcaseIcon width={15} height={15} />
      </span>
      Job Tracker
    </Link>
  );
}
