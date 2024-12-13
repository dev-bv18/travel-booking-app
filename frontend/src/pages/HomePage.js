import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import image from "../assests/img1.jpg";
import img2 from "../assests/herobg.jpg";
import img3 from "../assests/herobg.jpg";
import img4 from "../assests/herobg.jpg";
import banner from "../assests/banner1.webp";
import NavBar from "./NavBar";

function HomePage() {
  const [showAnimation, setShowAnimation] = useState(true); // Initially true to show animation
  const navigate = useNavigate();
  const contactSectionRef = useRef(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowAnimation(false); // Hide animation after 2 seconds
    }, 2000);

    return () => clearTimeout(timeout); // Clean up the timeout on component unmount
  }, []);

  const handleStartBooking = () => navigate("/booking");
  const handleTravelPackageBrowsing = () => navigate("/booking");
  const handleSecurity = () => navigate("/secure");
  const handleUpdates = () => navigate("/update");
  const handleScrollToContact = () =>
    contactSectionRef.current.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    if (window.location.hash === "#contact") {
      contactSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <div>
      <NavBar />
      <Container>
        {showAnimation ? (
          <AnimationContainer>
            <WelcomeText>
              Welcome to <span>Tripify!</span>
            </WelcomeText>
          </AnimationContainer>
        ) : (
          <>
            {/* Main Content */}
            <Content>
              <MainHeading>Say Hi to <span>Tripify</span>! </MainHeading>
              <Description>Book and manage your travel effortlessly✈️</Description>
              <StartButton onClick={handleStartBooking}>Start Booking</StartButton>
            </Content>


            {/* Additional Content */}
            <MainContent>
              <TextSection>
                <SmallHeading>Explore With Ease</SmallHeading>
                <ContentHeading>Your journey starts here</ContentHeading>
                <ExtendedDescription>
                Discover a world of convenience and endless possibilities with
                our travel booking platform, your ultimate partner in crafting
                memorable journeys. Whether you're planning a quick weekend
                getaway to recharge, a much-anticipated family vacation filled
                with fun and bonding, or a seamless business trip to keep you
                ahead of your schedule, we've got you covered. Our platform is
                designed to take the stress out of planning, offering you a
                hassle-free experience that allows you to focus on what truly
                matters – enjoying the journey and the destination. Let us take
                care of the details while you embrace the joy of exploring the
                world.
                </ExtendedDescription>
                <ContactLink onClick={handleScrollToContact}>Get in touch</ContactLink>
              </TextSection>
              <ImageSection>
                <StyledImage src={image} alt="Travel" />
              </ImageSection>
            </MainContent>

            {/* Packages Section */}
            <PackagesSection>
              <Heading>Explore Travel Packages</Heading>
              <SubHeading>Browse and book your perfect getaway.</SubHeading>
              <CardContainer>
                <Card onClick={handleTravelPackageBrowsing}>
                  <CardImage src={img2} alt="Travel package browsing" />
                  <CardContent>
                    <CardTitle>
                      Travel package browsing <Arrow>&gt;</Arrow>
                    </CardTitle>
                    <CardDescription>
                      Explore a variety of travel packages tailored to your needs.
                    </CardDescription>
                  </CardContent>
                </Card>
                <Card onClick={handleSecurity}>
                  <CardImage src={img3} alt="Secure travel management" />
                  <CardContent>
                    <CardTitle>
                      Secure travel management <Arrow>&gt;</Arrow>
                    </CardTitle>
                    <CardDescription>
                      Easily manage your travel bookings with top-notch security.
                    </CardDescription>
                  </CardContent>
                </Card>
                <Card onClick={handleUpdates}>
                  <CardImage src={img4} alt="Real-Time updates" />
                  <CardContent>
                    <CardTitle>
                      Real-Time updates <Arrow>&gt;</Arrow>
                    </CardTitle>
                    <CardDescription>
                      Receive instant updates on your travel plans and
                      itineraries.
                    </CardDescription>
                  </CardContent>
                </Card>
              </CardContainer>
            </PackagesSection>

            {/* Contact Section */}
            <ContactSection ref={contactSectionRef}>
            <FormWrapper>
              <ContactHeading>Get in touch</ContactHeading>
              <FormSubHeading>We’re here to assist you with your travels!</FormSubHeading>
              <Form>
                <InputLabel>
                  Name <Required>*</Required>
                  <Input type="text" placeholder="Jane Smith" required />
                </InputLabel>
                <InputLabel>
                  Email address <Required>*</Required>
                  <Input type="email" placeholder="email@website.com" required />
                </InputLabel>
                <InputLabel>
                  Phone number <Required>*</Required>
                  <Input type="tel" placeholder="555-555-5555" required />
                </InputLabel>
                <InputLabel>
                  Message
                  <Textarea rows="4" placeholder="Your message here" />
                </InputLabel>
                <CheckboxWrapper>
                  <Checkbox type="checkbox" />
                  <CheckboxLabel>
                    I allow this website to store my submission so they can respond to my inquiry.{" "}
                    <Required>*</Required>
                  </CheckboxLabel>
                </CheckboxWrapper>
                <SubmitButton type="submit">Submit</SubmitButton>
              </Form>
            </FormWrapper>
            <ContactInfo>
              <InfoHeading>Get in touch</InfoHeading>
              <InfoItem>📧 srpm523@gmail.com</InfoItem>
              <InfoItem>📍 Bhubaneswar, OD IN</InfoItem>
              <InfoHours>
                <strong>Hours</strong>
                <p>Monday: 9:00am – 10:00pm</p>
                <p>Tuesday: 9:00am – 10:00pm</p>
                <p>Wednesday: 9:00am – 10:00pm</p>
                <p>Thursday: 9:00am – 10:00pm</p>
                <p>Friday: 9:00am – 10:00pm</p>
                <p>Saturday: 9:00am – 6:00pm</p>
                <p>Sunday: 9:00am – 12:00pm</p>
              </InfoHours>
            </ContactInfo>
            </ContactSection>
          </>
        )}
      </Container>
    </div>
  );
}

