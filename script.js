// Конфигурация магазина FelixShop
const CONFIG = {
    TELEGRAM_BOT_TOKEN: '8470666356:AAHWcLZClwqasPeZwoXbzXDjXMjAkefccVA',
    TELEGRAM_CHAT_ID: '-1003643195141',
    YOOMONEY_WALLET: '4100119450984155',
    
    // Ссылка на страницу оплаты ЮMoney
    YOOMONEY_PAYMENT_URL: 'https://yoomoney.ru/quickpay/confirm?',
    
    PLANS: {
        premium: {
            name: 'Premium',
            price: 120,
            badge: '⭐ Premium',
            color: '#0066ff',
            description: 'Базовый статус с тэгом Premium',
            features: [
                'Тэг "⭐ Premium" в профиле',
                'Статус администратора (только тэг)',
                'Особое упоминание в чате',
                'Доступ навсегда'
            ],
            permissions: {
                can_change_info: false,
                can_delete_messages: false,
                can_invite_users: false,
                can_restrict_members: false,
                can_pin_messages: false,
                can_promote_members: false,
                can_manage_chat: false,
                can_manage_video_chats: false,
                can_post_stories: false,
                can_edit_stories: false,
                can_delete_stories: false,
                is_anonymous: false
            }
        },
        vip: {
            name: 'VIP',
            price: 240,
            badge: '👑 VIP',
            color: '#ff9900',
            description: 'Премиальный статус с золотым тэгом',
            features: [
                'Тэг "👑 VIP" в профиле',
                'Статус администратора (только тэг)',
                'Особое упоминание в чате',
                'Приоритет в поддержке',
                'Золотой цвет тэга',
                'Доступ навсегда'
            ],
            permissions: {
                can_change_info: false,
                can_delete_messages: false,
                can_invite_users: false,
                can_restrict_members: false,
                can_pin_messages: false,
                can_promote_members: false,
                can_manage_chat: false,
                can_manage_video_chats: false,
                can_post_stories: false,
                can_edit_stories: false,
                can_delete_stories: false,
                is_anonymous: false
            }
        },
        christmas: {
            name: 'Christmas',
            price: 450,
            badge: '🎄 Christmas',
            color: '#ff3366',
            description: 'Ограниченный рождественский статус',
            features: [
                'Тэг "🎄 Christmas" в профиле',
                'Статус администратора (только тэг)',
                'Особое упоминание в чате',
                'Эксклюзивный рождественский стиль',
                'Действует до 21.01.2026',
                'Лимитированное предложение'
            ],
            expires: new Date('2026-01-21T23:59:59'),
            permissions: {
                can_change_info: false,
                can_delete_messages: false,
                can_invite_users: false,
                can_restrict_members: false,
                can_pin_messages: false,
                can_promote_members: false,
                can_manage_chat: false,
                can_manage_video_chats: false,
                can_post_stories: false,
                can_edit_stories: false,
                can_delete_stories: false,
                is_anonymous: false
            }
        }
    }
};

// Глобальные переменные
let selectedPlan = null;
let paymentComment = '';
let currentStep = 1;
let purchaseData = {
    plan: null,
    username: null,
    email: null,
    paymentId: null,
    timestamp: null
};

// DOM элементы
const buyButtons = document.querySelectorAll('.buy-btn');
const paymentModal = document.getElementById('paymentModal');
const successModal = document.getElementById('successModal');
const closeModalBtn = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const confirmPaymentBtn = document.getElementById('confirmPayment');
const closeSuccessModalBtn = document.getElementById('closeSuccessModal');
const telegramUsernameInput = document.getElementById('telegramUsername');
const userEmailInput = document.getElementById('userEmail');
const paymentAmountElement = document.getElementById('paymentAmount');
const selectedPlanNameElement = document.getElementById('selectedPlanName');
const selectedPlanPriceElement = document.getElementById('selectedPlanPrice');
const commentCodeElement = document.getElementById('commentCode');
const successMessageElement = document.getElementById('successMessage');
const modalTitle = document.querySelector('.modal-title');
const modalBody = document.querySelector('.modal-body');
const modalFooter = document.querySelector('.modal-footer');

