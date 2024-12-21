import React, { useState,useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_USERS_WITH_BOOKING_COUNTS,GET_PACKAGES } from '../graphql/queries';
import styled from 'styled-components';
import NavBar from './NavBar';
import Footer from './Footer';
import AddPackageForm from './AddPackageForm';
import EditPackageList from './EditPackageList';

const AdminDashboard = () => {
  const { data: userData, loading: userLoading } = useQuery(GET_USERS_WITH_BOOKING_COUNTS);
  const { data: packageData, loading: packageLoading } = useQuery(GET_PACKAGES);
 useEffect(() => {
    window.scrollTo(0, 0); // Scrolls to the top when the component is mounted
  }, []);
  const [activeForm, setActiveForm] = useState(null); // Track which form is active

  const totalPackages = packageData?.getPackages.length || 0;

  const toggleForm = (formType) => {
    if (activeForm === formType) {
      setActiveForm(null); // Close the form if already open
    } else {
      setActiveForm(formType); // Open the selected form
    }
  };
  const navigateToBookingHistory = (userId,username) => {
    localStorage.setItem('selected-username', username);
    window.location.href = `/booking-history/${userId}`;
  };

  return (
    <div>
      <NavBar />
      <DashboardContainer>
        <Heading>Admin Dashboard &#9992;</Heading>
        <CardsContainer>
          {/* Users Card */}
          <Card>
            <CardTitle>Total Users</CardTitle>
            {userLoading ? (
              <CardValue>Loading...</CardValue>
            ) : (
              <CardValue>{userData?.getUsersWithBookingCounts.length}</CardValue>
            )}
          </Card>

          <Card onClick={() => toggleForm('add')}>
            <CardTitle>Add Package</CardTitle>
            <CardValue>+</CardValue>
          </Card>

          <Card onClick={() => toggleForm('edit')}>
            <CardTitle>Packages</CardTitle>
            {packageLoading ? (
              <CardValue>Loading...</CardValue>
            ) : (
              <CardValue>{totalPackages}</CardValue>
            )}
          </Card>
        </CardsContainer>
        <UserListContainer>
          <UserHeading>Users and Booking Counts</UserHeading>
          {userData?.getUsersWithBookingCounts.map((user) => (
            <UserCard key={user.id} onClick={() => navigateToBookingHistory(user.id,user.username)}>
              <UserTitle>{user.username}</UserTitle>
              <UserEmail>{user.email}</UserEmail>
              <UserBookings>{user.bookingCount} bookings</UserBookings>
            </UserCard>
          ))}
        </UserListContainer>
        {/* Conditionally Render Forms */}
        {activeForm === 'add' && (
          <FormContainer>
            <AddPackageForm onClose={() => setActiveForm(null)} />
          </FormContainer>
        )}

        {activeForm === 'edit' && (
          <FormContainer>
            <EditPackageList onClose={() => setActiveForm(null)} />
          </FormContainer>
        )}
      </DashboardContainer>
      <Footer />
    </div>
  );
};

export default AdminDashboard;

// Styled Components

const UserListContainer = styled.div`
  margin-top: 40px;
`;

const UserHeading = styled.h2`
  font-size: 2rem;
  color: teal;
  margin-bottom: 20px;
`;

const UserCard = styled.div`
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  margin-bottom: 20px;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.3);
  }
`;

const UserTitle = styled.h3`
  font-size: 1.5rem;
  color: teal;
`;

const UserEmail = styled.p`
  font-size: 1rem;
  color: #555;
  padding:20px;
`;

const UserBookings = styled.p`
  font-size: 1.2rem;
  color: rgb(0, 187, 31);
  padding:20px;
`;
const DashboardContainer = styled.div`
  padding: 40px;
  padding-top: 100px;
  background-color: #f4f4f9;
  min-height: 100vh;
`;

const Heading = styled.h1`
  text-align: center;
  font-size: 2.5rem;
  color: teal;
  margin-bottom: 40px;
`;

const CardsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
`;

const Card = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  width: 300px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.3);
  }
`;

const CardTitle = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 20px;
`;

const CardValue = styled.p`
  font-size: 2.5rem;
  font-weight: bold;
  color: teal;
`;

const FormContainer = styled.div`
  margin-top: 30px;
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
`;
