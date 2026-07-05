import DashboardLayout from "../../../shared/layout/DashboardLayout";
import useUsers from "../../auth/hooks/useUsers";
import { useEffect } from "react";

export default function Configuracion() {
  const { user, fetchUser } = useUsers();

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Información de la cuenta y preferencias.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 max-w-2xl">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Perfil
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-500">Nombre</dt>
            <dd className="font-medium text-gray-800">{user?.name || "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Correo</dt>
            <dd className="font-medium text-gray-800">{user?.email || "—"}</dd>
          </div>
        </dl>
      </div>
    </DashboardLayout>
  );
}