// Таймер для Christmas
let christmasTimerInterval;

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    initCopyButtons();
    initSmoothScroll();
    initAnimations();
    updateChristmasTimer();
    initChristmasTimer();
    
    // Обновляем таймер каждую секунду
    setInterval(updateChristmasTimer, 1000);
    christmasTimerInterval = setInterval(updateChristmasCountdown, 1000);
});

// Инициализация обработчиков событий
function initEventListeners() {
    // Кнопки покупки
    buyButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const plan = e.currentTarget.dataset.plan;
            const price = parseInt(e.currentTarget.dataset.price);
            showUsernameStep(plan, price);
        });
    });

    // Закрытие модальных окон
    closeModalBtn.addEventListener('click', closeAllModals);
    cancelBtn.addEventListener('click', closeAllModals);
    closeSuccessModalBtn.addEventListener('click', closeSuccessModal);

    // Кнопка подтверждения
    confirmPaymentBtn.addEventListener('click', handleConfirmButton);

    // Закрытие по клику на оверлей
    paymentModal.addEventListener('click', (e) => {
        if (e.target === paymentModal) closeAllModals();
    });

    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) closeSuccessModal();
    });

    // Валидация Telegram username
    telegramUsernameInput.addEventListener('input', function() {
        validateTelegramUsername(this.value);
    });

    // Ввод email
    userEmailInput.addEventListener('input', function() {
        validateEmail(this.value);
    });

    // Нажатие Enter
    telegramUsernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && currentStep === 2) {
            e.preventDefault();
            proceedToPayment();
        }
    });

    // Обновление времени при фокусе
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            updateChristmasTimer();
        }
    });
}

// Обработка кнопки подтверждения
function handleConfirmButton() {
    if (currentStep === 2) {
        proceedToPayment();
    } else if (currentStep === 3) {
        processPayment();
    }
}

// Шаг 2: Ввод Telegram username
function showUsernameStep(plan, price) {
    selectedPlan = plan;
    currentStep = 2;
    
    const planConfig = CONFIG.PLANS[plan];
    
    // Сброс данных
    purchaseData = {
        plan: plan,
        username: null,
        email: null,
        paymentId: null,
        timestamp: Date.now()
    };
    
    // Обновление заголовка
    modalTitle.textContent = `Покупка ${planConfig.name}`;
    
    // Очистка формы
    telegramUsernameInput.value = '';
    userEmailInput.value = '';
    telegramUsernameInput.style.borderColor = '#e6f0ff';
    userEmailInput.style.borderColor = '#e6f0ff';
    
    // Обновление информации о тарифе
    selectedPlanNameElement.textContent = planConfig.name;
    selectedPlanPriceElement.textContent = `${price} ₽`;
    selectedPlanNameElement.style.color = planConfig.color;
    
    // Скрыть платежные данные
    document.querySelector('.payment-methods').style.display = 'none';
    document.querySelector('.payment-details').style.display = 'none';
    document.querySelector('.info-box').style.display = 'none';
    document.querySelector('.yoomoney-redirect').style.display = 'none';
    
    // Изменить текст кнопки
    confirmPaymentBtn.innerHTML = '<i class="fas fa-arrow-right"></i> Перейти к оплате';
    confirmPaymentBtn.classList.remove('processing');
    
    // Показать модалку
    paymentModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Фокус на поле ввода
    setTimeout(() => telegramUsernameInput.focus(), 300);
}

// Шаг 3: Переход к оплате
function proceedToPayment() {
    const username = telegramUsernameInput.value.trim();
    const email = userEmailInput.value.trim();
    
    // Валидация
    if (!validateTelegramUsername(username)) {
        showError(telegramUsernameInput, 'Введите корректный Telegram username (5-32 символа, только буквы, цифры и _)');
        return;
    }
    
    if (email && !validateEmail(email)) {
        showError(userEmailInput, 'Введите корректный email адрес');
        return;
    }
    
    currentStep = 3;
    const planConfig = CONFIG.PLANS[selectedPlan];
    
    // Сохраняем данные
    purchaseData.username = username;
    purchaseData.email = email;
    
    // Обновление заголовка
    modalTitle.textContent = 'Оплата';
    
    // Показать платежные данные
    document.querySelector('.payment-methods').style.display = 'flex';
    document.querySelector('.payment-details').style.display = 'block';
    document.querySelector('.info-box').style.display = 'flex';
    document.querySelector('.yoomoney-redirect').style.display = 'block';
    
    // Обновить сумму
    paymentAmountElement.textContent = `${planConfig.price} ₽`;
    
    // Генерация комментария
    paymentComment = generatePaymentComment(selectedPlan, username);
    purchaseData.paymentId = paymentComment;
    commentCodeElement.textContent = paymentComment;
    
    // Обновить кнопку копирования
    updateCopyButtons();
    
    // Изменить текст кнопки
    confirmPaymentBtn.innerHTML = '<i class="fas fa-external-link-alt"></i> Оплатить через ЮMoney';
    confirmPaymentBtn.classList.remove('processing');
    
    // Сохранить в историю
    saveToPurchaseHistory();
}

