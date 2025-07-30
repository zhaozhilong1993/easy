from flask import Blueprint, request, jsonify
from datetime import datetime, date, timedelta
from app import db
from app.models import DailyReport, WeeklyReport, User, TimeRecord
from app.middlewares.auth import login_required, role_required, permission_required, get_current_user

reports_bp = Blueprint('reports', __name__)

# ==================== 日报相关接口 ====================

@reports_bp.route('/daily', methods=['GET'])
@login_required
@permission_required('report_read')
def get_daily_reports():
    """获取日报列表"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    user_id = request.args.get('user_id', type=int)
    status = request.args.get('status', '')
    start_date = request.args.get('start_date', '')
    end_date = request.args.get('end_date', '')
    
    query = DailyReport.query
    
    if user_id:
        query = query.filter(DailyReport.user_id == user_id)
    
    if status:
        query = query.filter(DailyReport.status == status)
    
    if start_date:
        try:
            start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
            query = query.filter(DailyReport.report_date >= start_date_obj)
        except ValueError:
            pass
    
    if end_date:
        try:
            end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
            query = query.filter(DailyReport.report_date <= end_date_obj)
        except ValueError:
            pass
    
    # 按日期倒序排列
    query = query.order_by(DailyReport.report_date.desc(), DailyReport.created_at.desc())
    
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

@reports_bp.route('/daily/<int:report_id>', methods=['GET'])
@login_required
@permission_required('report_read')
def get_daily_report(report_id):
    """获取日报详情"""
    report = DailyReport.query.get(report_id)
    
    if not report:
        return jsonify({'message': '日报不存在'}), 404
    
    return jsonify({
        'report': report.to_dict()
    }), 200

@reports_bp.route('/daily', methods=['POST'])
@login_required
@permission_required('report_create')
def create_daily_report():
    """创建日报"""
    current_user = get_current_user()
    data = request.get_json()
    
    # 验证必填字段
    if not data.get('work_content'):
        return jsonify({'message': '工作内容不能为空'}), 400
    
    # 解析日期
    report_date = data.get('report_date')
    if report_date:
        try:
            report_date = datetime.strptime(report_date, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'message': '日期格式错误，请使用YYYY-MM-DD格式'}), 400
    else:
        report_date = date.today()
    
    # 检查是否已有当天的日报
    existing_report = DailyReport.query.filter_by(
        user_id=current_user.id,
        report_date=report_date
    ).first()
    
    if existing_report:
        return jsonify({'message': '该日期已有日报'}), 400
    
    # 计算工作时长
    work_hours = 0
    if report_date:
        time_records = TimeRecord.query.filter(
            TimeRecord.user_id == current_user.id,
            TimeRecord.work_date == report_date,
            TimeRecord.status == 'approved'
        ).all()
        work_hours = sum(float(record.hours) for record in time_records)
    
    report = DailyReport(
        user_id=current_user.id,
        report_date=report_date,
        work_content=data['work_content'],
        progress=data.get('progress', ''),
        issues=data.get('issues', ''),
        plans=data.get('plans', ''),
        work_hours=work_hours
    )
    
    try:
        db.session.add(report)
        db.session.commit()
        
        return jsonify({
            'message': '日报创建成功',
            'report': report.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': '日报创建失败'}), 500

@reports_bp.route('/daily/<int:report_id>', methods=['PUT'])
@login_required
@permission_required('report_update')
def update_daily_report(report_id):
    """更新日报"""
    current_user = get_current_user()
    report = DailyReport.query.get(report_id)
    
    if not report:
        return jsonify({'message': '日报不存在'}), 404
    
    # 只能更新自己的报告，且状态为pending
    if report.user_id != current_user.id:
        return jsonify({'message': '只能更新自己的日报'}), 403
    
    if report.status != 'pending':
        return jsonify({'message': '已审核的报告不能修改'}), 400
    
    data = request.get_json()
    
    # 允许更新的字段
    allowed_fields = ['work_content', 'progress', 'issues', 'plans']
    
    for field in allowed_fields:
        if field in data:
            setattr(report, field, data[field])
    
    try:
        db.session.commit()
        return jsonify({
            'message': '日报更新成功',
            'report': report.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': '日报更新失败'}), 500

@reports_bp.route('/daily/<int:report_id>/approve', methods=['POST'])
@login_required
@permission_required('report_approve')
def approve_daily_report(report_id):
    """审核日报"""
    current_user = get_current_user()
    report = DailyReport.query.get(report_id)
    
    if not report:
        return jsonify({'message': '日报不存在'}), 404
    
    if report.status != 'pending':
        return jsonify({'message': '该报告已审核'}), 400
    
    data = request.get_json()
    action = data.get('action')  # approve 或 reject
    comment = data.get('comment', '')
    
    if action == 'approve':
        success, message = report.approve(current_user.id, comment)
    elif action == 'reject':
        success, message = report.reject(current_user.id, comment)
    else:
        return jsonify({'message': '无效的审核操作'}), 400
    
    if success:
        return jsonify({'message': message}), 200
    else:
        return jsonify({'message': message}), 500

# ==================== 周报相关接口 ====================

@reports_bp.route('/weekly', methods=['GET'])
@login_required
@permission_required('report_read')
def get_weekly_reports():
    """获取周报列表"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    user_id = request.args.get('user_id', type=int)
    status = request.args.get('status', '')
    start_date = request.args.get('start_date', '')
    end_date = request.args.get('end_date', '')
    
    query = WeeklyReport.query
    
    if user_id:
        query = query.filter(WeeklyReport.user_id == user_id)
    
    if status:
        query = query.filter(WeeklyReport.status == status)
    
    if start_date:
        try:
            start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
            query = query.filter(WeeklyReport.week_start >= start_date_obj)
        except ValueError:
            pass
    
    if end_date:
        try:
            end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
            query = query.filter(WeeklyReport.week_end <= end_date_obj)
        except ValueError:
            pass
    
    # 按周开始日期倒序排列
    query = query.order_by(WeeklyReport.week_start.desc(), WeeklyReport.created_at.desc())
    
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

