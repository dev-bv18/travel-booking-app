// src/pages/PackagesPage.js

import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PACKAGES } from '../graphql/queries';
import { useNavigate } from "react-router-dom";
import styled from 'styled-components';
import Navbar from './NavBar';
import './PackagesPage.css';
import LoadingScreen from './LoadingScreen';
import Footer from './Footer';
const UNSPLASH_ACCESS_KEY = process.env.REACT_APP_UNSPLASH_ACCESS_KEY;

const PackagesPage = () => {
  const { loading, error, data, refetch } = useQuery(GET_PACKAGES);
  const [images, setImages] = useState({});
  const [showContent, setShowContent] = useState(false);
  const [filter, setFilter] = useState({
    budget: 'all',
    date: 'all',
  });
  const [sort, setSort] = useState('availabilityDesc');// Sorting by price ascending
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); 
  const filterPackages = (packages) => {
    let filtered = [...packages];
  
    if (filter.budget !== 'all') {
      const maxBudget = parseInt(filter.budget, 10); // Convert slider value to number
  
      filtered = filtered.filter(pkg => pkg.price <= maxBudget); // Filter based on budget
    }
  
    // Implement filtering by date (as before)
    if (filter.date !== 'all') {
      const currentDate = new Date();
      filtered = filtered.filter(pkg => {
        const pkgDate = new Date(pkg.date); // Assume `pkg.date` exists
        if (filter.date === 'upcoming') {
          return pkgDate > currentDate;
        } else if (filter.date === 'past') {
          return pkgDate < currentDate;
        }
        return true;
      });
    }
    if (searchQuery) {
      filtered = filtered.filter(pkg => 
        pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        pkg.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
  
    return filtered;
  };
  
  const sortPackages = (packages) => {
    const sorted = [...packages];
    if (sort === 'priceAsc') {
      return sorted.sort((a, b) => a.price - b.price); // Sort by price (low to high)
    } else if (sort === 'priceDesc') {
      return sorted.sort((a, b) => b.price - a.price); // Sort by price (high to low)
    }
    
    if (sort === 'availabilityAsc') {
      return sorted.sort((a, b) => a.availability - b.availability);
    } else if (sort === 'availabilityDesc') {
      return sorted.sort((a, b) => b.availability - a.availability);
    }

    return sorted;
  };  
  const navigate = useNavigate();
  useEffect(() => {
    refetch();
  }, [refetch]);
  
  useEffect(() => {
    const preloadImages = async () => {
      if (data?.getPackages) {
        for (const pkg of data.getPackages) {
          if (!images[pkg.destination]) {
            await fetchUnsplashImage(pkg.destination);
          }
        }
      }
    };
    preloadImages();
  }, [data]);
  useEffect(() => {
    if (data?.getPackages) {
      let filteredData = filterPackages(data.getPackages);
      filteredData = sortPackages(filteredData);
      setFilteredPackages(filteredData);
    }
  }, [data, filter, sort, searchQuery]);
  
  useEffect(() => {
    if (!loading) {
      const timeout = setTimeout(() => {
        setShowContent(true);
      }, 1500);

      return () => clearTimeout(timeout);
    }
  }, [loading]);

  const fetchUnsplashImage = async (destination) => {
    if (images[destination]) return; 

    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${destination} tourism,&per_page=1&client_id=${UNSPLASH_ACCESS_KEY}`
      );
      const data = await response.json();

      if (data.results && data.results[0]) {
        setImages((prevImages) => ({
          ...prevImages,
          [destination]: data.results[0].urls.regular,
        }));
      }
    } catch (error) {
      console.error(`Error fetching Unsplash image for ${destination}:`, error);
    }
  };
  const handleBudgetChange = (e) => {
    setFilter((prev) => ({ ...prev, budget: e.target.value }));
  };
  const handleSortChange = (e) => {
    setSort(e.target.value);
  };
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  const handleBookNow = (pkg) => {
    navigate("/confirm-booking", { state: { packageDetails: pkg } }); 
  };
  if (loading || !showContent)
    return (
      <div>
        <Navbar />
        <LoadingScreen />
      </div>
    );
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <PageContainer>
        <Navbar />
        <div className="banner">
          <div className="left-banner">Discount🏷️</div>
          <div className="right-banner">Flat 50% off!</div>
        </div>
        <Content>
          <SubHeading>Travel with us and explore the world &#9992;</SubHeading>
          <Heading>Available Travel Packages </Heading> {/* Search Box */}
          <SearchBox
            type="text"
            placeholder="Search by package name or destination"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <div className="filters">
            <div className="budgetdiv">
            <label htmlFor="budget">Budget: </label>
  <input
    type="range"
    id="budget"
    name="budget"
    min="0"
    max="500000" // Assuming a max budget of 20000
    step="1000" // Adjust the step as per your needs
    value={filter.budget}
    onChange={handleBudgetChange}
  />
  <span>₹{filter.budget}</span>
            </div>
           {/* Display the current value of the budget */}

 <div>
 <label htmlFor="sort">Sort by: </label>
  <select name="sort" id="sort" onChange={handleSortChange}>
    <option value="priceAsc">Price (Low to High)</option>
    <option value="priceDesc">Price (High to Low)</option>
    <option value="availabilityDesc">Availability (Most to Least)</option>
   <option value="availabilityAsc">Availability (Least to Most)</option>
  </select>
 </div>
</div>

          <PackagesContainer>
            {filteredPackages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                backgroundimage={images[pkg.destination] || 'images/loader.svg'} 
                onClick={() => navigate(`/package-details/${pkg.id}`, { state: pkg })}
              >
                <CardContent>
                  <PackageTitle>{pkg.title}</PackageTitle>
                  <Destination>{pkg.destination}</Destination>
                  <Info>
                    <Detail>{pkg.duration} itinerary</Detail>
                    <Detail>
                      <strong>Available:</strong>{' '}
                      {pkg.availability < 10 ? (
                        <span className="blinking-text">{pkg.availability} (Few left)</span>
                      ) : (
                        pkg.availability
                      )}
                    </Detail>
                  </Info>
                  <Description>{pkg.description}</Description>
                  <Price>
                    <OldPrice>₹{pkg.price + pkg.price * 0.5}</OldPrice> ₹{pkg.price}
                  </Price>
                  {(pkg.availability===0)?<BookButton disabled>Unavailable</BookButton>:
                  <BookButton onClick={() => handleBookNow(pkg)}>Book Now</BookButton>}
                </CardContent>
              </PackageCard>
            ))}
          </PackagesContainer>
        </Content>
      </PageContainer>
      
      <Footer />
    </div>
  );
};

export default PackagesPage;

const SearchBox = styled.input`
  font-size: 1rem;
  padding: 10px;
  width: 100%;
  margin-bottom: 20px;
  border-radius: 5px;
  border: 1px solid #ccc;
`;
const SubHeading = styled.h2`
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 10px;
  color:teal;
`;
const PageContainer = styled.div`
  padding: 60px 20px;
  max-width: 1200px;
  margin: 0 auto;
`;
const Heading = styled.h1`
  font-size: 2rem;
  color:#212529;
  font-weight:bolder;
  margin-bottom: 30px;
  text-align: left;
`;

const PackagesContainer = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: space-between;
`;
const PackageCard = styled.div`
  background: linear-gradient(-90deg,
    rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.61),
    rgba(0, 0, 0, 0.79) 
  ), url(${(props) => props.backgroundimage});
  background-size: cover;
  background-position: center;
  border-radius: 10px;
  overflow: hidden;
  width: 49%;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const CardContent = styled.div`
  padding: 20px;
`;

const Content = styled.div`
padding-bottom:40px;
.filters{
display:flex;
padding:20px;
flex-wrap:wrap;
flex-direction:row;
justify-content:space-between;}
label{
  color:teal;
  font-weight:bold;
}
input[type="range"]{
width:100%;
}
span{
  color:teal;
  font-weight:bold;
}
 select{
 width:100%;
  padding:10px;
  border-radius:10px;
  border:1px solid teal;
  
 }
  option{
  color:teal;
  background:white;
  font-weight:bold;
}
  option:hover{
  background:teal;
  color:white;
}
`;
const PackageTitle = styled.h2`
  font-size: 1.5rem;
  color: white;
  font-weight: bold;
  margin-bottom: 10px;
`;

const Destination = styled.p`
  font-size: 1.2rem;
  color:rgb(128, 210, 222);
  margin-bottom: 20px;
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
`;

const Detail = styled.p`
  font-size: 1rem;
  color:rgb(201, 201, 201);
`;

const Description = styled.p`
  font-size: 1rem;
  color:rgb(219, 244, 242);
  margin-bottom: 20px;
`;

const Price = styled.p`
  font-size: 1.5rem;
  color:rgb(0, 202, 3);
  font-weight: bold;
  margin-bottom: 20px;
`;

const OldPrice = styled.span`
  text-decoration: line-through;
  color: #adb5bd;
`;

const BookButton = styled.button`
  background: teal;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  float: right;
  transition: background 0.3s;

  /* Disabled state */
  &:disabled {
    background: rgb(1, 76, 68);
    color:grey;
    cursor: not-allowed;
  }

  /* Hover state */
  &:hover {
    background: rgb(1, 76, 68);
    color: yellow;
  }
`;


