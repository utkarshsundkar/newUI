import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Animated, StatusBar, Modal, TextInput, Alert, SafeAreaView } from "react-native";
import { Calendar, DateData } from 'react-native-calendars';

// Enhanced color palette for dark theme
const colors = {
  primary: "#F47551",
  primaryLight: "rgba(244, 117, 81, 0.15)", // More transparent for light gold theme
  background: "#121212",
  text: "#FFFFFF",
  textLight: "#9E9E93",
  cardBg: "#1E1E1E",
  progressBg: "#2C2C2C",
  carbs: "#FF4B55",
  protein: "#F47551",
  fat: "#A45EE5",
  border: "#2C2C2C",
  accent: "#F47551",
  calendarSelected: "#F47551",
  dotIndicator: "#F47551",
  cardShadow: "rgba(0, 0, 0, 0.3)",
  mealItemBg: "#1E1E1E",
  navigationBg: "#1E1E1E"
};

interface MealData {
  id: string;
  name: string;
  calories: number;
  macros?: {
    carbs: number;
    protein: number;
    fat: number;
  };
  portions?: string;
  isPlanned: boolean;
  icon: string;
  isExpanded?: boolean;
  items: Array<{
    id: string;
    name: string;
    calories: number;
    macros: {
      carbs: number;
      protein: number;
      fat: number;
    };
    portions: string;
  }>;
}

const getCurrentWeekDates = () => {
  const today = new Date();
  const currentDate = today.getDate();
  
  // Calculate dates to show 3 days before and 3 days after current date
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(today);
    day.setDate(currentDate - 3 + index);
    return day.getDate();
  });
};

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const CURRENT_WEEK = getCurrentWeekDates();

const DEFAULT_DAILY_CALORIES = 2500;
const DEFAULT_DAILY_MACROS = {
  carbs: { target: 300 },
  protein: { target: 150 },
  fat: { target: 80 }
};

const FOOD_LIST = {
  breakfast: [
    {
      id: 'b1',
      name: 'Classic Breakfast',
      items: [
        { name: 'Scrambled Eggs', calories: 140, portion: '2 eggs' },
        { name: 'Whole Wheat Toast', calories: 70, portion: '1 slice' },
        { name: 'Avocado', calories: 80, portion: '1/2 fruit' }
      ],
      totalCalories: 290,
      image: '🍳'
    },
    {
      id: 'b2',
      name: 'Healthy Bowl',
      items: [
        { name: 'Greek Yogurt', calories: 100, portion: '1 cup' },
        { name: 'Granola', calories: 120, portion: '1/4 cup' },
        { name: 'Mixed Berries', calories: 50, portion: '1/2 cup' }
      ],
      totalCalories: 270,
      image: '🥣'
    },
    {
      id: 'b3',
      name: 'Quick Start',
      items: [
        { name: 'Banana', calories: 105, portion: '1 medium' },
        { name: 'Peanut Butter', calories: 95, portion: '1 tbsp' },
        { name: 'Honey', calories: 60, portion: '1 tbsp' }
      ],
      totalCalories: 260,
      image: '🍌'
    }
  ],
  lunch: [
    {
      id: 'l1',
      name: 'Grilled Chicken Salad',
      items: [
        { name: 'Grilled Chicken', calories: 165, portion: '100g' },
        { name: 'Mixed Greens', calories: 10, portion: '2 cups' },
        { name: 'Olive Oil Dressing', calories: 120, portion: '1 tbsp' }
      ],
      totalCalories: 295,
      image: '🥗'
    },
    {
      id: 'l2',
      name: 'Veggie Wrap',
      items: [
        { name: 'Whole Wheat Tortilla', calories: 120, portion: '1 piece' },
        { name: 'Hummus', calories: 70, portion: '2 tbsp' },
        { name: 'Mixed Vegetables', calories: 30, portion: '1 cup' }
      ],
      totalCalories: 220,
      image: '🌯'
    },
    {
      id: 'l3',
      name: 'Protein Bowl',
      items: [
        { name: 'Quinoa', calories: 120, portion: '1/2 cup' },
        { name: 'Black Beans', calories: 110, portion: '1/2 cup' },
        { name: 'Sweet Potato', calories: 90, portion: '1/2 cup' }
      ],
      totalCalories: 320,
      image: '🥘'
    }
  ],
  dinner: [
    {
      id: 'd1',
      name: 'Salmon Dinner',
      items: [
        { name: 'Grilled Salmon', calories: 200, portion: '150g' },
        { name: 'Brown Rice', calories: 110, portion: '1/2 cup' },
        { name: 'Steamed Broccoli', calories: 30, portion: '1 cup' }
      ],
      totalCalories: 340,
      image: '🐟'
    },
    {
      id: 'd2',
      name: 'Vegetarian Pasta',
      items: [
        { name: 'Whole Wheat Pasta', calories: 180, portion: '1 cup' },
        { name: 'Tomato Sauce', calories: 70, portion: '1/2 cup' },
        { name: 'Mixed Vegetables', calories: 50, portion: '1 cup' }
      ],
      totalCalories: 300,
      image: '🍝'
    },
    {
      id: 'd3',
      name: 'Stir Fry',
      items: [
        { name: 'Tofu', calories: 140, portion: '150g' },
        { name: 'Mixed Vegetables', calories: 60, portion: '1.5 cups' },
        { name: 'Brown Rice', calories: 110, portion: '1/2 cup' }
      ],
      totalCalories: 310,
      image: '🥢'
    }
  ]
};

