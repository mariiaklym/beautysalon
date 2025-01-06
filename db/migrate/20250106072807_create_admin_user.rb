class CreateAdminUser < ActiveRecord::Migration[5.1]
  def change
    User.create(email: 'admin@user.com', name: 'Admin', password: 'superadmin', role: :admin, phone: '380991234567')
  end
end
