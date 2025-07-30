'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { Spin } from 'antd';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, getProfile } = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 添加调试日志
    console.log('AuthGuard: isAuthenticated =', isAuthenticated);
    
    // 尝试获取用户信息来验证Session状态
    const checkAuth = async () => {
      try {
        await getProfile();
        console.log('AuthGuard: authentication successful');
        setIsLoading(false);
      } catch (error) {
        console.log('AuthGuard: authentication failed, redirecting to login');
        router.push('/login');
      }
    };
    
    // 给一些时间让认证状态初始化
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        checkAuth();
      } else {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, getProfile, router]);

  // 显示加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  // 如果未认证，显示空内容（会被重定向到登录页）
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return <>{children}</>;
} 