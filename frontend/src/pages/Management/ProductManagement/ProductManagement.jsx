import React, { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  CircleDollarSign,
  Package,
  Plus,
  TriangleAlert,
} from "lucide-react";
import "../../../../styles/management/Product-management.css";

import {
  createProduct,
  deactivateProduct,
  getProducts,
  updateProduct,
} from "../../../services/productService";

import { PRODUCT_CATEGORIES } from "../../../constants/productCategories";

import ProductTable from "./ProductTable";
import ProductModal from "./ProductModal";

import { formatCurrency } from "../../../utils/formatters";

function ProductManagement() {
  // ========================================
  // PRODUCTS
  // ========================================

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [requestError, setRequestError] = useState("");

  // ========================================
  // SEARCH & FILTER
  // ========================================

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  // ========================================
  // MODAL
  // ========================================

  const [showModal, setShowModal] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  // ========================================
  // FORM
  // ========================================

  const [productName, setProductName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [stock, setStock] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");

  // ========================================
  // IMAGE
  // ========================================

  const [productImagePreview, setProductImagePreview] = useState("");

  // ========================================
  // LOAD PRODUCTS
  // ========================================

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        const savedProducts = await getProducts();

        if (!cancelled) {
          setProducts(savedProducts);
        }
      } catch (error) {
        if (!cancelled) {
          setRequestError(error.message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  // ========================================
  // CATEGORIES
  // ========================================

  const categories = useMemo(() => {
    return [
      ...new Set(products.map((product) => product.category).filter(Boolean)),
    ];
  }, [products]);

  // ========================================
  // FILTERED PRODUCTS
  // ========================================

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        product.name.toLowerCase().includes(searchValue) ||
        product.barcode.toLowerCase().includes(searchValue);

      const matchesCategory =
        category === "all" || product.category === category;

      const matchesStatus =
        status === "all" ||
        (status === "active" && product.is_active) ||
        (status === "inactive" && !product.is_active);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, category, status]);

  // ========================================
  // STATISTICS
  // ========================================

  const totalProducts = products.length;

  const activeProducts = products.filter((product) => product.is_active).length;

  const lowStockProducts = products.filter(
    (product) => product.stock > 0 && product.stock <= 10,
  ).length;

  const inventoryValue = products.reduce(
    (total, product) =>
      total + Number(product.purchase_price || 0) * Number(product.stock || 0),
    0,
  );

  // ========================================
  // RESET FORM
  // ========================================

  function resetForm() {
    setProductName("");
    setBarcode("");
    setProductCategory("");
    setStock("");
    setPurchasePrice("");
    setSellingPrice("");
    setProductImagePreview("");
  }

  // ========================================
  // OPEN ADD PRODUCT
  // ========================================

  function openAddProduct() {
    setEditingProduct(null);
    resetForm();
    setRequestError("");
    setShowModal(true);
  }

  // ========================================
  // CLOSE MODAL
  // ========================================

  function closeModal() {
    setShowModal(false);
    setEditingProduct(null);
    resetForm();
  }

  // ========================================
  // IMAGE UPLOAD
  // ========================================

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setProductImagePreview(String(reader.result));
    };

    reader.onerror = () => {
      setRequestError("Could not read the selected image.");
    };

    reader.readAsDataURL(file);
  }

  // ========================================
  // EDIT PRODUCT
  // ========================================

  function openEditProduct(product) {
    setEditingProduct(product);

    setProductName(product.name || "");
    setBarcode(product.barcode || "");
    setProductCategory(product.category || "");

    setStock(String(product.stock ?? 0));

    setPurchasePrice(String(product.purchase_price ?? 0));

    setSellingPrice(String(product.selling_price ?? 0));

    setProductImagePreview(product.image || "");

    setRequestError("");
    setShowModal(true);
  }

  // ========================================
  // SAVE PRODUCT
  // ========================================

  async function handleSaveProduct() {
    if (!productName.trim()) {
      alert("Please enter product name.");
      return;
    }

    if (!barcode.trim()) {
      alert("Please enter barcode.");
      return;
    }

    if (!productCategory) {
      alert("Please select category.");
      return;
    }

    if (purchasePrice === "" || sellingPrice === "") {
      alert("Please enter purchase price and selling price.");

      return;
    }

    const productData = {
      barcode: barcode.trim(),
      name: productName.trim(),
      category: productCategory,
      selling_price: Number(sellingPrice),
      purchase_price: Number(purchasePrice),
      stock: Number(stock || 0),
      image: productImagePreview || null,
    };

    setIsSaving(true);
    setRequestError("");

    try {
      if (editingProduct) {
        const savedProduct = await updateProduct(
          editingProduct.id,
          productData,
        );

        setProducts((currentProducts) =>
          currentProducts.map((product) =>
            product.id === savedProduct.id ? savedProduct : product,
          ),
        );
      } else {
        const savedProduct = await createProduct(productData);

        setProducts((currentProducts) => [...currentProducts, savedProduct]);
      }

      closeModal();
    } catch (error) {
      setRequestError(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  // ========================================
  // DEACTIVATE PRODUCT
  // ========================================

  async function handleDeactivateProduct(product) {
    const confirmed = window.confirm(`Deactivate ${product.name}?`);

    if (!confirmed) {
      return;
    }

    try {
      await deactivateProduct(product.id);

      setProducts((currentProducts) =>
        currentProducts.map((item) =>
          item.id === product.id
            ? {
                ...item,
                is_active: false,
              }
            : item,
        ),
      );

      setOpenMenu(null);
      setRequestError("");
    } catch (error) {
      setRequestError(error.message);
    }
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <section className="product-management-page">
      {/* ==================================
          HEADER
      ================================== */}

      <header className="product-management-header">
        <div>
          <p className="product-management-eyebrow">CATALOG & INVENTORY</p>

          <h1>Product Management</h1>

          <p className="product-management-description">
            Manage products, pricing and inventory in one place.
          </p>
        </div>

        <button
          className="product-management-add-button"
          type="button"
          onClick={openAddProduct}
        >
          <Plus size={16} aria-hidden="true" />
          Add New Product
        </button>
      </header>

      {/* ==================================
          STATISTICS
      ================================== */}

      <section className="product-management-stats">
        <article className="product-stat-card">
          <div className="product-stat-top">
            <span className="product-stat-label">Total Products</span>

            <span className="product-stat-icon" aria-hidden="true">
              <Package size={18} strokeWidth={1.8} />
            </span>
          </div>

          <strong>{totalProducts}</strong>

          <small>Products in catalog</small>
        </article>

        <article className="product-stat-card active">
          <div className="product-stat-top">
            <span className="product-stat-label">Active Products</span>

            <span className="product-stat-icon" aria-hidden="true">
              <BadgeCheck size={18} strokeWidth={1.8} />
            </span>
          </div>

          <strong>{activeProducts}</strong>

          <small>Currently available</small>
        </article>

        <article className="product-stat-card warning">
          <div className="product-stat-top">
            <span className="product-stat-label">Low Stock</span>

            <span className="product-stat-icon" aria-hidden="true">
              <TriangleAlert size={18} strokeWidth={1.8} />
            </span>
          </div>

          <strong>{lowStockProducts}</strong>

          <small>Need attention</small>
        </article>

        <article className="product-stat-card value">
          <div className="product-stat-top">
            <span className="product-stat-label">Inventory Value</span>

            <span className="product-stat-icon" aria-hidden="true">
              <CircleDollarSign size={18} strokeWidth={1.8} />
            </span>
          </div>

          <strong>{formatCurrency(inventoryValue)}</strong>

          <small>Based on purchase price</small>
        </article>
      </section>

      {/* ==================================
          PRODUCT LIST
      ================================== */}

      <section className="product-management-list">
        {requestError && <p role="alert">{requestError}</p>}

        {/* ==================================
            TOOLBAR
        ================================== */}

        <div className="product-management-toolbar">
          <label className="product-search">
            <input
              type="search"
              placeholder="Search product or barcode..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <label className="product-filter">
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="all">All Categories</option>

              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="product-filter">
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="all">All Status</option>

              <option value="active">Active</option>

              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>

        {/* ==================================
            TABLE
        ================================== */}

        <ProductTable
          products={filteredProducts}
          isLoading={isLoading}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
          onEdit={openEditProduct}
          onDeactivate={handleDeactivateProduct}
        />

        {/* ==================================
            FOOTER
        ================================== */}

        <footer className="product-table-footer">
          <span>
            Showing <strong>{filteredProducts.length}</strong> of{" "}
            <strong>{products.length}</strong> products
          </span>

          <span>{categories.length} categories</span>
        </footer>
      </section>

      {/* ==================================
          PRODUCT MODAL
      ================================== */}

      {showModal && (
        <ProductModal
          editingProduct={editingProduct}
          productName={productName}
          setProductName={setProductName}
          barcode={barcode}
          setBarcode={setBarcode}
          productCategory={productCategory}
          setProductCategory={setProductCategory}
          stock={stock}
          setStock={setStock}
          purchasePrice={purchasePrice}
          setPurchasePrice={setPurchasePrice}
          sellingPrice={sellingPrice}
          setSellingPrice={setSellingPrice}
          productImagePreview={productImagePreview}
          handleImageChange={handleImageChange}
          categories={PRODUCT_CATEGORIES}
          isSaving={isSaving}
          onSave={handleSaveProduct}
          onClose={closeModal}
        />
      )}
    </section>
  );
}

export default ProductManagement;