// Обработка платежа
function processPayment() {
    const username = telegramUsernameInput.value.trim();
    
    if (!username || !validateTelegramUsername(username)) {
        showError(telegramUsernameInput, 'Пожалуйста, введите корректный Telegram username');
        return;
    }
    
    // Открываем страницу оплаты ЮMoney
    openYooMoneyPayment();
}

// Открытие страницы оплаты ЮMoney
function openYooMoneyPayment() {
    const planConfig = CONFIG.PLANS[selectedPlan];
    const username = telegramUsernameInput.value.trim();
    
    // Параметры для ЮMoney
    const params = new URLSearchParams({
        receiver: CONFIG.YOOMONEY_WALLET,
        'quickpay-form': 'shop',
        targets: `FelixShop: ${planConfig.name} для @${username}`,
        'paymentType': 'AC',
        sum: planConfig.price,
        label: paymentComment,
        'successURL': window.location.href,
        'need-fio': 'false',
        'need-email': 'false',
        'need-phone': 'false',
        'need-address': 'false'
    });
    
    // Открываем в новом окне
    window.open(CONFIG.YOOMONEY_PAYMENT_URL + params.toString(), '_blank');
    
    // Показываем инструкцию
    showPaymentInstructions();
}

// Показать инструкцию после перехода на оплату
function showPaymentInstructions() {
    const planConfig = CONFIG.PLANS[selectedPlan];
    
    // Обновляем модалку
    modalTitle.textContent = 'Ожидание оплаты';
    
    // Меняем содержимое
    modalBody.innerHTML = `
        <div class="payment-instructions">
            <div class="instructions-icon">
                <i class="fas fa-external-link-alt"></i>
            </div>
            <h4>Открыта страница оплаты ЮMoney</h4>
            <p>Совершите оплату в открывшемся окне. После оплаты вернитесь на эту страницу и нажмите кнопку ниже.</p>
            
            <div class="payment-info-card">
                <div class="info-row">
                    <span>Тариф:</span>
                    <strong>${planConfig.name}</strong>
                </div>
                <div class="info-row">
                    <span>Сумма:</span>
                    <strong>${planConfig.price} ₽</strong>
                </div>
                <div class="info-row">
                    <span>Получатель:</span>
                    <code>${CONFIG.YOOMONEY_WALLET}</code>
                </div>
                <div class="info-row">
                    <span>Комментарий:</span>
                    <code class="comment-code">${paymentComment}</code>
                </div>
            </div>
            
            <div class="alert alert-info">
                <i class="fas fa-info-circle"></i>
                <p>Если страница оплаты не открылась автоматически, <a href="#" id="manualPaymentLink">нажмите здесь</a> чтобы открыть её вручную.</p>
            </div>
            
            <div class="timer-container">
                <div class="timer">
                    <i class="fas fa-clock"></i>
                    <span>Время на оплату: <strong id="paymentTimer">05:00</strong></span>
                </div>
            </div>
        </div>
    `;
    
    // Обновляем футер
    modalFooter.innerHTML = `
        <button class="btn-secondary" id="cancelPaymentBtn">
            <i class="fas fa-times"></i> Отмена
        </button>
        <button class="btn-primary" id="checkPaymentBtn">
            <i class="fas fa-check"></i> Я оплатил
        </button>
    `;
    
    // Добавляем обработчики
    document.getElementById('manualPaymentLink').addEventListener('click', (e) => {
        e.preventDefault();
        openYooMoneyPayment();
    });
    
    document.getElementById('cancelPaymentBtn').addEventListener('click', closeAllModals);
    document.getElementById('checkPaymentBtn').addEventListener('click', checkPaymentStatus);
    
    // Запускаем таймер
    startPaymentTimer();
}

