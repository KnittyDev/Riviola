import { redirect } from "next/navigation";

/**
 * Demo route: landing "View Demo" opens the staff demo at /demo/staff.
 */
export default function DemoPage() {
  redirect("/demo/staff");
}
