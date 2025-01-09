Rails.application.routes.draw do
  root 'reservations#index'

  mount RailsAdmin::Engine => '/admin', as: 'rails_admin'
  mount ActionCable.server => '/cable'

  devise_for :users, :controllers => { registrations: 'registrations' }
  resources :reservations
  resources :users, only: [:index, :show]
  resources :notices, only: [:index, :create, :destroy]
  resources :service_requests, only: [:index, :create, :new]

  get '/table', to: 'reservations#table'
end