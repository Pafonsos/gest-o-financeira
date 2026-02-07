import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { ArrowRight, ShieldCheck, Users, Target } from 'lucide-react';
import './LandingPage.css';

const LANDING_SLIDES_KEY = 'proteq-landing-slides';
const LANDING_TABLE = 'landing_settings';
const LANDING_ROW_ID = 'default';

const defaultSlides = [
  {
    title: 'Equipe Proteq',
    subtitle: 'Gente focada em resultado',
    className: 'slide slide-a',
    image: ''
  },
  {
    title: 'Operação',
    subtitle: 'Processos organizados e confiáveis',
    className: 'slide slide-b',
    image: ''
  },
  {
    title: 'Relacionamento',
    subtitle: 'Cuidado com cada cliente',
    className: 'slide slide-c',
    image: ''
  }
];

const LandingPage = () => {
  const [slides, setSlides] = useState(defaultSlides);
  const [activeSlide, setActiveSlide] = useState(0);

  const normalizeSlides = (list) => {
    const base = Array.isArray(list) && list.length > 0 ? list : defaultSlides;
    return base.map((slide, idx) => ({
      title: slide.title || defaultSlides[idx % defaultSlides.length].title,
      subtitle: slide.subtitle || defaultSlides[idx % defaultSlides.length].subtitle,
      image: slide.image || '',
      className: slide.className || `slide slide-${['a', 'b', 'c'][idx % 3]}`
    }));
  };

  useEffect(() => {
    try {
      const fetchSlides = async () => {
        try {
          const { data: rowData } = await supabase
            .from(LANDING_TABLE)
            .select('slides')
            .eq('id', LANDING_ROW_ID)
            .single();
          if (rowData?.slides && Array.isArray(rowData.slides)) {
            setSlides(normalizeSlides(rowData.slides));
            localStorage.setItem(LANDING_SLIDES_KEY, JSON.stringify(rowData.slides));
            return;
          }
        } catch (err) {
          console.warn('Sem dados globais do carrossel:', err?.message || err);
        }

        const raw = localStorage.getItem(LANDING_SLIDES_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSlides(normalizeSlides(parsed));
            return;
          }
        }
        setSlides(normalizeSlides(defaultSlides));
      };
      fetchSlides();
    } catch {
      // ignore invalid storage
    }
    setSlides(normalizeSlides(defaultSlides));
  }, []);

  useEffect(() => {
    if (!slides.length) return;
    const id = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="brand">
          <div className="brand-mark">PR</div>
          <div className="brand-text">
            <span className="brand-name">Proteq</span>
            <span className="brand-tag">Financeiro</span>
          </div>
        </div>
        <nav className="landing-nav">
          <Link to="/auth" className="btn-ghost">Entrar</Link>
          <Link to="/auth" className="btn-primary">
            Acessar
            <ArrowRight size={16} />
          </Link>
        </nav>
      </header>

      <main className="landing-hero">
        <div className="hero-copy">
          <div className="eyebrow">Proteq • Gestão Interna</div>
          <h1>Central de operações financeiras e relacionamento com clientes.</h1>
          <p>
            Um espaço interno para consolidar dados, acompanhar indicadores
            e manter a Operação alinhada com o time.
          </p>
          <div className="hero-actions">
            <Link to="/auth" className="btn-primary">
              Entrar no sistema
              <ArrowRight size={18} />
            </Link>
            <button className="btn-outline" type="button">Conhecer a Proteq</button>
          </div>
          <div className="hero-metrics">
            <div>
              <span className="metric">Missão</span>
              <span className="label">Qualidade e previsibilidade</span>
            </div>
            <div>
              <span className="metric">Valores</span>
              <span className="label">Transparência e confiança</span>
            </div>
            <div>
              <span className="metric">Time</span>
              <span className="label">Especialistas Proteq</span>
            </div>
          </div>
        </div>

        <div className="hero-card hero-carousel">
          <div className="carousel">
            {slides.map((slide, idx) => (
              <div
                key={`slide-${idx}`}
                className={`${slide.className} ${idx === activeSlide ? 'is-active' : ''} ${slide.image ? 'has-image' : ''}`}
              >
                {slide.image && (
                  <img
                    className="slide-image"
                    src={slide.image}
                    alt={slide.title}
                  />
                )}
              </div>
            ))}
            <div className="carousel-dots">
              {slides.map((_, idx) => (
                <button
                  key={`dot-${idx}`}
                  className={`dot ${idx === activeSlide ? 'active' : ''}`}
                  onClick={() => setActiveSlide(idx)}
                  aria-label={`Ir para slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      <section className="landing-features">
        <div className="feature">
          <Target size={20} />
          <h3>Missão</h3>
          <p>Garantir previsibilidade financeira e controle total da Operação.</p>
        </div>
        <div className="feature">
          <ShieldCheck size={20} />
          <h3>Valores</h3>
          <p>Transparência, compromisso e rigor técnico em cada etapa.</p>
        </div>
        <div className="feature">
          <Users size={20} />
          <h3>Time</h3>
          <p>Equipe especializada em gestão financeira e atendimento ao cliente.</p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;



