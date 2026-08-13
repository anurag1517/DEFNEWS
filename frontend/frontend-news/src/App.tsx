import { useState } from 'react';
import type { NewsCategory } from './component/navbar';
import { Navbar } from './component/navbar';
import { NewsFeed } from './component/newsfeed';

function App() {
  const [category, setCategory] = useState<NewsCategory>('trending');

  return (
    <div className="app-container">
      <Navbar currentCategory={category} onSelectCategory={setCategory} />

      <main className="app-main">
        <h1 className="feed-title">
          {category} News
        </h1>
        <NewsFeed currentCategory={category} />
      </main>
    </div>
  );
}

export default App;