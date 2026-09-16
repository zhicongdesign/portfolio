import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import { Asciify } from './components/canvasui/Asciify';
import FoldText from './components/FoldText';
import TiltedCard from './components/TiltedCard';
import './styles.css';

const assetUrl = (path) => {
  if (!path.startsWith('/assets/')) return path;
  const optimizedPath = __OPTIMIZED_IMAGES__[path] || path;
  return `${import.meta.env.BASE_URL}${optimizedPath.slice(1)}`;
};

const homeAssets = Object.fromEntries(Object.entries({
  heroFallback: '/assets/figma-home-v2/hero-fallback.png',
  profilePhoto: '/assets/figma-home-v2/profile-photo-2026.png',
  xiangyuLogo: '/assets/figma-home-v2/logo-xiangyu.png',
  huaweiLogo: '/assets/figma-home-v2/logo-huawei.png',
  alibabaLogo: '/assets/figma-home-v2/logo-alibaba.svg',
  xiangyuCommute: '/assets/figma-home-v2/xiangyu-commute.png',
  xiangyuHome: '/assets/figma-home-v2/xiangyu-home.png',
  aiCard: '/assets/figma-home-v2/ai-card.png',
  huaweiGlobal: '/assets/figma-home-v2/huawei-global.png',
  huaweiBrand: '/assets/figma-home-v2/huawei-brand.png',
  arrow: '/assets/figma-home-v2/arrow.svg',
  loopMotion: '/assets/hero-motion/september-07.mov',
}).map(([key, path]) => [key, assetUrl(path)]));

const profile = {
  name: '庞志聪',
  title: '资深体验设计师',
  headline:
    '具备用户体验与品牌设计能力，关注产品策略、体验链路、视觉系统与品牌落地之间的完整表达。',
  location: '广州 / Remote',
  email: 'zacharypang233@gmail.com',
  wechat: '285126863',
  phone: '15989212228',
  avatar: 'P',
};

const experiences = [
  {
    company: '我爱我家集团-相寓APP',
    role: '资深用户体验设计师',
    period: '2023/7-2025/12',
    detail: '负责相寓app全新版本设计&迭代，AI找房助手、品牌运营设计',
    brand: 'xiangyu',
  },
  {
    company: '华为 2012实验室UCD设计中心',
    role: '高级体验设计师',
    period: '2021/4-2022/11',
    detail: '负责数字能源云品牌创新\n负责华为数字能源云设计（综合能源管理系统，智能光伏 Global 官网设计）',
    brand: 'huawei',
  },
  {
    company: '阿里巴巴 UC事业部',
    role: '资深创意设计师',
    period: '2015/6-2020/9',
    detail: '负责 UC 浏览器品牌营销及运营设计\n负责夸克浏览器市场传播及运营活动设计',
    brand: 'alibaba',
  },
];

const education = [
  {
    school: '广东工业大学',
    major: '视觉传达设计专业',
    period: '2011/9-2015/6',
  },
];

const projectGroups = [
  {
    id: 'xiangyu',
    label: 'PRODUCT EXPERIENCE',
    title: '相寓全新版本设计',
    company: '我爱我家集团 - 相寓APP',
    summary:
      '围绕找房效率、首页屏效、通勤找房和个性化推荐，对相寓 APP 的核心找房路径进行系统改版。',
    cover: 'url("/assets/portfolio-keynote/xiangyu-50.png")',
    number: '01',
    cases: ['xiangyu-50', 'xiangyu-home', 'xiangyu-ai'],
  },
  {
    id: 'huawei',
    label: 'BRAND EXPERIENCE',
    title: '华为数字能源云',
    company: '华为数字能源',
    summary:
      '从品牌升级到官网落地，重塑智能光伏 Global 官网的视觉叙事、信息架构和品牌体验。',
    cover: 'url("/assets/huawei-keynote/huawei-overview.jpg")',
    number: '02',
    cases: ['huawei-brand', 'huawei-global'],
  },
];

