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
            color: '#0066ff',
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
let currentStep = 1; // 1 - выбор тарифа, 2 - ввод username, 3 - оплата
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

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    initCopyButtons();
    initSmoothScroll();
    initAnimations();
    updateChristmasTimer();
    
    // Обновляем таймер каждую минуту
    setInterval(updateChristmasTimer, 60000);
});

// Инициализация обработчиков событий
function initEventListeners() {
    // Кнопки покупки - переход к шагу 2 (ввод username)
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

    // Кнопка подтверждения (меняет действие в зависимости от шага)
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

    // Нажатие Enter в поле username
    telegramUsernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && currentStep === 2) {
            e.preventDefault();
            proceedToPayment();
        }
    });
}

// Обработка кнопки подтверждения
function handleConfirmButton() {
    if (currentStep === 2) {
        proceedToPayment();
    } else if (currentStep === 3) {
        confirmPaymentFinal();
    }
}

// Шаг 2: Ввод Telegram username
function showUsernameStep(plan, price) {
    selectedPlan = plan;
    currentStep = 2;
    
    const planConfig = CONFIG.PLANS[plan];
    
    // Сброс данных покупки
    purchaseData = {
        plan: plan,
        username: null,
        email: null,
        paymentId: null,
        timestamp: Date.now()
    };
    
    // Обновление заголовка
    modalTitle.textContent = `Покупка ${planConfig.name}`;
    
    // Очистка и настройка формы
    telegramUsernameInput.value = '';
    userEmailInput.value = '';
    telegramUsernameInput.style.borderColor = '#e6f0ff';
    userEmailInput.style.borderColor = '#e6f0ff';
    
    // Обновление информации о тарифе
    selectedPlanNameElement.textContent = planConfig.name;
    selectedPlanPriceElement.textContent = `${price} ₽`;
    selectedPlanNameElement.style.color = planConfig.color;
    
    // Скрыть платежные данные, показать только форму ввода
    document.querySelector('.payment-methods').style.display = 'none';
    document.querySelector('.payment-details').style.display = 'none';
    document.querySelector('.info-box').style.display = 'none';
    
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
    
    // Валидация username
    if (!validateTelegramUsername(username)) {
        showError(telegramUsernameInput, 'Введите корректный Telegram username (5-32 символа, только буквы, цифры и _)');
        return;
    }
    
    // Валидация email (если указан)
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
    
    // Обновить сумму
    paymentAmountElement.textContent = `${planConfig.price} ₽`;
    
    // Генерация комментария
    paymentComment = generatePaymentComment(selectedPlan, username);
    purchaseData.paymentId = paymentComment;
    commentCodeElement.textContent = paymentComment;
    
    // Обновить кнопку копирования
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
    
    // Изменить текст кнопки
    confirmPaymentBtn.innerHTML = '<i class="fas fa-check"></i> Я оплатил';
    confirmPaymentBtn.classList.remove('processing');
    
    // Сохранить в localStorage для истории
    saveToPurchaseHistory();
}

