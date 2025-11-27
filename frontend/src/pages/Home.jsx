import React from 'react';
import Hero from '../components/Hero.jsx';
import LatestCollection from '../components/LatestCollection.jsx';
import Bestseller from '../components/Bestseller.jsx';
import OurPolicy from '../components/OurPolicy.jsx';


const Home = () => {
  return (
    <div className="flex flex-col">
      <Hero />
      <LatestCollection />
      <Bestseller />
      <OurPolicy />

    </div>
  );
};

export default Home;
