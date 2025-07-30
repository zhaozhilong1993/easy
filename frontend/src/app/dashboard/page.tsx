'use client';
import { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Progress, Tag, Avatar, List } from 'antd';
import {
  UserOutlined,
  ProjectOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { reportAPI, costAPI } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import ReactECharts from 'echarts-for-react';

interface DashboardStats {
  totalUsers: number;
  totalProjects: number;
  totalHours: number;
  totalCost: number;
  reportStats: any;
  costStats: any;
}

export default function DashboardPage() {
  const { isAuthenticated, token } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProjects: 0,
    totalHours: 0,
    totalCost: 0,
    reportStats: {},
    costStats: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 强制检查localStorage中的token
    const checkAndFetch = () => {
      const localToken = localStorage.getItem('token');
      console.log('DashboardPage: checkAndFetch - localToken:', !!localToken, 'isAuthenticated:', isAuthenticated, 'token:', !!token);
      
      if (localToken && isAuthenticated && token) {
        console.log('DashboardPage: fetching dashboard data with token');
        setTimeout(() => {
          fetchDashboardData();
        }, 200);
      } else {
        console.log('DashboardPage: not authenticated or no token, retrying in 1000ms');
        setTimeout(checkAndFetch, 1000);
      }
    };
    
    checkAndFetch();
  }, []); // 移除依赖，只在组件挂载时执行一次

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [reportStats, costStats] = await Promise.all([
        reportAPI.getStatistics(),
        costAPI.getStatistics(),
      ]);

      setStats({
        totalUsers: 25,
        totalProjects: 8,
        totalHours: 1240,
        totalCost: 156800,
        reportStats,
        costStats,
      });
    } catch (error) {
      console.error('获取仪表盘数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 项目进度图表配置
  const projectProgressOption = {
    title: {
      text: '项目进度概览',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'item',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: [
      {
        name: '项目状态',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 3, name: '进行中', itemStyle: { color: '#1890ff' } },
          { value: 2, name: '已完成', itemStyle: { color: '#52c41a' } },
          { value: 2, name: '计划中', itemStyle: { color: '#faad14' } },
          { value: 1, name: '暂停', itemStyle: { color: '#ff4d4f' } },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };

  // 工时统计图表配置
  const hoursChartOption = {
    title: {
      text: '本周工时统计',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    },
    yAxis: {
      type: 'value',
      name: '小时',
    },
    series: [
      {
        name: '工时',
        type: 'bar',
        data: [8, 7.5, 8.5, 7, 8, 4, 2],
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#667eea' },
              { offset: 1, color: '#764ba2' },
            ],
          },
        },
      },
    ],
  };

  // 成本趋势图表配置
  const costTrendOption = {
    title: {
      text: '成本趋势分析',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月'],
    },
    yAxis: {
      type: 'value',
      name: '万元',
    },
    series: [
      {
        name: '研发成本',
        type: 'line',
        data: [12, 15, 18, 22, 25, 28],
        smooth: true,
        lineStyle: {
          color: '#1890ff',
          width: 3,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
              { offset: 1, color: 'rgba(24, 144, 255, 0.1)' },
            ],
          },
        },
      },
    ],
  };

  const recentActivities = [
    {
      id: 1,
      user: '张三',
      action: '提交了日报',
      project: '电商平台开发',
      time: '2小时前',
      status: 'pending',
    },
    {
      id: 2,
      user: '李四',
      action: '完成了工时记录',
      project: '移动端APP',
      time: '4小时前',
      status: 'completed',
    },
    {
      id: 3,
      user: '王五',
      action: '更新了项目进度',
      project: '数据分析系统',
      time: '6小时前',
      status: 'completed',
    },
    {
      id: 4,
      user: '赵六',
      action: '生成了成本报告',
      project: 'AI算法优化',
      time: '1天前',
      status: 'completed',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'pending':
        return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
      default:
        return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="dashboard-card">
            <Statistic
              title="总用户数"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
              suffix={
                <span className="text-sm text-green-500">
                  <ArrowUpOutlined /> +12%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="dashboard-card">
            <Statistic
              title="进行中项目"
              value={stats.totalProjects}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#52c41a' }}
              suffix={
                <span className="text-sm text-green-500">
                  <ArrowUpOutlined /> +3
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="dashboard-card">
            <Statistic
              title="本月工时"
              value={stats.totalHours}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
              suffix="小时"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="dashboard-card">
            <Statistic
              title="总成本"
              value={stats.totalCost}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
              suffix="元"
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card className="chart-container">
            <ReactECharts option={projectProgressOption} style={{ height: '300px' }} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card className="chart-container">
            <ReactECharts option={hoursChartOption} style={{ height: '300px' }} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card className="chart-container">
            <ReactECharts option={costTrendOption} style={{ height: '300px' }} />
          </Card>
        </Col>
      </Row>

      {/* 进度和活动 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="项目进度" className="dashboard-card">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">电商平台开发</span>
                  <span className="text-sm text-gray-500">75%</span>
                </div>
                <Progress percent={75} strokeColor="#1890ff" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">移动端APP</span>
                  <span className="text-sm text-gray-500">60%</span>
                </div>
                <Progress percent={60} strokeColor="#52c41a" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">数据分析系统</span>
                  <span className="text-sm text-gray-500">45%</span>
                </div>
                <Progress percent={45} strokeColor="#faad14" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">AI算法优化</span>
                  <span className="text-sm text-gray-500">30%</span>
                </div>
                <Progress percent={30} strokeColor="#ff4d4f" />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="最近活动" className="dashboard-card">
            <List
              itemLayout="horizontal"
              dataSource={recentActivities}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        size="small"
                        icon={<UserOutlined />}
                        className="bg-gradient-to-r from-blue-500 to-purple-600"
                      />
                    }
                    title={
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.user}</span>
                        {getStatusIcon(item.status)}
                      </div>
                    }
                    description={
                      <div className="space-y-1">
                        <div className="text-sm text-gray-600">
                          {item.action} - {item.project}
                        </div>
                        <div className="text-xs text-gray-400">{item.time}</div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
} 