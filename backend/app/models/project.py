from datetime import datetime
from app import db

class Project(db.Model):
    """项目模型"""
    __tablename__ = 'projects'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    code = db.Column(db.String(50), unique=True, nullable=False)  # 项目编号
    description = db.Column(db.Text)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date)
    status = db.Column(db.String(20), default='active')  # active, completed, suspended, cancelled
    budget = db.Column(db.Numeric(12, 2))  # 项目预算
    used_budget = db.Column(db.Numeric(12, 2), default=0)  # 已使用预算
    manager_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关联关系
    manager = db.relationship('User', backref='managed_projects', foreign_keys=[manager_id])
    members = db.relationship('ProjectMember', backref='project', lazy='dynamic')
    
    def __repr__(self):
        return f'<Project {self.name}>'
    
    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'name': self.name,
            'code': self.code,
            'description': self.description,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'status': self.status,
            'budget': float(self.budget) if self.budget else None,
            'used_budget': float(self.used_budget) if self.used_budget else None,
            'manager_id': self.manager_id,
            'manager_name': self.manager.name if self.manager else None,
            'member_count': self.members.count(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def get_members(self):
        """获取项目成员列表"""
        return [member.to_dict() for member in self.members.all()]
    
    def add_member(self, user_id, role='member', start_date=None, end_date=None):
        """添加项目成员"""
        from app.models import User
        
        user = User.query.get(user_id)
        if not user:
            return False, "用户不存在"
        
        # 检查是否已经是成员
        existing_member = self.members.filter_by(user_id=user_id).first()
        if existing_member:
            return False, "用户已经是项目成员"
        
        member = ProjectMember(
            project_id=self.id,
            user_id=user_id,
            role=role,
            start_date=start_date or datetime.utcnow().date(),
            end_date=end_date
        )
        
        try:
            db.session.add(member)
            db.session.commit()
            return True, "成员添加成功"
        except Exception as e:
            db.session.rollback()
            return False, f"添加成员失败: {str(e)}"
    
    def remove_member(self, user_id):
        """移除项目成员"""
        member = self.members.filter_by(user_id=user_id).first()
        if not member:
            return False, "用户不是项目成员"
        
        try:
            db.session.delete(member)
            db.session.commit()
            return True, "成员移除成功"
        except Exception as e:
            db.session.rollback()
            return False, f"移除成员失败: {str(e)}"

class ProjectMember(db.Model):
    """项目成员模型"""
    __tablename__ = 'project_members'
    
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    role = db.Column(db.String(50), default='member')  # manager, member, observer
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date)
    status = db.Column(db.String(20), default='active')  # active, inactive
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 关联关系
    user = db.relationship('User', backref='project_memberships')
    
    def __repr__(self):
        return f'<ProjectMember {self.project_id}:{self.user_id}>'
    
    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'project_id': self.project_id,
            'user_id': self.user_id,
            'user_name': self.user.name if self.user else None,
            'user_username': self.user.username if self.user else None,
            'role': self.role,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        } 