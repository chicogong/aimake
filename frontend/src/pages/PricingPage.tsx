/**
 * Pricing Page
 * Subscription plans and pricing
 */

import { Check, Zap, Crown, Building2 } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const plans = [
  {
    id: 'free',
    name: '免费版',
    description: '适合个人尝试',
    price: 0,
    priceLabel: '¥0',
    period: '永久免费',
    icon: Zap,
    features: [
      '每月 10 分钟额度',
      '6 种基础音色',
      'MP3 格式下载',
      '标准语速调节',
      '历史记录保留 7 天',
    ],
    limitations: ['不支持高级音色', '不支持 WAV 格式', '不支持 API 调用'],
    cta: '免费开始',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    description: '适合内容创作者',
    price: 99,
    priceLabel: '¥99',
    period: '/月',
    icon: Crown,
    features: [
      '每月 300 分钟额度',
      '全部 20+ 种音色',
      'MP3 / WAV 格式下载',
      '语速 + 音调调节',
      '双人播客生成',
      '历史记录永久保留',
      '优先客服支持',
    ],
    limitations: [],
    cta: '升级 Pro',
    popular: true,
  },
  {
    id: 'team',
    name: '团队版',
    description: '适合企业和团队',
    price: 499,
    priceLabel: '¥499',
    period: '/月',
    icon: Building2,
    features: [
      '无限生成额度',
      '全部音色 + 专属定制',
      '所有格式支持',
      '完整参数控制',
      'API 接口访问',
      '多成员协作',
      '专属技术支持',
      'SLA 保障',
    ],
    limitations: [],
    cta: '联系销售',
    popular: false,
  },
];

export function PricingPage() {
  useAuth(); // Used for future authentication features

  const handleSelectPlan = (planId: string) => {
    if (planId === 'free') {
      // Already free, maybe redirect to app
      window.location.href = '/';
    } else if (planId === 'team') {
      // Contact sales
      window.location.href = 'mailto:sales@aimake.cc?subject=团队版咨询';
    } else {
      // Stripe checkout - to be implemented
      alert('支付功能即将上线');
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">简单透明的定价</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          选择适合你的套餐，随时升级或取消
        </p>
      </div>

      {/* Plans grid */}
      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <Card
              key={plan.id}
              className={cn(
                'relative flex flex-col',
                plan.popular && 'border-primary shadow-lg shadow-primary/10 scale-105'
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                  最受欢迎
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div
                  className={cn(
                    'h-14 w-14 mx-auto rounded-2xl flex items-center justify-center mb-4',
                    plan.popular
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  <Icon className="h-7 w-7" />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                {/* Price */}
                <div className="text-center mb-6">
                  <span className="text-4xl font-bold">{plan.priceLabel}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                  {plan.limitations.map((limitation) => (
                    <li key={limitation} className="flex items-start gap-2 text-muted-foreground">
                      <span className="h-5 w-5 flex-shrink-0 text-center">-</span>
                      <span className="text-sm line-through">{limitation}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  onClick={() => handleSelectPlan(plan.id)}
                  variant={plan.popular ? 'gradient' : 'outline'}
                  size="lg"
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="mt-24">
        <h2 className="text-3xl font-bold text-center mb-12">常见问题</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {[
            {
              q: '免费额度用完了怎么办？',
              a: '免费额度每月自动重置。如果需要更多额度，可以升级到 Pro 或团队版。',
            },
            {
              q: '可以随时取消订阅吗？',
              a: '可以随时取消。取消后，当前计费周期内仍可使用，下个周期不再扣费。',
            },
            {
              q: '支持哪些支付方式？',
              a: '支持微信支付、支付宝、信用卡等多种支付方式。',
            },
            {
              q: '团队版有什么优势？',
              a: '团队版提供无限额度、API 接口、多成员协作、专属技术支持和 SLA 保障。',
            },
          ].map(({ q, a }) => (
            <div key={q} className="space-y-2">
              <h3 className="font-semibold">{q}</h3>
              <p className="text-muted-foreground text-sm">{a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-24 text-center">
        <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20 p-8">
          <h3 className="text-2xl font-bold mb-4">还有疑问？</h3>
          <p className="text-muted-foreground mb-6">
            联系我们的团队，获取个性化的方案建议
          </p>
          <Button variant="outline" asChild>
            <a href="mailto:support@aimake.cc">联系我们</a>
          </Button>
        </Card>
      </div>
    </div>
  );
}
