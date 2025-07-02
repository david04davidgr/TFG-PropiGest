//Variables
    //Obtencion de datos BD
    fetch('./../php/obtenerPropiedades.php')
    .then(response => {
        if (response.status === 401) { //Si el usuario no esta autenticado lo devuelve al index(login)
            window.location.href = '../index.html';
            return;
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        mostrarPropiedades(data);
        mostarTotalPropiedades(data);
    })
    .catch(error => console.error('Error al obtener las propiedades: ',error));
    
    fetch('./../php/obtenerAllMovimientos.php')
    .then(response => {
        if (response.status === 401) { //Si el usuario no esta autenticado lo devuelve al index(login)
            window.location.href = '../index.html';
            return;
        }
        return response.json();
    })
    .then(data => {
        movimientos = data;
        const mes = new Date().getMonth();
        let ingresosPorMes = Array(12).fill(0);
        let gastosPorMes = Array(12).fill(0);

        if (movimientos.length > 0) {
            movimientos.forEach(movimiento => {

                if (movimiento.tipo.toLowerCase() == "ingreso") {
                    ingresosPorMes[mes] += Number(movimiento.cantidad);
                }else{
                    gastosPorMes[mes] += Number(movimiento.cantidad);
                }
            });
        }

        mostrarStats(mes, ingresosPorMes, gastosPorMes);

        const pluginNoData = {
            id: 'noData',
            afterDraw(chart) {
                const { data } = chart;
                if (
                !data ||
                !data.datasets.length ||
                data.datasets[0].data.length === 0 ||
                data.datasets[0].data.every(val => val === 0 || val == null)
                ) {
                const { ctx, width, height } = chart;
                ctx.save();
                ctx.clearRect(0, 0, width, height);
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = '16px sans-serif';
                ctx.fillStyle = '#f5f5f5';
                ctx.fillText('No se han registrado movimientos', width / 2, height / 2);
                ctx.restore();
                }
            }
        };

        //Grafico Balance
        let graficoBalance = document.querySelector('#graphBalance');
        const labelsBal = ['Ingresos', 'Gastos'];
        const colorsBal = ['#4caf50','rgb(255, 0, 0)'];

        const dataBal = {
            labels: labelsBal,
            datasets: [{
                data: [ingresosPorMes[mes],gastosPorMes[mes]],
                backgroundColor: colorsBal,
            }]
        };
        
        const configBal = {
            type: 'doughnut',
            data: dataBal,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color:'#f5f5f5',
                        }
                    }
                }
            },
            plugins: [pluginNoData]
        };

        new Chart(graficoBalance, configBal);//Crea grafico de balance
    })
    .catch(error => console.error('Error al obtener los movimientos: ',error));
    
    fetch('./../php/obtenerAllReservas.php')
    .then(response => {
        if (response.status === 401) { //Si el usuario no esta autenticado lo devuelve al index(login)
            window.location.href = '../index.html';
            return;
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        reservas = data;

        let reservasPorMes = Array(12).fill(0);

        if (reservas.length > 0) {
            reservas.forEach(reserva => {
                const fecha = new Date(reserva.fechaInicio);
                const mes = fecha.getMonth();
                reservasPorMes[mes]++;
            });
        }
        
        //Grafico actividad de propiedades
        let graficoActividad = document.querySelector('#graphActividad');

        const labels = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

        const dataReservas = {
            labels: labels,
            datasets: [{
                label: 'Número de Reservas',
                data: reservasPorMes,
                fill: false,
                borderColor: '#4caf50',
                tension:0.1
            }]
        };

        const config = {
            type: 'line',
            data: dataReservas,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#f5f5f5',
                        }
                    },
                    tooltip: {
                        titleColor: '#f5f5f5',
                        bodyColor: '#333',
                        backgroundColor: '#4caf50',
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: 'white'
                        }
                    },
                    y: {
                        ticks: {
                            color: 'white'
                        }
                    }
                }
            }
        };

        new Chart(graficoActividad, config);//Crea grafico de reservas
    })
    .catch(error => console.error('Error al obtener las reservas: ',error));

    //Funciones
    function mostrarStats(mes, ingresosPorMes, gastosPorMes){
        const ingresos = document.getElementById('ingresos');
        const gastos = document.getElementById('gastos');

        ingresos.innerHTML = '';
        ingresos.innerHTML = `
            <p>${ingresosPorMes[mes]}€</p>
            <h2>Ingresos</h2>
        `;

        gastos.innerHTML = '';
        gastos.innerHTML = `
            <p>${gastosPorMes[mes]}€</p>
            <h2>Gastos</h2>
        `;
    }

    function mostrarPropiedades(propiedades){
        let disponibles = 0;
        let noDisponibles = 0;     
            
        const contenedor = document.querySelector('#propiedades_container');
        contenedor.innerHTML = '';

        if (propiedades.length >=1 && propiedades) {
            propiedades.forEach(prop => {
                const div = document.createElement('div');
                let status;   
    
                let imagenes = prop.imagenes;
                imagenes = imagenes ? imagenes.split(',') : [];
    
                let imagenDefault = '../uploads/imagenes/default.png';
    
                if (imagenes.length === 0) {
                    imagenes[0] = [imagenDefault];
                }
    
                if(prop.disponibilidad === 1){
                    status = `<i class="fa-solid fa-check" style="color: #4CAF50;"></i><span style="color:#4CAF50"> Disponible</span>`;
                    disponibles += 1;  
                }
                if(prop.disponibilidad === 0){
                    status = `<i class="fa-solid fa-x" style="color: #ff0000;"></i><span style="color:#ff0000"> No Disponible</span>`;
                    noDisponibles += 1;
                }
    
                div.classList.add('tarjeta_propiedad');
                div.innerHTML = `
                    <img src="${imagenes[0]}" width="100%" alt="casa villanueva">
                    <div class="contenido">
                        <div class="izqd">
                            <div class="nombre_info">
                                <p>Nombre</p>
                                <h4>${prop.nombre}</h4>
                            </div>
                            <div class="precio_info">
                                <p>Precio</p>
                                <h4>${prop.precio}€/${prop.frecuencia_pago}</h4>
                            </div>
                        </div>
                        <div class="drch">
                            <div class="tipo_info">
                                <p>Tipo</p>
                                <h4>${prop.tipo}</h4>
                            </div>
                            <div class="dispo_info">
                                <p>Disponibilidad</p>
                                <h4>${status}</h4>
                            </div>
                        </div>
                    </div>
                    <div class="foot_tarjeta">
                        <a href="../html/propiedadDetails.html?id_propiedad=${prop.id}">
                            <button class="btn_izqd"><i class="fa-regular fa-pen-to-square"></i> Administrar</button>
                        </a>
                        <a href="../html/vistaMapa.html?id_propiedad=${prop.id}">
                            <button class="btn_drch"><i class="fa-regular fa-map"></i> Ver en mapa</button>
                        </a>
                    </div>
                `;
                contenedor.appendChild(div);
            });
        }else{
            contenedor.innerHTML = `
                <div class="buttonContainer">
                    <p>¡Añade tu primera propiedad!🏠</p>
                    <a href="../html/newPropiedad.html">
                        <button class="addPropiedadBtn">+ Añadir Propiedad</button>
                    </a>
                </div>
            `;
        }

        mostarPropiedadesDisponibles(disponibles);
        mostarPropiedadesNoDisponibles(noDisponibles);
    }

    function mostarTotalPropiedades(propiedades){
        const totalContainer = document.querySelector('#totalPropiedades'); 
        let total = 0;
        if (propiedades.length >= 0) {
            total = propiedades.length;
        }else{
            total = 0
        }       
        totalContainer.innerHTML = total;
    }

    function mostarPropiedadesDisponibles(disponibles){
        const disponiblesContainer = document.querySelector('#propiedadesDisponibles');        
        disponiblesContainer.innerHTML = `${disponibles}`;
    }

    function mostarPropiedadesNoDisponibles(noDisponibles){       
        const noDisponiblesContainer = document.querySelector('#propiedadesNoDisponibles');        
        noDisponiblesContainer.innerHTML = `${noDisponibles}`;
    }

const list = document.querySelectorAll('.list');
function activeLink() {
  list.forEach((item) =>
    item.classList.remove('active'));
    this.classList.add('active');
}
list.forEach((item) =>
  item.addEventListener('click', activeLink));