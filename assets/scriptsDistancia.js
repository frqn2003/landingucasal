/* --------------------- Variables globales ----------------------------- */
let contenedorCarreras, contenedorFiltros, entradaBusqueda, contenedorFiltrosArea;

const esMobile = window.innerWidth <= 1280;

let textoBusqueda = "";
let filtroActivo = null;
let filtrosActivos = [];
let filtrosAreaActivos = [];

// Inicializar elementos del DOM de forma segura
function inicializarElementosDOM() {
  contenedorCarreras = document.getElementById("listaCarreras");
  contenedorFiltros = document.getElementById("filtros");
  entradaBusqueda = document.getElementById("search-bar");
  contenedorFiltrosArea = document.getElementById("filtros-categoria");
}

/* --------------------- Inicialización principal ----------------------------- */
document.addEventListener('DOMContentLoaded', function () {
  // 0. Inicializar elementos del DOM primero
  inicializarElementosDOM();

  // 1. Cargar datos de landing (promociones, tarjetas)
  initLandingData();

  // 2. Cargar datos de carreras y modalidades
  initCarrerasData();

  // 3. Inicializar carruseles
  initCarousels();

  // 4. Inicializar formulario
  initFormulario();

  // 5. Inicializar componente potencia
  initPotencia();
});

/* --------------------- Datos de landing ----------------------------- */
function initLandingData() {
  fetch('assets/datosLanding.json')
    .then(response => {
      if (!response.ok) throw new Error('No se pudo cargar el JSON');
      return response.json();
    })
    .then(json => {
      const elementoPromocion = document.getElementById('promo');
      const datosTarjeta = json.tarjeta;

      function generarTarjetas() {
        const tarjetasActivas = datosTarjeta
          .filter(tarjeta => tarjeta.activa === true)
          .sort((a, b) => a.orden - b.orden)

        const contenedorTarjetas = document.getElementById('aranceles')

        if (contenedorTarjetas) {
          contenedorTarjetas.innerHTML = ''

          tarjetasActivas.forEach(tarjeta => {
            const divTarjeta = document.createElement('div')
            divTarjeta.id = `tarjeta${tarjeta.id.charAt(0).toUpperCase() + tarjeta.id.slice(1)}`;
            divTarjeta.innerHTML = `
            <div class="flex flex-col items-center justify-center gap-3 mb-5 text-center">
              <img class="md:w-1/4 w-1/2 p-4 bg-white rounded-2xl" src="${tarjeta.imagen}" alt="${tarjeta.nombre}">
              <p class="md:text-base text-xs">${tarjeta.descripcion}</p>
            </div> `
            contenedorTarjetas.appendChild(divTarjeta)
          })
        }
      }

      generarTarjetas();

      let index = 0;

      function obtenerPromocionActiva() {
        const fechaActual = new Date();
        const promocionActiva = json.promociones_dinamicas.find(promocion => {
          const fechaInicio = new Date(promocion.fecha_inicio);
          const fechaFin = new Date(promocion.fecha_fin);
          return fechaActual >= fechaInicio && fechaActual <= fechaFin;
        });
        return promocionActiva ? promocionActiva.mensajes : json.promocion_fallback;
      }

      const promociones = obtenerPromocionActiva();
      elementoPromocion.innerHTML = promociones[index];

      function cambiarTexto() {
        index = (index + 1) % promociones.length;
        elementoPromocion.innerHTML = promociones[index];
      }

      setInterval(cambiarTexto, 2500);
    })
    .catch(error => {
      console.error('Error al cargar las promociones:', error);
      const elementoPromocion = document.getElementById('promo');
      if (elementoPromocion) {
        elementoPromocion.innerHTML = "&#127942;Construí<span class='text-sm font-extrabold lg:text-lg'>&nbsp;<strong>tu historia</strong></span>";
      }
    });
}

