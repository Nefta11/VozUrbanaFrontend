import { memo } from 'react'
import { Link } from 'react-router-dom'
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
} from 'lucide-react'
import PropTypes from 'prop-types'
import './Footer.css'

// Configuración de datos del footer - movida fuera del componente
const FOOTER_DATA = {
  navigation: [
    { to: "/", label: "Inicio", icon: Home },
    { to: "/reports", label: "Reportes", icon: FileText },
    { to: "/create-report", label: "Crear Reporte", icon: PlusCircle }
  ],
  categories: [
    { to: "/reports?category=saneamiento", label: "Saneamiento", icon: Droplets },
    { to: "/reports?category=infraestructura", label: "Infraestructura", icon: Building },
    { to: "/reports?category=salud_publica", label: "Salud Pública", icon: Heart },
    { to: "/reports?category=seguridad", label: "Seguridad", icon: Shield },
    { to: "/reports?category=medio_ambiente", label: "Medio Ambiente", icon: Leaf }
  ],
  account: [
    { to: "/login", label: "Iniciar Sesión", icon: LogIn },
    { to: "/register", label: "Registrarse", icon: UserPlus },
    { to: "/profile", label: "Mi Perfil", icon: User }
  ],
  contact: [
    { icon: Mail, text: "contacto@vozurbana.com", href: "mailto:contacto@vozurbana.com" },
    { icon: Phone, text: "+52 (229) 123-4567", href: "tel:+522291234567" },
    { icon: MapPin, text: "Xicotepec de Juarez, Puebla , México", href: "https://maps.google.com/?q=Veracruz,Mexico" }
  ],
  social: [
    { icon: Facebook, href: "https://facebook.com/vozurbana", label: "Facebook" },
    { icon: Twitter, href: "https://twitter.com/vozurbana", label: "Twitter" },
    { icon: Instagram, href: "https://instagram.com/vozurbana", label: "Instagram" }
  ],
  legal: [
    { to: "/privacy", label: "Privacidad" },
    { to: "/terms", label: "Términos" },
    { to: "/support", label: "Soporte" }
  ]
}

// Componente para renderizar listas de enlaces - elimina repetición
const FooterLinksList = memo(({ links, type = 'internal' }) => (
  <ul className="footer-links" role="list">
    {links.map((link, index) => (
      <li key={index} role="listitem">
        {type === 'internal' ? (
          <Link
            to={link.to}
            className="footer-link"
            aria-label={`Ir a ${link.label}`}
          >
            <link.icon size={16} aria-hidden="true" />
            <span>{link.label}</span>
          </Link>
        ) : (
          <a
            href={link.href}
            className="footer-link"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Abrir ${link.label} en nueva ventana`}
          >
            <link.icon size={16} aria-hidden="true" />
            <span>{link.label}</span>
          </a>
        )}
      </li>
    ))}
  </ul>
))

FooterLinksList.displayName = 'FooterLinksList'

FooterLinksList.propTypes = {
  links: PropTypes.arrayOf(
    PropTypes.shape({
      to: PropTypes.string,
      href: PropTypes.string,
      label: PropTypes.string.isRequired,
      icon: PropTypes.elementType.isRequired
    })
  ).isRequired,
  type: PropTypes.oneOf(['internal', 'external'])
}

// Componente principal del footer
const Footer = memo(() => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer" role="contentinfo">
      {/* Onda decorativa */}
      <div className="footer-wave" aria-hidden="true">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z" fill="currentColor"></path>
        </svg>
      </div>

      <div className="footer-container">
        {/* Sección de Marca */}
        <div className="footer-section brand-section">
          <div className="brand-content">
            <h3 className="brand-title">
              <span className="brand-icon" role="img" aria-label="Ciudad">🏙️</span>
              Voz Urbana
            </h3>
            <p className="brand-description">
              Transformando comunidades a través de la participación ciudadana.
              Sistema integral para reportes de salud pública y mejora comunitaria.
            </p>

            {/* Información de Contacto */}
            <div className="contact-info" role="list">
              {FOOTER_DATA.contact.map((item, index) => (
                <div key={index} className="contact-item" role="listitem">
                  <item.icon size={16} aria-hidden="true" />
                  {item.href ? (
                    <a
                      href={item.href}
                      className="contact-link"
                      aria-label={`Contactar por ${item.text}`}
                    >
                      {item.text}
                    </a>
                  ) : (
                    <span>{item.text}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Enlaces Sociales */}
            <div className="social-links" role="list" aria-label="Redes sociales">
              {FOOTER_DATA.social.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="social-link"
                  aria-label={`Visitar nuestro ${social.label}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  role="listitem"
                >
                  <social.icon size={20} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Navegación */}
        <div className="footer-section">
          <h4 className="section-title">Navegación</h4>
          <FooterLinksList links={FOOTER_DATA.navigation} type="internal" />
        </div>

        {/* Categorías */}
        <div className="footer-section">
          <h4 className="section-title">Categorías</h4>
          <FooterLinksList links={FOOTER_DATA.categories} type="internal" />
        </div>

        {/* Cuenta */}
        <div className="footer-section">
          <h4 className="section-title">Tu Cuenta</h4>
          <FooterLinksList links={FOOTER_DATA.account} type="internal" />
        </div>
      </div>

      {/* Sección Inferior */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <div className="copyright">
            <p>&copy; {currentYear} Voz Urbana. Todos los derechos reservados.</p>
          </div>
          <nav className="footer-bottom-links" aria-label="Enlaces legales">
            {FOOTER_DATA.legal.map((link, index) => (
              <Link
                key={index}
                to={link.to}
                aria-label={`Ver ${link.label}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
})

Footer.displayName = 'Footer'

export default Footer