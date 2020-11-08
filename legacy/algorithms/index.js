[...document.querySelectorAll('h1')].forEach((elt, h1Index) => {
  elt.addEventListener('click', () => {
    [...document.querySelectorAll('form')].forEach((form, formIndex) => {
      if (h1Index === formIndex) {
        if ([...form.classList].includes('opened')) {
          form.classList.remove('opened');
        } else {
          form.classList.add('opened');
        }
      } else {
        form.classList.remove('opened');
      }
    })
  })
});
