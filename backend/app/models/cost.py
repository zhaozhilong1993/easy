from datetime import datetime, date
from app import db

class CostCalculation(db.Model):
    """成本计算模型"""
    __tablename__ = 'cost_calculations'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    calculation_date = db.Column(db.Date, nullable=False)  # 计算日期
    work_hours = db.Column(db.Numeric(6, 2), nullable=False)  # 工作时长
    hourly_rate = db.Column(db.Numeric(8, 2), nullable=False)  # 时薪
    total_cost = db.Column(db.Numeric(10, 2), nullable=False)  # 总成本
    calculation_method = db.Column(db.String(20), default='hourly')  # hourly, monthly
    notes = db.Column(db.Text)  # 备注
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 关联关系
    user = db.relationship('User', backref='cost_calculations')
    project = db.relationship('Project', backref='cost_calculations')
    
    def __repr__(self):
        return f'<CostCalculation {self.user_id}:{self.project_id}:{self.calculation_date}>'
    
    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_name': self.user.name if self.user else None,
            'project_id': self.project_id,
            'project_name': self.project.name if self.project else None,
            'calculation_date': self.calculation_date.isoformat() if self.calculation_date else None,
            'work_hours': float(self.work_hours) if self.work_hours else None,
            'hourly_rate': float(self.hourly_rate) if self.hourly_rate else None,
            'total_cost': float(self.total_cost) if self.total_cost else None,
            'calculation_method': self.calculation_method,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class ProjectCost(db.Model):
    """项目成本模型"""
    __tablename__ = 'project_costs'
    
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    calculation_period = db.Column(db.String(20), nullable=False)  # daily, weekly, monthly
    period_start = db.Column(db.Date, nullable=False)  # 期间开始
    period_end = db.Column(db.Date, nullable=False)  # 期间结束
    total_hours = db.Column(db.Numeric(8, 2), default=0)  # 总工作时长
    total_cost = db.Column(db.Numeric(12, 2), default=0)  # 总成本
    member_count = db.Column(db.Integer, default=0)  # 参与人数
    cost_per_hour = db.Column(db.Numeric(8, 2), default=0)  # 平均每小时成本
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关联关系
    project = db.relationship('Project', backref='project_costs')
    
    def __repr__(self):
        return f'<ProjectCost {self.project_id}:{self.calculation_period}:{self.period_start}>'
    
    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'project_id': self.project_id,
            'project_name': self.project.name if self.project else None,
            'calculation_period': self.calculation_period,
            'period_start': self.period_start.isoformat() if self.period_start else None,
            'period_end': self.period_end.isoformat() if self.period_end else None,
            'total_hours': float(self.total_hours) if self.total_hours else None,
            'total_cost': float(self.total_cost) if self.total_cost else None,
            'member_count': self.member_count,
            'cost_per_hour': float(self.cost_per_hour) if self.cost_per_hour else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class CostReport(db.Model):
    """成本报表模型"""
    __tablename__ = 'cost_reports'
    
    id = db.Column(db.Integer, primary_key=True)
    report_name = db.Column(db.String(200), nullable=False)  # 报表名称
    report_type = db.Column(db.String(50), nullable=False)  # personal, project, department, company
    report_period = db.Column(db.String(20), nullable=False)  # daily, weekly, monthly, yearly
    period_start = db.Column(db.Date, nullable=False)  # 期间开始
    period_end = db.Column(db.Date, nullable=False)  # 期间结束
    total_cost = db.Column(db.Numeric(12, 2), default=0)  # 总成本
    total_hours = db.Column(db.Numeric(8, 2), default=0)  # 总工作时长
    average_cost_per_hour = db.Column(db.Numeric(8, 2), default=0)  # 平均每小时成本
    report_data = db.Column(db.Text)  # JSON格式的详细数据
    generated_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 关联关系
    generator = db.relationship('User', backref='generated_reports')
    
    def __repr__(self):
        return f'<CostReport {self.report_name}:{self.report_type}>'
    
    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'report_name': self.report_name,
            'report_type': self.report_type,
            'report_period': self.report_period,
            'period_start': self.period_start.isoformat() if self.period_start else None,
            'period_end': self.period_end.isoformat() if self.period_end else None,
            'total_cost': float(self.total_cost) if self.total_cost else None,
            'total_hours': float(self.total_hours) if self.total_hours else None,
            'average_cost_per_hour': float(self.average_cost_per_hour) if self.average_cost_per_hour else None,
            'report_data': self.report_data,
            'generated_by': self.generated_by,
            'generator_name': self.generator.name if self.generator else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        } 