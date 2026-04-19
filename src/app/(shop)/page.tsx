import { redirect } from "next/navigation";

// Homepage is handled by app/page.tsx — this avoids the route conflict
export default function ShopRoot() {
  redirect("/");
}
