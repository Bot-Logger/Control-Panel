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

// Оновлена функція отримання IP
async function отриматиIP() {
    const поле = document.getElementById('ipAddressDisplay');
    
    const API_LIST = [
        'https://api.ipify.org?format=json',
        'https://api64.ipify.org/json',
        'https://api.bigdatacloud.net/data/client-ip'
    ];

    поле.textContent = 'Отримання IP...';

    async function спробуватиAPI(url) {
        try {
            const відповідь = await fetch(url, {
                mode: 'cors',
                headers: {
                    'Accept': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
            
            if (!відповідь.ok) throw new Error('Помилка запиту');
            const дані = await відповідь.json();
            return дані.ip || дані.ipString;
        } catch {
            return null;
        }
    }

    for (const url of API_LIST) {
        const ip = await спробуватиAPI(url);
        if (ip) {
            поле.textContent = ip;
            return;
        }
    }

    // Якщо жоден API не спрацював, використовуємо резервний варіант
    try {
        const відповідь = await fetch('https://api.myip.com');
        const дані = await відповідь.json();
        if (дані.ip) {
            поле.textContent = дані.ip;
            return;
        }
    } catch {
        поле.textContent = 'IP приховано';
    }
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

форма.addEventListener('submit', async function(подія) {
    подія.preventDefault();
    
    const поточнийЧас = Date.now();
    if (поточнийЧас - останняВідправка < часОчікування) {
        сповіщення.показати('Зачекайте перед наступною спробою', 'warning');
        return;
    }

    const кнопка = подія.target.querySelector('button');
    if (кнопка.disabled) return;

    кнопка.disabled = true;
    кнопка.classList.add('loading');
    
    try {
        // Імітація відправки даних
        await new Promise(resolve => setTimeout(resolve, часОчікування));
        сповіщення.показати('Успішний вхід!', 'success');
    } catch (помилка) {
        сповіщення.показати('Помилка входу', 'error');
    } finally {
        кнопка.disabled = false;
        кнопка.classList.remove('loading');
    }
});

// Завантаження сторінки
document.addEventListener('DOMContentLoaded', отриматиIP);

// Додаємо матричний фон
function створитиМатрицю() {
    const контейнер = document.createElement('div');
    контейнер.className = 'matrix-background';
    document.body.appendChild(контейнер);

    for (let i = 0; i < 50; i++) {
        const колонка = document.createElement('div');
        колонка.className = 'matrix-column';
        колонка.style.left = `${Math.random() * 100}%`;
        колонка.style.animationDelay = `${Math.random() * 20}s`;
        колонка.textContent = Array(Math.floor(Math.random() * 20) + 10)
            .fill(0)
            .map(() => String.fromCharCode(Math.random() * 128))
            .join('');
        контейнер.appendChild(колонка);
    }
}

// Система сповіщень
class Сповіщення {
    constructor() {
        this.контейнер = document.createElement('div');
        this.контейнер.className = 'notifications';
        document.body.appendChild(this.контейнер);
    }

    показати(повідомлення, тип = 'info') {
        const сповіщення = document.createElement('div');
        сповіщення.className = `notification ${тип}`;
        сповіщення.textContent = повідомлення;
        
        this.контейнер.appendChild(сповіщення);
        setTimeout(() => сповіщення.remove(), 3000);
    }
}

const сповіщення = new Сповіщення();

// Розширена валідація форми
class ВалідаціяФорми {
    constructor(форма) {
        this.форма = форма;
        this.правила = {
            username: [
                { pattern: /^[a-zA-Z0-9]{3,20}$/, message: 'Логін має містити від 3 до 20 символів' },
                { pattern: /^[a-zA-Z]/, message: 'Логін має починатися з літери' }
            ],
            password: [
                { pattern: /.{8,}/, message: 'Пароль має бути не менше 8 символів' },
                { pattern: /[A-Z]/, message: 'Пароль має містити велику літеру' },
                { pattern: /[0-9]/, message: 'Пароль має містити цифру' }
            ]
        };
        
        this.прослуховувачіПодій();
    }

    прослуховувачіПодій() {
        this.форма.querySelectorAll('input').forEach(поле => {
            поле.addEventListener('input', () => this.валідуватиПоле(поле));
            поле.addEventListener('blur', () => this.валідуватиПоле(поле));
        });
    }

    валідуватиПоле(поле) {
        const правила = this.правила[поле.name];
        if (!правила) return true;

        let дійсний = true;
        правила.forEach(правило => {
            if (!правило.pattern.test(поле.value)) {
                дійсний = false;
                сповіщення.показати(правило.message, 'error');
            }
        });

        поле.classList.toggle('valid', дійсний);
        поле.classList.toggle('invalid', !дійсний);
        return дійсний;
    }
}

// Ініціалізація
document.addEventListener('DOMContentLoaded', () => {
    створитиМатрицю();
    const валідатор = new ВалідаціяФорми(document.getElementById('loginForm'));
});
