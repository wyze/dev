create table if not exists "user" ("id" text not null primary key, "name" text not null, "email" text not null unique, "email_verified" integer not null, "image" text, "created_at" date not null, "updated_at" date not null, "is_anonymous" integer, "username" text not null unique);

create table if not exists "session" ("id" text not null primary key, "expires_at" date not null, "token" text not null unique, "created_at" date not null, "updated_at" date not null, "ip_address" text, "user_agent" text, "user_id" text not null references "user" ("id") on delete cascade);

create table if not exists "account" ("id" text not null primary key, "account_id" text not null, "provider_id" text not null, "user_id" text not null references "user" ("id") on delete cascade, "access_token" text, "refresh_token" text, "id_token" text, "access_token_expires_at" date, "scope" text, "password" text, "created_at" date not null, "updated_at" date not null);

create table if not exists "verification" ("id" text not null primary key, "identifier" text not null, "value" text not null, "expires_at" date not null, "created_at" date, "updated_at" date);
