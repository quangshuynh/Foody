// Function to read data from JSON file
export const readJSONFile = (fileName) => {
  try {
    const data = require(`../../data/${fileName}.json`);
    return data;
  } catch (error) {
    console.error(`Error reading ${fileName}.json:`, error);
    return null;
  }
};

// Function to write data to JSON file
export const writeJSONFile = async (fileName, data) => {
  try {
    // In a real app, this would use fs.writeFile
    // For now, we'll use localStorage as a temporary solution
    localStorage.setItem(fileName, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error writing ${fileName}.json:`, error);
    return false;
  }
};
