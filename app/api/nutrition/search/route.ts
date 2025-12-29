import { NextResponse } from 'next/server';

export interface FoodItem {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    unit: string; // e.g., "100g", "piece", "ml", "scoop"
}

const FOOD_DATABASE: FoodItem[] = [
    // --- INDIAN STAPLES & PROTEINS ---
    { name: "Paneer (Cottage Cheese)", calories: 265, protein: 18.3, carbs: 1.2, fat: 20.8, unit: "100g" },
    { name: "Chicken Breast (Grilled)", calories: 165, protein: 31, carbs: 0, fat: 3.6, unit: "100g" },
    { name: "Chicken Thigh (Skinless)", calories: 209, protein: 26, carbs: 0, fat: 10.9, unit: "100g" },
    { name: "Egg (Large, Whole)", calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3, unit: "piece" },
    { name: "Egg White", calories: 17, protein: 3.6, carbs: 0.2, fat: 0.1, unit: "piece" },
    { name: "Whey Protein Powder", calories: 120, protein: 25, carbs: 3, fat: 1.5, unit: "scoop" },
    { name: "Soya Chunks (Dry)", calories: 345, protein: 52, carbs: 33, fat: 0.5, unit: "100g" },
    { name: "Fish (Rohu/Katla - Raw)", calories: 97, protein: 17.3, carbs: 0, fat: 2.3, unit: "100g" },
    { name: "Mutton (Lean - Raw)", calories: 143, protein: 20, carbs: 0, fat: 6, unit: "100g" },
    { name: "Greek Yogurt (Plain)", calories: 59, protein: 10, carbs: 3.6, fat: 0.4, unit: "100g" },
    { name: "Curd / Dahi (Full Cream)", calories: 98, protein: 3, carbs: 4.7, fat: 7.5, unit: "100g" },
    { name: "Curd / Dahi (Low Fat)", calories: 60, protein: 4, carbs: 5, fat: 2, unit: "100g" },

    // --- BREADS & ROTIS ---
    { name: "Roti (Whole Wheat)", calories: 71, protein: 3, carbs: 15, fat: 0.4, unit: "piece" },
    { name: "Roti with Ghee", calories: 105, protein: 3, carbs: 15, fat: 4.5, unit: "piece" },
    { name: "Bajra Roti", calories: 110, protein: 3.5, carbs: 22, fat: 1.5, unit: "piece" },
    { name: "Jowar Roti", calories: 120, protein: 4, carbs: 24, fat: 1.2, unit: "piece" },
    { name: "Missi Roti", calories: 150, protein: 6, carbs: 25, fat: 3, unit: "piece" },
    { name: "Makki ki Roti", calories: 145, protein: 3, carbs: 28, fat: 3.5, unit: "piece" },
    { name: "Naan (Plain)", calories: 260, protein: 8, carbs: 45, fat: 5, unit: "piece" },
    { name: "Butter Naan", calories: 310, protein: 8, carbs: 45, fat: 11, unit: "piece" },
    { name: "Garlic Naan", calories: 320, protein: 9, carbs: 46, fat: 12, unit: "piece" },
    { name: "Laccha Paratha", calories: 280, protein: 5, carbs: 35, fat: 14, unit: "piece" },
    { name: "Aloo Paratha", calories: 290, protein: 6, carbs: 45, fat: 10, unit: "piece" },
    { name: "Paneer Paratha", calories: 340, protein: 12, carbs: 42, fat: 14, unit: "piece" },
    { name: "White Bread", calories: 75, protein: 2, carbs: 14, fat: 1, unit: "slice" },
    { name: "Brown Bread", calories: 70, protein: 3, carbs: 12, fat: 1, unit: "slice" },
    { name: "Multigrain Bread", calories: 85, protein: 4, carbs: 15, fat: 1.2, unit: "slice" },
    { name: "Pav (Bread Roll)", calories: 120, protein: 4, carbs: 24, fat: 1, unit: "piece" },

    // --- RICE & DAL DISHES ---
    { name: "Basmati Rice (Cooked)", calories: 130, protein: 2.7, carbs: 28, fat: 0.3, unit: "100g" },
    { name: "Brown Rice (Cooked)", calories: 111, protein: 2.6, carbs: 23, fat: 0.9, unit: "100g" },
    { name: "Dal Tadka", calories: 150, protein: 7, carbs: 18, fat: 6, unit: "100g" },
    { name: "Dal Makhani", calories: 180, protein: 6, carbs: 16, fat: 11, unit: "100g" },
    { name: "Sambhar", calories: 60, protein: 3, carbs: 9, fat: 1.5, unit: "100g" },
    { name: "Rajma Masala", calories: 140, protein: 7, carbs: 15, fat: 6, unit: "100g" },
    { name: "Chole Masala", calories: 165, protein: 8, carbs: 22, fat: 5, unit: "100g" },
    { name: "Moong Dal Khichdi", calories: 120, protein: 5, carbs: 23, fat: 1, unit: "100g" },
    { name: "Veg Biryani", calories: 150, protein: 4, carbs: 28, fat: 3.5, unit: "100g" },
    { name: "Chicken Biryani", calories: 180, protein: 12, carbs: 24, fat: 6, unit: "100g" },
    { name: "Jeera Rice", calories: 140, protein: 3, carbs: 30, fat: 1.5, unit: "100g" },
    { name: "Curd Rice", calories: 110, protein: 3, carbs: 19, fat: 3, unit: "100g" },
    { name: "Lemon Rice", calories: 155, protein: 3, carbs: 28, fat: 4, unit: "100g" },

    // --- INDIAN BREAKFAST & SNACKS ---
    { name: "Poha", calories: 180, protein: 4, carbs: 35, fat: 2.5, unit: "100g" },
    { name: "Idli", calories: 58, protein: 2, carbs: 12, fat: 0.1, unit: "piece" },
    { name: "Dosa (Plain)", calories: 120, protein: 3, carbs: 24, fat: 1.5, unit: "piece" },
    { name: "Masala Dosa", calories: 250, protein: 5, carbs: 45, fat: 8, unit: "piece" },
    { name: "Rava Upma", calories: 150, protein: 4, carbs: 28, fat: 3, unit: "100g" },
    { name: "Vada (Medu)", calories: 140, protein: 4, carbs: 12, fat: 9, unit: "piece" },
    { name: "Appam", calories: 120, protein: 2, carbs: 25, fat: 1, unit: "piece" },
    { name: "Dhokla", calories: 80, protein: 3, carbs: 12, fat: 2, unit: "piece" },
    { name: "Khandvi", calories: 45, protein: 2, carbs: 6, fat: 1.5, unit: "piece" },
    { name: "Sabudana Khichdi", calories: 220, protein: 2, carbs: 48, fat: 5, unit: "100g" },
    { name: "Paneer Tikka", calories: 180, protein: 15, carbs: 4, fat: 12, unit: "piece" },
    { name: "Samosa", calories: 210, protein: 4, carbs: 25, fat: 11, unit: "piece" },
    { name: "Onion Pakora", calories: 60, protein: 1, carbs: 6, fat: 4, unit: "piece" },
    { name: "Vada Pav", calories: 300, protein: 8, carbs: 42, fat: 12, unit: "piece" },
    { name: "Bhel Puri", calories: 185, protein: 4, carbs: 35, fat: 4, unit: "100g" },
    { name: "Pani Puri", calories: 35, protein: 0.5, carbs: 6, fat: 1, unit: "piece" },
    { name: "Pav Bhaji (Bhaji only)", calories: 150, protein: 4, carbs: 22, fat: 6, unit: "100g" },
    { name: "Aloo Tikki", calories: 130, protein: 2, carbs: 18, fat: 6, unit: "piece" },

    // --- CURRIES & VEGETABLES ---
    { name: "Palak Paneer", calories: 140, protein: 9, carbs: 6, fat: 10, unit: "100g" },
    { name: "Mix Veg Curry", calories: 95, protein: 3, carbs: 12, fat: 5, unit: "100g" },
    { name: "Aloo Gobhi", calories: 110, protein: 3, carbs: 15, fat: 5, unit: "100g" },
    { name: "Bhindi Masala", calories: 90, protein: 2.5, carbs: 11, fat: 4.5, unit: "100g" },
    { name: "Baingan Bharta", calories: 85, protein: 2, carbs: 10, fat: 5, unit: "100g" },
    { name: "Mutter Paneer", calories: 145, protein: 8, carbs: 10, fat: 9, unit: "100g" },
    { name: "Butter Chicken", calories: 240, protein: 18, carbs: 8, fat: 16, unit: "100g" },
    { name: "Chicken Curry", calories: 160, protein: 15, carbs: 5, fat: 9, unit: "100g" },
    { name: "Chicken Tikka Masala", calories: 190, protein: 16, carbs: 8, fat: 11, unit: "100g" },
    { name: "Fish Curry (Goan Style)", calories: 145, protein: 14, carbs: 4, fat: 8, unit: "100g" },
    { name: "Mutton Rogan Josh", calories: 220, protein: 17, carbs: 6, fat: 15, unit: "100g" },
    { name: "Prawn Masala", calories: 130, protein: 16, carbs: 5, fat: 5, unit: "100g" },

    // --- REGIONAL SPECIALTIES ---
    { name: "Litti Chokha (Litti only)", calories: 180, protein: 6, carbs: 35, fat: 2, unit: "piece" },
    { name: "Misal Pav (Misal only)", calories: 160, protein: 7, carbs: 20, fat: 6, unit: "100g" },
    { name: "Hyderabadi Haleem", calories: 250, protein: 18, carbs: 15, fat: 14, unit: "100g" },
    { name: "Sarson ka Saag", calories: 90, protein: 4, carbs: 10, fat: 4, unit: "100g" },
    { name: "Puttu", calories: 190, protein: 5, carbs: 40, fat: 1.5, unit: "100g" },
    { name: "Kadhai Paneer", calories: 210, protein: 11, carbs: 7, fat: 16, unit: "100g" },
    { name: "Chicken 65", calories: 230, protein: 22, carbs: 8, fat: 12, unit: "100g" },

    // --- FRUITS, NUTS & DAIRY ---
    { name: "Banana", calories: 105, protein: 1.3, carbs: 27, fat: 0.3, unit: "piece" },
    { name: "Apple", calories: 95, protein: 0.5, carbs: 25, fat: 0.3, unit: "piece" },
    { name: "Mango (Medium)", calories: 150, protein: 1.5, carbs: 36, fat: 0.6, unit: "piece" },
    { name: "Almonds", calories: 7, protein: 0.25, carbs: 0.25, fat: 0.6, unit: "piece" },
    { name: "Walnuts", calories: 26, protein: 0.6, carbs: 0.5, fat: 2.5, unit: "piece" },
    { name: "Cashews", calories: 9, protein: 0.3, carbs: 0.5, fat: 0.7, unit: "piece" },
    { name: "Peanut Butter", calories: 95, protein: 4, carbs: 3, fat: 8, unit: "tbsp" },
    { name: "Milk (Full Cream)", calories: 65, protein: 3.3, carbs: 4.8, fat: 3.7, unit: "ml" },
    { name: "Milk (Skimmed)", calories: 35, protein: 3.4, carbs: 5, fat: 0.1, unit: "ml" },
    { name: "Ghee", calories: 110, protein: 0, carbs: 0, fat: 12, unit: "tbsp" },
    { name: "Honey", calories: 60, protein: 0, carbs: 17, fat: 0, unit: "tbsp" },

    // --- DESSERTS ---
    { name: "Gulab Jamun", calories: 150, protein: 2, carbs: 25, fat: 5, unit: "piece" },
    { name: "Rasgulla", calories: 120, protein: 3, carbs: 25, fat: 1.5, unit: "piece" },
    { name: "Jalebi", calories: 50, protein: 0.2, carbs: 9, fat: 1.5, unit: "piece" },
    { name: "Kaju Katli", calories: 55, protein: 1, carbs: 7, fat: 3, unit: "piece" },
    { name: "Ladoo (Besan)", calories: 180, protein: 4, carbs: 25, fat: 8, unit: "piece" },
    { name: "Gajar Halwa", calories: 170, protein: 3, carbs: 22, fat: 8, unit: "100g" },
    { name: "Rasmalai", calories: 180, protein: 5, carbs: 22, fat: 8, unit: "piece" },
];

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase();

    if (!query) {
        return NextResponse.json([]);
    }

    const matches = FOOD_DATABASE.filter(food =>
        food.name.toLowerCase().includes(query)
    ).slice(0, 15);

    return NextResponse.json(matches);
}
