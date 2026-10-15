import { useReportMotion } from "./useReportMotion";
import { ui } from "./content/report";
import React, { useEffect, useRef, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "katex/dist/katex.min.css";
import "@fontsource/noto-sans-symbols/400.css";
import "@fontsource/pt-serif/cyrillic-400.css";
import "@fontsource/pt-serif/latin-400.css";
import "@fontsource/pt-serif/cyrillic-400-italic.css";
import "@fontsource/ibm-plex-sans/cyrillic-400.css";
import "@fontsource/ibm-plex-sans/latin-400.css";
import "@fontsource/ibm-plex-sans/cyrillic-500.css";
import "@fontsource/ibm-plex-sans/latin-500.css";
import "@fontsource/ibm-plex-mono/cyrillic-400.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import { report as r, number } from "./content/report";
import {
  Plot,
  Surface,
  Interval,
  MonteCarlo,
  Risk,
  Network,
  Argument,
  LiveModel,
} from "./Charts";
import { weighted } from "./lib/fakeData";
import "./style.css";

function Exhibit({
  n,
  children,
  className = "",
}: {
  n: number;
  children?: ReactNode;
  className?: string;
}) {
  const [title, body] = r.exhibits[n - 1];
  return (
    <article
      className={`exhibit ${className}`}
      id={`exhibit-${n}`}
      tabIndex={n === 26 ? 0 : undefined}
      aria-labelledby={`exhibit-title-${n}`}
    >
      <div className="exhibit-head">
        <span className="mono">
          {ui.text001} {String(n).padStart(2, "0")}
        </span>
        <h3 id={`exhibit-title-${n}`}>{title}</h3>
      </div>
      <p className="exhibit-copy">{body}</p>
      {children}
    </article>
  );
}
function Chapter({
  id,
  no,
  title,
  subtitle,
  children,
  dark = false,
}: {
  id: string;
  no: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <section id={id} className={`chapter ${dark ? "dark" : ""}`}>
      <div className="chapter-heading">
        <span className="chapter-number">{no}</span>
        <div>
          <p className="eyebrow">
            {ui.text002} {no}
          </p>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
function Formula({ tex }: { tex: string }) {
  const element = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState("");
  useEffect(() => {
    let cancelled = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          void import("katex").then(({ default: katex }) => {
            if (!cancelled)
              setHtml(
                katex.renderToString(tex, {
                  throwOnError: false,
                  displayMode: true,
                  output: "htmlAndMathml",
                }),
              );
          });
        }
      },
      { rootMargin: "300px" },
    );
    if (element.current) observer.observe(element.current);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [tex]);
  return (
    <div ref={element} className="formula" aria-busy={!html}>
      {html ? (
        <div dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <code>{tex}</code>
      )}
    </div>
  );
}
function App() {
  const [menu, setMenu] = useState(false);
  const [active, setActive] = useState("summary");
  const [progress, setProgress] = useState(0);
  const [motion, setMotion] = useState(
    () =>
      !matchMedia("(prefers-reduced-motion: reduce)").matches &&
      r.animationIntensity > 0,
  );
  const [notice, setNotice] = useState("");
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    document.title = `Кількісний аналіз того, чому ${r.friendName} помиляється`;
    console.info("Peer review failed successfully.");
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setMotion(!media.matches && r.animationIntensity > 0);
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.motion = motion ? "on" : "off";
    document.documentElement.style.setProperty(
      "--duration",
      `${1400 / Math.max(0.1, r.animationIntensity)}ms`,
    );
  }, [motion]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          e.target.classList.toggle("in-view", e.isIntersecting);
          if (e.isIntersecting && e.target.classList.contains("chapter"))
            setActive(e.target.id);
        }),
      { threshold: 0.08 },
    );
    document
      .querySelectorAll(".chapter,.exhibit")
      .forEach((el) => observer.observe(el));
    let scheduled = false;
    const scroll = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        setProgress(
          (window.scrollY /
            Math.max(
              1,
              document.documentElement.scrollHeight - window.innerHeight,
            )) *
            100,
        );
        scheduled = false;
      });
    };
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", scroll);
    };
  }, []);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape" && menu) {
        setMenu(false);
        menuButton.current?.focus();
      }
      if (e.altKey && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        e.preventDefault();
        const i = r.chapters.findIndex(([id]) => id === active);
        const next =
          r.chapters[
            Math.max(
              0,
              Math.min(
                r.chapters.length - 1,
                i + (e.key === "ArrowDown" ? 1 : -1),
              ),
            )
          ];
        document.getElementById(next[0])?.scrollIntoView();
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [active, menu]);
  useReportMotion(motion, menu);
  const scores = weighted(r.criteria);
  return (
    <>
      <a className="skip" href="#summary">
        {ui.text003}
      </a>
      <header className="masthead">
        <a className="brand" href="#top">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 48 48" fill="none">
              <path
                d="M24 3v42M3 24h42M9 9l30 30M9 39L39 9"
                stroke="currentColor"
                strokeWidth="3"
              />
              <circle
                cx="24"
                cy="24"
                r="7"
                fill="var(--paper)"
                stroke="currentColor"
                strokeWidth="3"
              />
            </svg>
          </span>
          <span>
            {ui.text004}
            <br />
            {ui.text005}
          </span>
        </a>
        <span className="mast-note">{ui.text006}</span>
        <button
          ref={menuButton}
          aria-expanded={menu}
          aria-controls="contents"
          onClick={() => setMenu(!menu)}
        >
          {menu ? ui.text007 : ui.text008}
        </button>
      </header>
      <div
        className="reading-progress"
        style={{ transform: `scaleX(${progress / 100})` }}
        aria-hidden="true"
      />
      {menu && (
        <nav id="contents" aria-label={ui.text009}>
          <p className="eyebrow">{ui.text010}</p>
          {r.chapters.map(([id, title], i) => (
            <a key={id} href={`#${id}`} onClick={() => setMenu(false)}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              {title}
              <span>↗</span>
            </a>
          ))}
          <p className="fine">{ui.text011}</p>
        </nav>
      )}
      <main>
        <section id="top" className="hero">
          <div className="hero-meta">
            <span>{ui.text012}</span>
            <span>{ui.text013}</span>
          </div>
          <div className="hero-main">
            <div>
              <p className="eyebrow">{ui.text014}</p>
              <h1>
                <span className="title-line">
                  <span>{ui.text015}</span>
                </span>{" "}
                <span className="title-line">
                  <span>{ui.text016}</span>
                </span>{" "}
                <span className="title-line">
                  <span className="friend">{r.friendName}</span>
                </span>{" "}
                <span className="title-line">
                  <span>
                    <em>{ui.text017}</em>
                  </span>
                </span>
              </h1>
            </div>
            <aside className="hero-aside">
              <div className="plate-meta" aria-hidden="true">
                <span>БНД / LAB—001</span>
                <span>↗</span>
              </div>
              <div className="plate-index" aria-hidden="true">
                01
              </div>
              <span className="stamp">
                {ui.text018}
                <small>{ui.text019}</small>
              </span>
              <div className="hero-surface">
                <Surface />
              </div>
              <p className="mono">{ui.text020}</p>
              <p>
                {ui.text021}
                <br />
                {ui.text022}
              </p>
            </aside>
          </div>
          <div className="hero-footer">
            <p>{r.subtitle}</p>
            <a className="primary" href="#summary">
              {ui.text023}
              <span>↓</span>
            </a>
            <div className="hero-facts">
              <span>
                {ui.text024}
                <b>n = 1</b>
              </span>
              <span>
                {ui.text025}
                <b>{ui.text026}</b>
              </span>
              <span>
                {ui.text027}
                <b>{ui.text028}</b>
              </span>
            </div>
          </div>
          <p className="disclaimer">{r.disclaimer}</p>
        </section>
        <div className="chapter-nav" aria-label={ui.text029}>
          <span>{ui.text030}</span>
          <nav aria-label={ui.text031}>
            {r.chapters.map(([id, title], i) => (
              <a
                key={id}
                href={`#${id}`}
                aria-current={active === id ? "location" : undefined}
                title={title}
              >
                {String(i + 1).padStart(2, "0")}
                <span>{title}</span>
              </a>
            ))}
          </nav>
          <button onClick={() => setMotion(!motion)} aria-pressed={!motion}>
            {motion ? ui.text032 : ui.text033}
          </button>
        </div>
        <Chapter id="summary" no="01" title={ui.text034} subtitle={ui.text035}>
          <Exhibit n={1}>
            <div className="executive">
              {r.friendName}
              <br />
              <em>{ui.text036}</em>
              <span className="conclusion-mark" aria-hidden="true">
                ↙
              </span>
            </div>
            <p>{ui.text037}</p>
            <div className="stats-strip">
              <div>
                <strong className="red">
                  {number(r.statistics.correct)}
                  <small>%</small>
                </strong>
                <p>{ui.text038}</p>
              </div>
              <div>
                <strong>
                  {number(r.statistics.confident)}
                  <small>%</small>
                </strong>
                <p>{ui.text039}</p>
              </div>
              <div>
                <strong>−0,81</strong>
                <p>{ui.text040}</p>
              </div>
              <div>
                <strong>≈ 0</strong>
                <p>{ui.text041}</p>
              </div>
            </div>
          </Exhibit>
          <Exhibit n={2} className="impact">
            <div className="impact-bars">
              <div>
                <span>{ui.text042}</span>
                <i style={{ width: "1%" }} />
              </div>
              <div>
                <span>{ui.text043}</span>
                <i style={{ width: "100%" }} />
              </div>
            </div>
            <p className="fine">{ui.text044}</p>
          </Exhibit>
        </Chapter>
        <Chapter id="scope" no="02" title={ui.text045} subtitle={ui.text046}>
          <Exhibit n={3}>
            <div className="disagreement">{r.disagreement}</div>
            <div className="positions">
              <p>
                <span className="mono">{ui.text047}</span>
                {r.myPosition}
              </p>
              <span className="versus">vs.</span>
              <p>
                <span className="mono">{ui.text048}</span>
                {r.friendPosition}
              </p>
            </div>
          </Exhibit>
          <div className="scope-grid">
            <Exhibit n={4}>
              <ol className="timeline">
                {r.timeline.map(([t, text]) => (
                  <li key={t}>
                    <span>{t}</span>
                    <p>{text}</p>
                  </li>
                ))}
              </ol>
            </Exhibit>
            <div>
              <Exhibit n={5}>
                <blockquote>
                  {ui.text049}
                  <br />
                  {ui.text050}
                  <br />
                  <em>{ui.text051}</em>
                </blockquote>
              </Exhibit>
              <Exhibit n={6}>
                <details>
                  <summary>
                    {ui.text052}
                    <span>+</span>
                  </summary>
                  <dl className="methods">
                    {r.methods.map(([title, text]) => (
                      <React.Fragment key={title}>
                        <dt>{title}</dt>
                        <dd>{text}</dd>
                      </React.Fragment>
                    ))}
                  </dl>
                </details>
                <p className="sample-size">
                  n = 1<small>{ui.text053}</small>
                </p>
              </Exhibit>
            </div>
          </div>
          <Exhibit n={7}>
            <div className="dataset">
              <span>{ui.text054}</span>
              <span>SEED {r.seed}</span>
              <span>{ui.text055}</span>
              <span>{ui.text056}</span>
            </div>
          </Exhibit>
        </Chapter>
        <Chapter id="evidence" no="03" title={ui.text057} subtitle={ui.text058}>
          <Exhibit n={8} className="featured-chart">
            <Plot />
            <p className="figure-caption">{ui.text059}</p>
          </Exhibit>
          <div className="two-column">
            <Exhibit n={9}>
              <Plot kind="line" />
            </Exhibit>
            <Exhibit n={10}>
              <Plot kind="cumulative" />
            </Exhibit>
          </div>
          <div className="two-column unequal">
            <Exhibit n={11}>
              <div className="efficiency">
                <div>
                  <b>100</b>
                  <span>{ui.text060}</span>
                </div>
                <div>
                  <b>3</b>
                  <span>{ui.text061}</span>
                </div>
              </div>
              <p className="mono">{ui.text062}</p>
              <Plot kind="stability" />
            </Exhibit>
            <Exhibit n={12}>
              <Surface />
              <Formula tex="W=\frac{C\cdot S^{2}}{E+1}" />
              <p className="fine">{ui.text063}</p>
            </Exhibit>
          </div>
        </Chapter>
        <Chapter
          id="statistics"
          no="04"
          title={ui.text064}
          subtitle={ui.text065}
        >
          <div className="two-column">
            <Exhibit n={13}>
              <Formula tex="\widehat{W}=12.8+0.74C+\varepsilon" />
              <div className="stat-pair">
                <span>
                  R² <b>0,87</b>
                </span>
                <span>
                  {ui.text066}
                  <b>14,72</b>
                </span>
              </div>
            </Exhibit>
            <Exhibit n={14}>
              <Formula tex="P(H\mid E)\propto P(E\mid H)P(H)" />
              <Plot kind="distribution" />
              <p className="fine">{ui.text067}</p>
            </Exhibit>
          </div>
          <Exhibit n={15} className="p-value">
            <span className="mono">{ui.text068}</span>
            <div>
              p = <em>{r.statistics.p}</em>
            </div>
            <p>{ui.text069}</p>
          </Exhibit>
          <Exhibit n={16}>
            <Interval />
          </Exhibit>
        </Chapter>
        <Chapter
          id="simulation"
          no="05"
          title={ui.text070}
          subtitle={ui.text071}
          dark
        >
          <Exhibit n={17}>
            <MonteCarlo motion={motion} />
            <p className="figure-caption">{ui.text072}</p>
          </Exhibit>
          <Exhibit n={18}>
            <div className="scenario-list">
              {[
                [ui.text073, ui.text074, ui.text075],
                [ui.text076, ui.text077, ui.text078],
                [ui.text079, ui.text080, ui.text081],
              ].map(([name, body, result]) => (
                <div key={name}>
                  <h4>{name}</h4>
                  <p>{body}</p>
                  <span>{result}</span>
                </div>
              ))}
            </div>
          </Exhibit>
        </Chapter>
        <Chapter id="strategy" no="06" title={ui.text082} subtitle={ui.text083}>
          <Exhibit n={19}>
            <div className="swot">
              {r.swot.map(([letter, title, ...items]) => (
                <div key={letter}>
                  <span className="swot-letter">{letter}</span>
                  <h4>{title}</h4>
                  <ul>
                    {items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Exhibit>
          <Exhibit n={20}>
            <Risk />
          </Exhibit>
          <Exhibit n={21}>
            <div className="table-scroll">
              <table>
                <caption>{ui.text084}</caption>
                <thead>
                  <tr>
                    <th>{ui.text085}</th>
                    <th>{ui.text086}</th>
                    <th>{r.myPosition}</th>
                    <th>{r.friendPosition}</th>
                  </tr>
                </thead>
                <tbody>
                  {r.criteria.map(([label, weight, mine, theirs]) => (
                    <tr key={label}>
                      <th scope="row">{label}</th>
                      <td>{number(weight * 100, 0)}%</td>
                      <td>{number(mine, 2)}</td>
                      <td>{number(theirs, 2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th>{ui.text087}</th>
                    <td>100%</td>
                    <td>{number(scores[0], 2)}</td>
                    <td>{number(scores[1], 2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Exhibit>
          <div className="two-column">
            <Exhibit n={22}>
              <div className="stakeholders">
                <span className="mono">{ui.text088}</span>
                <svg viewBox="0 0 480 310" role="img" aria-label={ui.text089}>
                  <path
                    d="M45 20V260H450M45 140H450M245 20V260"
                    className="gridline"
                  />
                  {r.stakeholders.map(([name, x, y]) => (
                    <g key={name}>
                      <circle
                        cx={45 + x * 3.7}
                        cy={260 - y * 2.5}
                        r="5"
                        fill="var(--accent)"
                      />
                      <text
                        x={45 + x * 3.7 + (x > 75 ? -10 : 10)}
                        y={252 - y * 2.5}
                        textAnchor={x > 75 ? "end" : "start"}
                      >
                        {name}
                      </text>
                    </g>
                  ))}
                  <text x="440" y="300" textAnchor="end">
                    {ui.text090}
                  </text>
                </svg>
              </div>
            </Exhibit>
            <Exhibit n={23}>
              <div className="cost-benefit">
                <div>
                  <h4>{ui.text091}</h4>
                  {r.costs.map((x) => (
                    <p key={x}>{x}</p>
                  ))}
                </div>
                <div>
                  <h4>{ui.text092}</h4>
                  {r.benefits.map((x) => (
                    <p key={x}>{x}</p>
                  ))}
                </div>
              </div>
              <p className="npv">
                NPV <em>{ui.text093}</em>
              </p>
            </Exhibit>
          </div>
          <Exhibit n={24}>
            <div className="horizons">
              <span>
                {ui.text094}
                <br />
                <b>{ui.text095}</b>
              </span>
              <span>
                {ui.text096}
                <br />
                <b>{ui.text097}</b>
              </span>
              <span>
                {ui.text098}
                <br />
                <b>{ui.text099}</b>
              </span>
            </div>
          </Exhibit>
        </Chapter>
        <Chapter
          id="mechanism"
          no="07"
          title={ui.text100}
          subtitle={ui.text101}
          dark
        >
          <Exhibit n={25}>
            <div className="system-flow">
              {r.system.map((item, i) => (
                <div key={item}>
                  <span className="mono">0{i + 1}</span>
                  {item}
                  <span aria-hidden="true">→</span>
                </div>
              ))}
            </div>
          </Exhibit>
          <Exhibit n={26}>
            <Network />
          </Exhibit>
          <div className="two-column">
            <Exhibit n={27}>
              <div className="causal">
                <span>{ui.text102}</span>
                <b>↓</b>
                <span>{ui.text103}</span>
                <b>↓</b>
                <span>{ui.text104}</span>
                <b>↓</b>
                <span>{ui.text105}</span>
                <aside>
                  {ui.text106}
                  <br />
                  {ui.text107}
                </aside>
              </div>
            </Exhibit>
            <Exhibit n={28}>
              <Argument />
            </Exhibit>
          </div>
        </Chapter>
        <Chapter id="model" no="08" title={ui.text108} subtitle={ui.text109}>
          <Exhibit n={29}>
            <LiveModel />
          </Exhibit>
          <div className="three-notes">
            <Exhibit n={30} />
            <Exhibit n={31} />
            <Exhibit n={32} />
          </div>
        </Chapter>
        <Chapter id="review" no="09" title={ui.text110} subtitle={ui.text111}>
          <Exhibit n={33}>
            <div className="limitations">
              <span>n = 1</span>
              <span>{ui.text112}</span>
              <span>{ui.text113}</span>
            </div>
          </Exhibit>
          <Exhibit n={34}>
            <div className="reviewers">
              {r.reviewers.map(([name, quote]) => (
                <blockquote key={name}>
                  <span className="mono">
                    {name}
                    {ui.text114}
                  </span>
                  «{quote}»
                </blockquote>
              ))}
            </div>
          </Exhibit>
          <Exhibit n={35}>
            {r.objections.map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <span>+</span>
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </Exhibit>
          <Exhibit n={36}>
            <div className="final-score">
              <div>
                <span>{r.myPosition}</span>
                <strong>{number(scores[0], 2)}</strong>
              </div>
              <span>:</span>
              <div>
                <span>{r.friendPosition}</span>
                <strong>{number(scores[1], 2)}</strong>
              </div>
            </div>
          </Exhibit>
          <div className="two-column">
            <Exhibit n={37}>
              <p className="mono">
                {ui.text115}
                {r.seed}
              </p>
              {r.footnotes.map((text) => (
                <p className="fine" key={text}>
                  {text}
                </p>
              ))}
            </Exhibit>
            <Exhibit n={38}>
              <ol className="references">
                {r.citations.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ol>
            </Exhibit>
          </div>
        </Chapter>
        <Chapter id="verdict" no="10" title={ui.text116} subtitle={ui.text117}>
          <Exhibit n={39} />
          <Exhibit n={40} className="last-exhibit">
            <div className="verdict">
              <p>{r.friendName}</p>
              <h2>{r.finalMessage}</h2>
              <span>{ui.text118}</span>
            </div>
          </Exhibit>
          <div className="postcredits">
            <dl>
              <div>
                <dt>{ui.text119}</dt>
                <dd>{ui.text120}</dd>
              </div>
              <div>
                <dt>{ui.text121}</dt>
                <dd>{ui.text122}</dd>
              </div>
              <div>
                <dt>{ui.text123}</dt>
                <dd>{ui.text124}</dd>
              </div>
            </dl>
            <div className="post-actions">
              <button onClick={() => setNotice(ui.text125)}>
                {ui.text126}
              </button>
              <button onClick={() => setNotice(ui.text127)}>
                {ui.text128}
              </button>
            </div>
            <p role="status" className="notice">
              {notice}
            </p>
          </div>
        </Chapter>
      </main>
      <footer className="footer">
        <a href="#top">{ui.text129}</a>
        <p>{r.disclaimer}</p>
        <span className="mono">{ui.text130}</span>
      </footer>
    </>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
