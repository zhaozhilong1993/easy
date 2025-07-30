from datetime import datetime
from app import db
from app.models.role import Role

class User(db.Model):
    """用户模型"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    employee_id = db.Column(db.String(50), unique=True, nullable=False)
    department = db.Column(db.String(100))
    position = db.Column(db.String(100))
    status = db.Column(db.String(20), default='active')  # active, inactive
    hourly_rate = db.Column(db.Numeric(10, 2))  # 时薪
    monthly_salary = db.Column(db.Numeric(10, 2))  # 月薪
    cost_calculation_method = db.Column(db.String(20), default='hourly')  # hourly, monthly
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关联角色
    roles = db.relationship('Role', secondary='user_roles', backref=db.backref('users', lazy='dynamic'))
    
    @property
    def is_active(self):
        """检查用户是否激活"""
        return self.status == 'active'
    
    def __repr__(self):
        return f'<User {self.username}>'
    
    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'name': self.name,
            'employee_id': self.employee_id,
            'department': self.department,
            'position': self.position,
            'status': self.status,
            'is_active': self.is_active,
            'hourly_rate': float(self.hourly_rate) if self.hourly_rate else None,
            'monthly_salary': float(self.monthly_salary) if self.monthly_salary else None,
            'cost_calculation_method': self.cost_calculation_method,
            'roles': [role.name for role in self.roles],
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def has_role(self, role_name):
        """检查用户是否有指定角色"""
        return any(role.name == role_name for role in self.roles)
    
    def has_permission(self, permission_name):
        """检查用户是否有指定权限"""
        for role in self.roles:
            for permission in role.permissions:
                if permission.name == permission_name:
                    return True
        return False

# 用户角色关联表
user_roles = db.Table('user_roles',
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('role_id', db.Integer, db.ForeignKey('roles.id'), primary_key=True)
) 