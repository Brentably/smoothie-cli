// newfile.ts

/**
 * create a new function called ligma which returns balls and nuts with 50 percent probability
 * @returns {string} - balls and nuts with 50 percent probability
 */
function ligma(): string {
  const results = ['balls', 'nuts'];
  const randomIndex = Math.floor(Math.random() * 2);
  return results[randomIndex];
}