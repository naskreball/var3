let pStep = 1;
const pTotal = 7;
const pState = { event:'', shape:'', weight:0, portions:0, filling:'', gallery:'', text:'', hasPhoto:false };
const PRICE = 1550;

const F_DATA = { 
    'Шоколадные':11, 'Кофейные':8, 'Медовые':4, 'Фруктово-ягодные':13, 
    'Карамель / Крем-брюле':4, 'С безе':3, 'С суфле "Птичье молоко"':3, 
    'Многокомпонентные':4, 'А еще...':5 
};

function startPremium() {
    document.getElementById('hero').classList.add('hidden-hero');
    document.getElementById('prem-progress').style.display = 'block';
    document.getElementById('prem-nav').style.display = 'flex';
    goToStep(1);
}

function pUpdateNav() {
    const prev = document.getElementById('p-prev');
    const next = document.getElementById('p-next');
    
    prev.style.display = pStep === 1 ? 'none' : 'block';
    next.style.display = pStep === pTotal ? 'none' : 'block';
    
    let canGo = false;
    if (pStep === 1) canGo = !!pState.event;
    if (pStep === 2) canGo = !!pState.shape;
    if (pStep === 3) canGo = pState.weight > 0;
    if (pStep === 4) canGo = !!pState.filling;
    if (pStep === 5) canGo = true; // Фото и галерею можно пропустить
    if (pStep === 6) canGo = true; // Надпись не обязательна
    
    next.disabled = !canGo;
    next.style.opacity = canGo ? '1' : '0.4';
    next.style.cursor = canGo ? 'pointer' : 'not-allowed';
}

function goToStep(step) {
    document.querySelectorAll('.prem-step').forEach(el => el.classList.remove('active'));
    document.getElementById(`p-step${step}`).classList.add('active');
    
    pStep = step;
    const percent = ((step - 1) / (pTotal - 1)) * 100;
    document.getElementById('prem-fill').style.width = `${percent}%`;
    
    document.querySelectorAll('.prem-progress-labels span').forEach((el, i) => {
        el.classList.toggle('active', i + 1 <= step);
    });
    
    pUpdateNav();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function pNext() { if (pStep < pTotal) goToStep(pStep + 1); }
function pPrev() { if (pStep > 1) goToStep(pStep - 1); }

// Выбор
function pClear(id) {
    document.getElementById(id)?.querySelectorAll('.prem-card, .prem-cat-btn, .prem-item, .prem-g-item').forEach(e => e.classList.remove('active'));
}

function pSelect(key, val, el) {
    pState[key] = val;
    pClear(key === 'event' ? 'p-event-options' : 'p-shape-options');
    el.classList.add('active');
    if (key === 'shape') renderFillingCats(val);
    pUpdateSummary();
    pUpdateNav();
}

function pSelectWeight(w, el) {
    pState.weight = w;
    pClear('p-weight-options');
    el.classList.add('active');
    pState.portions = Math.floor((w * 1000) / 150);
    document.getElementById('p-portions').innerText = pState.portions;
    document.getElementById('p-calc').style.display = 'block';
    pUpdateSummary();
    pUpdateNav();
}

// Начинки
function renderFillingCats(shape) {
    let cats = Object.keys(F_DATA);
    if (shape === 'Фигурный') cats = cats.filter(c => c !== 'Многокомпонентные');
    if (shape === 'Многоярусный') cats = ['Шоколадные', 'Фруктово-ягодные', 'Медовые'];
    
    const cont = document.getElementById('p-filling-cats');
    cont.innerHTML = '';
    cats.forEach((c, i) => {
        const b = document.createElement('button');
        b.className = 'prem-cat-btn' + (i === 0 ? ' active' : '');
        b.innerText = c;
        b.onclick = () => { pClear('p-filling-cats'); b.classList.add('active'); renderFillingItems(c); };
        cont.appendChild(b);
    });
    if (cats.length) renderFillingItems(cats[0]);
}

function renderFillingItems(cat) {
    const grid = document.getElementById('p-filling-grid');
    grid.innerHTML = '';
    for (let i = 1; i <= F_DATA[cat]; i++) {
        const d = document.createElement('div');
        d.className = 'prem-item';
        d.onclick = function() { pClear('p-filling-grid'); this.classList.add('active'); pState.filling = cat + ' #' + i; pUpdateSummary(); pUpdateNav(); };
        d.innerHTML = `<div class="ph">Фото</div>#${i}`;
        grid.appendChild(d);
    }
}

// Галерея
function pSwitchTab(tab, btn) {
    document.querySelectorAll('.prem-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const grid = document.getElementById('p-gallery-grid');
    grid.innerHTML = '';
    for (let i = 1; i <= 10; i++) {
        const d = document.createElement('div');
        d.className = 'prem-g-item';
        d.innerText = `Фото ${i}`;
        d.onclick = function() { pClear('p-gallery-grid'); this.classList.add('active'); pState.gallery = tab + ' #' + i; pUpdateSummary(); };
        grid.appendChild(d);
    }
}
pSwitchTab('Праздничные', document.querySelector('.prem-tab'));

// Загрузка фото
function pUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(ev) {
            document.getElementById('p-preview-img').src = ev.target.result;
            document.getElementById('p-preview').classList.remove('hidden');
            document.getElementById('dropzone').style.display = 'none';
            pState.hasPhoto = true;
            pUpdateSummary();
        };
        reader.readAsDataURL(file);
    }
}

