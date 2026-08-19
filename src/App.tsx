import { Fragment, useEffect, useRef, useState } from "react";
import JourneyGlobeLoader from "./components/JourneyGlobeLoader";
import LocationAlbum from "./components/LocationAlbum";
import { contentAssetUrl } from "./content/assets";
import journeyContent from "./content/journey.json";
import { findAlbumLocation } from "./content/locationAlbums";
import projectsContent from "./content/projects.json";
import researchContent from "./content/research.json";
import siteContent from "./content/site.json";

type ProjectItem = (typeof projectsContent.items)[number] & {
  image?: string;
  imageAlt?: string;
};

const projectItems: ProjectItem[] = projectsContent.items;

function currentAlbumSlug() {
  const parameters = new URLSearchParams(window.location.search);
  return parameters.has("album") ? parameters.get("album") ?? "" : null;
}

function Lines({ lines }: { lines: string[] }) {
  return lines.map((line, index) => (
    <Fragment key={`${line}-${index}`}>
      {line}
      {index < lines.length - 1 && <br />}
    </Fragment>
  ));
}

function SeparatedList({ items, separator }: { items: string[]; separator: string }) {
  return items.map((item, index) => (
    <Fragment key={`${item}-${index}`}>
      <span>{item}</span>
      {index < items.length - 1 && <i>{separator}</i>}
    </Fragment>
  ));
}