const DEFAULT_WEEKLY_MEALS = {
  1: [ // Monday
    {
      id: '1',
      name: "Breakfast",
      calories: 420,
      icon: "wb-sunny",
      isPlanned: true,
      items: [
        {
          id: 'mon-breakfast-1',
          name: "Protein Oatmeal Bowl",
          calories: 320,
          portions: "1 bowl (300g)",
          macros: { carbs: 45, protein: 20, fat: 12 }
        },
        {
          id: 'mon-breakfast-2',
          name: "Green Tea",
          calories: 0,
          portions: "1 cup",
          macros: { carbs: 0, protein: 0, fat: 0 }
        },
        {
          id: 'mon-breakfast-3',
          name: "Mixed Berries",
          calories: 100,
          portions: "1 cup",
          macros: { carbs: 25, protein: 1, fat: 0 }
        }
      ],
      macros: { carbs: 70, protein: 21, fat: 12 }
    },
    {
      id: '2',
      name: "Lunch",
      calories: 550,
      icon: "restaurant",
      isPlanned: true,
      items: [
        {
          id: 'mon-lunch-1',
          name: "Grilled Chicken Salad",
          calories: 450,
          portions: "1 bowl (400g)",
          macros: { carbs: 35, protein: 35, fat: 20 }
        },
        {
          id: 'mon-lunch-2',
          name: "Olive Oil Dressing",
          calories: 100,
          portions: "2 tbsp",
          macros: { carbs: 0, protein: 0, fat: 14 }
        }
      ],
      macros: { carbs: 35, protein: 35, fat: 34 }
    },
    {
      id: '3',
      name: "Dinner",
      calories: 580,
      icon: "dinner-dining",
      isPlanned: true,
      items: [
        {
          id: 'mon-dinner-1',
          name: "Salmon with Quinoa",
          calories: 480,
          portions: "1 plate (400g)",
          macros: { carbs: 45, protein: 35, fat: 22 }
        },
        {
          id: 'mon-dinner-2',
          name: "Steamed Vegetables",
          calories: 100,
          portions: "1 cup",
          macros: { carbs: 20, protein: 5, fat: 0 }
        }
      ],
      macros: { carbs: 65, protein: 40, fat: 22 }
    }
  ],
  2: [ // Tuesday
    {
      id: '1',
      name: "Breakfast",
      calories: 380,
      icon: "wb-sunny",
      isPlanned: true,
      items: [
        {
          id: 'tue-breakfast-1',
          name: "Avocado Toast",
          calories: 280,
          portions: "2 slices",
          macros: { carbs: 35, protein: 12, fat: 14 }
        },
        {
          id: 'tue-breakfast-2',
          name: "Greek Yogurt",
          calories: 100,
          portions: "1 cup",
          macros: { carbs: 8, protein: 17, fat: 0 }
        }
      ],
      macros: { carbs: 43, protein: 29, fat: 14 }
    },
    {
      id: '2',
      name: "Lunch",
      calories: 520,
      icon: "restaurant",
      isPlanned: true,
      items: [
        {
          id: 'tue-lunch-1',
          name: "Tuna Wrap",
          calories: 420,
          portions: "1 wrap",
          macros: { carbs: 45, protein: 30, fat: 18 }
        },
        {
          id: 'tue-lunch-2',
          name: "Side Salad",
          calories: 100,
          portions: "1 bowl",
          macros: { carbs: 15, protein: 5, fat: 5 }
        }
      ],
      macros: { carbs: 60, protein: 35, fat: 23 }
    },
    {
      id: '3',
      name: "Dinner",
      calories: 600,
      icon: "dinner-dining",
      isPlanned: true,
      items: [
        {
          id: 'tue-dinner-1',
          name: "Turkey Meatballs",
          calories: 400,
          portions: "6 pieces",
          macros: { carbs: 20, protein: 35, fat: 22 }
        },
        {
          id: 'tue-dinner-2',
          name: "Brown Rice",
          calories: 200,
          portions: "1 cup",
          macros: { carbs: 45, protein: 5, fat: 1 }
        }
      ],
      macros: { carbs: 65, protein: 40, fat: 23 }
    }
  ],
  3: [ // Wednesday
    {
      id: '1',
      name: "Breakfast",
      calories: 400,
      icon: "wb-sunny",
      isPlanned: true,
      items: [
        {
          id: 'wed-breakfast-1',
          name: "Protein Smoothie",
          calories: 300,
          portions: "1 glass",
          macros: { carbs: 35, protein: 25, fat: 8 }
        },
        {
          id: 'wed-breakfast-2',
          name: "Banana",
          calories: 100,
          portions: "1 medium",
          macros: { carbs: 25, protein: 1, fat: 0 }
        }
      ],
      macros: { carbs: 60, protein: 26, fat: 8 }
    },
    {
      id: '2',
      name: "Lunch",
      calories: 550,
      icon: "restaurant",
      isPlanned: true,
      items: [
        {
          id: 'wed-lunch-1',
          name: "Chicken Quinoa Bowl",
          calories: 450,
          portions: "1 bowl",
          macros: { carbs: 55, protein: 35, fat: 15 }
        },
        {
          id: 'wed-lunch-2',
          name: "Hummus",
          calories: 100,
          portions: "2 tbsp",
          macros: { carbs: 8, protein: 4, fat: 8 }
        }
      ],
      macros: { carbs: 63, protein: 39, fat: 23 }
    },
    {
      id: '3',
      name: "Dinner",
      calories: 580,
      icon: "dinner-dining",
      isPlanned: true,
      items: [
        {
          id: 'wed-dinner-1',
          name: "Grilled Fish",
          calories: 380,
          portions: "1 fillet",
          macros: { carbs: 0, protein: 35, fat: 22 }
        },
        {
          id: 'wed-dinner-2',
          name: "Sweet Potato",
          calories: 200,
          portions: "1 medium",
          macros: { carbs: 45, protein: 4, fat: 0 }
        }
      ],
      macros: { carbs: 45, protein: 39, fat: 22 }
    }
  ],
  4: [ // Thursday
    {
      id: '1',
      name: "Breakfast",
      calories: 420,
      icon: "wb-sunny",
      isPlanned: true,
      items: [
        {
          id: 'thu-breakfast-1',
          name: "Egg White Omelette",
          calories: 320,
          portions: "1 omelette",
          macros: { carbs: 10, protein: 25, fat: 20 }
        },
        {
          id: 'thu-breakfast-2',
          name: "Whole Grain Toast",
          calories: 100,
          portions: "1 slice",
          macros: { carbs: 20, protein: 5, fat: 1 }
        }
      ],
      macros: { carbs: 30, protein: 30, fat: 21 }
    },
    {
      id: '2',
      name: "Lunch",
      calories: 530,
      icon: "restaurant",
      isPlanned: true,
      items: [
        {
          id: 'thu-lunch-1',
          name: "Mediterranean Salad",
          calories: 430,
          portions: "1 bowl",
          macros: { carbs: 35, protein: 25, fat: 25 }
        },
        {
          id: 'thu-lunch-2',
          name: "Pita Bread",
          calories: 100,
          portions: "1 piece",
          macros: { carbs: 20, protein: 3, fat: 1 }
        }
      ],
      macros: { carbs: 55, protein: 28, fat: 26 }
    },
    {
      id: '3',
      name: "Dinner",
      calories: 590,
      icon: "dinner-dining",
      isPlanned: true,
      items: [
        {
          id: 'thu-dinner-1',
          name: "Beef Stir Fry",
          calories: 490,
          portions: "1 plate",
          macros: { carbs: 35, protein: 35, fat: 25 }
        },
        {
          id: 'thu-dinner-2',
          name: "Brown Rice",
          calories: 100,
          portions: "1/2 cup",
          macros: { carbs: 22, protein: 2, fat: 1 }
        }
      ],
      macros: { carbs: 57, protein: 37, fat: 26 }
    }
  ],
  5: [ // Friday
    {
      id: '1',
      name: "Breakfast",
      calories: 380,
      icon: "wb-sunny",
      isPlanned: true,
      items: [
        {
          id: 'fri-breakfast-1',
          name: "Greek Yogurt Parfait",
          calories: 280,
          portions: "1 bowl",
          macros: { carbs: 35, protein: 20, fat: 8 }
        },
        {
          id: 'fri-breakfast-2',
          name: "Honey",
          calories: 100,
          portions: "1 tbsp",
          macros: { carbs: 25, protein: 0, fat: 0 }
        }
      ],
      macros: { carbs: 60, protein: 20, fat: 8 }
    },
    {
      id: '2',
      name: "Lunch",
      calories: 540,
      icon: "restaurant",
      isPlanned: true,
      items: [
        {
          id: 'fri-lunch-1',
          name: "Tofu Buddha Bowl",
          calories: 440,
          portions: "1 bowl",
          macros: { carbs: 55, protein: 25, fat: 18 }
        },
        {
          id: 'fri-lunch-2',
          name: "Miso Soup",
          calories: 100,
          portions: "1 cup",
          macros: { carbs: 15, protein: 5, fat: 3 }
        }
      ],
      macros: { carbs: 70, protein: 30, fat: 21 }
    },
    {
      id: '3',
      name: "Dinner",
      calories: 620,
      icon: "dinner-dining",
      isPlanned: true,
      items: [
        {
          id: 'fri-dinner-1',
          name: "Grilled Chicken",
          calories: 420,
          portions: "1 breast",
          macros: { carbs: 0, protein: 40, fat: 25 }
        },
        {
          id: 'fri-dinner-2',
          name: "Roasted Vegetables",
          calories: 200,
          portions: "2 cups",
          macros: { carbs: 40, protein: 5, fat: 5 }
        }
      ],
      macros: { carbs: 40, protein: 45, fat: 30 }
    }
  ],
  6: [ // Saturday
    {
      id: '1',
      name: "Breakfast",
      calories: 450,
      icon: "wb-sunny",
      isPlanned: true,
      items: [
        {
          id: 'sat-breakfast-1',
          name: "Protein Pancakes",
          calories: 350,
          portions: "3 pancakes",
          macros: { carbs: 45, protein: 25, fat: 10 }
        },
        {
          id: 'sat-breakfast-2',
          name: "Maple Syrup",
          calories: 100,
          portions: "2 tbsp",
          macros: { carbs: 25, protein: 0, fat: 0 }
        }
      ],
      macros: { carbs: 70, protein: 25, fat: 10 }
    },
    {
      id: '2',
      name: "Lunch",
      calories: 560,
      icon: "restaurant",
      isPlanned: true,
      items: [
        {
          id: 'sat-lunch-1',
          name: "Salmon Poke Bowl",
          calories: 460,
          portions: "1 bowl",
          macros: { carbs: 45, protein: 35, fat: 20 }
        },
        {
          id: 'sat-lunch-2',
          name: "Seaweed Salad",
          calories: 100,
          portions: "1 side",
          macros: { carbs: 15, protein: 5, fat: 3 }
        }
      ],
      macros: { carbs: 60, protein: 40, fat: 23 }
    },
    {
      id: '3',
      name: "Dinner",
      calories: 650,
      icon: "dinner-dining",
      isPlanned: true,
      items: [
        {
          id: 'sat-dinner-1',
          name: "Steak",
          calories: 450,
          portions: "1 piece",
          macros: { carbs: 0, protein: 40, fat: 30 }
        },
        {
          id: 'sat-dinner-2',
          name: "Mashed Potatoes",
          calories: 200,
          portions: "1 cup",
          macros: { carbs: 40, protein: 5, fat: 5 }
        }
      ],
      macros: { carbs: 40, protein: 45, fat: 35 }
    }
  ],
  7: [ // Sunday
    {
      id: '1',
      name: "Breakfast",
      calories: 480,
      icon: "wb-sunny",
      isPlanned: true,
      items: [
        {
          id: 'sun-breakfast-1',
          name: "Full English Breakfast",
          calories: 380,
          portions: "1 plate",
          macros: { carbs: 25, protein: 30, fat: 20 }
        },
        {
          id: 'sun-breakfast-2',
          name: "Orange Juice",
          calories: 100,
          portions: "1 glass",
          macros: { carbs: 25, protein: 1, fat: 0 }
        }
      ],
      macros: { carbs: 50, protein: 31, fat: 20 }
    },
    {
      id: '2',
      name: "Lunch",
      calories: 580,
      icon: "restaurant",
      isPlanned: true,
      items: [
        {
          id: 'sun-lunch-1',
          name: "Sunday Roast",
          calories: 480,
          portions: "1 plate",
          macros: { carbs: 35, protein: 35, fat: 25 }
        },
        {
          id: 'sun-lunch-2',
          name: "Yorkshire Pudding",
          calories: 100,
          portions: "1 piece",
          macros: { carbs: 15, protein: 5, fat: 5 }
        }
      ],
      macros: { carbs: 50, protein: 40, fat: 30 }
    },
    {
      id: '3',
      name: "Dinner",
      calories: 520,
      icon: "dinner-dining",
      isPlanned: true,
      items: [
        {
          id: 'sun-dinner-1',
          name: "Light Fish Dinner",
          calories: 420,
          portions: "1 plate",
          macros: { carbs: 25, protein: 35, fat: 20 }
        },
        {
          id: 'sun-dinner-2',
          name: "Mixed Salad",
          calories: 100,
          portions: "1 bowl",
          macros: { carbs: 15, protein: 5, fat: 5 }
        }
      ],
      macros: { carbs: 40, protein: 40, fat: 25 }
    }
  ]
};

