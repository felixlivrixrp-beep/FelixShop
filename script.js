// Конфигурация
const CONFIG = {
    TELEGRAM_BOT_TOKEN: '8470666356:AAHWcLZClwqasPeZwoXbzXDjXMjAkefccVA',
    TELEGRAM_CHAT_ID: '-1003643195141',
    YOOMONEY_WALLET: '4100119450984155',
    
    PLANS: {
        premium: {
            name: 'Premium',
            price: 120,
            badge: '⭐ Premium',
            permissions: {
                can_change_info: false,
                can_delete_messages: false,
                can_invite_users: false,
                can_restrict_members: false,
                can_pin_messages: false,
                can_promote_members: false,
                can_manage_chat: false,
                can_manage_video_chats: false,
                is_anonymous: false
            }
        },
        vip: {
            name: 'VIP',
            price: 240,
            badge: '👑 VIP',
            permissions: {
                can_change_info: false,
                can_delete_messages: false,
                can_invite_users: false,
                can_restrict_members: false,
                can_pin_messages: false,
                can_promote_members: false,
                can_manage_chat: false,
                can_manage_video_chats: false,
                is_anonymous: false
            }
        },
        christmas: {
            name: 'Christmas',
            price: 450,
            badge: '🎄 Christmas',
            expires: new Date('2024-12-31'),
            permissions: {
                can_change_info: false,
                can_delete_messages: false,
                can_invite_users: false,
                can_restrict_members: false,
                can_pin_messages: false,
                can_promote_members: false,
                can_manage_chat: false,
                can_manage_video_chats: false,
                is_anonymous: false
            }
        }
    }
};

// Глобальные переменные
let selectedPlan = null;
let paymentComment = '';

// DOM элементы
const buyButtons = document.querySelectorAll('.buy-btn');
const paymentModal = document.getElementById('paymentModal');
const successModal = document.getElementById('successModal');
const closeModalBtn = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const confirmPaymentBtn = document.getElementById('confirmPayment');
const closeSuccessModalBtn = document.getElementById('closeSuccessModal');
const telegramUsernameInput = document.getElementById('telegramUsername');
const paymentAmountElement = document.getElementById('paymentAmount');
const selectedPlanNameElement = document.getElementById('selectedPlanName');
const selectedPlanPriceElement = document.getElementById('selectedPlanPrice');
const commentCodeElement = document.getElementById('commentCode');
const successMessageElement = document.getElementById('successMessage');

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    initCopyButtons();
});

// Инициализация обработчиков событий
function initEventListeners() {
    // Кнопки покупки
    buyButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const plan = e.target.dataset.plan;
            const price = parseInt(e.target.dataset.price);
            openPaymentModal(plan, price);
        });
    });

    // Закрытие модальных окон
    closeModalBtn.addEventListener('click', closePaymentModal);
    cancelBtn.addEventListener('click', closePaymentModal);
    closeSuccessModalBtn.addEventListener('click', closeSuccessModal);

    // Подтверждение оплаты
    confirmPaymentBtn.addEventListener('click', confirmPayment);

    // Закрытие по клику на оверлей
    paymentModal.addEventListener('click', (e) => {
        if (e.target === paymentModal) closePaymentModal();
    });

    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) closeSuccessModal();
    });

    // Валидация Telegram username
    telegramUsernameInput.addEventListener('input', validateTelegramUsername);
}

// Копирование текста
function initCopyButtons() {
    document.querySelectorAll('.copy-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const target = e.target.closest('.copy-target');
            const text = target.dataset.clipboardText;
            
            try {
                await navigator.clipboard.writeText(text);
                
                // Визуальный фидбэк
                const originalHTML = button.innerHTML;
                button.innerHTML = '<i class="fas fa-check"></i>';
                button.style.color = '#4cd964';
                
                setTimeout(() => {
                    button.innerHTML = originalHTML;
                    button.style.color = '';
                }, 2000);
            } catch (err) {
                console.error('Ошибка копирования:', err);
            }
        });
    });
}

// Валидация Telegram username
function validateTelegramUsername() {
    const username = telegramUsernameInput.value;
    const regex = /^[a-zA-Z0-9_]{5,32}$/;
    
    if (!regex.test(username)) {
        telegramUsernameInput.style.borderColor = '#ff4757';
        return false;
    } else {
        telegramUsernameInput.style.borderColor = '#4cd964';
        return true;
    }
}

// Генерация уникального комментария для платежа
function generatePaymentComment(plan, username) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 4);
    return `FelixShop_${plan}_${username}_${timestamp}${random}`.toUpperCase();
}