const cases = [
  {
    id: 'xiangyu-50',
    groupId: 'xiangyu',
    label: 'APP REDESIGN',
    title: '相寓 5.0 改版',
    company: '我爱我家集团 - 相寓APP',
    summary: '以租房决策效率为核心，重整首页、搜索、推荐与核心服务入口，形成更清晰的新版本框架。',
    cover: 'url("/assets/portfolio-keynote/xiangyu-50.png")',
    heroImage: '/assets/portfolio-keynote/xiangyu-50.png',
    period: '2023/7 - 2025/12',
    role: '体验策略 / 信息架构 / 核心链路改版',
    stats: ['5.0 改版', '首页框架', '找房效率'],
    sections: [
      {
        title: '改版目标',
        body: '相寓 5.0 需要从旧版功能堆叠转向更聚焦的找房体验：让用户更快理解产品、进入搜索、看到匹配房源，并在关键节点建立信任。',
        image: '/assets/portfolio-keynote/xiangyu-50.png',
      },
    ],
  },
  {
    id: 'xiangyu-home',
    groupId: 'xiangyu',
    label: 'HOME PAGE',
    title: '相寓全新首页改版',
    company: '我爱我家集团 - 相寓APP',
    summary: '降低低效运营模块占比，让搜索入口和个性化推荐成为首页主轴，提升首屏找房效率。',
    cover: 'url("/assets/portfolio-keynote/xiangyu-home.png")',
    heroImage: '/assets/portfolio-keynote/xiangyu-home.png',
    period: '2023/7 - 2025/12',
    role: '首页改版 / 搜索体验 / 推荐 Feed',
    stats: ['搜索转化 5.72%', '首页屏效优化', '推荐 Feed'],
    sections: [
      {
        title: '首页现状分析',
        body: '旧首页存在低效模块占比高、搜索入口切换成本高、Feed 流露出不足等问题。用户希望更方便地使用搜索，也希望首页推荐更贴合真实找房偏好。',
        image: '/assets/portfolio-keynote/xiangyu-home.png',
      },
      {
        title: '设计目标',
        body: '降低低效运营模块页面占比，让搜索入口常驻顶部；强化高转化入口，并通过新用户引导与偏好收集，让首页推荐更准确。',
      },
      {
        title: '设计思路',
        body: '从框架开始减少低效内容，强化搜索、通勤和推荐入口；在 Feed 流中增加推荐语和偏好收集卡，将用户行为、搜索历史、浏览记录与首页推荐建立连接。',
      },
    ],
  },
  {
    id: 'xiangyu-ai',
    groupId: 'xiangyu',
    label: 'AI ASSISTANT',
    title: 'AI 找房助手',
    company: '我爱我家集团 - 相寓APP',
    summary: '通过对话式找房承接模糊需求，把预算、位置、通勤、户型等信息转译为可执行的房源推荐。',
    cover: 'url("/assets/portfolio-keynote/xiangyu-ai.png")',
    heroImage: '/assets/portfolio-keynote/xiangyu-ai.png',
    period: '2024/6 - 2025/12',
    role: 'AI 产品体验 / 对话流程 / 推荐策略表达',
    stats: ['AI 找房', '对话流程', '需求澄清'],
    sections: [
      {
        title: '机会点',
        body: '用户在租房初期常常只有模糊目标，例如“离公司近、预算适中、通勤方便”。AI 找房助手承担需求澄清、条件补全和推荐解释的角色。',
        image: '/assets/portfolio-keynote/xiangyu-ai.png',
      },
      {
        title: '核心体验',
        body: '通过连续追问和快捷选项降低输入压力，将用户描述转化为预算、区域、地铁、通勤时长、入住偏好等结构化条件，再反馈推荐理由。',
      },
      {
        title: '后续深化',
        body: '下一阶段可继续补充 AI 小寓角色设定、异常状态、推荐卡片、房源解释和转人工服务流程。',
      },
    ],
  },
  {
    id: 'huawei-brand',
    groupId: 'huawei',
    label: 'BRAND INNOVATION',
    title: '华为数字能源云品牌创新',
    company: '华为数字能源',
    summary: '基于品牌理念建立数字能源云品牌视觉语言，让技术型业务具备更强记忆点与场景温度。',
    cover: 'url("/assets/portfolio-keynote/huawei-brand.png")',
    heroImage: '/assets/portfolio-keynote/huawei-brand.png',
    period: '2021/4 - 2022/11',
    role: '品牌升级 / 视觉系统 / 主视觉延展',
    stats: ['品牌创新', 'Line of Light', '数字能源云'],
    sections: [
      {
        title: '项目背景',
        body: '华为智能光伏官网初期主要面向 B 类用户，整体调性偏理性、传统，并充斥较多专有名词。随着光伏赛道发展，官网需要变得更有温度、更多元、更贴近真实场景。',
        image: '/assets/huawei-keynote/huawei-background.png',
      },
      {
        title: 'Before：品牌感知弱',
        body: '旧体验存在没有记忆点、没有购买欲、形式常规、内容老旧、信息难找、看不懂等问题。品牌升级需要解决“技术强但用户感知弱”的断层。',
        image: '/assets/huawei-keynote/huawei-before.png',
      },
      {
        title: '品牌语言：光的线',
        body: '在华为线元素基础上加入光影效果，让光伏的线更具业务特色。通过光线表达业务场景的连接、人与设备的连接，以及美好生活的连接。',
        image: '/assets/huawei-keynote/huawei-lightline.png',
      },
      {
        title: '视觉延展',
        body: '将品牌语言延展到官网视觉、业务场景、产品展示和传播物料中，形成从抽象品牌概念到具体页面体验的统一表达。',
        image: '/assets/portfolio-keynote/huawei-brand.png',
      },
    ],
  },
  {
    id: 'huawei-global',
    groupId: 'huawei',
    label: 'GLOBAL WEBSITE',
    title: '智能光伏 Global 官网设计',
    company: '华为数字能源',
    summary: '重构智能光伏官网的信息层级和视觉叙事，使复杂能源方案更容易被全球用户理解和浏览。',
    cover: 'url("/assets/portfolio-keynote/huawei-global.png")',
    heroImage: '/assets/portfolio-keynote/huawei-global.png',
    period: '2021/4 - 2022/11',
    role: '官网设计 / 信息架构 / 品牌落地把控',
    stats: ['Global 官网', '智能光伏', '场景化叙事'],
    sections: [
      {
        title: '官网落地',
        body: '在品牌升级基础上，将视觉语言延展到智能光伏 Global 官网，覆盖首页叙事、业务场景、产品展示、支持服务与资料下载等页面。',
        image: '/assets/huawei-keynote/huawei-overview.jpg',
      },
      {
        title: '信息架构',
        body: '官网需要同时服务普通消费者、企业客户和政府等多类人群，因此页面结构从“技术罗列”转向“场景理解、方案选择、产品验证、资料获取”。',
        image: '/assets/huawei-keynote/huawei-longpage.png',
      },
      {
        title: '视觉表达',
        body: '通过更明亮的光感、更清晰的版块节奏和真实场景素材，弱化专有名词压力，增强产品可信度和品牌记忆点。',
        image: '/assets/portfolio-keynote/huawei-global.png',
      },
      {
        title: '最终成果',
        body: '形成适用于全球官网的页面框架、关键视觉和页面组件，帮助能源科技业务以更友好、更具品牌识别度的方式面向多元用户。',
        image: '/assets/huawei-keynote/solar.huawei.com_eu (2)-small-10168.png',
      },
    ],
  },
];

