<script setup lang="ts">
import { ref } from 'vue';
import {
  generateTextIcons,
  resizeImage,
  downloadBlob,
  downloadAllImages,
  downloadAllImagesAsZip,
  createResizedFilename,
  getBaseFilename
} from './icon-generator-service';
import CCard from '@/ui/c-card/c-card.vue';

import CInputText from '@/ui/c-input-text/c-input-text.vue'; // Import the service function

const selectedFile = ref<File | null>(null); // Reference for selected file
const resizedImages = ref<Blob[]>([]); // Reference for resized images
const sizes = [16, 24, 32, 48, 256]; // Sizes to which we want to resize

async function handleFile(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files) {
    selectedFile.value = input.files[0];
    resizedImages.value = await resizeImage(selectedFile.value, sizes);
  }
}
function createObjectURL(blob: Blob | null) {
  if (blob) {
    return URL.createObjectURL(blob);
  }
  return '';
}

const textInput = ref('L'); // Reference for text input
const textFont = ref('128px Arial Black'); // Reference for font
const textIcons = ref<Blob[]>([]); // Reference for text icons

async function generateIcons() {
  textIcons.value = await generateTextIcons(textInput.value, textFont.value, sizes);
}

function downloadSingleImage(blob: Blob, size: number, isFromFile: boolean = true) {
  const baseFilename = isFromFile && selectedFile.value
    ? getBaseFilename(selectedFile.value)
    : 'text-icon';
  const filename = createResizedFilename(baseFilename, size);
  downloadBlob(blob, filename);
}

async function downloadAllResizedImages() {
  if (selectedFile.value && resizedImages.value.length > 0) {
    const baseFilename = getBaseFilename(selectedFile.value);
    await downloadAllImages(resizedImages.value, sizes, baseFilename);
  }
}

async function downloadAllResizedImagesAsZip() {
  if (selectedFile.value && resizedImages.value.length > 0) {
    const baseFilename = getBaseFilename(selectedFile.value);
    await downloadAllImagesAsZip(resizedImages.value, sizes, baseFilename);
  }
}

async function downloadAllTextIcons() {
  if (textIcons.value.length > 0) {
    await downloadAllImages(textIcons.value, sizes, 'text-icon');
  }
}

async function downloadAllTextIconsAsZip() {
  if (textIcons.value.length > 0) {
    await downloadAllImagesAsZip(textIcons.value, sizes, 'text-icon');
  }
}

// Variable to keep track of the active tab
const activeTab = ref('imageResize'); // Default to Image Resizer tab
</script>

<template>
  <CCard>
    <!-- Tab Buttons -->
    <div>
      <button :class="{ active: activeTab === 'imageResize' }" @click="activeTab = 'imageResize'">
        Image Resizer
      </button>
      <button :class="{ active: activeTab === 'textGenerator' }" @click="activeTab = 'textGenerator'">
        Text Generator
      </button>
    </div>

    <!-- Tab Descriptions -->
    <div v-if="activeTab === 'imageResize'">
      <p>This tab allows you to upload an image and resize it to various dimensions.</p>
    </div>
    <div v-else-if="activeTab === 'textGenerator'">
      <p>This tab allows you to input text and generate icons with varying sizes.</p>
    </div>

    <!-- Image Resizer Tab -->
    <div v-if="activeTab === 'imageResize'">
      <!-- Input area for file -->
      <input type="file" accept="image/jpeg, image/png" @change="handleFile" >

      <!-- Display area for resized images -->
      <div v-for="(image, index) in resizedImages" :key="index" class="image-container">
        <div class="image-row">
          <img v-if="image" :src="createObjectURL(image)" :alt="`Resized to ${sizes[index]}px`" class="preview-image">
          <div>
            <p><strong>Size:</strong> {{ sizes[index] }}x{{ sizes[index] }}px</p>
            <button
              @click="downloadSingleImage(image, sizes[index], true)"
              class="download-btn"
            >
              Download {{ sizes[index] }}x{{ sizes[index] }}
            </button>
          </div>
        </div>
      </div>

      <!-- Download All Buttons -->
      <div v-if="resizedImages.length > 0" class="download-all-container">
        <button
          @click="downloadAllResizedImages"
          class="download-all-btn"
          style="margin-right: 10px;"
        >
          Download All (Individual Files)
        </button>
        <button
          @click="downloadAllResizedImagesAsZip"
          class="download-zip-btn"
        >
          Download All as ZIP
        </button>
      </div>
    </div>

    <!-- Text Generator Tab -->
    <div v-else-if="activeTab === 'textGenerator'">
      <!-- Input area for text -->
      <CInputText v-model:value="textInput" placeholder="Enter your text here..." />

      <!-- Input area for font -->
      <CInputText v-model:value="textFont" placeholder="Enter your font here..." />

      <!-- Generate button -->
      <button @click="generateIcons" class="generate-btn">
        Generate
      </button>

      <!-- Display area for text icons -->
      <div v-for="(image, index) in textIcons" :key="`text-${index}`" class="image-container">
        <div class="image-row">
          <img v-if="image" :src="createObjectURL(image)" :alt="`Text icon resized to ${sizes[index]}px`" class="preview-image">
          <div>
            <p><strong>Size:</strong> {{ sizes[index] }}x{{ sizes[index] }}px</p>
            <button
              @click="downloadSingleImage(image, sizes[index], false)"
              class="download-btn"
            >
              Download {{ sizes[index] }}x{{ sizes[index] }}
            </button>
          </div>
        </div>
      </div>

      <!-- Download All Buttons -->
      <div v-if="textIcons.length > 0" class="download-all-container">
        <button
          @click="downloadAllTextIcons"
          class="download-all-btn"
          style="margin-right: 10px;"
        >
          Download All (Individual Files)
        </button>
        <button
          @click="downloadAllTextIconsAsZip"
          class="download-zip-btn"
        >
          Download All as ZIP
        </button>
      </div>
    </div>
  </CCard>
</template>

<style scoped>
.active {
  background-color: #007bff;
  color: white;
}

.image-container {
  margin-bottom: 20px;
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.image-row {
  display: flex;
  align-items: center;
  gap: 15px;
}

.preview-image {
  max-width: 100px;
  max-height: 100px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.download-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.download-btn:hover {
  background-color: #0056b3;
}

.download-all-btn {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
}

.download-all-btn:hover {
  background-color: #1e7e34;
}

.generate-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin: 10px 0;
  transition: background-color 0.2s;
}

.generate-btn:hover {
  background-color: #0056b3;
}

.download-all-container {
  margin-top: 20px;
  text-align: center;
}

.download-zip-btn {
  background-color: #17a2b8;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
  margin-left: 10px;
}

.download-zip-btn:hover {
  background-color: #138496;
}
</style>
