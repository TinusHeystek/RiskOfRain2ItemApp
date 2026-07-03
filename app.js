const STORAGE_KEY = 'ror2-item-board-v1';
const COLUMN_STORAGE_KEY = 'ror2-columns-v1';

const board = document.getElementById('board');
const search = document.getElementById('search');
const rarity = document.getElementById('rarity');

function localFileBase(name) {
	return name.replaceAll(' ', '_').replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_');
}

function localIconUrl(name) {
	return 'assets/icons/' + encodeURIComponent(localFileBase(name) + '.webp');
}

function rarityClass(rarityName) {
	return rarityName.replace(/\s+/g, '');
}

function getData() {
	const saved = localStorage.getItem(STORAGE_KEY);
	if (saved) {
		try {
			return JSON.parse(saved);
		} catch (e) {
			// Ignore invalid saved JSON and fall back to defaults.
		}
	}

	return SOURCE_ITEMS.map((item, index) => ({ ...item, order: index }));
}

let data = getData();
let columns = getColumns();
syncColumnsWithData();

function getColumns() {
	const saved = localStorage.getItem(COLUMN_STORAGE_KEY);
	if (saved) {
		try {
			const parsed = JSON.parse(saved);
			if (Array.isArray(parsed)) {
				const clean = parsed
					.map((value) => String(value).trim())
					.filter((value, index, arr) => value && arr.indexOf(value) === index);
				if (clean.length > 0) {
					return clean;
				}
			}
		} catch (e) {
			// Ignore invalid saved JSON and fall back to defaults.
		}
	}

	return [...CATEGORIES];
}

function persistState() {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	localStorage.setItem(COLUMN_STORAGE_KEY, JSON.stringify(columns));
}

function syncColumnsWithData() {
	const seen = new Set(columns);
	data.forEach((item) => {
		if (!seen.has(item.category)) {
			seen.add(item.category);
			columns.push(item.category);
		}
	});
}

function addColumn() {
	const name = prompt('New column name:');
	if (name == null) {
		return;
	}

	const trimmed = name.trim();
	if (!trimmed) {
		alert('Column name cannot be empty.');
		return;
	}

	const exists = columns.some((col) => col.toLowerCase() === trimmed.toLowerCase());
	if (exists) {
		alert('A column with that name already exists.');
		return;
	}

	columns.push(trimmed);
	persistState();
	render();
}

function renameColumn(currentName) {
	const newNameInput = prompt(`New name for "${currentName}":`, currentName);
	if (newNameInput == null) {
		return;
	}

	const newName = newNameInput.trim();
	if (!newName) {
		alert('Column name cannot be empty.');
		return;
	}

	const exists = columns.some(
		(col) => col.toLowerCase() === newName.toLowerCase() && col !== currentName
	);
	if (exists) {
		alert('A column with that name already exists.');
		return;
	}

	const index = columns.indexOf(currentName);
	columns[index] = newName;

	data.forEach((item) => {
		if (item.category === currentName) {
			item.category = newName;
		}
	});

	persistState();
	render();
}

function removeColumn(name) {
	if (columns.length <= 1) {
		return;
	}

	if (!name || !columns.includes(name)) {
		return;
	}

	const fallback =
		columns.includes('Unwanted') && name !== 'Unwanted'
			? 'Unwanted'
			: columns.find((col) => col !== name);

	if (!fallback) {
		alert('Could not determine a destination column for moved items.');
		return;
	}

	if (!confirm(`Remove "${name}"? Items in this column will move to "${fallback}".`)) {
		return;
	}

	columns = columns.filter((col) => col !== name);

	data.forEach((item) => {
		if (item.category === name) {
			item.category = fallback;
		}
	});

	persistState();
	render();
}

function persistColumnOrderFromDom() {
	const ordered = [...board.querySelectorAll('.column')].map((col) => col.dataset.category);
	if (ordered.length === columns.length && ordered.length > 0) {
		columns = ordered;
		persistState();
	}
}

