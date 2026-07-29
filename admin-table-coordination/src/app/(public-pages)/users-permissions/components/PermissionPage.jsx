"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import {
  apiGetMenuList,
  apiGetRolePermissionList,
  apiUpdatePermissionList,
} from "@/services/UserPermissionService";
import Spinner from "@/components/ui/Spinner";

const PermissionPage = () => {
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (accessToken) {
      getMenuList();
      getRoleList();
    }
  }, [accessToken]);

  const getRoleList = async () => {
    try {
      setLoading(true);

      const res = await apiGetRolePermissionList(accessToken);
      console.log("Role API Response:", res);

      setRoles(res.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getMenuList = async () => {
    try {
      const res = await apiGetMenuList(accessToken);

      const menuList =
        res.data?.map((item) => ({
          id: item.id,
          name: item.name,
          admin: true,
          b2b: false,
        })) || [];

      setPermissions(menuList);
    } catch (error) {
      console.log(error);
    }
  };

  const togglePermission = (roleId, menuId) => {
    const role = roles.find((item) => item.role_id === roleId);

    if (role?.role_name?.toLowerCase() === "admin") {
      return;
    }

    setSelectedRoleId(roleId);

    setRoles((prev) =>
      prev.map((role) => {
        if (role.role_id !== roleId) return role;

        return {
          ...role,
          permissions: role.permissions.map((permission) =>
            permission.menu_id === menuId
              ? {
                  ...permission,
                  can_view: !permission.can_view,
                }
              : permission,
          ),
        };
      }),
    );
  };

  const handleSaveChanges = async () => {
    try {
      if (!selectedRoleId) {
        toast.push(
          <Notification title="Info" type="warning">
            Please modify a permission first.
          </Notification>,
        );
        return;
      }
      setSaving(true);

      const role = roles.find((item) => item.role_id === selectedRoleId);

      if (!role) return;

      const payload = {
        roles: roles.map((role) => ({
          role_id: role.role_id,
          permissions: role.permissions.map((permission) => ({
            menu_id: permission.menu_id,
            can_view: permission.can_view,
            can_create: permission.can_create,
            can_update: permission.can_update,
            can_delete: permission.can_delete,
            submenus: permission.submenus.map((submenu) => ({
              submenu_id: submenu.submenu_id,
              can_view: submenu.can_view,
              can_create: submenu.can_create,
              can_update: submenu.can_update,
              can_delete: submenu.can_delete,
            })),
          })),
        })),
      };

      const response = await apiUpdatePermissionList(accessToken, payload);

      toast.push(
        <Notification title="Success" type="success">
          {response?.message}
        </Notification>,
      );

      getRoleList(); // latest data refresh

      setSelectedRoleId(null);
    } catch (err) {
      console.log(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow p-4 mt-3">
        {/* Header */}
        {/* <div className="mb-6">
          <h2 className="text-[20px] font-semibold text-[#A0522D]">
            Role Permissions
          </h2>
          <p className="text-[#486284] text-sm mt-1">
            Configure access levels for different system roles. Admin
            permissions are locked for security.
          </p>
        </div> */}

        {/* Table */}
        <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-[400px]">
              <Spinner size={40} customColorClass="text-[#A0522D]" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-[#F7F2EE] border-b border-[#ECE7E3]">
                <tr className="text-[#486284]">
                  <th className="text-left text-[#1C1917] bg-[#FDF0E8] px-5 py-3 font-semibold">
                    Feature / Capability
                  </th>

                  {roles.map((role) => (
                    <th
                      key={role.role_name}
                      className="text-center px-5 py-3 font-medium"
                    >
                      {role.role_name}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {permissions.map((perm, index) => (
                  <tr
                    key={perm.id}
                    className="border-b last:border-none border-[#E2E8F0]"
                  >
                    <td className="px-5 py-4 font-medium">{perm.name}</td>

                    {/* <td className="px-5 py-4 text-center">
                  <ToggleSwitch checked={perm.admin} disabled />
                </td>

                <td className="px-5 py-4 text-center">
                  <ToggleSwitch
                    checked={perm.b2b}
                    onClick={() => togglePermission(index, "b2b")}
                  />
                </td> */}
                    {roles.map((role) => {
                      const permission = role.permissions.find(
                        (item) => item.menu_id === perm.id,
                      );
                      const isAdminRole =
                        role.role_name?.toLowerCase() === "admin";

                      return (
                        <td
                          key={role.role_name}
                          className="px-5 py-4 text-center"
                        >
                          <ToggleSwitch
                            checked={permission?.can_view ?? false}
                            disabled={isAdminRole}
                            onClick={() =>
                              togglePermission(role.role_id, perm.id)
                            }
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button className="border border-[#CBD5E1] text-[#486284] px-4 py-2 rounded-md text-sm">
            Cancel
          </button>

          <Button
            onClick={handleSaveChanges}
            loading={saving}
            className="bg-[#A0522D] h-9 text-white px-5 py-2 rounded-md text-sm font-medium"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </>
  );
};

export default PermissionPage;

const ToggleSwitch = ({ checked, onClick, disabled }) => {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={`relative w-12 h-6 rounded-full transition 
        ${checked ? "bg-[#1C2C56]" : "bg-gray-300"}
        ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition
          ${checked ? "translate-x-6" : ""}
        `}
      ></span>
    </button>
  );
};
