'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import MainLayout from '@/components/Layout/MainLayout';
import AuthGuard from '@/components/AuthGuard';
import DashboardPage from './dashboard/page';

export default function HomePage() {
  const { isAuthenticated, getProfile } = useAuthStore();

  useEffect(() => {
    // 尝试获取用户信息来初始化认证状态
    getProfile().catch(() => {
      // 如果获取失败，说明未登录，会被重定向到登录页
    });
  }, [getProfile]);

  // 如果未认证，显示空内容（会被重定向到登录页）
  if (!isAuthenticated) {
    return null;
  }

  return (
    <AuthGuard>
      <MainLayout>
        <DashboardPage />
      </MainLayout>
    </AuthGuard>
  );
} 