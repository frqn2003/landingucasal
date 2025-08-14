const navButton = document.getElementById("menu-button");
const menu = document.getElementById("navbar-menu");

let isMenuOpen = false;

function toggleMenu() {
  isMenuOpen = !isMenuOpen;

  if (isMenuOpen) {
    // Abrir menú con animación
    menu.classList.remove('hidden');
    // Forzar un reflow para que la transición funcione
    menu.offsetHeight;
    menu.classList.add('menu-open');
  } else {
    // Cerrar menú con animación
    menu.classList.remove('menu-open');
    // Esperar a que termine la animación antes de ocultar
    setTimeout(() => {
      if (!isMenuOpen) {
        menu.classList.add('hidden');
      }
    }, 300); // Duración de la transición
  }
}

navButton.addEventListener("click", toggleMenu);

const menuLinks = menu.querySelectorAll('a');
menuLinks.forEach(link => {
  link.addEventListener('click', () => {
    if (isMenuOpen) {
      toggleMenu();
    }
  });
});

document.addEventListener('click', (event) => {
  const clickDentroMenu = menu.contains(event.target);
  const clickEnBoton = navButton.contains(event.target);

  if (!clickDentroMenu && !clickEnBoton && isMenuOpen) {
    toggleMenu()
  }
});

/* --------------------- Variables globales ----------------------------- */
const containerCarreras = document.getElementById("listaCarreras");
const containerFiltros = document.getElementById("filtros");
const searchInput = document.getElementById("search-bar");
const containerFiltrosArea = document.getElementById("filtros-categoria");

let textoBusqueda = "";
let filtroActivo = null;
let filtrosActivos = [];
let filtrosAreaActivos = [];

