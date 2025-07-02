//Verificacion de seguridad acceso
fetch('../php/verificarSesion.php')
  .then(res => {
    if (res.status === 401) {
      window.location.href = '../index.html';
    }
  })
  .catch(err => {
    console.error('Error de sesión:', err);
    window.location.href = '../index.html';
  });

  const btnEnviar = document.querySelector('#añadir');

  let latitud;
  let longitud;

  const inputImagenes = document.getElementById('imagenes');
  const preview = document.getElementById('preview');
  let archivosSeleccionados = [];
  
  inputImagenes.addEventListener('change', function () {
    const nuevosArchivos = Array.from(this.files);
  
    nuevosArchivos.forEach((archivo) => {
      archivosSeleccionados.push(archivo);
      const reader = new FileReader();
  
      reader.onload = function (e) {
        const index = archivosSeleccionados.length - 1;
        const div = document.createElement('div');
        div.classList.add('imgPreview');
        div.innerHTML = `
          <img src="${e.target.result}" width="100" style="margin: 5px;">
          <button type="button" data-index="${index}">
            <i class="fa-solid fa-circle-xmark" style="color: #ff0000;"></i>
          </button>
        `;
        preview.appendChild(div);
      };
  
      reader.readAsDataURL(archivo);
    });
  
    actualizarInput();
  });
  
  preview.addEventListener('click', function (e) {
    if (e.target.closest('button')) {
      const button = e.target.closest('button');
      const div = button.parentElement;
      const index = Array.from(preview.children).indexOf(div);
      archivosSeleccionados.splice(index, 1);
      div.remove();
      actualizarInput();
    }
  });
  
  function actualizarInput() {
    const dataTransfer = new DataTransfer();
    archivosSeleccionados.forEach(file => dataTransfer.items.add(file));
    inputImagenes.files = dataTransfer.files;
  }

  //Declaración del mapa y control de capas
  let map;

  const modalMapa = document.getElementById("mapaModal"); 

  modalMapa.addEventListener("shown.bs.modal", function () {
      setTimeout(() => {
          if (!map) {
              // Crear el mapa SOLO si no existe
              map = L.map("map").setView([40.416927, -3.703384], 5);
              
              let normalView = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(map);
        
            let satelliteView = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                maxZoom: 19,
                attribution: 'Tiles © Esri &mdash; Source: Esri, USGS, NOAA'
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
            };

            L.control.layers(baseMaps).addTo(map);

            //Icono propiedad
            let houseIcon = L.icon({
              iconUrl: '../src/casa (1).png',
              iconSize: [64, 64],
              iconAnchor: [32, 64],
              popupAnchor: [0, -64]
            });

            //Añade buscador
            L.Control.geocoder({
              defaultMarkGeocode: false,
              position: 'topleft',
              placeholder: 'Buscar dirección...',
              geocoder: L.Control.Geocoder.nominatim()
            })
              .on('markgeocode', function (e) {
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

            //Obtencion de propiedades y creado automatico de tarjetas
              //Obtencion de datos BD
              fetch('./../php/obtenerPropiedades.php')
              .then(response => {
                if (response.status === 401) { //Si el usuario no esta autenticado lo devuelve al index(login)
                    window.location.href = '../index.html';
                    return;
                }
                return response.json();
            })                .then(data => {
                  console.log(data);
                  createCards(data);
                })
                .catch(error => console.error('Error al obtener las propiedades: ', error));

            //Marcadores del mapa
              function createCards(propiedades) {

                propiedades.forEach(propiedad => {

                  let imagenURL = '';

                  if (propiedad.imagenes) {
                    if (propiedad.imagenes.includes(',')) {
                      const imagenesArray = propiedad.imagenes.split(',');
                      imagenURL = imagenesArray[0];
                    } else {
                      imagenURL = propiedad.imagenes;
                    }
                  } else {
                    imagenURL = '../uploads/imagenes/default.png';
                  }

                  let status;
                  if (propiedad.disponibilidad === 1) {
                    status = `<span style="color:#4CAF50"> Disponible<i class="fa-solid fa-check" style="color: #4CAF50;"></i></span>`;
                  }
                  if (propiedad.disponibilidad === 0) {
                    status = `<span style="color:red"> No Disponible<i class="fa-solid fa-x" style="color: #ff0000;"></i></span>`;
                  }

                  if (propiedad.latitud || propiedad.longitud != null) {
                    L.marker([`${propiedad.latitud}`, `${propiedad.longitud}`], { icon: houseIcon }).addTo(map).bindPopup(`<div class="tarjeta_propiedad"><img src="${imagenURL}" width="100%" alt="${propiedad.nombre}"><p class="contenido"><b>${propiedad.nombre}</b><br><b>${propiedad.precio}€/Mes</b><br><b class="status">${status}</b></p></div>`);
                  } else {
                    console.error(`La propiedad ${propiedad.nombre} no tiene ubicacion definida`)
                  }
                });
              }

            const popup = L.popup();

            function onMapClick(e) {
              popup
                .setLatLng(e.latlng)
                .setContent(`Ubicacion Guardada ✅`)
                .openOn(map);

                latitud = e.latlng.lat;
                longitud = e.latlng.lng;

                setTimeout(() => {
                  const modal = bootstrap.Modal.getInstance(modalMapa);
                  modal.hide();            
                }, 250);
            }

            map.on('click', onMapClick);
            
          } else {
              map.invalidateSize();
          }
      }, 200);
  });

  btnEnviar.addEventListener('click', function(e) {
    e.preventDefault();
    const form = document.querySelector('#propiedadForm');

    // Asegura que las coordenadas estén seteadas
    document.querySelector('#latitud').value = latitud;
    document.querySelector('#longitud').value = longitud;

    const camposObligatorios = ['nombre', 'tipo', 'precio', 'frecuencia', 'disponibilidad', 'direccion', 'ciudad', 'codigo_postal', 'latitud', 'longitud', 'tamaño', 'año_construccion'];

    for (let campo of camposObligatorios) {
      const valor = form.elements[campo]?.value?.trim();
      if (!valor) {
        if (campo === 'latitud' || 'longitud') {
          alert(`Por favor seleccione un ubicación`);
        }else{

          alert(`Por favor complete el campo: ${campo}`);
        }
        return;
      }
    }

    const archivos = inputImagenes.files;
    for (let i = 0; i < archivos.length; i++) {
        const archivo = archivos[i];
        if (!archivo.type.startsWith('image/')) {
            alert('Solo se permiten archivos de imagen.');
            return;
        }
    }

    form.submit();
});

  