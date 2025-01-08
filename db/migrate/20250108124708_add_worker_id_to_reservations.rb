class AddWorkerIdToReservations < ActiveRecord::Migration[5.1]
  def change
    add_column :reservations, :worker_id, :integer
  end
end
