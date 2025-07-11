/* --------------------- Filtros y carreras ----------------------------- */
const careers = [
  {
    codcar: 16,
    name: "Abogacía",
    description: "Formación integral en derecho para el ejercicio de la profesión.",
    modality: ["presencial", "distancia"],
    duration: "4 años",
    popular: true,
    featured: false,
    category: "Ciencias Sociales y Humanidades",
    image: "https://placehold.co/60x60",
  },
  {
    codcar: 14,
    name: "Contador Público",
    description: "Capacitación en contabilidad, finanzas e impuestos.",
    modality: ["presencial"],
    duration: "4 años",
    popular: true,
    featured: true,
    category: "Ciencias Económicas",
    image: "https://placehold.co/60x60",
  },
  {
    codcar: 96,
    name: "Ingeniería en Informatica",
    description: "Desarrollo de software y gestión de sistemas informáticos.",
    modality: ["distancia"],
    duration: "4 años",
    popular: true,
    featured: true,
    category: "Ingeniería y Tecnología",
    image: "https://placehold.co/60x60",
  },
  {
    codcar: 11,
    name: "Licenciatura en Administración de Empresas",
    description: "Gestión y dirección estratégica de organizaciones.",
    modality: ["presencial", "distancia"],
    duration: "4 años",
    popular: true,
    featured: false,
    category: "Ciencias Económicas",
    image: "https://placehold.co/60x60",
  },
  {
    codcar: 123,
    name: "Ciencias Veterinarias",
    description: "Formación médica integral para la atención de la salud.",
    modality: ["presencial"],
    duration: "4 años",
    popular: false,
    featured: true,
    category: "Ciencias de la Salud",
    image: "https://placehold.co/60x60",
  },
]

const filtros = [
  { id: "popular", name: "Más Populares", filter: career => career.popular },
  { id: "featured", name: "Destacadas", filter: career => career.featured },
  { id: "presencial", name: "Presencial", filter: career => career.modality.includes("presencial") },
  { id: "distancia", name: "A Distancia", filter: career => career.modality.includes("distancia") },
];

const containerCarreras = document.getElementById("listaCarreras");
const containerFiltros = document.getElementById("filtros");
const searchInput = document.getElementById("search-bar");
const containerFiltrosArea = document.getElementById("filtros-categoria");

const filtrosArea = ["ingeniería", "tecnología", "economicas", "salud", "sociales"]

let textoBusqueda = "";
let filtroActivo = null;

// Cambiar la variable global de filtro activo a un array
filtrosActivos = [];