// Открытие модального окна оплаты
function openPaymentModal(plan, price) {
    if (!validateTelegramUsername()) {
        alert('Пожалуйста, введите корректный Telegram username');
        return;
    }

    selectedPlan = plan;
    const planConfig = CONFIG.PLANS[plan];
    
    // Обновление информации в модалке
    selectedPlanNameElement.textContent = planConfig.name;
    selectedPlanPriceElement.textContent = `${price} ₽`;
    paymentAmountElement.textContent = `${price} ₽`;
    
    // Генерация комментария
    paymentComment = generatePaymentComment(plan, telegramUsernameInput.value);
    commentCodeElement.textContent = paymentComment;
    
    // Обновление кнопки копирования
    const copyTarget = document.querySelector('.copy-target[data-clipboard-text]');
    if (copyTarget) {
        copyTarget.dataset.clipboardText = paymentComment;
    }
    
    // Открытие модалки
    paymentModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Закрытие модального окна оплаты
function closePaymentModal() {
    paymentModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    selectedPlan = null;
}

// Закрытие модального окна успеха
function closeSuccessModal() {
    successModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Подтверждение оплаты
async function confirmPayment() {
    const username = telegramUsernameInput.value;
    
    if (!username || !validateTelegramUsername()) {
        alert('Пожалуйста, введите корректный Telegram username');
        return;
    }
    
    if (!selectedPlan) {
        alert('Пожалуйста, выберите тариф');
        return;
    }
    
    // Показать модалку успеха
    const planConfig = CONFIG.PLANS[selectedPlan];
    successMessageElement.innerHTML = `
        Мы получили ваш запрос на выдачу статуса <strong>${planConfig.name}</strong>. 
        Проверяем оплату...
    `;
    
    closePaymentModal();
    successModal.classList.add('active');
    
    // Симуляция проверки платежа (в реальности здесь будет запрос к вашему серверу)
    simulatePaymentCheck(username, selectedPlan);
}

// Симуляция проверки платежа
async function simulatePaymentCheck(username, plan) {
    const statusText = document.querySelector('.status-text');
    const loader = document.querySelector('.status-loader');
    
    // Этап 1: Проверка платежа
    statusText.textContent = 'Проверяем платеж в ЮMoney...';
    await delay(2000);
    
    // Этап 2: Подготовка к выдаче прав
    statusText.textContent = 'Готовим выдачу статуса...';
    await delay(1500);
    
    // Этап 3: Выдача прав в Telegram
    statusText.textContent = 'Выдаем статус в Telegram...';
    
    try {
        // Здесь будет реальный вызов API для выдачи прав
        // await grantTelegramRights(username, plan);
        
        // Симуляция успешной выдачи
        await delay(2000);
        
        // Показать успех
        loader.style.borderTopColor = '#4cd964';
        statusText.innerHTML = '<strong style="color: #4cd964;">✓ Статус успешно выдан!</strong>';
        
        // Обновить сообщение
        successMessageElement.innerHTML = `
            <strong style="color: #4cd964;">Поздравляем!</strong><br><br>
            Статус <strong>${CONFIG.PLANS[plan].name}</strong> успешно выдан пользователю <strong>@${username}</strong>.
            Проверьте свой профиль в Telegram группе!
        `;
        
    } catch (error) {
        // Обработка ошибки
        loader.style.borderTopColor = '#ff4757';
        statusText.innerHTML = '<strong style="color: #ff4757;">Ошибка при выдаче статуса</strong>';
        successMessageElement.innerHTML = `
            <strong style="color: #ff4757;">Произошла ошибка</strong><br><br>
            Пожалуйста, свяжитесь с поддержкой и сообщите ваш платежный комментарий:<br>
            <code>${paymentComment}</code>
        `;
        console.error('Ошибка:', error);
    }
}

// Вспомогательная функция задержки
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Функция для выдачи прав в Telegram (реализация)
async function grantTelegramRights(username, plan) {
    const planConfig = CONFIG.PLANS[plan];
    
    // Здесь будет реальная логика выдачи прав через Telegram Bot API
    // Пример запроса:
    /*
    const response = await fetch(`https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/promoteChatMember`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: CONFIG.TELEGRAM_CHAT_ID,
            user_id: username, // Нужно получить user_id по username
            ...planConfig.permissions
        })
    });
    
    if (!response.ok) {
        throw new Error('Ошибка при выдаче прав');
    }
    
    // Обновление custom title (тэга)
    await fetch(`https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/setChatAdministratorCustomTitle`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: CONFIG.TELEGRAM_CHAT_ID,
            user_id: username,
            custom_title: planConfig.badge
        })
    });
    */
    
    // Для демонстрации просто возвращаем успех
    return { success: true };
}

// Плавная прокрутка для навигации
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Анимация при скролле
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Наблюдаем за элементами для анимации
document.querySelectorAll('.pricing-card, .step').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});
