document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const formData = new FormData(this);

    fetch("php/procesar_login.php", {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            window.location.href = "html/inicio.html"; // Redirige al dashboard o página principal
        } else {
            document.getElementById("errorMensaje").style.display = 'flex';
            document.getElementById("errorMensaje").textContent = data.message;
        }
    })
    .catch(err => {
        document.getElementById("errorMensaje").textContent = "Error al procesar la solicitud.";
    });
});
