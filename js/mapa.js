//Verificacion de seguridad acceso
fetch('./../php/verificarSesion.php')
  .then(res => {
    if (res.status === 401) {
      window.location.href = '../index.html';
    }
  })
  .catch(err => {
    console.error('Error de sesión:', err);
    window.location.href = '../index.html';
  });

//Variables

    //Declaración del mapa y control de capas
    const map = L.map('map').setView([40.416925, -3.703507], 6);

    let normalView = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    let satelliteView = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Tiles © Esri &mdash; Source: Esri, USGS, NOAA'
    });

    // Capa de etiquetas (CartoDB Positron)
    let labelsView = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '© CartoDB'
    });

    let hybridView = L.layerGroup([
        satelliteView, // Imágenes satelitales
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19,
            attribution: 'Labels © Esri &mdash; Source: Esri, HERE, Garmin'
        })
    ]);

    let baseMaps = {
        "Vista Predeterminada": normalView,
        "Vista Satélite": hybridView,
        "Vista Urbana": labelsView,
    };
    
    //Icono propiedad
    var houseIcon = L.icon({
        iconUrl: '../src/casa (1).png',
        iconSize: [64, 64],       // Tamaño reducido
        iconAnchor: [32, 64],     // Mitad del ancho y base del ícono
        popupAnchor: [0, -64]     // Popup sobre el ícono
    });

    window.marcardores = new Map();
    
    
    //Obtencion de propiedades y creado automatico de tarjetas
    //Obtencion de datos BD
    fetch('./../php/obtenerPropiedades.php')
    .then(response => {
        if (response.status === 401) { //Si el usuario no esta autenticado lo devuelve al index(login)
            window.location.href = '../index.html';
            return;
        }
        return response.json();
    })    .then(data => {
        console.log(data);
        createCards(data);
    })
    .catch(error => console.error('Error al obtener las propiedades: ',error));
    
    //Funciones
    
    //Funciones Mapa
    L.control.layers(baseMaps).addTo(map);
    
    //Añade buscador
    L.Control.geocoder({
        defaultMarkGeocode: false,
        position: 'topleft',
        placeholder: 'Buscar un lugar...',
        collapsed: false,
        geocoder: L.Control.Geocoder.nominatim()
    })
    .on('markgeocode', function(e) {
        const bbox = e.geocode.bbox;
        const poly = L.polygon([
            bbox.getSouthEast(),
            bbox.getNorthEast(),
            bbox.getNorthWest(),
            bbox.getSouthWest()
        ]);
        map.fitBounds(poly.getBounds());
    })
    .addTo(map);
    
    //Evita un click sobre el mapa bajo el boton
    L.DomEvent.disableClickPropagation(document.querySelector('#new_propiedad'));
    L.DomEvent.disableClickPropagation(document.querySelector('#btn_lista'));
    
    //Marcadores del mapa
    function createCards(propiedades){
        
        console.log(propiedades);
        
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
            
            if (prop.latitud || prop.longitud != null) {
                let marcador = L.marker([`${prop.latitud}`, `${prop.longitud}`], { icon: houseIcon }).addTo(map).bindPopup(`<div class="tarjeta_propiedad"><img src="${imagenes[0]}" width="100%" alt="${prop.nombre}"><p class="contenido"><b>${prop.nombre}</b><br><b>${prop.precio}€/Mes</b><br><b class="status">${status}</b></p><div class="foot_tarjeta">
                    <a href="../html/propiedadDetails.html?id_propiedad=${prop.id}" class="btn_container">
                        <button class="btn_admin"><i class="fa-regular fa-pen-to-square"></i> Administrar</button>
                    </a>
                </div></div>`);            
                
                marcardores.set(prop.id,marcador)
            }else{
                console.error(`La propiedad ${prop.nombre} no tiene ubicacion definida`)
            }
        });
    }
    
    const popup = L.popup();
    
    // function onMapClick(e) {
    //     popup
    //     .setLatLng(e.latlng) // Configura la posición del popup
    //     // .setContent(`You clicked the map at ${e.latlng.toString()}`) // Configura el contenido
    //     .setContent(`¿Desea crear una propiedad aquí? ${e.latlng.toString()}`) // Configura el contenido
    //     .openOn(map); // Muestra el popup en el mapa
    // }
    
    // map.on('click', onMapClick);
    
    function adjustMapSize() {
        const currentCenter = map.getCenter();
        const currentZoom = map.getZoom();
        
        // Invalidar tamaño y restaurar vistas
        map.invalidateSize();
        map.setView(currentCenter, currentZoom, { animate: false });
    }
    
    // Exportar el mapa y la función (si estás usando módulos ES6)
    window.map = map; // Exponer el mapa a nivel global
    window.adjustMapSize = adjustMapSize; // Exponer la función de ajuste
    
    function getQueryParam(param){
        const urlParams = new URLSearchParams(window.location.search);
        console.log(param);
        
        return urlParams.get(param);
    }
    
    //Funcion para centrar la propiedad por su latitud y longitud
    function centrarPropiedad(propiedadId){
        let id = propiedadId || getQueryParam("id_propiedad");
        console.log(propiedadId);
        
        if (id) {
            fetch(`../php/vistaMapa.php?id_propiedad=${id}`)
            .then(response => {
                if (response.status === 401) { //Si el usuario no esta autenticado lo devuelve al index(login)
                    window.location.href = '../index.html';
                    return;
                }else if (response.status === 403){
                    window.location.href = '../html/vistaMapa.html';
                }
                return response.json();
            })            .then(data => {
                if (data.latitud && data.longitud) {
                    let marcador = marcardores.get(id);
                    console.log(data.longitud, data.latitud);
                    console.log(marcador);
                    
                    
                    map.setView([data.latitud, data.longitud], 17);
                    marcador.openPopup();
                } else {
                    console.error("Coordenadas no encontradas para la propiedad.");
                }
            })
            .catch(error => console.error("Error al obtener coordenadas:", error));
        }
    }
    
    //Asigna eventos a todos los botones "Ver en Mapa" y obtiene su data-id
    document.addEventListener("DOMContentLoaded", function(){
        centrarPropiedad(),
        
        document.addEventListener('click', function(event){
            if (event.target.classList.contains('btn_drch')) {
                event.preventDefault();
                const propiedadId = event.target.dataset.id;
                
                if (propiedadId) {
                    centrarPropiedad(propiedadId);
                }
            }
        })
    });