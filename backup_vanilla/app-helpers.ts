// Helper methods for App class
export function setupTabListeners(app: any) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = (e.currentTarget as HTMLElement).dataset.tab!;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      (e.currentTarget as HTMLElement).classList.add('active');
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      document.getElementById(`${tab}-tab`)?.classList.add('active');
      if (tab === 'notes') {
        showNotesList(app);
        renderNotesList(app);
      } else {
        showChatView(app);
      }
    });
  });
}

export function setupNotesListeners(app: any) {
  const newNoteBtn = document.getElementById('new-note-btn');
  const saveNoteBtn = document.getElementById('save-note-btn');
  const deleteNoteBtn = document.getElementById('delete-note-btn');
  const backToListBtn = document.getElementById('back-to-list');
  const classFilter = document.getElementById('class-filter') as HTMLSelectElement;
  const categoryFilter = document.getElementById('category-filter') as HTMLSelectElement;

  if (newNoteBtn) newNoteBtn.addEventListener('click', () => {
    app.currentNoteId = null;
    app.currentAudioBlob = null;
    clearNoteForm();
    showNoteEditor(app);
  });

  if (saveNoteBtn) saveNoteBtn.addEventListener('click', () => saveNote(app));
  if (deleteNoteBtn) deleteNoteBtn.addEventListener('click', () => deleteNote(app));
  if (backToListBtn) backToListBtn.addEventListener('click', () => showNotesList(app));
  if (classFilter) classFilter.addEventListener('change', () => renderNotesList(app));
  if (categoryFilter) categoryFilter.addEventListener('click', () => renderNotesList(app));
}

export function setupNoteAudioListeners(app: any) {
  const recordBtn = document.getElementById('record-note-audio-btn');
  const playBtn = document.getElementById('play-note-audio-btn');
  const deleteAudioBtn = document.getElementById('delete-note-audio-btn');
  const recordText = document.getElementById('record-note-text');

  if (recordBtn) recordBtn.addEventListener('click', async () => {
    if (app.audioService.getIsRecording()) {
      try {
        app.currentAudioBlob = await app.audioService.stopAudioRecording();
        recordBtn.classList.remove('recording');
        if (recordText) recordText.textContent = 'Grabar Audio';
        showAudioPlayer();
      } catch (error) {
        alert('Error al detener grabación');
      }
    } else {
      try {
        await app.audioService.startAudioRecording();
        recordBtn.classList.add('recording');
        if (recordText) recordText.textContent = 'Detener';
      } catch (error) {
        alert('Error al iniciar grabación');
      }
    }
  });

  if (playBtn) playBtn.addEventListener('click', () => {
    if (app.currentAudioBlob) app.audioService.playAudioBlob(app.currentAudioBlob);
  });

  if (deleteAudioBtn) deleteAudioBtn.addEventListener('click', () => {
    app.currentAudioBlob = null;
    hideAudioPlayer();
  });
}

export function setupFileUpload(app: any) {
  const attachBtn = document.getElementById('attach-btn');
  const fileInput = document.getElementById('file-input') as HTMLInputElement;

  if (attachBtn) attachBtn.addEventListener('click', () => fileInput?.click());
  if (fileInput) fileInput.addEventListener('change', () => {
    const files = Array.from(fileInput.files || []);
    app.chatService.setUploadedFiles(files);
    renderFilePreview(app, files);
  });
}

function showChatView(app: any) {
  document.getElementById('chat-view')?.classList.add('active');
  document.getElementById('note-view')?.classList.remove('active');
}

function showNotesList(app: any) {
  showChatView(app);
  updateClassFilter(app);
}

function showNoteEditor(app: any) {
  document.getElementById('chat-view')?.classList.remove('active');
  document.getElementById('note-view')?.classList.add('active');
  const deleteBtn = document.getElementById('delete-note-btn');
  if (deleteBtn) deleteBtn.style.display = app.currentNoteId ? 'block' : 'none';
}

function renderNotesList(app: any) {
  const container = document.getElementById('notes-list');
  if (!container) return;
  const classFilter = (document.getElementById('class-filter') as HTMLSelectElement)?.value || 'all';
  const categoryFilter = (document.getElementById('category-filter') as HTMLSelectElement)?.value || 'all';
  let notes = app.notesService.getNotes();
  if (classFilter !== 'all') notes = notes.filter((n: any) => n.className === classFilter);
  if (categoryFilter !== 'all') notes = notes.filter((n: any) => n.category === categoryFilter);
  if (notes.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No hay apuntes</p></div>';
    return;
  }
  container.innerHTML = notes.map((note: any) => `
    <div class="note-item" data-id="${note.id}">
      <div class="note-item-header">
        <div class="note-item-title">${note.title}</div>
        <div class="note-item-class">${note.className}</div>
      </div>
      <div class="note-item-professor">${note.professor.name}</div>
    </div>
  `).join('');
  container.querySelectorAll('.note-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = (item as HTMLElement).dataset.id!;
      editNote(app, id);
    });
  });
}

