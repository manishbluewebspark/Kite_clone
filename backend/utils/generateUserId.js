export const generateUserId = () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";

  let userId = "";

  // 3 random letters
  for (let i = 0; i < 3; i++) {
    userId += letters.charAt(
      Math.floor(Math.random() * letters.length)
    );
  }

  // 3 random digits
  for (let i = 0; i < 3; i++) {
    userId += numbers.charAt(
      Math.floor(Math.random() * numbers.length)
    );
  }

  return userId;
};