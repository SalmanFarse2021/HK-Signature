import React from 'react';
import Hero from '../components/Hero.jsx';
import LatestCollection from '../components/LatestCollection.jsx';
import Bestseller from '../components/Bestseller.jsx';
import OurPolicy from '../components/OurPolicy.jsx';
import NewsletterBox from '../components/NewsletterBox.jsx';

const Home = () => {
  return (
    <div className="flex flex-col">
      <Hero />
      <LatestCollection />
      <Bestseller />
      <OurPolicy />
      <NewsletterBox />
    </div>
  );
};

export default Home;
