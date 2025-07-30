from flask import Blueprint, request, jsonify
from datetime import datetime, date, timedelta
from app import db
from app.models import CostCalculation, ProjectCost, CostReport, User, Project, TimeRecord
from app.middlewares.auth import login_required, role_required, permission_required, get_current_user
import json

costs_bp = Blueprint('costs', __name__)

# ==================== 成本计算相关接口 ====================

@costs_bp.route('/calculate', methods=['POST'])
@login_required
@permission_required('cost_calculate')
def calculate_cost():
    """计算个人成本"""
    current_user = get_current_user()
    data = request.get_json()
    
    # 验证必填字段
    required_fields = ['project_id', 'calculation_date']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'message': f'{field}不能为空'}), 400
    
    # 检查项目是否存在
    project = Project.query.get(data['project_id'])
    if not project:
        return jsonify({'message': '项目不存在'}), 400
    
    # 解析日期
    try:
        calculation_date = datetime.strptime(data['calculation_date'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'message': '日期格式错误，请使用YYYY-MM-DD格式'}), 400
    
    # 获取该用户在该项目该日期的时间记录
    time_record = TimeRecord.query.filter(
        TimeRecord.user_id == current_user.id,
        TimeRecord.project_id == data['project_id'],
        TimeRecord.work_date == calculation_date,
        TimeRecord.status == 'approved'
    ).first()
    
    if not time_record:
        return jsonify({'message': '该日期没有已审核的时间记录'}), 400
    
    # 获取用户时薪
    hourly_rate = float(current_user.hourly_rate) if current_user.hourly_rate else 0
    
    # 计算成本
    work_hours = float(time_record.hours)
    total_cost = work_hours * hourly_rate
    
    # 检查是否已有该日期的成本计算
    existing_calculation = CostCalculation.query.filter(
        CostCalculation.user_id == current_user.id,
        CostCalculation.project_id == data['project_id'],
        CostCalculation.calculation_date == calculation_date
    ).first()
    
    if existing_calculation:
        return jsonify({'message': '该日期已有成本计算记录'}), 400
    
    calculation = CostCalculation(
        user_id=current_user.id,
        project_id=data['project_id'],
        calculation_date=calculation_date,
        work_hours=work_hours,
        hourly_rate=hourly_rate,
        total_cost=total_cost,
        calculation_method=current_user.cost_calculation_method or 'hourly',
        notes=data.get('notes', '')
    )
    
    try:
        db.session.add(calculation)
        db.session.commit()
        
        return jsonify({
            'message': '成本计算成功',
            'calculation': calculation.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': '成本计算失败'}), 500

@costs_bp.route('/calculations', methods=['GET'])
@login_required
@permission_required('cost_read')
def get_cost_calculations():
    """获取成本计算记录列表"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    user_id = request.args.get('user_id', type=int)
    project_id = request.args.get('project_id', type=int)
    start_date = request.args.get('start_date', '')
    end_date = request.args.get('end_date', '')
    
    query = CostCalculation.query
    
    if user_id:
        query = query.filter(CostCalculation.user_id == user_id)
    
    if project_id:
        query = query.filter(CostCalculation.project_id == project_id)
    
    if start_date:
        try:
            start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
            query = query.filter(CostCalculation.calculation_date >= start_date_obj)
        except ValueError:
            pass
    
    if end_date:
        try:
            end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
            query = query.filter(CostCalculation.calculation_date <= end_date_obj)
        except ValueError:
            pass
    
    # 按日期倒序排列
    query = query.order_by(CostCalculation.calculation_date.desc(), CostCalculation.created_at.desc())
    
    pagination = query.paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    calculations = [calc.to_dict() for calc in pagination.items]
    
    return jsonify({
        'calculations': calculations,
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page,
        'per_page': per_page
    }), 200

# ==================== 项目成本相关接口 ====================

@costs_bp.route('/project/<int:project_id>', methods=['POST'])
@login_required
@permission_required('cost_calculate')
def calculate_project_cost(project_id):
    """计算项目成本"""
    project = Project.query.get(project_id)
    if not project:
        return jsonify({'message': '项目不存在'}), 404
    
    data = request.get_json()
    calculation_period = data.get('calculation_period', 'daily')  # daily, weekly, monthly
    period_start = data.get('period_start')
    period_end = data.get('period_end')
    
    # 解析日期
    try:
        if period_start:
            period_start = datetime.strptime(period_start, '%Y-%m-%d').date()
        if period_end:
            period_end = datetime.strptime(period_end, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'message': '日期格式错误，请使用YYYY-MM-DD格式'}), 400
    
    # 如果没有指定日期范围，默认计算最近一周
    if not period_start or not period_end:
        end_date = date.today()
        if calculation_period == 'daily':
            start_date = end_date
        elif calculation_period == 'weekly':
            start_date = end_date - timedelta(days=6)
        else:  # monthly
            start_date = end_date - timedelta(days=29)
        period_start = start_date
        period_end = end_date
    
    # 获取项目成员在该期间的时间记录
    time_records = TimeRecord.query.filter(
        TimeRecord.project_id == project_id,
        TimeRecord.work_date >= period_start,
        TimeRecord.work_date <= period_end,
        TimeRecord.status == 'approved'
    ).all()
    
    if not time_records:
        return jsonify({'message': '该期间没有时间记录'}), 400
    
    # 计算总工作时长和成本
    total_hours = sum(float(record.hours) for record in time_records)
    total_cost = 0
    member_ids = set()
    
    for record in time_records:
        user = User.query.get(record.user_id)
        if user and user.hourly_rate:
            cost = float(record.hours) * float(user.hourly_rate)
            total_cost += cost
        member_ids.add(record.user_id)
    
    member_count = len(member_ids)
    cost_per_hour = total_cost / total_hours if total_hours > 0 else 0
    
    # 检查是否已有该期间的项目成本记录
    existing_cost = ProjectCost.query.filter(
        ProjectCost.project_id == project_id,
        ProjectCost.calculation_period == calculation_period,
        ProjectCost.period_start == period_start,
        ProjectCost.period_end == period_end
    ).first()
    
    if existing_cost:
        return jsonify({'message': '该期间已有项目成本记录'}), 400
    
    project_cost = ProjectCost(
        project_id=project_id,
        calculation_period=calculation_period,
        period_start=period_start,
        period_end=period_end,
        total_hours=total_hours,
        total_cost=total_cost,
        member_count=member_count,
        cost_per_hour=cost_per_hour
    )
    
    try:
        db.session.add(project_cost)
        db.session.commit()
        
        return jsonify({
            'message': '项目成本计算成功',
            'project_cost': project_cost.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': '项目成本计算失败'}), 500

@costs_bp.route('/project/<int:project_id>', methods=['GET'])
@login_required
@permission_required('cost_read')
def get_project_costs(project_id):
    """获取项目成本记录"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    calculation_period = request.args.get('calculation_period', '')
    
    query = ProjectCost.query.filter(ProjectCost.project_id == project_id)
    
    if calculation_period:
        query = query.filter(ProjectCost.calculation_period == calculation_period)
    
    # 按期间开始日期倒序排列
    query = query.order_by(ProjectCost.period_start.desc(), ProjectCost.created_at.desc())
    
    pagination = query.paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    costs = [cost.to_dict() for cost in pagination.items]
    
    return jsonify({
        'costs': costs,
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page,
        'per_page': per_page
    }), 200

# ==================== 成本报表相关接口 ====================

@costs_bp.route('/reports', methods=['GET'])
@login_required
@permission_required('report_generate')
def get_cost_reports():
    """获取成本报表列表"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    report_type = request.args.get('report_type', '')
    
    query = CostReport.query
    
    if report_type:
        query = query.filter(CostReport.report_type == report_type)
    
    # 按创建时间倒序排列
    query = query.order_by(CostReport.created_at.desc())
    
    pagination = query.paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    reports = [report.to_dict() for report in pagination.items]
    
    return jsonify({
        'reports': reports,
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page,
        'per_page': per_page
    }), 200

@costs_bp.route('/reports', methods=['POST'])
@login_required
@permission_required('report_generate')
def generate_cost_report():
    """生成成本报表"""
    current_user = get_current_user()
    data = request.get_json()
    
    # 验证必填字段
    required_fields = ['report_name', 'report_type', 'report_period', 'period_start', 'period_end']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'message': f'{field}不能为空'}), 400
    
    # 解析日期
    try:
        period_start = datetime.strptime(data['period_start'], '%Y-%m-%d').date()
        period_end = datetime.strptime(data['period_end'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'message': '日期格式错误，请使用YYYY-MM-DD格式'}), 400
    
    # 根据报表类型生成数据
    report_data = {}
    total_cost = 0
    total_hours = 0
    
    if data['report_type'] == 'personal':
        # 个人成本报表
        user_id = data.get('user_id', current_user.id)
        calculations = CostCalculation.query.filter(
            CostCalculation.user_id == user_id,
            CostCalculation.calculation_date >= period_start,
            CostCalculation.calculation_date <= period_end
        ).all()
        
        total_cost = sum(float(calc.total_cost) for calc in calculations)
        total_hours = sum(float(calc.work_hours) for calc in calculations)
        
        report_data = {
            'user_id': user_id,
            'calculations': [calc.to_dict() for calc in calculations]
        }
    
    elif data['report_type'] == 'project':
        # 项目成本报表
        project_id = data.get('project_id')
        if not project_id:
            return jsonify({'message': '项目ID不能为空'}), 400
        
        project_costs = ProjectCost.query.filter(
            ProjectCost.project_id == project_id,
            ProjectCost.period_start >= period_start,
            ProjectCost.period_end <= period_end
        ).all()
        
        total_cost = sum(float(cost.total_cost) for cost in project_costs)
        total_hours = sum(float(cost.total_hours) for cost in project_costs)
        
        report_data = {
            'project_id': project_id,
            'project_costs': [cost.to_dict() for cost in project_costs]
        }
    
    elif data['report_type'] == 'department':
        # 部门成本报表
        department = data.get('department')
        if not department:
            return jsonify({'message': '部门不能为空'}), 400
        
        users = User.query.filter_by(department=department).all()
        user_ids = [user.id for user in users]
        
        calculations = CostCalculation.query.filter(
            CostCalculation.user_id.in_(user_ids),
            CostCalculation.calculation_date >= period_start,
            CostCalculation.calculation_date <= period_end
        ).all()
        
        total_cost = sum(float(calc.total_cost) for calc in calculations)
        total_hours = sum(float(calc.work_hours) for calc in calculations)
        
        report_data = {
            'department': department,
            'user_count': len(users),
            'calculations': [calc.to_dict() for calc in calculations]
        }
    
    else:  # company
        # 公司成本报表
        calculations = CostCalculation.query.filter(
            CostCalculation.calculation_date >= period_start,
            CostCalculation.calculation_date <= period_end
        ).all()
        
        total_cost = sum(float(calc.total_cost) for calc in calculations)
        total_hours = sum(float(calc.work_hours) for calc in calculations)
        
        report_data = {
            'calculations': [calc.to_dict() for calc in calculations]
        }
    
    average_cost_per_hour = total_cost / total_hours if total_hours > 0 else 0
    
    report = CostReport(
        report_name=data['report_name'],
        report_type=data['report_type'],
        report_period=data['report_period'],
        period_start=period_start,
        period_end=period_end,
        total_cost=total_cost,
        total_hours=total_hours,
        average_cost_per_hour=average_cost_per_hour,
        report_data=json.dumps(report_data),
        generated_by=current_user.id
    )
    
    try:
        db.session.add(report)
        db.session.commit()
        
        return jsonify({
            'message': '成本报表生成成功',
            'report': report.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': '成本报表生成失败'}), 500

@costs_bp.route('/reports/<int:report_id>', methods=['GET'])
@login_required
@permission_required('report_read')
def get_cost_report(report_id):
    """获取成本报表详情"""
    report = CostReport.query.get(report_id)
    
    if not report:
        return jsonify({'message': '成本报表不存在'}), 404
    
    return jsonify({
        'report': report.to_dict()
    }), 200

# ==================== 成本统计接口 ====================

@costs_bp.route('/statistics', methods=['GET'])
@login_required
@permission_required('cost_read')
def get_cost_statistics():
    """获取成本统计"""
    user_id = request.args.get('user_id', type=int)
    project_id = request.args.get('project_id', type=int)
    start_date = request.args.get('start_date', '')
    end_date = request.args.get('end_date', '')
    
    # 个人成本统计
    personal_query = CostCalculation.query
    if user_id:
        personal_query = personal_query.filter(CostCalculation.user_id == user_id)
    if project_id:
        personal_query = personal_query.filter(CostCalculation.project_id == project_id)
    if start_date:
        try:
            start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
            personal_query = personal_query.filter(CostCalculation.calculation_date >= start_date_obj)
        except ValueError:
            pass
    if end_date:
        try:
            end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
            personal_query = personal_query.filter(CostCalculation.calculation_date <= end_date_obj)
        except ValueError:
            pass
    
    calculations = personal_query.all()
    total_personal_cost = sum(float(calc.total_cost) for calc in calculations)
    total_personal_hours = sum(float(calc.work_hours) for calc in calculations)
    
    # 项目成本统计
    project_query = ProjectCost.query
    if project_id:
        project_query = project_query.filter(ProjectCost.project_id == project_id)
    if start_date:
        try:
            start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
            project_query = project_query.filter(ProjectCost.period_start >= start_date_obj)
        except ValueError:
            pass
    if end_date:
        try:
            end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
            project_query = project_query.filter(ProjectCost.period_end <= end_date_obj)
        except ValueError:
            pass
    
    project_costs = project_query.all()
    total_project_cost = sum(float(cost.total_cost) for cost in project_costs)
    total_project_hours = sum(float(cost.total_hours) for cost in project_costs)
    
    return jsonify({
        'personal_costs': {
            'total_cost': total_personal_cost,
            'total_hours': total_personal_hours,
            'average_cost_per_hour': total_personal_cost / total_personal_hours if total_personal_hours > 0 else 0
        },
        'project_costs': {
            'total_cost': total_project_cost,
            'total_hours': total_project_hours,
            'average_cost_per_hour': total_project_cost / total_project_hours if total_project_hours > 0 else 0
        }
    }), 200 