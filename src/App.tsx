import JourneyGlobeLoader from "./components/JourneyGlobeLoader";

const chapters = [
  {
    index: "01",
    city: "杭州",
    english: "HANGZHOU",
    role: "起点 / 好奇",
    title: "问题，从真实世界里长出来",
    body: "最初吸引我的，不是某个模型的名字，而是一个朴素的问题：机器能否感知环境、作出判断，并安全抵达目的地？这份好奇，后来成为我持续选择自动化、机器人与智能驾驶的内在坐标。",
    signal: "CURIOUS MIND",
  },
  {
    index: "02",
    city: "汉诺威",
    english: "HANNOVER",
    role: "基础 / 工程",
    title: "把抽象原理，变成能运行的系统",
    body: "在汉诺威应用科学与艺术大学学习电气与信息工程、自动化方向。控制、建模与实验训练让我开始用工程语言拆解问题：定义边界、验证假设、分析失败，再让系统向前一步。",
    signal: "ENGINEERING",
  },
  {
    index: "03",
    city: "慕尼黑",
    english: "MUNICH",
    role: "深入 / 研究",
    title: "从确定性控制，走向复杂场景理解",
    body: "在慕尼黑工业大学继续攻读 CIT 相关硕士方向，我把关注点推向智能驾驶感知：研究单目 3D Occupancy 与场景补全，尝试让模型理解遮挡、运动与时间。",
    signal: "INTELLIGENCE",
  },
];

const projects = [
  {
    number: "A",
    meta: "MOBILE ROBOTICS",
    title: "让机器人自己找到路",
    tags: ["ROS2", "Nav2", "SLAM", "MPPI"],
    body: "从零搭建移动机器人导航系统，打通建图、定位、全局规划与局部控制链路；比较 Dijkstra、A* 与 Theta*，理解“找到路径”与“走好路径”之间的系统差异。",
    insight: "成长：从调用模块，到理解模块之间如何互相制约。",
  },
  {
    number: "B",
    meta: "3D PERCEPTION",
    title: "让看不见的空间，被模型理解",
    tags: ["3D SSC", "Optical Flow", "Temporal", "VLM"],
    body: "围绕单目 3D 场景补全与 Occupancy 展开研究，将光流运动信息与历史帧时序特征结合，增强模型对遮挡区域和动态场景的理解。",
    insight: "成长：从读懂论文，到复现、调试并提出自己的组合路径。",
  },
  {
    number: "C",
    meta: "FIELD ENGINEERING",
    title: "在真实故障里学习负责",
    tags: ["CAN", "Diagnosis", "Testing", "Support"],
    body: "参与大众充电站电气故障诊断与 CAN 分析，也在逆变器维护、故障检测和报告中接触真实工程约束。现场不会奖励漂亮假设，只会反馈系统是否可靠。",
    insight: "成长：从完成任务，到为诊断结论和工程闭环负责。",
  },
];

const methods = [
  {
    step: "READ",
    title: "读懂",
    body: "把论文拆成问题、假设、结构与损失，而不是停在结论。",
  },
  {
    step: "BUILD",
    title: "复现",
    body: "让方法在代码、数据与环境里真正运行，暴露隐含条件。",
  },
  {
    step: "DEBUG",
    title: "追因",
    body: "沿张量、指标和可视化定位偏差，拒绝“似乎有效”。",
  },
  {
    step: "RETHINK",
    title: "重构",
    body: "带着失败证据重新组织问题，形成下一轮可验证判断。",
  },
];

