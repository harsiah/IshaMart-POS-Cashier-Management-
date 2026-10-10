import Login from "./pages/login";
import Portal from "./pages/Portal";
import Management from "./layouts/Management";
import { useAuth } from "./auth/AuthContext";
import { useState } from "react";


function App() {
  const { isLoggedIn, logout } = useAuth();
  const [activeView, setActiveView] = useState("portal");

  if (!isLoggedIn) {
    return <Login />;
  }

  if (activeView === "management") {
    return <Management onBack={() => setActiveView("portal")} />;
  }

  return <Portal onLogout={logout} onOpenManagement={() => setActiveView("management")} />;
}

export default App;
