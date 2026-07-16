const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const navigation = document.querySelector('[data-nav]');
const filterButtons = [...document.querySelectorAll('[data-filter]')];
const courseCards = [...document.querySelectorAll('[data-category]')];
const courseLinks = [...document.querySelectorAll('[data-course-link]')];
const filterEmpty = document.querySelector('[data-filter-empty]');
const trialForm = document.querySelector('[data-trial-form]');
const formStatus = document.querySelector('[data-form-status]');
const yearNode = document.querySelector('[data-year]');

const closeMenu = () => {
  if (!menuToggle || !navigation) return;
  menuToggle.classList.remove('is-active');
  navigation.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Открыть меню');
  document.body.classList.remove('menu-open');
};

const updateHeader = () => {
  header?.classList.toggle('is-scrolled', window.scrollY > 18);
};

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

menuToggle?.addEventListener('click', () => {
  const isOpen = !navigation?.classList.contains('is-open');
  menuToggle.classList.toggle('is-active', isOpen);
  navigation?.classList.toggle('is-open', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
  document.body.classList.toggle('menu-open', isOpen);
});

navigation?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', closeMenu);
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 860) closeMenu();
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const selected = button.dataset.filter;
    let visibleCards = 0;

    filterButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-pressed', String(isActive));
    });

    courseCards.forEach((card) => {
      const isVisible = selected === 'all' || card.dataset.category === selected;
      card.hidden = !isVisible;
      if (isVisible) visibleCards += 1;
    });

    if (filterEmpty) filterEmpty.hidden = visibleCards > 0;
  });
});

courseLinks.forEach((link) => {
  link.addEventListener('click', () => {
    const courseSelect = trialForm?.elements.course;
    if (!courseSelect) return;
    const matchingOption = [...courseSelect.options].find(
      (option) => option.text === link.dataset.courseLink,
    );
    if (matchingOption) courseSelect.value = matchingOption.value;
  });
});

document.querySelectorAll('.faq-list details').forEach((item) => {
  item.addEventListener('toggle', () => {
    if (!item.open) return;
    document.querySelectorAll('.faq-list details').forEach((otherItem) => {
      if (otherItem !== item) otherItem.open = false;
    });
  });
});

const phoneInput = trialForm?.elements.phone;

phoneInput?.addEventListener('input', () => {
  let digits = phoneInput.value.replace(/\D/g, '');
  if (digits.startsWith('8')) digits = `7${digits.slice(1)}`;
  if (!digits.startsWith('7')) digits = `7${digits}`;
  digits = digits.slice(0, 11);

  const parts = [];
  if (digits.length > 0) parts.push('+7');
  if (digits.length > 1) parts.push(` (${digits.slice(1, 4)}`);
  if (digits.length >= 4) parts.push(')');
  if (digits.length > 4) parts.push(` ${digits.slice(4, 7)}`);
  if (digits.length > 7) parts.push(`-${digits.slice(7, 9)}`);
  if (digits.length > 9) parts.push(`-${digits.slice(9, 11)}`);
  phoneInput.value = parts.join('');
});

const setFieldError = (field, message = '') => {
  field.classList.toggle('is-invalid', Boolean(message));
  field.setAttribute('aria-invalid', String(Boolean(message)));
  const error = field.parentElement?.querySelector('.field-error');
  if (error) error.textContent = message;
};

const validateForm = () => {
  const nameInput = trialForm.elements.parentName;
  const courseSelect = trialForm.elements.course;
  const consent = trialForm.elements.consent;
  const phoneDigits = phoneInput.value.replace(/\D/g, '');
  let isValid = true;

  if (nameInput.value.trim().length < 2) {
    setFieldError(nameInput, 'Введите имя');
    isValid = false;
  } else {
    setFieldError(nameInput);
  }

  if (phoneDigits.length !== 11) {
    setFieldError(phoneInput, 'Введите полный номер телефона');
    isValid = false;
  } else {
    setFieldError(phoneInput);
  }

  if (!courseSelect.value) {
    setFieldError(courseSelect, 'Выберите направление');
    isValid = false;
  } else {
    setFieldError(courseSelect);
  }

  consent.closest('.consent')?.classList.toggle('is-invalid', !consent.checked);
  if (!consent.checked) isValid = false;

  return isValid;
};

trialForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  formStatus.textContent = '';

  if (!validateForm()) return;

  const name = trialForm.elements.parentName.value.trim();
  formStatus.textContent = `${name}, форма заполнена. В учебной версии данные не отправляются — для записи позвоните в Robo Top.`;
  trialForm.querySelector('button[type="submit"]').textContent = 'Форма заполнена ✓';
});

trialForm?.querySelectorAll('input, select').forEach((field) => {
  field.addEventListener('change', () => {
    if (field.type === 'checkbox') {
      field.closest('.consent')?.classList.remove('is-invalid');
    } else if (field.value.trim()) {
      setFieldError(field);
    }
  });
});

if (yearNode) yearNode.textContent = new Date().getFullYear();

const revealItems = document.querySelectorAll('.reveal');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reduceMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -35px' },
  );

  revealItems.forEach((item) => observer.observe(item));
}
