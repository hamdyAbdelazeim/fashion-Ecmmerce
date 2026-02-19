import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import useTranslation from '../hooks/useTranslation';

const Footer = () => {
    const { t } = useTranslation();
    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link to="/" className="text-2xl font-serif font-bold tracking-tighter">
                            LUXE<span className="text-accent">.</span>
                        </Link>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            {t.footerTagline}
                        </p>
                    </div>

                    {/* Shop */}
                    <div>
                        <h4 className="font-bold mb-6 uppercase">{t.shop}</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><Link to="/shop?department=Women" className="hover:text-accent transition-colors">{t.women}</Link></li>
                            <li><Link to="/shop?department=Men" className="hover:text-accent transition-colors">{t.men}</Link></li>
                            <li><Link to="/shop?department=Kids" className="hover:text-accent transition-colors">{t.kids}</Link></li>
                            {/* Shoes isn't in translations yet, but Women/Men/Kids are common departments. Clean enough for now. */}
                            <li><Link to="/shop?category=Shoes" className="hover:text-accent transition-colors">Shoes</Link></li>
                        </ul>
                    </div>

                    {/* Help */}
                    <div>
                        <h4 className="font-bold mb-6 uppercase">{t.help}</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><a href="#" className="hover:text-accent transition-colors">{t.customerService}</a></li>
                            <li><a href="#" className="hover:text-accent transition-colors">{t.deliveryReturns}</a></li>
                            <li><a href="#" className="hover:text-accent transition-colors">{t.sizeGuide}</a></li>
                            <li><a href="#" className="hover:text-accent transition-colors">{t.contactUs}</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-bold mb-6 uppercase">{t.contact}</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li className="flex items-start space-x-3">
                                <MapPin size={18} className="mt-0.5" />
                                <span>123 Fashion Ave, NY 10001</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <Phone size={18} />
                                <span>+1 (555) 123-4567</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <Mail size={18} />
                                <span>hello@luxe.com</span>
                            </li>
                        </ul>
                        <div className="flex space-x-4 mt-6">
                            <a href="#" className="text-gray-400 hover:text-accent transition-colors"><Facebook size={20} /></a>
                            <a href="#" className="text-gray-400 hover:text-accent transition-colors"><Instagram size={20} /></a>
                            <a href="#" className="text-gray-400 hover:text-accent transition-colors"><Twitter size={20} /></a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
                    <p>{t.allRightsReserved}</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-gray-600">{t.privacyPolicy}</a>
                        <a href="#" className="hover:text-gray-600">{t.termsOfService}</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
