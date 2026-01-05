import { PageHeader } from '@/components/ui/PageHeader';
import { Colors } from '@/constants/colors';
import { MOCK_CATEGORIES } from '@/constants/mockData';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

export default function CategoriesScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <PageHeader title="All Categories" variant="primary" />

      <FlatList
        data={MOCK_CATEGORIES}
        numColumns={2}
        keyExtractor={(item) => item.id || Math.random().toString()}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ flex: 1, margin: 8 }}
            onPress={() => router.push({
              pathname: '/products/category',
              params: { categoryId: item.id, categoryName: item.name },
            })}
            activeOpacity={0.8}
          >
            <View style={{
              backgroundColor: Colors.textWhite,
              borderRadius: 8,
              padding: 20,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: Colors.gray200,
              shadowColor: Colors.shadow,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              // elevation: 1,
            }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>{item.icon}</Text>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: Colors.textPrimary,
                textAlign: 'center',
                marginBottom: 4
              }}>
                {item.name}
              </Text>
              <Text style={{
                fontSize: 13,
                color: Colors.textSecondary,
                textAlign: 'center',
              }}>
                {item.productCount} products
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

