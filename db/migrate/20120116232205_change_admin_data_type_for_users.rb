class ChangeAdminDataTypeForUsers < ActiveRecord::Migration
  def self.up
    change_table :users do |t|
      t.change :admin, :boolean
    end
  end

  def self.down
    change_table :users do |t|
      t.change :admin, :string
    end
  end
end