const DIET_QUOTES = [
  "Let food be thy medicine, and medicine be thy food. - Hippocrates",
  "You are what you eat, so don't be fast, cheap, easy, or fake.",
  "A healthy outside starts from the inside. - Robert Urich",
  "Your diet is a bank account. Good food choices are good investments. - Bethenny Frankel",
  "The food you eat can be either the safest and most powerful form of medicine or the slowest form of poison. - Ann Wigmore",
  "Take care of your body. It's the only place you have to live. - Jim Rohn",
  "Don't eat less, eat right.",
  "Healthy eating is a way of life, so it's important to establish routines that are simple, realistic, and lasting.",
  "The first wealth is health. - Ralph Waldo Emerson",
  "Your body is not a temple, it's a home. You have to take care of it.",
  "Life is a tragedy of nutrition. - Arnold Ehret",
  "Tell me what you eat, and I will tell you what you are. - Jean Anthelme Brillat-Savarin",
  "Let thy food be thy medicine and thy medicine be thy food. - Hippocrates",
  "Health is a relationship between you and your body.",
  "The greatest wealth is health. - Virgil",
  "Your health is an investment, not an expense.",
  "Every time you eat is an opportunity to nourish your body.",
  "Eat for the body you want, not for the body you have.",
  "A healthy diet is a solution to many of our health-care problems.",
  "The food you eat today is walking and talking tomorrow.",
  "Nutrition is not about eating less, it's about eating right.",
  "Good nutrition creates health in all areas of our existence.",
  "The groundwork for all happiness is good health. - Leigh Hunt",
  "Eat better, feel better.",
  "Make eating well a habit, not a diet.",
  "Your body deserves the best nutrition possible.",
  "Food is fuel, not therapy.",
  "Healthy eating isn't about counting calories, it's about counting nutrients.",
  "What you eat in private, you wear in public.",
  "The quality of your food determines the quality of your life."
];

