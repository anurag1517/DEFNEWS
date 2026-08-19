import { useState } from 'react';
import type { NewsCategory } from './component/navbar';
import { Navbar } from './component/navbar';
import { NewsFeed } from './component/newsfeed';
import { VerifyPage } from './component/VerifyPage';

function App() {
  const [category, setCategory] = useState<NewsCategory>('trending');
  const isVerifyView = category === 'verify';

  return (
    <div className="app-container">
      <Navbar currentCategory={category} onSelectCategory={setCategory} />

      <main className="app-main">
        {isVerifyView ? (
          /* ── Dedicated Verify / Credibility Scanner Page ── */
          <VerifyPage />
        ) : (
          /* ── Standard News Feed View ── */
          <>
            <header className="feed-header-section">
              <div className="feed-header-left">
                <div className="feed-status-badge">
                  <span className="pulse-dot"></span>
                  <span>LIVE VERACITY RADAR ACTIVE</span>
                </div>
                <h1 className="feed-title">
                  {category} <span className="feed-title-highlight">Intelligence</span>
                </h1>
                <p className="feed-subtitle">
                  Continuous multi-source fact-checking across DD News, PIB, WION, Firstpost, The Hindu, NDTV &amp; verified outlets.
                </p>
              </div>
            </header>

            <NewsFeed currentCategory={category} />
          </>
        )}
      </main>
    </div>
  );
}

export default App;