const figmaFrames = [
  { name: '封面', group: 'intro', image: '/assets/figma-frames/cover.png' },
  { name: '履历介绍', group: 'intro', image: '/assets/figma-frames/resume.png' },
  { name: '目录1', group: 'intro', image: '/assets/figma-frames/toc-1.png' },
  { name: '目录2', group: 'intro', image: '/assets/figma-frames/toc-2.png' },
  ...Array.from({ length: 16 }, (_, index) => ({
    name: `相寓通勤${index + 1}`,
    group: 'commute',
    image: `/assets/figma-frames/commute-${String(index + 1).padStart(2, '0')}.png`,
  })),
  { name: '相寓通勤16（续）', group: 'commute', image: '/assets/figma-frames/commute-16b.png' },
  { name: '相寓通勤17', group: 'commute', image: '/assets/figma-frames/commute-17.png' },
  { name: '相寓通勤18', group: 'commute', image: '/assets/figma-frames/commute-18.png' },
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17].map((number) => ({
    name: `相寓APP首页改版${number}`,
    group: 'home',
    image: `/assets/figma-frames/home-${String(number).padStart(2, '0')}.png`,
  })),
  { name: '相寓APP首页改版18-B', group: 'home', image: '/assets/figma-frames/home-bottom-03.png' },
  { name: '相寓APP首页改版19-B', group: 'home', image: '/assets/figma-frames/home-bottom-04.png' },
  ...[1, 2, 3, 4, 5, 6, 14, 7, 8, 9, 10, 11, 12, 13].map((number) => ({
    name: `相寓 AI 找房 ${number}`,
    group: 'ai',
    image:
      number === 14
        ? '/assets/figma-frames/ai-14-updated.png'
        : `/assets/figma-frames/ai-${String(number).padStart(2, '0')}.png`,
  })),
  ...Array.from({ length: 18 }, (_, index) => ({
    name: `华为数字能源云品牌创新 ${index + 1}`,
    group: 'huawei-brand',
    image: `/assets/figma-frames/huawei-brand/huawei-brand-${String(index + 1).padStart(2, '0')}.png`,
  })),
  ...[
    'huawei-global-01.png',
    'huawei-global-02.png',
    'huawei-global-03.png',
    'huawei-global-04.png',
    'huawei-global-05.png',
    'huawei-global-06.png',
    'huawei-global-07.png',
    'huawei-global-08.jpg',
    'huawei-global-09.jpg',
    'huawei-global-10.jpg',
    'huawei-global-11.png',
    'huawei-global-12.png',
    'huawei-global-13.jpg',
    'huawei-global-14.jpg',
    'huawei-global-15.png',
    'huawei-global-16.jpg',
  ].map((fileName, index) => ({
    name: `华为智能光伏 Global 官网设计 ${index + 1}`,
    group: 'huawei-global',
    image: `/assets/figma-frames/huawei-global/${fileName}`,
  })),
];

