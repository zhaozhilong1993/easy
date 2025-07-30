'use client';
import { useState, useEffect } from 'react';
import { 
  Tabs, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Popconfirm, 
  message, 
  Card, 
  Row, 
  Col,
  Tag,
  Space,
  Tooltip,
  Statistic,
  Progress,
  Descriptions,
  Divider
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  CalculatorOutlined,
  DollarOutlined,
  BarChartOutlined,
  FileTextOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { costAPI, projectAPI, userAPI } from '@/services/api';
import MainLayout from '@/components/Layout/MainLayout';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import { useAuthStore } from '@/stores/auth';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

interface CostCalculation {
  id: number;
  user: {
    id: number;
    name: string;
    username: string;
  };
  project: {
    id: number;
    name: string;
  };
  period_start: string;
  period_end: string;
  total_hours: number;
  hourly_rate: number;
  total_cost: number;
  calculation_method: string;
  created_at: string;
  updated_at: string;
}

interface ProjectCost {
  id: number;
  project: {
    id: number;
    name: string;
    budget: number;
  };
  total_cost: number;
  member_count: number;
  period_start: string;
  period_end: string;
  cost_breakdown: Array<{
    user_name: string;
    hours: number;
    cost: number;
  }>;
  created_at: string;
}

interface CostReport {
  id: number;
  report_type: string;
  period_start: string;
  period_end: string;
  total_cost: number;
  project_count: number;
  user_count: number;
  status: string;
  created_by: {
    id: number;
    name: string;
  };
  created_at: string;
}

export default function CostsPage() {
  const { isAuthenticated, token } = useAuthStore();
  const [personalCalculations, setPersonalCalculations] = useState<CostCalculation[]>([]);
  const [projectCosts, setProjectCosts] = useState<ProjectCost[]>([]);
  const [costReports, setCostReports] = useState<CostReport[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [editingCalculation, setEditingCalculation] = useState<CostCalculation | null>(null);
  const [calculationType, setCalculationType] = useState<'personal' | 'project'>('personal');
  const [form] = Form.useForm();
  const [reportForm] = Form.useForm();

  useEffect(() => {
    // 强制检查localStorage中的token
    const checkAndFetch = () => {
      const localToken = localStorage.getItem('token');
      console.log('CostsPage: checkAndFetch - localToken:', !!localToken, 'isAuthenticated:', isAuthenticated, 'token:', !!token);
      
      if (localToken && isAuthenticated && token) {
        console.log('CostsPage: fetching costs with token');
        setTimeout(() => {
          fetchPersonalCalculations();
          fetchProjects();
          fetchUsers();
          fetchStatistics();
        }, 200);
      } else {
        console.log('CostsPage: not authenticated or no token, retrying in 1000ms');
        setTimeout(checkAndFetch, 1000);
      }
    };
    
    checkAndFetch();
  }, []); // 移除依赖，只在组件挂载时执行一次

  const fetchPersonalCalculations = async () => {
    try {
      setLoading(true);
      const response = await costAPI.getPersonalCalculations();
      setPersonalCalculations(response.data);
    } catch (error) {
      message.error('获取个人成本计算失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectCosts = async () => {
    try {
      const response = await costAPI.getProjectCosts(0); // 获取所有项目成本
      setProjectCosts(response.data);
    } catch (error) {
      message.error('获取项目成本失败');
    }
  };

  const fetchCostReports = async () => {
    try {
      const response = await costAPI.getCostReports();
      setCostReports(response.data);
    } catch (error) {
      message.error('获取成本报表失败');
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await projectAPI.getProjects();
      setProjects(response.data);
    } catch (error) {
      message.error('获取项目列表失败');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getUsers();
      setUsers(response.data);
    } catch (error) {
      message.error('获取用户列表失败');
    }
  };

  const handleCreateCalculation = (type: 'personal' | 'project') => {
    setCalculationType(type);
    setEditingCalculation(null);
    form.resetFields();
    form.setFieldsValue({
      period: [dayjs().startOf('month'), dayjs().endOf('month')],
    });
    setModalVisible(true);
  };

  const handleEditCalculation = (record: CostCalculation) => {
    setCalculationType('personal');
    setEditingCalculation(record);
    form.setFieldsValue({
      user_id: record.user.id,
      project_id: record.project.id,
      period: [dayjs(record.period_start), dayjs(record.period_end)],
      calculation_method: record.calculation_method,
    });
    setModalVisible(true);
  };

  const handleDeleteCalculation = async (id: number) => {
    try {
      await costAPI.deletePersonalCalculation(id);
      message.success('删除成功');
      fetchPersonalCalculations();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmitCalculation = async (values: any) => {
    try {
      const data = {
        ...values,
        period_start: values.period[0].format('YYYY-MM-DD'),
        period_end: values.period[1].format('YYYY-MM-DD'),
      };

      if (calculationType === 'personal') {
        if (editingCalculation) {
          await costAPI.updatePersonalCalculation(editingCalculation.id, data);
          message.success('更新成功');
        } else {
          await costAPI.calculatePersonalCost(data);
          message.success('计算成功');
        }
      } else {
        await costAPI.calculateProjectCost(values.project_id, data);
        message.success('计算成功');
      }
      
      setModalVisible(false);
      fetchPersonalCalculations();
      fetchProjectCosts();
    } catch (error) {
      message.error(editingCalculation ? '更新失败' : '计算失败');
    }
  };

  const handleGenerateReport = async (values: any) => {
    try {
      const data = {
        ...values,
        period_start: values.period[0].format('YYYY-MM-DD'),
        period_end: values.period[1].format('YYYY-MM-DD'),
      };
      
      await costAPI.generateCostReport(data);
      message.success('报表生成成功');
      setReportModalVisible(false);
      fetchCostReports();
    } catch (error) {
      message.error('报表生成失败');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'pending': 'orange',
      'completed': 'green',
      'failed': 'red'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts: { [key: string]: string } = {
      'pending': '处理中',
      'completed': '已完成',
      'failed': '失败'
    };
    return texts[status] || status;
  };

  const personalColumns = [
    {
      title: '员工',
      dataIndex: 'user',
      key: 'user',
      render: (user: any) => (
        <span className="font-medium">{user.name}</span>
      ),
    },
    {
      title: '项目',
      dataIndex: 'project',
      key: 'project',
      render: (project: any) => (
        <span className="font-medium">{project.name}</span>
      ),
    },
    {
      title: '计算周期',
      key: 'period',
      render: (_, record: CostCalculation) => (
        <div className="text-sm">
          <div>{dayjs(record.period_start).format('MM-DD')}</div>
          <div>至 {dayjs(record.period_end).format('MM-DD')}</div>
        </div>
      ),
    },
    {
      title: '总工时',
      dataIndex: 'total_hours',
      key: 'total_hours',
      render: (hours: number) => (
        <span className="font-medium text-blue-600">{hours}小时</span>
      ),
    },
    {
      title: '时薪',
      dataIndex: 'hourly_rate',
      key: 'hourly_rate',
      render: (rate: number) => (
        <span className="text-green-600">¥{rate}/小时</span>
      ),
    },
    {
      title: '总成本',
      dataIndex: 'total_cost',
      key: 'total_cost',
      render: (cost: number) => (
        <span className="font-medium text-red-600">¥{cost.toLocaleString()}</span>
      ),
    },
    {
      title: '计算方法',
      dataIndex: 'calculation_method',
      key: 'calculation_method',
      render: (method: string) => (
        <Tag color="blue">{method === 'hourly' ? '按工时' : '按薪资'}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record: CostCalculation) => (
        <Space>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditCalculation(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这条记录吗？"
            onConfirm={() => handleDeleteCalculation(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const projectColumns = [
    {
      title: '项目名称',
      dataIndex: 'project',
      key: 'project',
      render: (project: any) => (
        <span className="font-medium">{project.name}</span>
      ),
    },
    {
      title: '项目预算',
      dataIndex: 'project',
      key: 'budget',
      render: (project: any) => (
        <span className="text-green-600">¥{project.budget.toLocaleString()}</span>
      ),
    },
    {
      title: '实际成本',
      dataIndex: 'total_cost',
      key: 'total_cost',
      render: (cost: number) => (
        <span className="font-medium text-red-600">¥{cost.toLocaleString()}</span>
      ),
    },
    {
      title: '参与人数',
      dataIndex: 'member_count',
      key: 'member_count',
      render: (count: number) => (
        <Tag color="blue">{count}人</Tag>
      ),
    },
    {
      title: '计算周期',
      key: 'period',
      render: (_, record: ProjectCost) => (
        <div className="text-sm">
          <div>{dayjs(record.period_start).format('MM-DD')}</div>
          <div>至 {dayjs(record.period_end).format('MM-DD')}</div>
        </div>
      ),
    },
    {
      title: '成本详情',
      key: 'details',
      render: (_, record: ProjectCost) => (
        <Button 
          type="link" 
          size="small"
          onClick={() => showCostDetails(record)}
        >
          查看详情
        </Button>
      ),
    },
  ];

  const reportColumns = [
    {
      title: '报表类型',
      dataIndex: 'report_type',
      key: 'report_type',
      render: (type: string) => (
        <Tag color="purple">{type}</Tag>
      ),
    },
    {
      title: '统计周期',
      key: 'period',
      render: (_, record: CostReport) => (
        <div className="text-sm">
          <div>{dayjs(record.period_start).format('MM-DD')}</div>
          <div>至 {dayjs(record.period_end).format('MM-DD')}</div>
        </div>
      ),
    },
    {
      title: '总成本',
      dataIndex: 'total_cost',
      key: 'total_cost',
      render: (cost: number) => (
        <span className="font-medium text-red-600">¥{cost.toLocaleString()}</span>
      ),
    },
    {
      title: '项目数',
      dataIndex: 'project_count',
      key: 'project_count',
      render: (count: number) => (
        <Tag color="blue">{count}个</Tag>
      ),
    },
    {
      title: '人员数',
      dataIndex: 'user_count',
      key: 'user_count',
      render: (count: number) => (
        <Tag color="green">{count}人</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '生成人',
      dataIndex: 'created_by',
      key: 'created_by',
      render: (creator: any) => (
        <span>{creator.name}</span>
      ),
    },
    {
      title: '生成时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
  ];

  const showCostDetails = (record: ProjectCost) => {
    Modal.info({
      title: `${record.project.name} - 成本详情`,
      width: 600,
      content: (
        <div>
          <Descriptions column={1} bordered>
            <Descriptions.Item label="项目名称">{record.project.name}</Descriptions.Item>
            <Descriptions.Item label="项目预算">¥{record.project.budget.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="实际成本">¥{record.total_cost.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="参与人数">{record.member_count}人</Descriptions.Item>
            <Descriptions.Item label="计算周期">
              {dayjs(record.period_start).format('YYYY-MM-DD')} 至 {dayjs(record.period_end).format('YYYY-MM-DD')}
            </Descriptions.Item>
          </Descriptions>
          <Divider />
          <h4>成本明细</h4>
          <Table
            dataSource={record.cost_breakdown}
            columns={[
              { title: '员工', dataIndex: 'user_name', key: 'user_name' },
              { title: '工时', dataIndex: 'hours', key: 'hours', render: (hours) => `${hours}小时` },
              { title: '成本', dataIndex: 'cost', key: 'cost', render: (cost) => `¥${cost.toLocaleString()}` },
            ]}
            pagination={false}
            size="small"
          />
        </div>
      ),
    });
  };

  // 统计信息
  const totalPersonalCost = personalCalculations.reduce((sum, calc) => sum + calc.total_cost, 0);
  const totalProjectCost = projectCosts.reduce((sum, cost) => sum + cost.total_cost, 0);
  const totalReports = costReports.length;
  const completedReports = costReports.filter(report => report.status === 'completed').length;

  // 图表配置
  const costTrendOption = {
    title: {
      text: '成本趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['个人成本', '项目成本'],
      bottom: 10
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: {
      type: 'value',
      name: '成本 (元)'
    },
    series: [
      {
        name: '个人成本',
        type: 'line',
        data: [12000, 15000, 18000, 16000, 20000, 22000],
        smooth: true
      },
      {
        name: '项目成本',
        type: 'line',
        data: [80000, 95000, 110000, 105000, 120000, 135000],
        smooth: true
      }
    ]
  };

  const costDistributionOption = {
    title: {
      text: '成本分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '成本分布',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 35, name: '开发成本' },
          { value: 25, name: '测试成本' },
          { value: 20, name: '设计成本' },
          { value: 15, name: '管理成本' },
          { value: 5, name: '其他成本' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">成本统计</h1>
          <Space>
            <Button
              type="primary"
              icon={<CalculatorOutlined />}
              onClick={() => handleCreateCalculation('personal')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 border-0"
            >
              个人成本计算
            </Button>
            <Button
              type="primary"
              icon={<TeamOutlined />}
              onClick={() => handleCreateCalculation('project')}
              className="bg-gradient-to-r from-green-500 to-blue-600 border-0"
            >
              项目成本计算
            </Button>
            <Button
              type="primary"
              icon={<FileTextOutlined />}
              onClick={() => setReportModalVisible(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-600 border-0"
            >
              生成成本报表
            </Button>
          </Space>
        </div>

        {/* 统计卡片 */}
        <Row gutter={16}>
          <Col xs={24} sm={6}>
            <Card className="dashboard-card">
              <Statistic
                title="个人成本总计"
                value={totalPersonalCost}
                suffix="元"
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="dashboard-card">
              <Statistic
                title="项目成本总计"
                value={totalProjectCost}
                suffix="元"
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="dashboard-card">
              <Statistic
                title="成本报表总数"
                value={totalReports}
                suffix="份"
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="dashboard-card">
              <Statistic
                title="已完成报表"
                value={completedReports}
                suffix="份"
                prefix={<BarChartOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 图表 */}
        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <Card className="dashboard-card">
              <ReactECharts option={costTrendOption} style={{ height: '300px' }} />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card className="dashboard-card">
              <ReactECharts option={costDistributionOption} style={{ height: '300px' }} />
            </Card>
          </Col>
        </Row>

        <Card className="dashboard-card">
          <Tabs defaultActiveKey="personal">
            <TabPane tab="个人成本" key="personal">
              <Table
                columns={personalColumns}
                dataSource={personalCalculations}
                rowKey="id"
                loading={loading}
                pagination={{
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `共 ${total} 条记录`,
                }}
              />
            </TabPane>
            <TabPane tab="项目成本" key="project">
              <Table
                columns={projectColumns}
                dataSource={projectCosts}
                rowKey="id"
                loading={loading}
                pagination={{
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `共 ${total} 条记录`,
                }}
              />
            </TabPane>
            <TabPane tab="成本报表" key="reports">
              <Table
                columns={reportColumns}
                dataSource={costReports}
                rowKey="id"
                loading={loading}
                pagination={{
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `共 ${total} 条记录`,
                }}
              />
            </TabPane>
          </Tabs>
        </Card>

        {/* 成本计算模态框 */}
        <Modal
          title={editingCalculation ? '编辑成本计算' : `创建${calculationType === 'personal' ? '个人' : '项目'}成本计算`}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmitCalculation}
          >
            {calculationType === 'personal' && (
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="user_id"
                    label="员工"
                    rules={[{ required: true, message: '请选择员工' }]}
                  >
                    <Select placeholder="请选择员工">
                      {users.map(user => (
                        <Option key={user.id} value={user.id}>
                          {user.name} ({user.username})
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="project_id"
                    label="项目"
                    rules={[{ required: true, message: '请选择项目' }]}
                  >
                    <Select placeholder="请选择项目">
                      {projects.map(project => (
                        <Option key={project.id} value={project.id}>
                          {project.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            )}

            {calculationType === 'project' && (
              <Form.Item
                name="project_id"
                label="项目"
                rules={[{ required: true, message: '请选择项目' }]}
              >
                <Select placeholder="请选择项目">
                  {projects.map(project => (
                    <Option key={project.id} value={project.id}>
                      {project.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            <Form.Item
              name="period"
              label="计算周期"
              rules={[{ required: true, message: '请选择计算周期' }]}
            >
              <RangePicker style={{ width: '100%' }} />
            </Form.Item>

            {calculationType === 'personal' && (
              <Form.Item
                name="calculation_method"
                label="计算方法"
                rules={[{ required: true, message: '请选择计算方法' }]}
              >
                <Select placeholder="请选择计算方法">
                  <Option value="hourly">按工时计算</Option>
                  <Option value="salary">按薪资计算</Option>
                </Select>
              </Form.Item>
            )}

            <Form.Item className="mb-0">
              <div className="flex justify-end space-x-2">
                <Button onClick={() => setModalVisible(false)}>
                  取消
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 border-0"
                >
                  {editingCalculation ? '更新' : '计算'}
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>

        {/* 成本报表模态框 */}
        <Modal
          title="生成成本报表"
          open={reportModalVisible}
          onCancel={() => setReportModalVisible(false)}
          footer={null}
          width={500}
        >
          <Form
            form={reportForm}
            layout="vertical"
            onFinish={handleGenerateReport}
          >
            <Form.Item
              name="report_type"
              label="报表类型"
              rules={[{ required: true, message: '请选择报表类型' }]}
            >
              <Select placeholder="请选择报表类型">
                <Option value="monthly">月度成本报表</Option>
                <Option value="quarterly">季度成本报表</Option>
                <Option value="yearly">年度成本报表</Option>
                <Option value="project">项目成本报表</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="period"
              label="统计周期"
              rules={[{ required: true, message: '请选择统计周期' }]}
            >
              <RangePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item className="mb-0">
              <div className="flex justify-end space-x-2">
                <Button onClick={() => setReportModalVisible(false)}>
                  取消
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  className="bg-gradient-to-r from-purple-500 to-pink-600 border-0"
                >
                  生成报表
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
} 