document.addEventListener("DOMContentLoaded", () => {

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

    const minFields = [
        { id: "nombre",   msg: "Nombre y Apellidos" },
        { id: "edificio", msg: "Edificio" },
        { id: "mensaje",  msg: "Mensaje" }
    ];

    // Valida si un campo tiene mínimo N caracteres reales
    function validarMinimo(valor, minimo = 5) {
        return valor.replace(/\s+/g, "").length >= minimo;
    }

    btn.addEventListener("click", (e) => {
        e.preventDefault();

        const nombre   = document.getElementById("nombre").value.trim();
        const edificio = document.getElementById("edificio").value.trim();
        const correo   = document.getElementById("correo").value.trim();
        const telefono = document.getElementById("telefono").value.trim();
        const distrito = document.getElementById("distrito").value.trim();
        const mensaje  = document.getElementById("mensaje").value.trim();

        // ===============================
        // VALIDAR CAMPOS VACÍOS
        // ===============================
        let isValidado = true;
        form.querySelectorAll("input[required],textarea[required],select[required]").forEach(campo => {
            if (!campo.value.trim() || campo.value === "0") {
                campo.classList.add("border-red-lighter");
                if (isValidado) campo.focus();
                isValidado = false;
            } else {
                campo.classList.remove("border-red-lighter");
            }
        });

        if (!isValidado) return;


        // ===============================
        // VALIDAR CAMPOS MÍNIMOS
        // ===============================
        for (let campo of minFields) {
            const valor = document.getElementById(campo.id).value.trim();
            if (!validarMinimo(valor, 5)) {
                return alertify.error(`${campo.msg} debe tener mínimo 5 caracteres`);
            }
        }


        // ===============================
        // VALIDAR TELÉFONO (solo números)
        // ===============================
        const regexTelefono = /^[0-9+]+$/;

        if (!regexTelefono.test(telefono)) {
            return alertify.error("El teléfono solo debe contener números");
        }

        if (telefono.replace(/\D/g, "").length < 8) {
            return alertify.error("El teléfono debe tener mínimo 8 dígitos");
        }


        // ===============================
        // VALIDAR EMAIL
        // ===============================
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!regexEmail.test(correo)) {
            return alertify.error("Dirección de email incorrecta");
        }


        // ===============================
        // CONFIRMAR ENVÍO
        // ===============================
        alertify.confirm(
            "Confirmación",
            "¿Desea enviar el mensaje?",
            () => sendEmail({ nombre, edificio, correo, telefono, distrito, mensaje }),
            () => console.log("Cancelado")
        );
    });
});


// ===============================
// FUNCIÓN PARA ENVIAR CORREO
// ===============================
function sendEmail(data) {
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
        }
    })
    .catch(err => {
        console.error(err);
        alertify.error("Error inesperado");
    });
}