function setupColumnReorder() {
	let draggedColumn = null;

	document.querySelectorAll('.column').forEach((columnEl) => {
		const head = columnEl.querySelector('.colHead');
		if (!head) {
			return;
		}

		head.draggable = true;

		head.addEventListener('dragstart', (event) => {
			if (event.target.closest('.colAction')) {
				event.preventDefault();
				return;
			}

			draggedColumn = columnEl;
			columnEl.classList.add('columnDragging');
			event.dataTransfer.effectAllowed = 'move';
			event.dataTransfer.setData('text/plain', columnEl.dataset.category);
		});

		head.addEventListener('dragend', () => {
			if (draggedColumn) {
				draggedColumn.classList.remove('columnDragging');
				draggedColumn = null;
				persistColumnOrderFromDom();
				render();
			}
		});

		columnEl.addEventListener('dragover', (event) => {
			if (!draggedColumn || draggedColumn === columnEl) {
				return;
			}

			event.preventDefault();
			const box = columnEl.getBoundingClientRect();
			const beforeTarget = event.clientX < box.left + box.width / 2;

			if (beforeTarget) {
				board.insertBefore(draggedColumn, columnEl);
			} else {
				board.insertBefore(draggedColumn, columnEl.nextSibling);
			}
		});
	});
}

function fillRarity() {
	const rarities = [...new Set(SOURCE_ITEMS.map((item) => item.rarity))].sort();
	rarities.forEach((value) => {
		const option = document.createElement('option');
		option.value = value;
		option.textContent = value;
		rarity.appendChild(option);
	});
}

function render() {
	board.innerHTML = '';

	const query = search.value.trim().toLowerCase();
	const rarityFilter = rarity.value;

	columns.forEach((category) => {
		const column = document.createElement('section');
		column.className = 'column';
		column.dataset.category = category;
		const disableRemove = columns.length <= 1;

		const list = data
			.filter((item) => item.category === category)
			.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
			.filter(
				(item) =>
					(!rarityFilter || item.rarity === rarityFilter) &&
					(!query || (item.name + ' ' + item.description).toLowerCase().includes(query))
			);

		column.innerHTML = `<div class="colHead"><h2>${category}</h2><div class="colHeadRight"><span class="count">${list.length} shown</span><div class="colActions"><button class="colAction renameCol" title="Rename column" aria-label="Rename ${category}">&#9998;</button><button class="colAction removeCol" title="Remove column" aria-label="Remove ${category}" ${disableRemove ? 'disabled' : ''}>&#128465;</button></div></div></div><div class="items" data-category="${category}"></div>`;

		const dropZone = column.querySelector('.items');
		list.forEach((item) => dropZone.appendChild(card(item)));

		const renameBtn = column.querySelector('.renameCol');
		renameBtn.addEventListener('click', (event) => {
			event.stopPropagation();
			renameColumn(category);
		});

		const removeBtn = column.querySelector('.removeCol');
		removeBtn.addEventListener('click', (event) => {
			event.stopPropagation();
			removeColumn(category);
		});

		board.appendChild(column);
	});

	setupDnd();
	setupColumnReorder();
	requestAnimationFrame(fitIconMetaLabels);
}

function card(item) {
	const cardEl = document.createElement('article');
	cardEl.className = 'card';
	cardEl.draggable = true;
	cardEl.dataset.name = item.name;

	cardEl.innerHTML = `<div class="cardMedia"><img class="icon ${rarityClass(item.rarity)}" src="${localIconUrl(item.name)}" alt="${item.name} icon" loading="lazy" onerror="this.style.visibility='hidden'"/><div class="iconMeta" title="${item.type}">${item.type}</div></div><div><div class="nameRow"><span class="name">${item.name}</span><span class="rarity ${rarityClass(item.rarity)}">${item.rarity}</span></div><div class="desc">${item.description}</div></div>`;

	return cardEl;
}

