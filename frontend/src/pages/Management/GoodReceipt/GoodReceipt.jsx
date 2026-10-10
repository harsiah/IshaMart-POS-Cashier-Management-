import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Archive,
  ClipboardList,
  Package,
  Plus,
  Truck,
} from "lucide-react";

import "../../../../styles/management/Good-receipt.css";

import {
  createGoodReceipt,
  getGoodReceipt,
  getGoodReceipts,
} from "../../../services/goodReceiptService";

import { getProducts } from "../../../services/productService";

import { formatCurrency } from "../../../utils/formatters";

import GoodReceiptTable from "./GoodReceiptTable";
import GoodReceiptModal from "./GoodReceiptModal";
import GoodReceiptViewModal from "./GoodReceiptViewModal";

import {
  formatInputDate,
  generateGRNumber,
  mapSavedReceipt,
} from "./GoodReceiptUtils";

// ==========================================
// CONSTANTS
// ==========================================

const ADD_NEW_SUPPLIER = "__add_new_supplier__";
const LAST_GR_SEQUENCE_KEY = "goodReceiptLastSequence";

// ==========================================
// GOOD RECEIPT
// ==========================================

function GoodReceipt() {
  // ========================================
  // MODAL & SEARCH
  // ========================================

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [receiptDateFilter, setReceiptDateFilter] =
    useState("");

  // ========================================
  // RECEIPTS
  // ========================================

  const [receipts, setReceipts] = useState([]);
  const [receiptsError, setReceiptsError] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receiptDetailsLoading, setReceiptDetailsLoading] =
    useState(false);
  const [receiptDetailsError, setReceiptDetailsError] =
    useState("");
  const viewRequestId = useRef(0);

  // ========================================
  // PRODUCTS
  // ========================================

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");

  // ========================================
  // RECEIPT FORM
  // ========================================

  const [grNumber, setGrNumber] = useState("");

  const [receiptDate, setReceiptDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [supplier, setSupplier] = useState("");
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [notes, setNotes] = useState("");

  // ========================================
  // PRODUCT FORM
  // ========================================

  const [productSearch, setProductSearch] = useState("");
  const [items, setItems] = useState([]);

  const [showNewProductForm, setShowNewProductForm] =
    useState(false);

  const [newProduct, setNewProduct] = useState({
    barcode: "",
    name: "",
    category: "",
    purchasePrice: "",
  });

  // ========================================
  // RECEIVE STATE
  // ========================================

  const [isReceiving, setIsReceiving] = useState(false);
  const [receiveError, setReceiveError] = useState("");

  // ========================================
  // LOAD DATA
  // ========================================

  useEffect(() => {
    let cancelled = false;

    async function loadGoodReceiptData() {
      const [productsResult, receiptsResult] =
        await Promise.allSettled([
          getProducts(),
          getGoodReceipts(),
        ]);

      if (cancelled) {
        return;
      }

      // PRODUCTS

      if (productsResult.status === "fulfilled") {
        setProducts(productsResult.value);
      } else {
        setProductsError(
          productsResult.reason?.message ||
            "Could not load products."
        );
      }

      // RECEIPTS

      if (receiptsResult.status === "fulfilled") {
        setReceipts(
          receiptsResult.value.map(mapSavedReceipt)
        );
      } else {
        setReceiptsError(
          receiptsResult.reason?.message ||
            "Could not load Good Receipts."
        );
      }

      setProductsLoading(false);
    }

    loadGoodReceiptData();

    return () => {
      cancelled = true;
    };
  }, []);

  // ========================================
  // SEARCHED PRODUCTS
  // ========================================

  const searchedProducts = useMemo(() => {
    const value = productSearch
      .toLowerCase()
      .trim();

    if (!value) {
      return [];
    }

    return products.filter((product) => {
      const productName =
        product.name?.toLowerCase() || "";

      const barcode =
        product.barcode?.toLowerCase() || "";

      return (
        productName.includes(value) ||
        barcode.includes(value)
      );
    });
  }, [products, productSearch]);

  // ========================================
  // FILTERED RECEIPTS
  // ========================================

  const filteredReceipts = useMemo(() => {
    const value = search
      .toLowerCase()
      .trim();

    return receipts.filter((receipt) => {
      const number =
        receipt.number?.toLowerCase() || "";

      const supplierName =
        receipt.supplier?.toLowerCase() || "";

      const matchesSearch =
        number.includes(value) ||
        supplierName.includes(value);
      const matchesDate =
        !receiptDateFilter ||
        String(receipt.date || "").slice(0, 10) ===
          receiptDateFilter;

      return (
        matchesSearch && matchesDate
      );
    });
  }, [receipts, search, receiptDateFilter]);

  // ========================================
  // SUPPLIER HISTORY
  // ========================================

  const supplierHistory = useMemo(() => {
    return [
      ...new Set(
        receipts
          .map((receipt) => receipt.supplier)
          .filter(Boolean)
      ),
    ];
  }, [receipts]);

  // ========================================
  // TOTAL CURRENT RECEIPT
  // ========================================

  const totalItems = useMemo(() => {
    return items.reduce(
      (total, item) =>
        total + Number(item.quantity || 0),
      0
    );
  }, [items]);

  const totalPurchaseValue = useMemo(() => {
    return items.reduce(
      (total, item) =>
        total +
        Number(item.quantity || 0) *
          Number(item.purchase_price || 0),
      0
    );
  }, [items]);

  // ========================================
  // RECEIPT STATISTICS
  // ========================================

  const receivedItemCount = useMemo(() => {
    return receipts.reduce(
      (total, receipt) =>
        total + Number(receipt.items || 0),
      0
    );
  }, [receipts]);

  const totalReceiptValue = useMemo(() => {
    return receipts.reduce(
      (total, receipt) =>
        total + Number(receipt.total || 0),
      0
    );
  }, [receipts]);

  // ========================================
  // OPEN NEW RECEIPT
  // ========================================

  function openNewReceipt() {
    const today = formatInputDate(new Date());

    setReceiptDate(today);

    setGrNumber(
      generateGRNumber(
        receipts,
        today
      )
    );

    setSupplier("");
    setIsAddingSupplier(false);
    setInvoiceNumber("");
    setNotes("");
    setProductSearch("");
    setItems([]);

    setShowNewProductForm(false);

    setNewProduct({
      barcode: "",
      name: "",
      category: "",
      purchasePrice: "",
    });

    setReceiveError("");
    setShowModal(true);
  }

  // ========================================
  // CLOSE MODAL
  // ========================================

  function closeModal() {
    setShowModal(false);
  }

  // ========================================
  // VIEW RECEIPT
  // ========================================

  async function handleViewReceipt(receipt) {
    const requestId = ++viewRequestId.current;
    setSelectedReceipt(receipt);
    setReceiptDetailsLoading(true);
    setReceiptDetailsError("");

    try {
      const receiptDetails = await getGoodReceipt(receipt.id);

      if (requestId !== viewRequestId.current) {
        return;
      }

      setSelectedReceipt({
        ...mapSavedReceipt(receiptDetails),
        invoiceNumber: receiptDetails.invoice_number,
        notes: receiptDetails.notes,
        itemDetails: receiptDetails.items || [],
      });
    } catch (error) {
      if (requestId === viewRequestId.current) {
        setReceiptDetailsError(
          error.message || "Could not load receipt details."
        );
      }
    } finally {
      if (requestId === viewRequestId.current) {
        setReceiptDetailsLoading(false);
      }
    }
  }

  function closeReceiptDetails() {
    viewRequestId.current += 1;
    setSelectedReceipt(null);
    setReceiptDetailsLoading(false);
    setReceiptDetailsError("");
  }

  // ========================================
  // ADD PRODUCT
  // ========================================

  function addProduct(product) {
    const existingItem = items.find(
      (item) =>
        item.product_id === product.id
    );

    if (existingItem) {
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.product_id === product.id
            ? {
                ...item,
                quantity:
                  Number(item.quantity) + 1,
              }
            : item
        )
      );
    } else {
      setItems((currentItems) => [
        ...currentItems,
        {
          product_id: product.id,
          barcode: product.barcode,
          name: product.name,
          purchase_price:
            product.purchase_price,
          quantity: 1,
        },
      ]);
    }

    setProductSearch("");
  }

  // ========================================
  // CHANGE QUANTITY
  // ========================================

  function changeQuantity(
    productId,
    quantity
  ) {
    const newQuantity = Math.max(
      1,
      Number(quantity) || 1
    );

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.product_id === productId
          ? {
              ...item,
              quantity: newQuantity,
            }
          : item
      )
    );
  }

  // ========================================
  // CHANGE PURCHASE PRICE
  // ========================================

  function changePurchasePrice(
    productId,
    purchasePrice
  ) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.product_id === productId
          ? {
              ...item,
              purchase_price:
                purchasePrice,
            }
          : item
      )
    );
  }

  // ========================================
  // REMOVE ITEM
  // ========================================

  function removeItem(productId) {
    setItems((currentItems) =>
      currentItems.filter(
        (item) =>
          item.product_id !== productId
      )
    );
  }

  // ========================================
  // ADD NEW PRODUCT
  // ========================================

  function addNewProduct() {
    const barcode =
      newProduct.barcode.trim();

    const name =
      newProduct.name.trim();

    if (!barcode || !name) {
      setReceiveError(
        "New products require a name and barcode."
      );
      return;
    }

    const existingProduct = products.find(
      (product) =>
        product.barcode?.toLowerCase() ===
        barcode.toLowerCase()
    );

    const duplicateReceiptItem =
      items.some(
        (item) =>
          item.barcode?.toLowerCase() ===
          barcode.toLowerCase()
      );

    if (
      existingProduct ||
      duplicateReceiptItem
    ) {
      setReceiveError(
        "This barcode already exists. Search and select that product."
      );
      return;
    }

    const productId =
      `new-${Date.now()}`;

    setItems((currentItems) => [
      ...currentItems,
      {
        product_id: productId,
        barcode,
        name,
        category:
          newProduct.category || null,
        purchase_price:
          Number(
            newProduct.purchasePrice || 0
          ),
        quantity: 1,
        is_new: true,
      },
    ]);

    setNewProduct({
      barcode: "",
      name: "",
      category: "",
      purchasePrice: "",
    });

    setShowNewProductForm(false);
    setReceiveError("");
    setProductSearch("");
  }

  // ========================================
  // RECEIVE GOODS
  // ========================================

  async function receiveGoods() {
    const supplierName =
      supplier.trim();

    setReceiveError("");

    if (!supplierName) {
      setReceiveError(
        "Please select or add a supplier."
      );
      return;
    }

    if (items.length === 0) {
      setReceiveError(
        "Please add at least one product."
      );
      return;
    }

    setIsReceiving(true);

    try {
      const savedReceipt =
        await createGoodReceipt({
          gr_number: grNumber,
          receipt_date: receiptDate,
          supplier: supplierName,
          invoice_number:
            invoiceNumber.trim() || null,
          notes:
            notes.trim() || null,

          items: items.map((item) => ({
            ...(item.is_new
              ? {
                  barcode: item.barcode,
                  name: item.name,
                  category: item.category,
                }
              : {
                  product_id:
                    Number(item.product_id),
                }),

            purchase_price:
              Number(
                item.purchase_price || 0
              ),

            quantity:
              Number(item.quantity || 0),
          })),
        });

      const newReceipt =
        mapSavedReceipt(
          savedReceipt
        );

      setReceipts((currentReceipts) => [
        newReceipt,
        ...currentReceipts.filter(
          (receipt) =>
            receipt.id !== newReceipt.id
        ),
      ]);

      // SAVE GR SEQUENCE

      try {
        localStorage.setItem(
          LAST_GR_SEQUENCE_KEY,
          grNumber.slice(
            grNumber.lastIndexOf("-") + 1
          )
        );
      } catch (error) {
        console.error(
          "Unable to save Good Receipt sequence.",
          error
        );
      }

      // REFRESH PRODUCTS

      try {
        const updatedProducts =
          await getProducts();

        setProducts(updatedProducts);
        setProductsError("");
      } catch (error) {
        console.error(
          "Product list refresh failed.",
          error
        );
      }

      closeModal();

      alert(
        "Good Receipt created successfully!"
      );
    } catch (error) {
      setReceiveError(
        error.message ||
          "Unable to receive goods."
      );
    } finally {
      setIsReceiving(false);
    }
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <section className="good-receipt-page">

      {/* ======================================
          HEADER
      ====================================== */}

      <header className="good-receipt-header">
        <div>
          <p className="good-receipt-eyebrow">
            INVENTORY MANAGEMENT
          </p>

          <h1>Good Receipt</h1>

          <p className="good-receipt-description">
            Record and track incoming goods
            from suppliers.
          </p>
        </div>

        <button
          className="good-receipt-add-button"
          type="button"
          onClick={openNewReceipt}
        >
          <Plus size={15} />
          New Receipt
        </button>
      </header>

      {/* ======================================
          STATISTICS
      ====================================== */}

      <section className="good-receipt-stats">

        <article className="good-receipt-stat-card">
          <div className="good-receipt-stat-icon green">
            <Archive size={19} />
          </div>

          <div>
            <span>Total Receipts</span>

            <strong>
              {receipts.length}
            </strong>

            <small>
              All recorded receipts
            </small>
          </div>
        </article>

        <article className="good-receipt-stat-card">
          <div className="good-receipt-stat-icon blue">
            <Package size={19} />
          </div>

          <div>
            <span>Items Received</span>

            <strong>
              {receivedItemCount}
            </strong>

            <small>
              Units across receipts
            </small>
          </div>
        </article>

        <article className="good-receipt-stat-card">
          <div className="good-receipt-stat-icon orange">
            <ClipboardList size={19} />
          </div>

          <div>
            <span>Total Purchase Value</span>

            <strong>
              {formatCurrency(
                totalReceiptValue
              )}
            </strong>

            <small>
              All recorded value
            </small>
          </div>
        </article>

        <article className="good-receipt-stat-card">
          <div className="good-receipt-stat-icon purple">
            <Truck size={19} />
          </div>

          <div>
            <span>Suppliers</span>

            <strong>
              {supplierHistory.length}
            </strong>

            <small>
              Unique suppliers
            </small>
          </div>
        </article>

      </section>

      {/* ======================================
          TABLE
      ====================================== */}

      <GoodReceiptTable
        filteredReceipts={filteredReceipts}
        receipts={receipts}
        search={search}
        setSearch={setSearch}
        receiptDateFilter={receiptDateFilter}
        setReceiptDateFilter={setReceiptDateFilter}
        receiptsError={receiptsError}
        onView={handleViewReceipt}
      />

      {/* ======================================
          MODAL
      ====================================== */}

      {showModal && (
        <GoodReceiptModal
          onClose={closeModal}

          grNumber={grNumber}

          receiptDate={receiptDate}
          setReceiptDate={setReceiptDate}

          supplier={supplier}
          setSupplier={setSupplier}

          isAddingSupplier={
            isAddingSupplier
          }
          setIsAddingSupplier={
            setIsAddingSupplier
          }

          supplierHistory={
            supplierHistory
          }

          invoiceNumber={
            invoiceNumber
          }
          setInvoiceNumber={
            setInvoiceNumber
          }

          notes={notes}
          setNotes={setNotes}

          productSearch={
            productSearch
          }
          setProductSearch={
            setProductSearch
          }

          products={products}
          productsLoading={
            productsLoading
          }
          productsError={
            productsError
          }

          searchedProducts={
            searchedProducts
          }

          items={items}

          totalItems={totalItems}

          totalPurchaseValue={
            totalPurchaseValue
          }

          newProduct={newProduct}
          setNewProduct={
            setNewProduct
          }

          showNewProductForm={
            showNewProductForm
          }
          setShowNewProductForm={
            setShowNewProductForm
          }

          receiveError={receiveError}

          isReceiving={isReceiving}

          addProduct={addProduct}

          changeQuantity={
            changeQuantity
          }

          changePurchasePrice={
            changePurchasePrice
          }

          removeItem={removeItem}

          addNewProduct={
            addNewProduct
          }

          receiveGoods={
            receiveGoods
          }

          ADD_NEW_SUPPLIER={
            ADD_NEW_SUPPLIER
          }
        />
      )}

      {selectedReceipt && (
        <GoodReceiptViewModal
          receipt={selectedReceipt}
          isLoading={receiptDetailsLoading}
          error={receiptDetailsError}
          onClose={closeReceiptDetails}
        />
      )}

    </section>
  );
}

export default GoodReceipt;