// Єдиний захисний модуль
(function() {
    // Блокування DevTools
    const devtools = { відкрито: false };

    setInterval(() => {
        const різницяРозміру = Math.abs((window.outerWidth - window.innerWidth)) > 160 ||
                              Math.abs((window.outerHeight - window.innerHeight)) > 160;
        if (різницяРозміру) window.location.reload();
    }, 1000);

    // Захист від інспектування
    document.addEventListener('keydown', e => {
        if (e.key === 'F12' || e.keyCode === 123 || 
            ((e.ctrlKey || e.metaKey) && [73, 74, 83, 85, 123].includes(e.keyCode))) {
            e.preventDefault();
        }
    });

    // Базовий захист
    ['contextmenu', 'selectstart', 'copy', 'cut'].forEach(event => {
        document.addEventListener(event, e => e.preventDefault());
    });
})();

// Оптимізована функція отримання IP з кешуванням
async function отриматиIP() {
    const поле = document.getElementById('ipAddressDisplay');
    const кешКлюч = 'збережений_ip';
    const часКешу = 'час_кешу';
    
    // Перевіряємо кеш
    const збереженийIP = localStorage.getItem(кешКлюч);
    const останнєОновлення = localStorage.getItem(часКешу);
    const кешАктуальний = останнєОновлення && (Date.now() - parseInt(останнєОновлення)) < 3600000; // 1 година
    
    if (збереженийIP && кешАктуальний) {
        поле.textContent = збереженийIP;
        return;
    }

    const API_LIST = [
        'https://api.ipify.org/?format=json',
        'https://api64.ipify.org?format=json',
        'https://api.my-ip.io/ip.json'
    ];
    
    поле.textContent = 'Отримання IP...';
    
    for (const url of API_LIST) {
        try {
            const відповідь = await fetch(url, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
                cache: 'no-cache',
                timeout: 5000
            });
            
            if (!відповідь.ok) continue;
            
            const дані = await відповідь.json();
            const ip = дані.ip;
            
            if (ip && /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip)) {
                localStorage.setItem(кешКлюч, ip);
                localStorage.setItem(часКешу, Date.now().toString());
                поле.textContent = ip;
                return;
            }
        } catch {
            continue;
        }
    }
    
    поле.textContent = збереженийIP || 'IP недоступний';
}

// Оновлення інтерфейсу
const оновитиСтатус = (текст, клас = '') => {
    const поле = document.getElementById('ipAddressDisplay');
    поле.textContent = текст;
    поле.className = `ip-field ${клас}`;
};

// Додаємо автооновлення кожні 30 хвилин
setInterval(отриматиIP, 1800000);

// Оновлення IP при завантаженні
window.addEventListener('load', function() {
    setTimeout(отриматиIP, 1000);
});

// Змінні для роботи з формою
const форма = document.getElementById('loginForm');
const часОчікування = 2000; // 2 секунди затримки
let останняВідправка = 0;

форма.addEventListener('submit', function(подія) {
    подія.preventDefault();
    
    const поточнийЧас = Date.now();
    if (поточнийЧас - останняВідправка < часОчікування) return;
    останняВідправка = поточнийЧас;
    
    const кнопка = подія.target.querySelector('button');
    if (кнопка.disabled) return;
    
    кнопка.disabled = true;
    const початковийВміст = кнопка.innerHTML;
    кнопка.innerHTML = '<span class="emoji">⌛</span> Зачекайте...';
    
    setTimeout(() => {
        кнопка.disabled = false;
        кнопка.innerHTML = початковийВміст;
    }, часОчікування);
});

// Завантаження сторінки
document.addEventListener('DOMContentLoaded', отриматиIP);
