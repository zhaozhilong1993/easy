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
  List,
  Avatar,
  Divider
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  CheckOutlined,
  FileTextOutlined,
  CalendarOutlined,
  UserOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { reportAPI, projectAPI } from '@/services/api';
import MainLayout from '@/components/Layout/MainLayout';
import dayjs from 'dayjs';
import { useAuthStore } from '@/stores/auth';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

interface DailyReport {
  id: number;
  user: {
    id: number;
    name: string;
    username: string;
  };
  date: string;
  completed_tasks: string;
  ongoing_tasks: string;
  next_plan: string;
  problems: string;
  status: string;
  approved_by?: {
    id: number;
    name: string;
  };
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

interface WeeklyReport {
  id: number;
  user: {
    id: number;
    name: string;
    username: string;
  };
  week_start: string;
  week_end: string;
  completed_tasks: string;
  ongoing_tasks: string;
  next_week_plan: string;
  problems: string;
  status: string;
  approved_by?: {
    id: number;
    name: string;
  };
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export default function ReportsPage() {
  const { isAuthenticated, token } = useAuthStore();
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingReport, setEditingReport] = useState<any>(null);
  const [reportType, setReportType] = useState<'daily' | 'weekly'>('daily');
  const [form] = Form.useForm();

  useEffect(() => {
    if (isAuthenticated) {
      console.log('ReportsPage: fetching daily reports, weekly reports and users');
      fetchDailyReports();
      fetchWeeklyReports();
      fetchUsers();
    }
  }, [isAuthenticated]);

