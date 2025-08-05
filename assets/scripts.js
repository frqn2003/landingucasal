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

/* --------------------- Filtros y carreras ----------------------------- */

const containerCarreras = document.getElementById("listaCarreras");
const containerFiltros = document.getElementById("filtros");
const searchInput = document.getElementById("search-bar");
const containerFiltrosArea = document.getElementById("filtros-categoria");

let textoBusqueda = "";
let filtroActivo = null;

// Cambiar la variable global de filtro activo a un array
filtrosActivos = [];
filtrosAreaActivos = []; // Nuevo array para filtros de área

fetch('assets/datosCarreras.json')
  .then((response) => response.json())
  .then((json) => {
    const careers = json.careers
    const filtros = json.filtros
    const filtrosArea = json.filtrosArea || ["ingeniería", "tecnología", "económicas", "salud", "sociales", "Humanidades", "Administración", "Idiomas", "educación", "Ciencias Agrarias y Veterinarias", "Artes", "Arquitectura"]
    const modalidades = json.modalidades || [
      { id: 1, nombre: "Presencial", descripcion: "Estudiá en un campus pensado para vos. Aprendé, conectá y crecé con actividades deportivas, culturales y académicas.", imagen: "https://placehold.co/60x60", caracteristicas: ["Sedes en todo el país.", "Interacción diaria con compañeros.", "Aulas equipadas y tecnología educativa.", "Conexión con el mundo laboral.", "Ambiente universitario activo."] },
      { id: 7, nombre: "Digital", descripcion: "Desc", imagen: "https://placehold.co/60x60", caracteristicas: [1, 2, 3, 4, 5] }
    ]

    // Función helper para manejar estilos de botones de manera más robusta
    function toggleButtonStyle(button, isActive) {
      // Remover todas las clases de estilo primero
      button.classList.remove("bg-white", "bg-[#D6001C]", "text-white", "text-gray-700");

      // Forzar un reflow del DOM (especialmente útil en móviles)
      button.offsetHeight;

      if (isActive) {
        button.classList.add("bg-[#D6001C]", "text-white");
      } else {
        button.classList.add("bg-white");
      }

      // Forzar otro reflow para asegurar que los cambios se apliquen
      requestAnimationFrame(() => {
        button.offsetHeight;
      });
    }

    function filtrosRender() {
      // Renderizar filtros para desktop
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

      // Event listeners para filtros principales (desktop)
      const botones = containerFiltros.querySelectorAll("#boton-filtro");
      botones.forEach(button => {
        button.addEventListener("click", (e) => {
          e.preventDefault();
          handleFilterClick(e.currentTarget.dataset.filter, e.currentTarget, 'main');
        });
      });

      // Event listeners para filtros de área (desktop)
      const botonesArea = containerFiltrosArea.querySelectorAll("#filtro-area-btn");
      botonesArea.forEach(button => {
        button.addEventListener("click", (e) => {
          e.preventDefault();
          handleFilterClick(e.currentTarget.dataset.filter, e.currentTarget, 'area');
        });
      });

      // Configurar funcionalidad del dropdown móvil
      setupFiltersDropdown();

      // Restaurar estado visual de filtros activos
      setTimeout(() => {
        updateAllFilterStates();
      }, 10);
    }

    // Nueva función para manejar clicks de filtros
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

    // Nueva función para actualizar estados de todos los filtros
    function updateAllFilterStates() {
      // Actualizar filtros principales 
      const botonesDesktop = containerFiltros.querySelectorAll("#boton-filtro");
      botonesDesktop.forEach(btn => {
        const isActive = filtrosActivos.includes(btn.dataset.filter);
        toggleButtonStyle(btn, isActive);
      });

      // Actualizar filtros de área 
      const botonesAreaDesktop = containerFiltrosArea.querySelectorAll("#filtro-area-btn");
      botonesAreaDesktop.forEach(btn => {
        const isActive = filtrosAreaActivos.includes(btn.dataset.filter);
        toggleButtonStyle(btn, isActive);
      });
    }

    // Nueva función para configurar el dropdown
    function setupFiltersDropdown() {
      const FiltersBtn = document.getElementById("filters-btn");
      const FiltersDropdown = document.getElementById("filters-dropdown");
      const FiltersArrow = document.getElementById("filters-arrow");
      const clearAllBtn = document.getElementById("clear-all-filters");

      if (!FiltersBtn || !FiltersDropdown) return;

      // Toggle dropdown
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

      // Limpiar todos los filtros
      clearAllBtn?.addEventListener("click", () => {
        filtrosActivos = [];
        filtrosAreaActivos = [];
        updateAllFilterStates();
        updateActiveFiltersCount();
        renderCarreras();
      });

      // Cerrar dropdown al hacer click fuera
      document.addEventListener("click", (e) => {
        if (!FiltersBtn.contains(e.target) && !FiltersDropdown.contains(e.target)) {
          FiltersDropdown.classList.add("hidden");
          FiltersArrow.style.transform = "rotate(0deg)";
        }
      });
    }

    // Nueva función para actualizar contador de filtros activos
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

      // Función auxiliar para normalizar texto (remover acentos y caracteres especiales)
      function normalizeText(text) {
        return text
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remover acentos
          .replace(/[^\w\s]/g, '') // Remover caracteres especiales (comas, puntos, etc.)
          .replace(/\s+/g, ' ') // Normalizar espacios múltiples
          .trim();
      }

      // Buscar por texto
      if (textoBusqueda.trim() !== "") {
        const textoNormalizado = normalizeText(textoBusqueda);
        carrerasFiltradas = carrerasFiltradas.filter(career => {
          const nombreNormalizado = normalizeText(career.name);
          const descripcionNormalizada = normalizeText(career.description);

          return nombreNormalizado.includes(textoNormalizado) ||
            descripcionNormalizada.includes(textoNormalizado);
        });
      }

      // Aplicar filtros principales - TODOS deben cumplirse (lógica AND)
      if (filtrosActivos.length > 0) {
        carrerasFiltradas = carrerasFiltradas.filter(career => {
          return filtrosActivos.every(filtroId => {
            const filtro = filtros.find(f => f.id === filtroId);
            if (!filtro) return false;

            // Aplicar filtro según su tipo definido en JSON
            switch (filtro.filterType) {
              case 'popular':
                return career.popular === true;
              case 'featured':
                return career.featured === true;
              case 'modality':
                return career.modality.includes(filtro.value);
              case 'duration':
                // Extraer número de años de la duración (ej: "3 años" -> 3)
                const durationMatch = career.duration.match(/(\d+)/);
                const careerYears = durationMatch ? parseInt(durationMatch[1]) : 0;
                return careerYears <= filtro.maxYears;
              default:
                return false;
            }
          });
        });
      }

      // Aplicar filtros de área - AL MENOS UNO debe cumplirse (lógica OR)
      if (filtrosAreaActivos.length > 0) {
        carrerasFiltradas = carrerasFiltradas.filter(career => {
          return filtrosAreaActivos.some(areaId => {
            // Comparación más precisa para categorías
            const categoryNormalized = normalizeText(career.category);
            const areaIdNormalized = normalizeText(areaId);
            // Verificar coincidencias parciales en ambas direcciones
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

      // Renderizado visual con handler de errores para resultados vacíos
      if (carrerasFiltradas.length === 0) {
        // Mostrar mensaje de error cuando no hay coincidencias
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
        // Renderizado normal cuando hay resultados
        containerCarreras.innerHTML = carrerasFiltradas.map(career => `
        <div class="border border-gray-500 shadow-md p-3 sm:p-4 space-y-3 sm:space-y-2 h-fit">
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
            <a href="#formu" class="boton-cta text-center justify-center inline-flex items-center w-full sm:w-auto mt-2 sm:mt-0">
              Solicitar información
            </a>
          </div>
        </div>
      `).join('');
      }
    }

    // Hacer las funciones accesibles globalmente
    window.limpiarFiltrosYBusqueda = function () {
      // Limpiar búsqueda
      textoBusqueda = "";
      if (searchInput) {
        searchInput.value = "";
      }

      // Limpiar filtros
      filtrosActivos = [];
      filtrosAreaActivos = [];

      // Actualizar estados visuales
      updateAllFilterStates();
      updateActiveFiltersCount();

      // Renderizar carreras sin filtros
      renderCarreras();
    }

    searchInput.addEventListener("input", (e) => {
      textoBusqueda = e.target.value;
      renderCarreras();
    });

    filtrosRender();
    renderCarreras();

    /* --------------------- Modalidad (ahora desde JSON) ----------------------------- */

    const containerModalidades = document.getElementById("modalidades");

    function renderModalidades() {
      const container = document.getElementById("modalidades");

      container.innerHTML = modalidades.map(modalidad => `
        <div class="bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <!-- Header de la tarjeta -->
          <div class="p-4 md:p-6">
            <div class="flex flex-col md:flex-row md:items-start gap-4">
              <!-- Imagen -->
              <div class="flex justify-center md:justify-start">
                <img src="${modalidad.imagen}" alt="${modalidad.nombre}"
                  class="w-16 h-16 md:w-20 md:h-20 object-contain rounded-lg">
              </div>

              <!-- Contenido principal -->
              <div class="flex-1 text-left">
                <h3 class="md:text-2xl font-bold text-gray-800 mb-2">
                  ${modalidad.nombre}
                </h3>
                <p class="text-xs md:text-base text-gray-600 leading-relaxed">
                  ${modalidad.descripcion}
                </p>
              </div>
            </div>

            <!-- Sección de características -->
            <div class="mt-4 md:mt-6">
              <!-- Header de características (clickeable en mobile) -->
              <div class="flex items-center justify-between md:justify-start mobile-expand-trigger md:cursor-default"
                onclick="toggleCharacteristics(${modalidad.id})">
                <h3 class="font-semibold text-gray-700">
                  Características
                </h3>
                <!-- Botón de expandir (solo visible en mobile) -->
                <button class="md:hidden text-gray-500 p-1 transform transition rotate-180" id="expand-btn-${modalidad.id}">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
              </div>

              <!-- Lista de características -->
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
                <!-- Footer con botón de acción -->
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
    }

    // Función para toggle de características en mobile
    window.toggleCharacteristics = function (modalidadId) {
      // Solo funciona en mobile
      if (window.innerWidth >= 768) return;

      const content = document.getElementById(`characteristics-${modalidadId}`);
      const button = document.getElementById(`expand-btn-${modalidadId}`);

      if (!content || !button) return;

      const isCollapsed = content.classList.contains('collapsed');

      if (isCollapsed) {
        // Expandir
        content.classList.remove('collapsed');
        content.classList.add('max-h-[500px]', 'opacity-100');
        content.classList.add('max-h-[500px]', 'opacity-100');
        button.classList.add('rotate-none');
      } else {
        // Colapsar
        content.classList.remove('max-h-[500px]', 'opacity-100');
        content.classList.remove('max-h-[500px]', 'opacity-100');
        content.classList.add('collapsed');
        button.classList.remove('rotate-none');
      }
    }

    // Función para manejar el resize de ventana
    function handleResize() {
      const isMobile = window.innerWidth < 768;

      modalidades.forEach(modalidad => {
        const content = document.getElementById(`characteristics-${modalidad.id}`);
        const button = document.getElementById(`expand-btn-${modalidad.id}`);

        if (!content || !button) return;

        if (!isMobile) {
          // En desktop, siempre expandido
          content.classList.remove('collapsed');
          content.classList.add('max-h-[500px]', 'opacity-100');
        } else {
          // En mobile, comenzar colapsado
          if (!content.classList.contains('max-h-[500px]', 'opacity-100')) {
            content.classList.add('collapsed');
            content.classList.remove('max-h-[500px]', 'opacity-100');
          }
        }
      });
    }

    // Event listeners
    window.addEventListener('resize', handleResize);

    // Iniciar componente
    document.addEventListener('DOMContentLoaded', function () {
      renderModalidades();
      handleResize()
    });

    // Event listeners para los botones de modalidades
    document.addEventListener('DOMContentLoaded', function () {
      const botonesModalidad = document.querySelectorAll("#boton-modalidad");

      botonesModalidad.forEach(button => {
        button.addEventListener('click', function (e) {
          const modalidadFilter = e.currentTarget.dataset.filter;

          // Limpiar filtros activos anteriores
          filtrosActivos = [];

          // Agregar el filtro de modalidad
          filtrosActivos.push(modalidadFilter);

          // Actualizar estado visual de todos los filtros
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

          // Renderizar carreras con el filtro aplicado
          renderCarreras();

          // Navegar a la sección de carreras
          window.location.href = '#carreras';
        });
      });
    });
  })



/* --------------------- Carreras Mas Elegidas ----------------------------- */

const carrerasElegidas = [
  { nombre: "Abogacía", estudiantes: 1200 },
  { nombre: "Contador Público", estudiantes: 950 },
  { nombre: "Ingeniería en Sistemas", estudiantes: 800 },
  { nombre: "Licenciatura en Administración de Empresas", estudiantes: 700 },
]
const container = document.getElementById("carrerasElegidas");


carrerasElegidas.forEach((carrerasElegidas) => {
  const card = document.createElement("div");
  card.className = "bg-black/5 rounded-lg p-3 hover:bg-white/20 transition-colors cursor-pointer";

  card.innerHTML = `
                <div class="flex items-center space-x-3">
                  <div>
                    <div class="text-black font-medium text-sm">${carrerasElegidas.nombre}</div>
                    <div class="text-black text-xs">${carrerasElegidas.estudiantes} estudiantes</div>
                  </div>
                </div>
            `;
  container.appendChild(card);
});

/* ---------------------- Generador de carruseles ---------------------------- */
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

document.addEventListener("DOMContentLoaded", () => {
  // Aca se agregan mas carruseles si se desea, seguir la corriente de lo ya escrito
  const testimonios = [
    {
      title: "Benjamin Elizalde",
      subtitle: "Licenciatura en comercialización",
      text: "La facultad esta siempre a disposición",
      image: "./public/benja.png",
    },
    {
      title: "Ebaneo Valdez Kao.",
      subtitle: "Ingeniería en Informática ",
      text: "Puedo ejercer mi profesión desde cualquier parte del mundo",
      image: "https://placehold.co/60x60",
    },
    {
      title: "Ana Rodríguez",
      subtitle: "Administración",
      text: "Hoy lidero mi empresa gracias a los conocimientos adquiridos.",
      image: "https://placehold.co/60x60",
    },
    {
      title: "Juan Pérez",
      subtitle: "Derecho",
      text: "La mejor decisión de mi vida fue estudiar en UCASAL.",
      image: "https://placehold.co/60x60",
    },
    {
      title: "Lucía Fernández",
      subtitle: "Psicología",
      text: "Los docentes son excelentes y siempre están dispuestos a ayudar.",
      image: "https://placehold.co/60x60",
    }
  ];

  new GenericCarousel({
    items: testimonios,
    selectors: {
      container: "#contenido-testimonial", //ID de donde va a ir.
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

});

/* --------------------- Formulario ------------------------- */
// Script corregido para el formulario
(async () => {
  try {
    const resp = await fetch(
      `../../landing/consultas/getCarrerasJson.php?tipcar=Grado,Pregrado,Intermedio`
    );
    const data = await resp.json();

    // Códigos de carrera que deseas excluir
    let codigosExcluidos = ["191", "46"];
    // Filtrar el arreglo data para excluir los códigos de carrera especificados
    let dataFiltrado = data.filter((carrera) => !codigosExcluidos.includes(carrera.codcar));

    // CORREGIDO: Guardar correctamente en localStorage
    window.localStorage.setItem("CarrerasModGeneral", JSON.stringify(dataFiltrado));

    // 🔄 Vaciar y llenar selects con estado inicial correcto
    $("#cbx_carrera").empty().append('<option value="" disabled selected>Carrera</option>');
    $("#cbx_provincia").empty().append('<option value="" disabled selected>Provincia</option>');
    $("#cbx_sede").empty().append('<option value="" disabled selected>Sede</option>');

    // Las carreras se cargarán solo después de seleccionar modalidad → provincia → sede

    // CORREGIDO: Asegurar que todos los campos estén deshabilitados al inicio
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

      // Establecer tooltips iniciales
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

// Función para mostrar errores en la UI
function mostrarErrorEnLaUI(mensaje) {
  $("#cbx_carrera").empty().append(`<option value="" disabled selected>${mensaje}</option>`);
  $("#cbx_provincia").empty().append(`<option value="" disabled selected>-</option>`);
  $("#cbx_sede").empty().append(`<option value="" disabled selected>-</option>`);

  // Asegurar que estén deshabilitados en caso de error
  document.getElementById('cbx_provincia')?.setAttribute("disabled", "disabled");
  document.getElementById('cbx_sede')?.setAttribute("disabled", "disabled");
  document.getElementById('cbx_carrera')?.setAttribute("disabled", "disabled");
}

// Manejar parámetros URL al cargar la ventana
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

// CORREGIDO: Función para cambiar modalidad
function cambiar_modo() {
  var modo = $("#modo").val();

  if (!modo) {
    // Si no hay modalidad, deshabilitar todos los campos
    resetearFormulario();
    return;
  }

  // Limpiar todos los selects dependientes
  $("#cbx_provincia").empty().append('<option value="" disabled selected>Provincia</option>');
  $("#cbx_sede").empty().append('<option value="" disabled selected>Sede</option>');
  $("#cbx_carrera").empty().append('<option value="" disabled selected>Carrera</option>');

  // Habilitar provincia
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

  // Deshabilitar sede y carrera inicialmente
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

  // Obtener todas las carreras de la modalidad seleccionada
  var carrerasArray = JSON.parse(window.localStorage.getItem("CarrerasModGeneral") || "[]");
  const carrerasMod = carrerasArray.filter(carreras => carreras.modo == modo);

  if (carrerasMod.length > 0) {
    // Obtener provincias únicas de todas las carreras de esta modalidad
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

    // Ordenar provincias alfabéticamente
    listaProvincia.sort((a, b) => a.nombre_provincia.localeCompare(b.nombre_provincia));

    // Cargar provincias en el select
    listaProvincia.forEach(function (provincia) {
      $("#cbx_provincia").append(
        `<option value="${provincia.id_provincia}">${provincia.nombre_provincia}</option>`
      );
    });

    // Si hay una sola provincia, seleccionarla automáticamente
    if (listaProvincia.length === 1) {
      $("#cbx_provincia").val($("#cbx_provincia option:eq(1)").val());
      cargar_sedes();
    }
  }
}

// Función para cargar sedes basada en modalidad y provincia seleccionada
function cargar_sedes() {
  const modo = document.getElementById('modo').value;
  const provincia = document.getElementById('cbx_provincia').value;
  const sedeSelect = document.getElementById('cbx_sede');
  const carreraSelect = document.getElementById('cbx_carrera');

  if (!sedeSelect || !carreraSelect) return;

  const sedeWrapper = sedeSelect.closest('.select-wrapper');

  // Limpiar selects dependientes
  $("#cbx_sede").empty().append('<option value="" disabled selected>Sede</option>');
  $("#cbx_carrera").empty().append('<option value="" disabled selected>Carrera</option>');

  // Deshabilitar carrera inicialmente
  carreraSelect.setAttribute("disabled", "disabled");
  carreraSelect.className = "block w-full px-0 pt-2 pb-1 pl-2 text-sm text-black border border-gray-300 shadow-sm bg-white/80 focus:ring-blue-600 focus:border-blue-600 boton-inactivo-form";

  if (provincia && modo) {
    // Habilitar sede
    sedeSelect.removeAttribute("disabled");
    sedeSelect.className = "block w-full px-0 pt-2 pb-1 pl-2 text-sm text-black border border-gray-300 shadow-sm bg-white/80 focus:ring-blue-600 focus:border-blue-600";

    if (sedeWrapper) {
      sedeWrapper.classList.add('enabled');
      sedeWrapper.setAttribute('data-tooltip', '');
    }

    let carrerasArray = JSON.parse(localStorage.getItem("CarrerasModGeneral") || "[]");
    const carrerasMod = carrerasArray.filter(c => c.modo == modo);

    // Obtener sedes únicas de la provincia seleccionada
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

    // Ordenar sedes alfabéticamente
    listaSedes.sort((a, b) => a.nombre_sede.localeCompare(b.nombre_sede));

    // Cargar sedes en el select
    listaSedes.forEach(function (sede) {
      $("#cbx_sede").append(
        `<option value="${sede.id_sede}">${sede.nombre_sede}</option>`
      );
    });

    // Si hay una sola sede, seleccionarla automáticamente
    if (listaSedes.length === 1) {
      $("#cbx_sede").val($("#cbx_sede option:eq(1)").val());
      cargar_carreras();
    }
  } else {
    // Si no hay provincia seleccionada
    sedeSelect.setAttribute("disabled", "disabled");
    sedeSelect.className = "block w-full px-0 pt-2 pb-1 pl-2 text-sm text-black border border-gray-300 shadow-sm bg-white/80 focus:ring-blue-600 focus:border-blue-600 boton-inactivo-form";

    if (sedeWrapper) {
      sedeWrapper.classList.remove('enabled');
      sedeWrapper.setAttribute('data-tooltip', 'Seleccioná una provincia primero');
    }
  }
}

// Nueva función para cargar carreras basada en modalidad, provincia y sede
function cargar_carreras() {
  const modo = document.getElementById('modo').value;
  const provincia = document.getElementById('cbx_provincia').value;
  const sede = document.getElementById('cbx_sede').value;
  const carreraSelect = document.getElementById('cbx_carrera');

  if (!carreraSelect) return;

  // Limpiar carrera
  $("#cbx_carrera").empty().append('<option value="" disabled selected>Carrera</option>');

  if (sede && provincia && modo) {
    // Habilitar carrera
    carreraSelect.removeAttribute("disabled");
    carreraSelect.className = "block w-full px-0 pt-2 pb-1 pl-2 text-sm text-black border border-gray-300 shadow-sm bg-white/80 focus:ring-blue-600 focus:border-blue-600";

    let carrerasArray = JSON.parse(localStorage.getItem("CarrerasModGeneral") || "[]");

    // Filtrar carreras que coincidan con modalidad, provincia y sede
    const carrerasFiltradas = carrerasArray.filter(carrera => {
      if (carrera.modo != modo) return false;

      if (carrera.provincias) {
        return carrera.provincias.some(prov =>
          prov.id_provincia == provincia && prov.id_sede == sede
        );
      }
      return false;
    });

    // Ordenar carreras alfabéticamente
    carrerasFiltradas.sort((a, b) => a.nombre_carrera.localeCompare(b.nombre_carrera));

    // Cargar carreras en el select
    carrerasFiltradas.forEach(function (carrera) {
      $("#cbx_carrera").append(
        `<option value="${carrera.codcar}">${carrera.nombre_carrera}</option>`
      );
    });

    // Si hay una sola carrera, seleccionarla automáticamente
    if (carrerasFiltradas.length === 1) {
      $("#cbx_carrera").val($("#cbx_carrera option:eq(1)").val());
    }
  } else {
    // Si no hay sede seleccionada
    carreraSelect.setAttribute("disabled", "disabled");
    carreraSelect.className = "block w-full px-0 pt-2 pb-1 pl-2 text-sm text-black border border-gray-300 shadow-sm bg-white/80 focus:ring-blue-600 focus:border-blue-600 boton-inactivo-form";
  }
}

// NUEVA: Función para resetear el formulario al estado inicial
function resetearFormulario() {
  const provinciaElement = document.getElementById('cbx_provincia');
  const sedeElement = document.getElementById('cbx_sede');
  const carreraElement = document.getElementById('cbx_carrera');

  const provinciaWrapper = provinciaElement?.closest('.select-wrapper');
  const sedeWrapper = sedeElement?.closest('.select-wrapper');

  // Limpiar y deshabilitar todos los campos
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

  // Restaurar tooltips iniciales
  if (provinciaWrapper) {
    provinciaWrapper.classList.remove('enabled');
    provinciaWrapper.setAttribute('data-tooltip', 'Seleccioná una modalidad primero');
  }
  if (sedeWrapper) {
    sedeWrapper.classList.remove('enabled');
    sedeWrapper.setAttribute('data-tooltip', 'Seleccioná una modalidad primero');
  }
}

// Inicializar el estado correcto al cargar la página
document.addEventListener('DOMContentLoaded', function () {
  // Esta inicialización ahora se maneja en la función async principal
  // para evitar conflictos de timing
});

// Función para cargar carrera específica (actualizada para el nuevo flujo)
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

  // Buscar la carrera específica
  const carreraSeleccionada = carrerasArray.find(carrera => carrera.codcar == cod);
  if (!carreraSeleccionada) {
    console.error("Career not found:", cod);
    return;
  }

  // Establecer modalidad automáticamente
  $("#modo").val(carreraSeleccionada.modo);
  cambiar_modo();

  // Si la carrera tiene una sola provincia y sede, seleccionarlas automáticamente
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
// Función de scroll suave
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

// CORREGIDO: Función de validación del reCAPTCHA
function reCALLBACK(token) {
  const btn = document.getElementById('formButton');
  if (!token || !btn) return;

  // Verificar si todos los campos requeridos están completos
  const form = document.getElementById('pedidoinfo') || document.querySelector('form');
  if (!form) return;

  const requiredInputs = form.querySelectorAll('input[required], select[required], textarea[required]');
  let allFieldsCompleted = true;

  // Verificar que todos los campos requeridos tengan valor
  requiredInputs.forEach(input => {
    if (!input.value.trim()) {
      allFieldsCompleted = false;
    }
  });

  // Solo habilitar si todos los campos están completos
  if (allFieldsCompleted) {
    btn.removeAttribute("disabled");
    btn.classList.add("boton-activo");
    btn.classList.remove("boton-inactivo-form");
  } else {
    btn.setAttribute("disabled", "disabled");
    btn.classList.remove("boton-activo");
    btn.classList.add("boton-inactivo-form");
  }

  // Guardar el token de reCAPTCHA
  window.recaptchaCompleted = true;
}

// Inicialización del formulario
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('pedidoinfo') || document.querySelector('form');
  if (!form) return;

  const requiredInputs = form.querySelectorAll('input[required], select[required], textarea[required]');
  const btn = document.getElementById('formButton');

  if (btn) {
    // Asegurarse de que el botón comience deshabilitado
    btn.classList.add("boton-inactivo");
    btn.setAttribute("disabled", "disabled");
  }

  // Función para verificar el estado del formulario
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

  // Agregar event listeners a todos los campos requeridos
  requiredInputs.forEach(input => {
    input.addEventListener('input', checkFormCompletion);
    input.addEventListener('change', checkFormCompletion);
    input.addEventListener('blur', checkFormCompletion);
  });
});

// CORREGIDO: Función de validación final
function check() {
  const form = document.getElementById('pedidoinfo') || document.querySelector('form');
  const btn = document.getElementById('formButton');
  const spinnerContainer = document.getElementById("spinnerContainer");

  if (!form || !btn || !spinnerContainer) return false;

  // Verificar la validez del teléfono
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

  // Verificar si el formulario es válido
  if (form.checkValidity()) {
    btn.classList.add("hidden");
    spinnerContainer.classList.remove("hidden");
    return true;
  } else {
    return false;
  }
}

// Función para validar longitud de teléfono
function validarLongitudTelefono(inputTelefono, longitudMaxima) {
  if (!inputTelefono) return;

  var telefono = inputTelefono.value;
  var telefonoLimpio = telefono.replace(/\D/g, '');

  if (telefonoLimpio.length > longitudMaxima) {
    telefonoLimpio = telefonoLimpio.slice(0, longitudMaxima);
  }

  inputTelefono.value = telefonoLimpio;
}

document.addEventListener('DOMContentLoaded', function () {
  fetch('assets/datosLanding.json')
    .then(response => {
      if (!response.ok) throw new Error('No se pudo cargar el JSON');
      return response.json();
    })
    .then(json => {
      const banner = json.banner;
      const videoURL = json.videoURL;
      const elementoVideo = document.getElementById('video');
      const elementoPromocion = document.getElementById('promo');
      const datosTarjeta = json.tarjeta;

      // Actualiza el componente de Tarjeta Macro
      document.getElementById('tarjetaMacro').innerHTML = `
            <img class="w-1/3 p-4 bg-white rounded-2xl" src="${datosTarjeta.macro.imagen}" alt="tarjeta macro">
            <p class="text-md">${datosTarjeta.macro.descripcion}</p>
        `;

      // Actualiza el componente de Tarjeta Naranja
      document.getElementById('tarjetaNaranja').innerHTML = `
            <img class="w-1/3 p-4 bg-white rounded-2xl" src="${datosTarjeta.naranja.imagen}" alt="tarjeta naranja">
            <p class="text-md">${datosTarjeta.naranja.descripcion}</p>
        `;

      // Actualiza el componente de Tarjeta Banco
      document.getElementById('tarjetaBanco').innerHTML = `
            <img class="w-1/3 p-4 bg-white rounded-2xl" src="${datosTarjeta.banco.imagen}" alt="tarjeta banco">
            <p class="text-md">${datosTarjeta.banco.descripcion}</p>
        `;

      let index = 0;

      // Funci�n para obtener la promoci�n activa seg�n la fecha actual
      function obtenerPromocionActiva() {
        const fechaActual = new Date();

        // Buscar la promoci�n que corresponde a la fecha actual
        const promocionActiva = json.promociones_dinamicas.find(promocion => {
          const fechaInicio = new Date(promocion.fecha_inicio);
          const fechaFin = new Date(promocion.fecha_fin);
          return fechaActual >= fechaInicio && fechaActual <= fechaFin;
        });

        // Si no se encuentra una promoci�n activa, usar la promoci�n fallback
        return promocionActiva ? promocionActiva.mensajes : json.promocion_fallback;
      }

      // Obtener los mensajes de la promoci�n activa
      const promociones = obtenerPromocionActiva();

      // Inicializar el contenido de la promoci�n con el primer mensaje
      elementoPromocion.innerHTML = promociones[index];

      // Funci�n para cambiar el texto de la promoci�n cada 3 segundos
      function cambiarTexto() {
        index = (index + 1) % promociones.length;
        elementoPromocion.innerHTML = promociones[index];
      }

      // Iniciar el intervalo para cambiar el texto
      setInterval(cambiarTexto, 2500);

    })
    .catch(error => {
      console.error('Error al cargar las promociones:', error);
      // Mostrar mensaje de fallback en caso de error
      const elementoPromocion = document.getElementById('promo');
      if (elementoPromocion) {
        elementoPromocion.innerHTML = "&#127942;Constru�<span class='text-sm font-extrabold lg:text-lg'>&nbsp;<strong>tu historia</strong></span>";
      }
    });
});