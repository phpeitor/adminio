document.addEventListener("DOMContentLoaded", () => {
  const endpoint = "./controller/asistencia_administradores.php";
  const form = document.getElementById("filtro-asistencias");
  const rangeInput = document.getElementById("rango-fechas");
  const totalValue = document.getElementById("total-value");
  const shownValue = document.getElementById("shown-value");
  const dateColumnValue = document.getElementById("date-column-value");
  const stateValue = document.getElementById("state-value");
  const tableHead = document.getElementById("table-head");
  const tableBody = document.getElementById("table-body");
  const emptyState = document.getElementById("empty-state");
  const applyBtn = document.getElementById("apply-filter");
  const clearBtn = document.getElementById("clear-filter");
  let dataTableInstance = null;
  let rangePicker = null;

  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const toISODate = date => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const rangeToParams = () => {
    const dates = rangePicker ? rangePicker.selectedDates : [];

    if (!dates || dates.length < 2) {
      return { desde: "", hasta: "" };
    }

    const [startDate, endDate] = dates;

    return {
      desde: toISODate(startDate),
      hasta: toISODate(endDate),
    };
  };

  if (window.flatpickr) {
    rangePicker = flatpickr(rangeInput, {
      mode: "range",
      dateFormat: "Y-m-d",
      altInput: true,
      altFormat: "d/m/Y",
      allowInput: false,
      defaultDate: [sevenDaysAgo, today],
      locale: {
        rangeSeparator: " al ",
      },
    });
  }

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

  const visibleColumns = [
    "id",
    "ticket_id",
    "wa_id",
    "nombre_admin",
    "edificio",
    "fecha",
    "hora",
    "tipo_asistencia",
    "lat",
    "lng",
    "maps_url",
    "foto_url",
    "estado",
  ];

  const buildUrl = () => {
    const { desde, hasta } = rangeToParams();
    const params = new URLSearchParams();
    if (desde) params.set("desde", desde);
    if (hasta) params.set("hasta", hasta);
    params.set("limit", "250");
    params.set("offset", "0");
    return `${endpoint}?${params.toString()}`;
  };

  const validateDateRange = () => {
    const dates = rangePicker ? rangePicker.selectedDates : [];

    if (!dates || dates.length < 2) {
      alertify.error("Debes seleccionar un rango de fechas completo");
      return false;
    }

    if (dates[0] > dates[1]) {
      alertify.error("La fecha inicio no puede ser mayor que la fecha fin");
      return false;
    }

    return true;
  };

  const setLoading = loading => {
    applyBtn.disabled = loading;
    applyBtn.textContent = loading ? "CARGANDO..." : "APLICAR";
    stateValue.textContent = loading ? "Consultando asistencia" : "Listo";
  };

  const renderTable = data => {
    const columns = Array.isArray(data.columns) ? data.columns : [];
    const rows = Array.isArray(data.rows) ? data.rows : [];
    const renderColumns = visibleColumns.filter(column => columns.includes(column));

    if (dataTableInstance) {
      dataTableInstance.destroy();
      dataTableInstance = null;
    }

    if (renderColumns.length === 0 || rows.length === 0) {
      tableHead.innerHTML = "";
      tableBody.innerHTML = "";
      emptyState.hidden = false;
      shownValue.textContent = "0";
      dateColumnValue.textContent = data.dateColumn || "-";
      return;
    }

    const labels = {
      id: "ID",
      ticket_id: "Ticket",
      wa_id: "WA ID",
      nombre_admin: "Administrador",
      edificio: "Edificio",
      fecha: "Fecha",
      hora: "Hora",
      tipo_asistencia: "Tipo asistencia",
      lat: "Latitud",
      lng: "Longitud",
      maps_url: "Mapa",
      foto_url: "Foto",
      estado: "Estado",
    };

    tableHead.innerHTML = `<tr>${renderColumns
      .map(column => `<th>${escapeHtml(labels[column] || column.replaceAll("_", " "))}</th>`)
      .join("")}</tr>`;

    tableBody.innerHTML = rows
      .map(row => {
        return `<tr>${renderColumns.map(column => {
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

          if (column === "tipo_asistencia") {
            return `<td><span class="badge badge-default">${escapeHtml(value || "-")}</span></td>`;
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

    if (window.jQuery && $.fn && $.fn.DataTable) {
      dataTableInstance = $(".report-table").DataTable({
        destroy: true,
        pageLength: 10,
        lengthMenu: [10, 25, 50, 100],
        order: [[5, "desc"]],
        responsive: true,
        autoWidth: false,
        language: {
          search: "Buscar:",
          lengthMenu: "Mostrar _MENU_ registros",
          info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
          infoEmpty: "Mostrando 0 a 0 de 0 registros",
          infoFiltered: "(filtrado de _MAX_ registros)",
          zeroRecords: "No se encontraron coincidencias",
          paginate: {
            first: "Primero",
            last: "Último",
            next: "Siguiente",
            previous: "Anterior",
          },
        },
      });
    }
  };

  const loadReport = async () => {
    if (!validateDateRange()) {
      return;
    }

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
    if (rangePicker) {
      rangePicker.clear();
      rangePicker.setDate([sevenDaysAgo, today], true, "Y-m-d");
    } else {
      rangeInput.value = "";
    }
    loadReport();
  });

  loadReport();
});
