
export const tagCategories = {
  cuisine: {
    name: "Cuisine",
    tags: [
      "American", "Italian", "Mexican", "Chinese", "Japanese", "Indian", "Thai",
      "Vietnamese", "Korean", "Mediterranean", "French", "Spanish", "German",
      "Greek", "Middle Eastern", "African", "Caribbean", "Latin American",
      "Seafood", "Steakhouse", "Sushi", "Pizza", "Burgers", "Sandwiches",
      "Vegetarian", "Vegan", "Gluten-Free", "Other"
    ],
  },
  meal: {
    name: "Meal",
    tags: ["Breakfast", "Brunch", "Lunch", "Dinner", "Dessert", "Coffee", "Drinks"],
  },
  ambiance: {
    name: "Ambiance",
    tags: [
      "Casual", "Formal", "Romantic", "Cozy", "Lively", "Quiet", "Family-Friendly",
      "Trendy", "Upscale", "Divey", "Outdoor Seating", "Scenic View", "Historic"
    ],
  },
  priceRange: {
    name: "Price Range",
    tags: ["$", "$$", "$$$", "$$$$"],
  },
  amenities: {
    name: "Amenities",
    tags: [
      "Wifi", "Parking Available", "Reservations", "Takeout", "Delivery",
      "Wheelchair Accessible", "Pet Friendly", "BYOB", "Full Bar", "Happy Hour"
    ],
  },
  occasion: {
    name: "Occasion",
    tags: ["Date Night", "Business Meeting", "Birthday", "Anniversary", "Group Gathering", "Solo Dining"],
  },
  serviceType: {
    name: "Service Type",
    tags: ["Table Service", "Counter Service", "Buffet", "Food Truck", "Fast Food"],
  },
  establishmentType: {
    name: "Establishment Type",
    tags: ["Restaurant", "Cafe", "Bar", "Pub", "Bakery", "Diner", "Bistro"],
  },
};

// Function to get category keys in a specific order if needed
export const getCategoryOrder = () => Object.keys(tagCategories);