/* --------------------- Datos de carreras y modalidades ----------------------------- */
// Optimizaciones de caché y rendimiento
const GestorDeCarreras = {
  datos: null,
  carrerasFiltradas: [],
  cacheDeRenderizado: new Map(),
  
  // Función debounce para búsqueda (evita ejecuciones excesivas)
  debounce(funcion, espera) {
    let temporizador;
    return function funcionEjecutada(...argumentos) {
      const despues = () => {
        clearTimeout(temporizador);
        funcion(...argumentos);
      };
      clearTimeout(temporizador);
      temporizador = setTimeout(despues, espera);
    };
  },

  // Alternar estilo de botón optimizado sin forzar reflow
  alternarEstiloBoton(boton, estaActivo) {
    // Usar clases CSS para mejor rendimiento
    boton.className = boton.className
      .replace(/bg-(white|\[#D6001C\])|text-(white|gray-700)/g, '')
      .trim();
    
    const clasesBase = boton.className;
    boton.className = estaActivo 
      ? `${clasesBase} bg-[#D6001C] text-white`
      : `${clasesBase} bg-white`;
  },

  // Normalización de texto eficiente con memoización
  cacheNormalizacionTexto: new Map(),
  normalizarTexto(texto) {
    if (this.cacheNormalizacionTexto.has(texto)) {
      return this.cacheNormalizacionTexto.get(texto);
    }
    
    const normalizado = texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    this.cacheNormalizacionTexto.set(texto, normalizado);
    return normalizado;
  }
};

function initCarrerasData() {
  fetch('assets/datosCarreras.json')
    .then((response) => response.json())
    .then((json) => {
      let careers = json.careers;
      careers = careers.filter(carreras => carreras.modalidad.includes(7));

      let filtros = json.filtros
      filtros = filtros.filter(filtro => filtro.id != "1");

      let filtrosArea = json.filtrosArea
      filtrosArea = filtrosArea.filter(filtro => filtro != "Ciencias Agrarias y Veterinarias" && filtro != "Artes" && filtro != "Idiomas");

      let modalidades = json.modalidades
      modalidades = modalidades.filter(modalidad => modalidad.id === 7);
      const carrerasElegidas = careers
        .filter(carrera => carrera.modalidad.includes(7))
        .sort((a, b) => b.estudiantes - a.estudiantes)
        .slice(0, 4);
      // Función helper para manejar estilos de botones
      function toggleButtonStyle(button, isActive) {
        button.classList.remove("bg-white", "bg-[#D6001C]", "text-white", "text-gray-700");
        button.offsetHeight;

        if (isActive) {
          button.classList.add("bg-[#D6001C]", "text-white");
        } else {
          button.classList.add("bg-white");
        }

        requestAnimationFrame(() => {
          button.offsetHeight;
        });
      }

      function filtrosRender() {
        contenedorFiltros.innerHTML = filtros.map(filter => `
          <button class="cursor-pointer flex items-center space-x-2 px-4 py-2 rounded-[8px] bg-white border-2 border-gray-200 md:hover:bg-[#D6001C] md:hover:text-white md:text-base text-xs transition-colors" id="boton-filtro"
            data-filter="${filter.id}">
            <span>${filter.nombre}</span>
          </button>
        `).join('');

        contenedorFiltrosArea.innerHTML = filtrosArea.map(filter => `
          <button class="cursor-pointer flex items-center space-x-2 px-2 md:px-4 py-2 rounded-[8px] bg-white border-2 border-gray-200 md:hover:bg-[#D6001C] md:hover:text-white md:text-base text-xs transition-colors w-full" id="filtro-area-btn"
            data-filter="${filter}">
            <span>${filter.charAt(0).toUpperCase() + filter.slice(1)}</span>
          </button>
        `).join('');

        // Event listeners para filtros principales
        const botones = contenedorFiltros.querySelectorAll("#boton-filtro");
        botones.forEach(button => {
          button.addEventListener("click", (e) => {
            e.preventDefault();
            handleFilterClick(e.currentTarget.dataset.filter, e.currentTarget, 'main');
          });
        });

        // Event listeners para filtros de área
        const botonesArea = contenedorFiltrosArea.querySelectorAll("#filtro-area-btn");
        botonesArea.forEach(button => {
          button.addEventListener("click", (e) => {
            e.preventDefault();
            handleFilterClick(e.currentTarget.dataset.filter, e.currentTarget, 'area');
          });
        });

        setupFiltersDropdown();
        setTimeout(() => {
          updateAllFilterStates();
        }, 10);
      }

      function handleFilterClick(filterId, buttonElement, filterType) {
        if (filterType === 'main') {
          if (filtrosActivos.includes(filterId)) {
            filtrosActivos = filtrosActivos.filter(filtro => filtro !== filterId);
          } else {
            filtrosActivos.push(filterId);
          }
        } else if (filterType === 'area') {
          if (filtrosAreaActivos.includes(filterId)) {
            filtrosAreaActivos = filtrosAreaActivos.filter(filtro => filtro !== filterId);
          } else {
            filtrosAreaActivos.push(filterId);
          }
        }

        updateAllFilterStates();
        updateActiveFiltersCount();
        renderCarreras();
      }

      function updateAllFilterStates() {
        const botonesDesktop = contenedorFiltros.querySelectorAll("#boton-filtro");
        botonesDesktop.forEach(btn => {
          const isActive = filtrosActivos.includes(btn.dataset.filter);
          GestorDeCarreras.alternarEstiloBoton(btn, isActive);
        });

        const botonesAreaDesktop = contenedorFiltrosArea.querySelectorAll("#filtro-area-btn");
        botonesAreaDesktop.forEach(btn => {
          const isActive = filtrosAreaActivos.includes(btn.dataset.filter);
          GestorDeCarreras.alternarEstiloBoton(btn, isActive);
        });
      }

      function setupFiltersDropdown() {
        const FiltersBtn = document.getElementById("filters-btn");
        const FiltersDropdown = document.getElementById("filters-dropdown");
        const FiltersArrow = document.getElementById("filters-arrow");
        const clearAllBtn = document.getElementById("clear-all-filters");
        const aplicarFiltros = document.getElementById("aplicar-filtros")

        if (!FiltersBtn || !FiltersDropdown) return;

        FiltersBtn.addEventListener("click", () => {
          const isHidden = FiltersDropdown.classList.contains("hidden");

          if (isHidden) {
            FiltersDropdown.classList.remove("hidden");
            FiltersArrow.style.transform = "rotate(180deg)";
          } else {
            FiltersDropdown.classList.add("hidden");
            FiltersArrow.style.transform = "rotate(0deg)";
          }
        });

        aplicarFiltros.addEventListener("click", () => {
          const isHidden = FiltersDropdown.classList.contains("hidden");
          if (!isHidden) {
            FiltersDropdown.classList.add("hidden")
            FiltersArrow.style.transform = "rotate(0deg)";
          }
        })

        clearAllBtn?.addEventListener("click", () => {
          filtrosActivos = [];
          filtrosAreaActivos = [];
          updateAllFilterStates();
          updateActiveFiltersCount();
          renderCarreras();
        });

        document.addEventListener("click", (e) => {
          if (!FiltersBtn.contains(e.target) && !FiltersDropdown.contains(e.target)) {
            FiltersDropdown.classList.add("hidden");
            FiltersArrow.style.transform = "rotate(0deg)";
          }
        });
      }

      function updateActiveFiltersCount() {
        const activeCount = filtrosActivos.length + filtrosAreaActivos.length;
        const countElement = document.getElementById("active-filters-count");

        if (countElement) {
          if (activeCount > 0) {
            countElement.textContent = activeCount;
            countElement.classList.remove("hidden");
          } else {
            countElement.classList.add("hidden");
          }
        }
      }

      function renderCarreras() {
        let carrerasFiltradas = [...careers];

        function normalizeText(text) {
          return GestorDeCarreras.normalizarTexto(text);
        }

        if (textoBusqueda.trim() !== "") {
          const textoNormalizado = normalizeText(textoBusqueda);
          carrerasFiltradas = carrerasFiltradas.filter(career => {
            const nombreNormalizado = normalizeText(career.nombre);
            const descripcionNormalizada = normalizeText(career.descripcion);

            return nombreNormalizado.includes(textoNormalizado) ||
              descripcionNormalizada.includes(textoNormalizado);
          });
        }

        if (filtrosActivos.length > 0) {
          carrerasFiltradas = carrerasFiltradas.filter(career => {
            return filtrosActivos.every(filtroId => {
              const filtro = filtros.find(f => f.id === filtroId);
              if (!filtro) return false;

              switch (filtro.filterType) {
                case 'popular':
                  return career.popular === true;
                case 'destacada':
                  return career.destacada === true;
                case 'modalidad':
                  return career.modalidad.includes(filtro.value);
                /* case 'duracion':
                  const durationMatch = career.duracion.match(/(\d+)/);
                  const careerYears = durationMatch ? parseInt(durationMatch[1]) : 0;
                  return careerYears <= filtro.maxYears; */
                default:
                  return false;
              }
            });
          });
        }

        if (filtrosAreaActivos.length > 0) {
          carrerasFiltradas = carrerasFiltradas.filter(career => {
            return filtrosAreaActivos.some(areaId => {
              const categoryNormalized = normalizeText(career.categoria);
              const areaIdNormalized = normalizeText(areaId);
              return categoryNormalized.includes(areaIdNormalized) ||
                areaIdNormalized.includes(categoryNormalized);
            });
          });
        }

        function obtenerNombreModalidad(modalidades) {
          if (modalidades.includes(7)) return 'Online'
        }

        if (carrerasFiltradas.length === 0) {
          contenedorCarreras.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center py-12 px-6 text-center">
              <div class="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
                <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <h3 class="text-lg font-semibold text-gray-800 mb-2">
                  No se encontraron carreras
                </h3>
                <p class="text-gray-600 mb-4">
                  ${textoBusqueda.trim() !== ""
              ? `No hay carreras que coincidan con "${textoBusqueda}" y los filtros seleccionados.`
              : "No hay carreras que coincidan con los filtros seleccionados."
            }
                </p>
                <div class="space-y-2">
                  <p class="text-sm text-gray-500">Intentá:</p>
                  <ul class="text-sm text-gray-500 space-y-1">
                    ${textoBusqueda.trim() !== "" ? '<li>• Revisar la ortografía de tu búsqueda</li>' : ''}
                    <li>• Usar términos más generales</li>
                    <li>• Quitar algunos filtros</li>
                    <li>• Explorar otras áreas de estudio</li>
                  </ul>
                </div>
                <button 
                  onclick="limpiarFiltrosYBusqueda()" 
                  class="mt-4 bg-[#D6001C] text-white px-4 py-2 rounded-lg hover:bg-[#B8001A] transition-colors text-sm font-medium"
                >
                  Limpiar filtros y búsqueda
                </button>
              </div>
            </div>
          `;
        } else {
          contenedorCarreras.innerHTML = carrerasFiltradas.map(career => {
            career.popular = career.estudiantes >= 1000 ? true : false;
            return `
            <div class="border border-gray-500 shadow-md p-3 sm:p-4 space-y-3 sm:space-y-2 h-max">
              <div class="grid grid-cols-2 space-y-2 sm:space-y-0">
                <div class="flex justify-start">
                  <img src="${career.imagen}" alt="${career.nombre}" class="object-contain w-12 h-12 sm:w-16 sm:h-16">
                </div>
                <div class="flex justify-end items-center space-x-2">
                  ${career.popular ? '<img src="./public/areas/populares.svg" alt="Carrera destacada" class="w-5 h-5 sm:w-6 sm:h-6">' : ''}
                  ${career.destacada ? '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" /></svg>' : ''}
                </div>
              </div>
              <h3 class="font-bold text-left text-base sm:text-lg">${career.nombre}</h3>
              <div class="flex flex-col space-y-2 sm:grid sm:grid-rows-2 sm:gap-2 sm:space-y-0">
                <div class="flex items-center justify-start">
                  <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                  <span class="text-xs sm:text-sm font-semibold px-1">${career.duracion}</span>
                </div>
                <div class="flex items-center justify-start">
                  <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                  <span class="text-xs sm:text-sm font-semibold px-1">${obtenerNombreModalidad(career.modalidad)}</span>
                </div>
              </div>
              <p class="text-gray-600 text-xs sm:text-sm text-left leading-relaxed">${career.descripcion}</p>
              <div class="flex flex-col space-y-3 sm:grid sm:grid-rows-2 sm:space-y-0">
                <div class="flex justify-center sm:justify-start">
                  <span class="text-xs font-medium text-gray-700 bg-gray-200 h-fit py-1 px-2 rounded-sm">${career.categoria}</span>
                </div>
                <a href="#formu" class="boton-cta text-center max-md:text-sm justify-center inline-flex items-center w-full sm:w-auto mt-2 sm:mt-0">
                  Más info
                </a>
              </div>
            </div>
          `}).join('');
        }
      }

      // Función global para limpiar filtros
      window.limpiarFiltrosYBusqueda = function () {
        textoBusqueda = "";
        if (entradaBusqueda) {
          entradaBusqueda.value = "";
        }
        filtrosActivos = [];
        filtrosAreaActivos = [];
        updateAllFilterStates();
        updateActiveFiltersCount();
        renderCarreras();
      }

      // Event listener para búsqueda
      if (entradaBusqueda) {
        entradaBusqueda.addEventListener("input", (e) => {
          textoBusqueda = e.target.value;
          renderCarreras();
        });
      }

      // Inicializar filtros y carreras
      filtrosRender();
      renderCarreras();

      /* --------------------- Modalidades ----------------------------- */
      function renderModalidades() {
        const container = document.getElementById("modalidades");
        if (!container || !modalidades) return;

        container.innerHTML = modalidades.map(modalidad => `
          <div class="bg-white/80 backdrop-blur-lg rounded-lg border border-gray-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full flex flex-col max-md:h-fit md:w-[50%]">
            <div class="p-4 md:p-5 flex-1 flex flex-col">
              <div class="flex flex-col md:flex-row md:items-start gap-3">
                <div class="flex justify-center md:justify-start">
                  <img src="${modalidad.imagen}" alt="${modalidad.nombre}"
                    class="w-16 h-16 md:w-20 md:h-20 object-contain rounded-full">
                </div>
                <div class="flex-1 text-left">
                  <h3 class="md:text-2xl font-bold text-gray-800 mb-2">
                    ${modalidad.nombre}
                  </h3>
                  <p class="text-xs md:text-base text-gray-600 leading-relaxed">
                    ${modalidad.descripcion}
                  </p>
                </div>
              </div>
              <div class="mt-2 md:mt-4 flex-1 flex flex-col md:justify-end">
                <div class="flex items-center justify-between md:justify-start mobile-expand-trigger md:cursor-default"
                  onclick="toggleCharacteristics(${modalidad.id})">
                  <h3 class="font-semibold text-gray-700">
                    Características
                  </h3>
                  <button class="xl:hidden text-[#D6001C] p-1 transform transition rotate-180" id="expand-btn-${modalidad.id}">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                </div>
                <div class="transition-all transform md:expanded ease-in-out duration-300 collapsed mt-3" id="characteristics-${modalidad.id}">
                  <ul class="space-y-1 pl-4 md:pl-6">
                    ${modalidad.caracteristicas.map(caracteristica => `
                    <li class="list-disc">
                      <span class="text-xs md:text-base text-gray-600">
                        ${caracteristica}
                      </span>
                    </li>
                    `).join('')}
                  </ul>
                  <div class="pt-3 md:pt-4">
                    <button class="boton-cta flex justify-center items-center" data-filter="${modalidad.id}" id="boton-modalidad">
                      <svg class="md:w-5 md:h-5 w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                      </svg>
                      <span class="text-xs md:text-base">
                        Buscar carreras ${modalidad.nombre.toLowerCase()}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>`).join('');

        // Event listeners para botones de modalidades
        const botonesModalidad = container.querySelectorAll("#boton-modalidad");
        botonesModalidad.forEach(button => {
          button.addEventListener('click', function (e) {
            const modalidadFilter = e.currentTarget.dataset.filter;
            filtrosActivos = [];
            filtrosActivos.push(modalidadFilter);

            const botonesFiltros = contenedorFiltros.querySelectorAll("#boton-filtro");
            botonesFiltros.forEach(btn => {
              btn.classList.remove("bg-[#D6001C]", "text-white");
              btn.classList.add("bg-white");
            });

            const botonesFiltrosArea = contenedorFiltrosArea.querySelectorAll("#boton-filtro");
            botonesFiltrosArea.forEach(btn => {
              btn.classList.remove("bg-[#D6001C]", "text-white");
              btn.classList.add("bg-white");
            });

            filtrosActivos.forEach(filtroId => {
              const activeBtn = contenedorFiltros.querySelector(`[data-filter="${filtroId}"]`);
              const activeBtnArea = contenedorFiltrosArea.querySelector(`[data-filter="${filtroId}"]`);

              if (activeBtn) {
                activeBtn.classList.remove("bg-white");
                activeBtn.classList.add("bg-[#D6001C]", "text-white");
              }

              if (activeBtnArea) {
                activeBtnArea.classList.remove("bg-white");
                activeBtnArea.classList.add("bg-[#D6001C]", "text-white");
              }
            });

            renderCarreras();
            window.location.href = '#carreras';
          });
        });
      }

      // Función para toggle de características en mobile
      window.toggleCharacteristics = function (modalidadId) {
        if (!esMobile) return;

        const content = document.getElementById(`characteristics-${modalidadId}`);
        const button = document.getElementById(`expand-btn-${modalidadId}`);

        if (!content || !button) return;

        const isCollapsed = content.classList.contains('collapsed');

        if (isCollapsed) {
          content.classList.remove('collapsed');
          content.classList.add('max-h-[500px]', 'opacity-100');
          button.classList.add('rotate-none');
        } else {
          content.classList.remove('max-h-[500px]', 'opacity-100');
          content.classList.add('collapsed');
          button.classList.remove('rotate-none');
        }
      }
      // Función para manejar el resize de ventana
      function handleModalidadesResize() {
        if (!modalidades) return;

        modalidades.forEach(modalidad => {
          const content = document.getElementById(`characteristics-${modalidad.id}`);
          const button = document.getElementById(`expand-btn-${modalidad.id}`);

          if (!content || !button) return;

          if (!esMobile) {
            content.classList.remove('collapsed');
            content.classList.add('max-h-[500px]', 'opacity-100');
          } else {
            if (!content.classList.contains('max-h-[500px]', 'opacity-100')) {
              content.classList.add('collapsed');
              content.classList.remove('max-h-[500px]', 'opacity-100');
            }
          }
        });
      }
      window.addEventListener('resize', handleModalidadesResize);
      /* --------------------- Carreras Más Elegidas ----------------------------- */
      function renderCarrerasElegidas() {
        const container = document.getElementById("carrerasElegidas");
        if (container) {
          carrerasElegidas.forEach((career) => {
            career.modalidad.includes(7) ? career.nombre = career.nombre + " " + "(Online)" : career.nombre
            const card = document.createElement("div");
            card.className = "bg-black/5 rounded-lg p-3";

            card.innerHTML = `
        <div class="flex items-center space-x-3">
          <div>
            <div class="text-black font-medium text-sm">${career.nombre}</div>
            <div class="text-black text-xs">+${career.estudiantes} estudiantes</div>
          </div>
        </div>
      `;
            container.appendChild(card);
          });
        }
      }
      // Renderizar modalidades
      renderModalidades();
      handleModalidadesResize();
      renderCarrerasElegidas()
    })
    .catch(error => {
      console.error('Error al cargar datos de carreras:', error);
    });
}

/* --------------------- Carruseles ----------------------------- */
class GenericCarousel {
  constructor({ items, selectors, autoPlayDelay = 3000 }) {
    this.items = items;
    this.selectors = selectors;
    this.currentIndex = 0;
    this.autoPlayInterval = null;
    this.isTransitioning = false;
    this.autoPlayDelay = autoPlayDelay;

    this.init();
  }

  init() {
    this.cacheElements();
    this.createDots();
    this.bindEvents();
    this.renderItem();
    this.startAutoPlay();
  }

  cacheElements() {
    this.elements = {
      container: document.querySelector(this.selectors.container),
      imagen: document.querySelector(this.selectors.imagen),
      text: document.querySelector(this.selectors.text),
      titulo: document.querySelector(this.selectors.titulo),
      subtitulo: document.querySelector(this.selectors.subtitulo),
      dots: document.querySelector(this.selectors.dots),
      prevBtn: document.querySelector(this.selectors.prevBtn),
      nextBtn: document.querySelector(this.selectors.nextBtn),
    };
  }

  createDots() {
    if (!this.elements.dots) return;
    this.elements.dots.innerHTML = '';
    this.items.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = `w-2 h-2 rounded-full transition-all duration-200 cursor-pointer ${index === this.currentIndex ? 'bg-[#D6001C]' : 'bg-gray-800'}`;
      dot.setAttribute('aria-label', `Ir al elemento ${index + 1}`);
      dot.addEventListener('click', () => this.goToItem(index));
      this.elements.dots.appendChild(dot);
    });
  }

  bindEvents() {
    this.elements.prevBtn?.addEventListener('click', () => this.previousItem());
    this.elements.nextBtn?.addEventListener('click', () => this.nextItem());

    this.elements.container?.addEventListener('mouseenter', () => this.stopAutoPlay());
    this.elements.container?.addEventListener('mouseleave', () => this.startAutoPlay());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.previousItem();
      if (e.key === 'ArrowRight') this.nextItem();
    });
  }

  async renderItem() {
    if (this.isTransitioning) return;

    this.isTransitioning = true;
    const item = this.items[this.currentIndex];

    try {
      this.elements.container.style.opacity = '0';
      await this.wait(100);

      // Manejo mejorado de imágenes y SVG
      if (this.elements.imagen && (item.imagen || item.icono)) {
        if (item.icono) {
          // Si es código SVG (icono), reemplazar el contenido del contenedor de imagen
          if (this.elements.imagen.tagName === 'IMG') {
            // Si el elemento es una img, crear un div contenedor
            const svgContainer = document.createElement('div');
            svgContainer.innerHTML = item.icono;
            svgContainer.className = this.elements.imagen.className;
            this.elements.imagen.parentNode.replaceChild(svgContainer, this.elements.imagen);
            this.elements.imagen = svgContainer;
          } else {
            // Si ya es un contenedor, simplemente actualizar el contenido
            this.elements.imagen.innerHTML = item.icono;
          }

          // Aplicar descripcion como título si existe
          if (item.descripcion) {
            const svgElement = this.elements.imagen.querySelector('svg');
            if (svgElement) {
              svgElement.setAttribute('title', item.descripcion);
              svgElement.setAttribute('aria-label', item.nombre || item.descripcion);
            }
          }
        } else if (item.imagen) {
          // Si es una imagen normal
          if (this.elements.imagen.tagName !== 'IMG') {
            // Si el elemento actual es un contenedor SVG, crear un img
            const imgElement = document.createElement('img');
            imgElement.className = this.elements.imagen.className;
            imgElement.src = item.imagen;
            imgElement.alt = item.descripcion || item.nombre || '';
            this.elements.imagen.parentNode.replaceChild(imgElement, this.elements.imagen);
            this.elements.imagen = imgElement;
          } else {
            // Si ya es una img, simplemente actualizar src y alt
            this.elements.imagen.src = item.imagen;
            this.elements.imagen.alt = item.descripcion || item.nombre || '';
          }
        }
      }

      if (this.elements.text) this.elements.text.textContent = item.descripcion || item.text || '';
      if (this.elements.titulo) this.elements.titulo.textContent = item.nombre || item.titulo || '';
      if (this.elements.subtitulo) this.elements.subtitulo.textContent = item.subtitulo || '';

      this.updateDots();

      this.elements.container.style.opacity = '1';
      await this.wait(100);

    } catch (error) {
      console.error('Error rendering item:', error);
      this.elements.container.style.opacity = '1';
    } finally {
      this.isTransitioning = false;
    }
  }

  updateDots() {
    if (!this.elements.dots) return;
    const dots = this.elements.dots.children;
    Array.from(dots).forEach((dot, index) => {
      dot.className = `w-2 h-2 rounded-full transition-all duration-200 cursor-pointer ${index === this.currentIndex ? 'bg-[#D6001C]' : 'bg-gray-500'}`;
    });
  }

  goToItem(index) {
    if (index === this.currentIndex || this.isTransitioning) return;
    this.currentIndex = index;
    this.renderItem();
    this.restartAutoPlay();
  }

  nextItem() {
    this.currentIndex = (this.currentIndex + 1) % this.items.length;
    this.renderItem();
    this.restartAutoPlay();
  }

  previousItem() {
    this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
    this.renderItem();
    this.restartAutoPlay();
  }

  startAutoPlay() {
    // Si autoPlayDelay es 0, null, undefined o false, no iniciar autoplay
    if (!this.autoPlayDelay || this.autoPlayDelay <= 0) {
      return;
    }

    this.stopAutoPlay();
    this.autoPlayInterval = setInterval(() => this.nextItem(), this.autoPlayDelay);
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  restartAutoPlay() {
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

function initCarousels() {
  const testimonios = [
    {
      nombre: "Benjamin Elizalde",
      subtitulo: "Licenciatura en comercialización",
      descripcion: '"La facultad esta siempre a disposición"',
      imagen: "./public/testimonios/benja.webp",
    },
    {
      nombre: "Ebaneo Valdez Kao",
      subtitulo: "Ingeniería en Informática",
      descripcion: '"Puedo ejercer mi profesión desde cualquier parte del del mundo"',
      imagen: "./public/testimonios/kao.webp",
    },
    {
      nombre: "Luciana Gennari",
      subtitulo: "Kinesiologia",
      descripcion: '"Para poder rendir bien academicamente y en entrenamiento la universidad me da una ayuda gigante"',
      imagen: "./public/testimonios/luciana.webp",
    }
  ];

  new GenericCarousel({
    items: testimonios,
    selectors: {
      container: "#contenido-testimonial",
      imagen: "#imagen-testimonial",
      text: "#texto-testimonial",
      titulo: "#nombre-testimonial",
      subtitulo: "#carrera-testimonial",
      dots: "#puntos-testimonios",
      prevBtn: "#prev-testimonial",
      nextBtn: "#next-testimonial"
    },
    autoPlayDelay: 5000
  });
}

/* --------------------- Formulario ----------------------------- */
function initFormulario() {
  // Función asincrónica autoejecutable
  (async () => {

    async function cargarCarreras() {
      try {
        const response = await fetch(
          '../../landing/consultas/getCarrerasJson.php?modo=7', {
          cache: "no-store"
        }
        );

        if (!response.ok) {
          throw new Error(`Error de red: ${response.status}`);
        }

        const carreras = await response.json();

        if (!Array.isArray(carreras)) {
          throw new Error("La respuesta no es un array válido de carreras");
        }

        // 🎯 Filtro por cohortes específicas de Agosto
        const carrerasDistancia = [16, 244, 14, 360, 355, 11, 138, 96, 336, 10, 15, 161, 363, 378, 196, 214, 133, 9, 250, 383, 58, 175];
        console.log(carrerasDistancia)
        const dataDistancia = carreras.filter(carrera =>
          carrerasDistancia.includes(carrera.codcar)
        );

        console.log("📊 Carreras Distancia:", dataDistancia);

        // Guardar listado en localStorage
        localStorage.setItem(
          "CarrerasDistancia",
          JSON.stringify(dataDistancia)
        );


        $("#cbx_carrera").empty().append('<option value="" disabled selected>Carrera</option>');
        $("#cbx_provincia").empty().append('<option value="" disabled selected>Provincia</option>');
        $("#cbx_sede").empty().append('<option value="" disabled selected>Sede</option>');

        setTimeout(() => {
          const provinciaElement = document.getElementById('cbx_provincia');
          const sedeElement = document.getElementById('cbx_sede');

          if (provinciaElement) {
            provinciaElement.setAttribute("disabled", "disabled");
            provinciaElement.className = "block w-full px-0 pt-2 pb-1 pl-2 text-sm text-black border border-gray-300 shadow-sm bg-white/80 focus:ring-blue-600 focus:border-blue-600 boton-inactivo-form";
          }

          if (sedeElement) {
            sedeElement.setAttribute("disabled", "disabled");
            sedeElement.className = "block w-full px-0 pt-2 pb-1 pl-2 text-sm text-black border border-gray-300 shadow-sm bg-white/80 focus:ring-blue-600 focus:border-blue-600 boton-inactivo-form";
          }

          const provinciaWrapper = provinciaElement?.closest('.select-wrapper');
          const sedeWrapper = sedeElement?.closest('.select-wrapper');

          if (provinciaWrapper) {
            provinciaWrapper.classList.remove('enabled');
            provinciaWrapper.setAttribute('data-tooltip', 'Seleccioná una carrera primero');
          }
          if (sedeWrapper) {
            sedeWrapper.classList.remove('enabled');
            sedeWrapper.setAttribute('data-tooltip', 'Seleccioná una carrera primero');
          }
        }, 100);
        // Llenar selector de carreras
        dataDistancia.forEach(carrera => {
          $("#cbx_carrera").append(
            `<option value="${carrera.codcar}">${carrera.nombre_carrera}</option>`
          );
        });

        // Si hay solo una carrera, se selecciona automáticamente
        if (dataDistancia.length === 1) {
          $("#cbx_carrera").val($("#cbx_carrera option:eq(1)").val());
        }

      } catch (error) {
        console.error("❌ Error al cargar carreras:", error);
        mostrarErrorEnLaUI("No se pudieron cargar las carreras en este momento.");
      }
    }

    // 🚀 Ejecutar carga
    await cargarCarreras();

  })();

  // Inicialización del formulario
  const form = document.getElementById('pedidoinfo') || document.querySelector('form');
  if (!form) return;

  const requiredInputs = form.querySelectorAll('input[required], select[required], textarea[required]');
  const btn = document.getElementById('formButton');

  if (btn) {
    btn.classList.add("boton-inactivo");
    btn.setAttribute("disabled", "disabled");
  }

  function checkFormCompletion() {
    if (!window.recaptchaCompleted || !btn) return;

    let allFieldsCompleted = true;

    requiredInputs.forEach(input => {
      if (!input.value.trim()) {
        allFieldsCompleted = false;
      }
    });

    if (allFieldsCompleted) {
      btn.removeAttribute("disabled");
      btn.classList.add("boton-activo");
      btn.classList.remove("boton-inactivo");
    } else {
      btn.setAttribute("disabled", "disabled");
      btn.classList.remove("boton-activo");
      btn.classList.add("boton-inactivo");
    }
  }

  requiredInputs.forEach(input => {
    input.addEventListener('input', checkFormCompletion);
    input.addEventListener('change', checkFormCompletion);
    input.addEventListener('blur', checkFormCompletion);
  });
}

/* --------------------- Funciones globales del formulario ----------------------------- */
function mostrarErrorEnLaUI(mensaje) {
  $("#cbx_carrera").empty().append(`<option value="" disabled selected>${mensaje}</option>`);
  $("#cbx_provincia").empty().append(`<option value="" disabled selected>-</option>`);
  $("#cbx_sede").empty().append(`<option value="" disabled selected>-</option>`);

  document.getElementById('cbx_provincia')?.setAttribute("disabled", "disabled");
  document.getElementById('cbx_sede')?.setAttribute("disabled", "disabled");
  document.getElementById('cbx_carrera')?.setAttribute("disabled", "disabled");
}

$(window).on("load", function () {
  if (window.location.href.split("?")[1]) {
    $('a[href*="https://sistemas"]').each(function () {
      var con = $(this).prop("href").split("?").length == 1 ? "?" : "&";
      $(this).prop(
        "href",
        $(this).prop("href") + con + window.location.href.split("?")[1]
      );
    });
  }
});

function cargar_provincias() {
  const carrera = document.getElementById('cbx_carrera').value;
  const provinciaSelect = document.getElementById('cbx_provincia');
  const sedeSelect = document.getElementById('cbx_sede');
  const provinciaWrapper = provinciaSelect.closest('.select-wrapper');
  const sedeWrapper = sedeSelect.closest('.select-wrapper');

  // Limpiar selects
  $("#cbx_provincia").empty().append('<option value="" selected>Provincia</option>').prop("disabled", true);
  $("#cbx_sede").empty().append('<option value="" selected>Sede</option>').prop("disabled", true);

  if (carrera) {
    // Habilitar provincia
    provinciaSelect.disabled = false;
    provinciaSelect.classList.remove('boton-inactivo-form');
    provinciaWrapper.classList.add('enabled');
    provinciaWrapper.setAttribute('data-tooltip', ''); // Limpiar tooltip

    // Deshabilitar sede hasta que se seleccione provincia
    sedeSelect.disabled = true;
    sedeSelect.classList.add('boton-inactivo-form');
    sedeWrapper.classList.remove('enabled');
    sedeWrapper.setAttribute('data-tooltip', 'Seleccioná una provincia primero');
    sedeSelect.value = '';

    let carrerasArray = JSON.parse(localStorage.getItem("CarrerasDistancia"));
    const carrerasProv = carrerasArray.filter(carreras => carreras.codcar == carrera);

    if (carrerasProv.length) {
      let carrera = carrerasProv[0];
      let provincias = carrera.provincias;
      let list_prov_id = [];

      provincias.sort((a, b) => a.nombre_provincia.localeCompare(b.nombre_provincia));

      provincias.forEach((valorProvincia) => {
        if (!list_prov_id.includes(valorProvincia.id_provincia)) {
          list_prov_id.push(valorProvincia.id_provincia);
          $("#cbx_provincia").append(`<option value="${valorProvincia.id_provincia}">${valorProvincia.nombre_provincia}</option>`);
        }
      });

      if (provincias.length == 1) {
        $("#cbx_provincia").val($("#cbx_provincia option:eq(1)").val());
        cargar_sedes();
      }
    }
  } else {
    // Si no hay carrera seleccionada, deshabilitar ambos
    provinciaSelect.disabled = true;
    provinciaSelect.classList.add('boton-inactivo-form');
    provinciaWrapper.classList.remove('enabled');
    provinciaWrapper.setAttribute('data-tooltip', 'Seleccioná una carrera primero');

    sedeSelect.disabled = true;
    sedeSelect.classList.add('boton-inactivo-form');
    sedeWrapper.classList.remove('enabled');
    sedeWrapper.setAttribute('data-tooltip', 'Seleccioná una carrera primero');
  }
}
function cargar_sedes() {
  const carrera = document.getElementById('cbx_carrera').value;
  const provincia = document.getElementById('cbx_provincia').value;
  const sedeSelect = document.getElementById('cbx_sede');
  const sedeWrapper = sedeSelect.closest('.select-wrapper');

  // Limpiar sede
  $("#cbx_sede").empty().append('<option value="" selected>Sede</option>').prop("disabled", true);

  if (provincia) {
    // Habilitar sede
    sedeSelect.disabled = false;
    sedeSelect.classList.remove('boton-inactivo-form');
    sedeWrapper.classList.add('enabled');
    sedeWrapper.setAttribute('data-tooltip', '');

    let carrerasArray = JSON.parse(localStorage.getItem("CarrerasDistancia"));
    const carrerasProv = carrerasArray.filter(carreras => carreras.codcar == carrera);

    if (carrerasProv.length) {
      let carrera = carrerasProv[0];
      let provincias = carrera.provincias;

      const sedesProv = provincias.filter(p => p.id_provincia == provincia);

      if (sedesProv.length) {
        sedesProv.forEach((valorSede) => {
          $("#cbx_sede").append(`<option value="${valorSede.id_sede}">${valorSede.nombre_sede}</option>`);
        });

        if (sedesProv.length == 1) {
          $("#cbx_sede").val($("#cbx_sede option:eq(1)").val());
        }
      }
    }
  } else {
    // Si no hay provincia seleccionada
    sedeSelect.disabled = true;
    sedeSelect.classList.add('boton-inactivo-form');
    sedeWrapper.classList.remove('enabled');
    sedeWrapper.setAttribute('data-tooltip', 'Seleccioná una provincia primero');
  }
}
document.addEventListener('DOMContentLoaded', function () {
  const provinciaWrapper = document.querySelector('#cbx_provincia').closest('.select-wrapper');
  const sedeWrapper = document.querySelector('#cbx_sede').closest('.select-wrapper');

  // Establecer tooltips iniciales
  if (provinciaWrapper) {
    provinciaWrapper.setAttribute('data-tooltip', 'Seleccioná una carrera primero');
  }
  if (sedeWrapper) {
    sedeWrapper.setAttribute('data-tooltip', 'Seleccioná una carrera primero');
  }
});

function carreraForm(cod) {
  const carrerasDropdown = $('#cbx_carrera').empty();
  const provinceDropdown = $("#cbx_provincia").empty();
  const siteDropdown = $("#cbx_sede").empty();

  const carrerasString = window.localStorage.getItem("CarrerasDistancia");
  if (!carrerasString) {
    console.error("Failed to load career data from local storage.");
    return;
  }

  const carrerasArray = JSON.parse(carrerasString);
  if (!carrerasArray || carrerasArray.length === 0) {
    console.error("No careers found in local storage.");
    return;
  }

  // Cargar todas las carreras en el dropdown
  carrerasDropdown.append('<option value="" selected>Carrera</option>');
  carrerasArray.forEach(carrera => {
    appendOption(carrerasDropdown, carrera.codcar, carrera.nombre_carrera);
  });

  carrerasDropdown.val(cod);

  cargar_provincias();
  // Si hay una sola provincia se cargara automaticamente
  setTimeout(() => {
    if ($("#cbx_provincia option").length === 2) {
      cargar_sedes();
    }
  }, 100);

  scrollToForm();
}

function appendOption(dropdown, value, text, isSelected = false) {
  const optionHTML = `<option value="${value}" ${isSelected ? 'selected' : ''}>${text}</option>`;
  dropdown.append(optionHTML);
}

function getUniqueProvinces(provinces) {
  const uniqueIds = new Set();
  return provinces.filter(province => {
    const isUnique = !uniqueIds.has(province.id_provincia);
    uniqueIds.add(province.id_provincia);
    return isUnique;
  }).sort((a, b) => a.nombre_provincia.localeCompare(b.nombre_provincia));
}

function carreraForm(cod) {
  const carrerasString = window.localStorage.getItem("CarrerasModGeneral");
  if (!carrerasString) {
    console.error("Failed to load career data from local storage.");
    return;
  }

  const carrerasArray = JSON.parse(carrerasString);
  if (!carrerasArray || carrerasArray.length === 0) {
    console.error("No careers found in local storage.");
    return;
  }

  const carreraSeleccionada = carrerasArray.find(carrera => carrera.codcar == cod);
  if (!carreraSeleccionada) {
    console.error("Career not found:", cod);
    return;
  }

  $("#modo").val(carreraSeleccionada.modo);
  cambiar_modo();

  setTimeout(() => {
    if (carreraSeleccionada.provincias && carreraSeleccionada.provincias.length === 1) {
      const provincia = carreraSeleccionada.provincias[0];
      $("#cbx_provincia").val(provincia.id_provincia);
      cargar_sedes();

      setTimeout(() => {
        $("#cbx_sede").val(provincia.id_sede);
        cargar_carreras();

        setTimeout(() => {
          $("#cbx_carrera").val(cod);
        }, 100);
      }, 100);
    }
  }, 100);
}

function smoothScroll(event, id) {
  event.preventDefault();
  const section = document.getElementById(id);
  if (section) {
    var componentePosicion = section.offsetTop;
    window.scrollTo({
      top: componentePosicion - 110,
      behavior: 'smooth'
    });
  }
}

function reCALLBACK(token) {
  const btn = document.getElementById('formButton');
  if (!token || !btn) return;

  const form = document.getElementById('pedidoinfo') || document.querySelector('form');
  if (!form) return;

  const requiredInputs = form.querySelectorAll('input[required], select[required], textarea[required]');
  let allFieldsCompleted = true;

  requiredInputs.forEach(input => {
    if (!input.value.trim()) {
      allFieldsCompleted = false;
    }
  });

  if (allFieldsCompleted) {
    btn.removeAttribute("disabled");
    btn.classList.add("boton-activo");
    btn.classList.remove("boton-inactivo-form");
  } else {
    btn.setAttribute("disabled", "disabled");
    btn.classList.remove("boton-activo");
    btn.classList.add("boton-inactivo-form");
  }

  window.recaptchaCompleted = true;
}

function check() {
  const form = document.getElementById('pedidoinfo') || document.querySelector('form');
  const btn = document.getElementById('formButton');
  const spinnerContainer = document.getElementById("spinnerContainer");

  if (!form || !btn || !spinnerContainer) return false;

  const codArea = document.getElementsByName("cod_area")[0];
  const tel = document.getElementsByName("tel")[0];

  if (codArea && tel) {
    const totalLength = codArea.value.length + tel.value.length;
    if (totalLength > 1 && totalLength < 10) {
      tel.setCustomValidity("Escribe Teléfono y Código de Área completos");
    } else {
      tel.setCustomValidity("");
    }
  }

  if (form.checkValidity()) {
    btn.classList.add("hidden");
    spinnerContainer.classList.remove("hidden");
    return true;
  } else {
    return false;
  }
}

function validarLongitudTelefono(inputTelefono, longitudMaxima) {
  if (!inputTelefono) return;

  var telefono = inputTelefono.value;
  var telefonoLimpio = telefono.replace(/\D/g, '');

  if (telefonoLimpio.length > longitudMaxima) {
    telefonoLimpio = telefonoLimpio.slice(0, longitudMaxima);
  }

  inputTelefono.value = telefonoLimpio;
}