/* --------------------- Inicialización principal ----------------------------- */
document.addEventListener('DOMContentLoaded', function () {
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
  
  // 6. Inicializar carreras más elegidas
  initCarrerasElegidas();
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
              <img class="md:w-1/4 w-1/3 p-4 bg-white rounded-2xl" src="${tarjeta.imagen}" alt="${tarjeta.nombre}">
              <p class="text-md">${tarjeta.descripcion}</p>
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
function initCarrerasData() {
  fetch('assets/datosCarreras.json')
    .then((response) => response.json())
    .then((json) => {
      const careers = json.careers
      const filtros = json.filtros
      const filtrosArea = json.filtrosArea
      const modalidades = json.modalidades

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
        containerFiltros.innerHTML = filtros.map(filter => `
          <button class="cursor-pointer flex items-center space-x-2 px-4 py-2 rounded-[8px] bg-white border-2 border-gray-200 md:hover:bg-[#D6001C] md:hover:text-white md:text-base text-xs transition-colors" id="boton-filtro"
            data-filter="${filter.id}">
            <span>${filter.name}</span>
          </button>
        `).join('');

        containerFiltrosArea.innerHTML = filtrosArea.map(filter => `
          <button class="cursor-pointer flex items-center space-x-2 px-4 py-2 rounded-[8px] bg-white border-2 border-gray-200 md:hover:bg-[#D6001C] md:hover:text-white md:text-base text-xs transition-colors" id="filtro-area-btn"
            data-filter="${filter}">
            <span>${filter.charAt(0).toUpperCase() + filter.slice(1)}</span>
          </button>
        `).join('');

        // Event listeners para filtros principales
        const botones = containerFiltros.querySelectorAll("#boton-filtro");
        botones.forEach(button => {
          button.addEventListener("click", (e) => {
            e.preventDefault();
            handleFilterClick(e.currentTarget.dataset.filter, e.currentTarget, 'main');
          });
        });

        // Event listeners para filtros de área
        const botonesArea = containerFiltrosArea.querySelectorAll("#filtro-area-btn");
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
        const botonesDesktop = containerFiltros.querySelectorAll("#boton-filtro");
        botonesDesktop.forEach(btn => {
          const isActive = filtrosActivos.includes(btn.dataset.filter);
          toggleButtonStyle(btn, isActive);
        });

        const botonesAreaDesktop = containerFiltrosArea.querySelectorAll("#filtro-area-btn");
        botonesAreaDesktop.forEach(btn => {
          const isActive = filtrosAreaActivos.includes(btn.dataset.filter);
          toggleButtonStyle(btn, isActive);
        });
      }

      function setupFiltersDropdown() {
        const FiltersBtn = document.getElementById("filters-btn");
        const FiltersDropdown = document.getElementById("filters-dropdown");
        const FiltersArrow = document.getElementById("filters-arrow");
        const clearAllBtn = document.getElementById("clear-all-filters");

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
          return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        }

        if (textoBusqueda.trim() !== "") {
          const textoNormalizado = normalizeText(textoBusqueda);
          carrerasFiltradas = carrerasFiltradas.filter(career => {
            const nombreNormalizado = normalizeText(career.name);
            const descripcionNormalizada = normalizeText(career.description);

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
                case 'featured':
                  return career.featured === true;
                case 'modality':
                  return career.modality.includes(filtro.value);
                case 'duration':
                  const durationMatch = career.duration.match(/(\d+)/);
                  const careerYears = durationMatch ? parseInt(durationMatch[1]) : 0;
                  return careerYears <= filtro.maxYears;
                default:
                  return false;
              }
            });
          });
        }

        if (filtrosAreaActivos.length > 0) {
          carrerasFiltradas = carrerasFiltradas.filter(career => {
            return filtrosAreaActivos.some(areaId => {
              const categoryNormalized = normalizeText(career.category);
              const areaIdNormalized = normalizeText(areaId);
              return categoryNormalized.includes(areaIdNormalized) ||
                areaIdNormalized.includes(categoryNormalized);
            });
          });
        }

        function obtenerNombreModalidad(modalities) {
          if (modalities.includes(1) && modalities.includes(7)) return 'Presencial y Virtual';
          if (modalities.includes(1)) return 'Presencial';
          return 'Virtual';
        }

        if (carrerasFiltradas.length === 0) {
          containerCarreras.innerHTML = `
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
          containerCarreras.innerHTML = carrerasFiltradas.map(career => `
            <div class="border border-gray-500 shadow-md p-3 sm:p-4 space-y-3 sm:space-y-2">
              <div class="grid grid-cols-2 space-y-2 sm:space-y-0">
                <div class="flex justify-start">
                  <img src="${career.image}" alt="${career.name}" class="object-contain w-12 h-12 sm:w-16 sm:h-16">
                </div>
                <div class="flex justify-end items-center space-x-2">
                  ${career.popular ? '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>' : ''}
                  ${career.featured ? '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" /></svg>' : ''}
                </div>
              </div>
              <h3 class="font-bold text-left text-base sm:text-lg">${career.name}</h3>
              <div class="flex flex-col space-y-2 sm:grid sm:grid-rows-2 sm:gap-2 sm:space-y-0">
                <div class="flex items-center justify-start">
                  <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                  <span class="text-xs sm:text-sm font-semibold px-1">${career.duration}</span>
                </div>
                <div class="flex items-center justify-start">
                  <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                  <span class="text-xs sm:text-sm font-semibold px-1">${obtenerNombreModalidad(career.modality)}</span>
                </div>
              </div>
              <p class="text-gray-600 text-xs sm:text-sm text-left leading-relaxed">${career.description}</p>
              <div class="flex flex-col space-y-3 sm:grid sm:grid-rows-2 sm:space-y-0">
                <div class="flex justify-center sm:justify-start">
                  <span class="text-xs font-medium text-gray-700 bg-gray-200 h-fit py-1 px-2 rounded-sm">${career.category}</span>
                </div>
                <a href="#formu" class="boton-cta text-center max-md:text-sm justify-center inline-flex items-center w-full sm:w-auto mt-2 sm:mt-0">
                  Más info
                </a>
              </div>
            </div>
          `).join('');
        }
      }

      // Función global para limpiar filtros
      window.limpiarFiltrosYBusqueda = function () {
        textoBusqueda = "";
        if (searchInput) {
          searchInput.value = "";
        }
        filtrosActivos = [];
        filtrosAreaActivos = [];
        updateAllFilterStates();
        updateActiveFiltersCount();
        renderCarreras();
      }

      // Event listener para búsqueda
      if (searchInput) {
        searchInput.addEventListener("input", (e) => {
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
          <div class="bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div class="p-4 md:p-6">
              <div class="flex flex-col md:flex-row md:items-start gap-4">
                <div class="flex justify-center md:justify-start">
                  <img src="${modalidad.imagen}" alt="${modalidad.nombre}"
                    class="w-16 h-16 md:w-20 md:h-20 object-contain rounded-lg">
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
              <div class="mt-4 md:mt-6">
                <div class="flex items-center justify-between md:justify-start mobile-expand-trigger md:cursor-default"
                  onclick="toggleCharacteristics(${modalidad.id})">
                  <h3 class="font-semibold text-gray-700">
                    Características
                  </h3>
                  <button class="md:hidden text-[#D6001C] p-1 transform transition rotate-180" id="expand-btn-${modalidad.id}">
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
                  <div class="py-3 md:px-6 md:py-4 border-t border-gray-200">
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

            const botonesFiltros = containerFiltros.querySelectorAll("#boton-filtro");
            botonesFiltros.forEach(btn => {
              btn.classList.remove("bg-[#D6001C]", "text-white");
              btn.classList.add("bg-white");
            });

            const botonesFiltrosArea = containerFiltrosArea.querySelectorAll("#boton-filtro");
            botonesFiltrosArea.forEach(btn => {
              btn.classList.remove("bg-[#D6001C]", "text-white");
              btn.classList.add("bg-white");
            });

            filtrosActivos.forEach(filtroId => {
              const activeBtn = containerFiltros.querySelector(`[data-filter="${filtroId}"]`);
              const activeBtnArea = containerFiltrosArea.querySelector(`[data-filter="${filtroId}"]`);

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
        if (window.innerWidth >= 768) return;

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
        
        const isMobile = window.innerWidth < 768;

        modalidades.forEach(modalidad => {
          const content = document.getElementById(`characteristics-${modalidad.id}`);
          const button = document.getElementById(`expand-btn-${modalidad.id}`);

          if (!content || !button) return;

          if (!isMobile) {
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

      // Renderizar modalidades
      renderModalidades();
      handleModalidadesResize();
    })
    .catch(error => {
      console.error('Error al cargar datos de carreras:', error);
    });
}

/* --------------------- Carreras Más Elegidas ----------------------------- */
function initCarrerasElegidas() {
  const carrerasElegidas = [
    { nombre: "Abogacía", estudiantes: 1200 },
    { nombre: "Contador Público", estudiantes: 950 },
    { nombre: "Ingeniería en Sistemas", estudiantes: 800 },
    { nombre: "Licenciatura en Administración de Empresas", estudiantes: 700 },
  ]
  const container = document.getElementById("carrerasElegidas");

  if (container) {
    carrerasElegidas.forEach((carrera) => {
      const card = document.createElement("div");
      card.className = "bg-black/5 rounded-lg p-3 hover:bg-white/20 transition-colors cursor-pointer";

      card.innerHTML = `
        <div class="flex items-center space-x-3">
          <div>
            <div class="text-black font-medium text-sm">${carrera.nombre}</div>
            <div class="text-black text-xs">${carrera.estudiantes} estudiantes</div>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }
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
      image: document.querySelector(this.selectors.image),
      text: document.querySelector(this.selectors.text),
      title: document.querySelector(this.selectors.title),
      subtitle: document.querySelector(this.selectors.subtitle),
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

      if (this.elements.image && item.image) {
        this.elements.image.src = item.image;
        this.elements.image.alt = item.alt || '';
      }
      if (this.elements.text) this.elements.text.textContent = item.text || '';
      if (this.elements.title) this.elements.title.textContent = item.title || '';
      if (this.elements.subtitle) this.elements.subtitle.textContent = item.subtitle || '';

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
      title: "Benjamin Elizalde",
      subtitle: "Licenciatura en comercialización",
      text: '"La facultad esta siempre a disposición"',
      image: "./public/testimonios/benja.webp",
    },
    {
      title: "Ebaneo Valdez Kao",
      subtitle: "Ingeniería en Informática",
      text: '"Puedo ejercer mi profesión desde cualquier parte del del mundo"',
      image: "./public/testimonios/kao.webp",
    },
    {
      title: "Luciana Gennari",
      subtitle: "Kinesiologia",
      text: '"Para poder rendir bien academicamente y en entrenamiento la universidad me da una ayuda gigante"',
      image: "./public/testimonios/luciana.webp",
    }
  ];

  new GenericCarousel({
    items: testimonios,
    selectors: {
      container: "#contenido-testimonial",
      image: "#imagen-testimonial",
      text: "#texto-testimonial",
      title: "#nombre-testimonial",
      subtitle: "#carrera-testimonial",
      dots: "#puntos-testimonios",
      prevBtn: "#prev-testimonial",
      nextBtn: "#next-testimonial"
    },
    autoPlayDelay: 3000
  });
}

