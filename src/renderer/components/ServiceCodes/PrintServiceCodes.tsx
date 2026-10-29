// ============================================================
// usePrintServiceCodes — Custom hook for A5 print of client service codes & rider profiles
// ============================================================
import type { Client, ServiceCode, GlovoRider } from '../../types';

export function usePrintServiceCodes() {
  const handlePrint = async (client: Client, codes: ServiceCode[]) => {
    const now = new Date();
    const printDate = now.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const codesHtml = codes.map((code) => {
      const displayName = code.subcategory_name
        ? `${code.category_name} &rarr; ${code.subcategory_name}`
        : code.category_name || '';

      let extraRowsHtml = '';

      // Custom field values
      if (code.customValues && code.customValues.length > 0) {
        extraRowsHtml += code.customValues
          .map(
            (v) =>
              `<tr class="detail-row"><td class="detail-label">${v.label || ''}</td><td class="detail-value">${v.value || ''}</td></tr>`
          )
          .join('');
      }

      // Description & Notes
      if (code.label) {
        extraRowsHtml += `<tr class="detail-row"><td class="detail-label">Description</td><td class="detail-value">${code.label}</td></tr>`;
      }
      if (code.notes) {
        extraRowsHtml += `<tr class="detail-row"><td class="detail-label">Notes</td><td class="detail-value">${code.notes}</td></tr>`;
      }

      return `
        <tr class="code-row">
          <td class="service-name">${displayName}</td>
          <td class="service-code">${code.code}</td>
        </tr>
        ${extraRowsHtml}
      `;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Client Manager — ${client.full_name}</title>
  <style>
    @page {
      size: A5 portrait;
      margin: 12mm 10mm 12mm 10mm;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 11pt;
      color: #1a1a1a;
      background: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      width: 100%;
      max-width: 148mm;
      margin: 0 auto;
    }

    /* ---- Header ---- */
    .header {
      text-align: center;
      padding-bottom: 10px;
      border-bottom: 2px solid #333;
      margin-bottom: 14px;
    }

    .header h1 {
      font-size: 16pt;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #2d2d2d;
      margin-bottom: 2px;
    }

    .header .subtitle {
      font-size: 8pt;
      color: #777;
      letter-spacing: 0.5px;
    }

    /* ---- Client info ---- */
    .client-info {
      margin-bottom: 14px;
      padding: 8px 0;
    }

    .client-info table {
      width: 100%;
      border-collapse: collapse;
    }

    .client-info td {
      padding: 3px 0;
      font-size: 10pt;
      vertical-align: top;
    }

    .client-info .info-label {
      font-weight: 600;
      width: 85px;
      color: #444;
    }

    .client-info .info-value {
      color: #1a1a1a;
    }

    /* ---- Separator ---- */
    .separator {
      border: none;
      border-top: 1px dashed #aaa;
      margin: 10px 0;
    }

    /* ---- Codes table ---- */
    .codes-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 4px;
    }

    .codes-table thead th {
      text-align: left;
      font-size: 9pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #555;
      padding: 6px 4px;
      border-bottom: 1.5px solid #333;
    }

    .codes-table .code-row td {
      padding: 7px 4px;
      border-bottom: 1px solid #e0e0e0;
      font-size: 10pt;
    }

    .codes-table .service-name {
      font-weight: 500;
      color: #333;
      width: 50%;
    }

    .codes-table .service-code {
      font-family: 'Consolas', 'Courier New', monospace;
      font-size: 11pt;
      font-weight: 700;
      color: #1a1a1a;
      letter-spacing: 0.5px;
    }

    /* Custom field detail rows */
    .codes-table .detail-row td {
      padding: 2px 4px 2px 20px;
      border-bottom: none;
      font-size: 8.5pt;
      color: #666;
    }

    .codes-table .detail-row .detail-label {
      font-weight: 600;
      width: 35%;
      color: #555;
    }

    .codes-table .detail-row .detail-value {
      color: #333;
    }

    /* ---- Footer ---- */
    .footer {
      margin-top: 16px;
      text-align: center;
      font-size: 7.5pt;
      color: #999;
      border-top: 1px solid #ddd;
      padding-top: 6px;
    }

    /* ---- Print-specific ---- */
    @media print {
      body { background: #fff; }
      .no-print { display: none !important; }
    }

    /* ---- Screen preview button ---- */
    .print-btn-container {
      text-align: center;
      padding: 16px;
    }

    .print-btn {
      background: #6366f1;
      color: #fff;
      border: none;
      padding: 10px 28px;
      font-size: 12pt;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      letter-spacing: 0.5px;
    }

    .print-btn:hover {
      background: #4f46e5;
    }
  </style>
  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</head>
<body>
  <div class="no-print print-btn-container">
    <button class="print-btn" onclick="window.print()">&#128424; Imprimer</button>
  </div>

  <div class="page">
    <div class="header">
      <h1>Client Manager</h1>
      <div class="subtitle">Gestion des Clients &amp; Services</div>
    </div>

    <div class="client-info">
      <table>
        <tr>
          <td class="info-label">Client</td>
          <td class="info-value">${client.full_name}</td>
        </tr>
        ${client.phone ? `<tr><td class="info-label">T&eacute;l&eacute;phone</td><td class="info-value">${client.phone}</td></tr>` : ''}
        ${client.cin ? `<tr><td class="info-label">CIN</td><td class="info-value">${client.cin}</td></tr>` : ''}
        <tr>
          <td class="info-label">Date</td>
          <td class="info-value">${printDate}</td>
        </tr>
      </table>
    </div>

    <hr class="separator" />

    <table class="codes-table">
      <thead>
        <tr>
          <th>Service</th>
          <th>Code</th>
        </tr>
      </thead>
      <tbody>
        ${codesHtml}
      </tbody>
    </table>

    <div class="footer">
      Client Manager &mdash; Imprim&eacute; le ${printDate}
    </div>
  </div>
</body>
</html>`;

    await window.api.print.openHtml(html);
  };

  const handlePrintRider = async (rider: GlovoRider) => {
    const now = new Date();
    const printDate = now.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Client Manager — Rider ${rider.rider_name}</title>
  <style>
    @page {
      size: A5 portrait;
      margin: 12mm 10mm 12mm 10mm;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 11pt;
      color: #1a1a1a;
      background: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      width: 100%;
      max-width: 148mm;
      margin: 0 auto;
    }

    /* ---- Header ---- */
    .header {
      text-align: center;
      padding-bottom: 10px;
      border-bottom: 2px solid #333;
      margin-bottom: 14px;
    }

    .header h1 {
      font-size: 16pt;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #2d2d2d;
      margin-bottom: 2px;
    }

    .header .subtitle {
      font-size: 8pt;
      color: #777;
      letter-spacing: 0.5px;
    }

    /* ---- Details info ---- */
    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }

    .info-table td {
      padding: 8px 4px;
      font-size: 10pt;
      border-bottom: 1px solid #e0e0e0;
      vertical-align: top;
    }

    .info-table .info-label {
      font-weight: 600;
      width: 120px;
      color: #444;
    }

    .info-table .info-value {
      color: #1a1a1a;
      font-weight: 500;
    }

    .info-table tr:last-of-type td {
      border-bottom: 1.5px solid #333;
    }

    /* ---- Separator ---- */
    .separator {
      border: none;
      border-top: 1px dashed #aaa;
      margin: 10px 0;
    }

    /* ---- Footer ---- */
    .footer {
      margin-top: 16px;
      text-align: center;
      font-size: 7.5pt;
      color: #999;
      border-top: 1px solid #ddd;
      padding-top: 6px;
    }

    /* ---- Print-specific ---- */
    @media print {
      body { background: #fff; }
      .no-print { display: none !important; }
    }

    /* ---- Screen preview button ---- */
    .print-btn-container {
      text-align: center;
      padding: 16px;
    }

    .print-btn {
      background: #6366f1;
      color: #fff;
      border: none;
      padding: 10px 28px;
      font-size: 12pt;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      letter-spacing: 0.5px;
    }

    .print-btn:hover {
      background: #4f46e5;
    }
  </style>
  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</head>
<body>
  <div class="no-print print-btn-container">
    <button class="print-btn" onclick="window.print()">&#128424; Imprimer</button>
  </div>

  <div class="page">
    <div class="header">
      <h1>Client Manager</h1>
      <div class="subtitle">Fiche Profil Rider Glovo</div>
    </div>

    <table class="info-table">
      <tr>
        <td class="info-label">Nom du Rider</td>
        <td class="info-value">${rider.rider_name}</td>
      </tr>
      <tr>
        <td class="info-label">ID Rider Glovo</td>
        <td class="info-value" style="font-family: monospace; font-weight: 700; font-size: 11pt;">${rider.rider_id}</td>
      </tr>
      <tr>
        <td class="info-label">T&eacute;l&eacute;phone</td>
        <td class="info-value">${rider.phone || '—'}</td>
      </tr>
      <tr>
        <td class="info-label">Email</td>
        <td class="info-value">${rider.email || '—'}</td>
      </tr>
      <tr>
        <td class="info-label">Ville</td>
        <td class="info-value">${rider.city || '—'}</td>
      </tr>
      <tr>
        <td class="info-label">Notes</td>
        <td class="info-value">${rider.notes || '—'}</td>
      </tr>
      <tr>
        <td class="info-label">Date d'Impression</td>
        <td class="info-value">${printDate}</td>
      </tr>
    </table>

    <div class="footer">
      Client Manager &mdash; Imprim&eacute; le ${printDate}
    </div>
  </div>
</body>
</html>`;

    await window.api.print.openHtml(html);
  };

  return { handlePrint, handlePrintRider };
}
