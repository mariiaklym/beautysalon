class ApplicationController < ActionController::Base
  # include ApplicationHelper
  protect_from_forgery with: :exception
  skip_before_action :verify_authenticity_token
  before_action :authenticate_user!
  before_action :configure_permitted_parameters, if: :devise_controller?
  PER = 10

  def check_admin
    @current_user = current_user
    render nothing: true, status: 204 and return if !(current_user.admin? || current_user.worker?)
  end

  def after_sign_in_path_for(resource)
    if resource.client?
      service_requests_path
    else
      root_path
    end
  end

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:name, :email, :password, :password_confirmation, :remember_me])
    devise_parameter_sanitizer.permit(:sign_in, keys: [:name, :email, :password, :password_confirmation, :remember_me])
    devise_parameter_sanitizer.permit(:account_update, keys: [:name, :email, :password, :password_confirmation, :remember_me])
  end
end
