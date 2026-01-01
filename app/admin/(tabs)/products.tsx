import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Colors } from '@/constants/colors';
import { Icon } from '@/components/ui/Icon';
import { productApi, Product } from '@/api/productApi';
import ImageEditor from '@/components/admin/ImageEditor';

const MAX_IMAGES = 4;

interface ImageData {
  uri: string;
  type: string;
  name: string;
  edited?: boolean;
}

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Modal states
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    isActive: true,
  });

  // Image states
  const [selectedImages, setSelectedImages] = useState<ImageData[]>([]);
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);
  const [imageEditorVisible, setImageEditorVisible] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productApi.getAllProductsForAdmin();
      if (response.success && response.data) {
        setProducts(response.data);
      } else {
        Alert.alert('Error', response.message || 'Failed to load products');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  }, []);

  const requestImagePermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to upload images.');
        return false;
      }
    }
    return true;
  };

  const handlePickImages = async () => {
    const hasPermission = await requestImagePermission();
    if (!hasPermission) return;

    const remainingSlots = MAX_IMAGES - selectedImages.length;
    if (remainingSlots <= 0) {
      Alert.alert('Limit Reached', `You can only upload up to ${MAX_IMAGES} images.`);
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8, // Reduced quality to compress images (0.8 = 80% quality)
        selectionLimit: remainingSlots,
        // IMPORTANT: base64: false ensures we get file URIs, not base64 data
        base64: false,
        // IMPORTANT: allowsEditing: false to get the original file URI
        allowsEditing: false,
      });

      if (!result.canceled && result.assets) {
        // Compress images to reduce file size and avoid network errors
        const compressedImages = await Promise.all(
          result.assets.map(async (asset) => {
            try {
              // Compress and resize image to max 1920px width/height to reduce file size
              const manipulatedImage = await ImageManipulator.manipulateAsync(
                asset.uri,
                [{ resize: { width: 1920 } }], // Resize to max 1920px width (maintains aspect ratio)
                {
                  compress: 0.7, // 70% compression quality
                  format: ImageManipulator.SaveFormat.JPEG, // Use JPEG for better compression
                }
              );

              return {
                uri: manipulatedImage.uri,
                type: 'image/jpeg', // Always JPEG after manipulation
                name: asset.fileName || `image_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`,
                edited: false,
              };
            } catch {
              // If compression fails, use original image
              return {
                uri: asset.uri,
                type: asset.mimeType || 'image/jpeg',
                name: asset.fileName || `image_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`,
                edited: false,
              };
            }
          })
        );

        if (selectedImages.length + compressedImages.length > MAX_IMAGES) {
          Alert.alert('Limit Reached', `You can only upload up to ${MAX_IMAGES} images.`);
          return;
        }

        setSelectedImages([...selectedImages, ...compressedImages]);
      }
    } catch {
      Alert.alert('Error', 'Failed to pick images. Please try again.');
    }
  };

  const handleEditImage = (index: number) => {
    setEditingImageIndex(index);
    setImageEditorVisible(true);
  };

  const handleSaveEditedImage = (editedUri: string) => {
    if (editingImageIndex !== null) {
      const updatedImages = [...selectedImages];
      updatedImages[editingImageIndex] = {
        ...updatedImages[editingImageIndex],
        uri: editedUri,
        edited: true,
      };
      setSelectedImages(updatedImages);
    }
    setImageEditorVisible(false);
    setEditingImageIndex(null);
  };

  const handleRemoveImage = (index: number) => {
    Alert.alert(
      'Remove Image',
      'Are you sure you want to remove this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setSelectedImages(selectedImages.filter((_, i) => i !== index));
          },
        },
      ]
    );
  };

  const handleCreateProduct = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      stock: '',
      isActive: true,
    });
    setSelectedImages([]);
    setCreateModalVisible(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      isActive: product.isActive,
    });
    setSelectedImages(
      product.images.map((img, index) => ({
        uri: img,
        type: 'image/jpeg',
        name: `existing_${index}.jpg`,
        edited: false,
      }))
    );
    setEditModalVisible(true);
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setViewModalVisible(true);
  };

  const handleDeleteProduct = (product: Product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              const response = await productApi.deleteProduct(product._id);
              if (response.success) {
                Alert.alert('Success', 'Product deleted successfully');
                await loadProducts();
              } else {
                Alert.alert('Error', response.message || 'Failed to delete product');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete product');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleSaveProduct = async () => {
    // Validation
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Product name is required');
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert('Validation Error', 'Product description is required');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      Alert.alert('Validation Error', 'Valid price is required');
      return;
    }
    if (!formData.category.trim()) {
      Alert.alert('Validation Error', 'Product category is required');
      return;
    }
    if (selectedImages.length === 0) {
      Alert.alert('Validation Error', 'At least one image is required');
      return;
    }

    try {
      setActionLoading(true);
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category.trim(),
        stock: formData.stock ? parseInt(formData.stock) : 0,
        isActive: formData.isActive,
      };

      const imageFiles = selectedImages.map((img) => ({
        uri: img.uri,
        type: img.type,
        name: img.name,
      }));

      const response = await productApi.createProduct(productData, imageFiles);

      if (response.success) {
        Alert.alert('Success', 'Product created successfully');
        setCreateModalVisible(false);
        setSelectedImages([]);
        await loadProducts();
      } else {
        // Show detailed error message
        const errorMessage = response.message || 'Failed to create product';
        const errorDetails = (response as any).errorDetails;
        
        // Log full error details to console/terminal
        console.error('[CREATE PRODUCT ERROR]', {
          message: errorMessage,
          details: errorDetails,
        });

        // Show detailed alert with error information
        Alert.alert(
          'Error Creating Product',
          `${errorMessage}\n\nCheck the terminal/console for more details.`,
          [
            { text: 'OK', style: 'default' },
            {
              text: 'View Details',
              onPress: () => {
                // Show more details in a second alert
                Alert.alert(
                  'Error Details',
                  errorDetails
                    ? `Error Code: ${errorDetails.code || 'N/A'}\n\nMessage: ${errorDetails.message || 'N/A'}\n\nResponse: ${errorDetails.response ? JSON.stringify(errorDetails.response, null, 2) : 'N/A'}\n\nCheck terminal for full details.`
                    : 'No additional details available. Check terminal/console for logs.',
                  [{ text: 'OK' }]
                );
              },
            },
          ]
        );
      }
    } catch (error: any) {
      // Log full error to console/terminal
      console.error('[CREATE PRODUCT EXCEPTION]', error);
      
      // Enhanced error handling
      const errorMessage = error.message || 'Failed to create product';
      const errorStack = error.stack || '';
      
      Alert.alert(
        'Unexpected Error',
        `${errorMessage}\n\nCheck the terminal/console for full error details.`,
        [
          { text: 'OK', style: 'default' },
          {
            text: 'View Stack',
            onPress: () => {
              Alert.alert('Error Stack', errorStack.substring(0, 500) + (errorStack.length > 500 ? '...' : ''), [{ text: 'OK' }]);
            },
          },
        ]
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;

    // Validation
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Product name is required');
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert('Validation Error', 'Product description is required');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      Alert.alert('Validation Error', 'Valid price is required');
      return;
    }
    if (!formData.category.trim()) {
      Alert.alert('Validation Error', 'Product category is required');
      return;
    }

    try {
      setActionLoading(true);
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category.trim(),
        stock: formData.stock ? parseInt(formData.stock) : 0,
        isActive: formData.isActive,
      };

      // Separate existing and new images
      const existingImages = selectedImages
        .filter((img) => img.uri.startsWith('http'))
        .map((img) => img.uri);
      const newImages = selectedImages
        .filter((img) => !img.uri.startsWith('http'))
        .map((img) => ({
          uri: img.uri,
          type: img.type,
          name: img.name,
        }));

      const response = await productApi.updateProduct(
        selectedProduct._id,
        productData,
        newImages,
        existingImages
      );

      if (response.success) {
        Alert.alert('Success', 'Product updated successfully');
        setEditModalVisible(false);
        setSelectedProduct(null);
        setSelectedImages([]);
        await loadProducts();
      } else {
        // Show detailed error message
        const errorMessage = response.message || 'Failed to update product';
        const errorDetails = response.errorDetails;
        
        // Log full error details to console/terminal
        console.error('[UPDATE PRODUCT ERROR]', {
          message: errorMessage,
          details: errorDetails,
        });

        // Show detailed alert with error information
        Alert.alert(
          'Error Updating Product',
          `${errorMessage}\n\nCheck the terminal/console for more details.`,
          [
            { text: 'OK', style: 'default' },
            {
              text: 'View Details',
              onPress: () => {
                // Show more details in a second alert
                Alert.alert(
                  'Error Details',
                  errorDetails
                    ? `Error Code: ${errorDetails.code || 'N/A'}\n\nMessage: ${errorDetails.message || 'N/A'}\n\nResponse: ${errorDetails.response ? JSON.stringify(errorDetails.response, null, 2) : 'N/A'}\n\nCheck terminal for full details.`
                    : 'No additional details available. Check terminal/console for logs.',
                  [{ text: 'OK' }]
                );
              },
            },
          ]
        );
      }
    } catch (error: any) {
      // Log full error to console/terminal
      console.error('[UPDATE PRODUCT EXCEPTION]', error);
      
      Alert.alert(
        'Unexpected Error',
        `${error.message || 'Failed to update product'}\n\nCheck the terminal/console for full error details.`,
        [{ text: 'OK' }]
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Get unique categories from products
  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = [
    { label: 'Total Products', value: products.length.toString(), icon: 'inventory', color: Colors.primary },
    { label: 'In Stock', value: products.filter(p => p.isActive && p.stock > 0).length.toString(), icon: 'check-circle', color: Colors.success },
    { label: 'Out of Stock', value: products.filter(p => p.stock === 0).length.toString(), icon: 'cancel', color: Colors.error },
    { label: 'Inactive', value: products.filter(p => !p.isActive).length.toString(), icon: 'warning', color: Colors.warning },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View style={[styles.animatedContainer, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Products</Text>
            <Text style={styles.headerSubtitle}>Manage your product inventory</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={handleCreateProduct} activeOpacity={0.8}>
            <Icon name="add" size={22} color={Colors.textWhite} library="material" />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: `${stat.color}10` }]}>
                <Icon name={stat.icon} size={20} color={stat.color} library="material" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Icon name="search" size={20} color={Colors.textSecondary} library="material" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              placeholderTextColor={Colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
                <Icon name="close" size={18} color={Colors.textSecondary} library="material" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category || (category === 'All' && !selectedCategory) ? styles.categoryChipActive : null,
              ]}
              onPress={() => setSelectedCategory(category === 'All' ? null : category)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category || (category === 'All' && !selectedCategory) ? styles.categoryChipTextActive : null,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Products List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          >
            <View style={styles.productsContainer}>
              {filteredProducts.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Icon name="inventory" size={64} color={Colors.textTertiary} library="material" />
                  <Text style={styles.emptyText}>No products found</Text>
                </View>
              ) : (
                filteredProducts.map((product) => (
                  <View key={product._id} style={styles.productCard}>
                    <View style={styles.productImageContainer}>
                      {product.images && product.images.length > 0 ? (
                        <Image source={{ uri: product.images[0] }} style={styles.productImage} />
                      ) : (
                        <View style={styles.productImagePlaceholder}>
                          <Icon name="image" size={24} color={Colors.textTertiary} library="material" />
                        </View>
                      )}
                      {!product.isActive && (
                        <View style={styles.inactiveBadge}>
                          <Text style={styles.inactiveText}>Inactive</Text>
                        </View>
                      )}
                      {product.stock === 0 && (
                        <View style={styles.outOfStockBadge}>
                          <Text style={styles.outOfStockText}>Out of Stock</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                      <Text style={styles.productCategory}>{product.category}</Text>
                      <View style={styles.productMeta}>
                        <View>
                          <Text style={styles.productPrice}>₹{product.price}</Text>
                        </View>
                        <View style={styles.stockInfo}>
                          <Icon name="inventory" size={14} color={Colors.textSecondary} library="material" />
                          <Text style={styles.stockText}>{product.stock} units</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.productActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleViewProduct(product)}
                        activeOpacity={0.7}
                      >
                        <Icon name="visibility" size={18} color={Colors.info} library="material" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleEditProduct(product)}
                        activeOpacity={0.7}
                      >
                        <Icon name="edit" size={18} color={Colors.warning} library="material" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDeleteProduct(product)}
                        activeOpacity={0.7}
                        disabled={actionLoading}
                      >
                        <Icon name="delete" size={18} color={Colors.error} library="material" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        )}
      </Animated.View>

      {/* Create Product Modal */}
      <Modal visible={createModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create Product</Text>
                <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                  <Icon name="close" size={24} color={Colors.textPrimary} library="material" />
                </TouchableOpacity>
              </View>

              {/* Image Upload Section */}
              <View style={styles.imageUploadSection}>
                <Text style={styles.sectionTitle}>Product Images (Max {MAX_IMAGES})</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagePreviewContainer}>
                  {selectedImages.map((image, index) => (
                    <View key={index} style={styles.imagePreviewWrapper}>
                      <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                      <TouchableOpacity
                        style={styles.imageEditButton}
                        onPress={() => handleEditImage(index)}
                      >
                        <Icon name="edit" size={16} color={Colors.textWhite} library="material" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.imageRemoveButton}
                        onPress={() => handleRemoveImage(index)}
                      >
                        <Icon name="close" size={16} color={Colors.textWhite} library="material" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  {selectedImages.length < MAX_IMAGES && (
                    <TouchableOpacity style={styles.addImageButton} onPress={handlePickImages}>
                      <Icon name="add" size={32} color={Colors.textSecondary} library="material" />
                      <Text style={styles.addImageText}>Add Image</Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              </View>

              {/* Form Fields */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Product Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter product name"
                  placeholderTextColor={Colors.textTertiary}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter product description"
                  placeholderTextColor={Colors.textTertiary}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Price (₹) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    placeholderTextColor={Colors.textTertiary}
                    value={formData.price}
                    onChangeText={(text) => setFormData({ ...formData, price: text })}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>Stock</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor={Colors.textTertiary}
                    value={formData.stock}
                    onChangeText={(text) => setFormData({ ...formData, stock: text })}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Category *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter category"
                  placeholderTextColor={Colors.textTertiary}
                  value={formData.category}
                  onChangeText={(text) => setFormData({ ...formData, category: text })}
                />
              </View>

              <TouchableOpacity
                style={[styles.saveButton, actionLoading && styles.saveButtonDisabled]}
                onPress={handleSaveProduct}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color={Colors.textWhite} />
                ) : (
                  <Text style={styles.saveButtonText}>Create Product</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Product Modal - Similar structure to Create Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Product</Text>
                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                  <Icon name="close" size={24} color={Colors.textPrimary} library="material" />
                </TouchableOpacity>
              </View>

              {/* Image Upload Section - Same as create */}
              <View style={styles.imageUploadSection}>
                <Text style={styles.sectionTitle}>Product Images (Max {MAX_IMAGES})</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagePreviewContainer}>
                  {selectedImages.map((image, index) => (
                    <View key={index} style={styles.imagePreviewWrapper}>
                      <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                      {!image.uri.startsWith('http') && (
                        <TouchableOpacity
                          style={styles.imageEditButton}
                          onPress={() => handleEditImage(index)}
                        >
                          <Icon name="edit" size={16} color={Colors.textWhite} library="material" />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={styles.imageRemoveButton}
                        onPress={() => handleRemoveImage(index)}
                      >
                        <Icon name="close" size={16} color={Colors.textWhite} library="material" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  {selectedImages.length < MAX_IMAGES && (
                    <TouchableOpacity style={styles.addImageButton} onPress={handlePickImages}>
                      <Icon name="add" size={32} color={Colors.textSecondary} library="material" />
                      <Text style={styles.addImageText}>Add Image</Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              </View>

              {/* Form Fields - Same as create */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Product Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter product name"
                  placeholderTextColor={Colors.textTertiary}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter product description"
                  placeholderTextColor={Colors.textTertiary}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Price (₹) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    placeholderTextColor={Colors.textTertiary}
                    value={formData.price}
                    onChangeText={(text) => setFormData({ ...formData, price: text })}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>Stock</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor={Colors.textTertiary}
                    value={formData.stock}
                    onChangeText={(text) => setFormData({ ...formData, stock: text })}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Category *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter category"
                  placeholderTextColor={Colors.textTertiary}
                  value={formData.category}
                  onChangeText={(text) => setFormData({ ...formData, category: text })}
                />
              </View>

              <TouchableOpacity
                style={[styles.saveButton, actionLoading && styles.saveButtonDisabled]}
                onPress={handleUpdateProduct}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color={Colors.textWhite} />
                ) : (
                  <Text style={styles.saveButtonText}>Update Product</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* View Product Modal */}
      <Modal visible={viewModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Product Details</Text>
                <TouchableOpacity onPress={() => setViewModalVisible(false)}>
                  <Icon name="close" size={24} color={Colors.textPrimary} library="material" />
                </TouchableOpacity>
              </View>

              {selectedProduct && (
                <>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.viewImageContainer}>
                    {selectedProduct.images && selectedProduct.images.length > 0 ? (
                      selectedProduct.images.map((img, index) => (
                        <Image key={index} source={{ uri: img }} style={styles.viewImage} />
                      ))
                    ) : (
                      <View style={styles.viewImagePlaceholder}>
                        <Icon name="image" size={48} color={Colors.textTertiary} library="material" />
                      </View>
                    )}
                  </ScrollView>

                  <View style={styles.viewInfo}>
                    <Text style={styles.viewLabel}>Name</Text>
                    <Text style={styles.viewValue}>{selectedProduct.name}</Text>

                    <Text style={styles.viewLabel}>Description</Text>
                    <Text style={styles.viewValue}>{selectedProduct.description}</Text>

                    <View style={styles.viewRow}>
                      <View style={styles.viewCol}>
                        <Text style={styles.viewLabel}>Price</Text>
                        <Text style={styles.viewValue}>₹{selectedProduct.price}</Text>
                      </View>
                      <View style={styles.viewCol}>
                        <Text style={styles.viewLabel}>Stock</Text>
                        <Text style={styles.viewValue}>{selectedProduct.stock} units</Text>
                      </View>
                    </View>

                    <Text style={styles.viewLabel}>Category</Text>
                    <Text style={styles.viewValue}>{selectedProduct.category}</Text>

                    <Text style={styles.viewLabel}>Status</Text>
                    <View style={[styles.statusBadge, { backgroundColor: selectedProduct.isActive ? Colors.successLight : Colors.errorLight }]}>
                      <Text style={[styles.statusText, { color: selectedProduct.isActive ? Colors.success : Colors.error }]}>
                        {selectedProduct.isActive ? 'Active' : 'Inactive'}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Image Editor Modal */}
      {editingImageIndex !== null && (
        <ImageEditor
          visible={imageEditorVisible}
          imageUri={selectedImages[editingImageIndex]?.uri || ''}
          onSave={handleSaveEditedImage}
          onCancel={() => {
            setImageEditorVisible(false);
            setEditingImageIndex(null);
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  animatedContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  statCard: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 70,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  statContent: {
    flex: 1,
    minWidth: 0,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  categoriesContainer: {
    marginBottom: 12,
    maxHeight: 50,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    paddingVertical: 4,
    gap: 8,
    alignItems: 'center',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 36,
    justifyContent: 'center',
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  categoryChipTextActive: {
    color: Colors.textWhite,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  productsContainer: {
    padding: 20,
    gap: 12,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  productImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  productImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: Colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inactiveBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.warning,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  inactiveText: {
    fontSize: 8,
    fontWeight: '700',
    color: Colors.textWhite,
  },
  outOfStockBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  outOfStockText: {
    fontSize: 8,
    fontWeight: '700',
    color: Colors.textWhite,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
    lineHeight: 20,
  },
  productCategory: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 2,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stockText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  productActions: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'flex-start',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 16,
    fontWeight: '500',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  // Image Upload Styles
  imageUploadSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  imagePreviewWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 10,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imageEditButton: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: Colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageRemoveButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.error,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.gray100,
  },
  addImageText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  // Form Styles
  formGroup: {
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  formRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.gray100,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: Colors.textWhite,
    fontSize: 16,
    fontWeight: '700',
  },
  // View Modal Styles
  viewImageContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  viewImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginRight: 12,
  },
  viewImagePlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: Colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewInfo: {
    padding: 20,
  },
  viewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 12,
    marginBottom: 4,
  },
  viewValue: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  viewRow: {
    flexDirection: 'row',
    gap: 16,
  },
  viewCol: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
