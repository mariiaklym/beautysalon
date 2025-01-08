Rails.application.routes.draw do
  root 'reservations#index'

  mount RailsAdmin::Engine => '/admin', as: 'rails_admin'
  mount ActionCable.server => '/cable'

  devise_for :users, :controllers => { registrations: 'registrations' }
  resources :reservations
  resources :users, only: [:index, :show]
  resources :notices, only: [:index, :create, :destroy]
  resources :service_requests, only: [:create, :new, :show]

  get '/table', to: 'reservations#table'
  get '/sell', to: 'pages#sell'
  get '/copy_db', to: 'application#copy_db'
  get '/update_db', to: 'application#update_db'

  post '/barcode', to: 'api#barcode'
end