function updateClassFilter(app: any) {
  const select = document.getElementById('class-filter') as HTMLSelectElement;
  if (!select) return;
  const classes = app.notesService.getClasses();
  select.innerHTML = '<option value="all">Todas las clases</option>';
  classes.forEach((className: string) => {
    const option = document.createElement('option');
    option.value = className;
    option.textContent = className;
    select.appendChild(option);
  });
}

function clearNoteForm() {
  (document.getElementById('note-title') as HTMLInputElement).value = '';
  (document.getElementById('note-class') as HTMLInputElement).value = '';
  (document.getElementById('prof-name') as HTMLInputElement).value = '';
  (document.getElementById('prof-phone') as HTMLInputElement).value = '';
  (document.getElementById('prof-email') as HTMLInputElement).value = '';
  (document.getElementById('note-cat') as HTMLSelectElement).value = 'general';
  (document.getElementById('note-content') as HTMLTextAreaElement).value = '';
  hideAudioPlayer();
}

async function editNote(app: any, id: string) {
  const note = app.notesService.getNoteById(id);
  if (!note) return;
  app.currentNoteId = id;
  (document.getElementById('note-title') as HTMLInputElement).value = note.title;
  (document.getElementById('note-class') as HTMLInputElement).value = note.className;
  (document.getElementById('prof-name') as HTMLInputElement).value = note.professor.name;
  (document.getElementById('prof-phone') as HTMLInputElement).value = note.professor.phone;
  (document.getElementById('prof-email') as HTMLInputElement).value = note.professor.email;
  (document.getElementById('note-cat') as HTMLSelectElement).value = note.category;
  (document.getElementById('note-content') as HTMLTextAreaElement).value = note.content;
  if (note.hasAudio && note.audioId) {
    app.currentAudioBlob = await app.dbService.getAudio(note.audioId) || null;
    if (app.currentAudioBlob) showAudioPlayer();
  } else {
    app.currentAudioBlob = null;
    hideAudioPlayer();
  }
  showNoteEditor(app);
}

async function saveNote(app: any) {
  const title = (document.getElementById('note-title') as HTMLInputElement)?.value.trim();
  const className = (document.getElementById('note-class') as HTMLInputElement)?.value.trim();
  const profName = (document.getElementById('prof-name') as HTMLInputElement)?.value.trim();
  const profPhone = (document.getElementById('prof-phone') as HTMLInputElement)?.value.trim() || '';
  const profEmail = (document.getElementById('prof-email') as HTMLInputElement)?.value.trim() || '';
  const category = (document.getElementById('note-cat') as HTMLSelectElement)?.value as any;
  const content = (document.getElementById('note-content') as HTMLTextAreaElement)?.value.trim() || '';
  if (!title || !className || !profName) return alert('Completa: título, clase y profesor');
  const professor = { name: profName, phone: profPhone, email: profEmail };
  try {
    if (app.currentNoteId) {
      const updates: any = { title, className, professor, category, content };
      if (app.currentAudioBlob) {
        const audioId = app.currentNoteId + '_audio';
        await app.dbService.saveAudio(audioId, app.currentAudioBlob);
        updates.hasAudio = true;
        updates.audioId = audioId;
      }
      await app.notesService.updateNote(app.currentNoteId, updates);
    } else {
      const note = await app.notesService.createNote(title, className, professor, content, category);
      if (app.currentAudioBlob) {
        const audioId = note.id + '_audio';
        await app.dbService.saveAudio(audioId, app.currentAudioBlob);
        await app.notesService.updateNote(note.id, { hasAudio: true, audioId });
      }
    }
    showNotesList(app);
    await app.notesService.loadNotes();
    renderNotesList(app);
    alert('Apunte guardado');
  } catch (error) {
    alert('Error al guardar');
  }
}

async function deleteNote(app: any) {
  if (!app.currentNoteId) return;
  if (confirm('¿Eliminar este apunte?')) {
    try {
      await app.notesService.deleteNote(app.currentNoteId);
      app.currentNoteId = null;
      app.currentAudioBlob = null;
      showNotesList(app);
      await app.notesService.loadNotes();
      renderNotesList(app);
    } catch (error) {
      alert('Error al eliminar');
    }
  }
}

function showAudioPlayer() {
  const container = document.getElementById('audio-player-container');
  if (container) container.style.display = 'flex';
}

function hideAudioPlayer() {
  const container = document.getElementById('audio-player-container');
  if (container) container.style.display = 'none';
}

export function renderFilePreview(app: any, files: File[]) {
  const container = document.getElementById('file-preview');
  if (!container) return;
  if (files.length === 0) {
    container.innerHTML = '';
    container.style.display = 'none';
    return;
  }
  container.style.display = 'flex';
  container.innerHTML = files.map((file, index) => `
    <div class="file-chip">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/>
        <path d="M13 2v7h7"/>
      </svg>
      <span>${file.name}</span>
      <button class="remove-file" data-index="${index}">×</button>
    </div>
  `).join('');
  container.querySelectorAll('.remove-file').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt((e.currentTarget as HTMLElement).dataset.index!);
      const currentFiles = app.chatService.getUploadedFiles();
      currentFiles.splice(index, 1);
      app.chatService.setUploadedFiles(currentFiles);
      renderFilePreview(app, currentFiles);
    });
  });
}