function Home({ onOpenAlbum }: { onOpenAlbum: (slug: string) => void }) {
  return (
    <main>
      <section className="hero" id="home" aria-labelledby="hero-title">
        <header className="site-header">
          <a className="brand" href="#home" aria-label={`${siteContent.brand}，返回首页`}>
            <span className="brand-mark" aria-hidden="true"><span /></span>
            <span>{siteContent.brand}</span>
          </a>

          <nav className="site-nav" aria-label="页面导航">
            {siteContent.navigation.map((item, index) => (
              <a className={index === 0 ? "is-active" : ""} href={`#${item.anchor}`} key={item.anchor}>
                {item.label}
              </a>
            ))}
          </nav>
        </header>

        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-vignette" aria-hidden="true" />

        <div className="hero-content">
          <p className="eyebrow">
            <span>{siteContent.hero.englishName}</span>
            <i aria-hidden="true">/</i>
            {siteContent.hero.chineseName}
          </p>
          <h1 id="hero-title">{siteContent.hero.title}</h1>
          <p className="hero-subtitle">{siteContent.hero.subtitle}</p>

          <a className="primary-action" href="#turning-point">
            <span>{siteContent.hero.actionLabel}</span>
            <span className="action-arrow" aria-hidden="true">→</span>
          </a>

          <div className="hero-facts" aria-label="成长轨迹概览">
            <div>
              <span className="fact-icon fact-icon--pin" aria-hidden="true" />
              <SeparatedList items={siteContent.hero.route} separator="→" />
            </div>
            <div>
              <span className="fact-icon fact-icon--cube" aria-hidden="true" />
              <SeparatedList items={siteContent.hero.topics} separator="/" />
            </div>
          </div>
        </div>

        <JourneyGlobeLoader onOpenAlbum={onOpenAlbum} />

        <blockquote className="hero-quote">
          <span className="quote-mark" aria-hidden="true">“</span>
          <p><Lines lines={siteContent.hero.quoteLines} /></p>
          <span className="quote-accent" aria-hidden="true" />
        </blockquote>

        <a className="scroll-cue" href="#turning-point" aria-label="继续向下浏览">
          <span>{siteContent.hero.scrollLabel}</span>
          <i aria-hidden="true">↓</i>
        </a>
      </section>

      <section className="opening" id="turning-point" aria-labelledby="opening-title">
        <div className="section-intro">
          <p className="section-kicker">{journeyContent.journey.kicker}</p>
          <h2 id="opening-title"><Lines lines={journeyContent.journey.titleLines} /></h2>
          <p>{journeyContent.journey.description}</p>
        </div>

        <div className="journey-line" aria-label="个人成长时间线">
          {journeyContent.journey.chapters.map((chapter) => (
            <article className="journey-card" key={`${chapter.index}-${chapter.city}`}>
              <div className="journey-index"><span>{chapter.index}</span><i aria-hidden="true" /></div>
              <p className="journey-place"><strong>{chapter.city}</strong><span>{chapter.english}</span></p>
              <p className="journey-role">{chapter.role}</p>
              <h3>{chapter.title}</h3>
              <p className="journey-copy">{chapter.body}</p>
              <span className="journey-signal">{chapter.signal}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="turning-point" aria-labelledby="turning-title">
        <div className="turning-orbit" aria-hidden="true"><span /><span /><span /></div>
        <div className="turning-copy">
          <p className="section-kicker">{journeyContent.turning.kicker}</p>
          <h2 id="turning-title"><Lines lines={journeyContent.turning.titleLines} /></h2>
        </div>
        <div className="turning-statement">
          <span className="statement-rule" aria-hidden="true" />
          <p>{journeyContent.turning.statementLead} <strong>{journeyContent.turning.statementStrong}</strong></p>
          <p>{journeyContent.turning.description}</p>
        </div>
      </section>

      <section className="exploration" id="exploration" aria-labelledby="exploration-title">
        <div className="section-heading">
          <div>
            <p className="section-kicker">{projectsContent.section.kicker}</p>
            <h2 id="exploration-title">{projectsContent.section.title}</h2>
          </div>
          <p>{projectsContent.section.description}</p>
        </div>

        <div className="project-grid">
          {projectItems.map((project) => (
            <article className={`project-card${project.image ? " has-image" : ""}`} key={project.number}>
              {project.image && (
                <img className="project-image" src={contentAssetUrl(project.image)} alt={project.imageAlt || project.title} />
              )}
              <div className="project-topline"><span>{project.number}</span><p>{project.meta}</p></div>
              <h3>{project.title}</h3>
              <div className="tag-list" aria-label={`${project.title}技术关键词`}>
                {project.tags.map((tag) => <span key={tag}>{tag}</span>)}
              </div>
              <p className="project-body">{project.body}</p>
              <p className="project-insight">{project.insight}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="method" aria-labelledby="method-title">
        <div className="method-heading">
          <p className="section-kicker">{researchContent.method.kicker}</p>
          <h2 id="method-title">{researchContent.method.title}</h2>
        </div>
        <div className="method-track">
          {researchContent.method.items.map((method, index) => (
            <article className="method-step" key={method.step}>
              <div><span>{String(index + 1).padStart(2, "0")}</span><i>{method.step}</i></div>
              <h3>{method.title}</h3>
              <p>{method.body}</p>
            </article>
          ))}
          <span className="method-loop" aria-hidden="true" />
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
          <p className="section-kicker">{researchContent.now.kicker}</p>
          <h2 id="now-title">{researchContent.now.title}</h2>
          <p>{researchContent.now.description}</p>
          <div className="now-topics" aria-label="当前研究关键词">
            {researchContent.now.topics.map((topic) => <span key={topic}>{topic}</span>)}
          </div>
        </div>

        <blockquote className="now-question">
          <small>{researchContent.now.questionLabel}</small>
          <p><Lines lines={researchContent.now.questionLines} /></p>
        </blockquote>
      </section>

      <footer className="site-footer">
        <div>
          <p className="footer-mark">{siteContent.footer.mark}</p>
          <h2>{siteContent.footer.title}</h2>
        </div>
        <div className="footer-meta">
          <p>{siteContent.footer.name}</p>
          <p>{siteContent.footer.route}</p>
          <div className="footer-actions">
            <a href="#home">{siteContent.footer.backLabel}</a>
            <a href={`${import.meta.env.BASE_URL}admin/`}>{siteContent.footer.adminLabel}</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default function App() {
  const [albumSlug, setAlbumSlug] = useState<string | null>(() => currentAlbumSlug());
  const returnScrollRef = useRef(0);
  const albumLocation = findAlbumLocation(albumSlug);

  useEffect(() => {
    const onPopState = () => {
      const nextSlug = currentAlbumSlug();
      setAlbumSlug(nextSlug);
      if (nextSlug === null) {
        window.requestAnimationFrame(() => window.scrollTo({ top: returnScrollRef.current }));
      } else {
        window.scrollTo({ top: 0 });
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (albumSlug !== null) {
      document.title = albumLocation
        ? `${albumLocation.city}相册｜${siteContent.brand}`
        : `相册不存在｜${siteContent.brand}`;
      description?.setAttribute(
        "content",
        albumLocation?.albumDescription?.trim() || `${albumLocation?.city || "地点"}的旅行与生活相册。`,
      );
    } else {
      document.title = siteContent.meta.title;
      description?.setAttribute("content", siteContent.meta.description);
    }
  }, [albumLocation, albumSlug]);

  const openAlbum = (slug: string) => {
    returnScrollRef.current = window.scrollY;
    const url = new URL(window.location.href);
    url.searchParams.set("album", slug);
    url.hash = "";
    window.history.pushState({ albumFromGlobe: true }, "", url);
    setAlbumSlug(slug);
    window.scrollTo({ top: 0 });
  };

  const closeAlbum = () => {
    if (window.history.state?.albumFromGlobe) {
      window.history.back();
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.delete("album");
    url.hash = "home";
    window.history.replaceState(null, "", url);
    setAlbumSlug(null);
    window.scrollTo({ top: 0 });
  };

  if (albumSlug !== null) {
    return <LocationAlbum location={albumLocation} onBack={closeAlbum} />;
  }

  return <Home onOpenAlbum={openAlbum} />;
}
