create table if not exists "user" ("id" text not null primary key, "name" text not null, "email" text not null unique, "email_verified" integer not null, "image" text, "created_at" date not null, "updated_at" date not null);

create table if not exists "session" ("id" text not null primary key, "expires_at" date not null, "token" text not null unique, "created_at" date not null, "updated_at" date not null, "ip_address" text, "user_agent" text, "user_id" text not null references "user" ("id") on delete cascade);

create table if not exists "account" ("id" text not null primary key, "account_id" text not null, "provider_id" text not null, "user_id" text not null references "user" ("id") on delete cascade, "access_token" text, "refresh_token" text, "id_token" text, "access_token_expires_at" date, "refresh_token_expires_at" date, "scope" text, "password" text, "created_at" date not null, "updated_at" date not null);

create table if not exists "verification" ("id" text not null primary key, "identifier" text not null, "value" text not null, "expires_at" date not null, "created_at" date not null, "updated_at" date not null);

create table if not exists "apikey" ("id" text not null primary key, "name" text, "start" text, "prefix" text, "key" text not null, "user_id" text not null references "user" ("id") on delete cascade, "refill_interval" integer, "refill_amount" integer, "last_refill_at" date, "enabled" integer, "rate_limit_enabled" integer, "rate_limit_time_window" integer, "rate_limit_max" integer, "request_count" integer, "remaining" integer, "last_request" date, "expires_at" date, "created_at" date not null, "updated_at" date not null, "permissions" text, "metadata" text);
