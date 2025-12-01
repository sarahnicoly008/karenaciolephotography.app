// App interactions: gallery filters, booking handling, plan selection, localStorage messages
(function(){
  // Helpers
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  // Year in footer
  document.getElementById('year').textContent = new Date().getFullYear();

  // Gallery filters
  const filterButtons = $$('.filters button');
  const galleryItems = $$('.gallery-item');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      if (f === 'all') {
        galleryItems.forEach(i => i.style.display = '');
      } else if (f === 'seasonal') {
        // show items that have seasonal- classes
        galleryItems.forEach(i => {
          const t = i.dataset.type || '';
          i.style.display = /seasonal-/.test(t) ? '' : 'none';
        });
      } else {
        galleryItems.forEach(i => {
          const t = i.dataset.type || '';
          i.style.display = t.includes(f) ? '' : 'none';
        });
      }
    });
  });

  // Booking form behavior
  const sessionTypeEl = $('#session-type');
  const seasonEl = $('#season');
  const seasonNoteEl = $('#season-note');
  const bookingForm = $('#booking-form');
  const formStatus = $('#form-status');

  function updateSeasonOptions(){
    const val = sessionTypeEl.value;
    // For weddings in the USA only allow Spring, Fall, Winter as options (per request)
    const seasonOptions = {
      Wedding: ['spring','fall','winter'],
      'Smash the Cake': ['spring','summer','fall','winter'],
      Boudoir: [''],
      Thematic: ['spring','summer','fall','winter'],
      Portrait: ['spring','summer','fall','winter']
    };

    if (val === 'Wedding') {
      // show note and adjust selection choices
      seasonNoteEl.textContent = 'Para casamentos (EUA) oferecemos sessões apenas nas épocas: Primavera, Outono e Inverno.';
      // enforce season dropdown: hide summer option (we'll disable it)
      Array.from(seasonEl.options).forEach(opt => {
        if (opt.value === 'summer') opt.style.display = 'none';
        else opt.style.display = '';
      });
      // If currently selecting summer, clear it
      if (seasonEl.value === 'summer') seasonEl.value = '';
    } else {
      seasonNoteEl.textContent = '';
      Array.from(seasonEl.options).forEach(opt => opt.style.display = '');
    }
  }

  sessionTypeEl.addEventListener('change', updateSeasonOptions);

  // Plan selection buttons wire to booking form select
  $$('.select-plan').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = btn.dataset.plan;
      $('#plan').value = p;
      // scroll to form
      document.getElementById('agendamento').scrollIntoView({behavior:'smooth'});
    });
  });

  // Manage messages saved in localStorage (used by admin panel)
  function saveMessage(payload){
    const key = 'aciole_messages';
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push(payload);
    localStorage.setItem(key, JSON.stringify(existing));
  }

  bookingForm.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const data = {
      id: Date.now(),
      name: $('#name').value.trim(),
      email: $('#email').value.trim(),
      phone: $('#phone').value.trim(),
      sessionType: $('#session-type').value,
      season: $('#season').value,
      plan: $('#plan').value,
      date: $('#date').value,
      message: $('#message').value.trim(),
      sentAt: new Date().toISOString()
    };

    // Basic validation
    if (!data.name || !data.email || !data.sessionType) {
      formStatus.textContent = 'Por favor preencha nome, email e tipo de sessão.';
      return;
    }

    // Special warning for wedding booking window
    if (data.sessionType === 'Wedding' && data.date) {
      const requested = new Date(data.date);
      const now = new Date();
      const monthsAway = (requested.getFullYear() - now.getFullYear()) * 12 + (requested.getMonth() - now.getMonth());
      if (monthsAway < 3) {
        // warn but allow
        if (!confirm('Atenção: para casamentos recomendamos agendar entre 3 e 12 meses antes. Deseja continuar mesmo assim?')) {
          return;
        }
      }
    }

    // persist message
    saveMessage(data);

    // UX feedback
    formStatus.textContent = 'Pedido enviado! Entraremos em contato em breve.';
    bookingForm.reset();

    // For demo: open gallery or highlight
    setTimeout(()=>{ formStatus.textContent = ''; }, 6000);
  });

  // Initial update
  updateSeasonOptions();

  // Make gallery images clickable to open a simple lightbox
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const caption = item.querySelector('figcaption').textContent;
      const thumb = item.querySelector('.thumb').textContent;
      openLightbox(thumb + ' — ' + caption);
    });
  });

  function openLightbox(text){
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = 0;
    overlay.style.background = 'rgba(0,0,0,0.6)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = 9999;

    const card = document.createElement('div');
    card.style.background = '#fff';
    card.style.padding = '20px';
    card.style.borderRadius = '12px';
    card.style.maxWidth = '90%';
    card.style.boxShadow = '0 10px 40px rgba(10,20,30,0.2)';
    card.innerHTML = `<strong style="display:block;margin-bottom:10px">${text}</strong>
      <button id="close-lightbox" class="btn">Fechar</button>`;

    overlay.appendChild(card);
    document.body.appendChild(overlay);
    $('#close-lightbox').focus();

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) document.body.removeChild(overlay);
    });
    $('#close-lightbox').addEventListener('click', ()=>document.body.removeChild(overlay));
  }

})();
