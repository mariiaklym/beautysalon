class Reservation < ApplicationRecord
  belongs_to :user
  belongs_to :worker, class_name: 'User', foreign_key: :worker_id
  has_and_belongs_to_many :services

  enum status: [:paid, :not_paid, :partialy_paid, :free]

  validates_presence_of :start_date, :end_date
  validate :check_availability
  validate :check_dates
  validates :price, numericality: { greater_than_or_equal_to: 0 }

  scope :current_month, -> {where('start_date < ? AND end_date > ?', DateTime.now.end_of_month, DateTime.now.beginning_of_month).order('start_date DESC')}
  scope :for_dates, -> (start_date, end_date) {where('start_date <= ? AND end_date >= ?', end_date || DateTime.now.end_of_month, start_date || DateTime.now.beginning_of_month).order('start_date DESC')}
  scope :for_status, -> (status) {where(status: status) if status.present?}
  scope :for_worker, -> (user) do
    if user.admin?
      all
    elsif user.worker?
      where(worker: user)
    else
      Reservation.none
    end
  end

  private

  def check_availability
    existed = Reservation.where('start_date < ? AND end_date > ?', end_date, start_date).where.not(id: id)
    if existed.any? && (start_date_changed? || end_date_changed?)
      errors.add(:base, 'Запис на цей час недоступний')
    end
  end

  def check_dates
    errors.add(:base, 'Час закінчення прийому не може бути раніше часу початку') if start_date >= end_date
  end
end