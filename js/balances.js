let graficasContainer = document.getElementById('graficasContainer');
let infoContainer = document.getElementById('infoContainer');

async function cargarMovimientos(){
    const response = await fetch(`./../php/obtenerAllMovimientos.php`)

        if (response.status === 401) { //Si el usuario no esta autenticado lo devuelve al index(login)
            window.location.href = '../index.html';
            return;
        }
        const movimientos = await response.json()
            console.log(movimientos);

            // const mesPalabra = new Date().toLocaleString('es-ES', { month: 'long' });
            const mes = new Date().getMonth();
            let ingresosPorMes = Array(12).fill(0);
            let gastosPorMes = Array(12).fill(0);
            let balancePorMes = Array(12).fill(0)

            let tipo = '';
            let cantidad = '';

            let datosMovimientos = '';

            if (movimientos.length > 0) {
                movimientos.forEach(movimiento => {

                    if (movimiento.tipo.toLowerCase() == "ingreso") {
                        tipo = 'bg-success';
                        cantidad = `<td class="cantidadIngreso">${movimiento.cantidad}€</td>`;
                        ingresosPorMes[mes] += Number(movimiento.cantidad);
                        balancePorMes[mes] = ingresosPorMes[mes] - gastosPorMes[mes];
                    }else{
                        tipo = 'bg-danger';
                        cantidad = `<td class="cantidadGasto">-${movimiento.cantidad}€</td>`;
                        gastosPorMes[mes] += Number(movimiento.cantidad);
                        balancePorMes[mes] = ingresosPorMes[mes] - gastosPorMes[mes];
                    }

                    datosMovimientos += `
                        <tr>
                            <td>${movimiento.fecha}</td>
                            <td>${movimiento.nombre} - ${movimiento.concepto}</td>
                            <td><span class="badge ${tipo}">${movimiento.tipo}</span></td>
                            <td>${movimiento.comentarios}</td>
                            <td ${cantidad}</td>
                        </tr>

                    `
                });
                
                graficasContainer.innerHTML = '';
                
                graficasContainer.innerHTML = `
                    <div class="graficoDonut">
                        <canvas id="donutBalance"></canvas>
                        <div class="infoBalance">
                            <div class="ingresos" id="ingresos">
                                <p>${ingresosPorMes[mes]}€</p>
                                <h2>Ingresos</h2>
                            </div>
                            <div class="gastos" id="gastos">
                                <p>${gastosPorMes[mes]}€</p>
                                <h2>Gastos</h2>
                            </div>
                        </div>
                    </div>
                    <div class="graficoBarras">
                        <canvas id="barrasVersus"></canvas>
                    </div>
                    <div class="propiedadTop" id="propiedadTop">
                    </div>
                `;

                //Grafico Balance
                let graficoBalance = document.querySelector('#donutBalance');
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
                                    font:{
                                        size:12,
                                    }
                                }
                            },
                            title: {
                                display: true,
                                position: 'bottom',
                                text: `Datos de este año`,
                                color: '#4CAF50',
                                font: {
                                    size: 13
                                }
                            }
                        }
                    }
                };
            

                //Grafico doble barras
                let barrasBalance = document.querySelector('#barrasVersus');
            
                
                const DATA_COUNT = 12;
                const NUMBER_CFG = {count: DATA_COUNT, min: 0, max: 1000};
            
                const labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                const dataBarras = {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Ingresos',
                            data: ingresosPorMes,
                            borderColor: 'rgba(75, 192, 192)',
                            backgroundColor: 'rgb(75, 192, 192, 0.5)',
                            borderWidth: 1
                        },
                        {
                            label: 'Gastos',
                            data: gastosPorMes,
                            borderColor: 'rgb(255, 99, 132)',
                            backgroundColor: 'rgba(255, 99, 132, 0.5)',
                            borderWidth: 1
                        }
                    ]
                };
                
                const configBarras = {
                    type: 'bar',
                    data: dataBarras,
                    options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                color:'#f5f5f5',
                                font:{
                                    size:12,
                                }
                            }
                        },
                        title: {
                            display: true,
                            position: 'bottom',
                            text: 'Balance Anual',
                            color: '#4CAF50',
                            font: {
                                size: 15
                            }
                        }
                    },
                    scales:{
                        x:{
                            ticks:{
                                color:'#f5f5f5',
                                font: {
                                    size: 15
                                }
                            }
                        },
                        y:{
                            ticks:{
                                color:'#f5f5f5'
                            }
                        },
                    }
                    },
                };

                new Chart(graficoBalance, configBal);//Crea grafico de balance
                new Chart(barrasBalance, configBarras);//Crea grafico de balance    
            }else{

                graficasContainer.innerHTML = `
                    <div class="noData">
                        <h3>No hay datos disponibles</h3>
                    </div>
                `;
            }

            

            let cabeceraTabla = `
                <table id="tablaMovimientos" class="tablaMovimientos table table-striped table-bordered">
                    <thead class="cabeceraTabla">
                    <tr>
                        <th>Fecha</th>
                        <th>Concepto</th>
                        <th>Tipo</th>
                        <th>Comentarios</th>
                        <th>Importe (€)</th>
                    </tr>
                    </thead>
                    <tbody>
            `;

            let pieTabla = `
                                </tbody>
                            </table>
                </div>
            `;
        
            infoContainer.innerHTML = '';

                infoContainer.innerHTML = `
                    <div class="datosPrincipales">
                        <div class="balance">
                            <h4>Balance</h4>
                            <p>${balancePorMes[mes].toFixed(2)}€</p>
                        </div>
                        <div class="ingresos">
                            <h4>Ingresos totales</h4>
                            <p>+${ingresosPorMes[mes].toFixed(2)}€</p>
                        </div>
                        <div class="gastos">
                            <h4>Gastos totales</h4>
                            <p>-${gastosPorMes[mes].toFixed(2)}€</p>
                        </div>
                    </div>
                    <div class="tablaContainer">
                    ${cabeceraTabla}
                    ${datosMovimientos}
                    ${pieTabla}
                    </div>
                `

                //DATATABLE
                     $(document).ready(function() {
                        $('#tablaMovimientos').DataTable({
                        destroy: true,
                        pageLength: 5,
                        lengthMenu: [5, 10, 20],
                        language: {
                            url: "//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json",
                            emptyTable: "No hay movimientos todavía"
                        },
                        // data: movimientos || [],
                        });
                    });
}