  const fetchDailyReports = async () => {
    try {
      setLoading(true);
      const response = await reportAPI.getDailyReports();
      setDailyReports(response.data);
    } catch (error) {
      message.error('获取日报列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyReports = async () => {
    try {
      const response = await reportAPI.getWeeklyReports();
      setWeeklyReports(response.data);
    } catch (error) {
      message.error('获取周报列表失败');
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

  const handleCreate = (type: 'daily' | 'weekly') => {
    setReportType(type);
    setEditingReport(null);
    form.resetFields();
    
    if (type === 'daily') {
      form.setFieldsValue({
        date: dayjs(),
      });
    } else {
      const today = dayjs();
      const weekStart = today.startOf('week');
      const weekEnd = today.endOf('week');
      form.setFieldsValue({
        week_start: weekStart,
        week_end: weekEnd,
      });
    }
    
    setModalVisible(true);
  };

  const handleEdit = (record: any, type: 'daily' | 'weekly') => {
    setReportType(type);
    setEditingReport(record);
    
    if (type === 'daily') {
      form.setFieldsValue({
        date: dayjs(record.date),
        completed_tasks: record.completed_tasks,
        ongoing_tasks: record.ongoing_tasks,
        next_plan: record.next_plan,
        problems: record.problems,
      });
    } else {
      form.setFieldsValue({
        week_start: dayjs(record.week_start),
        week_end: dayjs(record.week_end),
        completed_tasks: record.completed_tasks,
        ongoing_tasks: record.ongoing_tasks,
        next_week_plan: record.next_week_plan,
        problems: record.problems,
      });
    }
    
    setModalVisible(true);
  };

  const handleDelete = async (id: number, type: 'daily' | 'weekly') => {
    try {
      if (type === 'daily') {
        await reportAPI.deleteDailyReport(id);
      } else {
        await reportAPI.deleteWeeklyReport(id);
      }
      message.success('删除成功');
      if (type === 'daily') {
        fetchDailyReports();
      } else {
        fetchWeeklyReports();
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleApprove = async (id: number, type: 'daily' | 'weekly') => {
    try {
      if (type === 'daily') {
        await reportAPI.approveDailyReport(id);
      } else {
        await reportAPI.approveWeeklyReport(id);
      }
      message.success('审批成功');
      if (type === 'daily') {
        fetchDailyReports();
      } else {
        fetchWeeklyReports();
      }
    } catch (error) {
      message.error('审批失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      let data;
      
      if (reportType === 'daily') {
        data = {
          ...values,
          date: values.date.format('YYYY-MM-DD'),
        };
      } else {
        data = {
          ...values,
          week_start: values.week_start.format('YYYY-MM-DD'),
          week_end: values.week_end.format('YYYY-MM-DD'),
        };
      }

      if (editingReport) {
        if (reportType === 'daily') {
          await reportAPI.updateDailyReport(editingReport.id, data);
        } else {
          await reportAPI.updateWeeklyReport(editingReport.id, data);
        }
        message.success('更新成功');
      } else {
        if (reportType === 'daily') {
          await reportAPI.createDailyReport(data);
        } else {
          await reportAPI.createWeeklyReport(data);
        }
        message.success('创建成功');
      }
      setModalVisible(false);
      if (reportType === 'daily') {
        fetchDailyReports();
      } else {
        fetchWeeklyReports();
      }
    } catch (error) {
      message.error(editingReport ? '更新失败' : '创建失败');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'pending': 'orange',
      'approved': 'green',
      'rejected': 'red'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts: { [key: string]: string } = {
      'pending': '待审批',
      'approved': '已通过',
      'rejected': '已拒绝'
    };
    return texts[status] || status;
  };

  const dailyColumns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '提交人',
      dataIndex: 'user',
      key: 'user',
      render: (user: any) => (
        <div className="flex items-center">
          <Avatar size="small" className="mr-2">
            {user.name.charAt(0)}
          </Avatar>
          <span>{user.name}</span>
        </div>
      ),
    },
    {
      title: '已完成任务',
      dataIndex: 'completed_tasks',
      key: 'completed_tasks',
      ellipsis: true,
      width: 200,
    },
    {
      title: '进行中任务',
      dataIndex: 'ongoing_tasks',
      key: 'ongoing_tasks',
      ellipsis: true,
      width: 200,
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
      title: '审批人',
      dataIndex: 'approved_by',
      key: 'approved_by',
      render: (approvedBy: any) => 
        approvedBy ? (
          <div className="flex items-center">
            <span>{approvedBy.name}</span>
            <span className="text-gray-400 ml-2 text-xs">
              {dayjs(approvedBy.approved_at).format('MM-DD HH:mm')}
            </span>
          </div>
        ) : '-',
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record: DailyReport) => (
        <Space>
          {record.status === 'pending' && (
            <>
              <Tooltip title="编辑">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(record, 'daily')}
                />
              </Tooltip>
              <Tooltip title="审批">
                <Button
                  type="text"
                  icon={<CheckOutlined />}
                  onClick={() => handleApprove(record.id, 'daily')}
                />
              </Tooltip>
            </>
          )}
          <Popconfirm
            title="确定要删除这条记录吗？"
            onConfirm={() => handleDelete(record.id, 'daily')}
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

  const weeklyColumns = [
    {
      title: '周期',
      key: 'week_range',
      render: (_, record: WeeklyReport) => (
        <div className="text-sm">
          <div>{dayjs(record.week_start).format('MM-DD')}</div>
          <div>至 {dayjs(record.week_end).format('MM-DD')}</div>
        </div>
      ),
    },
    {
      title: '提交人',
      dataIndex: 'user',
      key: 'user',
      render: (user: any) => (
        <div className="flex items-center">
          <Avatar size="small" className="mr-2">
            {user.name.charAt(0)}
          </Avatar>
          <span>{user.name}</span>
        </div>
      ),
    },
    {
      title: '已完成任务',
      dataIndex: 'completed_tasks',
      key: 'completed_tasks',
      ellipsis: true,
      width: 200,
    },
    {
      title: '进行中任务',
      dataIndex: 'ongoing_tasks',
      key: 'ongoing_tasks',
      ellipsis: true,
      width: 200,
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
      title: '审批人',
      dataIndex: 'approved_by',
      key: 'approved_by',
      render: (approvedBy: any) => 
        approvedBy ? (
          <div className="flex items-center">
            <span>{approvedBy.name}</span>
            <span className="text-gray-400 ml-2 text-xs">
              {dayjs(approvedBy.approved_at).format('MM-DD HH:mm')}
            </span>
          </div>
        ) : '-',
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record: WeeklyReport) => (
        <Space>
          {record.status === 'pending' && (
            <>
              <Tooltip title="编辑">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(record, 'weekly')}
                />
              </Tooltip>
              <Tooltip title="审批">
                <Button
                  type="text"
                  icon={<CheckOutlined />}
                  onClick={() => handleApprove(record.id, 'weekly')}
                />
              </Tooltip>
            </>
          )}
          <Popconfirm
            title="确定要删除这条记录吗？"
            onConfirm={() => handleDelete(record.id, 'weekly')}
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

  // 统计信息
  const dailyPendingCount = dailyReports.filter(report => report.status === 'pending').length;
  const dailyApprovedCount = dailyReports.filter(report => report.status === 'approved').length;
  const weeklyPendingCount = weeklyReports.filter(report => report.status === 'pending').length;
  const weeklyApprovedCount = weeklyReports.filter(report => report.status === 'approved').length;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">日报周报</h1>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleCreate('daily')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 border-0"
            >
              创建日报
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleCreate('weekly')}
              className="bg-gradient-to-r from-green-500 to-blue-600 border-0"
            >
              创建周报
            </Button>
          </Space>
        </div>

        {/* 统计卡片 */}
        <Row gutter={16}>
          <Col xs={24} sm={6}>
            <Card className="dashboard-card">
              <Statistic
                title="日报总数"
                value={dailyReports.length}
                suffix="份"
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="dashboard-card">
              <Statistic
                title="日报待审批"
                value={dailyPendingCount}
                suffix="份"
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="dashboard-card">
              <Statistic
                title="周报总数"
                value={weeklyReports.length}
                suffix="份"
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="dashboard-card">
              <Statistic
                title="周报待审批"
                value={weeklyPendingCount}
                suffix="份"
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>

        <Card className="dashboard-card">
          <Tabs defaultActiveKey="daily">
            <TabPane tab="日报管理" key="daily">
              <Table
                columns={dailyColumns}
                dataSource={dailyReports}
                rowKey="id"
                loading={loading}
                pagination={{
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `共 ${total} 条记录`,
                }}
              />
            </TabPane>
            <TabPane tab="周报管理" key="weekly">
              <Table
                columns={weeklyColumns}
                dataSource={weeklyReports}
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

        {/* 报告表单模态框 */}
        <Modal
          title={editingReport ? `编辑${reportType === 'daily' ? '日报' : '周报'}` : `创建${reportType === 'daily' ? '日报' : '周报'}`}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={800}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            {reportType === 'daily' ? (
              <Form.Item
                name="date"
                label="日期"
                rules={[{ required: true, message: '请选择日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            ) : (
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="week_start"
                    label="周开始日期"
                    rules={[{ required: true, message: '请选择周开始日期' }]}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="week_end"
                    label="周结束日期"
                    rules={[{ required: true, message: '请选择周结束日期' }]}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
            )}

            <Form.Item
              name="completed_tasks"
              label="已完成任务"
              rules={[{ required: true, message: '请输入已完成任务' }]}
            >
              <TextArea 
                rows={4} 
                placeholder="请详细描述已完成的工作任务..."
              />
            </Form.Item>

            <Form.Item
              name="ongoing_tasks"
              label="进行中任务"
              rules={[{ required: true, message: '请输入进行中任务' }]}
            >
              <TextArea 
                rows={4} 
                placeholder="请详细描述正在进行的工作任务..."
              />
            </Form.Item>

            <Form.Item
              name={reportType === 'daily' ? 'next_plan' : 'next_week_plan'}
              label={reportType === 'daily' ? '明日计划' : '下周计划'}
              rules={[{ required: true, message: `请输入${reportType === 'daily' ? '明日计划' : '下周计划'}` }]}
            >
              <TextArea 
                rows={4} 
                placeholder={`请详细描述${reportType === 'daily' ? '明日' : '下周'}的工作计划...`}
              />
            </Form.Item>

            <Form.Item
              name="problems"
              label="遇到的问题"
            >
              <TextArea 
                rows={3} 
                placeholder="请描述工作中遇到的问题和困难..."
              />
            </Form.Item>

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
                  {editingReport ? '更新' : '提交'}
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
} 