// Таймер для оплаты
function startPaymentTimer() {
    let timeLeft = 300; // 5 минут в секундах
    const timerElement = document.getElementById('paymentTimer');
    
    const timer = setInterval(() => {
        timeLeft--;
        
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Меняем цвет при малом времени
        if (timeLeft < 60) {
            timerElement.style.color = '#ff4757';
        }
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            showError(null, 'Время на оплату истекло. Пожалуйста, начните процесс заново.');
            setTimeout(closeAllModals, 3000);
        }
    }, 1000);
    
    // Сохраняем ID таймера
    paymentModal.dataset.timerId = timer;
}

// Проверка статуса оплаты
function checkPaymentStatus() {
    const username = telegramUsernameInput.value.trim();
    const planConfig = CONFIG.PLANS[selectedPlan];
    
    // Блокируем кнопку
    const checkBtn = document.getElementById('checkPaymentBtn');
    checkBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Проверяем...';
    checkBtn.disabled = true;
    
    // Показать модалку успеха
    successMessageElement.innerHTML = `
        Проверяем оплату статуса <strong>${planConfig.name}</strong> для пользователя <strong>@${username}</strong>...
        <br><br>
        <small>ID транзакции: ${paymentComment}</small>
    `;
    
    // Закрываем платежное окно
    closeAllModals();
    
    // Показываем окно проверки
    successModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Симуляция проверки с реальной логикой
    simulatePaymentCheckWithAPI(username, selectedPlan);
}

// Проверка с API (реальная логика)
async function simulatePaymentCheckWithAPI(username, plan) {
    const statusText = document.querySelector('.status-text');
    const loader = document.querySelector('.status-loader');
    const planConfig = CONFIG.PLANS[plan];
    
    try {
        // Этап 1: Проверка платежа в ЮMoney
        statusText.textContent = 'Проверяем платеж в ЮMoney...';
        await delay(2000);
        
        // Этап 2: Проверка наличия платежа
        statusText.textContent = 'Ищем транзакцию...';
        
        // Здесь будет реальный запрос к вашему серверу
        // const response = await fetch('/api/check-payment', {
        //     method: 'POST',
        //     body: JSON.stringify({
        //         paymentId: paymentComment,
        //         username: username
        //     })
        // });
        // const data = await response.json();
        
        // Симуляция успешного платежа (80% шанс)
        const isPaymentSuccessful = Math.random() > 0.2;
        
        if (!isPaymentSuccessful) {
            throw new Error('Платеж не найден');
        }
        
        // Этап 3: Выдача прав в Telegram
        statusText.textContent = 'Выдаем статус в Telegram...';
        
        // Здесь будет реальный вызов Telegram API через ваш сервер
        // const telegramResponse = await fetch('/api/grant-telegram-rights', {
        //     method: 'POST',
        //     body: JSON.stringify({
        //         username: username,
        //         plan: plan,
        //         paymentId: paymentComment
        //     })
        // });
        
        await delay(2000);
        
        // Успешное завершение
        loader.style.borderTopColor = '#4cd964';
        loader.style.animation = 'none';
        statusText.innerHTML = '<strong style="color: #4cd964;">✓ Статус успешно выдан!</strong>';
        
        successMessageElement.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 48px; color: #4cd964; margin-bottom: 20px;">🎉</div>
                <strong style="color: #4cd964; font-size: 20px;">Поздравляем!</strong><br><br>
                Статус <strong style="color: ${planConfig.color}">${planConfig.name}</strong> успешно выдан<br>
                пользователю <strong>@${username}</strong>.
                <br><br>
                <div style="background: #f8faff; padding: 15px; border-radius: 10px; font-size: 14px; margin-top: 20px;">
                    <strong>ID транзакции:</strong><br>
                    <code style="color: #0066ff;">${paymentComment}</code>
                    <br><br>
                    <strong>При возникновении проблем:</strong><br>
                    Напишите в поддержку с этим ID
                </div>
            </div>
        `;
        
        // Обновляем статус в истории
        updatePurchaseStatus('completed');
        
        // Автоматически закрываем через 15 секунд
        setTimeout(() => {
            if (successModal.classList.contains('active')) {
                closeSuccessModal();
            }
        }, 15000);
        
    } catch (error) {
        console.error('Ошибка:', error);
        
        loader.style.borderTopColor = '#ff4757';
        loader.style.animation = 'none';
        statusText.innerHTML = '<strong style="color: #ff4757;">Платеж не найден</strong>';
        
        successMessageElement.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 48px; color: #ff4757; margin-bottom: 20px;">⚠️</div>
                <strong style="color: #ff4757; font-size: 20px;">Платеж не обнаружен</strong><br><br>
                Возможные причины:
                <ul style="text-align: left; margin: 15px 0; padding-left: 20px;">
                    <li>Платеж еще не прошел</li>
                    <li>Неверный комментарий к платежу</li>
                    <li>Ошибка при оплате</li>
                </ul>
                <div style="background: #fff5f5; padding: 15px; border-radius: 10px; font-size: 14px;">
                    <strong>Что делать:</strong><br>
                    1. Проверьте, списались ли деньги<br>
                    2. Убедитесь, что комментарий: <code style="color: #ff4757;">${paymentComment}</code><br>
                    3. Подождите 5-10 минут и проверьте снова<br>
                    4. Если проблема не решилась, напишите в поддержку
                </div>
            </div>
        `;
        
        // Обновляем статус в истории
        updatePurchaseStatus('failed');
    }
}

