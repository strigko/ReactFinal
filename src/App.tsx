import { Navigate, Route, Routes } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RequestsPage from "./pages/RequestsPage";
import CreateRequestPage from "./pages/CreateRequestPage";
import RequestDetailsPage from "./pages/RequestDetailsPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/requests" element={<RequestsPage />} />
          <Route path="/requests/:id" element={<RequestDetailsPage />} />

          <Route element={<ProtectedRoute roles={["user"]} />}>
            <Route path="/requests/new" element={<CreateRequestPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/requests" replace />} />
      <Route path="/not-found" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/not-found" replace />} />
    </Routes>
  );
}

export default App;
