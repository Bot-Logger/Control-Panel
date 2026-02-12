// Єдиний захисний модуль
(function() {
    // Блокування DevTools - ВІДКЛЮЧЕНО (перезавантаження видалено)
    const devtools = { відкрито: false };

    // Відключено автоматичне перезавантаження при виявленні DevTools
    // setInterval(() => {
    //     const різницяРозміру = Math.abs((window.outerWidth - window.innerWidth)) > 160 ||
    //                           Math.abs((window.outerHeight - window.innerHeight)) > 160;
    //     if (різницяРозміру) window.location.reload();
    // }, 1000);

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

// Оптимізована функція отримання IP без помилок
async function отриматиIP() {
    const поле = document.getElementById('ipAddressDisplay');
    const API_URLS = [
        'https://api.ipify.org?format=json',
        'https://api.my-ip.io/ip.json'
    ];

    async function отриматиIPАдресу() {
        for (const url of API_URLS) {
            try {
                const відповідь = await fetch(url);
                const дані = await відповідь.json();
                const ip = дані.ip;
                
                if (ip && /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip)) {
                    return ip;
                }
            } catch {
                continue;
            }
        }
        return null;
    }

    try {
        // Показуємо IP з кешу поки завантажується новий
        const кешованийIP = localStorage.getItem('userIP');
        if (кешованийIP) {
            поле.textContent = кешованийIP;
        }

        const ip = await отриматиIPАдресу();
        if (ip) {
            localStorage.setItem('userIP', ip);
            поле.textContent = ip;
            поле.classList.remove('error');
            поле.classList.add('success');
            return;
        }

        if (!кешованийIP) {
            поле.textContent = 'IP недоступний';
            поле.classList.add('error');
        }
    } catch (помилка) {
        console.error('Помилка:', помилка);
        поле.textContent = кешованийIP || 'Помилка отримання IP';
        поле.classList.add('error');
    }
}

// Оновлення інтерфейсу
const оновитиСтатус = (текст, клас = '') => {
    const поле = document.getElementById('ipAddressDisplay');
    поле.textContent = текст;
    поле.className = `ip-field ${клас}`;
};

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

// Матричний фон відключено
function створитиМатрицю() {
    // Функція відключена для попередження анімацій при оновленні
}

// Виправляємо систему сповіщень
class Сповіщення {
    constructor() {
        this.контейнер = document.createElement('div');
        this.контейнер.className = 'notifications';
        document.body.appendChild(this.контейнер);
        this.активніСповіщення = new Set();
    }

    показати(повідомлення, тип = 'info') {
        if (this.активніСповіщення.has(повідомлення)) return;
        
        const сповіщення = document.createElement('div');
        сповіщення.className = `notification ${тип}`;
        сповіщення.textContent = повідомлення;
        
        this.активніСповіщення.add(повідомлення);
        this.контейнер.appendChild(сповіщення);
        
        setTimeout(() => {
            сповіщення.remove();
            this.активніСповіщення.delete(повідомлення);
        }, 3000);
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

// Оновлені слухачі подій
document.addEventListener('DOMContentLoaded', () => {
    // Запускаємо отримання IP одразу
    отриматиIP();
    
    // Оновлюємо IP кожні 5 хвилин
    setInterval(отриматиIP, 300000);

    створитиМатрицю();
    const валідатор = new ВалідаціяФорми(document.getElementById('loginForm'));
});
