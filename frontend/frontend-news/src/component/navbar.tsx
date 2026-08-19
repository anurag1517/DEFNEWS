import './navbar.css';
import { VigilLogo } from './VigilLogo';

export type NewsCategory = 'trending' | 'national' | 'international' | 'business' | 'technology' | 'Defence' | 'verify';

export interface NavItem {
    label: string;
    category: NewsCategory;
    path: string;
}

const navItems: NavItem[] = [
    { label: 'Trending', category: 'trending', path: '/trending' },
    { label: 'National', category: 'national', path: '/national' },
    { label: 'International', category: 'international', path: '/international' },
    // { label: 'Business', category: 'business', path: '/business' },
    // { label: 'Technology', category: 'technology', path: '/technology' },
    { label: 'Defence', category: 'Defence', path: '/Defence' },
];

export const Navbar = ({ 
    currentCategory, 
    onSelectCategory 
}: { 
    currentCategory: NewsCategory; 
    onSelectCategory: (category: NewsCategory) => void; 
}) => {
    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-inner">
                    <div className="navbar-logo" onClick={() => onSelectCategory('trending')}>
                        <VigilLogo size={36} showText={true} animated={true} />
                    </div>

                    <div className="navbar-menu">
                        {navItems.map((item) => {
                            const isActive = currentCategory === item.category;
                            return (
                                <button
                                    key={item.category}
                                    onClick={() => onSelectCategory(item.category)}
                                    className={`navbar-button ${isActive ? 'is-active' : ''}`}
                                >
                                    {item.label}
                                </button>
                            );
                        })}

                        {/* Dedicated Verify CTA — visually distinct from category pills */}
                        <button
                            onClick={() => onSelectCategory('verify')}
                            className={`navbar-verify-btn ${currentCategory === 'verify' ? 'is-active' : ''}`}
                            title="Scan any link, image, or cutout for credibility"
                        >
                            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            Verify
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};