// Генерация уникального комментария
function generatePaymentComment(plan, username) {
    const timestamp = Date.now();
    const date = new Date(timestamp);
    const dateStr = `${date.getDate().toString().padStart(2, '0')}${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `FELIX${dateStr}_${plan.slice(0, 3).toUpperCase()}_${username}_${random}`;
}

// Валидация Telegram username
function validateTelegramUsername(username) {
    const regex = /^[a-zA-Z0-9_]{5,32}$/;
    return regex.test(username);
}

// Валидация email
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Показать ошибку
function showError(inputElement, message) {
    inputElement.style.borderColor = '#ff4757';
    inputElement.focus();
    
    // Временное уведомление
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff4757;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => errorDiv.remove(), 300);
    }, 3000);
}

// Сохранить в историю покупок
function saveToPurchaseHistory() {
    const history = JSON.parse(localStorage.getItem('felixshop_purchases') || '[]');
    history.push({
        ...purchaseData,
        status: 'pending'
    });
    
    // Храним только последние 10 покупок
    if (history.length > 10) {
        history.shift();
    }
    
    localStorage.setItem('felixshop_purchases', JSON.stringify(history));
}

// Финальное подтверждение оплаты
async function confirmPaymentFinal() {
    const username = telegramUsernameInput.value.trim();
    
    if (!username || !validateTelegramUsername(username)) {
        showError(telegramUsernameInput, 'Пожалуйста, введите корректный Telegram username');
        return;
    }
    
    // Блокируем кнопку
    confirmPaymentBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Обработка...';
    confirmPaymentBtn.classList.add('processing');
    confirmPaymentBtn.disabled = true;
    
    // Показать модалку успеха
    const planConfig = CONFIG.PLANS[selectedPlan];
    successMessageElement.innerHTML = `
        Мы получили ваш запрос на выдачу статуса <strong>${planConfig.name}</strong>. 
        Проверяем оплату...
    `;
    
    // Закрыть платежное окно через 0.5 секунды
    setTimeout(() => {
        closeAllModals();
        successModal.classList.add('active');
        confirmPaymentBtn.disabled = false;
        confirmPaymentBtn.classList.remove('processing');
    }, 500);
    
    // Запускаем проверку платежа
    await simulatePaymentCheck(username, selectedPlan);
}

// Симуляция проверки платежа
async function simulatePaymentCheck(username, plan) {
    const statusText = document.querySelector('.status-text');
    const loader = document.querySelector('.status-loader');
    const planConfig = CONFIG.PLANS[plan];
    
    // Этапы проверки
    const stages = [
        { text: 'Проверяем платеж в ЮMoney...', duration: 2000 },
        { text: 'Подтверждаем транзакцию...', duration: 1500 },
        { text: 'Готовим выдачу статуса...', duration: 1200 },
        { text: 'Выдаем статус в Telegram...', duration: 1800 }
    ];
    
    try {
        // Проходим по всем этапам
        for (const stage of stages) {
            statusText.textContent = stage.text;
            await delay(stage.duration);
        }
        
        // Здесь будет реальная интеграция с Telegram API
        // await grantTelegramRights(username, plan);
        
        // Успешное завершение
        loader.style.borderTopColor = '#4cd964';
        loader.style.animation = 'none';
        statusText.innerHTML = '<strong style="color: #4cd964;">✓ Статус успешно выдан!</strong>';
        
        // Обновляем сообщение успеха
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
        
        // Автоматически закрываем через 10 секунд
        setTimeout(() => {
            if (successModal.classList.contains('active')) {
                closeSuccessModal();
            }
        }, 10000);
        
    } catch (error) {
        console.error('Ошибка:', error);
        
        loader.style.borderTopColor = '#ff4757';
        loader.style.animation = 'none';
        statusText.innerHTML = '<strong style="color: #ff4757;">Ошибка при выдаче статуса</strong>';
        
        successMessageElement.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 48px; color: #ff4757; margin-bottom: 20px;">⚠️</div>
                <strong style="color: #ff4757; font-size: 20px;">Произошла ошибка</strong><br><br>
                Пожалуйста, свяжитесь с поддержкой:<br>
                <strong>Telegram:</strong> @FelixShopSupport<br><br>
                <div style="background: #fff5f5; padding: 15px; border-radius: 10px; font-size: 14px;">
                    <strong>ID транзакции:</strong><br>
                    <code style="color: #ff4757;">${paymentComment}</code>
                </div>
            </div>
        `;
        
        // Обновляем статус в истории
        updatePurchaseStatus('failed');
    }
}

// Обновить статус покупки в истории
function updatePurchaseStatus(status) {
    const history = JSON.parse(localStorage.getItem('felixshop_purchases') || '[]');
    const lastPurchase = history[history.length - 1];
    
    if (lastPurchase && lastPurchase.paymentId === paymentComment) {
        lastPurchase.status = status;
        lastPurchase.completedAt = Date.now();
        localStorage.setItem('felixshop_purchases', JSON.stringify(history));
    }
}

// Закрытие всех модалок
function closeAllModals() {
    paymentModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    selectedPlan = null;
    currentStep = 1;
    
    // Сброс кнопки
    confirmPaymentBtn.innerHTML = '<i class="fas fa-arrow-right"></i> Перейти к оплате';
    confirmPaymentBtn.classList.remove('processing');
    confirmPaymentBtn.disabled = false;
}

// Закрытие модального окна успеха
function closeSuccessModal() {
    successModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    
    // Сброс анимации загрузки
    const loader = document.querySelector('.status-loader');
    const statusText = document.querySelector('.status-text');
    
    if (loader) {
        loader.style.borderTopColor = '';
        loader.style.animation = '';
    }
    
    if (statusText) {
        statusText.textContent = 'Проверяем платеж...';
        statusText.innerHTML = 'Проверяем платеж...';
    }
}

