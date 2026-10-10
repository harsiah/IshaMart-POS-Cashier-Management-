import { useAuth } from "../auth/AuthContext";
import { useState } from "react";
import UserManagement from "../pages/Management/User-management";
import "../../styles/management/layout-management.css";
import ProductManagement from "../pages/Management/ProductManagement/ProductManagement";
import GoodReceipt from "../pages/Management/GoodReceipt/GoodReceipt";

import {
  House,
  Users,
  Package,
  Folder,
  Truck,
  Database,
  ShoppingCart,
  ShoppingBag,
  BarChart3,
  FileText,
} from "lucide-react";

// ==========================================
// SIDEBAR NAVIGATION
// ==========================================

const navigationItems = [
  {
    icon: House,
    label: "Dashboard",
  },
  {
    icon: Users,
    label: "User Management",
  },
  {
    icon: Package,
    label: "Product Management",
  },
  {
    icon: Folder,
    label: "Category",
  },
  {
    icon: Truck,
    label: "Good Receipt (GR)",
  },
  {
    icon: Database,
    label: "Inventory",
  },
];

// ==========================================
// TOP MODULE NAVIGATION
// ==========================================

const moduleItems = [
  {
    icon: ShoppingCart,
    label: "Sales",
    dropdown: true,
  },
  {
    icon: ShoppingBag,
    label: "E-Commerce",
    dropdown: true,
  },
  {
    icon: BarChart3,
    label: "Business Intelligence",
    dropdown: true,
  },
  {
    icon: FileText,
    label: "Reports",
    dropdown: true,
  },
];

// ==========================================
// MANAGEMENT COMPONENT
// ==========================================

function Management({ onBack }) {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("Dashboard");

  const username = user?.username || "User";
  const role = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()
    : "User";

  return (
    <div
      className={`management-shell${
        activeSection === "Product Management"
          ? " product-management-theme"
          : activeSection === "User Management"
            ? " user-management-theme"
            : activeSection === "Good Receipt (GR)"
              ? " good-receipt-theme"
              : ""
      }`}
    >

      {/* ==================================
          SIDEBAR
      ================================== */}

      <aside className="management-sidebar">

        {/* Brand */}
        <div className="management-brand">
          <span
            className="management-brand-mark"
            aria-hidden="true"
          >
            🛒
          </span>

          <span>
            <strong>IshaMart</strong>
            <small>Management</small>
          </span>
        </div>

        {/* Navigation */}
        <nav
          className="management-nav"
          aria-label="Management navigation"
        >
          {navigationItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                type="button"
                title={item.label}
                aria-pressed={item.label === activeSection}
                onClick={() => setActiveSection(item.label)}
                className={`management-nav-item${
                  item.label === activeSection ? " active" : ""
                }`}
              >
                <Icon
                  size={21}
                  strokeWidth={2}
                  aria-hidden="true"
                />

                <span className="management-nav-label">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="management-sidebar-footer">
          <div className="management-footer-brand">
            <span aria-hidden="true">🛒</span>
            <strong>IshaMart</strong>
          </div>

          <p>
            Smarter Business,
            <br />
            Better Tomorrow
          </p>
        </div>

      </aside>

      {/* ==================================
          MAIN AREA
      ================================== */}

      <div className="management-main">

        {/* ==================================
            TOPBAR
        ================================== */}

        <header className="management-topbar">

          {/* Module Navigation */}
          <nav
            className="management-module-nav"
            aria-label="Application modules"
          >
            {moduleItems.map((item, index) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  type="button"
                  title={item.label}
                  className={`module-link${
                    index === 0 ? " active" : ""
                  }`}
                >
                  <Icon
                    size={20}
                    strokeWidth={2}
                    aria-hidden="true"
                  />

                  <span>{item.label}</span>

                  {item.dropdown && (
                    <span
                      className="module-arrow"
                      aria-hidden="true"
                    >
                      ⌄
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Account */}
          <div className="management-account">

            <span
              className="management-account-avatar"
              aria-hidden="true"
            >
              {username.charAt(0).toUpperCase()}
            </span>

            <div className="management-account-info">
              <strong>{username}</strong>
              <small>{role}</small>
            </div>

            <button
              type="button"
              className="management-account-button"
              onClick={onBack}
              aria-label="Return to portal"
            >
              ⌄
            </button>

          </div>

        </header>

        {/* ==================================
            PAGE CONTENT
        ================================== */}

        <main className="management-content">
          {activeSection === "User Management" && <UserManagement />}
          {activeSection === "Product Management" && <ProductManagement />}
          {activeSection === "Good Receipt (GR)" && <GoodReceipt />}



        </main>

      </div>

    </div>
  );
}

export default Management;