// Admin panel: shows messages stored in localStorage under key 'aciole_messages'
// Each message displays date/time of sending (sentAt)

(function(){
  const container = document.getElementById('messages-container');
  const REFRESH_BTN = document.getElementById('refresh');
  const CLEAR_BTN = document.getElementById('clear-all');

  function loadMessages(){
    const raw = localStorage.getItem('aciole_messages') || '[]';
    let arr = [];
    try { arr = JSON.parse(raw); } catch(e){ arr = []; }
    display(arr);
  }

  function display(arr){
    container.innerHTML = '';
    if (!arr.length) {
      container.innerHTML = '<div class="muted">Nenhuma mensagem registrada.</div>';
      return;
    }

    arr.slice().reverse().forEach(msg => {
      const card = document.createElement('div');
      card.style.background = '#fff';
      card.style.border = '1px solid #eef3f7';
      card.style.padding = '12px';
      card.style.borderRadius = '8px';
      card.style.marginBottom = '10px';

      const dt = new Date(msg.sentAt);
      const dtStr = isNaN(dt) ? 'Data desconhecida' : dt.toLocaleString('pt-BR', {dateStyle:'short', timeStyle:'short'});

      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center">
          <strong>${escapeHtml(msg.name || '(sem nome)')}</strong>
          <small class="muted">${dtStr}</small>
        </div>
        <div style="color:var(--muted);margin-top:6px">
          <div><strong>Email:</strong> ${escapeHtml(msg.email || '-')}</div>
          <div><strong>Telefone:</strong> ${escapeHtml(msg.phone || '-')}</div>
          <div><strong>Tipo de sessão:</strong> ${escapeHtml(msg.sessionType || '-')} ${msg.season ? ' / ' + escapeHtml(msg.season) : ''}</div>
          <div><strong>Plano:</strong> ${escapeHtml(msg.plan || '-')}</div>
          <div><strong>Data pretendida:</strong> ${escapeHtml(msg.date || '-')}</div>
        </div>
        <div style="margin-top:8px"><strong>Mensagem:</strong><div style="margin-top:6px">${nl2br(escapeHtml(msg.message || ''))}</div></div>
        <div style="margin-top:10px;display:flex;gap:8px">
          <button class="btn reply" data-id="${msg.id}">Marcar respondido</button>
          <button class="btn delete" data-id="${msg.id}" style="background:#fff;color:#c0392b">Apagar</button>
        </div>
      `;

      container.appendChild(card);
    });

    // bind actions
    container.querySelectorAll('.delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        if (!confirm('Apagar essa mensagem?')) return;
        deleteMessage(id);
      });
    });

    container.querySelectorAll('.reply').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.target.textContent = 'Respondido';
        e.target.disabled = true;
      });
    });
  }

  function deleteMessage(id){
    const raw = localStorage.getItem('aciole_messages') || '[]';
    let arr = JSON.parse(raw);
    arr = arr.filter(m => String(m.id) !== String(id));
    localStorage.setItem('aciole_messages', JSON.stringify(arr));
    loadMessages();
  }

  function clearAll(){
    if (!confirm('Apagar TODAS as mensagens?')) return;
    localStorage.removeItem('aciole_messages');
    loadMessages();
  }

  REFRESH_BTN.addEventListener('click', loadMessages);
  CLEAR_BTN.addEventListener('click', clearAll);

  function escapeHtml(s){
    return String(s).replace(/[&<>"'`]/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;'
    })[c]);
  }
  function nl2br(s){ return s.replace(/\n/g, '<br/>'); }

  // initial
  loadMessages();
})();
