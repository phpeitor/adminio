document.addEventListener("DOMContentLoaded", () => {
  const endpoint = "./controller/asistencia_administradores.php";
  const form = document.getElementById("filtro-asistencias");
  const desdeInput = document.getElementById("desde");
  const hastaInput = document.getElementById("hasta");
  const totalValue = document.getElementById("total-value");
  const shownValue = document.getElementById("shown-value");
  const dateColumnValue = document.getElementById("date-column-value");
  const stateValue = document.getElementById("state-value");
  const tableHead = document.getElementById("table-head");
  const tableBody = document.getElementById("table-body");
  const emptyState = document.getElementById("empty-state");
  const applyBtn = document.getElementById("apply-filter");
  const clearBtn = document.getElementById("clear-filter");

  const today = new Date();
  const localISO = date => {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date - offset).toISOString().slice(0, 10);
  };

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);
  desdeInput.value = localISO(sevenDaysAgo);
  hastaInput.value = localISO(today);

  const formatDate = value => {
    if (!value) return "-";
    const date = new Date(`${value}T00:00:00`);
    return new Intl.DateTimeFormat("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const escapeHtml = value => {
    if (value === null || value === undefined) return "";
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  };

  const badgeClassFor = estado => {
    const normalized = String(estado || "").trim().toUpperCase();
    if (normalized.includes("COMPLETO")) return "badge badge-completo";
    if (normalized.includes("PEND")) return "badge badge-pendiente";
    return "badge badge-default";
  };

  const buildUrl = () => {
    const params = new URLSearchParams();
    if (desdeInput.value) params.set("desde", desdeInput.value);
    if (hastaInput.value) params.set("hasta", hastaInput.value);
    params.set("limit", "250");
    params.set("offset", "0");
    return `${endpoint}?${params.toString()}`;
  };

  const setLoading = loading => {
    applyBtn.disabled = loading;
    applyBtn.textContent = loading ? "CARGANDO..." : "APLICAR";
    stateValue.textContent = loading ? "Consultando asistencia" : "Listo";
  };

  const renderTable = data => {
    const columns = Array.isArray(data.columns) ? data.columns : [];
    const rows = Array.isArray(data.rows) ? data.rows : [];

    if (columns.length === 0 || rows.length === 0) {
      tableHead.innerHTML = "";
      tableBody.innerHTML = "";
      emptyState.hidden = false;
      shownValue.textContent = "0";
      dateColumnValue.textContent = data.dateColumn || "-";
      return;
    }

    const preferredColumns = [
      "nombre_admin",
      "edificio",
      "fecha",
      "hora",
      "estado",
      "tipo_asistencia",
      "maps_url",
      "foto_url",
    ];

    const orderedColumns = [
      ...preferredColumns.filter(column => columns.includes(column)),
      ...columns.filter(column => !preferredColumns.includes(column)),
    ];

    const labels = {
      ticket_id: "Ticket",
      wa_id: "WA",
      nombre_admin: "Administrador",
      edificio: "Edificio",
      fecha: "Fecha",
      hora: "Hora",
      lat: "Latitud",
      lng: "Longitud",
      maps_url: "Mapa",
      foto_url: "Foto",
      estado: "Estado",
      trama: "Trama",
      registrado_por: "Registrado por",
      tipo_asistencia: "Tipo",
      hash_registro: "Hash",
      fecha_carga: "Fecha carga",
      fecha_actualizacion: "Actualización",
      id: "ID",
    };

    tableHead.innerHTML = `<tr>${orderedColumns
      .map(column => `<th>${escapeHtml(labels[column] || column.replaceAll("_", " "))}</th>`)
      .join("")}</tr>`;

    tableBody.innerHTML = rows
      .map(row => {
        return `<tr>${orderedColumns.map(column => {
          const value = row[column];

          if (column === "fecha") {
            return `<td>${escapeHtml(formatDate(value))}</td>`;
          }

          if (column === "maps_url" && value) {
            return `<td><a class="mini-link secondary" href="${escapeHtml(value)}" target="_blank" rel="noopener">Ver mapa</a></td>`;
          }

          if (column === "foto_url" && value) {
            return `<td><a class="mini-link" href="${escapeHtml(value)}" target="_blank" rel="noopener">Ver foto</a></td>`;
          }

          if (column === "estado") {
            return `<td><span class="${badgeClassFor(value)}"><span class="state-dot"></span>${escapeHtml(value || "-")}</span></td>`;
          }

          if (column === "trama") {
            const text = String(value || "-");
            return `<td title="${escapeHtml(text)}">${escapeHtml(text.slice(0, 110))}${text.length > 110 ? "..." : ""}</td>`;
          }

          if (value === null || value === undefined || value === "") {
            return `<td>-</td>`;
          }

          return `<td>${escapeHtml(value)}</td>`;
        }).join("")}</tr>`;
      })
      .join("");

    emptyState.hidden = true;
    shownValue.textContent = String(rows.length);
    dateColumnValue.textContent = data.dateColumn || "-";
  };

  const loadReport = async () => {
    setLoading(true);
    emptyState.hidden = true;

    try {
      const response = await fetch(buildUrl());
      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "No se pudo cargar el reporte");
      }

      totalValue.textContent = String(data.total ?? 0);
      renderTable(data);
    } catch (error) {
      tableHead.innerHTML = "";
      tableBody.innerHTML = "";
      emptyState.hidden = false;
      emptyState.textContent = error.message || "No se pudo cargar la información";
      totalValue.textContent = "0";
      shownValue.textContent = "0";
      dateColumnValue.textContent = "-";
      stateValue.textContent = "Error";
    } finally {
      setLoading(false);
    }
  };

  form.addEventListener("submit", event => {
    event.preventDefault();
    loadReport();
  });

  clearBtn.addEventListener("click", () => {
    desdeInput.value = localISO(sevenDaysAgo);
    hastaInput.value = localISO(today);
    loadReport();
  });

  loadReport();
});