function pRemovePhoto(e) {
    e.stopPropagation();
    document.getElementById('p-preview').classList.add('hidden');
    document.getElementById('dropzone').style.display = 'flex';
    document.getElementById('p-file').value = '';
    pState.hasPhoto = false;
    pUpdateSummary();
}

function pNoText(chk) {
    const input = document.getElementById('p-text');
    input.value = chk ? 'Никакой, он и так прекрасен' : '';
    input.disabled = chk;
    pState.text = input.value;
    pUpdateSummary();
}

// Итог
function pUpdateSummary() {
    document.getElementById('ps-event').innerText = pState.event || '-';
    document.getElementById('ps-shape').innerText = pState.shape || '-';
    document.getElementById('ps-weight').innerText = pState.weight ? pState.weight + ' кг' : '-';
    document.getElementById('ps-portions').innerText = pState.portions || '-';
    document.getElementById('ps-filling').innerText = pState.filling || '-';
    document.getElementById('ps-text').innerText = document.getElementById('p-text').value || '-';
    
    document.getElementById('ps-price').innerText = pState.weight ? (pState.weight * PRICE).toLocaleString('ru-RU') : '0';
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('prem-progress').style.display = 'none';
    document.getElementById('prem-nav').style.display = 'none';

    // Маска для телефона
    const phoneInput = document.getElementById('f-phone');
    phoneInput.addEventListener('input', function(e) {
        let val = this.value.replace(/\D/g, '');
        if (val.length === 0) { this.value = ''; return; }
        if (val[0] === '8') val = '7' + val.slice(1);
        if (val[0] !== '7') val = '7' + val;
        let res = '+7 ';
        if (val.length > 1) res += '(' + val.slice(1, 4);
        if (val.length > 4) res += ') ' + val.slice(4, 7);
        if (val.length > 7) res += '-' + val.slice(7, 9);
        if (val.length > 9) res += '-' + val.slice(9, 11);
        this.value = res;
        validateForm();
    });

    // Валидация формы
    const formInputs = document.querySelectorAll('#order-form input[required], #order-form textarea');
    formInputs.forEach(input => {
        input.addEventListener('input', validateForm);
        input.addEventListener('change', validateForm);
    });

    document.getElementById('f-agree').addEventListener('change', validateForm);
});

function validateForm() {
    const name = document.getElementById('f-name').value.trim();
    const phone = document.getElementById('f-phone').value.replace(/\D/g, '');
    const date = document.getElementById('f-date').value;
    const agree = document.getElementById('f-agree').checked;
    
    // Телефон должен быть полным: 7 + 10 цифр = 11 цифр
    const isValid = name.length > 1 && phone.length === 11 && date !== '' && agree;
    
    const btn = document.getElementById('submit-btn');
    btn.disabled = !isValid;
    btn.style.opacity = isValid ? '1' : '0.5';
    btn.style.cursor = isValid ? 'pointer' : 'not-allowed';
}

function submitOrder(e) {
    e.preventDefault();
    // Здесь в будущем будет AJAX отправка в Битрикс
    alert('Заявка успешно отправлена! (Прототип: данные ушли на сервер)');
}