const getDailyQuote = () => {
  const today = new Date();
  const dayOfMonth = today.getDate() - 1; // 0-based index
  return DIET_QUOTES[dayOfMonth % DIET_QUOTES.length];
};

const MacroBar: React.FC<{
  label: string;
  amount: number;
}> = ({ label, amount }) => {
  return (
    <View style={styles.macroItem}>
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={styles.macroAmount}>{amount}g consumed</Text>
    </View>
  );
};

const MealItem: React.FC<{
  meal: MealData;
  onPress: () => void;
  isExpanded: boolean;
  onAddMeal?: () => void;
  onRemoveItem?: (mealId: string, itemId: string) => void;
}> = ({ meal, onPress, isExpanded, onAddMeal, onRemoveItem }) => {
  const getMealEmoji = (mealName: string) => {
    switch (mealName.toLowerCase()) {
      case 'breakfast':
        return '🍳';
      case 'lunch':
        return '🍱';
      case 'dinner':
        return '🍽️';
      default:
        return '🍴';
    }
  };

  return (
    <View style={styles.mealItemContainer}>
      <TouchableOpacity
        style={[
          styles.mealItem,
          isExpanded && styles.mealItemExpanded
        ]}
        onPress={onPress}
      >
        <View style={styles.mealItemLeft}>
          <View style={styles.mealIcon}>
            <Text style={styles.mealEmoji}>{getMealEmoji(meal.name)}</Text>
          </View>
          <View style={styles.mealInfo}>
            <Text style={styles.mealName}>{meal.name}</Text>
            <Text style={styles.calorieText}>
              {meal.calories}kcal
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.mealActionButton}
          onPress={() => {
            if (onAddMeal) {
              onAddMeal();
            }
          }}
        >
          <Text style={styles.plusButtonText}>+</Text>
        </TouchableOpacity>
      </TouchableOpacity>
      {isExpanded && meal.items && meal.items.length > 0 && (
        <View style={styles.expandedContent}>
          {meal.items.map((item, index) => (
            <View key={index} style={styles.mealItemDetail}>
              <View style={styles.mealItemDetailLeft}>
                <Text style={styles.mealItemDetailName}>{item.name}</Text>
                <Text style={styles.mealItemDetailPortions}>{item.portions}</Text>
                <View style={styles.macroTags}>
                  <View style={[styles.macroTag, { backgroundColor: colors.carbs + '20' }]}>
                    <Text style={[styles.macroTagText, { color: colors.carbs }]}>
                      {item.macros.carbs}g carbs
                    </Text>
                  </View>
                  <View style={[styles.macroTag, { backgroundColor: colors.protein + '20' }]}>
                    <Text style={[styles.macroTagText, { color: colors.protein }]}>
                      {item.macros.protein}g protein
                    </Text>
                  </View>
                  <View style={[styles.macroTag, { backgroundColor: colors.fat + '20' }]}>
                    <Text style={[styles.macroTagText, { color: colors.fat }]}>
                      {item.macros.fat}g fat
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.mealItemDetailRight}>
                <Text style={styles.mealItemDetailCalories}>{item.calories} kcal</Text>
                <TouchableOpacity
                  style={[styles.removeButton, { backgroundColor: colors.carbs + '20' }]}
                  onPress={() => onRemoveItem?.(meal.id, item.id)}
                >
                  <Text style={[styles.removeButtonText]}>−</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <TouchableOpacity
            style={styles.addMoreButton}
            onPress={() => onAddMeal?.()}
          >
            <Text style={[styles.addMoreText, { marginRight: 8, color: colors.primary }]}>+</Text>
            <Text style={styles.addMoreText}>Add another item</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const FoodListModal: React.FC<{
  visible: boolean;
  mealType: string;
  onClose: () => void;
  onSelect: (meal: any) => void;
}> = ({ visible, mealType, onClose, onSelect }) => {
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: number }>({});
  const foods = FOOD_LIST[mealType.toLowerCase() as keyof typeof FOOD_LIST] || [];

  const handleAddItem = (food: any, item: any, index: number) => {
    const itemKey = `${food.id}-${index}`;
    const newCount = (selectedItems[itemKey] || 0) + 1;
    setSelectedItems(prev => ({
      ...prev,
      [itemKey]: newCount
    }));

    onSelect({
      id: `${food.id}-item-${index}`,
      name: item.name,
      calories: item.calories,
      portion: item.portion,
      image: food.image
    });
  };

  const handleRemoveItem = (food: any, index: number) => {
    const itemKey = `${food.id}-${index}`;
    const currentCount = selectedItems[itemKey] || 0;
    if (currentCount > 0) {
      setSelectedItems(prev => ({
        ...prev,
        [itemKey]: currentCount - 1
      }));
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleContainer}>
              <Text style={styles.modalTitle}>Add {mealType}</Text>
              <Text style={styles.modalSubtitle}>Select food items to add to your meal</Text>
            </View>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.foodList}>
            {foods.map((food) => (
              <View key={food.id} style={styles.foodItemCard}>
                <View style={styles.foodItemHeader}>
                  <Text style={styles.foodEmoji}>{food.image}</Text>
                  <View style={styles.foodItemInfo}>
                    <Text style={styles.foodName}>{food.name}</Text>
                    <Text style={styles.foodCalories}>{food.totalCalories} kcal</Text>
                  </View>
                </View>

                <View style={styles.foodItemIngredients}>
                  {food.items.map((item, index) => {
                    const itemKey = `${food.id}-${index}`;
                    const itemCount = selectedItems[itemKey] || 0;

                    return (
                      <View
                        key={index}
                        style={[
                          styles.ingredientRow,
                          itemCount > 0 && styles.selectedIngredient
                        ]}
                      >
                        <View style={styles.ingredientLeft}>
                          <View style={styles.ingredientNameContainer}>
                            <Text style={styles.ingredientName}>• {item.name}</Text>
                            {itemCount > 0 && (
                              <View style={styles.countBadge}>
                                <Text style={styles.countText}>×{itemCount}</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.ingredientInfo}>
                            {item.portion} ({item.calories} kcal)
                          </Text>
                        </View>
                        <View style={styles.quantityControls}>
                          <TouchableOpacity
                            style={[
                              styles.quantityButton,
                              itemCount === 0 && styles.quantityButtonDisabled
                            ]}
                            onPress={() => handleRemoveItem(food, index)}
                            disabled={itemCount === 0}
                          >
                            <Text style={[
                              styles.quantityButtonText,
                              itemCount === 0 && styles.quantityButtonTextDisabled
                            ]}>-</Text>
                          </TouchableOpacity>
                          <Text style={styles.quantityText}>{itemCount}</Text>
                          <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => handleAddItem(food, item, index)}
                          >
                            <Text style={styles.quantityButtonText}>+</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={onClose}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const Diet: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today.getDate().toString());
  const [showCalendar, setShowCalendar] = useState(false);
  const [mealsData, setMealsData] = useState<{ [key: string]: MealData[] }>({
    [today.getDate().toString()]: [
      {
        id: '1',
        name: "Breakfast",
        calories: 0,
        icon: "wb-sunny",
        isPlanned: true,
        items: [],
        macros: { carbs: 0, protein: 0, fat: 0 }
      },
      {
        id: '2',
        name: "Lunch",
        calories: 0,
        icon: "restaurant",
        isPlanned: true,
        items: [],
        macros: { carbs: 0, protein: 0, fat: 0 }
      },
      {
        id: '3',
        name: "Dinner",
        calories: 0,
        icon: "dinner-dining",
        isPlanned: true,
        items: [],
        macros: { carbs: 0, protein: 0, fat: 0 }
      }
    ]
  });
  const [expandedMealId, setExpandedMealId] = useState<string | null>(null);
  const [showMealOptions, setShowMealOptions] = useState<string | null>(null);
  const [dailyQuote, setDailyQuote] = useState("");

  const meals = mealsData[selectedDate] || [];

  const initializeMealsForDate = (date: string) => {
    if (!mealsData[date]) {
      // Only use DEFAULT_WEEKLY_MEALS for current date
      const isCurrentDate = date === new Date().getDate().toString();
      const dayNumber = new Date().getDay() || 7;
      
      const defaultMeals = isCurrentDate 
        ? DEFAULT_WEEKLY_MEALS[dayNumber as keyof typeof DEFAULT_WEEKLY_MEALS] 
        : [
          {
            id: '1',
            name: "Breakfast",
            calories: 0,
            icon: "wb-sunny",
            isPlanned: true,
            items: [],
            macros: { carbs: 0, protein: 0, fat: 0 }
          },
          {
            id: '2',
            name: "Lunch",
            calories: 0,
            icon: "restaurant",
            isPlanned: true,
            items: [],
            macros: { carbs: 0, protein: 0, fat: 0 }
          },
          {
            id: '3',
            name: "Dinner",
            calories: 0,
            icon: "dinner-dining",
            isPlanned: true,
            items: [],
            macros: { carbs: 0, protein: 0, fat: 0 }
          }
        ];

      setMealsData(prev => ({
        ...prev,
        [date]: defaultMeals
      }));
    }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    initializeMealsForDate(date);
    setShowCalendar(false);
    setExpandedMealId(null);
  };

  const toggleMealExpand = (id: string) => {
    setExpandedMealId(expandedMealId === id ? null : id);
    const meal = meals.find(m => m.id === id);
    if (meal && (!meal.items || meal.items.length === 0)) {
      setShowMealOptions(id);
    }
  };

  const calculateTotalCalories = () => {
    return meals.reduce((total, meal) => total + (meal.calories || 0), 0);
  };

  const calculateMacros = () => {
    return meals.reduce((totals, meal) => ({
      carbs: totals.carbs + (meal.macros?.carbs || 0),
      protein: totals.protein + (meal.macros?.protein || 0),
      fat: totals.fat + (meal.macros?.fat || 0)
    }), { carbs: 0, protein: 0, fat: 0 });
  };

  const handleAddMeal = (mealId: string) => {
    console.log('Opening meal options for:', mealId);
    setShowMealOptions(mealId);
  };

  const handleSelectFood = (mealId: string, selectedItem: any) => {
    console.log('Selected food item:', selectedItem);

    setMealsData(prevMealsData => {
      const updatedMeals = (prevMealsData[selectedDate] || []).map(meal => {
        if (meal.id === mealId) {
          const newItem = {
            id: `${mealId}-${Date.now()}-${selectedItem.name}`,
            name: selectedItem.name,
            calories: selectedItem.calories,
            portions: selectedItem.portion,
            macros: {
              carbs: Math.round(selectedItem.calories * 0.5 / 4), // 50% of calories from carbs
              protein: Math.round(selectedItem.calories * 0.3 / 4), // 30% of calories from protein
              fat: Math.round(selectedItem.calories * 0.2 / 9) // 20% of calories from fat
            }
          };

          const currentCalories = meal.calories || 0;
          const currentMacros = meal.macros || { carbs: 0, protein: 0, fat: 0 };

          return {
            ...meal,
            calories: currentCalories + selectedItem.calories,
            items: [...(meal.items || []), newItem],
            macros: {
              carbs: currentMacros.carbs + newItem.macros.carbs,
              protein: currentMacros.protein + newItem.macros.protein,
              fat: currentMacros.fat + newItem.macros.fat
            }
          };
        }
        return meal;
      });

      return {
        ...prevMealsData,
        [selectedDate]: updatedMeals
      };
    });
  };

  const handleRemoveItem = (mealId: string, itemId: string) => {
    setMealsData(prevMealsData => {
      const updatedMeals = (prevMealsData[selectedDate] || []).map(meal => {
        if (meal.id === mealId) {
          const itemToRemove = meal.items.find(item => item.id === itemId);
          if (!itemToRemove) return meal;

          const updatedItems = meal.items.filter(item => item.id !== itemId);
          const currentMacros = meal.macros || { carbs: 0, protein: 0, fat: 0 };

          return {
            ...meal,
            items: updatedItems,
            calories: meal.calories - itemToRemove.calories,
            macros: {
              carbs: currentMacros.carbs - itemToRemove.macros.carbs,
              protein: currentMacros.protein - itemToRemove.macros.protein,
              fat: currentMacros.fat - itemToRemove.macros.fat
            }
          };
        }
        return meal;
      });

      return {
        ...prevMealsData,
        [selectedDate]: updatedMeals
      };
    });
  };

  useEffect(() => {
    setDailyQuote(getDailyQuote());
  }, []);

  const renderWeekView = () => (
    <View style={styles.weekViewContainer}>
      <TouchableOpacity
        style={styles.weekHeaderButton}
        onPress={() => setShowCalendar(true)}
      >
        <Text style={styles.weekViewText}>Week View</Text>
        <Text style={[styles.weekViewText, { marginLeft: 4 }]}></Text>
      </TouchableOpacity>
      <View style={styles.daysContainer}>
        {DAYS.map((day, index) => {
          const date = CURRENT_WEEK[index];
          const isSelected = date.toString() === selectedDate;
          const isToday = date === today.getDate();
  return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayButton,
                isSelected && !isToday && styles.selectedDay,
                isSelected && isToday && styles.todaySelectedDay
              ]}
              onPress={() => handleDateSelect(date.toString())}
            >
              <Text style={[
                styles.dayText,
                isSelected && !isToday && styles.selectedDayText,
                isSelected && isToday && styles.todaySelectedDayText,
                !isSelected && isToday && styles.todayText
              ]}>{day}</Text>
              <Text style={[
                styles.dateText,
                isSelected && !isToday && styles.selectedDayText,
                isSelected && isToday && styles.todaySelectedDayText,
                !isSelected && isToday && styles.todayText
              ]}>{date}</Text>
              {isToday && <View style={[
                styles.dateDot,
                isSelected && styles.selectedDayDot
              ]} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderCalendarModal = () => (
    <Modal
      visible={showCalendar}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowCalendar(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarTitle}>Select Date</Text>
            <View style={styles.calendarHeaderRight}>
              <TouchableOpacity onPress={() => setShowCalendar(false)}>
                <Text style={[styles.calendarTitle]}>✓</Text>
              </TouchableOpacity>
            </View>
          </View>
      <Calendar
            onDayPress={(day: DateData) => {
              handleDateSelect(day.day.toString());
            }}
        theme={{
              backgroundColor: colors.background,
              calendarBackground: colors.background,
              textSectionTitleColor: colors.text,
              selectedDayBackgroundColor: colors.primary,
              selectedDayTextColor: colors.background,
              todayTextColor: colors.primary,
              dayTextColor: colors.text,
              textDisabledColor: colors.textLight,
              dotColor: colors.primary,
              monthTextColor: colors.text,
              arrowColor: colors.primary,
              textDayFontSize: 16,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 14
            }}
          />
        </View>
      </View>
    </Modal>
  );

  const renderContent = () => {
    const totalCalories = calculateTotalCalories();
    const macros = calculateMacros();
    const currentDate = new Date().getDate().toString();
    
    // Only show calories and macros if there are meals with calories on the selected date
    const hasConsumption = mealsData[selectedDate]?.some(meal => meal.calories > 0) || false;
    const showStats = selectedDate === currentDate || hasConsumption;
    
    const caloriesConsumed = showStats ? Math.min(DEFAULT_DAILY_CALORIES, totalCalories) : 0;

    return (
      <View style={styles.mainContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Diet</Text>
        </View>
        <View style={styles.quoteContainer}>
          <Text style={styles.quoteText}>{dailyQuote}</Text>
        </View>

        {renderWeekView()}

        <View style={styles.statsContainer}>
          <View style={styles.calorieDisplay}>
            <Text style={styles.calorieNumber}>
              {showStats ? caloriesConsumed : '-'}
            </Text>
            <Text style={styles.calorieLabel}>KCALS CONSUMED</Text>
          </View>
          <View style={styles.macrosContainer}>
            <MacroBar
              label="CARBS"
              amount={showStats ? macros.carbs : 0}
            />
            <MacroBar
              label="PROTEIN"
              amount={showStats ? macros.protein : 0}
            />
            <MacroBar
              label="FAT"
              amount={showStats ? macros.fat : 0}
            />
          </View>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>Planned Meals</Text>
          <ScrollView style={styles.mealsList}>
            {meals.map((meal) => (
              <MealItem
                key={meal.id}
                meal={meal}
                onPress={() => toggleMealExpand(meal.id)}
                isExpanded={expandedMealId === meal.id}
                onAddMeal={() => handleAddMeal(meal.id)}
                onRemoveItem={(mealId, itemId) => handleRemoveItem(mealId, itemId)}
              />
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />
      <View style={styles.mainContent}>
        {renderContent()}
      </View>
      {renderCalendarModal()}
      {showMealOptions && (
        <FoodListModal
          visible={true}
          mealType={meals.find(m => m.id === showMealOptions)?.name || ''}
          onClose={() => setShowMealOptions(null)}
          onSelect={(food) => handleSelectFood(showMealOptions, food)}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  mainContent: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#1A1A1A',
  },
  headerTitle: {
    fontSize: 25,
    color: '#F47551',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  weekViewContainer: {
    paddingTop: 4,
    paddingBottom: 12,
    backgroundColor: colors.background,
  },
  weekHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  weekViewText: {
    fontSize: 15,
    color: colors.text,
    marginRight: 4,
    fontWeight: 'bold',
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  dayButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 24,
    minWidth: 40,
  },
  selectedDay: {
    backgroundColor: colors.primary,
  },
  dayText: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  selectedDayText: {
    color: colors.background,
  },
  dateDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.dotIndicator,
    marginTop: 4,
  },
  statsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    marginHorizontal: 20,
    marginTop: 8,
    height: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  calorieDisplay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    paddingRight: 24,
  },
  calorieNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000000',
  },
  calorieLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
    fontWeight: '500',
  },
  macrosContainer: {
    flex: 1,
    paddingLeft: 16,
    justifyContent: 'center',
  },
  macroItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  macroLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    width: 60,
  },
  macroAmount: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '500',
    minWidth: 90,
    textAlign: 'right',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 80,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#F47551',
    marginBottom: 16,
    alignSelf: 'flex-start',
    fontWeight: 'bold',
  },
  mealsList: {
    flex: 1,
    marginBottom: 0,
  },
  mealItemContainer: {
    width: '100%',
    marginBottom: 8,
  },
  mealItem: {
    backgroundColor: colors.mealItemBg,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  mealItemExpanded: {
    marginBottom: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  mealItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mealIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.progressBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  calorieText: {
    fontSize: 14,
    color: colors.textLight,
  },
  mealActionButton: {
    width: 32,
    height: 32,
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusButtonText: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: 'bold',
  },
  mealEmoji: {
    fontSize: 20,
  },
  expandedContent: {
    backgroundColor: colors.mealItemBg,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: 12,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  mealItemDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  mealItemDetailLeft: {
    flex: 1,
    marginRight: 16,
  },
  mealItemDetailName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  mealItemDetailPortions: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 12,
  },
  macroTags: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
    flexWrap: 'nowrap'
  },
  macroTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center'
  },
  macroTagText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center'
  },
  mealItemDetailRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mealItemDetailCalories: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginTop: 8,
  },
  addMoreText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 8,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingTop: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },
  foodList: {
    paddingHorizontal: 16,
  },
  foodItemCard: {
    backgroundColor: '#546D64',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  foodItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  foodEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  foodItemInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  foodCalories: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  foodItemIngredients: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    marginTop: 8,
  },
  selectedIngredient: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  ingredientLeft: {
    flex: 1,
    marginRight: 16,
  },
  ingredientNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ingredientName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  ingredientInfo: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.5,
  },
  quantityButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  quantityButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  quantityText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    minWidth: 24,
    textAlign: 'center',
  },
  countBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  modalFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  doneButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  selectedDayDot: {
    backgroundColor: colors.background,
  },
  todayText: {
    color: colors.primary,
    fontWeight: '500',
  },
  todaySelectedDay: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  todaySelectedDayText: {
    color: colors.primary,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  calendarContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  calendarHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 20,
    right: 20,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  removeButtonText: {
    fontSize: 24,
    color: colors.carbs,
    fontWeight: 'bold',
  },
  quoteContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgba(247, 219, 167, 0.1)',
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 12,
    borderRadius: 12,
  },
  quoteText: {
    fontSize: 14,
    color: '#F7DBA7',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default Diet;