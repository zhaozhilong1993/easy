#!/usr/bin/env python3
"""
项目管理功能测试脚本
"""

import requests
import json

BASE_URL = 'http://localhost:5001/api'

def test_auth():
    """测试认证功能"""
    print("=== 测试认证功能 ===")
    
    login_data = {
        'username': 'admin',
        'password': 'admin123'
    }
    
    response = requests.post(f'{BASE_URL}/auth/login', json=login_data)
    print(f"登录响应: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"登录成功: {data['message']}")
        return data.get('access_token')
    else:
        print(f"登录失败: {response.text}")
        return None

def test_projects(token):
    """测试项目管理功能"""
    print("\n=== 测试项目管理功能 ===")
    
    headers = {'Authorization': f'Bearer {token}'}
    
    # 1. 获取项目列表
    print("1. 获取项目列表...")
    response = requests.get(f'{BASE_URL}/projects/', headers=headers)
    print(f"响应状态: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"项目总数: {data['total']}")
        print(f"项目列表: {data['projects']}")
    else:
        print(f"错误: {response.text}")
    
    # 2. 创建新项目
    print("\n2. 创建新项目...")
    project_data = {
        'name': '测试项目',
        'code': 'TEST001',
        'description': '这是一个测试项目',
        'start_date': '2025-01-26',
        'end_date': '2025-12-31',
        'manager_id': 1,
        'budget': 100000.00
    }
    
    response = requests.post(f'{BASE_URL}/projects/', headers=headers, json=project_data)
    print(f"响应状态: {response.status_code}")
    if response.status_code == 201:
        data = response.json()
        print(f"项目创建成功: {data['message']}")
        project_id = data['project']['id']
        
        # 3. 获取项目详情
        print(f"\n3. 获取项目详情 (ID: {project_id})...")
        response = requests.get(f'{BASE_URL}/projects/{project_id}', headers=headers)
        print(f"响应状态: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"项目详情: {data['project']['name']}")
        
        # 4. 获取项目成员
        print(f"\n4. 获取项目成员 (ID: {project_id})...")
        response = requests.get(f'{BASE_URL}/projects/{project_id}/members', headers=headers)
        print(f"响应状态: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"成员数量: {data['total']}")
        
        # 5. 添加项目成员
        print(f"\n5. 添加项目成员 (ID: {project_id})...")
        member_data = {
            'user_id': 1,
            'role': 'member',
            'start_date': '2025-01-26'
        }
        response = requests.post(f'{BASE_URL}/projects/{project_id}/members', headers=headers, json=member_data)
        print(f"响应状态: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"成员添加: {data['message']}")
        
        # 6. 更新项目状态
        print(f"\n6. 更新项目状态 (ID: {project_id})...")
        status_data = {'status': 'active'}
        response = requests.put(f'{BASE_URL}/projects/{project_id}/status', headers=headers, json=status_data)
        print(f"响应状态: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"状态更新: {data['message']}")
        
        return project_id
    else:
        print(f"项目创建失败: {response.text}")
        return None

def test_project_statuses(token):
    """测试项目状态功能"""
    print("\n=== 测试项目状态功能 ===")
    
    headers = {'Authorization': f'Bearer {token}'}
    
    response = requests.get(f'{BASE_URL}/projects/status', headers=headers)
    print(f"响应状态: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"项目状态列表: {data['statuses']}")
    else:
        print(f"错误: {response.text}")

def main():
    """主测试函数"""
    print("研发成本统计系统 - 项目管理功能测试")
    print("=" * 50)
    
    # 测试认证
    token = test_auth()
    if not token:
        print("认证失败，无法继续测试")
        return
    
    # 测试项目管理
    project_id = test_projects(token)
    
    # 测试项目状态
    test_project_statuses(token)
    
    print("\n=== 测试完成 ===")

if __name__ == '__main__':
    main() 