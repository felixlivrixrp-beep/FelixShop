// Админ панель FelixShop
const ADMIN_CONFIG = {
    API_URL: 'https://your-backend.com/api', // URL вашего сервера
    TELEGRAM_BOT_TOKEN: '8470666356:AAHWcLZClwqasPeZwoXbzXDjXMjAkefccVA',
    ADMIN_PASSWORD: 'felix2024' // Пароль для доступа к админке
};

// Проверка авторизации
function checkAuth() {
    const token = localStorage.getItem('felixshop_admin_token');
    const expiry = localStorage.getItem('felixshop_admin_expiry');
    
    if (!token || !expiry || Date.now() > parseInt(expiry)) {
        showLoginForm();
        return false;
    }
    
    return true;
}

// Форма входа
function showLoginForm() {
    document.body.innerHTML = `
        <div class="admin-login">
            <div class="login-container">
                <div class="login-header">
                    <div class="login-logo">
                        <div class="logo-icon">F</div>
                        <span class="logo-text">FelixShop Admin</span>
                    </div>
                    <h1>Вход в админ панель</h1>
                    <p>Только для администраторов магазина</p>
                </div>
                
                <div class="login-form">
                    <div class="form-group">
                        <label for="adminPassword">
                            <i class="fas fa-key"></i> Пароль администратора
                        </label>
                        <input type="password" id="adminPassword" 
                               placeholder="Введите пароль" autocomplete="off">
                    </div>
                    
                    <div class="form-group">
                        <label for="admin2FA">
                            <i class="fas fa-shield-alt"></i> Код 2FA (опционально)
                        </label>
                        <input type="text" id="admin2FA" 
                               placeholder="000000" maxlength="6">
                    </div>
                    
                    <button id="loginBtn" class="login-btn">
                        <i class="fas fa-sign-in-alt"></i> Войти
                    </button>
                    
                    <div class="login-info">
                        <i class="fas fa-info-circle"></i>
                        <p>Доступ только для владельца магазина. 
                        После входа вы сможете управлять выданными статусами.</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('loginBtn').addEventListener('click', handleLogin);
    
    // Enter для входа
    document.getElementById('adminPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
}

// Обработка входа
function handleLogin() {
    const password = document.getElementById('adminPassword').value;
    const twoFA = document.getElementById('admin2FA').value;
    
    if (password !== ADMIN_CONFIG.ADMIN_PASSWORD) {
        showAdminError('Неверный пароль');
        return;
    }
    
    // Генерация токена
    const token = generateAdminToken();
    const expiry = Date.now() + (24 * 60 * 60 * 1000); // 24 часа
    
    // Сохраняем
    localStorage.setItem('felixshop_admin_token', token);
    localStorage.setItem('felixshop_admin_expiry', expiry.toString());
    
    // Загружаем админ панель
    loadAdminPanel();
}

// Генерация токена
function generateAdminToken() {
    return 'admin_' + Date.now().toString(36) + 
           Math.random().toString(36).substr(2, 9);
}

// Загрузка админ панели
function loadAdminPanel() {
    document.body.innerHTML = `
        <div class="admin-panel">
            <!-- Шапка -->
            <header class="admin-header">
                <div class="admin-navbar">
                    <div class="admin-logo">
                        <div class="logo-icon">F</div>
                        <span class="logo-text">FelixShop Admin</span>
                    </div>
                    
                    <div class="admin-actions">
                        <button id="refreshBtn" class="admin-btn">
                            <i class="fas fa-sync-alt"></i> Обновить
                        </button>
                        <button id="logoutBtn" class="admin-btn danger">
                            <i class="fas fa-sign-out-alt"></i> Выйти
                        </button>
                    </div>
                </div>
            </header>
            
            <!-- Основной контент -->
            <main class="admin-main">
                <div class="admin-container">
                    <!-- Статистика -->
                    <section class="admin-stats">
                        <div class="stat-card">
                            <div class="stat-icon premium">
                                <i class="fas fa-star"></i>
                            </div>
                            <div class="stat-info">
                                <div class="stat-number" id="premiumCount">0</div>
                                <div class="stat-label">Premium</div>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon vip">
                                <i class="fas fa-crown"></i>
                            </div>
                            <div class="stat-info">
                                <div class="stat-number" id="vipCount">0</div>
                                <div class="stat-label">VIP</div>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon christmas">
                                <i class="fas fa-tree"></i>
                            </div>
                            <div class="stat-info">
                                <div class="stat-number" id="christmasCount">0</div>
                                <div class="stat-label">Christmas</div>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon total">
                                <i class="fas fa-users"></i>
                            </div>
                            <div class="stat-info">
                                <div class="stat-number" id="totalUsers">0</div>
                                <div class="stat-label">Всего пользователей</div>
                            </div>
                        </div>
                    </section>
                    
                    <!-- Фильтры и поиск -->
                    <section class="admin-filters">
                        <div class="search-box">
                            <i class="fas fa-search"></i>
                            <input type="text" id="searchInput" 
                                   placeholder="Поиск по username, ID или email...">
                        </div>
                        
                        <div class="filter-buttons">
                            <button class="filter-btn active" data-filter="all">
                                Все
                            </button>
                            <button class="filter-btn" data-filter="premium">
                                Premium
                            </button>
                            <button class="filter-btn" data-filter="vip">
                                VIP
                            </button>
                            <button class="filter-btn" data-filter="christmas">
                                Christmas
                            </button>
                            <button class="filter-btn" data-filter="pending">
                                Ожидают
                            </button>
                            <button class="filter-btn" data-filter="completed">
                                Выданы
                            </button>
                            <button class="filter-btn" data-filter="failed">
                                Ошибки
                            </button>
                        </div>
                    </section>
                    
                    <!-- Таблица пользователей -->
                    <section class="admin-table-section">
                        <div class="table-header">
                            <h3>Управление статусами</h3>
                            <div class="table-actions">
                                <button id="exportBtn" class="action-btn">
                                    <i class="fas fa-download"></i> Экспорт
                                </button>
                                <button id="manualAddBtn" class="action-btn primary">
                                    <i class="fas fa-plus"></i> Добавить вручную
                                </button>
                            </div>
                        </div>
                        
                        <div class="table-container">
                            <table class="admin-table">
                                <thead>
                                    <tr>
                                        <th width="50">ID</th>
                                        <th width="120">Дата</th>
                                        <th width="150">Username</th>
                                        <th width="100">Тариф</th>
                                        <th width="120">Сумма</th>
                                        <th width="200">ID транзакции</th>
                                        <th width="100">Статус</th>
                                        <th width="150">Действия</th>
                                    </tr>
                                </thead>
                                <tbody id="usersTable">
                                    <!-- Данные загружаются динамически -->
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="table-footer">
                            <div class="pagination">
                                <button id="prevPage" class="page-btn" disabled>
                                    <i class="fas fa-chevron-left"></i>
                                </button>
                                <span class="page-info">
                                    Страница <span id="currentPage">1</span> из 
                                    <span id="totalPages">1</span>
                                </span>
                                <button id="nextPage" class="page-btn" disabled>
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                            </div>
                            
                            <div class="table-stats">
                                Показано: <span id="shownCount">0</span> из 
                                <span id="totalCount">0</span>
                            </div>
                        </div>
                    </section>
                    
                    <!-- Лог действий -->
                    <section class="admin-logs">
                        <div class="logs-header">
                            <h3>Лог действий</h3>
                            <button id="clearLogsBtn" class="action-btn small">
                                <i class="fas fa-trash"></i> Очистить
                            </button>
                        </div>
                        
                        <div class="logs-container" id="actionLogs">
                            <!-- Логи загружаются динамически -->
                        </div>
                    </section>
                </div>
            </main>
            
            <!-- Модальные окна -->
            <div class="admin-modal-overlay" id="userModal">
                <div class="admin-modal">
                    <!-- Контент модалки -->
                </div>
            </div>
        </div>
    `;
    
    // Инициализация
    initAdminPanel();
    loadUsersData();
}

// Инициализация админ панели
function initAdminPanel() {
    // Кнопки
    document.getElementById('refreshBtn').addEventListener('click', loadUsersData);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.getElementById('exportBtn').addEventListener('click', exportData);
    document.getElementById('manualAddBtn').addEventListener('click', showAddUserModal);
    document.getElementById('clearLogsBtn').addEventListener('click', clearLogs);
    
    // Пагинация
    document.getElementById('prevPage').addEventListener('click', goToPrevPage);
    document.getElementById('nextPage').addEventListener('click', goToNextPage);
    
    // Фильтры
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applyFilter(btn.dataset.filter);
        });
    });
    
    // Поиск
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            applySearch(searchInput.value);
        }, 300);
    });
    
    // Загружаем логи
    loadActionLogs();
}

// Загрузка данных пользователей
async function loadUsersData() {
    try {
        showLoading();
        
        // Симуляция загрузки данных
        // В реальности здесь будет fetch к вашему серверу
        await delay(1000);
        
        // Пример данных
        const mockData = [
            {
                id: 1,
                date: '2024-12-15 14:30',
                username: 'test_user',
                plan: 'premium',
                amount: 120,
                paymentId: 'FELIX1512_PRE_test_user_ABC123',
                status: 'completed',
                email: 'test@example.com'
            },
            {
                id: 2,
                date: '2024-12-16 10:15',
                username: 'vip_user',
                plan: 'vip',
                amount: 240,
                paymentId: 'FELIX1612_VIP_vip_user_DEF456',
                status: 'pending',
                email: ''
            }
        ];
        
        renderUsersTable(mockData);
        updateStats(mockData);
        
        addLog('Данные пользователей загружены', 'success');
        
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        addLog('Ошибка загрузки данных: ' + error.message, 'error');
        showAdminError('Ошибка загрузки данных');
    }
}

// Рендер таблицы
function renderUsersTable(users) {
    const tbody = document.getElementById('usersTable');
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.dataset.id = user.id;
        row.dataset.plan = user.plan;
        row.dataset.status = user.status;
        
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.date}</td>
            <td>
                <div class="username-cell">
                    <i class="fab fa-telegram"></i>
                    <strong>@${user.username}</strong>
                    ${user.email ? `<br><small>${user.email}</small>` : ''}
                </div>
            </td>
            <td>
                <span class="plan-badge ${user.plan}">${user.plan.toUpperCase()}</span>
            </td>
            <td>${user.amount} ₽</td>
            <td>
                <div class="payment-id">
                    <code>${user.paymentId}</code>
                    <button class="copy-btn small" 
                            data-clipboard-text="${user.paymentId}">
                        <i class="far fa-copy"></i>
                    </button>
                </div>
            </td>
            <td>
                <span class="status-badge ${user.status}">
                    ${getStatusText(user.status)}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    ${user.status === 'pending' ? `
                        <button class="action-btn success grant-btn" 
                                data-userid="${user.id}"
                                data-username="${user.username}"
                                data-plan="${user.plan}">
                            <i class="fas fa-check"></i> Выдать
                        </button>
                    ` : ''}
                    
                    <button class="action-btn info view-btn" 
                            data-userid="${user.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    
                    ${user.status === 'completed' ? `
                        <button class="action-btn warning revoke-btn" 
                                data-userid="${user.id}"
                                data-username="${user.username}">
                            <i class="fas fa-times"></i> Отозвать
                        </button>
                    ` : ''}
                    
                    <button class="action-btn danger delete-btn" 
                            data-userid="${user.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Добавляем обработчики кнопок
    initTableButtons();
}

// Инициализация кнопок в таблице
function initTableButtons() {
    // Копирование
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const text = btn.dataset.clipboardText;
            await copyToClipboard(text);
            showToast('Скопировано в буфер обмена');
        });
    });
    
    // Выдача статуса
    document.querySelectorAll('.grant-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const userId = btn.dataset.userid;
            const username = btn.dataset.username;
            const plan = btn.dataset.plan;
            grantStatusManually(userId, username, plan);
        });
    });
    
    // Просмотр
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const userId = btn.dataset.userid;
            showUserDetails(userId);
        });
    });
    
    // Отзыв статуса
    document.querySelectorAll('.revoke-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const userId = btn.dataset.userid;
            const username = btn.dataset.username;
            revokeStatus(userId, username);
        });
    });
    
    // Удаление
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const userId = btn.dataset.userid;
            deleteUser(userId);
        });
    });
}

// Выдача статуса вручную
async function grantStatusManually(userId, username, plan) {
    if (!confirm(`Выдать статус ${plan.toUpperCase()} пользователю @${username}?`)) {
        return;
    }
    
    try {
        showLoading();
        
        // Здесь будет реальный запрос к Telegram API
        // const response = await fetch('/admin/grant-status', {
        //     method: 'POST',
        //     headers: {
        //         'Authorization': `Bearer ${localStorage.getItem('felixshop_admin_token')}`,
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({
        //         userId: userId,
        //         username: username,
        //         plan: plan
        //     })
        // });
        
        await delay(1500);
        
        // Обновляем статус в таблице
        const row = document.querySelector(`tr[data-id="${userId}"]`);
        if (row) {
            const statusCell = row.querySelector('.status-badge');
            statusCell.textContent = 'Выдан';
            statusCell.className = 'status-badge completed';
            
            // Убираем кнопку выдачи
            const grantBtn = row.querySelector('.grant-btn');
            if (grantBtn) grantBtn.remove();
        }
        
        addLog(`Статус ${plan} выдан пользователю @${username}`, 'success');
        showToast(`Статус успешно выдан для @${username}`);
        
    } catch (error) {
        console.error('Ошибка:', error);
        addLog(`Ошибка выдачи статуса для @${username}: ${error.message}`, 'error');
        showAdminError('Ошибка при выдаче статуса');
    }
}

// Отзыв статуса
async function revokeStatus(userId, username) {
    if (!confirm(`Отозвать статус у пользователя @${username}?`)) {
        return;
    }
    
    try {
        showLoading();
        
        // Здесь будет реальный запрос к Telegram API
        await delay(1500);
        
        // Обновляем статус в таблице
        const row = document.querySelector(`tr[data-id="${userId}"]`);
        if (row) {
            const statusCell = row.querySelector('.status-badge');
            statusCell.textContent = 'Отозван';
            statusCell.className = 'status-badge revoked';
        }
        
        addLog(`Статус отозван у пользователя @${username}`, 'warning');
        showToast(`Статус отозван у @${username}`);
        
    } catch (error) {
        console.error('Ошибка:', error);
        addLog(`Ошибка отзыва статуса у @${username}: ${error.message}`, 'error');
        showAdminError('Ошибка при отзыве статуса');
    }
}

// Удаление пользователя
async function deleteUser(userId) {
    if (!confirm('Удалить запись о пользователе? Это действие нельзя отменить.')) {
        return;
    }
    
    try {
        showLoading();
        
        // Здесь будет реальный запрос к API
        await delay(1000);
        
        // Удаляем строку из таблицы
        const row = document.querySelector(`tr[data-id="${userId}"]`);
        if (row) {
            row.remove();
        }
        
        addLog('Запись пользователя удалена', 'info');
        showToast('Запись удалена');
        
    } catch (error) {
        console.error('Ошибка:', error);
        showAdminError('Ошибка при удалении');
    }
}

// Обновление статистики
function updateStats(users) {
    const premiumCount = users.filter(u => u.plan === 'premium').length;
    const vipCount = users.filter(u => u.plan === 'vip').length;
    const christmasCount = users.filter(u => u.plan === 'christmas').length;
    const totalUsers = users.length;
    
    document.getElementById('premiumCount').textContent = premiumCount;
    document.getElementById('vipCount').textContent = vipCount;
    document.getElementById('christmasCount').textContent = christmasCount;
    document.getElementById('totalUsers').textContent = totalUsers;
}

// Загрузка логов
function loadActionLogs() {
    const logs = JSON.parse(localStorage.getItem('felixshop_admin_logs') || '[]');
    const logsContainer = document.getElementById('actionLogs');
    
    logsContainer.innerHTML = '';
    
    logs.slice(-20).reverse().forEach(log => { // Последние 20 записей
        const logElement = document.createElement('div');
        logElement.className = `log-entry ${log.type}`;
        logElement.innerHTML = `
            <div class="log-time">${log.time}</div>
            <div class="log-message">
                <i class="fas fa-${getLogIcon(log.type)}"></i>
                ${log.message}
            </div>
        `;
        logsContainer.appendChild(logElement);
    });
}

// Добавление лога
function addLog(message, type = 'info') {
    const logs = JSON.parse(localStorage.getItem('felixshop_admin_logs') || '[]');
    
    logs.push({
        time: new Date().toLocaleTimeString(),
        message: message,
        type: type
    });
    
    // Храним максимум 1000 записей
    if (logs.length > 1000) {
        logs.splice(0, logs.length - 1000);
    }
    
    localStorage.setItem('felixshop_admin_logs', JSON.stringify(logs));
    loadActionLogs(); // Обновляем отображение
}

// Очистка логов
function clearLogs() {
    if (confirm('Очистить все логи действий?')) {
        localStorage.removeItem('felixshop_admin_logs');
        loadActionLogs();
        addLog('Логи действий очищены', 'warning');
    }
}

// Экспорт данных
function exportData() {
    const data = {
        timestamp: new Date().toISOString(),
        users: [] // Здесь будут реальные данные
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], 
        { type: 'application/json' });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `felixshop_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    addLog('Данные экспортированы', 'info');
}

// Выход из админки
function handleLogout() {
    localStorage.removeItem('felixshop_admin_token');
    localStorage.removeItem('felixshop_admin_expiry');
    showLoginForm();
}

// Вспомогательные функции
function getStatusText(status) {
    const statusMap = {
        'pending': 'Ожидает',
        'completed': 'Выдан',
        'failed': 'Ошибка',
        'revoked': 'Отозван'
    };
    return statusMap[status] || status;
}

function getLogIcon(type) {
    const iconMap = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return iconMap[type] || 'info-circle';
}

function showLoading() {
    // Показать индикатор загрузки
    const loader = document.createElement('div');
    loader.className = 'admin-loader';
    loader.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    document.body.appendChild(loader);
    
    setTimeout(() => loader.remove(), 1000);
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'admin-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showAdminError(message) {
    showToast(`❌ ${message}`);
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
    }
}

// Инициализация при загрузке
if (window.location.pathname.includes('admin')) {
    if (checkAuth()) {
        loadAdminPanel();
    }
} else {
    console.log('Админ панель доступна по адресу /admin.html');
}
