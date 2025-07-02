const graficasContainer = document.querySelector('#graficasContainer')
const infoContainer = document.querySelector('#infoContainer'); 

let eventosCalendario = [];
let contenidoPropiedadTop = '';
let cargardo = false;

function cargarTop(){
    fetch(`./../php/obtenerTopReservas.php`)
    .then(response => {
        if (response.status === 401) { //Si el usuario no esta autenticado lo devuelve al index(login)
            window.location.href = '../index.html';
            return;
        }
        return response.json();
    })
    .then(data => {
        let propiedadTop = data;
        if (propiedadTop.error) {
            console.log(propiedadTop);
            let imagenDefault = '../uploads/imagenes/default.png';
            
            const propiedadTopContainer = document.querySelector('#propiedadTop');

            propiedadTopContainer.innerHTML = '';
            propiedadTopContainer.innerHTML = `
                <img src="${imagenDefault}" alt="imagen default" class="imagenTop">
                <h2>No hay datos de este mes</h2>
                <hr>
                <h3>Top 1 Reservas del Mes</h3>
            ` 
        }else{
            let imagenes = propiedadTop.imagenes;
            imagenes = imagenes ? imagenes.split(',') : [];
    
            let imagenDefault = '../uploads/imagenes/default.png';
    
            if (imagenes.length == 0) {
                imagenes[0] = imagenDefault;
            }    
    
            const propiedadTopContainer = document.querySelector('#propiedadTop');
    
            propiedadTopContainer.innerHTML = '';
            propiedadTopContainer.innerHTML = `
                <img src="${imagenes[0]}" alt="imagen ${propiedadTop.nombre}" class="imagenTop">
                <h2>${propiedadTop.nombre}</h2>
                <hr>
                <p>${propiedadTop.nReservas}</p>
                <h3>Top 1 Reservas del Mes</h3>
            `
        }
    })
}

function cargarReservasPropiedades(){
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

        reservas = data;

        let cabeceraTabla = '';
        let datosReservas = '';
        let pieTabla = '';
            
            cabeceraTabla = `
                <div class="tablaReservas">
                                <table class="table table-striped table-bordered" id="tablaReservas">
                                    <thead class="cabeceraTabla">
                                    <tr>
                                        <th>Fecha Inicio</th>
                                        <th>Fecha Fin</th>
                                        <th>Propiedad</th>
                                        <th>Nombre Inq.</th>
                                        <th>Apellidos Inq.</th>
                                        <th>Teléfono Inq.</th>
                                        <th>Email</th>
                                        <th>Cobro</th>
                                        <th>Notas</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                `;        

                if (reservas.length > 0) {

                    eventosCalendario = reservas.map(reserva => {
                        return {
                            title: `${reserva.nombre} - ${reserva.nombreInquilino} ${reserva.apellidosInquilino}`,
                            start: reserva.fechaInicio,
                            end: reserva.fechaFin,
                            color: '#4CAF50',
                        };
                    });

                    console.log(reservas);
                    
                    reservas.forEach(reserva => {
                        console.log(reserva);
                        
                        datosReservas += `
                            <tr>
                                <td>${reserva.fechaInicio}</td>
                                <td>${reserva.fechaFin}</td>
                                <td>${reserva.nombre}</td>
                                <td>${reserva.nombreInquilino}</td>
                                <td>${reserva.apellidosInquilino}</td>
                                <td>${reserva.telefonoInquilino}</td>
                                <td>${reserva.emailInquilino}</td>
                                <td class="cobro">${reserva.cobro}€</td>
                                <td>${reserva.notas}</td>
                            </tr>
                        `
                    });                    
                }else{

                    eventosCalendario = [];

                    graficasContainer.innerHTML = '';
                    graficasContainer.innerHTML = `
                        <div class="noData">
                            <h3>No hay datos disponibles</h3>
                        </div>
                    `;
                }
                
                pieTabla = `
                                    </tbody>
                                </table>
                    </div>
                `;

                 $(document).ready(function() {
                    $('#tablaReservas').DataTable({
                        pageLength: 5,
                        lengthMenu: [5, 10, 20, 50],
                        language: {
                            url: "//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json",
                            emptyTable: "No hay movimientos todavía"
                        }
                    });
                });

                infoContainer.innerHTML = `
                        </div>
                        <div class="calendarContainer">
                            <div id="calendar"></div>
                        </div>
                        ${cabeceraTabla}
                        ${datosReservas}
                        ${pieTabla}
                `;

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
                    eventColor: '#4CAF50', // color por defecto
                    
                    events: eventosCalendario,  
                });
                
                function mobileView() {
                    return window.innerWidth < 768;
                }

                calendar.render();
    })
    .catch(error => console.error('Error al obtener las reservas: ',error));

    function mostrarPropiedades(propiedades){
        let disponibles = 0;
        let noDisponibles = 0;     

        if (propiedades.length >=1 && propiedades) {
            propiedades.forEach(prop => {
                let status;   
    
                if(prop.disponibilidad === 1){
                    status = `<i class="fa-solid fa-check" style="color: #4CAF50;"></i><span style="color:#4CAF50"> Disponible</span>`;
                    disponibles += 1;  
                }
                if(prop.disponibilidad === 0){
                    status = `<i class="fa-solid fa-x" style="color: #ff0000;"></i><span style="color:#ff0000"> No Disponible</span>`;
                    noDisponibles += 1;
                };
            });
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

    cargardo = true;
}

cargarReservasPropiedades();

if (cargardo) {
    cargarTop();
}