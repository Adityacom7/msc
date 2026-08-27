import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db';

interface TaskAttributes {
  id: number;
  user_id: number;
  username: string;
  title: string;
  description: string | null;
  status: string;
  deadline: Date | null;
  deadline_notified: boolean;
  created_at: Date;
  updated_at: Date;
}

type TaskCreationAttributes = Optional<
  TaskAttributes,
  'id' | 'description' | 'status' | 'deadline' | 'deadline_notified' | 'created_at' | 'updated_at'
>;

export class Task extends Model<TaskAttributes, TaskCreationAttributes> implements TaskAttributes {
  declare id: number;
  declare user_id: number;
  declare username: string;
  declare title: string;
  declare description: string | null;
  declare status: string;
  declare deadline: Date | null;
  declare deadline_notified: boolean;
  declare created_at: Date;
  declare updated_at: Date;
}

Task.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    // Nullable at the DB level only so adding this column doesn't fail on
    // pre-existing rows (Postgres rejects ADD COLUMN ... NOT NULL without a
    // default on a non-empty table). The application always populates it.
    username: { type: DataTypes.TEXT, allowNull: true },
    title: { type: DataTypes.TEXT, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    status: { type: DataTypes.TEXT, allowNull: false, defaultValue: 'pending' },
    deadline: { type: DataTypes.DATE, allowNull: true },
    deadline_notified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'tasks',
    timestamps: false,
  }
);
