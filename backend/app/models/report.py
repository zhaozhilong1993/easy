from datetime import datetime, date
from app import db

class DailyReport(db.Model):
    """日报模型"""
    __tablename__ = 'daily_reports'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    report_date = db.Column(db.Date, nullable=False)
    work_content = db.Column(db.Text, nullable=False)  # 今日工作内容
    progress = db.Column(db.Text)  # 工作进展
    issues = db.Column(db.Text)  # 遇到的问题
    plans = db.Column(db.Text)  # 明日计划
    work_hours = db.Column(db.Numeric(5, 2), default=0)  # 工作时长
    status = db.Column(db.String(20), default='pending')  # pending, approved, rejected
    approved_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    approved_at = db.Column(db.DateTime)
    approval_comment = db.Column(db.Text)  # 审核意见
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关联关系
    user = db.relationship('User', backref='daily_reports', foreign_keys=[user_id])
    approver = db.relationship('User', backref='approved_daily_reports', foreign_keys=[approved_by])
    
    def __repr__(self):
        return f'<DailyReport {self.user_id}:{self.report_date}>'
    
    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_name': self.user.name if self.user else None,
            'report_date': self.report_date.isoformat() if self.report_date else None,
            'work_content': self.work_content,
            'progress': self.progress,
            'issues': self.issues,
            'plans': self.plans,
            'work_hours': float(self.work_hours) if self.work_hours else None,
            'status': self.status,
            'approved_by': self.approved_by,
            'approver_name': self.approver.name if self.approver else None,
            'approved_at': self.approved_at.isoformat() if self.approved_at else None,
            'approval_comment': self.approval_comment,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
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

class WeeklyReport(db.Model):
    """周报模型"""
    __tablename__ = 'weekly_reports'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    week_start = db.Column(db.Date, nullable=False)  # 周开始日期
    week_end = db.Column(db.Date, nullable=False)  # 周结束日期
    week_summary = db.Column(db.Text, nullable=False)  # 本周总结
    completed_tasks = db.Column(db.Text)  # 完成的任务
    ongoing_tasks = db.Column(db.Text)  # 进行中的任务
    next_week_plans = db.Column(db.Text)  # 下周计划
    challenges = db.Column(db.Text)  # 遇到的挑战
    suggestions = db.Column(db.Text)  # 建议和改进
    total_hours = db.Column(db.Numeric(6, 2), default=0)  # 本周总工作时长
    status = db.Column(db.String(20), default='pending')  # pending, approved, rejected
    approved_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    approved_at = db.Column(db.DateTime)
    approval_comment = db.Column(db.Text)  # 审核意见
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关联关系
    user = db.relationship('User', backref='weekly_reports', foreign_keys=[user_id])
    approver = db.relationship('User', backref='approved_weekly_reports', foreign_keys=[approved_by])
    
    def __repr__(self):
        return f'<WeeklyReport {self.user_id}:{self.week_start}>'
    
    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_name': self.user.name if self.user else None,
            'week_start': self.week_start.isoformat() if self.week_start else None,
            'week_end': self.week_end.isoformat() if self.week_end else None,
            'week_summary': self.week_summary,
            'completed_tasks': self.completed_tasks,
            'ongoing_tasks': self.ongoing_tasks,
            'next_week_plans': self.next_week_plans,
            'challenges': self.challenges,
            'suggestions': self.suggestions,
            'total_hours': float(self.total_hours) if self.total_hours else None,
            'status': self.status,
            'approved_by': self.approved_by,
            'approver_name': self.approver.name if self.approver else None,
            'approved_at': self.approved_at.isoformat() if self.approved_at else None,
            'approval_comment': self.approval_comment,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
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
    
    def calculate_total_hours(self):
        """计算本周总工作时长"""
        from app.models import TimeRecord
        
        # 获取本周的时间记录
        time_records = TimeRecord.query.filter(
            TimeRecord.user_id == self.user_id,
            TimeRecord.work_date >= self.week_start,
            TimeRecord.work_date <= self.week_end,
            TimeRecord.status == 'approved'
        ).all()
        
        total_hours = sum(float(record.hours) for record in time_records)
        self.total_hours = total_hours
        
        try:
            db.session.commit()
            return total_hours
        except Exception as e:
            db.session.rollback()
            return 0 