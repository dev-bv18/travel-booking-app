import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Lemon&display=swap');

  body {
    font-family: 'Lemon', cursive; /* Apply the Lemon font globally */
    margin: 0;
    padding: 0;
    background: #f8f9fa; /* Optional */
  }
`;

export default GlobalStyle;
