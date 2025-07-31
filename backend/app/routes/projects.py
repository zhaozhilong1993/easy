from flask import Blueprint, request, jsonify
from datetime import datetime
from app import db
from app.models import Project, ProjectMember, User
from app.middlewares.auth import login_required, role_required

projects_bp = Blueprint('projects', __name__)

@projects_bp.route('/', methods=['GET'])
@login_required
def get_projects():
    """获取项目列表"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    search = request.args.get('search', '')
    status = request.args.get('status', '')
    manager_id = request.args.get('manager_id', type=int)
    
    query = Project.query
    
    if search:
        query = query.filter(
            Project.name.contains(search) |
            Project.code.contains(search) |
            Project.description.contains(search)
        )
    
    if status:
        query = query.filter(Project.status == status)
    
    if manager_id:
        query = query.filter(Project.manager_id == manager_id)
    
    pagination = query.paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    projects = [project.to_dict() for project in pagination.items]
    
    return jsonify({
        'projects': projects,
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page,
        'per_page': per_page
    }), 200

@projects_bp.route('/<int:project_id>', methods=['GET'])
@login_required
def get_project(project_id):
    """获取项目详情"""
    project = Project.query.get(project_id)
    
    if not project:
        return jsonify({'message': '项目不存在'}), 404
    
    project_data = project.to_dict()
    project_data['members'] = project.get_members()
    
    return jsonify({
        'project': project_data
    }), 200

@projects_bp.route('/', methods=['POST'])
@login_required
def create_project():
    """创建项目"""
    data = request.get_json()
    
    # 验证必填字段
    required_fields = ['name', 'code', 'start_date', 'manager_id']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'message': f'{field}不能为空'}), 400
    
    # 检查项目编号是否已存在
    if Project.query.filter_by(code=data['code']).first():
        return jsonify({'message': '项目编号已存在'}), 400
    
    # 检查项目经理是否存在
    manager = User.query.get(data['manager_id'])
    if not manager:
        return jsonify({'message': '项目经理不存在'}), 400
    
    # 解析日期
    try:
        start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        end_date = None
        if data.get('end_date'):
            end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'message': '日期格式错误，请使用YYYY-MM-DD格式'}), 400
    
    project = Project(
        name=data['name'],
        code=data['code'],
        description=data.get('description', ''),
        start_date=start_date,
        end_date=end_date,
        status=data.get('status', 'active'),
        budget=data.get('budget'),
        manager_id=data['manager_id']
    )
    
    try:
        db.session.add(project)
        db.session.commit()
        
        return jsonify({
            'message': '项目创建成功',
            'project': project.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': '项目创建失败'}), 500

@projects_bp.route('/<int:project_id>', methods=['PUT'])
@login_required
def update_project(project_id):
    """更新项目信息"""
    project = Project.query.get(project_id)
    
    if not project:
        return jsonify({'message': '项目不存在'}), 404
    
    data = request.get_json()
    
    # 允许更新的字段
    allowed_fields = ['name', 'description', 'start_date', 'end_date', 'status', 'budget', 'manager_id']
    
    for field in allowed_fields:
        if field in data:
            if field in ['start_date', 'end_date'] and data[field]:
                try:
                    date_value = datetime.strptime(data[field], '%Y-%m-%d').date()
                    setattr(project, field, date_value)
                except ValueError:
                    return jsonify({'message': '日期格式错误，请使用YYYY-MM-DD格式'}), 400
            elif field == 'manager_id':
                # 验证项目经理是否存在
                manager = User.query.get(data[field])
                if not manager:
                    return jsonify({'message': '项目经理不存在'}), 400
                setattr(project, field, data[field])
            else:
                setattr(project, field, data[field])
    
    try:
        db.session.commit()
        return jsonify({
            'message': '项目更新成功',
            'project': project.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': '项目更新失败'}), 500

@projects_bp.route('/<int:project_id>', methods=['DELETE'])
@login_required
def delete_project(project_id):
    """删除项目"""
    project = Project.query.get(project_id)
    
    if not project:
        return jsonify({'message': '项目不存在'}), 404
    
    try:
        db.session.delete(project)
        db.session.commit()
        return jsonify({'message': '项目删除成功'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': '项目删除失败'}), 500

@projects_bp.route('/<int:project_id>/members', methods=['GET'])
@login_required
def get_project_members(project_id):
    """获取项目成员列表"""
    project = Project.query.get(project_id)
    
    if not project:
        return jsonify({'message': '项目不存在'}), 404
    
    members = project.get_members()
    
    return jsonify({
        'members': members,
        'total': len(members)
    }), 200

@projects_bp.route('/<int:project_id>/members', methods=['POST'])
@login_required
def add_project_member(project_id):
    """添加项目成员"""
    project = Project.query.get(project_id)
    
    if not project:
        return jsonify({'message': '项目不存在'}), 404
    
    data = request.get_json()
    
    if not data.get('user_id'):
        return jsonify({'message': '用户ID不能为空'}), 400
    
    user_id = data['user_id']
    role = data.get('role', 'member')
    start_date = data.get('start_date')
    end_date = data.get('end_date')
    
    # 解析日期
    if start_date:
        try:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'message': '开始日期格式错误'}), 400
    
    if end_date:
        try:
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'message': '结束日期格式错误'}), 400
    
    success, message = project.add_member(user_id, role, start_date, end_date)
    
    if success:
        return jsonify({'message': message}), 200
    else:
        return jsonify({'message': message}), 400

@projects_bp.route('/<int:project_id>/members/<int:user_id>', methods=['DELETE'])
@login_required
def remove_project_member(project_id, user_id):
    """移除项目成员"""
    project = Project.query.get(project_id)
    
    if not project:
        return jsonify({'message': '项目不存在'}), 404
    
    success, message = project.remove_member(user_id)
    
    if success:
        return jsonify({'message': message}), 200
    else:
        return jsonify({'message': message}), 400

@projects_bp.route('/<int:project_id>/status', methods=['PUT'])
@login_required
def update_project_status(project_id):
    """更新项目状态"""
    project = Project.query.get(project_id)
    
    if not project:
        return jsonify({'message': '项目不存在'}), 404
    
    data = request.get_json()
    new_status = data.get('status')
    
    valid_statuses = ['active', 'completed', 'suspended', 'cancelled']
    if new_status not in valid_statuses:
        return jsonify({'message': '状态值无效'}), 400
    
    project.status = new_status
    
    try:
        db.session.commit()
        return jsonify({
            'message': '项目状态更新成功',
            'project': project.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': '项目状态更新失败'}), 500

@projects_bp.route('/status', methods=['GET'])
@login_required
def get_project_statuses():
    """获取项目状态列表"""
    statuses = ['active', 'completed', 'suspended', 'cancelled']
    
    return jsonify({
        'statuses': statuses
    }), 200 