/* --------------------- Componente Potencia ----------------------------- */
function initPotencia() {
  const potencia = [
    { id: "descanso", nombre: "Áreas de descanso", descripcion: "Espacios cómodos y tranquilos para relajarte y recargar energías entre clases.", icono: "./public/kao.webp", imagen: "./public/benja.png" },
    { id: "deporte", nombre: "Deporte", descripcion: "Instalaciones deportivas de primer nivel para mantenerte activo y saludable.", icono: "./public/kao.webp", imagen: "./public/areas.webp" },
    { id: "biblioteca", nombre: "Biblioteca", descripcion: "Acceso a una vasta colección de recursos académicos y espacios de estudio.", icono: "./public/kao.webp", imagen: "./public/areas.webp" },
    { id: "laboratorio", nombre: "Laboratorios", descripcion: "Laboratorios equipados con tecnología de vanguardia para prácticas y experimentación.", icono: "./public/kao.webp", imagen: "./public/areas.webp" },
    { id: "coworking", nombre: "Coworking", descripcion: "Espacios colaborativos y modernos para fomentar la creatividad y el trabajo en equipo.", icono: "./public/kao.webp", imagen: "./public/areas.webp" },
    { id: "idiomas", nombre: "Centro de idiomas", descripcion: "Programas de idiomas para potenciar tus habilidades comunicativas y abrirte a nuevas culturas.", icono: "./public/kao.webp", imagen: "./public/areas.webp" },
    { id: "salud", nombre: "Salud", descripcion: "Servicios de atención médica y bienestar para cuidar tu salud integral.", icono: "./public/kao.webp", imagen: "./public/areas.webp" },
    { id: "cultura", nombre: "Cultura", descripcion: "Actividades culturales y artísticas para enriquecer tu experiencia universitaria.", icono: "./public/kao.webp", imagen: "./public/areas.webp" }
  ]

  const containerPotencia = document.getElementById("potencia")

  if (containerPotencia) {
    containerPotencia.innerHTML = potencia.map(item => `
      <div class="bg-black/10 rounded-xl flex flex-row justify-center items-center gap-4 p-4 shadow-xl cursor-pointer hover:bg-black/20 transition-colors" data-potencia-id="${item.id}" data-imagen="${item.imagen}">
        <img src="${item.icono}" class="w-12 h-12 flex rounded-xl"/>
        <div class="grid-rows-2 space-y-2 inline-block">
          <h3>${item.nombre}</h3>
          <p>${item.descripcion}</p>
        </div>
        <div class="-rotate-90">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </div>
    `).join('')
    
    // Add click event listeners
    const potenciaItems = containerPotencia.querySelectorAll('[data-potencia-id]')
    const mainImage = document.querySelector('img[alt="Placeholder Image"]')
    
    potenciaItems.forEach(item => {
      item.addEventListener('click', function() {
        const imagenSrc = this.getAttribute('data-imagen')
        if (mainImage && imagenSrc) {
          mainImage.src = imagenSrc
          mainImage.alt = this.querySelector('h3').textContent
        }
        
        potenciaItems.forEach(i => i.classList.remove('bg-black/30'))
        this.classList.add('bg-black/30')
      })
    })
  }
}

