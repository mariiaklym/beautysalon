class ReservationsController < ApplicationController
  before_action :check_admin

  def index
    @reservations = Reservation.for_worker(current_user).for_dates(params[:start_date].try(:to_datetime).try(:beginning_of_day), params[:end_date].try(:to_datetime).try(:end_of_day)).map do |reservation|
      { id: reservation.id,
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
    end
    @notices_counts = Notice.for_dates(params[:start_date].try(:to_datetime).try(:beginning_of_day), params[:end_date].try(:to_datetime).try(:end_of_day)).group(:date).count.keys.map {|d| d.strftime("%d.%m.%Y")}
    @services = Service.all.map {|s| {id: s.id, name: s.name, price: s.price}}
    @users = User.client.map { |user| {label: user.name, value: user.id} }
    @workers = User.worker.map { |user| {label: user.name, value: user.id} }
    @holidays = Holiday.for_dates(params[:start_date].try(:to_datetime).try(:beginning_of_day), params[:end_date].try(:to_datetime).try(:end_of_day)).map { |day| day.date.strftime('%d.%m.%Y') }
    respond_to do |format|
      format.html { render :index }
      format.json {{reservations: @reservations, services: @services, holidays: @holidays }}
    end
  end

  def create
    reservation = Reservation.new(reservation_params)
    if reservation.save
      render json: {success: true,
        reservations: Reservation.for_worker(current_user).for_dates(params[:start_date].try(:to_datetime).try(:beginning_of_day), params[:end_date].try(:to_datetime).try(:end_of_day)).map do |reservation|
          { id: reservation.id,
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
                name: reservation.worker.name,
                phone: reservation.worker.phone,
            },
            services: reservation.services.map { |service| { id: service.id, name: service.name, price: service.price } }
          }
        end
      }
    else
      render json: {success: false, error: reservation.errors.full_messages.first}
    end
  end

  def update
    reservation = Reservation.find(params[:id])
    if reservation.update(reservation_params)
      render json: {success: true, update: true,
        reservations: Reservation.for_worker(current_user).for_dates(params[:start_date].try(:to_datetime).try(:beginning_of_day), params[:end_date].try(:to_datetime).try(:end_of_day)).map do |reservation|
          { id: reservation.id,
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
                name: reservation.worker.name,
                phone: reservation.worker.phone,
            },
            services: reservation.services.map { |service| { id: service.id, name: service.name, price: service.price } }
          }
        end
      }
    else
      render json: {success: false, error: reservation.errors.full_messages.first}
    end
  end

  def destroy
    reservation = Reservation.find(params[:id])
    reservation.destroy
    render json: {success: true,
      reservations: Reservation.for_worker(current_user).for_dates(params[:start_date].try(:to_datetime).try(:beginning_of_day), params[:end_date].try(:to_datetime).try(:end_of_day)).map do |reservation|
        { id: reservation.id,
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
              name: reservation.worker.name,
              phone: reservation.worker.phone,
          },
          services: reservation.services.map { |service| { id: service.id, name: service.name, price: service.price } }
        }
      end
    }
  end

  def table
    @reservations = Reservation.for_worker(current_user).for_status(params[:status]).for_dates(params[:start_date].try(:to_datetime).try(:beginning_of_day), params[:end_date].try(:to_datetime).try(:end_of_day)).map do |reservation|
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
        },
        worker: {
            id: reservation.worker.id,
            name: reservation.worker.name,
            phone: reservation.worker.phone,
        },
        services: reservation.services.map { |service| { id: service.id, name: service.name, price: service.price } }
      }
    end
    @services = Service.all.map {|s| {id: s.id, name: s.name, price: s.price}}
    @users = User.all.map { |user| {label: user.name, value: user.id} }
    @statuses = Reservation.statuses
    respond_to do |format|
      format.html { render :table }
      format.json {{reservations: @reservations}}
    end
  end

  private

  def reservation_params
    params.require(:reservation).permit(:user_id, :worker_id, :start_date, :end_date, :description, :status, :price, service_ids: [])
  end
end