document.addEventListener("DOMContentLoaded", () => {

    const selectDistrito = document.getElementById("distrito");

    fetch("./static/data/distritos.json")
        .then(res => res.json())
        .then(data => {
            const distritos = data.lima;

            distritos.forEach(dist => {
                const option = document.createElement("option");
                option.value = dist;
                option.textContent = dist;
                selectDistrito.appendChild(option);
            });
        })
    .catch(err => console.error("Error cargando distritos:", err));

    const form = document.getElementById("form-contacto");
    const btn = document.getElementById("btn_registrar");

    btn.addEventListener("click", (e) => {
        e.preventDefault();

        const nombre   = document.getElementById("nombre").value.trim();
        const edificio = document.getElementById("edificio").value.trim();
        const correo   = document.getElementById("correo").value.trim();
        const telefono = document.getElementById("telefono").value.trim();
        const distrito = document.getElementById("distrito").value.trim();
        const mensaje  = document.getElementById("mensaje").value.trim();

        let isValidado = true;

        form.querySelectorAll("input[required],textarea[required],select[required]").forEach(campo => {
            if (!campo.value.trim() || campo.value == "0") {
                campo.classList.add("border-red-lighter");
                if (isValidado) campo.focus();
                isValidado = false;
            } else {
                campo.classList.remove("border-red-lighter");
            }
        });

        if (!isValidado) return;

        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const regexNum = /[^+\d]/g;

        if (nombre.replace(/ /g, "").length < 10) {
            return alertify.error("Nombre y Apellidos debe tener mínimo 10 caracteres");
        }

        if (edificio.replace(/ /g, "").length < 8) {
            return alertify.error("Edificio debe tener mínimo 8 caracteres");
        }

        if (mensaje.replace(/ /g, "").length < 15) {
            return alertify.error("Mensaje debe tener mínimo 15 caracteres");
        }

        if (telefono.replace(regexNum, "").length < 8) {
            return alertify.error("Teléfono debe tener mínimo 8 dígitos");
        }

        if (!regexEmail.test(correo)) {
            return alertify.error("Dirección de email incorrecta");
        }

        alertify.confirm(
            "Confirmación",
            "¿Desea enviar el mensaje?",
            () => sendEmail({ nombre, edificio, correo, telefono, distrito, mensaje }),
            () => console.log("Cancelado")
        );
    });
});

function sendEmail(data) {
    fetch("enviar_correo.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(resp => {
        if (resp.codigo === 1) {
            alertify.success(resp.mensaje);
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