const homeProjects = [
  {
    id: 'xiangyu-50',
    group: 'XIANGYU',
    period: '2023-2025',
    title: '相寓5.0改版 - 单双人通勤功能',
    image: homeAssets.xiangyuCommute,
  },
  {
    id: 'xiangyu-home',
    group: 'XIANGYU',
    period: '2023-2025',
    title: '相寓全新首页改版',
    image: homeAssets.xiangyuHome,
  },
  {
    id: 'xiangyu-ai',
    group: 'XIANGYU',
    period: '2023-2025',
    title: 'AI找房助手',
    image: homeAssets.aiCard,
  },
  {
    id: 'huawei-global',
    group: 'HUAWEI',
    period: '2021-2022',
    title: '华为智能光伏 Global 官网设计',
    image: homeAssets.huaweiGlobal,
    wide: true,
  },
  {
    id: 'huawei-brand',
    group: 'HUAWEI',
    period: '2021-2022',
    title: '华为数字能源云品牌创新',
    image: homeAssets.huaweiBrand,
    wide: true,
  },
];

function useRevealAnimations(key) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const items = Array.from(document.querySelectorAll('[data-reveal]'));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    root.classList.add('motion-enhanced');

    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-visible'));
      return () => root.classList.remove('motion-enhanced');
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: '0px 0px -7% 0px' },
    );

    items.forEach((item) => observer.observe(item));

    return () => {
      observer.disconnect();
      root.classList.remove('motion-enhanced');
    };
  }, [key]);
}

function App() {
  const [activeCaseId, setActiveCaseId] = useState(null);
  const activeCase = useMemo(() => cases.find((item) => item.id === activeCaseId), [activeCaseId]);

  useRevealAnimations(activeCaseId);

  const closeCaseAt = (sectionId = 'top') => {
    setActiveCaseId(null);
    window.history.replaceState(null, '', `#${sectionId}`);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        document.getElementById(sectionId)?.scrollIntoView({ block: 'start' });
      });
    });
  };

  if (activeCase) {
    return (
      <CasePage
        project={activeCase}
        onBack={closeCaseAt}
        onOpenProject={setActiveCaseId}
      />
    );
  }

  return (
    <main className="portfolioShell figmaPortfolio">
      <FloatingNav />
      <Hero />
      <Resume />
      <Projects onOpenCase={setActiveCaseId} />
      <Footer />
    </main>
  );
}

function FloatingNav() {
  const [navTone, setNavTone] = useState('light');

  useEffect(() => {
    const updateNavTone = () => {
      const resumeTop = document.getElementById('resume')?.offsetTop ?? 0;
      const projectsTop = document.getElementById('projects')?.offsetTop ?? Number.POSITIVE_INFINITY;
      const marker = window.scrollY + 80;
      setNavTone(marker >= resumeTop && marker < projectsTop ? 'dark' : 'light');
    };

    updateNavTone();
    window.addEventListener('scroll', updateNavTone, { passive: true });
    window.addEventListener('resize', updateNavTone);
    return () => {
      window.removeEventListener('scroll', updateNavTone);
      window.removeEventListener('resize', updateNavTone);
    };
  }, []);

  return (
    <header className={`figmaNav is-${navTone}`}>
      <a className="figmaLogo" href="#top">ZHICONG DESIGN</a>
      <nav aria-label="主导航">
        <a href="#top">Home</a>
        <a href="#resume">Resume</a>
        <a href="#projects">Projects</a>
        <a href="#contact">Contact</a>
      </nav>
    </header>
  );
}

