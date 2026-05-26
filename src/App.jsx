import AppLayout from "@/layouts/AppLayout";
import AppRoutes from "@/routes";

import { useAuth } from "@/providers/AuthProvider";

export default function App() {
  const { user } = useAuth();

  if (!user) {
    return <AppRoutes />;
  }

  return (
    <AppLayout>
      <AppRoutes />
    </AppLayout>
  );
}
