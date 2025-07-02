const graficasContainer = document.querySelector('#graficasContainer')
const infoContainer = document.querySelector('#infoContainer');

graficasContainer.innerHTML = '';
infoContainer.innerHTML = '';
let contenidoPropiedadTop = '';
let mantenimientosCalendario = [];
let tarjetasMantenimiento = '';
let estadoMantenimiento = '';

let pendientes = 0;
let enProceso = 0;
let completados = 0;

async function cargarMantenimientos(){
    const response = await fetch(`./../php/obtenerAllMantenimientos.php`)
        if (response.status === 401) { //Si el usuario no esta autenticado lo devuelve al index(login)
            window.location.href = '../index.html';
            return;
        }
        const mantenimientos = await response.json();
        console.log(mantenimientos);
        
        let mantenimientosPorMes = Array(12).fill(0);

            if (mantenimientos.length > 0) {
                mantenimientos.forEach(mantenimiento => {
                    const fecha = new Date(mantenimiento.fechaProgramada);
                    const mes = fecha.getMonth();
                    mantenimientosPorMes[mes]++;
                });
            }
            
        let factura = '';
        
        if (mantenimientos.length > 0) {
            mantenimientosCalendario = mantenimientos.map(mantenimiento => {
                let color = '';
                if (mantenimiento.estado === 'pendiente') {
                    color = '#F44336'
                }else{
                    if (mantenimiento.estado === 'en proceso') {
                        color = '#FF9800'
                    }else{
                        color = '#4CAF50'
                    }
                }
                return {
                    title: `${mantenimiento.titulo}`,
                    start: mantenimiento.fechaProgramada,
                    end: mantenimiento.fechaRealizacion,
                    color: color,
                };
            });
            
            mantenimientos.forEach(mantenimiento => {
                estadoMantenimiento = '';
                factura = '';

                if (mantenimiento.estado === "pendiente") {
                    estadoMantenimiento = `
                        <p style="color: red;font-weight:bold">${mantenimiento.estado}</p>
                    `;
                    pendientes += 1;
                }

                if (mantenimiento.estado === "en proceso") {
                    estadoMantenimiento = `
                        <p style="color: orange;font-weight:bold">${mantenimiento.estado}</p>
                    `;
                    enProceso += 1;
                }

                if (mantenimiento.estado === "completado") {
                    estadoMantenimiento = `
                        <p style="color: green;font-weight:bold">${mantenimiento.estado}</p>
                    `;
                    completados += 1;
                }

                if (mantenimiento.rutaDocumento) {
                    factura = `<p><a href="${mantenimiento.rutaDocumento}" target="_blank" class="verDocumentoBtn">Ver Factura</a></p>`
                }else{
                    factura = `<p><a class="sinFactura">No Disponible</a></p>`
                }

                tarjetasMantenimiento += `
                    <div class="tarjeta ${mantenimiento.estado.toLowerCase().replace(/\s+/g, '-')}">
                        <div class="tarjeta-header">
                            <h2 class="nombre-propiedad">${mantenimiento.nombrePropiedad}</h2>
                            <div class="estado-badge ${mantenimiento.estado.toLowerCase().replace(/\s+/g, '-')}">
                                <i class="fas ${
                                    mantenimiento.estado === 'pendiente' ? 'fa-clock' :
                                    mantenimiento.estado === 'en proceso' ? 'fa-spinner fa-pulse' :
                                    'fa-check-circle'
                                }"></i>
                                ${mantenimiento.estado}
                            </div>
                        </div>

                        <div class="tarjeta-body">
                            <div class="tipo-intervencion">
                                <span class="tipo-badge ${mantenimiento.tipo.toLowerCase()}">
                                    <i class="fas ${mantenimiento.tipo === 'Correctivo' ? 'fa-bolt' : 'fa-shield-alt'}"></i>
                                    ${mantenimiento.tipo}
                                </span>
                            </div>
                            <div class="titulo-empresa">
                                <h3 class="titulo-intervencion">${mantenimiento.titulo}</h3>
                                <p class="nombre-empresa"><i class="fas fa-building"></i> ${mantenimiento.empresa}</p>
                            </div>
                            
                            <div class="descripcion-intervencion">
                                <h4 class="subtitulo"><i class="fas fa-align-left"></i> Descripción</h4>
                                <p>${mantenimiento.descripcion}</p>
                            </div>
                            
                            <div class="info-grid">
                                <div class="info-item">
                                    <i class="fas fa-calendar-check"></i>
                                    <div>
                                        <span class="info-label">Programada</span>
                                        <span class="info-value">${formatearFecha(mantenimiento.fechaProgramada)}</span>
                                    </div>
                                </div>
                                
                                <div class="info-item">
                                    <i class="fas fa-calendar-day"></i>
                                    <div>
                                        <span class="info-label">Realización</span>
                                        <span class="info-value">${formatearFecha(mantenimiento.fechaRealizacion)}</span>
                                    </div>
                                </div>
                                
                                <div class="info-item">
                                    <i class="fas fa-euro-sign"></i>
                                    <div>
                                        <span class="info-label">Coste</span>
                                        <span class="info-value precio">${mantenimiento.coste} €</span>
                                    </div>
                                </div>
                                
                                <div class="info-item">
                                    <i class="fas fa-file-invoice"></i>
                                    <div>
                                        <span class="info-label">Factura</span>
                                        ${factura}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    `;

                    function formatearFecha(fechaString) {
                        if(!fechaString || fechaString === '0000-00-00 00:00:00') {
                            return '<span class="fecha-no-asignada">No asignada</span>';
                        }
                        const opciones = { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        };
                        return new Date(fechaString).toLocaleDateString('es-ES', opciones);
                    }

            });  

            //Grafico Balance
            const labelsBal = ['Pendientes', 'En proceso', 'Completados'];
            const colorsBal = ['#F44336','#FF9800','#4CAF50'];

            const dataBal = {
                labels: labelsBal,
                datasets: [{
                    data: [pendientes, enProceso, completados],
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
                                font:{
                                    size:14,
                                    weight: 'bold'
                                }
                            }
                        }
                    }
                }
            };

            //Grafico actividad de propiedades
            
            const labels = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
            
            const dataMantenimientos = {
                labels: labels,
                datasets: [{
                    label: 'Número de Mantenimientos',
                    data: mantenimientosPorMes,
                    fill: false,
                    borderColor: '#4caf50',
                    tension:0.1
                    }]
                };
                
                const config = {
                    type: 'line',
                    data: dataMantenimientos,
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

            graficasContainer.innerHTML += `
                ${contenidoPropiedadTop}
                <div class="graphMantenimientos">
                    <canvas id="lineaMantenimientos"></canvas>
                </div>
                <div class="graphEstados">
                    <canvas id="donutEstados"></canvas>
                </div>
            `;

            const canvaEstados = document.querySelector('#donutEstados')
            new Chart(canvaEstados, configBal);//Crea grafico de balance

            let lineaMantenimientos = document.querySelector('#lineaMantenimientos');
            new Chart(lineaMantenimientos, config);//Crea grafico de reservas

            infoContainer.innerHTML = `
                <div class="calendarContainer">
                    <div id="calendar"></div>
                </div>
                <div class="tarjetasContainer">
                    ${tarjetasMantenimiento}
                </div>
            `;
            
        }else{
            
            graficasContainer.innerHTML = '';
            graficasContainer.innerHTML = `
            <div class="noData">
            <h3>No hay datos disponibles</h3>
            </div>
            `;

            mantenimientosCalendario = [];

            tarjetasMantenimiento = `
                <p style="width:100%;text-align:center">No hay mantenimientos disponibles todavía</p>
            `

            infoContainer.innerHTML = `
                <div class="calendarContainer">
                    <div id="calendar"></div>
                </div>
                ${tarjetasMantenimiento}
            `;

        }

        const calendarEl = document.getElementById('calendar');

        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            locale: 'esLocale',
            firstDay: 1,
            height: 'auto',
            contentHeight: 'auto',
            aspectRatio: 1.5,
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: mobileView() ? '' : 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            buttonText:{
                today: 'Hoy',
                month: 'Mes',
                week: 'Semana',
                day: 'Día',
                list: 'Agenda'
            },
            selectable: true,
            dayMaxEvents: true, // muestra un "+X más" si hay muchos eventos
            eventColor: '#333', // color por defecto

            events: mantenimientosCalendario,  
        });

        function mobileView() {
            return window.innerWidth < 768;
        }
        
        calendar.render();            
}

