from datetime import datetime, date
from app import db

class TimeRecord(db.Model):
    """时间记录模型"""
    __tablename__ = 'time_records'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    work_date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    hours = db.Column(db.Numeric(5, 2), nullable=False)  # 工作时长（小时）
    work_content = db.Column(db.Text)  # 工作内容
    work_type = db.Column(db.String(50))  # 工作类型：development, testing, documentation, meeting, etc.
    status = db.Column(db.String(20), default='pending')  # pending, approved, rejected
    approved_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    approved_at = db.Column(db.DateTime)
    approval_comment = db.Column(db.Text)  # 审核意见
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关联关系
    user = db.relationship('User', backref='time_records', foreign_keys=[user_id])
    project = db.relationship('Project', backref='time_records')
    approver = db.relationship('User', backref='approved_records', foreign_keys=[approved_by])
    
    def __repr__(self):
        return f'<TimeRecord {self.user_id}:{self.project_id}:{self.work_date}>'
    
    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_name': self.user.name if self.user else None,
            'project_id': self.project_id,
            'project_name': self.project.name if self.project else None,
            'work_date': self.work_date.isoformat() if self.work_date else None,
            'start_time': self.start_time.strftime('%H:%M') if self.start_time else None,
            'end_time': self.end_time.strftime('%H:%M') if self.end_time else None,
            'hours': float(self.hours) if self.hours else None,
            'work_content': self.work_content,
            'work_type': self.work_type,
            'status': self.status,
            'approved_by': self.approved_by,
            'approver_name': self.approver.name if self.approver else None,
            'approved_at': self.approved_at.isoformat() if self.approved_at else None,
            'approval_comment': self.approval_comment,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def calculate_hours(self):
        """计算工作时长"""
        if self.start_time and self.end_time:
            start_minutes = self.start_time.hour * 60 + self.start_time.minute
            end_minutes = self.end_time.hour * 60 + self.end_time.minute
            total_minutes = end_minutes - start_minutes
            return round(total_minutes / 60, 2)
        return 0
    
    def approve(self, approver_id, comment=None):
        """审核通过"""
        self.status = 'approved'
        self.approved_by = approver_id
        self.approved_at = datetime.utcnow()
        self.approval_comment = comment
        
        try:
            db.session.commit()
            return True, "审核通过"
        except Exception as e:
            db.session.rollback()
            return False, f"审核失败: {str(e)}"
    
    def reject(self, approver_id, comment=None):
        """审核拒绝"""
        self.status = 'rejected'
        self.approved_by = approver_id
        self.approved_at = datetime.utcnow()
        self.approval_comment = comment
        
        try:
            db.session.commit()
            return True, "审核拒绝"
        except Exception as e:
            db.session.rollback()
            return False, f"审核失败: {str(e)}"

class WorkType(db.Model):
    """工作类型模型"""
    __tablename__ = 'work_types'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.String(200))
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<WorkType {self.name}>'
    
    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        } 