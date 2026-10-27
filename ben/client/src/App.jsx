import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Clock3, Coffee, Heart, Leaf, Lock, LogOut, Mail, Minus, Plus, ShoppingBag, Sprout, Trash2, User } from 'lucide-react';
import { Link, Navigate, Outlet, useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import heroVideoSrc from './assets/vid2.mp4';
import img1 from './assets/IMG_0389.PNG';
import img2 from './assets/IMG_0390.PNG';
import img3 from './assets/IMG_0391.PNG';
import img4 from './assets/IMG_0392.PNG';
import img5 from './assets/fond.png';
import logo from './assets/logo.png';
import gingem from './assets/photo.jpg';
import hibis from './assets/hibiscus.jpg';
import goyave from './assets/goyave.jpg';
import zeste from './assets/zeste.jpg';
import basilic from './assets/basilic.jpg';

const AUTH_USERS_STORAGE_KEY = 'bendjo_test_users';

function getStoredUsers() {
  const storedUsers = window.localStorage.getItem(AUTH_USERS_STORAGE_KEY);
  if (!storedUsers) return [];

  const users = JSON.parse(storedUsers);
  if (!Array.isArray(users)) {
    throw new Error('Les comptes de test enregistrés dans ce navigateur sont invalides.');
  }
  return users;
}

function getStoredUser() {
  const userId = window.localStorage.getItem('token');
  if (!userId) return null;

  const user = getStoredUsers().find((storedUser) => storedUser.id === userId);
  return user ? { id: user.id, name: user.name, email: user.email } : null;
}

function createSalt() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(password, salt) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations: 120000, hash: 'SHA-256' },
    key,
    256,
  );
  return Array.from(new Uint8Array(bits), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

const products = [
  { id: 'hibiscus', name: 'Hibiscus', type: 'INFUSION · FLEURS', description: 'Végétal, doux et vibrant', price: 2500, image: img1, steep: '5 min', temperature: '95 °C' },
  { id: 'jardin-soir', name: 'Jardin du soir', type: 'INFUSION · SANS THÉINE', description: 'Verveine, mélisse, tilleul', price: 2500, image: img2, steep: '6 min', temperature: '95 °C' },
  { id: 'gingembre', name: 'Gingembre', type: 'INFUSION · ÉPICÉE', description: 'Gingembre, cannelle, citron', price: 2500, image: img3, steep: '5 min', temperature: '95 °C' },
  { id: 'fleur-the', name: 'Fleur de thé', type: 'INFUSION · FLEURS', description: 'Jasmin, rose et camomille', price: 2500, image: img4, steep: '4 min', temperature: '85 °C' },
  { id: 'matcha', name: 'Matcha cérémonial', type: 'THÉ VERT · JAPON', description: 'Fin, végétal et délicatement umami', price: 2500, image: img1, steep: 'Fouetter 30 s', temperature: '75 °C' },
  { id: 'sencha', name: 'Sencha du matin', type: 'THÉ VERT · JAPON', description: 'Frais et lumineux, idéal au réveil', price: 2500, image: img2, steep: '2 min', temperature: '75 °C' },
  { id: 'rooibos', name: 'Rooibos vanillé', type: 'ROOIBOS · SANS THÉINE', description: 'Rond, doux et naturellement sucré', price: 2500, image: img3, steep: '7 min', temperature:'95 °C' },
  { id: 'earl-grey', name: 'Earl Grey bergamote', type: 'THÉ NOIR · AGRUMES', description: 'Thé noir corsé et bergamote fraîche', price: 2500, image: img4, steep: '3 min', temperature: '90 °C' },
];

const flavorCategories = [
  {
    id: 'energisants',
    name: 'Les Énergisants & Stimulants',
    timing: 'Matin / Début de journée',
    description: 'Pour réveiller le corps, stimuler l’esprit et démarrer sur une note dynamique.',
    image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1000&q=85',
    blends: [
      { id: 'eveil', name: 'ÉVEIL', ingredients: 'Gingembre, citronnelle, zestes de citron', image: gingem },
      { id: 'elan', name: 'ÉLAN', ingredients: 'Moringa, basilic, menthe', image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=900&q=80' },
      { id: 'rose', name: 'Rosé', ingredients: 'Moringa, gingembre, hibiscus, zeste de citron', image: hibis },
    ],
  },
  {
    id: 'vitalisants',
    name: 'Les Vitalisants & Clarifiants',
    timing: 'En journée / Concentration',
    description: 'Pour soutenir la productivité, rafraîchir l’esprit et apporter de la légèreté.',
    image: 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1000&q=85',
    blends: [
      { id: 'clarte', name: 'CLARTÉ', ingredients: 'Citronnelle, feuilles de goyavier, zestes de citron', image: zeste },
      { id: 'eclat', name: 'ÉCLAT', ingredients: 'Hibiscus, menthe, feuilles d’oranger, zestes de citron', image: hibis },
      { id: 'epure', name: 'Épure', ingredients: 'Feuille de goyavier, citronnelle, menthe', image: goyave },
    ],
  },
  {
    id: 'harmonisants',
    name: 'Les Harmonisants & Rééquilibrants',
    timing: 'Pauses / Après-midi',
    description: 'Pour faire une pause régénérante, se recentrer ou favoriser une digestion douce.',
    image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1000&q=85',
    blends: [
      { id: 'pause', name: 'PAUSE', ingredients: 'Feuilles de goyavier, citronnelle, basilic, menthe', image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=900&q=80' },
      { id: 'souffle', name: 'SOUFFLE', ingredients: 'Hibiscus, feuilles d’oranger, menthe', image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=900&q=80' },
      { id: 'retrouver', name: 'RETROUVER', ingredients: 'Basilic, feuilles d’oranger, cannelle, menthe', image: basilic },
    ],
  },
  {
    id: 'relaxants',
    name: 'Les Relaxants & Nocturnes',
    timing: 'Soir & Nuit',
    description: 'Pour décompresser, relâcher les tensions et favoriser un sommeil réparateur.',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=85',
    blends: [
      { id: 'decompresser', name: 'DÉCOMPRESSER', ingredients: 'Citronnelle, feuilles d’oranger, cannelle, passiflore', image: 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?auto=format&fit=crop&w=900&q=80' },
      { id: 'apaise', name: 'APAISE', ingredients: 'Passiflore, feuilles d’oranger, citronnelle', image: 'https://images.unsplash.com/photo-1530968464165-7a1861cbaf9f?auto=format&fit=crop&w=900&q=80' },
      { id: 'nuit', name: 'NUIT', ingredients: 'Passiflore, feuilles d’oranger, cannelle, corossol', image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80' },
      { id: 'eclipse', name: 'Éclipse', ingredients: 'Feuille de corossol, feuille d’oranger, citronnelle', image: 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=900&q=80' },
    ],
  },
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

function PageHeader({ title = 'BENDJO', className = '' }) {
  return (
    <header className={`topbar ${className}`.trim()} aria-label={title}>
      <Link className="icon-button" to="/accueil" aria-label="Retour à l'accueil" title="Retour"><ArrowLeft size={19} /></Link>
      <div className="page-header-brand">
        <img className="page-header-logo" src={logo} alt="BENDJO" />
        <span><strong>BENDJO</strong><small>La sérénité a un goût</small></span>
      </div>
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

function FlavorCategoryCards({ categories }) {
  return categories.map((category) => (
    <Link key={category.id} className="flavor-category-card" to={`/categories/${category.id}`}>
      <img src={category.image} alt="" />
      <span className="eyebrow">{category.timing}</span>
      <strong>{category.name}</strong>
      <span>{category.description}</span>
      <span className="flavor-category-link">Voir les infusions <ArrowRight size={15} /></span>
    </Link>
  ));
}


// Quiz de bienvenue BENDJO : affiché une fois après la première connexion de chaque compte.
const QUIZ_STORAGE_KEY = 'bendjo_quiz_status';
const SIGNATURE_STORAGE_KEY = 'bendjo_signature';
const getQuizStorageKey = (userId) => `${QUIZ_STORAGE_KEY}_${userId}`;
const quizQuestions = [
  { title: 'Le Moment', question: 'À quel moment de la journée avez-vous le plus besoin de votre rituel bien-être ?', options: [
    "Au réveil, pour dynamiser mon corps et bien démarrer la journée.",
    "En cours de journée, pour garder l'esprit clair et rester concentré(e).",
    "L'après-midi, pour faire un break et me ressourcer.",
    "Le soir, pour déconnecter du stress et préparer une nuit paisible.",
  ] },
  { title: 'La Sensation Recherchée', question: "Si vous deviez écouter votre corps aujourd'hui, de quoi a-t-il le plus besoin ?", options: [
    "D'un coup de fouet tonique et vivifiant.",
    "D'un vent de fraîcheur pour réveiller mon éclat et me clarifier l'esprit.",
    "D'une respiration profonde pour me recentrer et retrouver mon équilibre.",
    "D'une bulle de douceur cocooning pour lâcher-prise.",
  ] },
  { title: 'Le Profil Gustatif', question: "Côté papilles, quelle palette d'arômes vous attire le plus ?", options: [
    'Citronnée, piquante et épicée (Gingembre, Zestes, Citronnelle).',
    "Acidulée, fruitée et colorée (Hibiscus, Zestes, Feuille de goyavier).",
    "Herbacée, fraîche et végétale (Menthe, Basilic, Feuille d'oranger).",
    'Envoûtante, douce et apaisante (Passiflore, Cannelle, Corossol).',
  ] },
];
const quizLetters = ['A', 'B', 'C', 'D'];
// Correspondance profil majoritaire → produit existant de la liste.
const quizResultProduct = { A: 'gingembre', B: 'hibiscus', C: 'fleur-the', D: 'jardin-soir' };

function computeQuizResult(answers) {
  const counts = answers.reduce((acc, letter) => ({ ...acc, [letter]: (acc[letter] || 0) + 1 }), {});
  const max = Math.max(...Object.values(counts));
  const tied = quizLetters.filter((letter) => counts[letter] === max);
  // En cas d'égalité, la dernière réponse (profil gustatif) départage.
  return tied.includes(answers[answers.length - 1]) ? answers[answers.length - 1] : tied[0];
}

function WelcomeQuiz({ onFinish }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const isResult = step >= quizQuestions.length;
  const resultLetter = isResult ? computeQuizResult(answers) : null;
  const resultProduct = resultLetter ? products.find((product) => product.id === quizResultProduct[resultLetter]) : null;

  const choose = (letter) => {
    const next = [...answers.slice(0, step), letter];
    setAnswers(next);
    setStep(step + 1);
  };

  return (
    <motion.main key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="app-shell quiz-screen">
      <header className="quiz-header">
        <div className="brand-lockup"><img src={logo} alt="BENDJO" className="brand-mark" /><span><strong>BENDJO</strong><small>La sérénité a un goût</small></span></div>
        <button className="quiz-skip" type="button" onClick={() => onFinish(null)}>Passer et accéder directement à la boutique <ArrowRight size={14} /></button>
      </header>

      {!isResult ? (
        <section className="quiz-body" aria-live="polite">
          {step === 0 && (
            <div className="quiz-intro">
              <span className="eyebrow">ONBOARDING SOMMELIER</span>
              <h1>Trouvez votre infusion signature BENDJO</h1>
              <p>Répondez à 3 questions rapides pour découvrir l'assemblage personnalisé qui répondra aux besoins de votre corps et de votre esprit.</p>
            </div>
          )}
          <div className="quiz-progress" aria-label={`Question ${step + 1} sur ${quizQuestions.length}`}>
            {quizQuestions.map((_, index) => <span key={index} className={index <= step ? 'is-active' : ''} />)}
          </div>
          <span className="quiz-step">Question {step + 1} · {quizQuestions[step].title}</span>
          <h2 className="quiz-question">{quizQuestions[step].question}</h2>
          <div className="quiz-options">
            {quizQuestions[step].options.map((label, index) => (
              <button key={label} type="button" className={`quiz-option${answers[step] === quizLetters[index] ? ' is-selected' : ''}`} onClick={() => choose(quizLetters[index])}>
                <span className="quiz-letter">{quizLetters[index]}</span><span>{label}</span>
              </button>
            ))}
          </div>
          {step > 0 && <button className="quiz-back" type="button" onClick={() => setStep(step - 1)}><ArrowLeft size={14} /> Question précédente</button>}
        </section>
      ) : (
        <section className="quiz-body quiz-result">
          <span className="eyebrow">VOTRE INFUSION SIGNATURE</span>
          <div className="quiz-result-image"><img src={resultProduct.image} alt={`Infusion ${resultProduct.name}`} /></div>
          <span className="tea-type">{resultProduct.type}</span>
          <h1>{resultProduct.name}</h1>
          <p>{resultProduct.description}</p>
          <p className="quiz-result-ritual"><Clock3 size={14} /> {resultProduct.steep} · {resultProduct.temperature}</p>
          <button className="primary-button" type="button" onClick={() => onFinish(resultProduct.id)}>Découvrir mon infusion signature <ArrowRight size={16} /></button>
          <button className="quiz-back" type="button" onClick={() => { setAnswers([]); setStep(0); }}>Recommencer le quiz</button>
        </section>
      )}
    </motion.main>
  );
}

// Le composant parent conserve l'état partagé pendant le passage d'une route à l'autre.
export function AppLayout() {
  // useNavigate sert aux transitions pilotées par la logique (temporisation, connexion, déconnexion).
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState(getStoredUser);
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

  const addBlendToCart = ({ name, ingredientIds, servings, temperature, minutes }) => {
    const ingredients = ingredientIds.map((id) => products.find((product) => product.id === id));
    const recipe = {
      name: name.trim() || 'Mon infusion personnalisée',
      ingredientIds: [...ingredientIds].sort(),
      servings,
      temperature,
      minutes,
    };
    const productId = `blend:${JSON.stringify(recipe)}`;
    const customBlend = {
      id: productId,
      name: recipe.name,
      type: 'INFUSION · CRÉATION PERSONNALISÉE',
      image: ingredients[0].image,
      price: ingredients.reduce((total, ingredient) => total + ingredient.price, 0),
      recipe: {
        ingredientNames: ingredients.map((ingredient) => ingredient.name),
        ...recipe,
      },
    };

    setCart((current) => {
      const existing = current.find((item) => item.productId === productId);
      return existing
        ? current.map((item) => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item)
        : [...current, { productId, quantity: 1, customBlend }];
    });
  };

  const addCategoryBlendToCart = (category, blend) => {
    const productId = `category:${category.id}:${blend.id}`;
    const customBlend = {
      id: productId,
      name: blend.name,
      type: category.name,
      image: blend.image,
      price: 2500,
      ingredients: blend.ingredients,
    };

    setCart((current) => {
      const existing = current.find((item) => item.productId === productId);
      return existing
        ? current.map((item) => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item)
        : [...current, { productId, quantity: 1, customBlend }];
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
    const timeout = window.setTimeout(() => navigate('/auth'), reducedMotion ? 800 : 5400);
    return () => window.clearTimeout(timeout);
  }, [location.pathname, navigate]);

  useEffect(() => {
    if (location.pathname !== '/transition') return undefined;

    const userId = location.state?.userId ?? user?.id;
    const shouldShowQuiz = userId && !window.localStorage.getItem(getQuizStorageKey(userId));
    const timeout = window.setTimeout(() => {
      if (shouldShowQuiz) {
        navigate('/questionnaire', { state: { userId } });
      } else {
        navigate('/dashboard');
      }
    }, 3500);
    return () => window.clearTimeout(timeout);
  }, [location.pathname, location.state, navigate, user?.id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const email = formData.email.trim().toLowerCase();
      const users = getStoredUsers();
      let authenticatedUser;

      if (isLogin) {
        const account = users.find((storedUser) => storedUser.email === email);
        if (!account || await hashPassword(formData.password, account.passwordSalt) !== account.passwordHash) {
          throw new Error('Adresse e-mail ou mot de passe invalide.');
        }
        authenticatedUser = { id: account.id, name: account.name, email: account.email };
      } else {
        const name = formData.name.trim();
        if (!name) throw new Error('Veuillez renseigner votre prénom.');
        if (formData.password.length < 8) throw new Error('Le mot de passe doit contenir au moins 8 caractères.');
        if (users.some((storedUser) => storedUser.email === email)) {
          throw new Error('Cette adresse e-mail est déjà utilisée sur ce navigateur.');
        }

        const passwordSalt = createSalt();
        const account = {
          id: crypto.randomUUID(),
          name,
          email,
          passwordSalt,
          passwordHash: await hashPassword(formData.password, passwordSalt),
        };
        window.localStorage.setItem(AUTH_USERS_STORAGE_KEY, JSON.stringify([...users, account]));
        authenticatedUser = { id: account.id, name: account.name, email: account.email };
      }

      window.localStorage.setItem('token', authenticatedUser.id);
      setUser(authenticatedUser);
      navigate('/transition', { state: { userId: authenticatedUser.id } });
    } catch (err) {
      setError(err.message || 'Impossible de terminer l’authentification locale.');
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
          addBlendToCart,
          addCategoryBlendToCart,
          updateCartQuantity,
          favorites,
          toggleFavorite,
        }} />
      </AnimatePresence>
    </div>
  );
}

export default function App({ screen }) {
  const { isLogin, setIsLogin, user, formData, error, setError, loading, handleChange, handleSubmit, handleLogout, cart, addToCart, addBlendToCart, addCategoryBlendToCart, updateCartQuantity, favorites, toggleFavorite } = useOutletContext();
  const { categoryId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [brewSeconds, setBrewSeconds] = useState(0);
  const [blendIds, setBlendIds] = useState(['sencha', 'hibiscus']);
  const [blendName, setBlendName] = useState('Mon infusion personnalisée');
  const [blendServings, setBlendServings] = useState(1);
  const [blendTemperature, setBlendTemperature] = useState(85);
  const [blendMinutes, setBlendMinutes] = useState(4);
  const [blendAdded, setBlendAdded] = useState(false);
  const flavorCategory = flavorCategories.find((category) => category.id === categoryId);
  const isQuizAuthorized = Boolean(user?.id ?? location.state?.userId);
  const finishQuiz = (productId) => {
    const userId = user?.id ?? location.state?.userId;
    if (userId) {
      window.localStorage.setItem(getQuizStorageKey(userId), productId ? 'completed' : 'skipped');
    }
    if (productId) {
      window.localStorage.setItem(SIGNATURE_STORAGE_KEY, productId);
    }
    navigate('/dashboard');
  };
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => {
    const product = item.customBlend || products.find((entry) => entry.id === item.productId);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);
  const blendPrice = blendIds.reduce((total, id) => {
    const product = products.find((entry) => entry.id === id);
    return total + (product?.price || 0);
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
              src={img5}
              alt=""
              aria-hidden="true"
            />
            <div className="intro-overlay" />
            <header className="intro-topbar">
              <div className="intro-brand"><img src={logo} alt="BENDJO" className="brand-mark" /><span><strong>BENDJO</strong><small>La sérénité a un goût</small></span></div>
              <Link className="intro-skip" to="/auth">Passer <ArrowRight size={14} /></Link>
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
              <h1>Tout commence<br />par une feuille.</h1><p className="banner-tagline">La sérénité a un goût</p>
              <p>Choisissez votre infusion. Laissez le temps faire le reste.</p>
              <Link className="intro-enter" to="/auth">Découvrir BENDJO <ArrowRight size={16} /></Link>
            </section>
            <div className="intro-progress" />
          </motion.main>
      )}

      {screen === 'questionnaire' && (isQuizAuthorized
        ? <WelcomeQuiz onFinish={finishQuiz} />
        : <Navigate to="/accueil" replace />)}

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
                <img src={logo} alt="BENDJO" className="brand-mark" />
                <span><strong>BENDJO</strong><small>La sérénité a un goût</small></span>
              </div>
              <Link className="icon-button" to="/auth" aria-label="Se connecter" title="Se connecter">
                <User size={19} />
              </Link>
            </header>

            <section className="hero-panel">
              <video className="hero-video" autoPlay muted loop controls>
                <source src={heroVideoSrc} type="video/mp4"/>
              </video>
              <div className="hero-shade" />
              <div className="hero-copy">
                <span className="eyebrow light-eyebrow"><Leaf size={13} /> CUEILLI AVEC SOIN</span>
                <h1>L'infusion, à<br />votre rythme.</h1><p className="banner-tagline">La sérénité a un goût</p>
                <p>Des feuilles choisies à la main. Des instants qui n'appartiennent qu'à vous.</p>
                <button className="button-light" onClick={() => document.getElementById('selection')?.scrollIntoView({ behavior: 'smooth' })}>
                  Explorer les catégories <ArrowRight size={16} />
                </button>
              </div>
              <span className="image-credit">UN MOMENT POUR SOI</span>
            </section>

            <section className="collection-section flavor-categories-section" id="selection">
              <div className="section-heading">
                <div><span className="eyebrow">CATÉGORIES DES SAVEURS</span><h2>Nos infusions par envie</h2></div>
              </div>
              <div className="flavor-category-list">
                <FlavorCategoryCards categories={[flavorCategories[0]]} />
              </div>
              <Link className="other-categories-button" to="/categories">Autres <ArrowRight size={16} /></Link>
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
              <div className="brand-lockup"><img src={logo} alt="BENDJO" className="brand-mark" /><span><strong>BENDJO</strong><small>La sérénité a un goût</small></span></div>
              <span className="topbar-spacer" />
            </header>
            <div className="auth-content">
              <span className="eyebrow">VOTRE PAUSE COMMENCE ICI</span>
              <h1>{isLogin ? 'Ravi de vous retrouver.' : 'Bienvenue chez BENDJO.'}</h1>
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
                  minLength={8}
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
              <span>{isLogin ? 'Nouveau chez BENDJO ?' : 'Vous avez déjà un compte ?'}</span>
              <button
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
              >
                {isLogin ? 'Créer un compte' : 'Se connecter'}
              </button>
            </div>
            <div className="auth-note"><Leaf size={15} /> Mode test local : les comptes sont enregistrés dans ce navigateur uniquement.</div>
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
              <div className="brand-lockup"><span className="brand-mark" aria-hidden="true">BJ</span><span><strong>BENDJO</strong><small>La sérénité a un goût</small></span></div>
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
              <div className="member-tip"><Leaf size={20} /><p><strong>Le petit conseil d'BENDJO</strong><br />Réinfusez vos feuilles une seconde fois : les arômes changent, la surprise reste.</p></div>
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

      {screen === 'category' && (
        <motion.div key="category" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="app-shell member-screen">
          <PageHeader title={flavorCategory?.name || 'CATÉGORIES'} />
          {flavorCategory ? (
            <>
              <section className="page-intro">
                <span className="eyebrow">{flavorCategory.timing}</span>
                <h1>{flavorCategory.name}</h1>
                <p>{flavorCategory.description}</p>
              </section>
              <img className="flavor-category-hero-image" src={flavorCategory.image} alt={`Illustration naturelle : ${flavorCategory.name}`} />
              <section className="collection-section flavor-blends-section">
                <div className="flavor-blend-list">
                  {flavorCategory.blends.map((blend) => (
                    <article className="flavor-blend-card" key={blend.name}>
                      <img src={blend.image} alt={`Illustration naturelle de l’infusion ${blend.name}`} />
                      <div className="flavor-blend-copy">
                        <span className="eyebrow">INFUSION</span>
                        <h2>{blend.name}</h2>
                        <p>{blend.ingredients}</p>
                        <strong className="product-price">{formatPrice(2500)}</strong>
                        <button className="add-blend-button" type="button" onClick={() => addCategoryBlendToCart(flavorCategory, blend)}>
                          <ShoppingBag size={16} /> Ajouter au panier
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <section className="page-intro">
              <span className="eyebrow">CATÉGORIE INTROUVABLE</span>
              <h1>Cette catégorie n’existe pas.</h1>
              <Link className="text-button" to="/accueil">Retour aux catégories <ArrowRight size={14} /></Link>
            </section>
          )}
          <BottomNav active="accueil" cartCount={cartCount} />
        </motion.div>
      )}

      {screen === 'categories' && (
        <motion.div key="categories" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="app-shell member-screen">
          <PageHeader title="CATÉGORIES DES SAVEURS" className="categories-page-header" />
          <section className="page-intro categories-page-intro">
            <span className="eyebrow">CATÉGORIES DES SAVEURS</span>
            <h1>Toutes nos catégories</h1>
          </section>
          <section className="collection-section flavor-categories-section categories-list-section">
            <div className="flavor-category-list">
              <FlavorCategoryCards categories={flavorCategories} />
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
                  const product = item.customBlend || products.find((entry) => entry.id === item.productId);
                  if (!product) return null;
                  return (
                    <article className="cart-item" key={item.productId}>
                      <div className="tea-image"><img src={product.image} alt="" /></div>
                      <div className="cart-item-details">
                        <span className="tea-type">{product.type}</span>
                        <h2>{product.name}</h2>
                        {product.recipe && (
                          <p className="cart-recipe-details">
                            {product.recipe.ingredientNames.join(' · ')} · {product.recipe.servings} tasse{product.recipe.servings > 1 ? 's' : ''} · {product.recipe.temperature} °C · {product.recipe.minutes} min
                          </p>
                        )}
                        {product.ingredients && <p className="cart-recipe-details">{product.ingredients}</p>}
                        <strong>{formatPrice(product.price * item.quantity)}</strong>
                        <div className="quantity-control" aria-label={`Quantité de ${product.name}`}>
                          <button type="button" onClick={() => updateCartQuantity(item.productId, item.quantity - 1)} aria-label={`Retirer une unité de ${product.name}`}><Minus size={14} /></button>
                          <span>{item.quantity}</span>
                          <button type="button" onClick={() => updateCartQuantity(item.productId, item.quantity + 1)} aria-label={`Ajouter une unité de ${product.name}`}><Plus size={14} /></button>
                        </div>
                      </div>
                      <button className="remove-button" type="button" onClick={() => updateCartQuantity(item.productId, 0)} aria-label={`Supprimer ${product.name} du panier`}><Trash2 size={17} /></button>
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
              <p>Ajoutez votre infusion personnalisée au panier. Le paiement en ligne n'est pas encore configuré.</p>
              <button type="button" className="primary-button blend-order-button" disabled={!blendIds.length} onClick={() => {
                addBlendToCart({ name: blendName, ingredientIds: blendIds, servings: blendServings, temperature: blendTemperature, minutes: blendMinutes });
                setBlendAdded(true);
              }}>
                <ShoppingBag size={16} /> Ajouter mon infusion au panier · {formatPrice(blendPrice)}
              </button>
              <span className="blend-disclaimer">Tarif calculé au total des ingrédients choisis. L'ajout au panier ne valide pas un achat.</span>
              {blendAdded && <p className="blend-added-message" role="status"><Leaf size={15} /> Votre infusion a été ajoutée au panier. <Link to="/panier">Voir mon panier <ArrowRight size={13} /></Link></p>}
            </div>
          </section>
          <BottomNav active="infusion" cartCount={cartCount} />
        </motion.div>
      )}
    </>
  );
}