@reports_bp.route('/weekly/<int:report_id>', methods=['GET'])
@login_required
@permission_required('report_read')
def get_weekly_report(report_id):
    """获取周报详情"""
    report = WeeklyReport.query.get(report_id)
    
    if not report:
        return jsonify({'message': '周报不存在'}), 404
    
    return jsonify({
        'report': report.to_dict()
    }), 200

@reports_bp.route('/weekly', methods=['POST'])
@login_required
@permission_required('report_create')
def create_weekly_report():
    """创建周报"""
    current_user = get_current_user()
    data = request.get_json()
    
    # 验证必填字段
    if not data.get('week_summary'):
        return jsonify({'message': '本周总结不能为空'}), 400
    
    # 解析日期
    week_start = data.get('week_start')
    week_end = data.get('week_end')
    
    if week_start:
        try:
            week_start = datetime.strptime(week_start, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'message': '周开始日期格式错误'}), 400
    else:
        # 默认本周
        today = date.today()
        week_start = today - timedelta(days=today.weekday())
    
    if week_end:
        try:
            week_end = datetime.strptime(week_end, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'message': '周结束日期格式错误'}), 400
    else:
        week_end = week_start + timedelta(days=6)
    
    # 检查是否已有该周的周报
    existing_report = WeeklyReport.query.filter_by(
        user_id=current_user.id,
        week_start=week_start
    ).first()
    
    if existing_report:
        return jsonify({'message': '该周已有周报'}), 400
    
    # 计算本周总工作时长
    time_records = TimeRecord.query.filter(
        TimeRecord.user_id == current_user.id,
        TimeRecord.work_date >= week_start,
        TimeRecord.work_date <= week_end,
        TimeRecord.status == 'approved'
    ).all()
    
    total_hours = sum(float(record.hours) for record in time_records)
    
    report = WeeklyReport(
        user_id=current_user.id,
        week_start=week_start,
        week_end=week_end,
        week_summary=data['week_summary'],
        completed_tasks=data.get('completed_tasks', ''),
        ongoing_tasks=data.get('ongoing_tasks', ''),
        next_week_plans=data.get('next_week_plans', ''),
        challenges=data.get('challenges', ''),
        suggestions=data.get('suggestions', ''),
        total_hours=total_hours
    )
    
    try:
        db.session.add(report)
        db.session.commit()
        
        return jsonify({
            'message': '周报创建成功',
            'report': report.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': '周报创建失败'}), 500

@reports_bp.route('/weekly/<int:report_id>', methods=['PUT'])
@login_required
@permission_required('report_update')
def update_weekly_report(report_id):
    """更新周报"""
    current_user = get_current_user()
    report = WeeklyReport.query.get(report_id)
    
    if not report:
        return jsonify({'message': '周报不存在'}), 404
    
    # 只能更新自己的报告，且状态为pending
    if report.user_id != current_user.id:
        return jsonify({'message': '只能更新自己的周报'}), 403
    
    if report.status != 'pending':
        return jsonify({'message': '已审核的报告不能修改'}), 400
    
    data = request.get_json()
    
    # 允许更新的字段
    allowed_fields = ['week_summary', 'completed_tasks', 'ongoing_tasks', 'next_week_plans', 'challenges', 'suggestions']
    
    for field in allowed_fields:
        if field in data:
            setattr(report, field, data[field])
    
    try:
        db.session.commit()
        return jsonify({
            'message': '周报更新成功',
            'report': report.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': '周报更新失败'}), 500

@reports_bp.route('/weekly/<int:report_id>/approve', methods=['POST'])
@login_required
@permission_required('report_approve')
def approve_weekly_report(report_id):
    """审核周报"""
    current_user = get_current_user()
    report = WeeklyReport.query.get(report_id)
    
    if not report:
        return jsonify({'message': '周报不存在'}), 404
    
    if report.status != 'pending':
        return jsonify({'message': '该报告已审核'}), 400
    
    data = request.get_json()
    action = data.get('action')  # approve 或 reject
    comment = data.get('comment', '')
    
    if action == 'approve':
        success, message = report.approve(current_user.id, comment)
    elif action == 'reject':
        success, message = report.reject(current_user.id, comment)
    else:
        return jsonify({'message': '无效的审核操作'}), 400
    
    if success:
        return jsonify({'message': message}), 200
    else:
        return jsonify({'message': message}), 500

# ==================== 报告统计接口 ====================

@reports_bp.route('/statistics', methods=['GET'])
@login_required
@permission_required('report_read')
def get_report_statistics():
    """获取报告统计"""
    user_id = request.args.get('user_id', type=int)
    start_date = request.args.get('start_date', '')
    end_date = request.args.get('end_date', '')
    
    # 日报统计
    daily_query = DailyReport.query
    if user_id:
        daily_query = daily_query.filter(DailyReport.user_id == user_id)
    if start_date:
        try:
            start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
            daily_query = daily_query.filter(DailyReport.report_date >= start_date_obj)
        except ValueError:
            pass
    if end_date:
        try:
            end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
            daily_query = daily_query.filter(DailyReport.report_date <= end_date_obj)
        except ValueError:
            pass
    
    daily_reports = daily_query.all()
    daily_count = len(daily_reports)
    daily_approved = len([r for r in daily_reports if r.status == 'approved'])
    daily_pending = len([r for r in daily_reports if r.status == 'pending'])
    
    # 周报统计
    weekly_query = WeeklyReport.query
    if user_id:
        weekly_query = weekly_query.filter(WeeklyReport.user_id == user_id)
    if start_date:
        try:
            start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
            weekly_query = weekly_query.filter(WeeklyReport.week_start >= start_date_obj)
        except ValueError:
            pass
    if end_date:
        try:
            end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
            weekly_query = weekly_query.filter(WeeklyReport.week_end <= end_date_obj)
        except ValueError:
            pass
    
    weekly_reports = weekly_query.all()
    weekly_count = len(weekly_reports)
    weekly_approved = len([r for r in weekly_reports if r.status == 'approved'])
    weekly_pending = len([r for r in weekly_reports if r.status == 'pending'])
    
    return jsonify({
        'daily_reports': {
            'total': daily_count,
            'approved': daily_approved,
            'pending': daily_pending,
            'rejected': daily_count - daily_approved - daily_pending
        },
        'weekly_reports': {
            'total': weekly_count,
            'approved': weekly_approved,
            'pending': weekly_pending,
            'rejected': weekly_count - weekly_approved - weekly_pending
        }
    }), 200 