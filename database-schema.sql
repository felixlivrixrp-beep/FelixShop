-- База данных для FelixShop

-- Пользователи
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    telegram_id BIGINT UNIQUE,
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_spent DECIMAL(10, 2) DEFAULT 0
);

-- Платежи
CREATE TABLE payments (
    id VARCHAR(255) PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'RUB',
    plan VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    label VARCHAR(255) NOT NULL,
    yoomoney_id VARCHAR(255),
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Выданные статусы
CREATE TABLE user_plans (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    plan VARCHAR(50) NOT NULL,
    custom_title VARCHAR(100),
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    telegram_message_id BIGINT,
    UNIQUE(user_id, plan)
);

-- Логи действий
CREATE TABLE action_logs (
    id SERIAL PRIMARY KEY,
    action_type VARCHAR(100) NOT NULL,
    user_id INTEGER REFERENCES users(id),
    admin_id INTEGER,
    description TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Промокоды
CREATE TABLE promo_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percent INTEGER,
    discount_amount DECIMAL(10, 2),
    plan VARCHAR(50),
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Использование промокодов
CREATE TABLE promo_usage (
    id SERIAL PRIMARY KEY,
    promo_id INTEGER REFERENCES promo_codes(id),
    user_id INTEGER REFERENCES users(id),
    payment_id VARCHAR(255) REFERENCES payments(id),
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Настройки
CREATE TABLE settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_label ON payments(label);
CREATE INDEX idx_user_plans_user_id ON user_plans(user_id);
CREATE INDEX idx_user_plans_active ON user_plans(is_active);
CREATE INDEX idx_action_logs_created ON action_logs(created_at);

-- Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Вставка начальных настроек
INSERT INTO settings (key, value) VALUES 
    ('shop_name', 'FelixShop'),
    ('telegram_chat_id', '-1003643195141'),
    ('yoomoney_wallet', '4100119450984155'),
    ('support_username', '@FelixShopSupport'),
    ('christmas_end_date', '2026-01-21T23:59:59'),
    ('premium_price', '120'),
    ('vip_price', '240'),
    ('christmas_price', '450');
