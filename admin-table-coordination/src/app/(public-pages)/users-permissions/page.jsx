import { Suspense } from "react";
import UsersPermissionsPage from "./components/UsersPermissionsPage";

export default function UsersPermissions() {
  return (
    <Suspense fallback={null}>
      <UsersPermissionsPage />
    </Suspense>
  );
}
