import MainLayout from "./layouts/MainLayout";
import AppRoutes from "./routes/AppRoutes";

// Main application wrapper
export default function App() {
  return (
    <MainLayout>
      <AppRoutes />
    </MainLayout>
  );
}
