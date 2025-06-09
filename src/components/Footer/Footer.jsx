import { Link } from 'react-router-dom';
import {
  Home,
  FileText,
  PlusCircle,
  Droplets,
  Building,
  Heart,
  Shield,
  Leaf,
  LogIn,
  UserPlus,
  User,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram
} from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { to: "/", label: "Inicio", icon: Home },
    { to: "/reports", label: "Reportes", icon: FileText },
    { to: "/create-report", label: "Crear Reporte", icon: PlusCircle }
  ];

  const categories = [
    { to: "/reports?category=saneamiento", label: "Saneamiento", icon: Droplets },
    { to: "/reports?category=infraestructura", label: "Infraestructura", icon: Building },
    { to: "/reports?category=salud_publica", label: "Salud Pública", icon: Heart },
    { to: "/reports?category=seguridad", label: "Seguridad", icon: Shield },
    { to: "/reports?category=medio_ambiente", label: "Medio Ambiente", icon: Leaf }
  ];

  const accountLinks = [
    { to: "/login", label: "Iniciar Sesión", icon: LogIn },
    { to: "/register", label: "Registrarse", icon: UserPlus },
    { to: "/profile", label: "Mi Perfil", icon: User }
  ];

  const contactInfo = [
    { icon: Mail, text: "contacto@vozurbana.com" },
    { icon: Phone, text: "+52 (229) 123-4567" },
    { icon: MapPin, text: "Veracruz, Ver., México" }
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" }
  ];

  return (
    <footer className="footer">
      {/* Decorative wave */}
      <div className="footer-wave">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z" fill="currentColor"></path>
        </svg>
      </div>

      <div className="footer-container">
        {/* Brand Section */}
        <div className="footer-section brand-section">
          <div className="brand-content">
            <h3 className="brand-title">
              <span className="brand-icon">🏙️</span>
              Voz Urbana
            </h3>
            <p className="brand-description">
              Transformando comunidades a través de la participación ciudadana.
              Sistema integral para reportes de salud pública y mejora comunitaria.
            </p>

            {/* Contact Info */}
            <div className="contact-info">
              {contactInfo.map((item, index) => (
                <div key={index} className="contact-item">
                  <item.icon size={16} />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div className="social-links">
              {socialLinks.map((social, index) => (
                <a key={index} href={social.href} className="social-link" aria-label={social.label}>
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="footer-section">
          <h4 className="section-title">Navegación</h4>
          <ul className="footer-links">
            {navLinks.map((link, index) => (
              <li key={index}>
                <Link to={link.to} className="footer-link">
                  <link.icon size={16} />
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories */}
        <div className="footer-section">
          <h4 className="section-title">Categorías</h4>
          <ul className="footer-links">
            {categories.map((category, index) => (
              <li key={index}>
                <Link to={category.to} className="footer-link">
                  <category.icon size={16} />
                  <span>{category.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Account */}
        <div className="footer-section">
          <h4 className="section-title">Tu Cuenta</h4>
          <ul className="footer-links">
            {accountLinks.map((link, index) => (
              <li key={index}>
                <Link to={link.to} className="footer-link">
                  <link.icon size={16} />
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <div className="copyright">
            <p>&copy; {currentYear} Voz Urbana. Todos los derechos reservados.</p>
          </div>
          <div className="footer-bottom-links">
            <Link to="/privacy">Privacidad</Link>
            <Link to="/terms">Términos</Link>
            <Link to="/support">Soporte</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;