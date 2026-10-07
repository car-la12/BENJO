import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Clock3, Coffee, Heart, Leaf, Lock, LogOut, Mail, Minus, Plus, ShoppingBag, Sprout, Trash2, User } from 'lucide-react';
import axios from 'axios';
import { Link, Outlet, useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import heroVideoSrc from './assets/vid2.mp4';
import img1 from './assets/IMG_0389.PNG';
import img2 from './assets/IMG_0390.PNG';
import img3 from './assets/IMG_0391.PNG';
import img4 from './assets/IMG_0392.PNG';

const API_URL = 'http://localhost:5000/api/auth';

const products = [
  { id: 'hibiscus', name: 'Hibiscus', type: 'INFUSION · FLEURS', description: 'Végétal, doux et vibrant', price: 2500, image: img1, steep: '5 min', temperature: '95 °C' },
  { id: 'jardin-soir', name: 'Jardin du soir', type: 'INFUSION · SANS THÉINE', description: 'Verveine, mélisse, tilleul', price: 25000, image: img2, steep: '6 min', temperature: '95 °C' },
  { id: 'gingembre', name: 'Gingembre', type: 'INFUSION · ÉPICÉE', description: 'Gingembre, cannelle, citron', price: 25000, image: img3, steep: '5 min', temperature: '95 °C' },
  { id: 'fleur-the', name: 'Fleur de thé', type: 'INFUSION · FLEURS', description: 'Jasmin, rose et camomille', price: 2500, image: img4, steep: '4 min', temperature: '85 °C' },
  { id: 'matcha', name: 'Matcha cérémonial', type: 'THÉ VERT · JAPON', description: 'Fin, végétal et délicatement umami', price: 2500, image: img1, steep: 'Fouetter 30 s', temperature: '75 °C' },
  { id: 'sencha', name: 'Sencha du matin', type: 'THÉ VERT · JAPON', description: 'Frais et lumineux, idéal au réveil', price: 2500, image: img2, steep: '2 min', temperature: '75 °C' },
  { id: 'rooibos', name: 'Rooibos vanillé', type: 'ROOIBOS · SANS THÉINE', description: 'Rond, doux et naturellement sucré', price: 2500, image: img3, steep: '7 min', temperature: '95 °C' },
  { id: 'earl-grey', name: 'Earl Grey bergamote', type: 'THÉ NOIR · AGRUMES', description: 'Thé noir corsé et bergamote fraîche', price: 2500, image: img4, steep: '3 min', temperature: '90 °C' },
];

const formatPrice = (amount) => `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount)} FCFA`;

function BottomNav({ active, cartCount }) {
  const links = [
    { id: 'accueil', to: '/accueil', label: 'Découvrir', Icon: Sprout },
    { id: 'rituel', to: '/rituel', label: 'Mon rituel', Icon: Coffee },
    { id: 'panier', to: '/panier', label: `Panier${cartCount ? ` (${cartCount})` : ''}`, Icon: ShoppingBag },
    { id: 'infusion', to: '/infusion', label: 'Mon infusion', Icon: Clock3 },
  ];

  return (
    <nav className="bottom-nav" aria-label="Navigation principale">
      {links.map(({ id, to, label, Icon }) => (
        <Link key={id} className={`nav-item${active === id ? ' active' : ''}`} to={to} aria-current={active === id ? 'page' : undefined}>
          <Icon size={19} /><span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}

function PageHeader({ title = 'BENJO' }) {
  return (
    <header className="topbar">
      <Link className="icon-button" to="/accueil" aria-label="Retour à l'accueil" title="Retour"><ArrowLeft size={19} /></Link>
      <div className="brand-lockup"><span className="brand-mark"><Sprout size={21} /></span><span><strong>{title}</strong><small>MAISON D'INFUSION</small></span></div>
      <span className="topbar-spacer" />
    </header>
  );
}

function ProductRow({ product, favorite, onToggleFavorite, onAddToCart }) {
  return (
    <article className="tea-item">
      <div className="tea-image"><img src={product.image} alt={`Infusion ${product.name}`} /></div>
      <div className="tea-details">
        <span className="tea-type">{product.type}</span>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <strong className="product-price">{formatPrice(product.price)}</strong>
      </div>
      <div className="product-actions">
        <button className={`favorite-button${favorite ? ' is-favorite' : ''}`} type="button" onClick={() => onToggleFavorite(product.id)} aria-label={`${favorite ? 'Retirer' : 'Ajouter'} ${product.name} des favoris`} aria-pressed={favorite}>
          <Heart size={17} fill={favorite ? 'currentColor' : 'none'} />
        </button>
        <button className="add-button" type="button" onClick={() => onAddToCart(product.id)} aria-label={`Ajouter ${product.name} au panier`}><Plus size={17} /></button>
      </div>
    </article>
  );
}

// Le composant parent conserve l'état partagé pendant le passage d'une route à l'autre.
export function AppLayout() {
  // useNavigate sert aux transitions pilotées par la logique (temporisation, connexion, déconnexion).
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const addToCart = (productId) => {
    setCart((current) => {
      const existing = current.find((item) => item.productId === productId);
      return existing
        ? current.map((item) => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item)
        : [...current, { productId, quantity: 1 }];
    });
  };

  const updateCartQuantity = (productId, quantity) => {
    setCart((current) => quantity < 1
      ? current.filter((item) => item.productId !== productId)
      : current.map((item) => item.productId === productId ? { ...item, quantity } : item));
  };

  const toggleFavorite = (productId) => {
    setFavorites((current) => current.includes(productId)
      ? current.filter((favoriteId) => favoriteId !== productId)
      : [...current, productId]);
  };

  useEffect(() => {
    if (location.pathname !== '/') return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timeout = window.setTimeout(() => navigate('/accueil'), reducedMotion ? 800 : 5400);
    return () => window.clearTimeout(timeout);
  }, [location.pathname, navigate]);

  useEffect(() => {
    if (location.pathname !== '/transition') return undefined;

    const timeout = window.setTimeout(() => navigate('/dashboard'), 3500);
    return () => window.clearTimeout(timeout);
  }, [location.pathname, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/login' : '/register';
      const response = await axios.post(`${API_URL}${endpoint}`, formData);
      
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      
      navigate('/transition');
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/auth');
  };

  return (
    <div className="page-canvas">
      <AnimatePresence mode="wait">
        <Outlet key={location.pathname} context={{
          isLogin,
          setIsLogin,
          user,
          formData,
          error,
          setError,
          loading,
          handleChange,
          handleSubmit,
          handleLogout,
          cart,
          addToCart,
          updateCartQuantity,
          favorites,
          toggleFavorite,
        }} />
      </AnimatePresence>
    </div>
  );
}

export default function App({ screen }) {
  const { isLogin, setIsLogin, user, formData, error, setError, loading, handleChange, handleSubmit, handleLogout, cart, addToCart, updateCartQuantity, favorites, toggleFavorite } = useOutletContext();
  const [brewSeconds, setBrewSeconds] = useState(0);
  const [blendIds, setBlendIds] = useState(['sencha', 'hibiscus']);
  const [blendName, setBlendName] = useState('Mon infusion personnalisée');
  const [blendServings, setBlendServings] = useState(1);
  const [blendTemperature, setBlendTemperature] = useState(85);
  const [blendMinutes, setBlendMinutes] = useState(4);
  const [blendAdded, setBlendAdded] = useState(false);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => {
    const product = products.find((entry) => entry.id === item.productId);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);

  useEffect(() => {
    if (brewSeconds <= 0) return undefined;
    const timeout = window.setTimeout(() => setBrewSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearTimeout(timeout);
  }, [brewSeconds]);

  return (
    <>
      {/* La route choisit l'écran; les boutons gardent la navigation programmée pour les actions métier. */}
      {screen === 'intro' && (
          <motion.main
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.015 }}
            transition={{ duration: 0.6 }}
            className="app-shell intro-screen"
          >
            <img
              className="intro-photo"
              src="https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1100&q=85"
              alt=""
              aria-hidden="true"
            />
            <div className="intro-overlay" />
            <header className="intro-topbar">
              <div className="intro-brand"><Sprout size={21} /><span><strong>BENJO</strong><small>MAISON DE THÉ</small></span></div>
              <Link className="intro-skip" to="/accueil">Passer <ArrowRight size={14} /></Link>
            </header>

            <div className="pour-scene" aria-hidden="true">
              <div className="pour-spout" />
              <div className="pour-stream" />
              <div className="tea-cup"><div className="tea-fill" /></div>
              <div className="cup-handle" />
              <div className="cup-saucer" />
              <div className="steam steam-one" />
              <div className="steam steam-two" />
              <div className="steam steam-three" />
            </div>

            <section className="intro-copy">
              <span className="intro-eyebrow"><Leaf size={13} /> LE TEMPS DE L'INFUSION</span>
              <h1>Tout commence<br />par une feuille.</h1>
              <p>Choisissez votre infusion. Laissez le temps faire le reste.</p>
              <Link className="intro-enter" to="/accueil">Découvrir B3NJO <ArrowRight size={16} /></Link>
            </section>
            <div className="intro-progress" />
          </motion.main>
      )}

      {screen === 'accueil' && (
          <motion.div
            key="splash"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45 }}
            className="app-shell home-screen"
          >
            <header className="topbar">
              <div className="brand-lockup">
                <span className="brand-mark"><Sprout size={21} strokeWidth={1.8} /></span>
                <span><strong>BENJO</strong><small>MAISON D'INFUSION</small></span>
              </div>
              <Link className="icon-button" to="/auth" aria-label="Se connecter" title="Se connecter">
                <User size={19} />
              </Link>
            </header>

            <section className="hero-panel">
              <video className="hero-video" autoPlay muted loop controls>
                <source src={heroVideoSrc} type="video/mp4" />
              </video>
              <div className="hero-shade" />
              <div className="hero-copy">
                <span className="eyebrow light-eyebrow"><Leaf size={13} /> CUEILLI AVEC SOIN</span>
                <h1>L'infusion, à<br />votre rythme.</h1>
                <p>Des feuilles choisies à la main. Des instants qui n'appartiennent qu'à vous.</p>
                <button className="button-light" onClick={() => document.getElementById('selection')?.scrollIntoView({ behavior: 'smooth' })}>
                  Explorer les infusions <ArrowRight size={16} />
                </button>
              </div>
              <span className="image-credit">UN MOMENT POUR SOI</span>
            </section>

            <section className="collection-section" id="selection">
              <div className="section-heading">
                <div><span className="eyebrow">LA SÉLECTION BENJO</span><h2>Vos prochains favoris</h2></div>
                <Link className="text-button" to="/collection">Tout voir <ArrowRight size={14} /></Link>
              </div>
              <div className="tea-list">
                {products.slice(0, 4).map((product) => (
                  <ProductRow key={product.id} product={product} favorite={favorites.includes(product.id)} onToggleFavorite={toggleFavorite} onAddToCart={addToCart} />
                ))}
              </div>
            </section>

            <BottomNav active="accueil" cartCount={cartCount} />
          </motion.div>
      )}

      {screen === 'auth' && (
          <motion.div
            key="auth"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
            className="app-shell auth-screen"
          >
            <header className="topbar">
              <Link className="icon-button" to="/accueil" aria-label="Retour à l'accueil" title="Retour"><ArrowLeft size={19} /></Link>
              <div className="brand-lockup"><span className="brand-mark"><Sprout size={21} /></span><span><strong>AUBE</strong><small>MAISON DE THÉ</small></span></div>
              <span className="topbar-spacer" />
            </header>
            <div className="auth-content">
              <span className="eyebrow">VOTRE PAUSE COMMENCE ICI</span>
              <h1>{isLogin ? 'Ravi de vous retrouver.' : 'Bienvenue chez BENJO.'}</h1>
              <p className="auth-intro">{isLogin ? 'Connectez-vous pour retrouver vos infusions et vos rituels.' : 'Créez votre compte et composez votre premier rituel.'}</p>
            </div>

            {error && (
              <div className="form-error" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              {!isLogin && (
                <label className="field-wrap">
                  <span>Votre prénom</span>
                  <div className="input-wrap"><User size={18} />
                  <input
                    type="text"
                    name="name"
                    placeholder="Camille Martin"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  </div>
                </label>
              )}

              <label className="field-wrap">
                <span>Adresse e-mail</span>
                <div className="input-wrap"><Mail size={18} />
                <input
                  type="email"
                  name="email"
                  placeholder="vous@exemple.fr"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                </div>
              </label>

              <label className="field-wrap">
                <span>Mot de passe</span>
                <div className="input-wrap"><Lock size={18} />
                <input
                  type="password"
                  name="password"
                  placeholder="8 caractères minimum"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                </div>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="primary-button auth-submit"
              >
                {loading ? 'Connexion...' : isLogin ? 'Se connecter' : 'Créer mon compte'} <ArrowRight size={17} />
              </button>
            </form>

            <div className="auth-switch">
              <span>{isLogin ? 'Nouveau chez DENJO ?' : 'Vous avez déjà un compte ?'}</span>
              <button
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
              >
                {isLogin ? 'Créer un compte' : 'Se connecter'}
              </button>
            </div>
            <div className="auth-note"><Leaf size={15} /> Vos données restent privées, comme votre moment de calme.</div>
          </motion.div>
      )}

      {screen === 'transition' && (
          <motion.div
            key="transition"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1 }}
            className="app-shell transition-screen"
          >
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} className="transition-mark"><Leaf size={32} /></motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="transition-title"
            >
              Bienvenue, {user?.name || 'Camille'}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="transition-copy"
            >
              Votre prochain rituel se prépare...
            </motion.p>
          </motion.div>
      )}

      {screen === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="app-shell member-screen"
          >
            <header className="topbar">
              <div className="brand-lockup"><span className="brand-mark"><Sprout size={21} /></span><span><strong>AUBE</strong><small>MAISON DE THÉ</small></span></div>
              <button onClick={handleLogout} className="icon-button" aria-label="Se déconnecter" title="Se déconnecter"><LogOut size={18} /></button>
            </header>
            <section className="member-welcome">
              <span className="eyebrow">VOTRE CARNET DE DÉGUSTATION</span>
              <h1>Bonjour, {user?.name?.split(' ')[0] || 'Camille'}.</h1>
              <p>Quel goût aura votre pause aujourd'hui&nbsp;?</p>
            </section>
            <section className="ritual-card">
              <img src="https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1100&q=85" alt="Une tasse de thé préparée pour le rituel du jour" />
              <div className="ritual-overlay" />
              <div className="ritual-copy"><span className="eyebrow light-eyebrow">LE RITUEL DU JOUR</span><h2>Sencha<br />du matin</h2><p>Frais et délicat pour bien commencer.</p><div className="ritual-meta"><span><Clock3 size={15} /> 2 min</span><span><Coffee size={15} /> 75 °C</span></div></div>
            </section>
            <section className="member-bottom">
              <div className="section-heading"><div><span className="eyebrow">À REDÉCOUVRIR</span><h2>Vos thés préférés</h2></div><Link className="text-button" to="/accueil">La collection <ArrowRight size={14} /></Link></div>
              <div className="member-tip"><Leaf size={20} /><p><strong>Le petit conseil d'Aube</strong><br />Réinfusez vos feuilles une seconde fois : les arômes changent, la surprise reste.</p></div>
            </section>
            <BottomNav active="accueil" cartCount={cartCount} />
          </motion.div>
      )}

      {screen === 'collection' && (
        <motion.div key="collection" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="app-shell member-screen">
          <PageHeader title="LA COLLECTION" />
          <section className="page-intro">
            <span className="eyebrow">FEUILLES CHOISIES AVEC SOIN</span>
            <h1>La collection</h1>
            <p>Huit infusions et thés pour trouver le goût de votre prochaine pause.</p>
          </section>
          <section className="collection-section catalog-section">
            <div className="tea-list">
              {products.map((product) => (
                <ProductRow key={product.id} product={product} favorite={favorites.includes(product.id)} onToggleFavorite={toggleFavorite} onAddToCart={addToCart} />
              ))}
            </div>
          </section>
          <BottomNav active="accueil" cartCount={cartCount} />
        </motion.div>
      )}

      {screen === 'rituel' && (
        <motion.div key="rituel" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="app-shell member-screen">
          <PageHeader title="MON RITUEL" />
          <section className="page-intro">
            <span className="eyebrow">VOTRE PAUSE, À VOTRE RYTHME</span>
            <h1>Un rituel pour soi.</h1>
            <p>Quelques gestes simples, une tasse chaude et le temps de savourer.</p>
          </section>
          <section className="ritual-card ritual-page-card">
            <img src={img2} alt="Une tasse de thé pour une pause calme" />
            <div className="ritual-overlay" />
            <div className="ritual-copy">
              <span className="eyebrow light-eyebrow">LE RITUEL DU JOUR</span>
              <h2>Sencha<br />du matin</h2>
              <p>Frais et délicat pour bien commencer.</p>
              <div className="ritual-meta"><span><Clock3 size={15} /> 2 min</span><span><Coffee size={15} /> 75 °C</span></div>
            </div>
          </section>
          <section className="ritual-steps">
            <h2>Votre moment en trois gestes</h2>
            <ol>
              <li><span>01</span><p><strong>Réchauffez votre tasse</strong><br />Un peu d'eau chaude pour accueillir l'infusion.</p></li>
              <li><span>02</span><p><strong>Laissez infuser 2 minutes</strong><br />Versez une eau à 75 °C sur vos feuilles de Sencha.</p></li>
              <li><span>03</span><p><strong>Prenez le temps</strong><br />Respirez, goûtez, et profitez de votre pause.</p></li>
            </ol>
            <button className="primary-button ritual-cta" type="button" onClick={() => addToCart('sencha')}><ShoppingBag size={16} /> Ajouter le Sencha · {formatPrice(products.find((product) => product.id === 'sencha').price)}</button>
          </section>
          <BottomNav active="rituel" cartCount={cartCount} />
        </motion.div>
      )}

      {screen === 'panier' && (
        <motion.div key="panier" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="app-shell member-screen">
          <PageHeader title="MON PANIER" />
          <section className="page-intro">
            <span className="eyebrow">VOTRE SÉLECTION</span>
            <h1>Le panier</h1>
            <p>{cartCount ? `${cartCount} article${cartCount > 1 ? 's' : ''} pour vos prochains instants de calme.` : 'Votre prochaine pause se prépare ici.'}</p>
          </section>
          {cart.length === 0 ? (
            <section className="empty-cart">
              <span className="empty-cart-icon"><ShoppingBag size={25} /></span>
              <h2>Votre panier est encore vide</h2>
              <p>Parcourez la collection et ajoutez-y vos infusions préférées.</p>
              <Link className="primary-button" to="/collection">Découvrir la collection <ArrowRight size={16} /></Link>
            </section>
          ) : (
            <section className="cart-content">
              <div className="cart-items">
                {cart.map((item) => {
                  const product = products.find((entry) => entry.id === item.productId);
                  if (!product) return null;
                  return (
                    <article className="cart-item" key={item.productId}>
                      <div className="tea-image"><img src={product.image} alt="" /></div>
                      <div className="cart-item-details">
                        <span className="tea-type">{product.type}</span>
                        <h2>{product.name}</h2>
                        <strong>{formatPrice(product.price * item.quantity)}</strong>
                        <div className="quantity-control" aria-label={`Quantité de ${product.name}`}>
                          <button type="button" onClick={() => updateCartQuantity(product.id, item.quantity - 1)} aria-label={`Retirer une unité de ${product.name}`}><Minus size={14} /></button>
                          <span>{item.quantity}</span>
                          <button type="button" onClick={() => updateCartQuantity(product.id, item.quantity + 1)} aria-label={`Ajouter une unité de ${product.name}`}><Plus size={14} /></button>
                        </div>
                      </div>
                      <button className="remove-button" type="button" onClick={() => updateCartQuantity(product.id, 0)} aria-label={`Supprimer ${product.name} du panier`}><Trash2 size={17} /></button>
                    </article>
                  );
                })}
              </div>
              <div className="cart-summary">
                <div><span>Sous-total</span><strong>{formatPrice(cartTotal)}</strong></div>
                <p>Livraison calculée à l'étape suivante.</p>
                <button type="button" className="primary-button" disabled>Commander bientôt disponible</button>
              </div>
            </section>
          )}
          <BottomNav active="panier" cartCount={cartCount} />
        </motion.div>
      )}

      {screen === 'infusion' && (
        <motion.div key="infusion" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="app-shell member-screen">
          <PageHeader title="MON INFUSION" />
          <section className="page-intro">
            <span className="eyebrow">VOTRE RECETTE, VOTRE MOMENT</span>
            <h1>Composez votre infusion.</h1>
            <p>Choisissez les ingrédients et la préparation, puis découvrez votre recette. Vous pouvez la garder pour vous ou ajouter les ingrédients au panier.</p>
          </section>
          <section className="blend-builder">
            <label className="blend-name-field">
              <span>Le nom de votre recette</span>
              <input value={blendName} maxLength={40} onChange={(event) => setBlendName(event.target.value)} placeholder="Ex. Mon jardin du matin" />
            </label>
            <div className="blend-section-heading">
              <div><span className="eyebrow">ÉTAPE 1</span><h2>Choisissez vos ingrédients</h2></div>
              <span className="blend-count">{blendIds.length} choisi{blendIds.length > 1 ? 's' : ''}</span>
            </div>
            <p className="blend-hint">Sélectionnez une ou plusieurs feuilles pour créer votre mélange.</p>
            <div className="blend-choices">
              {products.map((product) => {
                const selected = blendIds.includes(product.id);
                return (
                  <label className={`blend-choice${selected ? ' selected' : ''}`} key={product.id}>
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => {
                        setBlendIds((current) => selected ? current.filter((id) => id !== product.id) : [...current, product.id]);
                        setBlendAdded(false);
                      }}
                    />
                    <span className="blend-check" aria-hidden="true">{selected ? '✓' : '+'}</span>
                    <span className="blend-choice-copy"><strong>{product.name}</strong><small>{product.description}</small></span>
                  </label>
                );
              })}
            </div>

            <div className="blend-section-heading blend-preparation-heading">
              <div><span className="eyebrow">ÉTAPE 2</span><h2>Réglez la préparation</h2></div>
            </div>
            <div className="blend-settings">
              <label>
                <span>Nombre de tasses</span>
                <select value={blendServings} onChange={(event) => setBlendServings(Number(event.target.value))}>
                  {[1, 2, 3, 4].map((servings) => <option value={servings} key={servings}>{servings} tasse{servings > 1 ? 's' : ''}</option>)}
                </select>
              </label>
              <label>
                <span>Température de l'eau</span>
                <select value={blendTemperature} onChange={(event) => setBlendTemperature(Number(event.target.value))}>
                  {[70, 75, 80, 85, 90, 95].map((temperature) => <option value={temperature} key={temperature}>{temperature} °C</option>)}
                </select>
              </label>
              <label>
                <span>Temps d'infusion</span>
                <select value={blendMinutes} onChange={(event) => setBlendMinutes(Number(event.target.value))}>
                  {[2, 3, 4, 5, 6, 7].map((minutes) => <option value={minutes} key={minutes}>{minutes} minutes</option>)}
                </select>
              </label>
            </div>

            <section className="blend-preview" aria-live="polite">
              <span className="eyebrow">L'APERÇU DE VOTRE RECETTE</span>
              {blendIds.length ? (
                <>
                  <h2>{blendName.trim() || 'Mon infusion personnalisée'}</h2>
                  <p className="blend-preview-notes">{blendIds.map((id) => products.find((product) => product.id === id)?.description).filter(Boolean).join(' · ')}</p>
                  <div className="blend-recipe-meta">
                    <span><Coffee size={15} /> {blendServings} tasse{blendServings > 1 ? 's' : ''}</span>
                    <span><Leaf size={15} /> {blendIds.length * 2 * blendServings} g de feuilles</span>
                    <span><Clock3 size={15} /> {blendTemperature} °C · {blendMinutes} min</span>
                  </div>
                  <p className="blend-recipe-instructions">
                    Pour {blendServings} tasse{blendServings > 1 ? 's' : ''}, mélangez {blendIds.map((id) => products.find((product) => product.id === id)?.name).filter(Boolean).join(', ')} à parts égales, soit environ {2 * blendServings} g de chaque ingrédient. Versez l'eau à {blendTemperature} °C et laissez infuser {blendMinutes} minutes.
                  </p>
                </>
              ) : (
                <p className="blend-empty-hint">Choisissez au moins un ingrédient pour voir votre recette.</p>
              )}
            </section>

            <section className="blend-timer">
              <span className="eyebrow">MINUTEUR D'INFUSION</span>
              <div className={`brew-clock${brewSeconds === 0 ? '' : ' is-running'}`} aria-live="polite">
                {brewSeconds > 0 ? `${String(Math.floor(brewSeconds / 60)).padStart(2, '0')}:${String(brewSeconds % 60).padStart(2, '0')}` : `${String(blendMinutes).padStart(2, '0')}:00`}
              </div>
              <button type="button" className="primary-button brew-button" disabled={!blendIds.length} onClick={() => setBrewSeconds(brewSeconds > 0 ? 0 : blendMinutes * 60)}>
                <Clock3 size={16} /> {brewSeconds > 0 ? 'Arrêter le minuteur' : "Lancer l'infusion"}
              </button>
            </section>

            <div className="blend-order">
              <p>La recette vous plaît ? Ajoutez les ingrédients choisis à votre panier, ou gardez simplement votre recette sous les yeux.</p>
              <button type="button" className="primary-button blend-order-button" disabled={!blendIds.length} onClick={() => {
                blendIds.forEach((id) => addToCart(id));
                setBlendAdded(true);
              }}>
                <ShoppingBag size={16} /> Ajouter les ingrédients au panier
              </button>
              <span className="blend-disclaimer">Les ingrédients sont ajoutés séparément au panier. Aucun achat n'est lancé ici.</span>
              {blendAdded && <p className="blend-added-message" role="status"><Leaf size={15} /> Les ingrédients de votre recette ont été ajoutés au panier.</p>}
            </div>
          </section>
          <BottomNav active="infusion" cartCount={cartCount} />
        </motion.div>
      )}
    </>
  );
}
