"use client";

import { usePathname, useRouter } from "next/navigation";
import { FiLock } from "react-icons/fi";
import { useMenuPermissions } from "./MenuPermissionProvider";

/*
 * Blocks direct URL access to a section the signed-in role cannot view.
 *
 * The sidebar already hides forbidden sections, but hiding a link is not access
 * control — typing /system-settings still rendered the page. This closes that.
 *
 * Route -> menu slug must stay in step with AdminSidebar's `slug` values and the
 * Menu rows seeded by ensure_admin_menus() in uniformAdmin/permissions.py.
 */
const ROUTE_SLUGS = [
  ["/admin-form", "dashboard"],
  ["/products", "product_specification"],
  ["/contents", "content_media"],
  ["/pricing", "order_manage"],
  ["/customer", "customer_sales_representative"],
  ["/simulation-configuration", "pdf_simulation_configuration"],
  ["/reports-analytics", "reports_analytics"],
  ["/system-settings", "system_settings"],
  ["/quotation-requests", "quotation_requests"],
];

// Longest prefix wins so /customer/edit/12 resolves to the /customer slug.
const slugForPath = (pathname) => {
  if (!pathname) return null;
  const match = ROUTE_SLUGS.filter(([route]) => pathname.startsWith(route)).sort(
    (a, b) => b[0].length - a[0].length,
  )[0];
  return match ? match[1] : null;
};

const MenuRouteGuard = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { canView, loading } = useMenuPermissions();

  const slug = slugForPath(pathname);

  // Wait for the real answer before blocking, otherwise a permitted page would
  // flash "access denied" on every first load.
  if (slug && !loading && !canView(slug)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <div className="w-14 h-14 rounded-full bg-[#F1F5F9] flex items-center justify-center">
          <FiLock className="text-[#64748B]" size={22} />
        </div>
        <h2 className="text-xl font-semibold text-[#1C2C56] mt-4">
          You don&apos;t have access to this section
        </h2>
        <p className="text-sm text-[#64748B] mt-2 max-w-md">
          Your role does not include permission to view this page. Ask an
          administrator to grant access under Customer &amp; Sales
          Representative → Permission.
        </p>
        <button
          type="button"
          onClick={() => router.push("/admin-form")}
          className="mt-6 bg-[#1C4FA8] text-white px-5 py-2 rounded-lg text-sm font-medium"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return children;
};

export default MenuRouteGuard;