/* --------------------- Formulario ----------------------------- */
function initFormulario() {
  // Script para el formulario
  (async () => {
    try {
      const resp = await fetch(
        `../../landing/consultas/getCarrerasJson.php?tipcar=Grado,Pregrado,Intermedio`
      );
      const data = await resp.json();

      let codigosExcluidos = ["191", "46"];
      let dataFiltrado = data.filter((carrera) => !codigosExcluidos.includes(carrera.codcar));

      window.localStorage.setItem("CarrerasModGeneral", JSON.stringify(dataFiltrado));

      $("#cbx_carrera").empty().append('<option value="" disabled selected>Carrera</option>');
      $("#cbx_provincia").empty().append('<option value="" disabled selected>Provincia</option>');
      $("#cbx_sede").empty().append('<option value="" disabled selected>Sede</option>');

      setTimeout(() => {
        const provinciaElement = document.getElementById('cbx_provincia');
        const sedeElement = document.getElementById('cbx_sede');
        const carreraElement = document.getElementById('cbx_carrera');

        if (provinciaElement) {
          provinciaElement.setAttribute("disabled", "disabled");
          provinciaElement.className = "block w-full px-0 pt-2 pb-1 pl-2 text-sm text-black border border-gray-300 shadow-sm bg-white/80 focus:ring-blue-600 focus:border-blue-600 boton-inactivo-form";
        }

        if (sedeElement) {
          sedeElement.setAttribute("disabled", "disabled");
          sedeElement.className = "block w-full px-0 pt-2 pb-1 pl-2 text-sm text-black border border-gray-300 shadow-sm bg-white/80 focus:ring-blue-600 focus:border-blue-600 boton-inactivo-form";
        }

        if (carreraElement) {
          carreraElement.setAttribute("disabled", "disabled");
          carreraElement.className = "block w-full px-0 pt-2 pb-1 pl-2 text-sm text-black border border-gray-300 shadow-sm bg-white/80 focus:ring-blue-600 focus:border-blue-600 boton-inactivo-form";
        }

        const provinciaWrapper = provinciaElement?.closest('.select-wrapper');
        const sedeWrapper = sedeElement?.closest('.select-wrapper');

        if (provinciaWrapper) {
          provinciaWrapper.classList.remove('enabled');
          provinciaWrapper.setAttribute('data-tooltip', 'Seleccioná una modalidad primero');
        }
        if (sedeWrapper) {
          sedeWrapper.classList.remove('enabled');
          sedeWrapper.setAttribute('data-tooltip', 'Seleccioná una modalidad primero');
        }
      }, 100);

    } catch (error) {
      console.error("❌ Error al cargar carreras:", error);
      mostrarErrorEnLaUI("No se pudieron cargar las carreras en este momento.");
    }
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

function cambiar_modo() {
  var modo = $("#modo").val();

  if (!modo) {
    resetearFormulario();
    return;
  }

  $("#cbx_provincia").empty().append('<option value="" disabled selected>Provincia</option>');
  $("#cbx_sede").empty().append('<option value="" disabled selected>Sede</option>');
  $("#cbx_carrera").empty().append('<option value="" disabled selected>Carrera</option>');

  let provinciaElement = document.getElementById('cbx_provincia');
  if (provinciaElement) {
    provinciaElement.removeAttribute("disabled");
    provinciaElement.className = "block w-full px-0 pt-2 pb-1 pl-2 text-sm text-black border border-gray-300 shadow-sm bg-white/80 focus:ring-blue-600 focus:border-blue-600";

    const provinciaWrapper = provinciaElement.closest('.select-wrapper');
    if (provinciaWrapper) {
      provinciaWrapper.classList.add('enabled');
      provinciaWrapper.setAttribute('data-tooltip', '');
    }
  }

  let sedeElement = document.getElementById('cbx_sede');
  if (sedeElement) {
    sedeElement.setAttribute("disabled", "disabled");
    sedeElement.className = "block w-full px-0 pt-2 pb-1 pl-2 text-sm text-black border border-gray-300 shadow-sm bg-white/80 focus:ring-blue-600 focus:border-blue-600 boton-inactivo-form";

    const sedeWrapper = sedeElement.closest('.select-wrapper');
    if (sedeWrapper) {
      sedeWrapper.classList.remove('enabled');
      sedeWrapper.setAttribute('data-tooltip', 'Seleccioná una provincia primero');
    }
  }

  let carreraElement = document.getElementById('cbx_carrera');
  if (carreraElement) {
    carreraElement.setAttribute("disabled", "disabled");
    carreraElement.className = "block w-full px-0 pt-2 pb-1 pl-2 text-sm text-black border border-gray-300 shadow-sm bg-white/80 focus:ring-blue-600 focus:border-blue-600 boton-inactivo-form";
  }

  var carrerasArray = JSON.parse(window.localStorage.getItem("CarrerasModGeneral") || "[]");
  const carrerasMod = carrerasArray.filter(carreras => carreras.modo == modo);

  if (carrerasMod.length > 0) {
    var listaProvincia = [];
    var list_prov_id = [];

    carrerasMod.forEach(function (valorCarrera) {
      if (valorCarrera.provincias) {
        valorCarrera.provincias.forEach(function (provincia) {
          if (!list_prov_id.includes(provincia.id_provincia)) {
            list_prov_id.push(provincia.id_provincia);
            listaProvincia.push(provincia);
          }
        });
      }
    });

    listaProvincia.sort((a, b) => a.nombre_provincia.localeCompare(b.nombre_provincia));

    listaProvincia.forEach(function (provincia) {
      $("#cbx_provincia").append(
        `<option value="${provincia.id_provincia}">${provincia.nombre_provincia}</option>`
      );
    });

    if (listaProvincia.length === 1) {
      $("#cbx_provincia").val($("#cbx_provincia option:eq(1)").val());
      cargar_sedes();
    }
  }
}

function cargar_sedes() {
  const modo = document.getElementById('modo').value;
  const provincia = document.getElementById('cbx_provincia').value;
  const sedeSelect = document.getElementById('cbx_sede');
  const carreraSelect = document.getElementById('cbx_carrera');

  if (!sedeSelect || !carreraSelect) return;

  const sedeWrapper = sedeSelect.closest('.select-wrapper');

  $("#cbx_sede").empty().append('<option value="" disabled selected>Sede</option>');
  $("#cbx_carrera").empty().append('<option value="" disabled selected>Carrera</option>');

  carreraSelect.setAttribute("disabled", "disabled");
  carreraSelect.className = "block w-full px-0 pt-2 pb-1 pl-2 text-sm text-black border border-gray-300 shadow-sm bg-white/80 focus:ring-blue-600 focus:border-blue-600 boton-inactivo-form";

  if (provincia && modo) {
    sedeSelect.removeAttribute("disabled");
    sedeSelect.className = "block w-full px-0 pt-2 pb-1 pl-2 text-sm text-black border border-gray-300 shadow-sm bg-white/80 focus:ring-blue-600 focus:border-blue-600";

    if (sedeWrapper) {
      sedeWrapper.classList.add('enabled');
      sedeWrapper.setAttribute('data-tooltip', '');
    }

    let carrerasArray = JSON.parse(localStorage.getItem("CarrerasModGeneral") || "[]");
    const carrerasMod = carrerasArray.filter(c => c.modo == modo);

    var listaSedes = [];
    var list_sede_id = [];

    carrerasMod.forEach(function (carrera) {
      if (carrera.provincias) {
        carrera.provincias.forEach(function (prov) {
          if (prov.id_provincia == provincia && !list_sede_id.includes(prov.id_sede)) {
            list_sede_id.push(prov.id_sede);
            listaSedes.push(prov);
          }
        });
      }
    });

    listaSedes.sort((a, b) => a.nombre_sede.localeCompare(b.nombre_sede));

    listaSedes.forEach(function (sede) {
      $("#cbx_sede").append(
        `<option value="${sede.id_sede}">${sede.nombre_sede}</option>`
      );
    });

    if (listaSedes.length === 1) {
      $("#cbx_sede").val($("#cbx_sede option:eq(1)").val());
      cargar_carreras();
    }
  } else {
    sedeSelect.setAttribute("disabled", "disabled");
    sedeSelect.className = "block w-full px-0 pt-2 pb-1 pl-2 text-sm text-black border border-gray-300 shadow-sm bg-white/80 focus:ring-blue-600 focus:border-blue-600 boton-inactivo-form";

    if (sedeWrapper) {
      sedeWrapper.classList.remove('enabled');
      sedeWrapper.setAttribute('data-tooltip', 'Seleccioná una provincia primero');
    }
  }
}

function cargar_carreras() {
  const modo = document.getElementById('modo').value;
  const provincia = document.getElementById('cbx_provincia').value;
  const sede = document.getElementById('cbx_sede').value;
  const carreraSelect = document.getElementById('cbx_carrera');

  if (!carreraSelect) return;

  $("#cbx_carrera").empty().append('<option value="" disabled selected>Carrera</option>');

  if (sede && provincia && modo) {
    carreraSelect.removeAttribute("disabled");
    carreraSelect.className = "block w-full px-0 pt-2 pb-1 pl-2 text-sm text-black border border-gray-300 shadow-sm bg-white/80 focus:ring-blue-600 focus:border-blue-600";

    let carrerasArray = JSON.parse(localStorage.getItem("CarrerasModGeneral") || "[]");

    const carrerasFiltradas = carrerasArray.filter(carrera => {
      if (carrera.modo != modo) return false;

      if (carrera.provincias) {
        return carrera.provincias.some(prov =>
          prov.id_provincia == provincia && prov.id_sede == sede
        );
      }
      return false;
    });

    carrerasFiltradas.sort((a, b) => a.nombre_carrera.localeCompare(b.nombre_carrera));

    carrerasFiltradas.forEach(function (carrera) {
      $("#cbx_carrera").append(
        `<option value="${carrera.codcar}">${carrera.nombre_carrera}</option>`
      );
    });

    if (carrerasFiltradas.length === 1) {
      $("#cbx_carrera").val($("#cbx_carrera option:eq(1)").val());
    }
  } else {
    carreraSelect.setAttribute("disabled", "disabled");
    carreraSelect.className = "block w-full px-0 pt-2 pb-1 pl-2 text-sm text-black border border-gray-300 shadow-sm bg-white/80 focus:ring-blue-600 focus:border-blue-600 boton-inactivo-form";
  }
}

function resetearFormulario() {
  const provinciaElement = document.getElementById('cbx_provincia');
  const sedeElement = document.getElementById('cbx_sede');
  const carreraElement = document.getElementById('cbx_carrera');

  const provinciaWrapper = provinciaElement?.closest('.select-wrapper');
  const sedeWrapper = sedeElement?.closest('.select-wrapper');

  $("#cbx_provincia").empty().append('<option value="" disabled selected>Provincia</option>');
  $("#cbx_sede").empty().append('<option value="" disabled selected>Sede</option>');
  $("#cbx_carrera").empty().append('<option value="" disabled selected>Carrera</option>');

  if (provinciaElement) {
    provinciaElement.setAttribute("disabled", "disabled");
    provinciaElement.className = "block w-full px-0 pt-2 pb-1 pl-2 text-sm text-black border border-gray-300 shadow-sm bg-white/80 focus:ring-blue-600 focus:border-blue-600 boton-inactivo-form";
  }

  if (sedeElement) {
    sedeElement.setAttribute("disabled", "disabled");
    sedeElement.className = "block w-full px-0 pt-2 pb-1 pl-2 text-sm text-black border border-gray-300 shadow-sm bg-white/80 focus:ring-blue-600 focus:border-blue-600 boton-inactivo-form";
  }

  if (carreraElement) {
    carreraElement.setAttribute("disabled", "disabled");
    carreraElement.className = "block w-full px-0 pt-2 pb-1 pl-2 text-sm text-black border border-gray-300 shadow-sm bg-white/80 focus:ring-blue-600 focus:border-blue-600 boton-inactivo-form";
  }

  if (provinciaWrapper) {
    provinciaWrapper.classList.remove('enabled');
    provinciaWrapper.setAttribute('data-tooltip', 'Seleccioná una modalidad primero');
  }
  if (sedeWrapper) {
    sedeWrapper.classList.remove('enabled');
    sedeWrapper.setAttribute('data-tooltip', 'Seleccioná una modalidad primero');
  }
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