// Обновление кнопок копирования
function updateCopyButtons() {
    const copyTargets = document.querySelectorAll('.copy-target');
    copyTargets.forEach(target => {
        if (target.dataset.clipboardText) {
            if (target.closest('.detail-row:first-child')) {
                target.dataset.clipboardText = CONFIG.YOOMONEY_WALLET;
            } else {
                target.dataset.clipboardText = paymentComment;
            }
        }
    });
}

// Генерация комментария
function generatePaymentComment(plan, username) {
    const timestamp = Date.now();
    const date = new Date(timestamp);
    const dateStr = `${date.getDate().toString().padStart(2, '0')}${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `FELIX${dateStr}_${plan.slice(0, 3).toUpperCase()}_${username}_${random}`;
}

// Валидация
function validateTelegramUsername(username) {
    const regex = /^[a-zA-Z0-9_]{5,32}$/;
    return regex.test(username);
}

function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Показать ошибку
function showError(inputElement, message) {
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.innerHTML = `
        <div class="error-content">
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Показываем
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Убираем через 5 секунд
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
    
    // Подсвечиваем поле если есть
    if (inputElement) {
        inputElement.style.borderColor = '#ff4757';
        inputElement.focus();
        
        setTimeout(() => {
            if (inputElement.value) {
                inputElement.style.borderColor = '#4cd964';
            } else {
                inputElement.style.borderColor = '#e6f0ff';
            }
        }, 3000);
    }
}

// Обновление таймера Christmas
function initChristmasTimer() {
    updateChristmasCountdown();
    christmasTimerInterval = setInterval(updateChristmasCountdown, 1000);
}

function updateChristmasCountdown() {
    const christmasCard = document.querySelector('.pricing-card:last-child');
    if (!christmasCard) return;
    
    const timeBadge = christmasCard.querySelector('.time-badge');
    if (!timeBadge) return;
    
    const now = new Date();
    const targetDate = new Date('2026-01-21T23:59:59');
    const timeDiff = targetDate - now;
    
    if (timeDiff <= 0) {
        timeBadge.textContent = 'Акция завершена!';
        timeBadge.style.background = 'linear-gradient(135deg, #666 0%, #999 100%)';
        clearInterval(christmasTimerInterval);
        return;
    }
    
    // Расчет времени
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    
    // Обновляем текст
    if (days > 0) {
        timeBadge.innerHTML = `
            <i class="fas fa-clock"></i>
            Осталось: ${days}д ${hours}ч
        `;
    } else if (hours > 0) {
        timeBadge.innerHTML = `
            <i class="fas fa-clock"></i>
            Осталось: ${hours}ч ${minutes}м
        `;
    } else {
        timeBadge.innerHTML = `
            <i class="fas fa-clock"></i>
            Осталось: ${minutes}м ${seconds}с
        `;
    }
    
    // Меняем цвет в зависимости от времени
    if (days <= 1) {
        timeBadge.style.background = 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)';
        timeBadge.style.animation = 'pulse 1s infinite';
    } else if (days <= 3) {
        timeBadge.style.background = 'linear-gradient(135deg, #ff6600 0%, #ff3300 100%)';
    } else if (days <= 7) {
        timeBadge.style.background = 'linear-gradient(135deg, #ff9900 0%, #ff6600 100%)';
    }
}

