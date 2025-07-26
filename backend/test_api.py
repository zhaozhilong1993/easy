#!/usr/bin/env python3
"""
API测试脚本
用于验证研发成本统计系统的基础功能
"""

import requests
import json

BASE_URL = 'http://localhost:5001/api'

def test_auth():
    """测试认证功能"""
    print("=== 测试认证功能 ===")
    
    # 测试登录
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

def test_users(token):
    """测试用户管理功能"""
    print("\n=== 测试用户管理功能 ===")
    
    headers = {'Authorization': f'Bearer {token}'}
    
    # 获取用户列表
    response = requests.get(f'{BASE_URL}/users/', headers=headers)
    print(f"获取用户列表: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"用户总数: {data['total']}")
    
    # 获取部门列表
    response = requests.get(f'{BASE_URL}/users/departments', headers=headers)
    print(f"获取部门列表: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"部门列表: {data['departments']}")

def test_roles(token):
    """测试角色管理功能"""
    print("\n=== 测试角色管理功能 ===")
    
    headers = {'Authorization': f'Bearer {token}'}
    
    # 获取角色列表
    response = requests.get(f'{BASE_URL}/roles/', headers=headers)
    print(f"获取角色列表: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"角色数量: {len(data['roles'])}")
        for role in data['roles']:
            print(f"  - {role['name']}: {role['description']}")
    
    # 获取权限列表
    response = requests.get(f'{BASE_URL}/roles/permissions', headers=headers)
    print(f"获取权限列表: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"权限数量: {len(data['permissions'])}")

def test_profile(token):
    """测试用户信息功能"""
    print("\n=== 测试用户信息功能 ===")
    
    headers = {'Authorization': f'Bearer {token}'}
    
    # 获取当前用户信息
    response = requests.get(f'{BASE_URL}/auth/profile', headers=headers)
    print(f"获取用户信息: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        user = data['user']
        print(f"当前用户: {user['name']} ({user['username']})")
        print(f"角色: {user['roles']}")

def main():
    """主测试函数"""
    print("研发成本统计系统 - API测试")
    print("=" * 50)
    
    # 测试认证
    token = test_auth()
    if not token:
        print("认证失败，无法继续测试")
        return
    
    # 测试用户管理
    test_users(token)
    
    # 测试角色管理
    test_roles(token)
    
    # 测试用户信息
    test_profile(token)
    
    print("\n=== 测试完成 ===")

if __name__ == '__main__':
    main() 