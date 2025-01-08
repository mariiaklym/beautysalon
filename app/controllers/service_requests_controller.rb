class ServiceRequestsController < ApplicationController
    # skip_before_action :check_admin
  
    def create
      reservation = Reservation.new(reservation_params)
      if reservation.save
        render json: {success: true,
          reservations: Reservation.for_dates(params[:start_date].try(:to_datetime).try(:beginning_of_day), params[:end_date].try(:to_datetime).try(:end_of_day)).map do |reservation|
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
              services: reservation.services.map { |service| { id: service.id, name: service.name, price: service.price } }
            }
          end
        }
      else
        render json: {success: false, error: reservation.errors.full_messages.first}
      end
    end
  
    def new
        @services = Service.all.map { |service| { id: service.id, name: service.name, price: service.price } }
    end
  
    private
  
    def reservation_params
      params.require(:reservation).permit(:user_id, :start_date, :end_date, :description, :status, :price, service_ids: [])
    end
  end