function Hero() {
  const [motionReady, setMotionReady] = useState(false);
  const heroRef = useRef(null);
  const loopVideoRef = useRef(null);

  useEffect(() => {
    const hero = heroRef.current;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    if (!hero) return undefined;

    if (reduceMotion) {
      loopVideoRef.current?.pause();
      return undefined;
    }

    let frameId = 0;
    let pointerX = 0;
    let pointerY = 0;

    const paint = () => {
      const scrollOffset = Math.min(window.scrollY, hero.offsetHeight) * 0.075;
      hero.style.setProperty('--hero-scroll-y', `${scrollOffset}px`);
      hero.style.setProperty('--texture-x', `${pointerX * -5}px`);
      hero.style.setProperty('--texture-y', `${pointerY * -4}px`);
      hero.style.setProperty('--ribbon-x', `${pointerX * 10}px`);
      hero.style.setProperty('--ribbon-y', `${pointerY * 7}px`);
      hero.style.setProperty('--motion-x', `${pointerX * 18}px`);
      hero.style.setProperty('--motion-y', `${pointerY * 14}px`);
      hero.style.setProperty('--motion-tilt-x', `${pointerY * -0.9}deg`);
      hero.style.setProperty('--motion-tilt-y', `${pointerX * 0.9}deg`);
      hero.style.setProperty('--motion-scroll-y', `${scrollOffset * 0.42}px`);
      frameId = 0;
    };

    const requestPaint = () => {
      if (!frameId) frameId = window.requestAnimationFrame(paint);
    };

    const handlePointerMove = (event) => {
      if (!finePointer) return;
      pointerX = event.clientX / window.innerWidth - 0.5;
      pointerY = event.clientY / window.innerHeight - 0.5;
      requestPaint();
    };

    const resetPointer = () => {
      pointerX = 0;
      pointerY = 0;
      requestPaint();
    };

    paint();
    window.addEventListener('scroll', requestPaint, { passive: true });
    hero.addEventListener('pointermove', handlePointerMove, { passive: true });
    hero.addEventListener('pointerleave', resetPointer);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', requestPaint);
      hero.removeEventListener('pointermove', handlePointerMove);
      hero.removeEventListener('pointerleave', resetPointer);
    };
  }, []);

  return (
    <section className="figmaHero" id="top" ref={heroRef}>
      <Asciify
        className="heroAsciify"
        radius={0.18}
        softness={0.65}
        scale={5}
        spacing={1}
        backgroundOpacity={0}
        contrast={1.1}
        brightness={0}
        invert={0}
        glow={0.25}
        aberration={0.18}
        strength={0.72}
        baseStrength={0}
        followSpeed={3}
        charset="ascii"
        background={[0, 0, 0]}
      >
        <img className="figmaHeroFallback" src={homeAssets.heroFallback} alt="" aria-hidden="true" />
        <div className={`heroMotion${motionReady ? ' is-ready' : ''}`} aria-hidden="true">
          <video
            className="heroMotionVideo"
            ref={loopVideoRef}
            src={homeAssets.loopMotion}
            poster={homeAssets.heroFallback}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            onCanPlay={() => setMotionReady(true)}
          />
        </div>

        <div className="figmaHeroContent">
          <h1 className="figmaHeroTitle">PORTFOLIO</h1>
          <div className="figmaHeroIdentity">
            <h2>庞志聪 - 资深体验设计师</h2>
            <p>{profile.headline}</p>
          </div>
          <p className="figmaHeroYear"><span>UPDATED</span><span>2026</span></p>
          <div className="figmaHeroActions" aria-label="快速入口">
            <a className="figmaPrimaryButton" href="#resume">了解我</a>
            <a className="figmaSecondaryButton" href="#projects">查看作品</a>
          </div>
        </div>
      </Asciify>
    </section>
  );
}