async function cargarTop(){
    const response = await fetch(`./../php/obtenerTopMantenimientos.php`)
        if (response.status === 401) { //Si el usuario no esta autenticado lo devuelve al index(login)
            window.location.href = '../index.html';
            return;
        }

        let propiedadTop = await response.json();
        
        if (propiedadTop.error) {
            
            let imagenDefault = '../uploads/imagenes/default.png';
            
            contenidoPropiedadTop = '';
            contenidoPropiedadTop = `
                <div class="propiedadTop">
                    <img src="${imagenDefault}" alt="imagen default" class="imagenTop">
                    <h2>No hay datos de este mes</h2>
                    <hr>
                    <p>-</p>
                    <h3>Top 1 Mantenimientos del Mes</h3>
                </div>
            ` 
        }else{
            let imagenes = propiedadTop.imagenes;
            imagenes = imagenes ? imagenes.split(',') : [];
    
            let imagenDefault = '../uploads/imagenes/default.png';
    
            if (imagenes.length == 0) {
                imagenes[0] = imagenDefault;
            }    
    
            contenidoPropiedadTop = `
                <div class="propiedadTop">
                    <img src="${imagenes[0]}" alt="imagen ${propiedadTop.nombre}" class="imagenTop">
                    <h2>${propiedadTop.nombre}</h2>
                    <hr>
                    <p>${propiedadTop.nMantenimientos}</p>
                    <h3>Top 1 Mantenimientos del Mes</h3>
                </div>
            `
        }
}

async function init() {
    await cargarTop();
    await cargarMantenimientos();
}

init();
