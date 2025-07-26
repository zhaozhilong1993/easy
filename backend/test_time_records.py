#!/usr/bin/env python3
"""
时间记录功能测试脚本
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

def test_time_records(token):
    """测试时间记录功能"""
    print("\n=== 测试时间记录功能 ===")
    
    headers = {'Authorization': f'Bearer {token}'}
    
    # 1. 获取时间记录列表
    print("1. 获取时间记录列表...")
    response = requests.get(f'{BASE_URL}/time-records/', headers=headers)
    print(f"响应状态: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"记录总数: {data['total']}")
    
    # 2. 获取工作类型列表
    print("\n2. 获取工作类型列表...")
    response = requests.get(f'{BASE_URL}/time-records/work-types', headers=headers)
    print(f"响应状态: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"工作类型数量: {len(data['work_types'])}")
    
    # 3. 创建时间记录
    print("\n3. 创建时间记录...")
    record_data = {
        'project_id': 1,
        'work_date': '2025-01-26',
        'start_time': '09:00',
        'end_time': '18:00',
        'work_content': '开发用户管理模块',
        'work_type': 'development'
    }
    
    response = requests.post(f'{BASE_URL}/time-records/', headers=headers, json=record_data)
    print(f"响应状态: {response.status_code}")
    if response.status_code == 201:
        data = response.json()
        print(f"时间记录创建成功: {data['message']}")
        record_id = data['record']['id']
        
        # 4. 获取时间记录详情
        print(f"\n4. 获取时间记录详情 (ID: {record_id})...")
        response = requests.get(f'{BASE_URL}/time-records/{record_id}', headers=headers)
        print(f"响应状态: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"记录详情: {data['record']['work_content']}")
        
        # 5. 审核时间记录
        print(f"\n5. 审核时间记录 (ID: {record_id})...")
        approve_data = {
            'action': 'approve',
            'comment': '审核通过'
        }
        response = requests.post(f'{BASE_URL}/time-records/{record_id}/approve', headers=headers, json=approve_data)
        print(f"响应状态: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"审核结果: {data['message']}")
        
        return record_id
    else:
        print(f"时间记录创建失败: {response.text}")
        return None

def test_time_statistics(token):
    """测试时间统计功能"""
    print("\n=== 测试时间统计功能 ===")
    
    headers = {'Authorization': f'Bearer {token}'}
    
    response = requests.get(f'{BASE_URL}/time-records/statistics', headers=headers)
    print(f"响应状态: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"总工作时长: {data['total_hours']} 小时")
        print(f"总工作天数: {data['total_days']} 天")
        print(f"项目统计: {data['project_statistics']}")
    else:
        print(f"错误: {response.text}")

def main():
    """主测试函数"""
    print("研发成本统计系统 - 时间记录功能测试")
    print("=" * 50)
    
    # 测试认证
    token = test_auth()
    if not token:
        print("认证失败，无法继续测试")
        return
    
    # 测试时间记录
    record_id = test_time_records(token)
    
    # 测试时间统计
    test_time_statistics(token)
    
    print("\n=== 测试完成 ===")

if __name__ == '__main__':
    main() 