function cargarTop(){
    fetch(`./../php/obtenerTopBalances.php`)
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
            let imagenDefault = '../uploads/imagenes/default.png';
            
            const propiedadTopContainer = document.querySelector('#propiedadTop');

            propiedadTopContainer.innerHTML = '';
            propiedadTopContainer.innerHTML = `
                <img src="${imagenDefault}" alt="imagen default" class="imagenTop">
                <h2>No hay datos de este mes</h2>
                <hr>
                <h3>Top 1 Balances del Mes</h3>
            ` 
        }else{   
            let imagenes = propiedadTop.imagenes;
            imagenes = imagenes ? imagenes.split(',') : [];
        
            let imagenDefault = '../uploads/imagenes/default.png';
        
            if (imagenes.length == 0) {
                imagenes[0] = [imagenDefault];
            }    
        
            let balance = '';
            if (propiedadTop.balance >= 0) {
                balance = `<p class="balancePositivo">▲ ${propiedadTop.balance}€</p>`
            }else{
                if (propiedadTop.balance < 0) {
                balance = `<p class="balanceNegativo">▼ ${propiedadTop.balance}€</p>`
                }else{
                    balance = `<p class="balance">${propiedadTop.balance}€</p>`
                }
            }  
        
            const propiedadTopContainer = document.querySelector('#propiedadTop');
        
            propiedadTopContainer.innerHTML = '';
            propiedadTopContainer.innerHTML = `
                <img src="${imagenes[0]}" alt="imagen ${propiedadTop.nombre}" class="imagenTop">
                <h2>${propiedadTop.nombre}</h2>
                <hr>
                ${balance}
                <h3>Top 1 Balances del Mes</h3>
            `
        }
    })
};

async function init() {
    await cargarMovimientos();
    cargarTop();
}

init();
