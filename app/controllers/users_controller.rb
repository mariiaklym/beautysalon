class UsersController < ApplicationController
  before_action :check_admin
  before_action :set_user, only: :show

  def index
    @users = User.client.map do |user|
      { name:  user.name,
        id:    user.id,
        phone: user.phone,
        email: user.email,
        label: user.name,
        value: user.id
      }
    end
    set_user if params[:id]
    @statuses = Reservation.statuses
    respond_to do |format|
      format.html { render :index }
      format.json {{users: @users }}
    end
  end

  def show
    if @user
      render json: {success: true, user: @user}
    else
      render json: {success: false, error: 'Клієнта не знайдено'}
    end
  end

  private

  def set_user
    user = User.find(params[:id])
    reservations = user.reservations.order('start_date DESC')
    @user = {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        label: user.name,
        value: user.id,
        spent: reservations.sum(:price),
        visits: reservations.count,
        reservations: reservations.map do |reservation|
          { id: reservation.id,
            name: reservation.user.name,
            worker: reservation.worker.name,
            description: reservation.description,
            status: reservation.status,
            start: reservation.start_date.strftime('%d.%m.%Y %H:%M'),
            end: reservation.end_date.strftime('%d.%m.%Y %H:%M'),
            price: reservation.price,
            services: reservation.services.map { |service| { id: service.id, name: service.name, price: service.price } }
          }
        end
    }
  end
end