import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Headphones, UserPlus, LogIn, BookOpen } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { login, signup, enterGuestMode } = useAuth();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [authTab, setAuthTab] = useState('login');

  const handleGuestMode = (): void => {
    enterGuestMode();
    toast.success('已进入游客模式，数据将保存在本地');
    navigate('/audiobook');
  };

  const handleLogin = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error('请填写邮箱和密码');
      return;
    }
    setLoginLoading(true);
    try {
      await login(loginEmail, loginPassword);
      toast.success('登录成功');
      navigate('/audiobook');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '登录失败';
      toast.error(msg);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!signupEmail || !signupPassword) {
      toast.error('请填写邮箱和密码');
      return;
    }
    if (signupPassword.length < 6) {
      toast.error('密码至少 6 位');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      toast.error('两次输入的密码不一致');
      return;
    }
    setSignupLoading(true);
    try {
      await signup(signupEmail, signupPassword);
      toast.success('注册成功，请查收验证邮件');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '注册失败';
      toast.error(msg);
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50/60 via-orange-50/30 to-background px-4 py-12">
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center">
          <div className="mb-4 inline-flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg">
            <Headphones className="size-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            有声书追踪
          </h1>
          <p className="mt-2 text-muted-foreground">
            记录你的听书旅程，发现更多精彩有声作品
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="transition-all hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="size-5 text-amber-500" />
                注册账号
              </CardTitle>
              <CardDescription>
                创建账号，多端同步你的听书记录
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={authTab} onValueChange={setAuthTab} className="w-full">
                <TabsList className="mb-4 w-full bg-muted/50">
                  <TabsTrigger value="login" className="flex-1">登录</TabsTrigger>
                  <TabsTrigger value="signup" className="flex-1">注册</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="login-email">邮箱</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="your@email.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="login-password">密码</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loginLoading}
                    >
                      <LogIn className="size-4" />
                      {loginLoading ? '登录中...' : '登录'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="signup-email">邮箱</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="signup-password">密码</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="至少 6 位"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="signup-confirm">确认密码</Label>
                      <Input
                        id="signup-confirm"
                        type="password"
                        placeholder="再次输入密码"
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={signupLoading}
                    >
                      <UserPlus className="size-4" />
                      {signupLoading ? '注册中...' : '注册'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="size-5 text-orange-500" />
                游客模式
              </CardTitle>
              <CardDescription>
                无需注册，本地存储你的听书记录
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">✓</span>
                  快速开始，无需登录
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">✓</span>
                  数据保存在本地浏览器
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">✓</span>
                  浏览推荐内容
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground/50">!</span>
                  清除缓存会丢失数据
                </li>
              </ul>
              <Button
                variant="secondary"
                className="w-full"
                onClick={handleGuestMode}
              >
                以游客身份进入
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
