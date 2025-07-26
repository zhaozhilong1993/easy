#!/usr/bin/env python3
"""
日报周报和成本计算功能测试脚本
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

def test_daily_reports(token):
    """测试日报功能"""
    print("\n=== 测试日报功能 ===")
    
    headers = {'Authorization': f'Bearer {token}'}
    
    # 1. 获取日报列表
    print("1. 获取日报列表...")
    response = requests.get(f'{BASE_URL}/reports/daily', headers=headers)
    print(f"响应状态: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"日报总数: {data['total']}")
    
    # 2. 创建日报
    print("\n2. 创建日报...")
    report_data = {
        'work_content': '开发用户管理模块，完成用户CRUD功能',
        'progress': '已完成用户列表和详情页面',
        'issues': '权限验证需要优化',
        'plans': '明天完成角色管理功能',
        'report_date': '2025-01-26'
    }
    
    response = requests.post(f'{BASE_URL}/reports/daily', headers=headers, json=report_data)
    print(f"响应状态: {response.status_code}")
    if response.status_code == 201:
        data = response.json()
        print(f"日报创建成功: {data['message']}")
        report_id = data['report']['id']
        
        # 3. 获取日报详情
        print(f"\n3. 获取日报详情 (ID: {report_id})...")
        response = requests.get(f'{BASE_URL}/reports/daily/{report_id}', headers=headers)
        print(f"响应状态: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"日报详情: {data['report']['work_content']}")
        
        # 4. 审核日报
        print(f"\n4. 审核日报 (ID: {report_id})...")
        approve_data = {
            'action': 'approve',
            'comment': '工作内容详细，审核通过'
        }
        response = requests.post(f'{BASE_URL}/reports/daily/{report_id}/approve', headers=headers, json=approve_data)
        print(f"响应状态: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"审核结果: {data['message']}")
        
        return report_id
    else:
        print(f"日报创建失败: {response.text}")
        return None

def test_weekly_reports(token):
    """测试周报功能"""
    print("\n=== 测试周报功能 ===")
    
    headers = {'Authorization': f'Bearer {token}'}
    
    # 1. 获取周报列表
    print("1. 获取周报列表...")
    response = requests.get(f'{BASE_URL}/reports/weekly', headers=headers)
    print(f"响应状态: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"周报总数: {data['total']}")
    
    # 2. 创建周报
    print("\n2. 创建周报...")
    report_data = {
        'week_summary': '本周完成了用户管理和权限管理模块的开发',
        'completed_tasks': '用户CRUD、角色管理、权限控制',
        'ongoing_tasks': '项目管理模块开发中',
        'next_week_plans': '完成时间记录和成本计算功能',
        'challenges': '数据库设计需要优化',
        'suggestions': '建议增加单元测试覆盖率'
    }
    
    response = requests.post(f'{BASE_URL}/reports/weekly', headers=headers, json=report_data)
    print(f"响应状态: {response.status_code}")
    if response.status_code == 201:
        data = response.json()
        print(f"周报创建成功: {data['message']}")
        report_id = data['report']['id']
        
        # 3. 获取周报详情
        print(f"\n3. 获取周报详情 (ID: {report_id})...")
        response = requests.get(f'{BASE_URL}/reports/weekly/{report_id}', headers=headers)
        print(f"响应状态: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"周报详情: {data['report']['week_summary']}")
        
        # 4. 审核周报
        print(f"\n4. 审核周报 (ID: {report_id})...")
        approve_data = {
            'action': 'approve',
            'comment': '工作进展良好，继续努力'
        }
        response = requests.post(f'{BASE_URL}/reports/weekly/{report_id}/approve', headers=headers, json=approve_data)
        print(f"响应状态: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"审核结果: {data['message']}")
        
        return report_id
    else:
        print(f"周报创建失败: {response.text}")
        return None

def test_cost_calculations(token):
    """测试成本计算功能"""
    print("\n=== 测试成本计算功能 ===")
    
    headers = {'Authorization': f'Bearer {token}'}
    
    # 1. 获取成本计算记录
    print("1. 获取成本计算记录...")
    response = requests.get(f'{BASE_URL}/costs/calculations', headers=headers)
    print(f"响应状态: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"成本计算记录总数: {data['total']}")
    
    # 2. 计算个人成本
    print("\n2. 计算个人成本...")
    cost_data = {
        'project_id': 1,
        'calculation_date': '2025-01-26',
        'notes': '开发用户管理模块的成本'
    }
    
    response = requests.post(f'{BASE_URL}/costs/calculate', headers=headers, json=cost_data)
    print(f"响应状态: {response.status_code}")
    if response.status_code == 201:
        data = response.json()
        print(f"成本计算成功: {data['message']}")
        calculation_id = data['calculation']['id']
        
        # 3. 计算项目成本
        print(f"\n3. 计算项目成本 (项目ID: 1)...")
        project_cost_data = {
            'calculation_period': 'weekly',
            'period_start': '2025-01-20',
            'period_end': '2025-01-26'
        }
        response = requests.post(f'{BASE_URL}/costs/project/1', headers=headers, json=project_cost_data)
        print(f"响应状态: {response.status_code}")
        if response.status_code == 201:
            data = response.json()
            print(f"项目成本计算成功: {data['message']}")
        
        return calculation_id
    else:
        print(f"成本计算失败: {response.text}")
        return None

def test_cost_reports(token):
    """测试成本报表功能"""
    print("\n=== 测试成本报表功能 ===")
    
    headers = {'Authorization': f'Bearer {token}'}
    
    # 1. 获取成本报表列表
    print("1. 获取成本报表列表...")
    response = requests.get(f'{BASE_URL}/costs/reports', headers=headers)
    print(f"响应状态: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"成本报表总数: {data['total']}")
    
    # 2. 生成个人成本报表
    print("\n2. 生成个人成本报表...")
    report_data = {
        'report_name': '个人成本报表-2025年1月',
        'report_type': 'personal',
        'report_period': 'monthly',
        'period_start': '2025-01-01',
        'period_end': '2025-01-31'
    }
    
    response = requests.post(f'{BASE_URL}/costs/reports', headers=headers, json=report_data)
    print(f"响应状态: {response.status_code}")
    if response.status_code == 201:
        data = response.json()
        print(f"成本报表生成成功: {data['message']}")
        report_id = data['report']['id']
        
        # 3. 获取成本报表详情
        print(f"\n3. 获取成本报表详情 (ID: {report_id})...")
        response = requests.get(f'{BASE_URL}/costs/reports/{report_id}', headers=headers)
        print(f"响应状态: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"报表详情: {data['report']['report_name']}")
        
        return report_id
    else:
        print(f"成本报表生成失败: {response.text}")
        return None

def test_statistics(token):
    """测试统计功能"""
    print("\n=== 测试统计功能 ===")
    
    headers = {'Authorization': f'Bearer {token}'}
    
    # 1. 获取报告统计
    print("1. 获取报告统计...")
    response = requests.get(f'{BASE_URL}/reports/statistics', headers=headers)
    print(f"响应状态: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"日报统计: {data['daily_reports']}")
        print(f"周报统计: {data['weekly_reports']}")
    
    # 2. 获取成本统计
    print("\n2. 获取成本统计...")
    response = requests.get(f'{BASE_URL}/costs/statistics', headers=headers)
    print(f"响应状态: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"个人成本统计: {data['personal_costs']}")
        print(f"项目成本统计: {data['project_costs']}")

def main():
    """主测试函数"""
    print("研发成本统计系统 - 日报周报和成本计算功能测试")
    print("=" * 60)
    
    # 测试认证
    token = test_auth()
    if not token:
        print("认证失败，无法继续测试")
        return
    
    # 测试日报功能
    daily_report_id = test_daily_reports(token)
    
    # 测试周报功能
    weekly_report_id = test_weekly_reports(token)
    
    # 测试成本计算功能
    calculation_id = test_cost_calculations(token)
    
    # 测试成本报表功能
    cost_report_id = test_cost_reports(token)
    
    # 测试统计功能
    test_statistics(token)
    
    print("\n=== 测试完成 ===")

if __name__ == '__main__':
    main() 