function fitIconMetaLabels() {
	document.querySelectorAll('.iconMeta').forEach((label) => {
		let size = 11;
		label.style.fontSize = `${size}px`;

		while (size > 7 && label.scrollWidth > label.clientWidth) {
			size -= 0.5;
			label.style.fontSize = `${size}px`;
		}
	});
}

function setupDnd() {
	let dragged = null;

	document.querySelectorAll('.card').forEach((cardEl) => {
		cardEl.addEventListener('dragstart', (event) => {
			dragged = cardEl;
			cardEl.classList.add('dragging');
			event.dataTransfer.setData('text/plain', cardEl.dataset.name);
		});

		cardEl.addEventListener('dragend', () => {
			cardEl.classList.remove('dragging');
			dragged = null;
			recompute();
		});
	});

	document.querySelectorAll('.items').forEach((zone) => {
		zone.addEventListener('dragover', (event) => {
			event.preventDefault();
			zone.classList.add('dropHint');

			const after = getAfter(zone, event.clientY);
			const dragging = document.querySelector('.dragging');
			if (!dragging) {
				return;
			}

			if (after == null) {
				zone.appendChild(dragging);
			} else {
				zone.insertBefore(dragging, after);
			}
		});

		zone.addEventListener('dragleave', () => zone.classList.remove('dropHint'));
		zone.addEventListener('drop', (event) => {
			event.preventDefault();
			zone.classList.remove('dropHint');
			recompute();
		});
	});
}

function getAfter(zone, y) {
	const elements = [...zone.querySelectorAll('.card:not(.dragging)')];

	return elements.reduce(
		(closest, child) => {
			const box = child.getBoundingClientRect();
			const offset = y - box.top - box.height / 2;

			if (offset < 0 && offset > closest.offset) {
				return { offset, element: child };
			}

			return closest;
		},
		{ offset: Number.NEGATIVE_INFINITY }
	).element;
}

function recompute() {
	document.querySelectorAll('.items').forEach((zone) => {
		[...zone.querySelectorAll('.card')].forEach((cardEl, index) => {
			const item = data.find((entry) => entry.name === cardEl.dataset.name);
			if (item) {
				item.category = zone.dataset.category;
				item.order = index;
			}
		});
	});
}

document.getElementById('save').onclick = () => {
	recompute();
  persistState();
	alert('Saved in this browser.');
};

document.getElementById('addColumn').onclick = addColumn;

document.getElementById('reset').onclick = () => {
  if (confirm('Reset items and columns to the original defaults?')) {
		localStorage.removeItem(STORAGE_KEY);
		localStorage.removeItem(COLUMN_STORAGE_KEY);
		data = SOURCE_ITEMS.map((item, index) => ({ ...item, order: index }));
		columns = [...CATEGORIES];
		render();
	}
};

document.getElementById('export').onclick = () => {
	recompute();

	const payload = {
		version: 2,
		columns,
		items: data
	};

	const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
	const download = document.createElement('a');

	download.href = URL.createObjectURL(blob);
	download.download = 'ror2-item-order.json';
	download.click();

	URL.revokeObjectURL(download.href);
};

document.getElementById('importBtn').onclick = () => {
	const input = document.createElement('input');
	input.type = 'file';
	input.accept = 'application/json';

	input.onchange = async () => {
		const text = await input.files[0].text();
		const parsed = JSON.parse(text);

		if (Array.isArray(parsed)) {
			// Backward compatibility for old exports containing only item array.
			data = parsed;
			syncColumnsWithData();
		} else {
			if (!Array.isArray(parsed.items)) {
				alert('Invalid import file: items array is missing.');
				return;
			}
			data = parsed.items;

			if (Array.isArray(parsed.columns) && parsed.columns.length > 0) {
				columns = parsed.columns
					.map((value) => String(value).trim())
					.filter((value, index, arr) => value && arr.indexOf(value) === index);
			} else {
				columns = [...CATEGORIES];
			}

			syncColumnsWithData();
		}

		persistState();
		render();
	};

	input.click();
};

search.oninput = render;
rarity.onchange = render;

fillRarity();
render();

