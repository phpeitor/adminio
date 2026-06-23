document.addEventListener("DOMContentLoaded", () => {
  const authLockedClass = "auth-locked";
  const endpoint = "./controller/asistencia_administradores.php";
  const authEndpoint = "./controller/validar_acceso_asistencias.php";
  const statusEndpoint = "./controller/estado_acceso_asistencias.php";
  const logoutEndpoint = "./controller/cerrar_sesion_asistencias.php";
  const tokenStorageKey = "asistencias_access_token";
  const form = document.getElementById("filtro-asistencias");
  const rangeInput = document.getElementById("rango-fechas");
  const totalValue = document.getElementById("total-value");
  const shownValue = document.getElementById("shown-value");
  const entradasValue = document.getElementById("entradas-value");
  const salidasValue = document.getElementById("salidas-value");
  const tableHead = document.getElementById("table-head");
  const tableBody = document.getElementById("table-body");
  const emptyState = document.getElementById("empty-state");
  const applyBtn = document.getElementById("apply-filter");
  const clearBtn = document.getElementById("clear-filter");
  const accessOverlay = document.getElementById("access-overlay");
  const accessForm = document.getElementById("access-form");
  const accessToken = document.getElementById("access-token");
  const accessError = document.getElementById("access-error");
  const accessCountdown = document.getElementById("access-countdown");
  const accessSubmit = document.getElementById("access-submit");
  const logoutBtn = document.getElementById("logout-btn");
  let dataTableInstance = null;
  let rangePicker = null;
  const chartsSection = document.getElementById("charts-section");
  const chartAdmin = document.getElementById("chart-admin");
  const chartEdificio = document.getElementById("chart-edificio");
  const chartFecha = document.getElementById("chart-fecha");
  const chartTipo = document.getElementById("chart-tipo");
  let chartInstances = [];
  let accessReady = false;
  let blockCountdownTimer = null;
  let blockCountdownUntil = 0;

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

  const buildSecureUrl = baseUrl => {
    const token = getStoredToken();

    if (!token) {
      return baseUrl;
    }

    const url = new URL(baseUrl, window.location.href);
    url.searchParams.set("token", token);
    return url.toString();
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

  const unlockAccess = () => {
    document.body.classList.remove(authLockedClass);
    accessOverlay.hidden = true;
    accessError.textContent = "";
    accessReady = true;
  };

  const lockAccess = () => {
    document.body.classList.add(authLockedClass);
    accessOverlay.hidden = false;
    accessReady = false;
  };

  const showAccessError = message => {
    accessError.textContent = message;
  };

  const getStoredToken = () => sessionStorage.getItem(tokenStorageKey) || "";

  const clearBlockCountdown = () => {
    if (blockCountdownTimer) {
      window.clearInterval(blockCountdownTimer);
      blockCountdownTimer = null;
    }

    blockCountdownUntil = 0;
    accessCountdown.hidden = true;
    accessCountdown.textContent = "";
    accessForm.classList.remove("is-blocked");
    accessSubmit.disabled = false;
    accessToken.disabled = false;
  };

  const formatCountdown = totalSeconds => {
    const seconds = Math.max(0, Math.floor(totalSeconds));
    const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
    const remainingSeconds = String(seconds % 60).padStart(2, "0");
    return `${minutes}:${remainingSeconds}`;
  };

  const updateBlockCountdown = () => {
    if (!blockCountdownUntil) {
      clearBlockCountdown();
      return;
    }

    const remainingSeconds = Math.max(0, Math.ceil((blockCountdownUntil - Date.now()) / 1000));

    if (remainingSeconds <= 0) {
      clearBlockCountdown();
      accessError.textContent = "Puedes volver a intentar ingresar el token";
      return;
    }

    accessCountdown.hidden = false;
    accessCountdown.textContent = `Bloqueado por ${formatCountdown(remainingSeconds)}`;
  };

  const startBlockCountdown = (remainingSeconds, message) => {
    const safeSeconds = Math.max(1, Number(remainingSeconds) || 0);

    clearBlockCountdown();
    accessForm.classList.add("is-blocked");
    accessSubmit.disabled = true;
    accessToken.disabled = true;
    showAccessError(message || "Demasiados intentos. Espera para volver a intentar");
    blockCountdownUntil = Date.now() + (safeSeconds * 1000);
    updateBlockCountdown();
    blockCountdownTimer = window.setInterval(updateBlockCountdown, 1000);
  };

   const destroyCharts = () => {
     chartInstances.forEach(chart => chart.destroy());
     chartInstances = [];
   };

   const groupCounts = (rows, field) => {
     const map = new Map();

     rows.forEach(row => {
       const rawValue = row[field];
       const value = String(rawValue === null || rawValue === undefined || rawValue === "" ? "Sin dato" : rawValue).trim();
       map.set(value, (map.get(value) || 0) + 1);
     });

     return [...map.entries()]
       .sort((a, b) => b[1] - a[1])
       .slice(0, 8);
   };

   const groupByDate = rows => {
     const map = new Map();

     rows.forEach(row => {
       const value = row.fecha ? String(row.fecha) : "Sin fecha";
       map.set(value, (map.get(value) || 0) + 1);
     });

     return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
   };

   const renderCharts = rows => {
     if (!window.ApexCharts) return;

     destroyCharts();

     const adminData = groupCounts(rows, "nombre_admin");
     const edificioData = groupCounts(rows, "edificio");
     const fechaData = groupByDate(rows);
     const tipoData = groupCounts(rows, "tipo_asistencia");

     const commonOptions = {
       chart: {
         toolbar: { show: false },
         zoom: { enabled: false },
         fontFamily: "inherit",
       },
       dataLabels: { enabled: false },
       grid: { borderColor: "rgba(41,48,66,0.08)" },
       stroke: { curve: "smooth", width: 3 },
       tooltip: { theme: "light" },
       colors: ["#445298"],
     };

     const adminChart = new ApexCharts(chartAdmin, {
       ...commonOptions,
       series: [{ name: "Asistencias", data: adminData.map(([, count]) => count) }],
       chart: { ...commonOptions.chart, type: "bar", height: 320 },
       plotOptions: { bar: { borderRadius: 8, horizontal: true } },
       xaxis: { categories: adminData.map(([label]) => label), labels: { style: { fontSize: "11px" } } },
       title: { text: "Por administrador", style: { fontSize: "16px", fontWeight: 700, color: "#293042" } },
     });

     const edificioChart = new ApexCharts(chartEdificio, {
       ...commonOptions,
       series: [{ name: "Asistencias", data: edificioData.map(([, count]) => count) }],
       chart: { ...commonOptions.chart, type: "bar", height: 320 },
       plotOptions: { bar: { borderRadius: 8, horizontal: true } },
       xaxis: { categories: edificioData.map(([label]) => label), labels: { style: { fontSize: "11px" } } },
       title: { text: "Por edificio", style: { fontSize: "16px", fontWeight: 700, color: "#293042" } },
       colors: ["#d96b14"],
     });

     const fechaChart = new ApexCharts(chartFecha, {
       ...commonOptions,
       series: [{ name: "Asistencias", data: fechaData.map(([, count]) => count) }],
       chart: { ...commonOptions.chart, type: "area", height: 320 },
       xaxis: { categories: fechaData.map(([label]) => label), labels: { style: { fontSize: "11px" } } },
       title: { text: "Por fecha", style: { fontSize: "16px", fontWeight: 700, color: "#293042" } },
       colors: ["#1d2ea7"],
       fill: { type: "gradient", gradient: { shadeIntensity: 0.35, opacityFrom: 0.35, opacityTo: 0.05 } },
     });

     const tipoChart = new ApexCharts(chartTipo, {
       series: tipoData.map(([, count]) => count),
       chart: { type: "donut", height: 320, fontFamily: "inherit" },
       labels: tipoData.map(([label]) => label),
       colors: ["#1d2ea7", "#d96b14", "#445298", "#2f315f"],
       title: { text: "Por tipo de asistencia", style: { fontSize: "16px", fontWeight: 700, color: "#293042" } },
       legend: { position: "bottom" },
       dataLabels: { enabled: false },
       plotOptions: { pie: { donut: { size: "68%" } } },
     });

     [adminChart, edificioChart, fechaChart, tipoChart].forEach(chart => {
       chart.render();
       chartInstances.push(chart);
     });

     chartsSection.hidden = rows.length === 0;
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
    return buildSecureUrl(`${endpoint}?${params.toString()}`);
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
    applyBtn.setAttribute("data-tooltip", loading ? "Cargando reporte" : "Aplicar filtro");
    applyBtn.setAttribute("aria-label", loading ? "Cargando reporte" : "Aplicar filtro de fechas");
    applyBtn.setAttribute("title", loading ? "Cargando reporte" : "Aplicar filtro de fechas");
    const label = applyBtn.querySelector(".btn-label");
    if (label) {
      label.textContent = loading ? "Cargando..." : "Aplicar";
    }
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
       destroyCharts();
       chartsSection.hidden = true;
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
      renderCharts(rows);

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
    if (!accessReady) {
      lockAccess();
      return;
    }

    if (!validateDateRange()) {
      return;
    }

    setLoading(true);
    emptyState.hidden = true;

    try {
      const response = await fetch(buildUrl(), {
        credentials: "same-origin",
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        if (response.status === 403) {
          lockAccess();
          showAccessError("Debes ingresar el token para acceder.");
          return;
        }
        throw new Error(data.message || "No se pudo cargar el reporte");
      }

      totalValue.textContent = String(data.total ?? 0);
      entradasValue.textContent = String(data.entradas ?? 0);
      salidasValue.textContent = String(data.salidas ?? 0);
      renderTable(data);
    } catch (error) {
      tableHead.innerHTML = "";
      tableBody.innerHTML = "";
      emptyState.hidden = false;
      emptyState.textContent = error.message || "No se pudo cargar la información";
      totalValue.textContent = "0";
      shownValue.textContent = "0";
      entradasValue.textContent = "0";
      salidasValue.textContent = "0";
       destroyCharts();
       chartsSection.hidden = true;
    } finally {
      setLoading(false);
    }
  };

  form.addEventListener("submit", event => {
    event.preventDefault();
    loadReport();
  });

  accessForm.addEventListener("submit", async event => {
    event.preventDefault();
    accessError.textContent = "";

    const token = accessToken.value.trim();

    if (!token) {
      showAccessError("Ingresa el token de acceso");
      accessToken.focus();
      return;
    }

    try {
      const response = await fetch(authEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        if (response.status === 429 || data.blocked) {
          startBlockCountdown(data.remaining_seconds || 300, data.message);
          return;
        }

        const attemptsLeft = Number.isFinite(Number(data.attempts_left)) ? Number(data.attempts_left) : null;
        if (attemptsLeft !== null) {
          showAccessError(`${data.message || "Token inválido"}. Te quedan ${attemptsLeft} intento${attemptsLeft === 1 ? "" : "s"}.`);
        }
        throw new Error(data.message || "Token inválido");
      }

      sessionStorage.setItem("asistencias_access_granted", "1");
      sessionStorage.setItem(tokenStorageKey, token);
      clearBlockCountdown();
      unlockAccess();
      await loadReport();
    } catch (error) {
      showAccessError(error.message || "No se pudo validar el token");
      accessToken.select();
    }
  });

  logoutBtn.addEventListener("click", async () => {
    try {
      const response = await fetch(logoutEndpoint, {
        method: "POST",
        credentials: "same-origin",
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "No se pudo cerrar la sesión");
      }

      sessionStorage.removeItem("asistencias_access_granted");
  sessionStorage.removeItem(tokenStorageKey);
      accessToken.value = "";
      clearBlockCountdown();
      destroyCharts();

      if (dataTableInstance) {
        dataTableInstance.destroy();
        dataTableInstance = null;
      }

      totalValue.textContent = "0";
      shownValue.textContent = "0";
      entradasValue.textContent = "0";
      salidasValue.textContent = "0";
      tableHead.innerHTML = "";
      tableBody.innerHTML = "";
      emptyState.hidden = true;
      lockAccess();
      alertify.success("Sesión cerrada correctamente");
    } catch (error) {
      alertify.error(error.message || "No se pudo cerrar la sesión");
    }
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

  const syncAccessState = async () => {
    try {
      const response = await fetch(buildSecureUrl(statusEndpoint), {
        credentials: "same-origin",
      });
      const data = await response.json();

      if (data.blocked) {
        lockAccess();
        startBlockCountdown(data.remaining_seconds || 300, "Demasiados intentos. Espera para volver a intentar");
        return;
      }

      if (data.authorized || sessionStorage.getItem("asistencias_access_granted") === "1") {
        sessionStorage.setItem("asistencias_access_granted", "1");
        clearBlockCountdown();
        unlockAccess();
        loadReport();
        return;
      }

      lockAccess();
    } catch (error) {
      if (sessionStorage.getItem("asistencias_access_granted") === "1") {
        unlockAccess();
        loadReport();
        return;
      }

      lockAccess();
    }
  };

  syncAccessState();
});
