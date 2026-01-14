// Серверный скрипт для обработки платежей (Node.js/Express)
const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// Конфигурация
const CONFIG = {
    PORT: process.env.PORT || 3000,
    YOOMONEY_SECRET: process.env.YOOMONEY_SECRET || 'your_secret_key',
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '8470666356:AAHWcLZClwqasPeZwoXbzXDjXMjAkefccVA',
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID || '-1003643195141',
    DATABASE_FILE: path.join(__dirname, 'database.json')
};

// Загрузка базы данных
function loadDatabase() {
    try {
        if (fs.existsSync(CONFIG.DATABASE_FILE)) {
            const data = fs.readFileSync(CONFIG.DATABASE_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Ошибка загрузки БД:', error);
    }
    
    return {
        users: [],
        payments: [],
        settings: {
            lastUpdate: new Date().toISOString()
        }
    };
}

// Сохранение базы данных
function saveDatabase(db) {
    try {
        db.settings.lastUpdate = new Date().toISOString();
        fs.writeFileSync(CONFIG.DATABASE_FILE, 
            JSON.stringify(db, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Ошибка сохранения БД:', error);
        return false;
    }
}

// Верификация подписи ЮMoney
function verifyYooMoneySignature(body, signature) {
    const secret = CONFIG.YOOMONEY_SECRET;
    const checkString = Object.keys(body)
        .sort()
        .map(key => `${key}=${body[key]}`)
        .join('&');
    
    const hash = crypto
        .createHmac('sha1', secret)
        .update(checkString)
        .digest('hex');
    
    return hash === signature;
}

// Получение user_id по username
async function getTelegramUserId(username) {
    try {
        // Пытаемся получить ID через бота
        // Это работает только если пользователь писал боту
        // Альтернатива: просить пользователя предоставить ID
        
        // Временно возвращаем null - нужно будет получать от пользователя
        return null;
    } catch (error) {
        console.error('Ошибка получения Telegram ID:', error);
        return null;
    }
}

// Выдача прав в Telegram
async function grantTelegramRights(username, plan) {
    try {
        const planConfig = {
            premium: {
                custom_title: '⭐ Premium',
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
                custom_title: '👑 VIP',
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
                custom_title: '🎄 Christmas',
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
        };
        
        const config = planConfig[plan];
        if (!config) {
            throw new Error(`Неизвестный тариф: ${plan}`);
        }
        
        // Здесь нужен user_id, а не username
        // Временное решение: сохраняем в БД и выдаем вручную через админку
        // Или просим пользователя предоставить user_id
        
        console.log(`[TELEGRAM] Назначить права для @${username}, тариф: ${plan}`);
        
        return {
            success: true,
            message: 'Права будут назначены после подтверждения',
            note: 'Требуется user_id пользователя для автоматической выдачи'
        };
        
    } catch (error) {
        console.error('Ошибка выдачи прав:', error);
        throw error;
    }
}

// Webhook для ЮMoney
app.post('/api/yoomoney-webhook', (req, res) => {
    try {
        const signature = req.headers['authorization'];
        const body = req.body;
        
        // Верификация подписи
        if (!verifyYooMoneySignature(body, signature)) {
            console.warn('Неверная подпись от ЮMoney');
            return res.status(403).json({ error: 'Invalid signature' });
        }
        
        // Обработка уведомления
        const { notification_type, operation_id, amount, label, datetime } = body;
        
        if (notification_type === 'p2p-incoming') {
            console.log(`[PAYMENT] Новый платеж: ${amount} руб, ID: ${operation_id}`);
            
            // Парсим комментарий (label)
            // Формат: FELIX{дата}_{план}_{username}_{случайный_код}
            const match = label.match(/^FELIX(\d{4})_(PRE|VIP|CHR)_([a-zA-Z0-9_]+)_([A-Z0-9]+)$/);
            
            if (match) {
                const [, date, planCode, username, randomCode] = match;
                const planMap = { PRE: 'premium', VIP: 'vip', CHR: 'christmas' };
                const plan = planMap[planCode] || 'unknown';
                
                // Загружаем БД
                const db = loadDatabase();
                
                // Сохраняем платеж
                db.payments.push({
                    id: operation_id,
                    amount: parseFloat(amount),
                    username: username,
                    plan: plan,
                    label: label,
                    date: datetime,
                    status: 'completed',
                    processed: false
                });
                
                // Сохраняем пользователя
                const existingUser = db.users.find(u => u.username === username);
                if (!existingUser) {
                    db.users.push({
                        username: username,
                        plans: [plan],
                        payments: [operation_id],
                        firstPayment: datetime,
                        lastPayment: datetime,
                        totalSpent: parseFloat(amount)
                    });
                } else {
                    existingUser.plans.push(plan);
                    existingUser.payments.push(operation_id);
                    existingUser.lastPayment = datetime;
                    existingUser.totalSpent += parseFloat(amount);
                }
                
                // Сохраняем БД
                saveDatabase(db);
                
                // Пытаемся выдать права (в реальности нужно user_id)
                grantTelegramRights(username, plan)
                    .then(result => {
                        console.log(`[TELEGRAM] ${result.message} для @${username}`);
                        
                        // Обновляем статус в БД
                        const db = loadDatabase();
                        const payment = db.payments.find(p => p.id === operation_id);
                        if (payment) {
                            payment.processed = true;
                            payment.processedAt = new Date().toISOString();
                            saveDatabase(db);
                        }
                    })
                    .catch(error => {
                        console.error(`[ERROR] Ошибка выдачи прав для @${username}:`, error);
                    });
                
                console.log(`[SUCCESS] Платеж обработан: @${username} - ${plan}`);
                
            } else {
                console.warn(`[WARNING] Неизвестный формат комментария: ${label}`);
            }
        }
        
        res.status(200).json({ status: 'OK' });
        
    } catch (error) {
        console.error('Ошибка обработки webhook:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API для проверки платежа
app.post('/api/check-payment', (req, res) => {
    try {
        const { paymentId, username } = req.body;
        
        const db = loadDatabase();
        const payment = db.payments.find(p => p.id === paymentId || p.label === paymentId);
        
        if (payment && payment.username === username) {
            res.json({
                found: true,
                payment: {
                    id: payment.id,
                    amount: payment.amount,
                    plan: payment.plan,
                    date: payment.date,
                    status: payment.status,
                    processed: payment.processed
                }
            });
        } else {
            res.json({ found: false });
        }
        
    } catch (error) {
        console.error('Ошибка проверки платежа:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API для админки
app.get('/api/admin/users', (req, res) => {
    try {
        const token = req.headers['authorization'];
        
        // Проверка токена
        if (!token || !token.startsWith('Bearer admin_')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        const db = loadDatabase();
        
        // Фильтрация и пагинация
        const { page = 1, limit = 20, filter, search } = req.query;
        let users = [...db.users];
        
        // Поиск
        if (search) {
            const searchLower = search.toLowerCase();
            users = users.filter(u => 
                u.username.toLowerCase().includes(searchLower)
            );
        }
        
        // Фильтр по плану
        if (filter && filter !== 'all') {
            users = users.filter(u => u.plans.includes(filter));
        }
        
        // Пагинация
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedUsers = users.slice(startIndex, endIndex);
        
        res.json({
            users: paginatedUsers,
            total: users.length,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(users.length / limit)
        });
        
    } catch (error) {
        console.error('Ошибка API users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Старт сервера
app.listen(CONFIG.PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${CONFIG.PORT}`);
    console.log(`🌐 Webhook URL: https://your-domain.com/api/yoomoney-webhook`);
    console.log(`💾 База данных: ${CONFIG.DATABASE_FILE}`);
});

// Экспорт для тестирования
module.exports = {
    app,
    loadDatabase,
    saveDatabase,
    verifyYooMoneySignature,
    grantTelegramRights
};
