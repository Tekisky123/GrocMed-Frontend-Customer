import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  Dimensions,
  PanResponder,
  LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImageManipulator from 'expo-image-manipulator';
import { Colors } from '@/constants/colors';
import { Icon } from '@/components/ui/Icon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CROP_SIZE = Math.min(SCREEN_WIDTH - 80, 300);
const MIN_CROP_SIZE = 100;

interface ImageEditorProps {
  visible: boolean;
  imageUri: string;
  onSave: (editedImageUri: string) => void;
  onCancel: () => void;
}

export default function ImageEditor({ visible, imageUri, onSave, onCancel }: ImageEditorProps) {
  const [processing, setProcessing] = useState(false);
  const [currentImage, setCurrentImage] = useState(imageUri);
  const [imageLayout, setImageLayout] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const [cropRegion, setCropRegion] = useState({
    x: 0,
    y: 0,
    width: CROP_SIZE,
    height: CROP_SIZE,
  });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  // Get image dimensions
  useEffect(() => {
    if (currentImage) {
      Image.getSize(
        currentImage,
        (width, height) => {
          setImageSize({ width, height });
        },
        (error) => {
          console.error('Error getting image size:', error);
        }
      );
    }
  }, [currentImage]);

  // Pan responder for moving crop frame
  const movePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {},
      onPanResponderMove: (evt, gestureState) => {
        const { dx, dy } = gestureState;
        setCropRegion((prev) => {
          let newX = prev.x + dx;
          let newY = prev.y + dy;

          // Constrain to image bounds
          const maxX = imageLayout.width - prev.width;
          const maxY = imageLayout.height - prev.height;
          newX = Math.max(0, Math.min(newX, maxX));
          newY = Math.max(0, Math.min(newY, maxY));

          return { ...prev, x: newX, y: newY };
        });
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  // Pan responder for resizing crop frame (bottom-right corner)
  const resizePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {},
      onPanResponderMove: (evt, gestureState) => {
        const { dx, dy } = gestureState;
        setCropRegion((prev) => {
          const newWidth = Math.max(MIN_CROP_SIZE, Math.min(prev.width + dx, imageLayout.width - prev.x));
          const newHeight = Math.max(MIN_CROP_SIZE, Math.min(prev.height + dy, imageLayout.height - prev.y));

          return {
            ...prev,
            width: newWidth,
            height: newHeight,
          };
        });
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  useEffect(() => {
    if (visible && imageUri) {
      setCurrentImage(imageUri);
      // Reset crop region when modal opens
      setCropRegion({
        x: 0,
        y: 0,
        width: CROP_SIZE,
        height: CROP_SIZE,
      });
    }
  }, [visible, imageUri]);

  const handleResize = async (width: number) => {
    try {
      setProcessing(true);
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        currentImage,
        [{ resize: { width } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      setCurrentImage(manipulatedImage.uri);
      setProcessing(false);
    } catch (error) {
      setProcessing(false);
      Alert.alert('Error', 'Failed to resize image');
    }
  };

  const handleCrop = async () => {
    try {
      setProcessing(true);
      
      // Calculate crop region relative to actual image dimensions
      const scaleX = imageSize.width / imageLayout.width;
      const scaleY = imageSize.height / imageLayout.height;
      
      const cropData = {
        originX: Math.round(cropRegion.x * scaleX),
        originY: Math.round(cropRegion.y * scaleY),
        width: Math.round(cropRegion.width * scaleX),
        height: Math.round(cropRegion.height * scaleY),
      };

      const croppedImage = await ImageManipulator.manipulateAsync(
        currentImage,
        [{ crop: cropData }],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
      );
      
      setCurrentImage(croppedImage.uri);
      // Reset crop region after crop
      setCropRegion({
        x: 0,
        y: 0,
        width: Math.min(croppedImage.width, CROP_SIZE),
        height: Math.min(croppedImage.height, CROP_SIZE),
      });
      setProcessing(false);
      Alert.alert('Success', 'Image cropped successfully');
    } catch (error) {
      setProcessing(false);
      Alert.alert('Error', 'Failed to crop image');
    }
  };

  const handleSave = async () => {
    try {
      setProcessing(true);
      const optimizedImage = await ImageManipulator.manipulateAsync(
        currentImage,
        [],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
      );
      setProcessing(false);
      onSave(optimizedImage.uri);
    } catch (error) {
      setProcessing(false);
      Alert.alert('Error', 'Failed to save image');
    }
  };

  const handleImageLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setImageLayout({ width, height, x: 0, y: 0 });
    
    // Adjust crop region to fit within image bounds
    setCropRegion((prev) => ({
      x: Math.min(prev.x, width - prev.width),
      y: Math.min(prev.y, height - prev.height),
      width: Math.min(prev.width, width),
      height: Math.min(prev.height, height),
    }));
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
            <Icon name="close" size={24} color={Colors.textPrimary} library="material" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Image</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton} disabled={processing}>
            {processing ? (
              <ActivityIndicator size="small" color={Colors.textWhite} />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.imageContainer}>
          <View style={styles.imageWrapper} onLayout={handleImageLayout}>
            <Image source={{ uri: currentImage }} style={styles.image} resizeMode="contain" />
            
            {/* Dark overlay mask */}
            <View style={styles.overlayMask}>
              {/* Top overlay */}
              <View style={[styles.overlaySection, { height: cropRegion.y }]} />
              
              {/* Middle row */}
              <View style={styles.overlayRow}>
                {/* Left overlay */}
                <View style={[styles.overlaySection, { width: cropRegion.x }]} />
                
                {/* Crop window (transparent) */}
                <View
                  style={[
                    styles.cropWindow,
                    {
                      width: cropRegion.width,
                      height: cropRegion.height,
                    },
                  ]}
                  {...movePanResponder.panHandlers}
                >
                  {/* Corner handles */}
                  <View style={[styles.cornerHandle, styles.topLeftHandle]} />
                  <View style={[styles.cornerHandle, styles.topRightHandle]} />
                  <View style={[styles.cornerHandle, styles.bottomLeftHandle]} />
                  <View
                    style={[styles.cornerHandle, styles.bottomRightHandle]}
                    {...resizePanResponder.panHandlers}
                  />
                </View>
                
                {/* Right overlay */}
                <View
                  style={[
                    styles.overlaySection,
                    {
                      width: Math.max(0, imageLayout.width - cropRegion.x - cropRegion.width),
                    },
                  ]}
                />
              </View>
              
              {/* Bottom overlay */}
              <View
                style={[
                  styles.overlaySection,
                  {
                    height: Math.max(0, imageLayout.height - cropRegion.y - cropRegion.height),
                  },
                ]}
              />
            </View>
          </View>
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[styles.cropButton, processing && styles.buttonDisabled]}
            onPress={handleCrop}
            disabled={processing}
          >
            <Icon name="crop" size={20} color={Colors.textWhite} library="material" />
            <Text style={styles.cropButtonText}>Apply Crop</Text>
          </TouchableOpacity>

          <Text style={styles.controlsTitle}>Resize Options</Text>
          <View style={styles.resizeButtons}>
            <TouchableOpacity
              style={[styles.resizeButton, processing && styles.buttonDisabled]}
              onPress={() => handleResize(400)}
              disabled={processing}
            >
              <Text style={styles.resizeButtonText}>Small (400px)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.resizeButton, processing && styles.buttonDisabled]}
              onPress={() => handleResize(800)}
              disabled={processing}
            >
              <Text style={styles.resizeButtonText}>Medium (800px)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.resizeButton, processing && styles.buttonDisabled]}
              onPress={() => handleResize(1200)}
              disabled={processing}
            >
              <Text style={styles.resizeButtonText}>Large (1200px)</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.instructionText}>
            Drag the frame to move, drag bottom-right corner to resize
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  cancelButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  saveButtonText: {
    color: Colors.textWhite,
    fontSize: 15,
    fontWeight: '600',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlayMask: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlaySection: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  overlayRow: {
    flexDirection: 'row',
  },
  cropWindow: {
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  cornerHandle: {
    position: 'absolute',
    width: 24,
    height: 24,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.textWhite,
    borderRadius: 12,
  },
  topLeftHandle: {
    top: -12,
    left: -12,
  },
  topRightHandle: {
    top: -12,
    right: -12,
  },
  bottomLeftHandle: {
    bottom: -12,
    left: -12,
  },
  bottomRightHandle: {
    bottom: -12,
    right: -12,
  },
  controlsContainer: {
    padding: 20,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cropButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  cropButtonText: {
    color: Colors.textWhite,
    fontSize: 15,
    fontWeight: '600',
  },
  controlsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  resizeButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  resizeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.gray100,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resizeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  instructionText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
