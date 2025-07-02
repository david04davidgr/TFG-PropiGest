document.getElementById("registerForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const formData = new FormData(this);

    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (password !== confirmPassword) {
        document.getElementById("errorMensaje").style.display = 'flex';
        document.getElementById("errorMensaje").textContent = 'Las contreñas no coinciden, deben ser iguales';
        return;
    }  

    fetch("../php/guardarUsuario.php", {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            window.location.href = "../index.html";
        } else {
            document.getElementById("errorMensaje").style.display = 'flex';
            document.getElementById("errorMensaje").textContent = data.message;
        }
    })
    .catch(err => {
        document.getElementById("errorMensaje").style.display = 'flex';
        document.getElementById("errorMensaje").textContent = "Ha ocurrido un error al procesar la solicitud.";
    });
});