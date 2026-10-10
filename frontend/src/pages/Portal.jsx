import "../../styles/portal.css";
import { useAuth } from "../auth/AuthContext";
import logoImage from "../assets/image/ishamart-logo.jpeg";
import managementImage from "../assets/image/management.jpeg";
import posImage from "../assets/image/pos.jpeg";
import ecommerceImage from "../assets/image/E-commerce.jpeg";
import Logout from "./Logout";


const portals = [
  {
    name: "IshaMart",
    title: "Management",

    features: [
      "Dashboard & Analytics",
      "Inventory & Product Management",
      "User Management",
      "Reports & Business Intelligence",
    ],
    className: "management",
    icon: "▥",
    image: managementImage,
  },
  {
    name: "IshaMart",
    title: "POS",

    features: [
      "Sales Transaction",
      "Payment & Refund",
      "Shift Management",
      "Day Settlement",
    ],
    className: "pos",
    icon: "▣",
    image: posImage,
  },
  {
    name: "IshaMart",
    title: "E-Commerce",
    features: [
      "Product Catalog",
      "Customer Orders",
      "Shipping & Delivery",
      "Online Sales Report",
    ],
    className: "ecommerce",
    icon: "🛒",
    image: ecommerceImage,
  },
];

function Portal({ onLogout, onOpenManagement }) {
  const { user } = useAuth();
  const username = user?.username || "User";
  const role = user?.role || "User";

  return (
    <main className="portal-page">
      <header className="portal-header">
        <div className="portal-brand">
          <img src={logoImage} alt="IshaMart" />
          <span>IshaMart</span>
        </div>

        <div className="portal-profile">
        <span className="notification" aria-label="Notifications">
        </span>

        <div>
            <strong>{username}</strong>
            <small>{role}</small>
          </div>
          <Logout onLogout={onLogout} />
        </div>
      </header>

      <section className="portal-hero">
        <div>
          <p className="eyebrow">WELCOME TO ISHAMART</p>
          <h1>
            Choose Your <span>Portal</span>
          </h1>
          <p className="hero-copy">
            Kelola bisnis Anda lebih mudah dengan satu sistem terintegrasi.
            <br />
            Pilih portal yang ingin Anda akses:
          </p>
        </div>
      </section>

      <section className="portal-grid" aria-label="Available portals">
        {portals.
          filter((portal) => {
           if (role === "cashier") {
            return portal.title !== "Management";
           }
           return true;
           })
  

          .map((portal) => (
          <article
            className={`portal-card ${portal.className}`}
            key={portal.title}
          >
            <div className="card-illustration">
              <img
                className="portal-image"
                src={portal.image}
                alt={`${portal.name} ${portal.title}`}
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
              <div className="illustration-screen">
                <span>{portal.icon}</span>
                <i />
                <i />
                <i />
              </div>
              <div className="illustration-plant" />
            </div>
            <div className="card-content">
              <div className="portal-icon">{portal.icon}</div>
              <h2>
                {portal.name}
                <br />
                <span>{portal.title}</span>
              </h2>
              <ul>
                {portal.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <button
                type="button"
                onClick={portal.title === "Management" ? onOpenManagement : undefined}
              >
                Open Portal <span>→</span>
              </button>
            </div>
          </article>
        ))}
      </section>

      <footer className="portal-benefits">
        <div>
          <b>♢</b>
          <span>
            <strong>Aman & Terpercaya</strong>
            <small>Data Anda selalu terlindungi</small>
          </span>
        </div>
        <div>
          <b>☁</b>
          <span>
            <strong>Akses Dimana Saja</strong>
            <small>Bisa diakses dari berbagai perangkat</small>
          </span>
        </div>
        <div>
          <b>ϟ</b>
          <span>
            <strong>Terintegrasi</strong>
            <small>Semua sistem dalam satu ekosistem</small>
          </span>
        </div>
        <div>
          <b>♡</b>
          <span>
            <strong>Untuk Pertumbuhan Bisnis Anda</strong>
            <small>IshaMart, solusi bersama Anda</small>
          </span>
        </div>
      </footer>
    </main>
  );
}






export default Portal;
