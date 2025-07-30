from flask import Blueprint, request, jsonify
from datetime import datetime, date, timedelta
from app import db
from app.models import TimeRecord, WorkType, User, Project
from app.middlewares.auth import login_required, role_required

time_records_bp = Blueprint('time_records', __name__)

@time_records_bp.route('/', methods=['GET'])
@login_required
def get_time_records():
    """获取时间记录列表"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    user_id = request.args.get('user_id', type=int)
    project_id = request.args.get('project_id', type=int)
    status = request.args.get('status', '')
    start_date = request.args.get('start_date', '')
    end_date = request.args.get('end_date', '')
    
    query = TimeRecord.query
    
    if user_id:
        query = query.filter(TimeRecord.user_id == user_id)
    
    if project_id:
        query = query.filter(TimeRecord.project_id == project_id)
    
    if status:
        query = query.filter(TimeRecord.status == status)
    
    if start_date:
        try:
            start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
            query = query.filter(TimeRecord.work_date >= start_date_obj)
        except ValueError:
            pass
    
    if end_date:
        try:
            end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
            query = query.filter(TimeRecord.work_date <= end_date_obj)
        except ValueError:
            pass
    
    # 按日期倒序排列
    query = query.order_by(TimeRecord.work_date.desc(), TimeRecord.created_at.desc())
    
    pagination = query.paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    records = [record.to_dict() for record in pagination.items]
    
    return jsonify({
        'records': records,
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page,
        'per_page': per_page
    }), 200

@time_records_bp.route('/<int:record_id>', methods=['GET'])
@login_required
def get_time_record(record_id):
    """获取时间记录详情"""
    record = TimeRecord.query.get(record_id)
    
    if not record:
        return jsonify({'message': '时间记录不存在'}), 404
    
    return jsonify({
        'record': record.to_dict()
    }), 200

@time_records_bp.route('/', methods=['POST'])
@login_required
def create_time_record():
    """创建时间记录"""
    current_user = request.current_user
    data = request.get_json()
    
    # 验证必填字段
    required_fields = ['project_id', 'work_date', 'start_time', 'end_time', 'work_content']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'message': f'{field}不能为空'}), 400
    
    # 检查项目是否存在
    project = Project.query.get(data['project_id'])
    if not project:
        return jsonify({'message': '项目不存在'}), 400
    
    # 检查用户是否是项目成员
    if not project.members.filter_by(user_id=current_user.id).first():
        return jsonify({'message': '您不是该项目的成员'}), 403
    
    # 解析日期和时间
    try:
        work_date = datetime.strptime(data['work_date'], '%Y-%m-%d').date()
        start_time = datetime.strptime(data['start_time'], '%H:%M').time()
        end_time = datetime.strptime(data['end_time'], '%H:%M').time()
    except ValueError:
        return jsonify({'message': '日期或时间格式错误'}), 400
    
    # 检查时间逻辑
    if start_time >= end_time:
        return jsonify({'message': '开始时间必须早于结束时间'}), 400
    
    # 计算工作时长
    start_minutes = start_time.hour * 60 + start_time.minute
    end_minutes = end_time.hour * 60 + end_time.minute
    hours = round((end_minutes - start_minutes) / 60, 2)
    
    # 检查是否已有同一天的时间记录
    existing_record = TimeRecord.query.filter_by(
        user_id=current_user.id,
        project_id=data['project_id'],
        work_date=work_date
    ).first()
    
    if existing_record:
        return jsonify({'message': '该日期已有时间记录'}), 400
    
    record = TimeRecord(
        user_id=current_user.id,
        project_id=data['project_id'],
        work_date=work_date,
        start_time=start_time,
        end_time=end_time,
        hours=hours,
        work_content=data['work_content'],
        work_type=data.get('work_type', 'development')
    )
    
    try:
        db.session.add(record)
        db.session.commit()
        
        return jsonify({
            'message': '时间记录创建成功',
            'record': record.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': '时间记录创建失败'}), 500

@time_records_bp.route('/<int:record_id>', methods=['PUT'])
@login_required
def update_time_record(record_id):
    """更新时间记录"""
    current_user = request.current_user
    record = TimeRecord.query.get(record_id)
    
    if not record:
        return jsonify({'message': '时间记录不存在'}), 404
    
    # 只能更新自己的记录，且状态为pending
    if record.user_id != current_user.id:
        return jsonify({'message': '只能更新自己的时间记录'}), 403
    
    if record.status != 'pending':
        return jsonify({'message': '已审核的记录不能修改'}), 400
    
    data = request.get_json()
    
    # 允许更新的字段
    allowed_fields = ['start_time', 'end_time', 'work_content', 'work_type']
    
    for field in allowed_fields:
        if field in data:
            if field in ['start_time', 'end_time']:
                try:
                    time_value = datetime.strptime(data[field], '%H:%M').time()
                    setattr(record, field, time_value)
                except ValueError:
                    return jsonify({'message': '时间格式错误，请使用HH:MM格式'}), 400
            else:
                setattr(record, field, data[field])
    
    # 重新计算工作时长
    if 'start_time' in data or 'end_time' in data:
        record.hours = record.calculate_hours()
    
    try:
        db.session.commit()
        return jsonify({
            'message': '时间记录更新成功',
            'record': record.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': '时间记录更新失败'}), 500

@time_records_bp.route('/<int:record_id>', methods=['DELETE'])
@login_required
def delete_time_record(record_id):
    """删除时间记录"""
    current_user = request.current_user
    record = TimeRecord.query.get(record_id)
    
    if not record:
        return jsonify({'message': '时间记录不存在'}), 404
    
    # 只能删除自己的记录，且状态为pending
    if record.user_id != current_user.id:
        return jsonify({'message': '只能删除自己的时间记录'}), 403
    
    if record.status != 'pending':
        return jsonify({'message': '已审核的记录不能删除'}), 400
    
    try:
        db.session.delete(record)
        db.session.commit()
        return jsonify({'message': '时间记录删除成功'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': '时间记录删除失败'}), 500

@time_records_bp.route('/<int:record_id>/approve', methods=['POST'])
@login_required
def approve_time_record(record_id):
    """审核时间记录"""
    current_user = request.current_user
    record = TimeRecord.query.get(record_id)
    
    if not record:
        return jsonify({'message': '时间记录不存在'}), 404
    
    if record.status != 'pending':
        return jsonify({'message': '该记录已审核'}), 400
    
    data = request.get_json()
    action = data.get('action')  # approve 或 reject
    comment = data.get('comment', '')
    
    if action == 'approve':
        success, message = record.approve(current_user.id, comment)
    elif action == 'reject':
        success, message = record.reject(current_user.id, comment)
    else:
        return jsonify({'message': '无效的审核操作'}), 400
    
    if success:
        return jsonify({'message': message}), 200
    else:
        return jsonify({'message': message}), 500

@time_records_bp.route('/statistics', methods=['GET'])
@login_required
def get_time_statistics():
    """获取时间统计"""
    user_id = request.args.get('user_id', type=int)
    project_id = request.args.get('project_id', type=int)
    start_date = request.args.get('start_date', '')
    end_date = request.args.get('end_date', '')
    
    query = TimeRecord.query.filter(TimeRecord.status == 'approved')
    
    if user_id:
        query = query.filter(TimeRecord.user_id == user_id)
    
    if project_id:
        query = query.filter(TimeRecord.project_id == project_id)
    
    if start_date:
        try:
            start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
            query = query.filter(TimeRecord.work_date >= start_date_obj)
        except ValueError:
            pass
    
    if end_date:
        try:
            end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
            query = query.filter(TimeRecord.work_date <= end_date_obj)
        except ValueError:
            pass
    
    records = query.all()
    
    # 计算统计信息
    total_hours = sum(float(record.hours) for record in records)
    total_days = len(set(record.work_date for record in records))
    
    # 按项目统计
    project_stats = {}
    for record in records:
        project_name = record.project.name if record.project else '未知项目'
        if project_name not in project_stats:
            project_stats[project_name] = {'hours': 0, 'days': set()}
        project_stats[project_name]['hours'] += float(record.hours)
        project_stats[project_name]['days'].add(record.work_date)
    
    for project_name in project_stats:
        project_stats[project_name]['days'] = len(project_stats[project_name]['days'])
    
    return jsonify({
        'total_hours': total_hours,
        'total_days': total_days,
        'project_statistics': project_stats
    }), 200

@time_records_bp.route('/work-types', methods=['GET'])
@login_required
def get_work_types():
    """获取工作类型列表"""
    work_types = WorkType.query.filter_by(is_active=True).all()
    
    return jsonify({
        'work_types': [wt.to_dict() for wt in work_types]
    }), 200

@time_records_bp.route('/work-types', methods=['POST'])
@login_required
@role_required('admin')
def create_work_type():
    """创建工作类型"""
    data = request.get_json()
    
    if not data.get('name'):
        return jsonify({'message': '工作类型名称不能为空'}), 400
    
    # 检查是否已存在
    if WorkType.query.filter_by(name=data['name']).first():
        return jsonify({'message': '工作类型已存在'}), 400
    
    work_type = WorkType(
        name=data['name'],
        description=data.get('description', '')
    )
    
    try:
        db.session.add(work_type)
        db.session.commit()
        
        return jsonify({
            'message': '工作类型创建成功',
            'work_type': work_type.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': '工作类型创建失败'}), 500 