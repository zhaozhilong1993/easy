'use client';
import { useState, useEffect } from 'react';
import { 
  Layout, 
  Menu, 
  Button, 
  Avatar, 
  Dropdown, 
  Space,
  Badge,
  Input,
  Divider
} from 'antd';
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined, 
  UserOutlined,
  DashboardOutlined,
  TeamOutlined,
  SettingOutlined,
  ProjectOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  CalculatorOutlined,
  LogoutOutlined,
  BellOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { useAuthStore } from '@/stores/auth';
import { useRouter, usePathname } from 'next/navigation';

const { Header, Sider, Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout, hasRole } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleMenuClick = ({ key }: { key: string }) => {
    router.push(key);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // 根据用户角色过滤菜单项
  const getFilteredMenuItems = () => {
    const allMenuItems = [
      {
        key: '/',
        icon: <DashboardOutlined />,
        label: '仪表盘',
        roles: ['admin', 'manager', 'developer'], // 所有角色都可以访问
      },
      {
        key: '/users',
        icon: <TeamOutlined />,
        label: '用户管理',
        roles: ['admin'], // 只有admin可以访问
      },
      {
        key: '/roles',
        icon: <SettingOutlined />,
        label: '角色管理',
        roles: ['admin'], // 只有admin可以访问
      },
      {
        key: '/projects',
        icon: <ProjectOutlined />,
        label: '项目管理',
        roles: ['admin', 'manager'], // admin和manager可以访问
      },
      {
        key: '/time-records',
        icon: <ClockCircleOutlined />,
        label: '工时记录',
        roles: ['admin', 'manager', 'developer'], // 所有角色都可以访问
      },
      {
        key: '/reports',
        icon: <FileTextOutlined />,
        label: '日报周报',
        roles: ['admin', 'manager', 'developer'], // 所有角色都可以访问
      },
      {
        key: '/costs',
        icon: <CalculatorOutlined />,
        label: '成本统计',
        roles: ['admin', 'manager'], // admin和manager可以访问
      },
      {
        key: '/settings',
        icon: <SettingOutlined />,
        label: '系统设置',
        roles: ['admin'], // 只有admin可以访问
      },
    ];

    return allMenuItems.filter(item => {
      if (!user) return false;
      return item.roles.some(role => hasRole(role));
    });
  };

  const menuItems = getFilteredMenuItems();

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '个人设置',
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

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        className="bg-white border-r border-gray-200"
        width={250}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            {!collapsed && (
              <span className="ml-3 font-semibold text-gray-800">
                研发统计系统
              </span>
            )}
          </div>
        </div>
        
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className="border-0"
          style={{ backgroundColor: 'transparent' }}
        />
      </Sider>

      <Layout>
        <Header className="bg-white border-b border-gray-200 px-6 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="mr-4"
            />
            <Input
              placeholder="搜索..."
              prefix={<SearchOutlined />}
              className="w-64"
            />
          </div>

          <div className="flex items-center space-x-4">
            <Badge count={5} size="small">
              <Button
                type="text"
                icon={<BellOutlined />}
                className="flex items-center"
              />
            </Badge>

            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <div className="flex items-center cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg">
                <Avatar 
                  size="small" 
                  icon={<UserOutlined />}
                  className="mr-2"
                />
                <div className="hidden sm:block">
                  <div className="text-sm font-medium text-gray-700">
                    {user?.name || '用户'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user?.roles?.[0] || '用户'}
                  </div>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content className="p-6 bg-gray-50">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
} 