function filtrosRender() {
  containerFiltros.innerHTML = filtros.map(filter => `
  <button class="filtro-btn cursor-pointer flex items-center space-x-2 px-4 py-2 rounded-[8px] bg-gray-400 hover:bg-[#D6001C] hover:text-white transition-colors md:text-base text-xs" 
    data-filter="${filter.id}">
    <span>${filter.name}</span>
  </button>
`).join('');

  containerFiltrosArea.innerHTML = filtrosArea.map(filter => `
  <button class="filtro-btn cursor-pointer flex items-center space-x-2 px-4 py-2 rounded-[8px] bg-gray-400 hover:bg-[#D6001C] hover:text-white transition-colors md:text-base text-xs" 
    data-filter="${filter}">
    <span>${filter.charAt(0).toUpperCase() + filter.slice(1)}</span>
  </button>
`).join('');

  // Event listeners para filtros principales
  const botones = containerFiltros.querySelectorAll(".filtro-btn");
  botones.forEach(button => {
    button.addEventListener("click", (e) => {
      const selectedFilter = e.currentTarget.dataset.filter;

      if (filtrosActivos.includes(selectedFilter)) {
        // Si ya está activo, lo removemos del array
        filtrosActivos = filtrosActivos.filter(filtro => filtro !== selectedFilter);
        // Cambiar el botón a estado inactivo
        e.currentTarget.classList.remove("bg-[#D6001C]", "text-white");
        e.currentTarget.classList.add("bg-gray-400");
      } else {
        // Si no está activo, lo agregamos al array
        filtrosActivos.push(selectedFilter);
        // Cambiar el botón a estado activo
        e.currentTarget.classList.remove("bg-gray-400");
        e.currentTarget.classList.add("bg-[#D6001C]", "text-white");
      }

      renderCarreras();
    });
  });

  // Event listeners para filtros de área
  const botonesArea = containerFiltrosArea.querySelectorAll(".filtro-btn");
  botonesArea.forEach(button => {
    button.addEventListener("click", (e) => {
      const selectedFilter = e.currentTarget.dataset.filter;

      if (filtrosActivos.includes(selectedFilter)) {
        // Si ya está activo, lo removemos del array
        filtrosActivos = filtrosActivos.filter(filtro => filtro !== selectedFilter);
        // Cambiar el botón a estado inactivo
        e.currentTarget.classList.remove("bg-[#D6001C]", "text-white");
        e.currentTarget.classList.add("bg-gray-400");
      } else {
        // Si no está activo, lo agregamos al array
        filtrosActivos.push(selectedFilter);
        // Cambiar el botón a estado activo
        e.currentTarget.classList.remove("bg-gray-400");
        e.currentTarget.classList.add("bg-[#D6001C]", "text-white");
      }

      renderCarreras();
    });
  });

  // Restaurar estado visual de filtros activos al inicio
  filtrosActivos.forEach(filtroId => {
    const activeBtn = containerFiltros.querySelector(`[data-filter="${filtroId}"]`);
    const activeBtnArea = containerFiltrosArea.querySelector(`[data-filter="${filtroId}"]`);

    if (activeBtn) {
      activeBtn.classList.remove("bg-gray-400");
      activeBtn.classList.add("bg-[#D6001C]", "text-white");
    }

    if (activeBtnArea) {
      activeBtnArea.classList.remove("bg-gray-400");
      activeBtnArea.classList.add("bg-[#D6001C]", "text-white");
    }
  });
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

  // Aplicar filtros múltiples - TODOS deben cumplirse
  if (filtrosActivos.length > 0) {
    carrerasFiltradas = carrerasFiltradas.filter(career => {
      // La carrera debe cumplir TODOS los filtros activos
      return filtrosActivos.every(filtroId => {
        // Verificar si es un filtro principal
        const filtro = filtros.find(f => f.id === filtroId);
        if (filtro) {
          return filtro.filter(career);
        }

        // Verificar si es un filtro de área (coincide con category)
        if (filtrosArea.includes(filtroId)) {
          return career.category.toLowerCase().includes(filtroId.toLowerCase()) ||
            filtroId.toLowerCase().includes(career.category.toLowerCase());
        }
        return false;
      });
    });
  }

  // Renderizado visual
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
            <span class="text-xs sm:text-sm font-semibold px-1">${career.modality.map(mod => mod.charAt(0).toUpperCase() + mod.slice(1)).join(' y ')}</span>
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
searchInput.addEventListener("input", (e) => {
  textoBusqueda = e.target.value;
  renderCarreras();
});

filtrosRender();
renderCarreras();

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
  card.className = "bg-black/10 rounded-lg p-3 hover:bg-white/20 transition-colors cursor-pointer";

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
/* --------------------- Modalidad ----------------------------- */
const modalidades = [
  { id: "presencial", nombre: "Presencial", descripcion: "Desc", imagen: "https://placehold.co/60x60", caracteristicas: [1, 2, 3, 4, 5] },
  { id: "distancia", nombre: "Digital", descripcion: "Desc", imagen: "https://placehold.co/60x60", caracteristicas: [1, 2, 3, 4, 5] },
]
const containerModalidades = document.getElementById("modalidades");

modalidades.forEach((modalidades) => {
  const modalidadDiv = document.createElement("div");
  modalidadDiv.classList.add("rounded-[8px]", "border", "border-gray-500/50", "bg-white/70", "shadow-lg", "text-left");
  modalidadDiv.innerHTML = `
          <div class="grid md:grid-cols-5 grid-cols-3 md:p-4 p-2">
              <img src="${modalidades.imagen}" alt="${modalidades.nombre}" class="col-start-1 w-16 h-16 object-contain">
              <div class="md:col-span-4 col-span-3">
                  <h2 class="text-2xl font-bold">${modalidades.nombre}</h2>
                  <p class="text-base mb-2">${modalidades.descripcion}</p>
                  <h3 class="text-gray-600">Caracteristicas de la modalidad</h3>
                  <ul class="list-disc pl-5 md:pl-8">
                      ${modalidades.caracteristicas.map(caracteristica => `<li>${caracteristica}</li>`).join('')}
                  </ul>
              </div>
          </div>
          <div class="flex justify-center w-full mb-2 border-t-1 p-2">
              <button class="boton-cta modalidad-filter-btn text-xs md:text-base" data-filter="${modalidades.id}">Buscar carreras de modalidad ${modalidades.nombre}</button>
          </div>
        `;
  containerModalidades.appendChild(modalidadDiv);
});

// Event listeners para los botones de modalidades
document.addEventListener('DOMContentLoaded', function () {
  const botonesModalidad = document.querySelectorAll('.modalidad-filter-btn');

  botonesModalidad.forEach(button => {
    button.addEventListener('click', function (e) {
      const modalidadFilter = e.currentTarget.dataset.filter;

      // Limpiar filtros activos anteriores
      filtrosActivos = [];

      // Agregar el filtro de modalidad
      filtrosActivos.push(modalidadFilter);

      // Actualizar estado visual de todos los filtros
      actualizarEstadoVisualFiltros();

      // Renderizar carreras con el filtro aplicado
      renderCarreras();

      // Navegar a la sección de carreras
      window.location.href = '#listaCarreras';
    });
  });
});
function actualizarEstadoVisualFiltros() {
  const botonesFiltros = containerFiltros.querySelectorAll(".filtro-btn");
  botonesFiltros.forEach(btn => {
    btn.classList.remove("bg-[#D6001C]", "text-white");
    btn.classList.add("bg-gray-400");
  });

  const botonesFiltrosArea = containerFiltrosArea.querySelectorAll(".filtro-btn");
  botonesFiltrosArea.forEach(btn => {
    btn.classList.remove("bg-[#D6001C]", "text-white");
    btn.classList.add("bg-gray-400");
  });

  filtrosActivos.forEach(filtroId => {
    const activeBtn = containerFiltros.querySelector(`[data-filter="${filtroId}"]`);
    const activeBtnArea = containerFiltrosArea.querySelector(`[data-filter="${filtroId}"]`);

    if (activeBtn) {
      activeBtn.classList.remove("bg-gray-400");
      activeBtn.classList.add("bg-[#D6001C]", "text-white");
    }

    if (activeBtnArea) {
      activeBtnArea.classList.remove("bg-gray-400");
      activeBtnArea.classList.add("bg-[#D6001C]", "text-white");
    }
  });
}
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
  // Agregar mas sliders asi, y poner los items correspondientes
  const testimonios = [
    {
      title: "María González",
      subtitle: "Ingeniería en Sistemas",
      text: "UCASAL me dio las herramientas para conseguir mi trabajo soñado.",
      image: "https://placehold.co/60x60",
    },
    {
      title: "Carlos Mendoza",
      subtitle: "Medicina",
      text: "La formación integral fue clave en mi desarrollo.",
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

});
