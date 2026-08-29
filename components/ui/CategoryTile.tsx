import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  'beverages': 'https://images.unsplash.com/photo-1527960471264-932f39eb5846?q=80&w=400&auto=format&fit=crop',
  'baby care': 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=400&auto=format&fit=crop',
  'snacks & packaged food': 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?q=80&w=400&auto=format&fit=crop',
  'snacks': 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?q=80&w=400&auto=format&fit=crop',
  'personal care': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=400&auto=format&fit=crop',
  'medicines': 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?q=80&w=400&auto=format&fit=crop',
  'pharmacy': 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?q=80&w=400&auto=format&fit=crop',
  'dairy & eggs': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?q=80&w=400&auto=format&fit=crop',
  'dairy': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?q=80&w=400&auto=format&fit=crop',
  'fruits & vegetables': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=400&auto=format&fit=crop',
  'staples': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=400&auto=format&fit=crop',
  'household care': 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?q=80&w=400&auto=format&fit=crop',
};

const getFallbackImage = (categoryName: string) => {
  if (!categoryName) return 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400&auto=format&fit=crop';
  const key = categoryName.toLowerCase().trim();
  return DEFAULT_CATEGORY_IMAGES[key] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400&auto=format&fit=crop';
};

interface CategoryTileProps {
  name: string;
  image?: string;
  icon?: string;
  onPress?: () => void;
  size?: number;
}

export const CategoryTile: React.FC<CategoryTileProps> = React.memo(({
  name,
  image,
  onPress,
  size = 74,
}) => {
  const rawUrl = typeof image === 'string' && image.trim() ? image.trim() : (image as any)?.url || (image as any)?.imageUrl || (image as any)?.iconUrl;

  const [currentUri, setCurrentUri] = useState<string>(
    rawUrl || getFallbackImage(name)
  );

  useEffect(() => {
    setCurrentUri(rawUrl || getFallbackImage(name));
  }, [rawUrl, name]);

  const handleImageError = () => {
    setCurrentUri(getFallbackImage(name));
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[styles.wrapper, { width: size }]}
    >
      <View style={[styles.tile, { width: size, height: size }]}>
        <Image
          source={{ uri: currentUri }}
          style={styles.image}
          resizeMode="cover"
          fadeDuration={0}
          onError={handleImageError}
        />
      </View>
      <Text
        style={styles.label}
        numberOfLines={2}
      >
        {name}
      </Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  tile: {
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    padding: 0,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 14,
  },
});

export default CategoryTile;
