# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20250108124708) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "actions", force: :cascade do |t|
    t.decimal "amount"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id"
  end

  create_table "categories", force: :cascade do |t|
    t.string "name"
    t.decimal "multiplier"
  end

  create_table "holidays", force: :cascade do |t|
    t.date "date"
  end

  create_table "notices", force: :cascade do |t|
    t.string "body"
    t.date "date"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "product_actions", force: :cascade do |t|
    t.integer "action_id"
    t.integer "product_id"
    t.integer "action_type"
    t.decimal "quantity"
    t.decimal "buy_price"
    t.decimal "sell_price"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["action_id"], name: "index_product_actions_on_action_id"
    t.index ["product_id"], name: "index_product_actions_on_product_id"
  end

  create_table "products", force: :cascade do |t|
    t.string "name"
    t.text "description"
    t.string "barcode"
    t.decimal "quantity"
    t.decimal "buy_price"
    t.decimal "sell_price"
    t.integer "category_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.date "due_date"
    t.string "picture_file_name"
    t.string "picture_content_type"
    t.integer "picture_file_size"
    t.datetime "picture_updated_at"
    t.index ["category_id"], name: "index_products_on_category_id"
  end

  create_table "reservations", force: :cascade do |t|
    t.integer "user_id"
    t.datetime "start_date"
    t.datetime "end_date"
    t.jsonb "services"
    t.integer "status"
    t.string "description"
    t.integer "price"
    t.integer "worker_id"
  end

  create_table "reservations_services", id: false, force: :cascade do |t|
    t.bigint "reservation_id", null: false
    t.bigint "service_id", null: false
    t.index ["reservation_id", "service_id"], name: "index_reservations_services_on_reservation_id_and_service_id"
  end

  create_table "services", force: :cascade do |t|
    t.string "name"
    t.integer "price"
  end

  create_table "settings", force: :cascade do |t|
    t.string "working_phone"
  end

  create_table "users", id: :serial, force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "name", null: false
    t.integer "role", default: 0, null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.inet "current_sign_in_ip"
    t.inet "last_sign_in_ip"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "phone"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  create_table "versions", force: :cascade do |t|
    t.string "item_type", null: false
    t.bigint "item_id", null: false
    t.string "event", null: false
    t.string "whodunnit"
    t.text "object"
    t.datetime "created_at"
    t.text "object_changes"
    t.index ["item_type", "item_id"], name: "index_versions_on_item_type_and_item_id"
  end

end
