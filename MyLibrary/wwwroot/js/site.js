// MyLibrary site interactions: theme toggle, book search/filter, small UX helpers

document.addEventListener('DOMContentLoaded', function () {
	const themeToggle = document.getElementById('themeToggle');
	const root = document.body;
	const saved = localStorage.getItem('mylib-theme');
	if (saved === 'dark') root.classList.add('theme-dark');
	updateThemeButton();

	if (themeToggle) {
		themeToggle.addEventListener('click', function () {
			root.classList.toggle('theme-dark');
			localStorage.setItem('mylib-theme', root.classList.contains('theme-dark') ? 'dark' : 'light');
			updateThemeButton();
		});
	}

	const bookSearch = document.getElementById('bookSearch');
	if (bookSearch) {
		bookSearch.addEventListener('input', function (e) {
			filterBooks(e.target.value);
		});
		// if search already has value (e.g., from layout) run a filter on load
		if (bookSearch.value && bookSearch.value.trim().length) {
			filterBooks(bookSearch.value);
		}
	}

	function updateThemeButton() {
		if (!themeToggle) return;
		themeToggle.textContent = root.classList.contains('theme-dark') ? '☀️' : '🌙';
	}

	function filterBooks(query) {
		query = (query || '').trim().toLowerCase();
		const cards = document.querySelectorAll('#booksGrid .book-card');
		if (!cards) return;
		cards.forEach(function (c) {
			const title = (c.dataset.title || '').toLowerCase();
			const author = (c.dataset.author || '').toLowerCase();
			const status = (c.dataset.status || '').toLowerCase();
			const matches = !query || title.indexOf(query) !== -1 || author.indexOf(query) !== -1 || status.indexOf(query) !== -1;
			const col = c.closest('.col') || c.parentElement;
			if (col) col.classList.toggle('d-none', !matches);
		});
	}

	// Quick-focus search with '/'
	document.addEventListener('keydown', function (e) {
		if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
			const s = document.getElementById('bookSearch');
			if (s) { e.preventDefault(); s.focus(); }
		}
	});

	// Paste-to-upload: panoya yapıştırılan resimleri yakalayarak sunucuya yükler ve formu doldurur
	document.addEventListener('paste', async function (e) {
		try {
			// only activate on Create/Edit book forms
			const form = document.querySelector('form[action*="/Books/Create"], form[action*="/Books/Edit"]');
			if (!form) return;

			const items = (e.clipboardData && e.clipboardData.items) || [];
			for (let i = 0; i < items.length; i++) {
				const it = items[i];
				if (it.type && it.type.startsWith('image/')) {
					e.preventDefault();
					const blob = it.getAsFile();
					const fd = new FormData();
					fd.append('image', blob, 'pasted.png');
					const resp = await fetch('/Books/UploadCover', { method: 'POST', body: fd, credentials: 'same-origin' });
					if (!resp.ok) { showTransient('Görsel yüklenemedi'); return; }
					const json = await resp.json();
					// set coverUrl input if present, else create hidden input
					let coverInput = form.querySelector('input[name="coverUrl"], input#coverUrl');
					if (!coverInput) {
						coverInput = document.createElement('input');
						coverInput.type = 'hidden';
						coverInput.name = 'coverUrl';
						form.appendChild(coverInput);
					}
					coverInput.value = json.url || '';
					// show preview if there's an img.preview element
					const preview = form.querySelector('.cover-preview img, img.cover-preview-img');
					if (preview) preview.src = json.thumb || json.url;
					// if we're on an edit form with an Id, update the card image on the index grid
					const idInput = form.querySelector('input[name="Id"], input#Id');
					if (idInput && idInput.value) {
						const cardImg = document.querySelector('#book-' + idInput.value + ' .book-cover');
						if (cardImg) cardImg.src = json.thumb || json.url;
					}
					showTransient('Görsel yapıştırıldı ve sunucuya yüklendi');
					return; // only handle first image
				}
			}

			// if no image item, check plain text (data URL or image URL)
			const text = (e.clipboardData && e.clipboardData.getData && e.clipboardData.getData('text/plain')) || '';
			if (text) {
				// data:image/...base64,....
				if (text.startsWith('data:image/')) {
					e.preventDefault();
					try {
						const parts = text.split(',');
						const meta = parts[0];
						const b64 = parts[1] || '';
						const mimeMatch = meta.match(/data:(image\/[^;]+);base64/);
						const mime = mimeMatch ? mimeMatch[1] : 'image/png';
						const byteChars = atob(b64);
						const byteNumbers = new Array(byteChars.length);
						for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
						const byteArray = new Uint8Array(byteNumbers);
						const blob = new Blob([byteArray], { type: mime });
						const fd = new FormData();
						fd.append('image', blob, 'pasted.' + mime.split('/')[1]);
						const resp = await fetch('/Books/UploadCover', { method: 'POST', body: fd, credentials: 'same-origin' });
						if (!resp.ok) { showTransient('Görsel yüklenemedi'); return; }
						const json = await resp.json();
						let coverInput = form.querySelector('input[name="coverUrl"], input#coverUrl');
						if (!coverInput) {
							coverInput = document.createElement('input');
							coverInput.type = 'hidden';
							coverInput.name = 'coverUrl';
							form.appendChild(coverInput);
						}
						coverInput.value = json.url || '';
						const preview = form.querySelector('.cover-preview img');
						if (preview) preview.src = json.thumb || json.url;
						showTransient('Base64 görsel sunucuya yüklendi');
						return;
					} catch (err) { console.error(err); showTransient('Görsel işlenemedi'); }
				}

				// plain URL - try fetch and upload if image
				if (text.startsWith('http')) {
					try {
						const r = await fetch(text, { mode: 'cors' });
						if (!r.ok) { showTransient('Uzak resim alınamadı'); return; }
						const blob = await r.blob();
						if (!blob.type.startsWith('image/')) { showTransient('URL bir resim değil'); return; }
						const fd = new FormData();
						const ext = blob.type.split('/')[1] || 'jpg';
						fd.append('image', blob, 'remote.' + ext);
						const resp = await fetch('/Books/UploadCover', { method: 'POST', body: fd, credentials: 'same-origin' });
						if (!resp.ok) { showTransient('Görsel yüklenemedi'); return; }
						const json = await resp.json();
						let coverInput = form.querySelector('input[name="coverUrl"], input#coverUrl');
						if (!coverInput) {
							coverInput = document.createElement('input');
							coverInput.type = 'hidden';
							coverInput.name = 'coverUrl';
							form.appendChild(coverInput);
						}
						coverInput.value = json.url || '';
						const preview = form.querySelector('.cover-preview img');
						if (preview) preview.src = json.thumb || json.url;
						showTransient('Uzak görsel sunucuya yüklendi');
						return;
					} catch (err) { console.error(err); showTransient('Uzak resim alınamadı'); }
				}
			}
		} catch (err) { console.error(err); }
	});

		// Overlay button handlers: change cover (go to edit) or zoom (open modal)
		document.body.addEventListener('click', function (e) {
			const changeBtn = e.target.closest('.btn-change-cover');
			if (changeBtn) {
				e.preventDefault();
				const id = changeBtn.dataset.id;
				if (id) { window.location.href = `/Books/Edit/${id}`; }
				return;
			}
			const zoomBtn = e.target.closest('.btn-zoom-cover');
			if (zoomBtn) {
				e.preventDefault();
				const src = zoomBtn.dataset.src;
				if (src) {
					// create a quick modal reuse
					const modal = document.createElement('div'); modal.className = 'mylib-modal';
					const inner = document.createElement('div'); inner.className = 'mylib-modal-content';
					const imgEl = document.createElement('img'); imgEl.src = src; imgEl.alt = 'Kapak';
					const body = document.createElement('div'); body.className = 'mylib-modal-body'; body.innerHTML = `<button id="modal-close" class="btn btn-sm btn-outline-secondary">Kapat</button>`;
					inner.appendChild(imgEl); inner.appendChild(body); modal.appendChild(inner); document.body.appendChild(modal);
					document.getElementById('modal-close').addEventListener('click', function () { modal.remove(); });
					modal.addEventListener('click', function (ev) { if (ev.target === modal) modal.remove(); });
					return;
				}
			}
		});

	// Share button (copy or WhatsApp with Alt+Click)
	document.body.addEventListener('click', function (e) {
		const btn = e.target.closest('.btn-share');
		if (!btn) return;
		e.preventDefault();
		const title = btn.dataset.title || document.title || 'Kitap';
		const id = btn.dataset.id;
		const anchor = id ? `${window.location.origin}/Books/Index#book-${id}` : window.location.origin;
		const shareText = `${title} — ${anchor}`;
		if (e.altKey) {
			// open WhatsApp share
			const url = 'https://wa.me/?text=' + encodeURIComponent(shareText);
			window.open(url, '_blank');
			return;
		}
		if (navigator.clipboard) {
			navigator.clipboard.writeText(shareText).then(function () {
				showTransient('Paylaşım metni panoya kopyalandı');
			}).catch(function () { alert('Kopyalanamadı — tarayıcı izinleri engelliyor olabilir.'); });
		} else {
			alert(shareText);
		}
	});

	// Detail modal: open when clicking a card (avoid clicks on buttons/links)
	document.body.addEventListener('click', function (e) {
		const card = e.target.closest('.book-card');
		if (!card) return;
		if (e.target.closest('a, button, .btn')) return; // don't open when clicking controls
		e.preventDefault();
		openBookModal(card);
	});

	function openBookModal(card) {
		const title = card.dataset.title || '';
		const author = card.dataset.author || '';
		const status = card.dataset.status || '';
		const img = card.querySelector('.book-cover');
		const src = img ? img.src : '';

		const modal = document.createElement('div');
		modal.className = 'mylib-modal';

		const inner = document.createElement('div');
		inner.className = 'mylib-modal-content';

		const imgEl = document.createElement('img');
		imgEl.src = src;
		imgEl.alt = title;

		const body = document.createElement('div');
		body.className = 'mylib-modal-body';
		body.innerHTML = `<h3 style="margin-top:0">${escapeHtml(title)}</h3>
			<p class="muted">✍️ ${escapeHtml(author)}</p>
			<p class="small muted">Durum: <strong>${escapeHtml(status)}</strong></p>
			<div style="margin-top:12px"><button class="btn btn-primary btn-sm me-2" id="modal-share">Paylaş</button><button class="btn btn-outline-secondary btn-sm" id="modal-close">Kapat</button></div>`;

		inner.appendChild(imgEl);
		inner.appendChild(body);
		modal.appendChild(inner);
		document.body.appendChild(modal);

		// handlers
		document.getElementById('modal-close').addEventListener('click', function () { modal.remove(); });
		document.getElementById('modal-share').addEventListener('click', function () {
			const shareText = `${title} — ${window.location.origin}`;
			navigator.clipboard?.writeText(shareText).then(() => showTransient('Paylaşım metni panoya kopyalandı'));
		});

		modal.addEventListener('click', function (ev) { if (ev.target === modal) modal.remove(); });
		document.addEventListener('keydown', function escHandler(ev) { if (ev.key === 'Escape') { modal.remove(); document.removeEventListener('keydown', escHandler); } });
	}

	function escapeHtml(s){ return String(s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]; }); }

	function showTransient(text) {
		const el = document.createElement('div');
		el.className = 'mylib-transient';
		el.textContent = text;
		Object.assign(el.style, {
			position: 'fixed',
			right: '20px',
			top: '20px',
			background: 'rgba(0,0,0,0.8)',
			color: '#fff',
			padding: '10px 14px',
			borderRadius: '8px',
			zIndex: 99999,
			boxShadow: '0 6px 18px rgba(0,0,0,0.2)'
		});
		document.body.appendChild(el);
		setTimeout(function () { el.style.opacity = '0'; el.style.transition = 'opacity 300ms'; }, 1400);
		setTimeout(function () { el.remove(); }, 2000);
	}
});
