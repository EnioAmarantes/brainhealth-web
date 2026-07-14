import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="landing">
      <section class="hero">
        <div class="hero__ambient" aria-hidden="true"></div>

        <header class="topbar">
          <p class="topbar__brand">Brain Health</p>
          <a routerLink="/login/professional" class="topbar__cta">Area profissional</a>
        </header>

        <div class="hero__content">
          <p class="hero__kicker">Triagem inteligente para saude mental</p>
          <h1>
            Conecte pacientes ao profissional certo em minutos,
            com apoio de IA clinicamente orientada.
          </h1>
          <p class="hero__description">
            O Brain Health reduz friccao no primeiro contato, melhora o direcionamento
            de casos e acelera a captacao para clinicas e profissionais independentes.
          </p>

          <div class="hero__actions">
            <a class="btn btn--primary" routerLink="/questionnaire">Quero fazer minha triagem</a>
            <a class="btn btn--ghost" routerLink="/login/patient">Entrar como paciente</a>
          </div>

          <ul class="hero__proof">
            <li>
              <strong>Triagem orientada por IA</strong>
              com recomendacoes de especialidade para cada caso.
            </li>
            <li>
              <strong>Fluxo anonimo habilitado</strong>
              para reduzir abandono no primeiro acesso.
            </li>
            <li>
              <strong>Marketplace de profissionais</strong>
              com visibilidade e disponibilidade controladas.
            </li>
          </ul>
        </div>
      </section>

      <section class="value-grid" aria-label="Beneficios do produto">
        <article class="value-card">
          <h2>Para pacientes</h2>
          <p>
            Descubra rapidamente o tipo de apoio mais adequado ao seu momento e encontre
            profissionais alinhados as suas necessidades.
          </p>
        </article>

        <article class="value-card">
          <h2>Para profissionais</h2>
          <p>
            Receba leads mais qualificados, com contexto inicial estruturado para facilitar
            acolhimento e conversao em primeira consulta.
          </p>
        </article>

        <article class="value-card">
          <h2>Para clinicas</h2>
          <p>
            Centralize aquisicao e encaminhamento em um funil unico, com rastreabilidade
            de demanda e dados de validacao de mercado.
          </p>
        </article>
      </section>

      <section class="closing">
        <p>Pronto para validar demanda e acelerar aquisicao?</p>
        <a class="btn btn--primary" routerLink="/questionnaire">Comecar agora</a>
      </section>
    </main>
  `,
  styles: [
    `
      @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Outfit:wght@400;500;700&display=swap');

      :host {
        --bg: #f7f4ed;
        --ink: #13263a;
        --accent: #e85d04;
        --accent-strong: #c44900;
        --deep: #0b3954;
        --sand: #f2d8bf;
        --card: rgba(255, 255, 255, 0.88);

        display: block;
        min-height: 100%;
        background:
          radial-gradient(circle at 12% 12%, rgba(232, 93, 4, 0.18), transparent 40%),
          radial-gradient(circle at 88% 8%, rgba(11, 57, 84, 0.18), transparent 40%),
          linear-gradient(160deg, #fefbf6 0%, var(--bg) 48%, #efe9df 100%);
      }

      .landing {
        color: var(--ink);
        font-family: 'Outfit', sans-serif;
        max-width: 1200px;
        margin: 0 auto;
        padding: 1.25rem 1rem 3rem;
      }

      .hero {
        position: relative;
        overflow: hidden;
        border-radius: 24px;
        border: 1px solid rgba(19, 38, 58, 0.12);
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(242, 216, 191, 0.58));
        box-shadow: 0 16px 50px rgba(19, 38, 58, 0.12);
        padding: 1rem;
      }

      .hero__ambient {
        position: absolute;
        inset: auto -60px -80px auto;
        width: 260px;
        aspect-ratio: 1;
        background: conic-gradient(from 180deg, rgba(232, 93, 4, 0.28), rgba(11, 57, 84, 0.18), rgba(232, 93, 4, 0.28));
        border-radius: 50%;
        filter: blur(6px);
        animation: drift 8s ease-in-out infinite;
      }

      .topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 2.2rem;
      }

      .topbar__brand {
        margin: 0;
        font-family: 'Sora', sans-serif;
        font-weight: 800;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        font-size: 0.82rem;
      }

      .topbar__cta {
        color: var(--deep);
        font-weight: 700;
        text-decoration: none;
        border-bottom: 2px solid transparent;
        transition: border-color 180ms ease;
      }

      .topbar__cta:hover,
      .topbar__cta:focus-visible {
        border-color: var(--deep);
      }

      .hero__content {
        position: relative;
        z-index: 1;
        max-width: 760px;
        animation: reveal 500ms ease-out;
      }

      .hero__kicker {
        margin: 0 0 0.75rem;
        font-weight: 700;
        letter-spacing: 0.09em;
        text-transform: uppercase;
        color: var(--accent-strong);
        font-size: 0.75rem;
      }

      h1 {
        margin: 0;
        font-family: 'Sora', sans-serif;
        font-size: clamp(1.8rem, 4.2vw, 3rem);
        line-height: 1.1;
      }

      .hero__description {
        margin-top: 1rem;
        margin-bottom: 1.4rem;
        max-width: 62ch;
        font-size: 1.04rem;
        line-height: 1.6;
      }

      .hero__actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        margin-bottom: 1.4rem;
      }

      .btn {
        border-radius: 999px;
        text-decoration: none;
        font-weight: 700;
        padding: 0.8rem 1.2rem;
        border: 2px solid transparent;
        transition: transform 180ms ease, background-color 180ms ease, color 180ms ease;
      }

      .btn:hover,
      .btn:focus-visible {
        transform: translateY(-2px);
      }

      .btn--primary {
        background: var(--accent);
        color: #fff;
      }

      .btn--primary:hover,
      .btn--primary:focus-visible {
        background: var(--accent-strong);
      }

      .btn--ghost {
        color: var(--deep);
        border-color: rgba(11, 57, 84, 0.32);
        background: rgba(255, 255, 255, 0.55);
      }

      .hero__proof {
        margin: 0;
        padding-left: 1rem;
        display: grid;
        gap: 0.55rem;
      }

      .hero__proof li {
        line-height: 1.45;
      }

      .value-grid {
        margin-top: 1.4rem;
        display: grid;
        gap: 0.85rem;
      }

      .value-card {
        background: var(--card);
        border: 1px solid rgba(19, 38, 58, 0.12);
        border-radius: 16px;
        padding: 1rem;
        box-shadow: 0 8px 22px rgba(19, 38, 58, 0.08);
        opacity: 0;
        animation: stagger 460ms ease forwards;
      }

      .value-card:nth-child(2) {
        animation-delay: 120ms;
      }

      .value-card:nth-child(3) {
        animation-delay: 240ms;
      }

      .value-card h2 {
        margin: 0 0 0.45rem;
        font-family: 'Sora', sans-serif;
        font-size: 1.05rem;
      }

      .value-card p {
        margin: 0;
        line-height: 1.55;
      }

      .closing {
        margin-top: 1.4rem;
        border-radius: 18px;
        border: 1px solid rgba(19, 38, 58, 0.12);
        background: linear-gradient(105deg, rgba(11, 57, 84, 0.94), rgba(19, 38, 58, 0.92));
        color: #fff;
        padding: 1.2rem 1rem;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 0.9rem;
        align-items: center;
      }

      .closing p {
        margin: 0;
        font-family: 'Sora', sans-serif;
        font-size: 1.08rem;
      }

      .closing .btn--primary {
        background: #fff;
        color: var(--deep);
      }

      @media (min-width: 840px) {
        .landing {
          padding: 1.5rem 1.2rem 3.5rem;
        }

        .hero {
          padding: 1.4rem 1.5rem 1.6rem;
        }

        .value-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }

      @keyframes reveal {
        from {
          opacity: 0;
          transform: translateY(14px);
        }

        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes stagger {
        from {
          opacity: 0;
          transform: translateY(16px);
        }

        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes drift {
        0%,
        100% {
          transform: translate(0, 0) scale(1);
        }

        50% {
          transform: translate(-12px, -10px) scale(1.03);
        }
      }
    `
  ]
})
export class LandingPageComponent {}
