/* --------------------- Enhanced GenericCarousel con soporte SVG ----------------------------- */
class EnhancedGenericCarousel {
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

      // Manejar imagen/SVG con detección automática
      if (this.elements.image && item.image) {
        // Detectar si es SVG inline (comienza con <svg)
        if (typeof item.image === 'string' && item.image.trim().startsWith('<svg')) {
          // Es SVG inline, usar innerHTML
          this.elements.image.innerHTML = item.image;
          // Limpiar atributos de imagen si existen
          this.elements.image.removeAttribute('src');
          this.elements.image.removeAttribute('alt');
        } else {
          // Es una URL de imagen, usar src
          this.elements.image.innerHTML = ''; // Limpiar SVG previo
          this.elements.image.src = item.image;
          this.elements.image.alt = item.alt || '';
        }
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