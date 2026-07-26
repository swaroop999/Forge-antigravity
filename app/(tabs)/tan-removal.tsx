import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useState } from 'react';

/**
 * Tan Removal Screen - Tan assessment, prevention, and removal tracking
 */
export default function TanRemovalScreen() {
  const colors = useColors();
  const [tanRatings, setTanRatings] = useState({
    face: 5,
    neck: 6,
    arms: 7,
    hands: 8,
    legs: 4,
    feet: 3,
  });

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    ratingBox: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
  });

  const toggleItem = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const tanAreas = [
    { label: 'Face', key: 'face' },
    { label: 'Neck', key: 'neck' },
    { label: 'Arms', key: 'arms' },
    { label: 'Hands', key: 'hands' },
    { label: 'Legs', key: 'legs' },
    { label: 'Feet', key: 'feet' },
  ];

  const preventionChecklist = [
    { id: 'spf-face', label: 'Face SPF applied (linked to skincare)' },
    { id: 'spf-body', label: 'Body SPF on neck + arms + hands' },
    { id: 'helmet', label: 'Helmet with visor worn' },
    { id: 'sunglasses', label: 'Sunglasses worn' },
    { id: 'sleeves', label: 'Long sleeves worn (if weather permits)' },
  ];

  const weeklySchedule = [
    { day: 'Wednesday 9:30 PM', task: 'Body scrub session' },
    { day: 'Saturday 9:30 PM', task: 'Body scrub session' },
    { day: 'Sunday 10:45 AM', task: 'Ubtan body pack + face mask' },
  ];

  const diyRecipes = [
    { name: 'Ubtan Body Pack', ingredients: 'Besan + yogurt + turmeric + honey' },
    { name: 'Tomato Lemon Pack', ingredients: 'Tomato juice + lemon juice' },
    { name: 'Yogurt Besan Pack', ingredients: 'Yogurt + besan + honey' },
    { name: 'Aloe Vera Daily', ingredients: 'Pure aloe vera gel' },
    { name: 'Cucumber Rosewater', ingredients: 'Cucumber juice + rosewater' },
    { name: 'Milk Honey Wash', ingredients: 'Raw milk + honey' },
  ];

  const productInventory = [
    'Vitamin C Serum',
    'Alpha Arbutin serum',
    'Body scrub',
    'SPF body lotion',
    'Brightening body lotion',
    'Aloe vera gel',
  ];

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-6 pb-8">
          <Text className="text-3xl font-bold text-foreground mb-2">Tan Removal</Text>
          <Text className="text-muted mb-6">☀️ Track and remove tan</Text>

          {/* Tan Assessment */}
          <View style={styles.card}>
            <Text className="text-lg font-bold text-foreground mb-4">Weekly Tan Assessment (1-10)</Text>
            <Text className="text-xs text-muted mb-4">Rate severity per body part</Text>

            {tanAreas.map((area, i) => (
              <View key={area.key} style={[styles.ratingBox, { borderBottomWidth: i < 5 ? 1 : 0 }]}>
                <Text className="text-sm text-foreground">{area.label}</Text>
                <View className="flex-row gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <Pressable
                      key={num}
                      style={({ pressed }) => [
                        {
                          width: 28,
                          height: 28,
                          borderRadius: 14,
                          backgroundColor:
                            tanRatings[area.key as keyof typeof tanRatings] === num
                              ? colors.primary
                              : colors.border,
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                      onPress={() =>
                        setTanRatings((prev) => ({
                          ...prev,
                          [area.key]: num,
                        }))
                      }
                    >
                      <Text
                        className={`text-xs font-bold ${
                          tanRatings[area.key as keyof typeof tanRatings] === num
                            ? 'text-background'
                            : 'text-muted'
                        }`}
                      >
                        {num}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}

            <Text className="text-xs text-muted mt-4">
              Timeline: Visible improvement in 4-6 weeks, full removal in 8-10 weeks
            </Text>
          </View>

          {/* Daily Prevention */}
          <View style={styles.card}>
            <Text className="text-lg font-bold text-foreground mb-4">Daily Tan Prevention</Text>

            {preventionChecklist.map((item, i) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 10,
                    borderBottomWidth: i < 4 ? 1 : 0,
                    borderBottomColor: colors.border,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
                onPress={() => toggleItem(item.id)}
              >
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    backgroundColor: checkedItems[item.id] ? colors.success : 'transparent',
                    borderWidth: 2,
                    borderColor: checkedItems[item.id] ? colors.success : colors.border,
                    marginRight: 10,
                  }}
                />
                <Text className="text-sm text-foreground">{item.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Weekly Schedule */}
          <View style={styles.card}>
            <Text className="text-lg font-bold text-foreground mb-4">Weekly Tan Removal Schedule</Text>

            {weeklySchedule.map((item, i) => (
              <Pressable
                key={i}
                style={({ pressed }) => [
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 12,
                    borderBottomWidth: i < 2 ? 1 : 0,
                    borderBottomColor: colors.border,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
                onPress={() => toggleItem(`schedule-${i}`)}
              >
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">{item.day}</Text>
                  <Text className="text-xs text-muted mt-1">{item.task}</Text>
                </View>
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: checkedItems[`schedule-${i}`] ? colors.success : 'transparent',
                    borderWidth: 2,
                    borderColor: checkedItems[`schedule-${i}`] ? colors.success : colors.border,
                  }}
                />
              </Pressable>
            ))}
          </View>

          {/* DIY Recipes */}
          <View style={styles.card}>
            <Text className="text-lg font-bold text-foreground mb-4">DIY Recipe Library</Text>
            <Text className="text-xs text-muted mb-4">Step-by-step instructions + timers</Text>

            {diyRecipes.map((recipe, i) => (
              <Pressable
                key={i}
                style={({ pressed }) => [
                  {
                    paddingVertical: 12,
                    borderBottomWidth: i < diyRecipes.length - 1 ? 1 : 0,
                    borderBottomColor: colors.border,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
                onPress={() => console.log(`View recipe: ${recipe.name}`)}
              >
                <Text className="text-sm font-semibold text-primary">{recipe.name}</Text>
                <Text className="text-xs text-muted mt-1">{recipe.ingredients}</Text>
              </Pressable>
            ))}
          </View>

          {/* Product Inventory */}
          <View style={styles.card}>
            <Text className="text-lg font-bold text-foreground mb-4">Product Inventory</Text>
            <Text className="text-xs text-muted mb-4">Track when each runs out</Text>

            {productInventory.map((product, i) => (
              <Pressable
                key={i}
                style={({ pressed }) => [
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 10,
                    borderBottomWidth: i < productInventory.length - 1 ? 1 : 0,
                    borderBottomColor: colors.border,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
                onPress={() => console.log(`Track: ${product}`)}
              >
                <Text className="text-sm text-foreground">{product}</Text>
                <Text className="text-xs text-success">✓ In stock</Text>
              </Pressable>
            ))}
          </View>

          {/* Progress Tracking */}
          <View style={styles.card}>
            <Text className="text-lg font-bold text-foreground mb-4">Progress Tracking</Text>
            <Text className="text-xs text-muted mb-4">Weekly photos of tanned areas</Text>

            {['Face', 'Neck', 'Arms', 'Feet'].map((area, i) => (
              <Pressable
                key={i}
                style={({ pressed }) => [
                  {
                    paddingVertical: 10,
                    borderBottomWidth: i < 3 ? 1 : 0,
                    borderBottomColor: colors.border,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
                onPress={() => console.log(`Upload photo: ${area}`)}
              >
                <Text className="text-sm text-foreground">{area}</Text>
                <Text className="text-xs text-muted mt-1">📸 Upload weekly photo</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
