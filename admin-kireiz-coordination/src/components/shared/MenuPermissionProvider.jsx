"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiGetMyPermissions } from "@/services/PermissionService";

/*
 * Menu-level permission gate for the admin panel.
 *
 * The backend grants access per Menu row (RoleMenuPermission.can_view) and
 * `my-permissions/` returns the menus the signed-in role may view. The template's
 * existing useAuthority/AuthorityCheck helpers match on role *names*, which does
 * not fit that model, so this provider works on menu **slugs** instead.
 *
 * Fetched once here rather than per-component so switching pages doesn't re-request.
 */

const MenuPermissionContext = createContext({
  allowedSlugs: [],
  loading: true,
  canView: () => true,
  refresh: () => {},
});

export const useMenuPermissions = () => useContext(MenuPermissionContext);

const MenuPermissionProvider = ({ children }) => {
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  // Seed from the JWT so the first paint has something to work with, then refresh
  // from the API. The JWT snapshot is taken at login and goes stale as soon as an
  // admin edits permissions (or a new menu is added), so it can't be the only source.
  const sessionSlugs = session?.user?.permissions || [];

  const [allowedSlugs, setAllowedSlugs] = useState(sessionSlugs);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const refresh = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await apiGetMyPermissions(accessToken);
      const menus = res?.data || [];
      setAllowedSlugs(menus.map((m) => m.slug).filter(Boolean));
      setFailed(false);
    } catch (error) {
      console.error("Failed to load menu permissions:", error);
      // Fail open: a permissions outage should not lock an admin out of their
      // own panel. Route guards stay closed only when we have a real answer.
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const canView = useCallback(
    (slug) => {
      // No slug = ungated (profile, change-password and similar).
      if (!slug) return true;
      // Fail open on an API error so a permissions outage can't lock the panel.
      if (failed) return true;
      return allowedSlugs.includes(slug);
    },
    [allowedSlugs, failed],
  );

  const value = useMemo(
    () => ({ allowedSlugs, loading, canView, refresh }),
    [allowedSlugs, loading, canView, refresh],
  );

  return (
    <MenuPermissionContext.Provider value={value}>
      {children}
    </MenuPermissionContext.Provider>
  );
};

export default MenuPermissionProvider;