export default HomePage;
// Styled Components (unchanged except for `AnimationContainer`)
const AnimationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #e0f7fa;
  padding: 40px;
  border-radius: 10px;
  text-align: center;
`;

const WelcomeText = styled.h1`
  font-size: 3rem;
  color: teal;
  margin-bottom: 20px;

  span {
    color: teal;
    font-family:'lemon';
  }
`;

// Styled Components
const NavigationCard = styled.div`
  width: 300px;
  height: 200px;
  background-size: cover;
  background-position: center;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 20px;
  color: white;
  text-shadow: 0px 2px 5px rgba(0, 0, 0, 0.7);
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.2);
  }
`;
const FormWrapper = styled.div`
  flex: 1;
  max-width: 700px;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
`;

const ContactHeading = styled.h3`
  color: teal;
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 10px;
`;

const FormSubHeading = styled.h2`
  font-size: 2rem;
  color: #212529;
  font-weight: 600;
  margin-bottom: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputLabel = styled.label`
  font-size: 1rem;
  font-weight: bold;
  color: #212529;
`;

const Input = styled.input`
  width: 90%;
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const Textarea = styled.textarea`
  width: 90%;
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
`;

const Checkbox = styled.input`
  margin-top: 4px;
`;

const CheckboxLabel = styled.span`
  font-size: 0.9rem;
  color: #212529;
`;

const SubmitButton = styled.button`
  background:teal;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background:rgb(25, 99, 109);
  }
`;

const Required = styled.span`
  color: red;
`;

const ContactInfo = styled.div`
  flex: 1;
  max-width: 400px;
  padding: 20px;
  background-color:teal;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
`;

const InfoHeading = styled.h3`
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 20px;
  color:yellow;
`;

const InfoItem = styled.p`
  font-size: 1rem;
  color:rgb(154, 227, 227);
  margin-bottom: 10px;
  line-height: 1.5;
`;
const InfoHours = styled.div`
  font-size: 1rem;
  color:rgb(255, 255, 255);
  margin-top: 20px;

  p {
    margin: 5px 0; /* Adds spacing between each line */
  }

  strong {
    font-weight: bold; /* Highlights the "Hours" label */
    display: block;
    margin-bottom: 10px;
  }
`;


const ContactSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 60px;
  gap: 200px;
  flex-wrap: wrap;
`;
const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding-top:70px;
  background:white;
`;

const Content = styled.div`
  text-align: center;
  background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.78), /* Start with semi-transparent black */
      rgba(0, 0, 0, 0.41) /* End with more opaque black */
    ),
    url(${banner});
  height: 400px;
  padding-bottom: 70px;
  background-size: cover;
  background-position: center; /* Adjust the vertical position upward */
  width: 100%;
  color: white; /* Adjust text color for readability */
`;



const MainHeading = styled.h1`
  font-size: 50px;
  color:rgb(255, 255, 255);
  font-weight: 600;
  margin-top:60px;
  margin-bottom: 40px;
  span{
  font-family:"lemon";
  color:white;}
`;

const Description = styled.p`
  font-size: 30px;
  font-weight: 600;
  color:rgba(255, 255, 255, 0.79);
  margin-bottom: 40px;
  padding-bottom:60px;
`;

const StartButton = styled.button`
  background:teal;
  color: white;
  padding: 15px 30px;
  font-size: 1.2rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background:rgb(11, 101, 113);
  }
`;

const MainContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 90%;
  max-width: 1200px;
  margin-top: 50px;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const TextSection = styled.div`
  flex: 1;
  margin-right: 50px;

  @media (max-width: 768px) {
    margin-right: 0;
    margin-bottom: 20px;
  }
`;

const SmallHeading = styled.h3`
  color: teal;
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 10px;
`;

const ContentHeading = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: #212529;
  margin-bottom: 20px;
`;

const ExtendedDescription = styled.p`
  font-size: 20px;
  color: #495057;
  line-height: 1.8;
  margin-bottom: 30px;
`;

const ContactLink = styled.a`
  font-size: 1rem;
  font-weight: bold;
  color:teal;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const ImageSection = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;

  @media (max-width: 768px) {
    margin-top: 20px;
  }
`;

const StyledImage = styled.img`
  width: 338px;
  height: 338px;
  border-radius: 8px;
`;

const PackagesSection = styled.div`
  padding: 60px 20px;
  text-align: center;
`;

const Heading = styled.h3`
  font-size: 1.2rem;
  color:teal;
  font-weight: bold;
  margin-bottom: 10px;
`;

const SubHeading = styled.h2`
  font-size: 2rem;
  color: #212529;
  font-weight: 600;
  margin-bottom: 40px;
`;

const CardContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 20px;
  flex-wrap: wrap;
`;

const Card = styled.div`
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 300px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.2);

    h3 {
      color:rgb(25, 87, 99);
    }
  }
`;

const CardImage = styled.img`
  width: 300px;
  height: 400px;
  object-fit: cover;
`;

const CardContent = styled.div`
  padding: 20px;
`;

const CardTitle = styled.h3`
  font-size: 1.1rem;
  color: #212529;
  font-weight: bold;
  margin-bottom: 10px;
  transition: color 0.3s ease;
`;

const CardDescription = styled.p`
  font-size: 0.9rem;
  color: #495057;
  line-height: 1.5;
`;

const Arrow = styled.span`
  font-size: 1.2;
`;
