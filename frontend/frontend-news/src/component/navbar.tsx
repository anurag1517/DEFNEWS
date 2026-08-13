import './navbar.css';

export type NewsCategory = 'trending' | 'national' | 'international' | 'business' | 'technology' | 'Defence';

export interface NavItem {
    label: string;
    category: NewsCategory;
    path: string;
}

const navItems: NavItem[] = [
    { label: 'Trending', category: 'trending', path: '/trending' },
    { label: 'National', category: 'national', path: '/national' },
    { label: 'International', category: 'international', path: '/international' },
    { label: 'Business', category: 'business', path: '/business' },
    { label: 'Technology', category: 'technology', path: '/technology' },
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
                    <div className="navbar-logo">
                        DEF<span className="navbar-logo-accent">NEWS</span>
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
                    </div>
                </div>
            </div>
        </nav>
    );
};



