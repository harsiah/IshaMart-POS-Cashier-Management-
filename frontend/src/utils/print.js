function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderDetails(details) {
  return details
    .map(
      ({ label, value }) => `
        <div class="detail">
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(value)}</strong>
        </div>
      `
    )
    .join("");
}

function renderTable(columns, rows) {
  if (columns.length === 0) {
    return "";
  }

  const headings = columns
    .map((column) => `<th>${escapeHtml(column)}</th>`)
    .join("");
  const body = rows.length
    ? rows
        .map(
          (row) => `
            <tr>${row
              .map((cell) => `<td>${escapeHtml(cell)}</td>`)
              .join("")}</tr>
          `
        )
        .join("")
    : `<tr><td colspan="${columns.length}">No items to print.</td></tr>`;

  return `
    <table>
      <thead><tr>${headings}</tr></thead>
      <tbody>${body}</tbody>
    </table>
  `;
}

function renderSignatures(signatures) {
  if (signatures.length === 0) {
    return "";
  }

  return `
    <section class="signatures">
      ${signatures
        .map(
          (label) => `
            <div class="signature">
              <div class="signature-line"></div>
              <strong>${escapeHtml(label)}</strong>
            </div>
          `
        )
        .join("")}
    </section>
  `;
}

export function printDocument({
  title,
  subtitle = "",
  details = [],
  columns = [],
  rows = [],
  notes = "",
  footer = "",
  signatures = [],
}) {
  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    throw new Error(
      "The print window was blocked. Allow pop-ups and try again."
    );
  }

  const documentHtml = `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${escapeHtml(title)}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 32px;
            color: #263a30;
            font-family: Arial, sans-serif;
            font-size: 12px;
          }
          h1 { margin: 0 0 6px; font-size: 22px; }
          .subtitle { margin: 0; color: #69786f; }
          .details {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
            margin: 24px 0;
          }
          .detail { display: grid; gap: 5px; }
          .detail span, .notes-label { color: #69786f; }
          .detail strong { font-weight: 600; }
          table { width: 100%; border-collapse: collapse; }
          th, td {
            padding: 10px;
            border: 1px solid #dfe5dd;
            text-align: left;
          }
          th { background: #f3f6f2; }
          .notes { margin-top: 22px; white-space: pre-wrap; }
          .notes p { margin: 6px 0 0; }
          .footer {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
            padding-top: 14px;
            border-top: 1px solid #dfe5dd;
            font-size: 14px;
            font-weight: 700;
          }
          .signatures {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 48px;
            margin: 72px 12px 0;
            page-break-inside: avoid;
          }
          .signature { text-align: center; }
          .signature-line {
            height: 1px;
            margin-bottom: 9px;
            border-top: 1px solid #263a30;
          }
          .signature strong { font-size: 11px; }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <header>
          <h1>${escapeHtml(title)}</h1>
          ${subtitle ? `<p class="subtitle">${escapeHtml(subtitle)}</p>` : ""}
        </header>
        ${
          details.length
            ? `<section class="details">${renderDetails(details)}</section>`
            : ""
        }
        ${renderTable(columns, rows)}
        ${
          notes
            ? `<section class="notes"><strong class="notes-label">Notes</strong><p>${escapeHtml(notes)}</p></section>`
            : ""
        }
        ${footer ? `<footer class="footer">${escapeHtml(footer)}</footer>` : ""}
        ${renderSignatures(signatures)}
      </body>
    </html>
  `;

  try {
    printWindow.document.open();
    printWindow.document.write(documentHtml);
    printWindow.document.close();
    printWindow.focus();
    window.setTimeout(() => {
      printWindow.print();
    }, 250);
  } catch (error) {
    printWindow.close();
    throw error;
  }
}