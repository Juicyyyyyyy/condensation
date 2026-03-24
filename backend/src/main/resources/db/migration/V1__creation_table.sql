CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users
(
    id              UUID PRIMARY KEY         DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    username        VARCHAR(50) UNIQUE  NOT NULL,
    password_hash   VARCHAR(255)        NOT NULL,
    steam_id        VARCHAR(100) UNIQUE,
    seniority_badge VARCHAR(50)              DEFAULT 'NOVICE',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE games
(
    id                       UUID PRIMARY KEY         DEFAULT uuid_generate_v4(),
    steam_app_id             INTEGER UNIQUE,
    title                    VARCHAR(255)        NOT NULL,
    slug                     VARCHAR(255) UNIQUE NOT NULL,
    description              TEXT,
    cover_image_url          VARCHAR(500), -- Aspect 3:4 selon le Design System
    banner_image_url         VARCHAR(500), -- Pour le HeroCarousel
    base_price               DECIMAL(10, 2)      NOT NULL,
    current_discount_percent INTEGER                  DEFAULT 0,
    developer                VARCHAR(255),
    publisher                VARCHAR(255),
    release_date             DATE,
    is_trending              BOOLEAN                  DEFAULT false,
    created_at               TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE genres
(
    id   SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE game_genres
(
    game_id  UUID REFERENCES games (id) ON DELETE CASCADE,
    genre_id INTEGER REFERENCES genres (id) ON DELETE CASCADE,
    PRIMARY KEY (game_id, genre_id)
);

CREATE TABLE game_keys
(
    id            UUID PRIMARY KEY         DEFAULT uuid_generate_v4(),
    game_id       UUID REFERENCES games (id) NOT NULL,
    seller_id     UUID REFERENCES users (id),
    key_code      VARCHAR(255)               NOT NULL,
    is_sold       BOOLEAN                  DEFAULT false,
    price_at_sale DECIMAL(10, 2),
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders
(
    id           UUID PRIMARY KEY         DEFAULT uuid_generate_v4(),
    user_id      UUID REFERENCES users (id) NOT NULL,
    total_amount DECIMAL(10, 2)             NOT NULL,
    status       VARCHAR(50)              DEFAULT 'PENDING',
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items
(
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id          UUID REFERENCES orders (id) ON DELETE CASCADE,
    game_key_id       UUID REFERENCES game_keys (id),
    price_at_purchase DECIMAL(10, 2) NOT NULL
);

CREATE TABLE price_alerts
(
    id           UUID PRIMARY KEY         DEFAULT uuid_generate_v4(),
    user_id      UUID REFERENCES users (id) ON DELETE CASCADE,
    game_id      UUID REFERENCES games (id) ON DELETE CASCADE,
    target_price DECIMAL(10, 2),
    is_active    BOOLEAN                  DEFAULT true,
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, game_id)
);