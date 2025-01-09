class ServiceRequestsController < ApplicationController
  skip_before_action :authenticate_user!, except: :index

  def index
    @statuses = Reservation.statuses
    @reservations = current_user.reservations.map do |reservation|
      { id: reservation.id,
        title: reservation.user.name,
        description: reservation.description,
        status: reservation.status,
        start: reservation.start_date,
        end: reservation.end_date,
        allDay: false,
        price: reservation.price,
        created_at: reservation.start_date.strftime('%d.%m.%Y %H:%M'),
        user: {
            id: reservation.user.id,
            name: reservation.user.name,
            phone: reservation.user.phone,
            label: reservation.user.name,
            value: reservation.user.id
        },
        worker: {
            id: reservation.worker.id,
            value: reservation.worker.id,
            name: reservation.worker.name,
            label: reservation.worker.name,
            phone: reservation.worker.phone,
        },
        services: reservation.services.map { |service| { id: service.id, name: service.name, price: service.price } }
      }
    end
  end

  def create
    user = current_user || User.find_by(email: reservation_params[:user].try(:[], 'email'))

    unless user
      user = User.new(
          name: reservation_params[:user].try(:[], 'name'),
          email: reservation_params[:user].try(:[], 'email'),
          phone: reservation_params[:user].try(:[], 'phone'),
          password: reservation_params[:user].try(:[], 'password')
      )

      unless user.save
        return render json: { success: false, error: user.errors.full_messages.first }
      end
      sign_in(user)
    end

    reservation = Reservation.new(reservation_params.except(:user))
    reservation.user = user

    if reservation.save
      render json: {
          success: true,
          reservation: {
              id: reservation.id,
              title: reservation.user.name,
              description: reservation.description,
              status: reservation.status,
              start: reservation.start_date,
              end: reservation.end_date,
              allDay: false,
              price: reservation.price,
              user: {
                  id: reservation.user.id,
                  name: reservation.user.name,
                  phone: reservation.user.phone,
                  label: reservation.user.name,
                  value: reservation.user.id
              },
              worker: {
                  id: reservation.worker.id,
                  value: reservation.worker.id,
                  name: reservation.worker.name,
                  label: reservation.worker.name,
                  phone: reservation.worker.phone,
              },
              services: reservation.services.map { |service| { id: service.id, name: service.name, price: service.price } }
          }
      }
    else
      render json: { success: false, error: reservation.errors.full_messages.first }
    end
  end

  def new
    @current_user = current_user
    @services = Service.all.map { |service| { id: service.id, name: service.name, price: service.price } }
    @workers = User.worker.map { |user| {label: user.name, value: user.id} }
  end

  private

  def reservation_params
    params.require(:reservation).permit(:worker_id, :start_date, :end_date, :description, :status, :price,
                                        service_ids: [], user: {})
  end
end