import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db';

interface UserAttributes {
  id: number;
  username: string;
  password_hash: string;
  created_at: Date;
}

type UserCreationAttributes = Optional<UserAttributes, 'id' | 'created_at'>;

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: number;
  declare username: string;
  declare password_hash: string;
  declare created_at: Date;
}

User.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    username: { type: DataTypes.TEXT, allowNull: false, unique: true },
    password_hash: { type: DataTypes.TEXT, allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: false,
  }
);
