document.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll(".nav-link").forEach(link => {
        link.style.cursor = "pointer";

        link.addEventListener("click", (e) => {
            e.preventDefault();

            const sectionId = link.getAttribute("data-section");
            const hash = md5(sectionId);

            // Cambia la URL visible por hash MD5
            window.location.hash = hash;

            // Hace scroll al elemento real
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
            }
        });
    });

    // Si el usuario recarga la página con el hash MD5, igual hacer scroll al section real
    const currentHash = window.location.hash.replace("#", "");
    if (currentHash.length === 32) { // MD5 siempre 32 chars
        const sections = ["nosotros", "servicios", "beneficios", "video", "contacto"];
        sections.forEach(sec => {
            if (md5(sec) === currentHash) {
                const el = document.getElementById(sec);
                if (el) {
                    setTimeout(() => {
                        el.scrollIntoView({ behavior: "smooth" });
                    }, 300);
                }
            }
        });
    }

    // ===============================
    // CARGAR DISTRITOS
    // ===============================
    const selectDistrito = document.getElementById("distrito");

    fetch("./static/data/distritos.json")
        .then(res => res.json())
        .then(data => {
            data.lima.forEach(dist => {
                const option = document.createElement("option");
                option.value = dist;
                option.textContent = dist;
                selectDistrito.appendChild(option);
            });
        })
        .catch(err => console.error("Error cargando distritos:", err));



    // ===============================
    // VALIDACIÓN DEL FORMULARIO
    // ===============================
    const form = document.getElementById("form-contacto");
    const btn = document.getElementById("btn_registrar");
    const btnText = document.getElementById("btn_registrar_text");
    let isSending = false;
    const fieldConfig = {
        nombre: { label: "Nombres y Apellidos", minLength: 5 },
        edificio: { label: "Nombre de edificio", minLength: 5 },
        correo: { label: "Correo" },
        telefono: { label: "Teléfono" },
        distrito: { label: "Distrito" },
        mensaje: { label: "Mensaje", minLength: 5 }
    };
    const requiredFields = ["nombre", "edificio", "correo", "telefono", "distrito", "mensaje"]
        .map(id => document.getElementById(id))
        .filter(Boolean);

    function setSubmitState(loading) {
        if (loading) {
            btn.disabled = true;
            btn.classList.add("is-loading");
            if (btnText) btnText.textContent = "ENVIANDO...";
        } else {
            btn.disabled = false;
            btn.classList.remove("is-loading");
            if (btnText) btnText.textContent = "ENVIAR";
        }
    }

    function getErrorNode(field) {
        return document.getElementById(`error-${field.id}`);
    }

    function clearFieldError(field) {
        field.classList.remove("input-error");
        field.removeAttribute("aria-invalid");
        const errorNode = getErrorNode(field);
        if (errorNode) errorNode.textContent = "";
    }

    function setFieldError(field, message) {
        field.classList.add("input-error");
        field.setAttribute("aria-invalid", "true");
        const errorNode = getErrorNode(field);
        if (errorNode) errorNode.textContent = message;
    }

    function attachLiveClear(field) {
        const eventName = field.tagName === "SELECT" ? "change" : "input";
        field.addEventListener(eventName, () => {
            clearFieldError(field);
        });
    }

    requiredFields.forEach(attachLiveClear);

    function validateField(field) {
        const config = fieldConfig[field.id];
        const value = field.value.trim();

        if (!value || value === "0") {
            setFieldError(field, field.id === "distrito" ? "Selecciona un distrito" : `Ingresa ${config.label}`);
            return false;
        }

        if (field.id === "telefono") {
            const regexTelefono = /^[0-9+]+$/;

            if (!regexTelefono.test(value)) {
                setFieldError(field, "El teléfono solo debe contener números");
                return false;
            }

            if (value.replace(/\D/g, "").length < 8) {
                setFieldError(field, "El teléfono debe tener mínimo 8 dígitos");
                return false;
            }
        }

        if (field.id === "correo") {
            const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!regexEmail.test(value)) {
                setFieldError(field, "Ingresa una dirección de correo válida");
                return false;
            }
        }

        if (config.minLength && value.replace(/\s+/g, "").length < config.minLength) {
            setFieldError(field, `${config.label} debe tener mínimo ${config.minLength} caracteres`);
            return false;
        }

        clearFieldError(field);
        return true;
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const nombre   = document.getElementById("nombre").value.trim();
        const edificio = document.getElementById("edificio").value.trim();
        const correo   = document.getElementById("correo").value.trim();
        const telefono = document.getElementById("telefono").value.trim();
        const distrito = document.getElementById("distrito").value.trim();
        const mensaje  = document.getElementById("mensaje").value.trim();

        let firstInvalidField = null;
        let isValidado = true;

        requiredFields.forEach(campo => {
            const isFieldValid = validateField(campo);
            if (!isFieldValid) {
                isValidado = false;
                if (!firstInvalidField) firstInvalidField = campo;
            }
        });

        if (!isValidado) {
            if (firstInvalidField) firstInvalidField.focus();
            return;
        }


        // ===============================
        // CONFIRMAR ENVÍO
        // ===============================
        alertify.confirm(
            "Confirmación",
            "¿Desea enviar el mensaje?",
            () => {
                if (isSending) return;
                isSending = true;
                setSubmitState(true);
                sendEmail(
                    { nombre, edificio, correo, telefono, distrito, mensaje },
                    {
                        onError: () => {
                            isSending = false;
                            setSubmitState(false);
                        }
                    }
                );
            },
            () => console.log("Cancelado")
        );
    });
});


// ===============================
// FUNCIÓN PARA ENVIAR CORREO
// ===============================
function sendEmail(data, { onError } = {}) {
    fetch("./config/envio_correo.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(resp => {
        if (resp.ok) {
            alertify.success(resp.message);
            setTimeout(() => location.reload(), 1500);
        } else {
            alertify.error("Error al enviar el mensaje");
            if (typeof onError === "function") onError();
        }
    })
    .catch(err => {
        console.error(err);
        alertify.error("Error inesperado");
        if (typeof onError === "function") onError();
    });
}