// Копирование текста
function initCopyButtons() {
    document.querySelectorAll('.copy-btn').forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const target = this.closest('.copy-target');
            if (!target) return;
            
            const text = target.dataset.clipboardText;
            if (!text) return;
            
            const buttonIcon = this.querySelector('i');
            const originalClass = buttonIcon.className;
            
            try {
                await navigator.clipboard.writeText(text);
                
                // Визуальный фидбэк
                buttonIcon.className = 'fas fa-check';
                this.style.color = '#4cd964';
                
                // Анимация успеха
                this.style.transform = 'scale(1.1)';
                
                setTimeout(() => {
                    buttonIcon.className = originalClass;
                    this.style.color = '';
                    this.style.transform = '';
                }, 2000);
                
            } catch (err) {
                // Fallback для старых браузеров
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.select();
                
                try {
                    document.execCommand('copy');
                    
                    buttonIcon.className = 'fas fa-check';
                    this.style.color = '#4cd964';
                    this.style.transform = 'scale(1.1)';
                    
                    setTimeout(() => {
                        buttonIcon.className = originalClass;
                        this.style.color = '';
                        this.style.transform = '';
                    }, 2000);
                    
                } catch (copyErr) {
                    console.error('Ошибка копирования:', copyErr);
                    buttonIcon.className = 'fas fa-times';
                    this.style.color = '#ff4757';
                    
                    setTimeout(() => {
                        buttonIcon.className = originalClass;
                        this.style.color = '';
                    }, 2000);
                } finally {
                    document.body.removeChild(textArea);
                }
            }
        });
    });
}

// Плавная прокрутка
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '#!') return;
            
            const targetElement = document.querySelector(href);
            if (targetElement) {
                e.preventDefault();
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Обновление активного пункта меню
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                this.classList.add('active');
            }
        });
    });
}

// Анимации при скролле
function initAnimations() {
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
}

// Таймер для Christmas
function updateChristmasTimer() {
    const christmasCard = document.querySelector('.pricing-card:last-child');
    if (!christmasCard) return;
    
    const timeBadge = christmasCard.querySelector('.time-badge');
    if (!timeBadge) return;
    
    const now = new Date();
    const targetDate = new Date('2024-12-31');
    const timeDiff = targetDate - now;
    
    if (timeDiff <= 0) {
        timeBadge.textContent = 'Акция завершена!';
        timeBadge.style.background = 'linear-gradient(135deg, #666 0%, #999 100%)';
        return;
    }
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days <= 12) {
        timeBadge.textContent = `Осталось ${days} дней!`;
        
        // Меняем цвет в зависимости от времени
        if (days <= 3) {
            timeBadge.style.background = 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)';
        } else if (days <= 7) {
            timeBadge.style.background = 'linear-gradient(135deg, #ff6600 0%, #ff3300 100%)';
        }
    }
}

// Вспомогательная функция задержки
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Telegram API интеграция (заглушка - в реальности нужен сервер)
async function grantTelegramRights(username, plan) {
    // ВНИМАНИЕ: Этот код должен выполняться на сервере!
    // Нельзя вызывать Telegram API напрямую из браузера
    
    const planConfig = CONFIG.PLANS[plan];
    
    /*
    // Реальная реализация на сервере:
    const response = await fetch('/api/grant-rights', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            plan: plan,
            paymentId: paymentComment,
            token: CONFIG.TELEGRAM_BOT_TOKEN,
            chatId: CONFIG.TELEGRAM_CHAT_ID,
            permissions: planConfig.permissions,
            customTitle: planConfig.badge
        })
    });
    
    if (!response.ok) {
        throw new Error('Ошибка при выдаче прав');
    }
    
    return await response.json();
    */
    
    // Для демонстрации возвращаем успех
    return { success: true, message: 'Права выданы успешно' };
}

// Добавляем стили для анимаций
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .error-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff4757;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 5px 15px rgba(255, 71, 87, 0.3);
    }
    
    .error-notification i {
        font-size: 20px;
    }
    
    .btn-primary.processing {
        opacity: 0.7;
        cursor: not-allowed;
    }
    
    .fa-spinner {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Проверяем поддержку localStorage
function checkLocalStorage() {
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
    } catch (e) {
        console.warn('localStorage не поддерживается или отключен');
        return false;
    }
}

// Инициализация проверки
if (!checkLocalStorage()) {
    console.log('Используем sessionStorage вместо localStorage');
}
