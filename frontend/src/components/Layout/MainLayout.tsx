'use client';
import { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, message, Badge, Tooltip } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  ProjectOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/stores/auth';
import { useRouter, usePathname } from 'next/navigation';

const { Header, Sider, Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logout();
      message.success('退出登录成功！');
      router.push('/login');
    } catch (error) {
      message.error('退出登录失败！');
    }
  };

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: '用户管理',
    },
    {
      key: '/roles',
      icon: <TeamOutlined />,
      label: '角色管理',
    },
    {
      key: '/projects',
      icon: <ProjectOutlined />,
      label: '项目管理',
    },
    {
      key: '/time-records',
      icon: <ClockCircleOutlined />,
      label: '工时记录',
    },
    {
      key: '/reports',
      icon: <FileTextOutlined />,
      label: '日报周报',
    },
    {
      key: '/costs',
      icon: <BarChartOutlined />,
      label: '成本统计',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '账户设置',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  const notificationItems = [
    {
      key: '1',
      label: '新的日报待审核',
    },
    {
      key: '2',
      label: '项目进度更新',
    },
    {
      key: '3',
      label: '成本统计完成',
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        className="shadow-lg"
        style={{
          background: '#fff',
          borderRight: '1px solid var(--border-color)',
        }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            {!collapsed && (
              <span className="text-lg font-semibold text-gray-800">研发统计</span>
            )}
          </div>
        </div>

        {/* 导航菜单 */}
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          className="border-0"
          style={{
            background: '#fff',
            color: 'var(--text-primary)',
          }}
          onClick={({ key }) => router.push(key)}
        />
      </Sider>

      <Layout>
        <Header className="flex items-center justify-between px-6 bg-white shadow-sm">
          {/* 左侧：折叠按钮和面包屑 */}
          <div className="flex items-center space-x-4">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="text-gray-600 hover:text-gray-800"
            />
            
            {/* 搜索框 */}
            <div className="relative">
              <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ width: '300px' }}
              />
            </div>
          </div>

          {/* 右侧：用户信息和通知 */}
          <div className="flex items-center space-x-4">
            {/* 通知 */}
            <Dropdown
              menu={{ items: notificationItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <Tooltip title="通知">
                <Badge count={3} size="small">
                  <Button
                    type="text"
                    icon={<BellOutlined />}
                    className="text-gray-600 hover:text-gray-800"
                  />
                </Badge>
              </Tooltip>
            </Dropdown>

            {/* 用户信息 */}
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
                <Avatar
                  size="small"
                  icon={<UserOutlined />}
                  className="bg-gradient-to-r from-blue-500 to-purple-600"
                />
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-gray-800">
                    {user?.username || '用户'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user?.role?.name || '管理员'}
                  </div>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* 主要内容区域 */}
        <Content className="m-6 p-6 bg-gray-50 rounded-lg min-h-screen">
          <div className="fade-in">
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
} 