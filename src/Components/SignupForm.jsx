import React from "react";

const SignupForm = () => {
  return (
    <form className="form">
      <input type="text" placeholder="Name" required />
      <input type="email" placeholder="Email" required />
      <input type="number" placeholder="Phone number" />
      <input type="password" placeholder="Password" required />

      <button type="submit">Sign Up</button>
    </form>
  );
};

export default SignupForm;