export default function Home() {
  return (
    <main>
      <section className="hero" id="home" aria-labelledby="hero-title">
        <header className="site-header">
          <a className="brand" href="#home" aria-label="经纬之间，返回首页">
            <span className="brand-mark" aria-hidden="true">
              <span />
            </span>
            <span>经纬之间</span>
          </a>

          <nav className="site-nav" aria-label="页面导航">
            <a className="is-active" href="#home">
              起点
            </a>
            <a href="#turning-point">转折</a>
            <a href="#exploration">探索</a>
            <a href="#now">此刻</a>
          </nav>
        </header>

        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-vignette" aria-hidden="true" />

        <div className="hero-content">
          <p className="eyebrow">
            <span>Eason</span>
            <i aria-hidden="true">/</i>
            钱一颂
          </p>
          <h1 id="hero-title">经纬之间</h1>
          <p className="hero-subtitle">从杭州到德国，从自动化到智能驾驶</p>

          <a className="primary-action" href="#turning-point">
            <span>沿时间线出发</span>
            <span className="action-arrow" aria-hidden="true">
              →
            </span>
          </a>

          <div className="hero-facts" aria-label="成长轨迹概览">
            <div>
              <span className="fact-icon fact-icon--pin" aria-hidden="true" />
              <span>杭州</span>
              <i>→</i>
              <span>汉诺威</span>
              <i>→</i>
              <span>慕尼黑</span>
            </div>
            <div>
              <span className="fact-icon fact-icon--cube" aria-hidden="true" />
              <span>ROS2</span>
              <i>/</i>
              <span>SLAM</span>
              <i>/</i>
              <span>3D Occupancy</span>
            </div>
          </div>
        </div>

        <JourneyGlobeLoader />

        <blockquote className="hero-quote">
          <span className="quote-mark" aria-hidden="true">
            “
          </span>
          <p>
            人生的意义，
            <br />
            不是按图抵达，
            <br />
            而是在未知中
            <br />
            绘出自己的地图。
          </p>
          <span className="quote-accent" aria-hidden="true" />
        </blockquote>

        <a className="scroll-cue" href="#turning-point" aria-label="继续向下浏览">
          <span>SCROLL TO EXPLORE</span>
          <i aria-hidden="true">↓</i>
        </a>
      </section>

      <section className="opening" id="turning-point" aria-labelledby="opening-title">
        <div className="section-intro">
          <p className="section-kicker">01 / 坐标迁移</p>
          <h2 id="opening-title">
            每一次出发，
            <br />
            都在重新定义方向。
          </h2>
          <p>
            从杭州出发，在汉诺威打下自动化与控制的工程基础，再到慕尼黑深入智能驾驶感知。
            坐标不断变化，驱动我前行的却始终是同一个问题：机器如何理解道路，并在复杂的真实世界中可靠前行。
          </p>
        </div>

        <div className="journey-line" aria-label="个人成长时间线">
          {chapters.map((chapter) => (
            <article className="journey-card" key={chapter.city}>
              <div className="journey-index">
                <span>{chapter.index}</span>
                <i aria-hidden="true" />
              </div>
              <p className="journey-place">
                <strong>{chapter.city}</strong>
                <span>{chapter.english}</span>
              </p>
              <p className="journey-role">{chapter.role}</p>
              <h3>{chapter.title}</h3>
              <p className="journey-copy">{chapter.body}</p>
              <span className="journey-signal">{chapter.signal}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="turning-point" aria-labelledby="turning-title">
        <div className="turning-orbit" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="turning-copy">
          <p className="section-kicker">02 / 转折</p>
          <h2 id="turning-title">
            从“会使用”，
            <br />
            到“能解释”。
          </h2>
        </div>
        <div className="turning-statement">
          <span className="statement-rule" aria-hidden="true" />
          <p>
            真正的转折，不是第一次跑通代码，而是第一次意识到：
            <strong>结果出现，不等于问题被理解。</strong>
          </p>
          <p>
            从那以后，我开始追问数据如何进入系统、误差如何传播、模块为何失效，
            也开始把论文阅读、代码复现和实验诊断连接成一套自己的学习方式。
          </p>
        </div>
      </section>

      <section className="exploration" id="exploration" aria-labelledby="exploration-title">
        <div className="section-heading">
          <div>
            <p className="section-kicker">03 / 探索现场</p>
            <h2 id="exploration-title">成长，发生在问题最具体的地方。</h2>
          </div>
          <p>
            三类项目，三种尺度：系统、感知与现场。
            它们共同教会我把复杂问题拆开，也把零散模块重新连成整体。
          </p>
        </div>

        <div className="project-grid">
          {projects.map((project) => (
            <article className="project-card" key={project.number}>
              <div className="project-topline">
                <span>{project.number}</span>
                <p>{project.meta}</p>
              </div>
              <h3>{project.title}</h3>
              <div className="tag-list" aria-label={`${project.title}技术关键词`}>
                {project.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <p className="project-body">{project.body}</p>
              <p className="project-insight">{project.insight}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="method" aria-labelledby="method-title">
        <div className="method-heading">
          <p className="section-kicker">04 / 我的研究循环</p>
          <h2 id="method-title">把“不懂”，变成下一步行动。</h2>
        </div>
        <div className="method-track">
          {methods.map((method, index) => (
            <article className="method-step" key={method.step}>
              <div>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <i>{method.step}</i>
              </div>
              <h3>{method.title}</h3>
              <p>{method.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="now" id="now" aria-labelledby="now-title">
        <div className="now-radar" aria-hidden="true">
          <span className="radar-ring radar-ring--one" />
          <span className="radar-ring radar-ring--two" />
          <span className="radar-ring radar-ring--three" />
          <span className="radar-core" />
        </div>

        <div className="now-content">
          <p className="section-kicker">05 / 此刻坐标</p>
          <h2 id="now-title">让车辆，看见时间留下的信息。</h2>
          <p>
            我目前聚焦自动驾驶感知中的单目 3D Occupancy 与场景补全，
            探索如何把光流所表达的运动线索，与历史帧的时序特征结合，
            改善模型对遮挡区域和动态场景的空间理解。
          </p>
          <div className="now-topics" aria-label="当前研究关键词">
            <span>Monocular 3D</span>
            <span>Temporal Fusion</span>
            <span>Scene Completion</span>
            <span>Autonomous Driving</span>
          </div>
        </div>

        <blockquote className="now-question">
          <small>NEXT QUESTION</small>
          <p>
            当单帧视觉不再足够，
            <br />
            历史能否成为理解未来的线索？
          </p>
        </blockquote>
      </section>

      <footer className="site-footer">
        <div>
          <p className="footer-mark">经纬之间</p>
          <h2>下一坐标，仍在路上。</h2>
        </div>
        <div className="footer-meta">
          <p>钱一颂 · Eason</p>
          <p>杭州 → 汉诺威 → 慕尼黑</p>
          <a href="#home">回到起点 ↑</a>
        </div>
      </footer>
    </main>
  );
}
