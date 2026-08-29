import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, Dimensions, RefreshControl } from 'react-native';
import { PageHeader } from '@/components/ui/PageHeader';
import { CategoryTile } from '@/components/ui/CategoryTile';
import { Category, categoryApi } from '@/api/categoryApi';
import { MOCK_CATEGORIES } from '@/constants/mockData';
import { Colors } from '@/constants/colors';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');
const NUM_COLUMNS = 4;
const TILE_SIZE = Math.floor((width - 40 - (NUM_COLUMNS - 1) * 8) / NUM_COLUMNS);

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryApi.getAllCategories();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setCategories(res.data);
      } else {
        setCategories(MOCK_CATEGORIES as any);
      }
    } catch (e) {
      setCategories(MOCK_CATEGORIES as any);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCategories();
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <PageHeader title="All Categories" variant="primary" />

      {loading && !refreshing ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={categories}
          numColumns={NUM_COLUMNS}
          keyExtractor={(item: any, index) => item._id || item.id || item.name || index.toString()}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
          columnWrapperStyle={{ justifyContent: 'flex-start', gap: 8, marginBottom: 16 }}
          renderItem={({ item }: { item: any }) => (
            <CategoryTile
              name={item.name}
              image={typeof item.image === 'string' ? item.image : item.image?.url}
              icon={item.icon}
              size={TILE_SIZE}
              onPress={() =>
                router.push({
                  pathname: '/products/category',
                  params: { categoryId: item._id || item.id, categoryName: item.name },
                })
              }
            />
          )}
        />
      )}
    </View>
  );
}