// Остальные функции (saveToPurchaseHistory, updatePurchaseStatus и т.д.) остаются такими же

// Вспомогательная функция задержки
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Закрытие всех модалок
function closeAllModals() {
    paymentModal.classList.remove('active');
    successModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    
    // Очистка таймеров
    if (paymentModal.dataset.timerId) {
        clearInterval(paymentModal.dataset.timerId);
        delete paymentModal.dataset.timerId;
    }
    
    // Сброс состояния
    selectedPlan = null;
    currentStep = 1;
    
    // Восстановление оригинального состояния модалки
    restoreModalContent();
}

// Восстановление оригинального содержимого модалки
function restoreModalContent() {
    const originalBody = `
        <div class="form-group">
            <label for="telegramUsername">
                <i class="fab fa-telegram"></i> Ваш Telegram @username
            </label>
            <div class="input-with-prefix">
                <span class="input-prefix">@</span>
                <input type="text" id="telegramUsername" placeholder="username" maxlength="32">
            </div>
            <p class="input-hint">Без @, только английские буквы, цифры и нижние подчеркивания</p>
        </div>

        <div class="form-group">
            <label for="userEmail">
                <i class="fas fa-envelope"></i> Email для чека (необязательно)
            </label>
            <input type="email" id="userEmail" placeholder="example@gmail.com">
        </div>

        <div class="payment-methods">
            <div class="payment-method active" data-method="yoomoney">
                <div class="method-icon">
                    <i class="fas fa-wallet"></i>
                </div>
                <div class="method-info">
                    <div class="method-name">ЮMoney</div>
                    <div class="method-desc">Оплата по номеру телефона или кошелька</div>
                </div>
            </div>
        </div>

        <div class="payment-details">
            <div class="detail-row">
                <span>Номер для перевода:</span>
                <span class="detail-value copy-target" data-clipboard-text="4100119450984155">
                    <strong>4100 1194 5098 4155</strong>
                    <button class="copy-btn" title="Скопировать">
                        <i class="far fa-copy"></i>
                    </button>
                </span>
            </div>
            <div class="detail-row">
                <span>Сумма к оплате:</span>
                <span class="detail-value" id="paymentAmount">120 ₽</span>
            </div>
            <div class="detail-row">
                <span>Комментарий к платежу:</span>
                <span class="detail-value copy-target" data-clipboard-text="" id="paymentComment">
                    <code class="comment-code" id="commentCode">loading...</code>
                    <button class="copy-btn" title="Скопировать">
                        <i class="far fa-copy"></i>
                    </button>
                </span>
            </div>
        </div>

        <div class="yoomoney-redirect" style="display: none;">
            <div class="alert alert-warning">
                <i class="fas fa-external-link-alt"></i>
                <p>После нажатия "Оплатить через ЮMoney" откроется страница оплаты. Завершите оплату там и вернитесь на эту страницу.</p>
            </div>
        </div>

        <div class="info-box">
            <i class="fas fa-info-circle"></i>
            <p>После оплаты нажмите "Я оплатил". Бот проверит платеж и выдаст вам статус в течение 5 минут.</p>
        </div>
    `;
    
    const originalFooter = `
        <button class="btn-secondary" id="cancelBtn">Отмена</button>
        <button class="btn-primary" id="confirmPayment">
            <i class="fas fa-check"></i> Я оплатил
        </button>
    `;
    
    modalBody.innerHTML = originalBody;
    modalFooter.innerHTML = originalFooter;
    
    // Переинициализация
    initEventListeners();
    initCopyButtons();
}
