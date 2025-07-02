let mapContainer = document.querySelector('#map');
let btn_new_propiedad = document.querySelector('#new_propiedad');
let lista_propiedades = document.querySelector('#listaPropiedadesContainer');
let btn_lista = document.querySelector('#btn_lista');
let icono_btn_lista = document.querySelector('#icono');

let estado_lista = true;

//Funciones 

    //Obtencion de datos BD
    fetch('./../php/obtenerPropiedades.php')
    .then(response => {
        if (response.status === 401) { //Si el usuario no esta autenticado lo devuelve al index(login)
            window.location.href = '../index.html';
            return;
        }
        return response.json();
    })        .then(data => {
            // console.log(data);
            listPropiedades(data);
        })
        .catch(error => console.error('Error al obtener las propiedades: ',error));

    //Funciones Lista
        function hiddenList() {
            let contador = 0;
            
            lista_propiedades.style.left = '100%';
            mapContainer.style.width = '100%';

            if(contador < 1){
                setTimeout(() => {
                    if (window.adjustMapSize) {
                        window.adjustMapSize(); // Ajustar el mapa después de la transición
                    }
                }, 300);
                contador+=1;
            }

        }

        function showList() {
            lista_propiedades.style.left = '80%';
            mapContainer.style.width = '80%';
        }

        btn_lista.addEventListener('click', ()=>{
            
            if(estado_lista){
                hiddenList();
                estado_lista=false;
                icono_btn_lista.setAttribute('src','../src/left.png')
            }else{
                showList();
                estado_lista=true;
                icono_btn_lista.setAttribute('src','../src/right.png')
            }
            
        });

        function listPropiedades(propiedades){
            const contenedor = document.querySelector('.listaPropiedades');
            contenedor.innerHTML = '';

            propiedades.forEach(prop => {
                
                let status;
                let imagenes = prop.imagenes;
                imagenes = imagenes ? imagenes.split(',') : [];
    
                let imagenDefault = '../uploads/imagenes/default.png';
    
                if (imagenes.length == 0) {
                    imagenes[0] = [imagenDefault];
                }

                if(prop.disponibilidad === 1){
                    status = `<i class="fa-solid fa-check" style="color: #4CAF50;"></i><span style="color:#4CAF50"> Disponible</span>`;
                }
                if(prop.disponibilidad === 0){
                    status = `<i class="fa-solid fa-x" style="color: #ff0000;"></i><span style="color:#ff0000"> No Disponible</span>`;
                }             

                const li = document.createElement('li');
                li.classList.add('tarjeta_propiedad_aside');
                li.innerHTML = `
                    <img src="${imagenes[0]}" width="100%" alt="casa villanueva">
                    <p class="contenido">
                        <b>${prop.nombre}</b><br>
                        <b>${prop.precio}€/Mes</b><br>
                        <b class="status">${status}</b>
                    </p>
                    <div class="foot_tarjeta">
                        <a href="../html/propiedadDetails.html?id_propiedad=${prop.id}">
                            <button class="btn_izqd"><i class="fa-regular fa-pen-to-square"></i> Administrar</button>
                        </a>
                        <a href="../html/vistaMapa.html">
                            <button class="btn_drch" data-id="${prop.id}"><i class="fa-regular fa-map"></i> Ver en mapa</button>
                        </a>
                    </div>
                `;

                contenedor.appendChild(li);
            });
        }