function Resume() {
  return (
    <section className="introSection" id="resume">
      <div className="introPanel">
        <aside className="introProfile" data-reveal>
          <div className="introPortrait">
            <TiltedCard
              imageSrc={homeAssets.profilePhoto}
              altText="庞志聪"
              containerHeight="100%"
              containerWidth="100%"
              imageHeight="100%"
              imageWidth="100%"
              rotateAmplitude={8}
              scaleOnHover={1.035}
              showMobileWarning={false}
              showTooltip={false}
              displayOverlayContent
              overlayContent={<span className="introPortraitAccent" aria-hidden="true" />}
            />
          </div>
          <h2>I'm ZHICONG PANG</h2>
          <p>A Senior User Experience Designer</p>
        </aside>

        <div className="introTimeline" aria-label="履历">
          {experiences.map((item, index) => (
            <article
              className="introExperience"
              key={item.company}
              data-reveal
              style={{ '--reveal-delay': `${index * 90}ms` }}
            >
              <span className={`introBrand introBrand--${item.brand}`}>
                <img
                  src={homeAssets[`${item.brand}Logo`]}
                  alt=""
                  aria-hidden="true"
                />
              </span>
              <div>
                <header>
                  <p><strong>{item.company}</strong> {item.role}</p>
                  <time>{item.period}</time>
                </header>
                <p className="introDescription">{item.detail}</p>
              </div>
            </article>
          ))}

          {education.map((item) => (
            <article className="introEducation" key={item.school} data-reveal>
              <span className="introEducationIcon" aria-hidden="true">🎓</span>
              <div>
                <p><strong>{item.school}</strong> {item.major}</p>
              </div>
              <time>{item.period}</time>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Projects({ onOpenCase }) {
  return (
    <section className="figmaProjects" id="projects">
      <div className="projectBand projectBand--xiangyu">
        <header className="projectGroupHeader" data-reveal>
          <div>
            <h2>XIANGYU</h2>
            <p>2023-2025</p>
          </div>
          <strong>PROJECTS</strong>
        </header>

        <div className="projectGrid projectGrid--three">
          {homeProjects.filter((item) => item.group === 'XIANGYU').map((item, index) => (
            <ProjectCard item={item} key={item.id} onOpenCase={onOpenCase} revealDelay={index * 100} />
          ))}
        </div>
      </div>

      <div className="projectBand projectBand--huawei">
        <header className="projectGroupHeader" data-reveal>
          <div>
            <h2>HUAWEI</h2>
            <p>2021-2022</p>
          </div>
        </header>

        <div className="projectGrid projectGrid--two">
          {homeProjects.filter((item) => item.group === 'HUAWEI').map((item, index) => (
            <ProjectCard item={item} key={item.id} onOpenCase={onOpenCase} revealDelay={index * 110} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ item, onOpenCase, revealDelay = 0, className = '' }) {
  const handlePointerMove = (event) => {
    if (
      !window.matchMedia('(pointer: fine)').matches
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    event.currentTarget.style.setProperty('--card-rotate-x', `${(0.5 - y) * 3}deg`);
    event.currentTarget.style.setProperty('--card-rotate-y', `${(x - 0.5) * 3}deg`);
    event.currentTarget.style.setProperty('--card-shine-x', `${x * 100}%`);
    event.currentTarget.style.setProperty('--card-shine-y', `${y * 100}%`);
  };

  const resetPointer = (event) => {
    event.currentTarget.style.setProperty('--card-rotate-x', '0deg');
    event.currentTarget.style.setProperty('--card-rotate-y', '0deg');
  };

  return (
    <button
      className={`projectCard${item.wide ? ' projectCard--wide' : ''}${className ? ` ${className}` : ''}`}
      type="button"
      onClick={() => onOpenCase(item.id)}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      data-reveal
      style={{ '--reveal-delay': `${revealDelay}ms` }}
    >
      <img src={item.image} alt={`${item.title}项目封面`} loading="lazy" decoding="async" />
      {item.orb && <img className="projectOrb" src={item.orb} alt="" aria-hidden="true" />}
      <span className="projectShade" aria-hidden="true" />
      <span className="projectTitle">{item.title}</span>
      <img className="projectArrow" src={homeAssets.arrow} alt="" aria-hidden="true" />
    </button>
  );
}

function CasePage({ project, onBack, onOpenProject }) {
  const relatedFrames = getRelatedFrames(project.id);
  const projectIndex = cases.findIndex((item) => item.id === project.id) + 1;
  const otherProjects = homeProjects.filter((item) => item.id !== project.id);
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const available = document.documentElement.scrollHeight - window.innerHeight;
      setReadingProgress(available > 0 ? Math.min(window.scrollY / available, 1) : 0);
    };

    window.scrollTo(0, 0);
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    return () => window.removeEventListener('scroll', updateProgress);
  }, [project.id]);

  const handleHomeNavigation = (event, sectionId) => {
    event.preventDefault();
    onBack(sectionId);
  };

  return (
    <main className="casePage">
      <div className="caseReadingProgress" aria-hidden="true">
        <span style={{ transform: `scaleY(${readingProgress})` }} />
      </div>

      <header className="figmaNav caseDetailNav is-light">
        <a className="figmaLogo" href="#top" onClick={(event) => handleHomeNavigation(event, 'top')}>
          ZHICONG DESIGN
        </a>
        <nav aria-label="主导航">
          <a href="#top" onClick={(event) => handleHomeNavigation(event, 'top')}>Home</a>
          <a href="#resume" onClick={(event) => handleHomeNavigation(event, 'resume')}>Resume</a>
          <a href="#projects" onClick={(event) => handleHomeNavigation(event, 'projects')}>Projects</a>
          <a href="#contact" onClick={(event) => handleHomeNavigation(event, 'contact')}>Contact</a>
        </nav>
      </header>

      <header className="caseHero" data-reveal>
        <div className="caseHeroHeading">
          <p className="eyebrow">CASE STUDY / {String(projectIndex).padStart(2, '0')}</p>
          <h1>{project.title}</h1>
          <time>{project.period}</time>
        </div>
        <p className="caseHeroSummary">{project.summary}</p>
      </header>

      {relatedFrames.length > 0 && (
        <section className="caseFrameStrip">
          <div className="frameScroller">
            {relatedFrames.map((frame, index) => (
              <figure className="frameThumb" key={`${frame.name}-${index}`}>
              <img src={assetUrl(frame.image)} alt={frame.name} loading="lazy" decoding="async" />
              </figure>
            ))}
          </div>
        </section>
      )}

      <section className="caseMetadata" data-reveal>
        <h2>Metadata</h2>
        <div>
          <span>PROJECT</span>
          <strong>{project.title}</strong>
        </div>
        <div>
          <span>PERIOD</span>
          <strong>{project.period}</strong>
        </div>
        <div>
          <span>CHAPTERS</span>
          <strong>{relatedFrames.length}</strong>
        </div>
        <div>
          <span>CONTACT</span>
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
        </div>
      </section>

      <section className="caseMoreProjects" aria-label="浏览其他项目">
        <div className="caseMoreProjectsGrid">
          {otherProjects.map((item, index) => (
            <ProjectCard
              className="caseMoreProjectCard"
              item={item}
              key={item.id}
              onOpenCase={onOpenProject}
              revealDelay={index * 80}
            />
          ))}
        </div>
      </section>

    </main>
  );
}

function getRelatedFrames(caseId) {
  const groupMap = {
    'xiangyu-50': ['commute'],
    'xiangyu-home': ['home'],
    'xiangyu-ai': ['ai'],
    'huawei-brand': ['huawei-brand'],
    'huawei-global': ['huawei-global'],
  };
  const groups = groupMap[caseId] || [];
  return figmaFrames.filter((frame) => groups.includes(frame.group));
}

function Footer() {
  return (
    <footer className="figmaContact" id="contact">
      <div className="contactBackground" aria-hidden="true" />
      <h2 className="contactFoldHeading">
        <FoldText
          className="contactFoldText"
          color="#ffffff"
          creaseShading={0.55}
          duration={0.75}
          ease="power3.out"
          fontSize="clamp(40px, 6.25vw, 120px)"
          fontWeight={900}
          hinge="bottom"
          perspective={700}
          splitBy="char"
          stagger={0.045}
          text={'LET’S CREATE\nWHAT’S NEXT'}
          trigger="scroll"
        />
      </h2>
      <div className="contactLinks" data-reveal style={{ '--reveal-delay': '100ms' }}>
        <p><span>MAIL</span><a href={`mailto:${profile.email}`}>{profile.email}</a></p>
        <p><span>WECHAT</span><strong>{profile.wechat}</strong></p>
      </div>
    </footer>
  );
}

createRoot(document.getElementById('root')).render(
  <>
    <App />
    <Analytics />
  </>,
);
