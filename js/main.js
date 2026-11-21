/* =========================================
   1. МОБИЛЬНОЕ МЕНЮ (бургер)
   Состояние хранится в aria-expanded — его же читает скринридер,
   и по нему CSS рисует крестик.
   ========================================= */
const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.getElementById('site-nav');
// та же граница, что в responsive.css: с 768px меню уже в строку
const tabletQuery = window.matchMedia('(min-width: 768px)');

function setMenuOpen(isOpen) {
  navToggle.setAttribute('aria-expanded', String(isOpen));
  siteNav.classList.toggle('site-nav--open', isOpen);
}

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    setMenuOpen(!isOpen);
  });

  // Esc закрывает меню и возвращает фокус на кнопку
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && siteNav.classList.contains('site-nav--open')) {
      setMenuOpen(false);
      navToggle.focus();
    }
  });

  // клик мимо меню — закрываем
  document.addEventListener('click', (event) => {
    if (!siteNav.contains(event.target) && !navToggle.contains(event.target)) {
      setMenuOpen(false);
    }
  });

  // повернули планшет / растянули окно — сбрасываем открытое меню
  tabletQuery.addEventListener('change', () => setMenuOpen(false));
}


/* =========================================
   2. КАТАЛОГ: ПОКАЗ ФИЛЬТРОВ И ФИЛЬТРАЦИЯ
   ========================================= */
const filtersBlock = document.querySelector('.filters');
const filtersToggle = document.querySelector('.filters__toggle');
const filtersForm = document.getElementById('filters-panel');
const productCards = document.querySelectorAll('.catalog__products .product-card');
const catalogCount = document.getElementById('catalog-count');
const catalogEmpty = document.getElementById('catalog-empty');

// кнопка «Показать / Скрыть» на телефоне и планшете
if (filtersToggle) {
  filtersToggle.addEventListener('click', () => {
    const isOpen = filtersToggle.getAttribute('aria-expanded') === 'true';
    filtersToggle.setAttribute('aria-expanded', String(!isOpen));
    filtersToggle.textContent = isOpen ? 'Показать' : 'Скрыть';
    filtersBlock.classList.toggle('filters--open', !isOpen);
  });
}

function applyFilters() {
  // какие категории отмечены
  const checkedCategories = Array.from(
    filtersForm.querySelectorAll('[name="category"]:checked'),
    (input) => input.value,
  );
  const onlyInStock = filtersForm.querySelector('[name="stock"]').checked;
  let visibleCount = 0;

  productCards.forEach((card) => {
    const cardCategories = card.dataset.category.split(' ');
    // если ни одна категория не отмечена — подходят все
    const matchesCategory = checkedCategories.length === 0
      || checkedCategories.some((category) => cardCategories.includes(category));
    const matchesStock = !onlyInStock || card.dataset.stock === 'yes';
    const isVisible = matchesCategory && matchesStock;

    card.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });

  catalogCount.textContent = `Найдено камней: ${visibleCount}`;
  catalogEmpty.hidden = visibleCount > 0;
}

if (filtersForm) {
  filtersForm.addEventListener('change', applyFilters);
  // reset срабатывает ДО очистки чекбоксов, поэтому пересчитываем на следующем шаге
  filtersForm.addEventListener('reset', () => setTimeout(applyFilters));
  applyFilters();
}


/* =========================================
   3. МОДАЛЬНОЕ ОКНО ЗАЯВКИ (главная)
   showModal() сам держит фокус внутри окна и закрывает его по Esc.
   ========================================= */
const orderDialog = document.getElementById('order-dialog');
const orderButtons = document.querySelectorAll('.product-card__button');
const closeDialogButton = document.getElementById('close-order-dialog');
const selectedProductInput = document.getElementById('selected-product');
let lastTrigger = null;

if (orderDialog) {
  orderButtons.forEach((button) => {
    button.addEventListener('click', () => {
      lastTrigger = button;
      selectedProductInput.value = button.dataset.product;
      orderDialog.showModal();
    });
  });

  closeDialogButton.addEventListener('click', () => {
    orderDialog.close();
  });

  // клик по затемнённому фону: событие приходит на сам dialog, но мимо его рамки
  orderDialog.addEventListener('click', (event) => {
    if (event.target !== orderDialog) return;
    const rect = orderDialog.getBoundingClientRect();
    const isInside = event.clientX >= rect.left && event.clientX <= rect.right
      && event.clientY >= rect.top && event.clientY <= rect.bottom;
    if (!isInside) orderDialog.close();
  });

  // окно закрылось любым способом — возвращаем фокус на кнопку «Заказать»
  orderDialog.addEventListener('close', () => {
    lastTrigger?.focus();
  });
}


/* =========================================
   4. ФОРМЫ: заявка, модальное окно, обратная связь
   ========================================= */
const forms = document.querySelectorAll('.order-form');
const successMessage = document.getElementById('success-message');

forms.forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const fields = Array.from(form.elements);
    fields.forEach((field) => field.removeAttribute('aria-invalid'));

    if (!form.checkValidity()) {
      // aria-invalid красит поле (CSS) и сообщает скринридеру об ошибке
      fields.forEach((field) => {
        if (field.willValidate && !field.checkValidity()) {
          field.setAttribute('aria-invalid', 'true');
        }
      });
      form.reportValidity();
      return;
    }

    successMessage.hidden = false;
    form.reset();
    form.closest('dialog')?.close();

    setTimeout(() => {
      successMessage.hidden = true;
    }, 4000);
  });

  // поле исправили — снимаем красную подсветку сразу, не дожидаясь отправки
  form.addEventListener('input', (event) => {
    if (event.target.checkValidity?.()) {
      event.target.removeAttribute('aria-invalid');
    }
  });

  form.addEventListener('reset', () => {
    Array.from(form.elements).forEach((field) => field.removeAttribute('aria-invalid'));
  });
});
